<script>
import moment from 'moment'
import { getMyTenantInfo } from '@/http/manage-api.js'
import { getChartProblemTotle, getrisk } from '@/http/xingfaBi/xingfa.js'
import calendarFormatter from '../dateChange.js'
import CardItem from './CardItem.vue'

export default {
  name: 'BiLeft',
  components: {
    CardItem,
  },
  data() {
    return {
      timer: null, // 计时器
      timeDes: '', // 时间
      dateDes: '', // 日期
      isLoading: false, // loading
      safetyDays: 190, // 安全生产天数
      allCharts: {
        chart_risk: null, // 风险单位
        chart_problem: null, // 隐患统计
      },
    }
  },
  computed: {
    setTimeDes() {
      return moment(this.timeDes).format('HH:mm:ss')
    },
  },
  created() {
    this.getDateDes()
    this.getParams()
  },
  mounted() {
    this.initAll() // 初始化所有图表
    window.addEventListener('resize', this.resizeCharts) // 图表自适应大小
  },
  beforeDestroy() {
    clearInterval(this.timer)
    this.timer = null
    window.removeEventListener('resize', this.resizeCharts)
  },
  methods: {
    /* 处理时间和计时器 */
    getDateDes() {
      const nowDate = new Date().getTime()
      // 计时器初始时间
      this.timeDes = nowDate
      this.timer = setInterval(() => {
        this.timeDes += 1000
      }, 1000)
      // 年月日
      const dateContent = moment(nowDate).format('YYYY年M月D日')
      // 星期
      const weekList = ['周天', '周一', '周二', '周三', '周四', '周五', '周六']
      const week = weekList[moment(nowDate).day()]
      // 农历
      const y = moment(nowDate).format('YYYY')
      const m = moment(nowDate).format('M')
      const d = moment(nowDate).format('D')
      const timeDay = calendarFormatter.solar2lunar(y, m, d)
      const otherDay = timeDay.IMonthCn + timeDay.IDayCn
      // 展示的数据
      this.dateDes = `${dateContent} ${week} 农历${otherDay}`
    },
    // 重新渲染图表
    changeChart(name, resOption, type) {
      const options = this.allCharts[name].getOption()
      if (type == '已验收') {
        options.series[0].data = resOption
      }
      else if (type == '待调整') {
        options.series[1].data = resOption
      }
      else {
        const dataName = [
          { name: `重大风险`, color: '#F13C3C' },
          { name: '较大风险', color: '#F48838' },
          { name: '一般风险', color: '#F4CA38' },
          { name: '低风险', color: '#00A1FD' },
        ]
        const data = []
        const color = []
        for (let i = 0; i < 4; i++) {
          resOption.forEach((item) => {
            if (item.name == dataName[i].name) {
              data.push(item)
              color.push(dataName[i].color)
            }
          })
        }
        options.color = color
        options.series[0].data = data
      }
      this.allCharts[name].setOption(options)
    },
    /* 请求数据 */
    async getParams() {
      this.isLoading = true
      // 生产天数
      const dayRes = await getMyTenantInfo()
      // this.safetyDays = dayRes.data.result.safeProductionDays
      // 风险数据
      const riskRes = await getrisk()
      const riskChart = riskRes.data.result?.map((item) => {
        return { name: item.groupBy, value: item.amount }
      })
      this.changeChart('chart_risk', riskChart)
      // 隐患统计
      const troubleRes = await getChartProblemTotle()
      // 已验收
      const acceptedData = []
      troubleRes.data.result?.accepted?.forEach((item) => {
        acceptedData.push(item.amount)
      })
      this.changeChart('chart_problem', acceptedData, '已验收')
      // 待调整
      const rectificationData = []
      troubleRes.data.result?.rectification?.forEach((item) => {
        rectificationData.push(item.amount)
      })
      this.changeChart('chart_problem', rectificationData, '待调整')
      this.isLoading = false
    },
    /* 重置图表大小 */
    resizeCharts() {
      for (const key in this.allCharts) {
        if (this.allCharts[key]) {
          this.allCharts[key].resize()
        }
      }
    },
    initChart(name, options) {
      this.allCharts[name] = this.$echarts.init(document.getElementById(name))
      this.allCharts[name].setOption(options)
    },
    // 初始化图表
    initAll() {
      this.initChart('chart_risk', {
        color: ['#F13C3C', '#F48838', '#F4CA38', '#00A1FD'],
        legend: {
          left: 'auto',
          orient: 'horizontal',
          itemHeight: 10,
          itemWidth: 20,
          itemGap: 15,
          icon: 'roundRect',
          textAlign: 'center',
          textStyle: {
            color: '#fff',
            fontSize: '0.5vw',
          },
        },
        title: {
          top: '51%',
          right: '46%',
          text: `风险单元`,
          textAlign: 'center',
          textStyle: {
            color: '#FFF',
            fontSize: '1.2vw',
          },
        },
        series: [
          {
            type: 'pie',
            radius: ['60%', '40%'],
            right: '10%',
            top: '10%',
            width: 'auto',
            label: {
              fontSize: '1vw',
              formatter: '{per|{b}:}{b|{c}}',
              borderWidth: 20,
              borderRadius: 4,
              lineHeight: 25,
              padding: [-20, -80, 0], // 文字位置
              rich: {
                b: {
                  color: '#fff',
                  lineHeight: 33,
                },
                per: {
                  fontSize: 12,
                  padding: [2, 4],
                  borderRadius: 2,
                },
              },
            },
            labelLine: {
              length: 40,
              length2: 70,
              color: '#fff',
              // maxSurfaceAngle: 80
            },
            data: [
              { name: `重大风险`, value: 24 },
              { name: '较大风险', value: 18 },
              { name: '一般风险', value: 20 },
              { name: '低风险', value: 22 },
            ],
          },
        ],
      })
      this.initChart('chart_problem', {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        color: ['#00A1FD', '#F13C3C'],
        grid: {
          left: '1%',
          right: '1%',
          bottom: '1%',
          top: '10%',
          width: '100%',
          containLabel: true,
        },
        legend: {
          data: ['已验收', '待整改'],
          width: '90%',
          right: '5%',
          orient: 'horizontal',
          textStyle: {
            color: '#fff',
            fontSize: '3px',
          },
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: [
              '1月',
              '2月',
              '3月',
              '4月',
              '5月',
              '6月',
              '7月',
              '8月',
              '9月',
              '10月',
              '11月',
              '12月',
            ],
            axisLabel: {
              show: true,
              // showMaxLabel:false,    //留白策略
              color: '#FEFFFF',
              interval: 0,
              rotate: 40,
              fontSize: 10,
            },
            axisTick: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: '#FEFFFF',
              },
            },
          },
        ],
        yAxis: [
          {
            type: 'value',
            splitNumber: 5,
            splitLine: {
              show: false,
            },
            axisLabel: {
              color: '#FEFFFF',
            },
            axisTick: {
              show: false,
            },
            axisLine: {
              lineStyle: {
                color: '#FEFFFF',
              },
            },
          },
        ],
        series: [
          {
            name: '已验收',
            type: 'line',
            areaStyle: {
              color: {
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(73, 164, 255, 1)', // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: 'rgba(73, 164, 255, 0)', // 100% 处的颜色
                  },
                ],
                global: false, // 缺省为 false
              },
            },
            data: [0, 0, 0, 500, 900, 500, 400, 300, 0, 0, 0, 0],
          },
          {
            name: '待整改',
            type: 'line',
            label: {
              position: 'top',
            },
            areaStyle: {
              color: {
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: 'rgba(239, 98, 98, 1)', // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: 'rgba(239, 98, 98, 0)', // 100% 处的颜色
                  },
                ],
                global: false, // 缺省为 false
              },
            },
            data: [0, 0, 0, 500, 400, 300, 350, 250, 0, 0, 0, 0],
          },
        ],
      })
    },
  },
}
</script>

