<script>
import CardItem from './cardItem'
// 违规统计表
export default {
  name: 'anqiBiLeft',
  components: {
    CardItem,
  },
  data() {
    return {
      // 安全奖励数据
      userList: [
        {
          name: '今日故障工单',
          count: 2,
          icon: require('@/assets/anqiBi/riskicon.png'),
        },
        {
          name: '本月故障工单',
          count: 8,
          icon: require('@/assets/anqiBi/3Dicon.png'),
        },
        {
          name: '今日维修工单',
          count: 1,
          icon: require('@/assets/anqiBi/anQuanicon.png'),
        },
        {
          name: '本月维修工单',
          count: 21,
          icon: require('@/assets/anqiBi/othericon.png'),
        },
        {
          name: '日工单总数',
          count: 3,
          icon: require('@/assets/anqiBi/othericon.png'),
        },
        {
          name: '月工单总数',
          count: 29,
          icon: require('@/assets/anqiBi/othericon.png'),
        },
      ],
      assessmentList: [
        { name: `东北`, value: 14, sum: 240, Proportion: '10%' },
        { name: '华北 ', value: 26, sum: 100, Proportion: '26%' },
        { name: '华东', value: 30, sum: 120, Proportion: '24%' },
        { name: '华中', value: 30, sum: 120, Proportion: '12%' },
        { name: '华南', value: 30, sum: 120, Proportion: '14%' },
        { name: '西南', value: 30, sum: 120, Proportion: '10%' },
        { name: '西北', value: 30, sum: 120, Proportion: '4%' },
        // { value: 30 }
      ],
      assessmentType: [
        {
          name: '内部人员违章',
          icon: require('@/assets/anqiBi/titleTiemBg1.png'),
        },
        {
          name: '第三方人员违章',
          icon: require('@/assets/anqiBi/titleTiemBg2.png'),
        },
      ],
      allCharts: {
        chart_assessment: null, // 安全考核
        chart_census: null, // 隐患统计
      },

      // dialog 弹窗
      dialogTitle: '违章指挥数据统计',
      showInfoDialog: false,
      illegalData: [],
    }
  },
  mounted() {
    this.initAll() // 初始化所有图表
    window.addEventListener('resize', this.resizeCharts) // 图表自适应大小
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
  },
  methods: {
    selectData(item) {
      this.assessmentType.forEach((data) => {
        if (data.name == item.name) {
          data.icon = require('@/assets/anqiBi/titleTiemBg1.png')
        }
        else {
          data.icon = require('@/assets/anqiBi/titleTiemBg2.png')
        }
      })
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
      this.initChart('chart_assessment', {
        color: ['#e1d45c', '#04c5be', '#b3a3da', '#a5c970', '#f4bc89', '#70afea', '#d566a0'],
        legend: {
          pageIconColor: '#e1d45c',
          pageTextStyle: {
            color: '#fff',
          },
          x: 'center',
          y: 'top',
          itemHeight: 10,
          itemWidth: 12,
          itemGap: 10,
          icon: 'roundRect',
          textAlign: 'center',
          textStyle: {
            color: '#fff',
            fontSize: '12',
          },
        },
        series: [
          {
            type: 'pie',
            radius: ['80%', '50%'],
            left: '26%',
            top: '26%',
            width: '40%',
            label: {
              normal: {
                show: true,
                position: 'center',
                color: '#ffffff',
                formatter: `{total|${600}}` + `\n\r` + `{active|` + `分布数量` + `}`,
                rich: {
                  total: { fontSize: 20, color: '#ffffff' },
                  active: { fontSize: 12, color: '#ffffff' },
                },
              },
            },
            data: this.assessmentList,
          },
        ],
      })
      const censusSeries = [
        {
          name: '风机',
          data: [15, 23, 40, 20, 0, 0, 19],
        },
        {
          name: '电机',
          data: [20, 12, 0, 5, 0, 0, 30],
        },
      ]
      censusSeries.forEach((item) => {
        item.barWidth = 16
        item.type = 'bar'
        item.itemStyle = {
          shadowBlur: 5.5,
          shadowColor: 'rgba(83, 101, 166, 1)',
          shadowOffsetY: 1,
          shadowOffsetX: 1,
        }
      })
      this.initChart('chart_census', {
        color: ['#05c5be', '#ef9364'],
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
          data: ['2024', '2023'],
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
        series: censusSeries,
      })
    },
  },
}
</script>

<template>
  <div style="height: 100%">
    <!-- 工单数据 -->
    <CardItem
      title="工单数据"
      :height="26"
    >
      <div class="content">
        <div
          v-for="(item, index) in userList"
          :key="index"
          class="jlItem"
        >
          <div class="sort-title">
            {{ item.name }}
          </div>
          <div class="sort-count">
            {{ item.count }}
          </div>
        </div>
      </div>
    </CardItem>

    <!-- 设备类型数量 -->
    <CardItem
      :height="30"
      title="设备类型数量"
    >
      <div
        id="chart_census"
        class="content"
      />
    </CardItem>
    <!-- 区域分布 -->
    <CardItem
      :height="30"
      title="区域分布"
    >
      <div
        id="chart_assessment"
        class="content"
      />
    </CardItem>
  </div>
</template>

<style lang="scss" scoped>
.content {
  width: 25vw;
  height: 80%;
  display: flex;
  flex-wrap: wrap;
  padding: 10px;

  .jlItem {
    width: calc((100% - 40px) / 2);
    display: flex;
    align-items: center;
    padding: 4px 12px;
    box-sizing: border-box;
    flex-wrap: wrap;

    .sort-title {
      //   width: 6vw;
      margin-right: 4px;
      letter-spacing: 1px;
    }

    .sort-count {
      //   width: 6vw;
      font-size: 1.5vw;
      font-weight: 600;
      color: #00d8ff;
    }
  }
}

.assessment-type {
  width: 15vw;
  height: 5vh;
  z-index: 2;
  position: absolute;
  top: 30%;
  left: 35%;
  display: flex;
  flex-wrap: wrap;
  line-height: 4.5vh;
  text-align: center;
  font-size: 0.8vw;

  .assessment-type-item {
    width: 7vw;
    height: 4.5vh;
    margin-right: 0.5vw;
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
}

.assessment-data {
  width: 8vw;
  height: 10vh;
  margin-left: 1vw;
  position: absolute;
  top: 53%;
  left: 65%;
  display: flex;
  flex-wrap: wrap;
  line-height: 3vh;
  //text-align: center;
  font-size: 0.9vw;

  .assessment-data-item {
    width: 8vw;
    height: 3vh;
  }
}
</style>
