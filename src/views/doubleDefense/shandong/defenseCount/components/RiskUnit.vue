<script>
export default {
  data() {
    return {
      myChart: null,
      option: {
        title: {
          text: '风险单元统计',
        },
        grid: {
          top: '0px',
          left: '0px',
          right: '0px',
          bottom: '0px',
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          top: '5%',
          orient: 'vertical',
          left: 'right',
        },
        series: [
          {
            name: '风险单元统计',
            type: 'pie',
            radius: ['40%', '90%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: false,
              position: 'center',
            },
            labelLine: {
              show: false,
            },
            colorBy: 'data',
            data: [],
          },
        ],
      },
    }
  },
  mounted() {
    const chartDom = document.getElementById('riskUnit')
    this.myChart = this.$echarts.init(chartDom)
  },
  methods: {
    setChart(dataList) {
      this.option.series[0].data = dataList
      this.myChart.setOption(this.option)
    },
    resizeChart() {
      if (this.myChart) {
        this.myChart.resize()
      }
    },
  },
}
</script>

<template>
  <div id="riskUnit" />
</template>
