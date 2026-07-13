<script>
export default {
  data() {
    return {
      myChart: null,
      option: {
        title: {
          text: '排查任务完成率',
        },
        grid: {
          top: '35px',
          left: '50px',
          right: '10px',
          bottom: '20px',
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b0}排查任务<br />完成 {c0}%',
        },
        xAxis: {
          type: 'category',
          data: [],
        },
        yAxis: {
          type: 'value',
          max: 100,
          min: 0,
          interval: 20,
          axisLabel: {
            formatter: '{value} %',
          },
          splitLine: {
            show: false, // 不显示分隔线
          },
        },
        series: [
          {
            data: [],
            type: 'line',
            smooth: false,
            color: '#138EFC',
            label: {
              show: true,
              position: 'top',
              formatter(params) {
                return params.value > 0 ? `${params.value}%` : ''
              },
            },
          },
        ],
      },
    }
  },
  mounted() {
    const chartDom = document.getElementById('checkFinish')
    this.myChart = this.$echarts.init(chartDom)
  },
  methods: {
    setChart(xList, yList) {
      this.option.xAxis.data = xList
      this.option.series[0].data = yList
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
  <div id="checkFinish" />
</template>
