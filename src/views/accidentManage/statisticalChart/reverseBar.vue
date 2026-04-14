<script>
export default {
  props: ['classData'],
  data() {
    return {
      chart: null,
      Xdata: [],
      Ydata: [],
    }
  },
  watch: {
    classData(val) {
      this.init()
      this.updateChart()
    },
  },
  created() {
    if (this.classData) {
      this.init()
    }
  },
  mounted() {
    this.initChart()
    this.updateChart()
  },
  methods: {
    init() {
      this.Xdata = this.classData.map(item => item.accidentType)
      this.Ydata = [
        {
          type: 'bar',
          data: this.classData.map(item => item.total),
          barMaxWidth: 20,
        },
      ]
    },
    updateChart() {
      const option = {
        color: ['rgb(104, 187, 196)'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          show: false,
        },
        xAxis: {
          type: 'value',
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
        },
        yAxis: {
          type: 'category',
          data: this.Xdata,
          axisLine: {
            show: true,
          },
          axisTick: {
            show: true,
          },
        },
        series: this.Ydata,
        grid: {
          top: 20,
          bottom: 20,
          left: 20,
          right: 20,
          containLabel: true,
        },
      }
      this.chart.setOption(option)
    },
    initChart() {
      if (this.chart === null) {
        this.chart = this.$echarts.init(this.$refs.chart, 'sifang')
        const handleResize = () => {
          this.chart.resize()
        }
        window.addEventListener('resize', handleResize)
        this.$once('hook:destroyed', () => {
          window.removeEventListener('resize', handleResize)
        })
      }
    },
  },
}
</script>

<template>
  <div ref="chart" style="width: 100%; height: 100%" />
</template>

<style></style>
