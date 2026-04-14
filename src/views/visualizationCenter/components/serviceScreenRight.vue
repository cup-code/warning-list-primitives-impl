<script>
import CardItem from './cardItem'
import EList from './EList'

export default {
  name: 'anqiBiLeft',
  components: {
    CardItem,
    EList,
  },
  data() {
    return {
      labelTxt: true,
      tableData: {
        head: ['', '设备名称', '出厂时间', '当前位置'],
        list: [
          { name: 'BM23-G102-2-012', time: '2024-08-01', local: '天津市' },
          { name: 'BM23-G102-2-012', time: '2024-07-25', local: '内蒙古' },
          { name: 'BM23-G102-2-012', time: '2024-07-18', local: '河北省' },
          { name: 'BM23-G102-2-012', time: '2024-07-15', local: '天津市' },
          { name: 'BM23-G102-2-012', time: '2024-07-13', local: '天津市' },
          { name: 'BM23-G102-2-012', time: '2024-07-12', local: '天津市' },
          { name: 'BM23-G102-2-012', time: '2024-07-11', local: '天津市' },
          { name: 'BM23-G102-2-012', time: '2024-07-10', local: '天津市' },
        ],
      },
      weeklyCheck: [
        { name: '按周', icon: require('@/assets/anqiBi/titleTiemBg1.png') },
        { name: '按月', icon: require('@/assets/anqiBi/titleTiemBg2.png') },
        { name: '按年', icon: require('@/assets/anqiBi/titleTiemBg2.png') },
      ],
      weeklyMeeting: [
        { name: '按周', icon: require('@/assets/anqiBi/titleTiemBg1.png') },
        { name: '按月', icon: require('@/assets/anqiBi/titleTiemBg2.png') },
        { name: '按年', icon: require('@/assets/anqiBi/titleTiemBg2.png') },
      ],
      emergencyList: {
        totalName: '演练次数',
        totalCount: 0, // 20215
        category: [
          { name: '综合实战演练', count: 550, peoples: 150 },
          { name: '综合桌面演练', count: 650, peoples: 150 },
          { name: '单次实战演练', count: 615, peoples: 150 },
          { name: '示范演练', count: 450, peoples: 150 },
        ],
      },
      reviewData: [
        { attribute: '新材料', review: '85%', use: '95%', yanShou: '5%' },
        { attribute: '新设备', review: '99%', use: '100%', yanShou: '1%' },
        { attribute: '新工艺', review: '100%', use: '100%', yanShou: '0%' },
        { attribute: '新技术', review: '100%', use: '100%', yanShou: '0%' },
      ],
      allCharts: {
        chart_weeklyCheck: null,
        chart_weeklyMeeting: null,
      },
    }
  },
  mounted() {
    this.exerciseTotal()
    this.initAll() // 初始化所有图表
    window.addEventListener('resize', this.resizeCharts) // 图表自适应大小
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
  },
  methods: {
    // 演练次数累加
    exerciseTotal() {
      this.emergencyList.category.forEach((item) => {
        this.emergencyList.totalCount += item.count
      })
    },
    selectData(item, type) {
      if (type == 'weeklyCheck') {
        this.weeklyCheck.forEach((data) => {
          if (data.name == item.name) {
            data.icon = require('@/assets/anqiBi/titleTiemBg1.png')
          }
          else {
            data.icon = require('@/assets/anqiBi/titleTiemBg2.png')
          }
        })
      }
      else if (type == 'weeklyMeeting') {
        this.weeklyMeeting.forEach((data) => {
          if (data.name == item.name) {
            data.icon = require('@/assets/anqiBi/titleTiemBg1.png')
          }
          else {
            data.icon = require('@/assets/anqiBi/titleTiemBg2.png')
          }
        })
      }
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
    // 初始化图表  周检
    initAll() {
      this.initChart('chart_statics', {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} :{d}%',
        },
        color: ['#3dbadf', '#b3a3da', '#a5c970', '#54afd4', '#376e95'],
        legend: {
          orient: 'horizontal',
          x: 'center',
          y: 'top',
          itemGap: 10,
          itemWidth: 12,
          itemHeight: 10,
          textStyle: { color: '#fff', fontSize: '3px' },
          data: ['已完成', '待执行', '待接单', '待评价', '待验收'],
        },
        calculable: true,
        series: [
          {
            name: '面积模式',
            type: 'pie',
            radius: ['40%', '60%'],
            center: ['-10%', '58%'],
            roseType: 'radius',
            x: '50%', // for funnel
            max: 90, // for funnel
            sort: 'ascending', // for funnel
            label: {
              fontSize: '1px',
              formatter: '{per|{b}}',
              borderWidth: 20,
              borderRadius: 4,
              lineHeight: 25,
              padding: [-16, -20, 0], // 文字位置
              rich: {
                b: {
                  color: '#fff',
                  lineHeight: 33,
                },
                per: {
                  fontSize: 10,
                  padding: [2, 4],
                  borderRadius: 2,
                },
              },
            },
            data: [
              { value: 40.28, name: '已完成' },
              { value: 17.04, name: '待执行' },
              { value: 10.41, name: '待接单' },
              { value: 7.04, name: '待评价' },
              { value: 24.23, name: '待验收' },
            ],
          },
        ],
      })

      const censusSeries = [
        {
          name: '一般故障',
          data: [23, 12, 8, 6, 5],
        },
        {
          name: '电气故障',
          data: [2, 15, 1, 5, 4],
        },
        {
          name: '机械故障',
          data: [2, 6, 9, 2, 9],
        },
        {
          name: '其他故障',
          data: [8, 4, 6, 1, 17],
        },
      ]
      censusSeries.forEach((item) => {
        item.barWidth = 8
        item.type = 'bar'
        item.itemStyle = {
          shadowBlur: 5.5,
          shadowColor: 'rgba(83, 101, 166, 1)',
          shadowOffsetY: 1,
          shadowOffsetX: 1,
        }
      })
      this.initChart('chart_failureType', {
        color: ['#2c8eef', '#05c5be', '#ef9364', '#d566a0'],
        grid: {
          left: '5%',
          right: '1%',
          bottom: '0%',
          top: '15%',
          width: '90%',
          containLabel: true,
        },
        legend: {
          width: '90%',
          right: '5%',
          orient: 'horizontal',
          padding: 10,
          itemWidth: 8,
          itemHeight: 8,
          textStyle: {
            color: '#fff',
            fontSize: '2px',
          },
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        xAxis: {
          type: 'category',
          data: ['2024', '2023', '2022', '2021', '2020'],
          axisLabel: {
            color: '#FEFFFF',
          },
          axisLine: {
            // 坐标轴 轴线
            show: true,
            lineStyle: {
              color: '#76859f',
            },
          },
          axisTick: {
            // 坐标轴 刻度线
            show: false,
          },
          splitLine: {
            // 坐标轴 grid区域中的分隔线
            show: false,
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#FEFFFF',
          },
          axisLine: {
            // 坐标轴 轴线
            show: true,
            lineStyle: {
              color: '#76859f',
            },
          },
          axisTick: {
            // 坐标轴 刻度线
            show: true,
          },
          splitLine: {
            // 坐标轴 grid区域中的分隔线
            show: false,
          },
        },
        calculable: true,
        series: censusSeries,
      })
    },
  },
}
</script>

