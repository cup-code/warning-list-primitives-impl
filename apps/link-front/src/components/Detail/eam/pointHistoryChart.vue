/* * @Author: xiaorui 测点的历史趋势图 * @Date: 2022-06-30 14:01:36 * @Last Modified by:
xiaorui * @Last Modified time: 2022-09-15 16:36:00 */
<script>
import { getPointHisDataFn } from '@/http/dev_new/manage-api'
import { getHistoryData } from '@/http/hmi-api'

export default {
  data() {
    return {
      visible: false,
      title: '历史趋势',
      id: '', // 测定id
      historyChart: null,
      sDate: '', // 时间
      pickerOptions: {
        shortcuts: [
          {
            text: '近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            },
          },
        ],
      },
      options: {
        grid: {
          height: '90%',
          left: '5%',
          right: '6%',
          bottom: '3%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
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
            data: [],
          },
        ],
      },
    }
  },
  methods: {
    initChart() {
      this.historyChart = this.$echarts.init(
        document.getElementById('point_history_chart'),
      )
      this.historyChart.setOption(this.options)
    },
    init(id, title) {
      this.visible = true
      this.isHmi = false // 判断是否组态里调用
      this.id = id
      this.title = `历史趋势-${title}`
      this.$nextTick(() => {
        this.initChart()
      })
      this.sDate = [+new Date() - 3600 * 1000 * 24 * 30, +new Date()] // 默认时间周期是 近一月
      getPointHisDataFn(id, this.sDate[0], this.sDate[1]).then(({ data }) => {
        if (data.success) {
          this.fillHisChart(data.result || [])
        }
        else {
          this.$message.error(data.message || '获取数据失败')
        }
      })
    },
    // 组态里查看历史趋势图的--单条的
    initHmiTrend(id, deviceCode, ioCode, title) {
      this.visible = true
      this.isHmi = true // 判断是否组态里调用
      this.id = id
      this.deviceCode = deviceCode
      this.ioCode = ioCode
      this.title = `历史趋势-${title}`
      this.$nextTick(() => {
        this.initChart()
      })
      this.sDate = [+new Date() - 3600 * 1000 * 24 * 30, +new Date()] // 默认时间周期是 一月
      getHistoryData(id, deviceCode, ioCode, this.sDate[0], this.sDate[1]).then(
        ({ data }) => {
          if (data.success) {
            this.fillHisChart(data.result || [])
          }
          else {
            this.$message.error(data.message || '获取数据失败')
          }
        },
      )
    },
    fillHisChart(dt) {
      const tags = []
      const vals = []
      dt.forEach((item) => {
        tags.push(item.eventDate)
        vals.push(item.value)
      })
      this.historyChart.setOption({
        xAxis: {
          data: tags,
        },
        series: [{ data: vals }],
      })
    },
    // 时间选择器
    dateChange(v) {
      if (!v)
        return
      // 请求数据 并 填入图表
      if (this.isHmi) {
        getHistoryData(this.id, this.deviceCode, this.ioCode, v[0], v[1]).then(
          ({ data }) => {
            if (data.success) {
              this.fillHisChart(data.result || [])
            }
            else {
              this.$message.error(data.message || '获取数据失败')
            }
          },
        )
      }
      else {
        getPointHisDataFn(this.id, v[0], v[1]).then(({ data }) => {
          if (data.success) {
            this.fillHisChart(data.result || [])
          }
          else {
            this.$message.error(data.message || '获取数据失败')
          }
        })
      }
    },
    closeFn() {
      this.historyChart = null
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
    <el-form
      label-width="60px"
      size="mini"
      inline
    >
      <el-form-item label="选择时间">
        <el-date-picker
          v-model="sDate"
          style="width: 100%"
          size="mini"
          value-format="timestamp"
          type="datetimerange"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
          @change="dateChange"
        />
      </el-form-item>
    </el-form>
    <div id="point_history_chart" style="height: 300px" />
  </el-dialog>
</template>
