<script>
import { getIoTrendHis, getIoTrendReal } from '@/http/dev/manage-api.js'

export default {
  props: {
    // history历史趋势 real实时趋势
    dataType: {
      type: String,
      default: 'history',
    },
    // 测点编码
    ioCode: {
      type: [String, Number],
      default: '',
    },
    // 设备编码
    deviceCode: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      isLoading: false,
      // 搜索相关数据
      searchData: {},
      chartList: [], // 图表数据
      chartTimer: null, // 计时器
      maxCount: 100, // 实时图表数据最大数量
      myChart: null, // 图表实例
      // 图表配置项
      chartOption: {
        tooltip: {
          trigger: 'axis',
        },
        legend: {
          data: [],
        },
        xAxis: {
          min: 'dataMin',
          max: 'dataMax',
          splitNumber: 10,
          type: 'time',
          boundaryGap: false,
        },
        yAxis: {
          type: 'value',
        },
        series: [],
      },
    }
  },
  mounted() {
    if (this.dataType == 'real') {
      this.reqRealData()
    }
    // 图表自适应大小
    window.addEventListener('resize', this.resizeChart)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart)
    this.closeCirculation()
  },
  methods: {
    // 请求历史数据
    reqHistoryData() {
      this.isLoading = true
      const params = {
        ...this.searchData,
        icd: this.ioCode,
        dcd: this.deviceCode,
      }
      getIoTrendHis(params)
        .then(({ data }) => {
          if (data.success) {
            const resList = data.result
            this.chartList = []
            this.initChart(resList)
          }
          else {
            this.$message.warning(data.message || '获取测点历史数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取测点历史数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 请求实时数据
    reqRealData() {
      this.isLoading = true
      getIoTrendReal(this.deviceCode, this.ioCode)
        .then(({ data }) => {
          if (data.success) {
            this.initChart([data.result])
            this.refreshChart()
          }
          else {
            this.$message.warning(data.message || '获取实时数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取实时数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // 初始化图表
    initChart(resList) {
      if (this.myChart) {
        this.$echarts.dispose(this.myChart)
        this.myChart = null
      }
      const chartDom = document.getElementById('pointChart')
      this.myChart = this.$echarts.init(chartDom)
      const dataList = resList.map((item) => {
        return [item.eventDate, item.value]
      })
      this.chartList = [{ type: 'line', smooth: true, data: dataList }]
      this.chartOption.series = this.chartList
      this.myChart.setOption(this.chartOption)
    },
    // 刷新图表数据
    refreshChart() {
      // 获取测点实时数据
      getIoTrendReal(this.deviceCode, this.ioCode)
        .then(({ data }) => {
          if (data.success) {
            if (this.chartList[0].data.length >= this.maxCount) {
              this.chartList[0].data.shift()
            }
            const result = data.result
            if (result.eventDate && result.value) {
              this.chartList[0].data.push([result.eventDate, result.value])
            }
            else {
              this.chartList[0].data.push([])
            }
            this.chartOption.series = this.chartList
            this.myChart.setOption(this.chartOption)
          }
          else {
            this.$message.warning(res.data.result || '获取实时数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取实时数据出错', err)
        })
        .finally(() => {
          this.chartTimer = setTimeout(() => {
            this.refreshChart()
          }, 1000)
        })
    },
    /* 图表尺寸自适应 */
    resizeChart() {
      if (this.myChart) {
        this.myChart.resize()
      }
    },
    /* 关闭循环请求 */
    closeCirculation() {
      if (this.chartTimer) {
        clearTimeout(this.chartTimer)
        this.chartTimer = null
      }
    },
  },
}
</script>

<template>
  <div class="watch-bg">
    <el-form
      v-if="dataType == 'history'"
      class="search-form"
      :model="searchData"
      label-width="80px"
      inline
    >
      <el-form-item
        label="开始时间"
        :rules="{
          required: true,
          message: '请选择开始时间',
          trigger: 'change',
        }"
      >
        <el-date-picker
          v-model="searchData.startDate"
          class="search-item"
          type="datetime"
          value-format="timestamp"
          placeholder="开始时间"
        />
      </el-form-item>
      <el-form-item
        label="截止时间"
        :rules="{
          required: true,
          message: '请选择截止时间',
          trigger: 'change',
        }"
      >
        <el-date-picker
          v-model="searchData.endDate"
          class="search-item"
          type="datetime"
          value-format="timestamp"
          placeholder="截止时间"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="reqHistoryData">
          查询
        </el-button>
      </el-form-item>
    </el-form>
    <div id="pointChart" slot="table" />
  </div>
</template>

<style lang="scss" scoped>
.watch-bg {
  .search-form {
    width: 850px;
    .search-item {
      width: 250px;
    }
  }
}
#pointChart {
  height: 500px;
  width: 100%;
}
</style>
