<script>
export default {
  props: ['barData'],
  data() {
    return {
      chart: null,
      Xdata: [],
      Ydata: [],
    }
  },
  watch: {
    barData(val) {
      this.init()
      this.updateChart()
    },
  },
  created() {
    if (this.barData) {
      this.init()
    }
  },
  mounted() {
    this.initChart()
    this.updateChart()
  },
  methods: {
    init() {
      this.Xdata = Object.keys(this.barData)
      const arr = []
      this.Xdata.forEach((item) => {
        this.barData[item].map((v) => {
          arr.push({
            name: this.$dictUtils.getDictLabel('character_accident', v.accidentNature),
            data: v.totalNature,
          })
          return arr
        })
      })
      this.handlerDatas(arr)
      this.Ydata = this.handlerDatas(arr)
    },
    handlerDatas(arr) {
      const obj = {}
      arr.forEach((item, index) => {
        const { name } = item // 解构赋值
        if (!obj[name]) {
          obj[name] = {
            name,
            type: 'bar',
            data: [],
            barGap: 0,
            barMaxWidth: 20,
          }
        }
        obj[name].data.push(item.data)
      })
      const data = Object.values(obj) // 最终输出
      return data
    },
    updateChart() {
      const option = {
        color: ['#d97559', '#e4c477', '#daa67b', '#4e9c8f', '#4786b4', '#11c8e5'],
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
          data: this.Xdata,
          axisLine: {
            show: true,
          },
          axisTick: {
            show: true,
          },
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
        },
        series: this.Ydata,
        grid: {
          top: 20,
          bottom: 20,
          left: 40,
          right: 30,
        },
        dataZoom: [
          {
            type: 'inside',
          },
        ],
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