<template>
  <div class="bi-left">
    <!-- 顶部时间、安全生产 -->
    <div class="bi-left-top">
      <div class="bi-day">
        {{ dateDes }}
      </div>
      <div class="bi-time">
        {{ setTimeDes }}
      </div>
      <div style="height: 70%; width: 100%">
        <div class="left-days">
          <div class="left-days-text">
            连续安全生产
          </div>
          <div class="left-days-sum">
            {{ safetyDays }} <span class="left-days-text">天</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 风险单元 -->
    <CardItem title="风险单元" style="margin: 20px 0">
      <div id="chart_risk" class="connent" />
    </CardItem>
    <!-- 隐患统计 -->
    <CardItem title="隐患统计">
      <div id="chart_problem" class="connent" />
    </CardItem>
  </div>
</template>

<style lang="scss" scoped>
.bi-left {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  padding: 2vw 0vw 7.3684vw 0.3333vw;
  .bi-left-top {
    width: 24.8421vw;
    height: 19.6vh;
    .bi-day {
      width: 100%;
      font-size: 0.7291vw;
      margin-left: 2vw;
    }
    .bi-time {
      width: 100%;
      font-size: 1vw;
      margin: 0.677vw 0vw 0.607vw 2vw;
    }
    .left-days {
      background-image: url("~@/assets/xingfa/daysbg.png");
      background-repeat: no-repeat;
      background-size: 100% 100%;
      width: 100%;
      height: 100%;
      float: left;
      position: relative;
      .left-days-text {
        width: 100%;
        height: 50%;
        padding-top: 3vh;
        text-align: center;
        line-height: 3.5555vh;
        font-size: 3.5555vh;
        font-family: FZDaHei-B02;
        font-weight: 400;
        color: #ffffff;
      }
      .left-days-sum {
        width: 100%;
        height: 50%;
        text-align: center;
        line-height: 4vh;
        font-size: 4vh;
        font-family: FZDaHei-B02;
        font-weight: 400;
        color: #12bff3;
      }
    }
  }
}
.connent {
  width: 100%;
  height: 85%;
  color: #feffff;
}
</style>
