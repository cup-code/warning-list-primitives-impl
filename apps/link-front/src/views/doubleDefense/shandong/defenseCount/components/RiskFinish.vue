<script>
export default {
  data() {
    return {
      myChart: null,
      option: {
        title: {
          text: '安全风险分析完成率',
        },
        grid: {
          top: '0px',
          left: '0px',
          right: '0px',
          bottom: '0px',
        },
        series: [
          {
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            center: ['50%', '80%'],
            radius: '120%',
            min: 0,
            max: 1,
            splitNumber: 8,
            axisLine: {
              lineStyle: {
                width: 6,
                color: [
                  [0.2, '#F95961'],
                  [0.4, '#FFB704'],
                  [0.8, '#4661FF'],
                  [1, '#17B9FF'],
                ],
              },
            },
            pointer: {
              icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
              length: '75%',
              width: 5,
              offsetCenter: [0, '65%'],
            },
            axisTick: {
              length: 12,
              lineStyle: {
                color: 'auto',
                width: 2,
              },
            },
            splitLine: {
              length: 20,
              lineStyle: {
                color: 'auto',
                width: 5,
              },
            },
            axisLabel: {
              color: '#464646',
              fontSize: 12,
              distance: -60,
              rotate: 'tangential',
              formatter(value) {
                // if (value === 0.875) {
                //   return 'Grade A'
                // } else if (value === 0.625) {
                //   return 'Grade B'
                // } else if (value === 0.375) {
                //   return 'Grade C'
                // } else if (value === 0.125) {
                //   return 'Grade D'
                // }
                return ''
              },
            },
            title: {
              offsetCenter: [0, '-10%'],
              fontSize: 16,
            },
            detail: {
              fontSize: 30,
              offsetCenter: [0, '-35%'],
              valueAnimation: true,
              formatter(value) {
                return Math.round(value * 100)
              },
              color: 'auto',
            },
            data: [
              {
                value: 0.7,
                name: '安全风险分析',
              },
            ],
          },
        ],
      },
    }
  },
  mounted() {
    const chartDom = document.getElementById('riskFinish')
    this.myChart = this.$echarts.init(chartDom)
  },
  methods: {
    setChart(riskNum) {
      this.option.series[0].data[0].value = riskNum
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
  <div id="riskFinish" />
</template>
