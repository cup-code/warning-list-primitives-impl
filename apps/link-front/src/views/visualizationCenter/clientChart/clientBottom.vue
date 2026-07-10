<script>
import options from './bottomChart'

export default {
  name: 'ClientBottom',
  components: {},
  data() {
    return {
      list: [
        {
          icon: require('@/assets/anqiBi/trainSumIcon.png'),
          num: 20,
          text: '今日工单',
        },
        {
          icon: require('@/assets/anqiBi/trainSumIcon.png'),
          num: 1000,
          text: '本月工单',
        },
      ],
      allCharts: {
        chart_orderRate: null, // 工单分析
        chart_accountRate: null, // 故障用户全体分布
        chart_satisfaction: null, // 故障类型统计
        chart_statics: null, // 故障类型统计
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
      this.initChart('chart_orderRate', options.orderRate)
      this.initChart('chart_accountRate', options.accountRate)
      this.initChart('chart_satisfaction', options.satisfaction)
      this.initChart('chart_statics', options.statics)
    },
  },
}
</script>

<template>
  <div class="content">
    <div class="digital-box">
      <div
        v-for="(item, index) in list"
        :key="index"
        class="digital"
      >
        <el-image
          fit="fill"
          width="7vw"
          height="4vh"
          :src="item.icon"
          class="images"
        />
        <div class="text-block">
          <div style="margin-bottom: 10px">
            {{ item.num }}个
          </div>
          <div>{{ item.text }}</div>
        </div>
      </div>
    </div>
    <div
      id="chart_orderRate"
      class="chart-info"
    />
    <div
      id="chart_accountRate"
      class="chart-info"
    />
    <div
      id="chart_satisfaction"
      class="chart-info"
    />
    <!-- <div class="chart-block"></div> -->
    <div
      id="chart_statics"
      class="chart-block"
    />
  </div>
</template>

<style lang="scss" scoped>
.content {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  padding: 14px 0;
  box-sizing: border-box;

  .digital-box {
    width: calc((47vw - 60px) / 4);
    margin: 0 6px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .digital {
      display: flex;
      align-items: center;
      justify-content: center;
      height: calc(50% - 5px);
      margin-bottom: 10px;
      box-sizing: border-box;
      padding: 10px;
      background: rgba($color: #03407d, $alpha: 0.2);

      &:last-child {
        margin-bottom: 0;
      }

      .images {
        width: 30%;
        height: 40%;
        margin-right: 10px;
      }

      .text-block {
        text-align: center;
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
      }
    }
  }
  .chart-info {
    width: calc((47vw - 60px) / 4);
    height: calc(27vh - 24px);
    background: rgba($color: #03407d, $alpha: 0.2);
    margin: 0 6px;
  }
  .chart-block {
    width: calc(25vw - 12px);
    height: calc(27vh - 24px);
    background: rgba($color: #03407d, $alpha: 0.2);
    margin: 0 6px;
  }
}
</style>
