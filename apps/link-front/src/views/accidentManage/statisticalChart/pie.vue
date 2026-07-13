<script>
export default {
  props: ['pieData'],
  data() {
    return {
      chart: null,
      Data: [],
    }
  },
  watch: {
    pieData(val) {
      this.init()
      this.updateChart()
    },
  },
  created() {
    if (this.pieData) {
      this.init()
    }
  },
  mounted() {
    this.initChart()
    this.updateChart()
  },
  methods: {
    init() {
      this.Data = []
      this.pieData.map((v) => {
        this.Data.push({
          name: v.occurringUnit,
          value: v.total,
        })
      })
    },
    updateChart() {
      const option = {
        tooltip: { trigger: 'item' },
        legend: {
          show: false,
        },
        series: [
          {
            type: 'pie',
            radius: '60%',
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)',
              },
            },
            data: this.Data,
            label: {
              show: true,
              formatter: '{b}\n{c}',
            },
          },
        ],
        grid: {
          top: 20,
          bottom: 20,
          left: 0,
          right: 0,
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
