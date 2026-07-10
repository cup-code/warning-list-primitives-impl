<script>
export default {
  props: {
    rectifyList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      myChart: null,
      option: {
        title: {
          text: '隐患整改率',
        },
        grid: {
          top: '35px',
          left: '50px',
          right: '50px',
          bottom: '20px',
        },
        tooltip: {
          trigger: 'axis',
          // formatter: '{b0}隐患整改<br />完成 {c0}%'
        },
        legend: {
          data: ['已整改数量', '未整改数量', '整改率'],
        },
        xAxis: {
          type: 'category',
          axisPointer: {
            type: 'shadow',
          },
          data: [],
        },
        yAxis: [
          {
            type: 'value',
            min: 0,
            interval: 100,
            splitLine: {
              show: false, // 不显示分隔线
            },
          },
          {
            type: 'value',
            min: 0,
            max: 100,
            interval: 20,
            axisLabel: {
              formatter: '{value} %',
            },
            splitLine: {
              show: false, // 不显示分隔线
            },
          },
        ],
        series: [],
      },
    }
  },
  mounted() {
    const chartDom = document.getElementById('rectifyFinish')
    this.myChart = this.$echarts.init(chartDom)
  },
  methods: {
    setChart(xList, yList) {
      this.option.xAxis.data = xList
      this.option.series = yList
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
  <div id="rectifyFinish" />
</template>
