<script>
import CardItem from '../components/cardItem'
import options from './Chart.js'

export default {
  name: 'ClientLeft',
  components: {
    CardItem,
  },
  data() {
    return {
      allCharts: {
        chart_analyse: null, // 工单分析
        chart_distribution: null, // 故障用户全体分布
        chart_statistics: null, // 故障类型统计
      },
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
      this.initChart('chart_analyse', options.analyse)
      this.initChart('chart_distribution', options.distribution)
      this.initChart('chart_statistics', options.statistics)
    },
  },
}
</script>

<template>
  <div style="height: 100%">
    <CardItem
      title="工单分析"
      :height="30"
    >
      <div
        id="chart_analyse"
        class="content"
      />
    </CardItem>

    <CardItem
      :height="30"
      title="故障用户全体分布"
    >
      <div
        id="chart_distribution"
        class="content"
      />
    </CardItem>
    <!-- 外部检查 -->
    <CardItem
      :height="30"
      title="故障类型统计"
    >
      <div
        id="chart_statistics"
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
  padding: 0 10px 10px;
  box-sizing: border-box;

  .jlItem {
    width: 50%;
    // height: 8vh;
    display: flex;
    align-items: center;
    padding: 12px;
    box-sizing: border-box;
    flex-wrap: wrap;

    .sort-img {
      width: 4vw;
      height: 6vh;
      margin: 0 1vw;
    }

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

//.assessment-perBg1{
//  width: 15vh;
//  height: 15vh;
//  position: absolute;
//  top: 31%;
//  left: 5.7%;
//  background-image: url('~@/assets/anqiBi/perBg1.png');
//  background-repeat: no-repeat;
//  background-size: 100% 100%;
//}
</style>
