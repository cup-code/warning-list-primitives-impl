<script>
import options from './Chart'

export default {
  name: 'ClientMap',
  data() {
    return {
      allCharts: {
        chart_map: null, // 客户分布
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
      this.initChart('chart_map', options.map)
    },
  },
}
</script>

<template>
  <div
    id="chart_map"
    class="mapScreen"
  />
</template>

<style lang="scss" scoped>
.mapScreen {
  z-index: 99;
  position: absolute;
  width: 80%;
  height: 70%;
  top: 40%;
  left: 51%;
  transform: translate(-50%, -50%);
  margin: auto;
  //   background-repeat: no-repeat;
  //   background-size: 100% 100%;
}
</style>
