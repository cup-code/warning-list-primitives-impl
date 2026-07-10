/* * @Author: xiaorui 测点的实时趋势图 * @Date: 2022-06-29 18:14:20 * @Last Modified by: xiaorui *
@Last Modified time: 2022-09-20 11:57:44 */
<script>
import { getPointRealDataFn } from '@/http/dev_new/manage-api'
import { getRealtimeData } from '@/http/hmi-api'
import { formatDate } from '@/utils'

export default {
  data() {
    return {
      visible: false,
      title: '实时趋势',
      realChart: null,
      options: {
        grid: {
          height: '90%',
          left: '5%',
          right: '5%',
          bottom: '3%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          formatter(params) {
            params = params[0]
            return params.value
          },
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisTick: {
            show: false, // 控制 x轴 是否显示刻度
          },
          data: [],
        },
        yAxis: {
          type: 'value',
          axisTick: {
            show: false, // 控制 y轴 是否显示刻度
          },
        },
        series: [
          {
            type: 'line',
            smooth: true,
            showSymbol: false, // 隐藏折线上的小圆点
            data: [],
          },
        ],
      },
      inter: null,
    }
  },
  methods: {
    initChart() {
      this.realChart = this.$echarts.init(document.getElementById('point_real_chart'))
      this.realChart.setOption(this.options)
    },
    init(id, title) {
      this.visible = true
      this.title = `实时趋势-${title}`
      this.$nextTick(() => {
        this.initChart()
      })
      const oData = []
      let temp
      this.inter = setInterval(() => {
        getPointRealDataFn(id).then(({ data }) => {
          if (data.success) {
            temp = data.result || {}
            temp.xName = +new Date()
            oData.push(temp)
            // if (oData.lengt > 60) {
            //   oData.shift()
            // }
            this.fillRealChart(oData)
          }
        })
      }, 1000)
    },
    // 组态里查看实时趋势图的
    initHmiTrend(id, deviceCode, ioCode, title) {
      this.visible = true
      this.title = `实时趋势-${title}`
      this.$nextTick(() => {
        this.initChart()
      })
      const oData = []
      let temp
      this.inter = setInterval(() => {
        getRealtimeData(id, deviceCode, ioCode).then(({ data }) => {
          if (data.success) {
            temp = data.result || {}
            temp.xName = +new Date()
            oData.push(temp)
            this.fillRealChart(oData)
          }
        })
      }, 1000)
    },
    fillRealChart(dt) {
      const tags = []
      const vals = []
      dt.forEach((item) => {
        tags.push(formatDate(+item.xName, 'HH:mm:ss'))
        vals.push({ name: item.eventDate, value: item.value })
      })
      this.realChart.setOption({
        xAxis: {
          data: tags,
        },
        series: [{ data: vals }],
      })
    },
    closeFn() {
      this.realChart = null
      if (this.inter) {
        clearInterval(this.inter)
        this.inter = null
      }
    },
  },
}
</script>

<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    :append-to-body="true"

    class="normal-dialog"
    :visible.sync="visible"
    @close="closeFn"
  >
    <div
      id="point_real_chart"
      style="height: 300px"
    />
  </el-dialog>
</template>
