<script>
import {
  getChartwork,
  getequipment,
  getGroupByUser,
} from '@/http/xingfaBi/xingfa.js'
import CardItem from './CardItem.vue'

export default {
  name: 'BiRight',
  components: {
    CardItem,
  },
  data() {
    return {
      allCharts: {
        chart_work: null, // 特殊作业
      },
      // 人员统计数据
      userList: [
        {
          name: 'leader',
          count: 0,
          icon: require('@/assets/xingfa/ringx.png'),
          des: '管理干部',
        },
        {
          name: 'company',
          count: 0,
          icon: require('@/assets/xingfa/ringy.png'),
          des: '企业员工',
        },
        {
          name: 'contractor',
          count: 0,
          icon: require('@/assets/xingfa/ringz.png'),
          des: '承包商',
        },
      ],
      // 设备统计
      equipmentTotalt: [
        {
          name: '电气设备',
          sum: 100,
          run: 93,
          breakdown: 2,
          other: 5,
        },
        {
          name: '动设备',
          sum: 200,
          run: 93,
          breakdown: 2,
          other: 5,
        },
        {
          name: '特种设备',
          sum: 92,
          run: 93,
          breakdown: 2,
          other: 5,
        },
        {
          name: '管道管线',
          sum: 107,
          run: 93,
          breakdown: 2,
          other: 5,
        },
        {
          name: '静设备',
          sum: 44,
          run: 93,
          breakdown: 2,
          other: 5,
        },
        {
          name: '其它设备',
          sum: 0,
          run: 0,
          breakdown: 0,
          other: 0,
        },
      ],
    }
  },
  created() {
    this.getParams()
  },
  mounted() {
    this.initAll() // 初始化所有图表
    window.addEventListener('resize', this.resizeCharts) // 图表自适应大小
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
  },
  methods: {
    // 初始化图表
    initAll() {
      this.initChart('chart_work', {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        color: [
          '#2FFFE4',
          '#EC6941',
          '#FFFF00',
          '#12BFF3',
          '#A84200',
          '#AC6A00',
          '#26DF7B',
          '#AA89BD',
        ],
        legend: {
          orient: 'horizontal',
          x: 'right',
          top: '0%',
          width: '80%',
          height: '20%',
          itemHeight: 10,
          itemWidth: 20,
          data: ['动火', '受限空间', '高处', '临时用电', '断路', '动土', '吊装', '盲板抽堵'],
          formatter: '{a|{name}}',
          textStyle: {
            color: '#fff',
            fontSize: '12px',
            align: 'left',
            rich: {
              a: {
                width: 50,
              },
            },
          },
        },
        grid: {
          left: '1%',
          right: '1%',
          bottom: '0%',
          top: '25%',
          height: '75%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
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
        yAxis: {
          type: 'value',
          max: 100,
          min: 0,
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
        series: [
          {
            name: '动火',
            type: 'bar',
            stack: 'total',
            barWidth: '50%', // 柱图宽度
            data: [32, 30, 30, 33, 39, 33, 32, 30, 31, 33, 39, 40],
          },
          {
            name: '受限空间',
            type: 'bar',
            stack: 'total',
            data: [12, 13, 10, 13, 9, 23, 10, 13, 11, 14, 90, 20],
          },
          {
            name: '高处',
            type: 'bar',
            stack: 'total',
            data: [32, 30, 30, 33, 39, 33, 32, 30, 31, 33, 39, 40],
          },
          {
            name: '临时用电',
            type: 'bar',
            stack: 'total',
            data: [32, 30, 30, 33, 39, 33, 32, 30, 31, 33, 39, 40],
          },
          {
            name: '断路',
            type: 'bar',
            stack: 'total',
            data: [32, 30, 30, 33, 39, 33, 32, 30, 31, 33, 39, 40],
          },
          {
            name: '动土',
            type: 'bar',
            stack: 'total',
            data: [32, 30, 30, 33, 39, 33, 32, 30, 31, 33, 39, 40],
          },
          {
            name: '吊装',
            type: 'bar',
            stack: 'total',
            data: [32, 30, 30, 33, 39, 33, 32, 30, 31, 33, 39, 40],
          },
          {
            name: '盲板抽堵',
            type: 'bar',
            stack: 'total',
            data: [32, 30, 30, 33, 39, 33, 32, 30, 31, 33, 39, 40],
          },
        ],
      })
    },
    initChart(name, options) {
      this.allCharts[name] = this.$echarts.init(document.getElementById(name))
      this.allCharts[name].setOption(options)
    },
    // 重新渲染图表
    changeChart(name, resOption) {
      const options = this.allCharts[name].getOption()
      options.series = resOption
      this.allCharts[name].setOption(options)
    },
    /* 请求参数 */
    async getParams() {
      // 人员统计数据
      try {
        const userRes = await getGroupByUser()
        for (const item of userRes.data.result) {
          for (const user of this.userList) {
            if (item.userType == user.name) {
              user.count = item.count
            }
          }
        }
        // 特殊作业数据
        const specialRes = await getChartwork()
        console.log(specialRes, 99)
        const specialData = specialRes.data.result.map((item) => {
          let name = ''
          item.barWidth = '50%'
          switch (Number.parseInt(item.code)) {
            case 1001:
              name = '动火'
              break
            case 1002:
              name = '受限空间'
              break
            case 1003:
              name = '高处'
              break
            case 1004:
              name = '临时用电'
              break
            case 1005:
              name = '断路'
              break
            case 1006:
              name = '动土'
              break
            case 1007:
              name = '吊装'
              break
            case 1008:
              name = '盲板抽堵'
              break
            default:
          }
          return { name, type: 'bar', stack: 'total', data: item.data }
        })

        console.log(specialData)
        this.changeChart('chart_work', specialData)
        // 设备统计
        const equipRes = await getequipment()
        equipRes.data.result.forEach((item, i) => {
          if (i < 5) {
            this.equipmentTotalt[i].name = item.typeName
            this.equipmentTotalt[i].sum = item.typeCount
            this.equipmentTotalt[i].run = item.stateCountList[0].count
            this.equipmentTotalt[i].breakdown = item.stateCountList[1].count
            this.equipmentTotalt[i].other = item.stateCountList[2].count
          }
          else {
            this.equipmentTotalt[5].name = '其他设备'
            this.equipmentTotalt[5].sum += item.typeCount
            this.equipmentTotalt[5].run += item.stateCountList[0].count
            this.equipmentTotalt[5].breakdown += item.stateCountList[1].count
            this.equipmentTotalt[5].other += item.stateCountList[2].count
          }
        })
        this.isLoading = false
      }
      catch (e) {}
    },
    /* 重置图表大小 */
    resizeCharts() {
      for (const key in this.allCharts) {
        if (this.allCharts[key]) {
          this.allCharts[key].resize()
        }
      }
    },
  },
}
</script>

<template>
  <div class="bi-right">
    <!-- 人员统计 -->
    <CardItem
      height="25%"
      title="人员统计"
    >
      <div class="connent">
        <div
          v-for="(item, index) in userList"
          :key="index"
          class="connent-sorts"
        >
          <div
            class="sort-img"
            :style="`background-image:url(${item.icon});`"
          >
            <div class="sort-middle-text">
              {{ item.count }}
            </div>
          </div>
          <div class="sort-text">
            {{ item.des }}
          </div>
        </div>
      </div>
    </CardItem>
    <!-- 特殊作业 -->
    <CardItem
      height="40%"
      title="特殊作业"
      style="margin: 25px 0"
    >
      <div
        id="chart_work"
        class="connent"
        style="height: 90%"
      />
    </CardItem>
    <!-- 设备统计 -->
    <CardItem
      height="33%"
      title="设备统计"
    >
      <div class="connent">
        <div
          v-for="item in equipmentTotalt"
          :key="item.value"
          class="connent-item"
          :style="`background-image:url(${require('@/assets/xingfa/rightbg.png').default});`"
        >
          <div class="connent-left-text">
            {{ item.name }}
          </div>
          <div class="connent-left-sum">
            {{ item.sum }}
          </div>
          <div class="connent-right-item">
            <div class="text-item-des">
              运行
            </div>
            <div style="color: #2fffb3">
              {{ item.run }}
            </div>
          </div>
          <div class="connent-right-item">
            <div class="text-item-des">
              异常
            </div>
            <div style="color: #f54c60">
              {{ item.breakdown }}
            </div>
          </div>
          <div class="connent-right-item">
            <div class="text-item-des">
              其他
            </div>
            <div style="color: #4dd6ff">
              {{ item.other }}
            </div>
          </div>
        </div>
      </div>
    </CardItem>
  </div>
</template>

<style lang="scss" scoped>
.bi-right {
  width: 100%;
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  padding: 2vw 0.3333vw 7.3684vw 0;
  .bi-right-middle {
    width: 24.8421vw;
    height: 40%;
    margin: 1.25vw 0;
  }
  .bi-right-footer {
    width: 24.8421vw;
    height: 33%;
  }
}

.connent {
  width: 100%;
  height: 80%;
  display: flex;
  flex-wrap: wrap;
  .connent-sorts {
    width: 6.25vw;
    height: 100%;
    margin-right: 1.53vw;
    .sort-img {
      background-repeat: no-repeat;
      background-size: 100% 100%;
      height: 75%;
      display: flex;
    }
    .sort-middle-text {
      margin: auto;
      font-size: 1.5vw;
      font-family: Microsoft YaHei;
    }
    .sort-text {
      margin-top: 1vh;
      font-size: 1vw;
      font-family: Microsoft YaHei;
      text-align: center;
    }
  }
  .connent-item {
    background-repeat: no-repeat;
    background-size: 100% 100%;
    width: 31%;
    height: 47%;
    margin: 0.75%;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    .connent-left-text {
      width: 60%;
      height: 50%;
      font-size: 0.8vw;
      font-family: MF JianHei;
      font-weight: 400;
      text-align: center;
      line-height: 4vh;
    }
    .connent-left-sum {
      width: 60%;
      height: 50%;
      text-align: center;
      line-height: 1.5vh;
      font-family: MF JianHei;
      color: #00e7ff;
      font-size: 1.26vw;
    }
    .connent-right-item {
      height: 32%;
      border-radius: 5%;
      border: 1px solid #00a0e9;
      border-top-style: none;
      border-right-style: none;
      font-size: 1px;
      display: flex;
      line-height: 4vh;
      .connent-right-text {
        margin-right: 3px;
      }
      .text-item-des {
        margin: 0 3px;
        font-size: 0.5vw;
      }
    }
  }
}
</style>