<template>
  <div>
    <!-- 工单状态统计 -->
    <CardItem
      :height="30"
      title="工单状态统计"
    >
      <div
        id="chart_statics"
        class="content"
      />
    </CardItem>
    <!-- 故障类型分布 -->
    <CardItem
      :height="30"
      title="故障类型分布"
    >
      <div
        id="chart_failureType"
        class="content"
      />
    </CardItem>
    <!-- 近期出厂设备列表 -->
    <CardItem
      :height="30"
      title="近期出厂设备列表"
    >
      <!-- <div class="content" id="chart_weeklyMeeting"></div> -->
      <div class="content">
        <EList :listData="tableData" />
      </div>
    </CardItem>
  </div>
</template>

<style lang="scss" scoped>
.content {
  width: 25vw;
  height: 80%;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;

  .total {
    width: 10vw;
    height: 16vh;
    padding-left: 1vw;
    position: relative;
    .total-img {
      width: 5.5vw;
      height: 14vh;
      margin: 1vh 1.5vw 1vh 2vw;
      background-image: url('~@/assets/anqiBi/base1.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }
    .total-name {
      position: absolute;
      width: 5vw;
      top: 25%;
      left: 30%;
      text-align: center;
      font-size: 1.1vw;
      font-weight: 600;
      background-image: linear-gradient(
        to bottom,
        #00d8ff 20%,
        #feffff
      ); /* 线性渐变背景，方向向上 */
      -webkit-background-clip: text; /* 背景被裁剪成文字的前景色 */
      -webkit-text-fill-color: transparent; /* 文字填充颜色变透明 */
    }
    .total-count {
      position: absolute;
      width: 5vw;
      top: 5%;
      left: 30%;
      text-align: center;
      font-size: 1.7vw;
      font-weight: 700;
      background-image: linear-gradient(
        to bottom,
        #00d8ff 20%,
        #feffff
      ); /* 线性渐变背景，方向向上 */
      -webkit-background-clip: text; /* 背景被裁剪成文字的前景色 */
      -webkit-text-fill-color: transparent; /* 文字填充颜色变透明 */
    }
  }
  .category {
    width: 14vw;
    height: 16vh;
    display: flex;
    flex-wrap: wrap;

    .category-item {
      width: 7vw;
      height: 8vh;
      position: relative;
      .category-item-img {
        width: 5vw;
        height: 7vh;
        margin: 1vh 1vw 0vh 0vw;
        background-image: url('~@/assets/anqiBi/Base2.png');
        background-repeat: no-repeat;
        background-size: 100% 100%;
      }
      .category-item-count {
        position: absolute;
        width: 5vw;
        top: 15%;
        left: 0;
        text-align: center;
        font-size: 1.2vw;
        font-weight: 600;
        color: #00d8ff;
      }
      .category-item-peoples {
        position: absolute;
        width: 5vw;
        top: 45%;
        left: 0;
        text-align: center;
        font-size: 0.7vw;
      }
      .category-item-name {
        width: 5vw;
        position: absolute;
        top: 90%;
        left: 0;
        text-align: center;
        font-size: 0.6vh;
        font-weight: 200;
      }
    }
  }
  .review-table-tr {
    background-repeat: no-repeat;
    background-size: 100% 100%;
    width: 23vw;
    height: 3vh;
    margin: 0 1vw;
    text-align: center;
    line-height: 3vh;
  }
}
.Meeting {
  width: 12vw;
  height: 3vh;
  position: absolute;
  top: 25%;
  left: 8%;
  display: flex;
  flex-wrap: wrap;
  .meeting-item {
    width: 3.75vw;
    height: 3vh;
    margin: 0 0.25vw 0 0;
    .meeting-item-img {
      width: 3.75vw;
      height: 3vh;
      background-repeat: no-repeat;
      background-size: 100% 100%;
      line-height: 3vh;
      text-align: center;
      font-size: 0.8vw;
    }
  }
}
</style>
