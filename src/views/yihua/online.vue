<script>
import { getDeviceGroup } from '@/http/dev/group-api'
import {
  exportDevDataExcel,
  getDevData,
  getDevList,
} from '@/http/yihua-api'
import AutoTable from './extends/AutoTable'
import headersMap from './extends/headersMap.json'

export default {
  components: { AutoTable },
  data: () => ({
    drop: false, // 搜索条件框是否展开
    radio_real: 1, // 控制 实时数据的 表格和曲线切换： 1是表格, 2是曲线
    radio_his: 1, // 控制 历史数据的 表格和曲线切换： 1是表格, 2是曲线
    sForm: {
      deviceType: 1, // 默认选中 废水
      dataType: '1', // 1: 实时数据；  2: 历史数据
    },
    sDate: '',
    tableHeaders: [], // 表格的表头
    tableData: [], // 表格数据
    allCharts: {
      chart_real: null, // 实时图表
      chart_his: null, // 历史图表
    },

    // 企业列表
    comList: [],
    // 排放口类型列表
    devTypeList: [
      { name: '废水', value: 1 },
      { name: '废气', value: 2 },
    ],
    // 排放口列表
    devList: [],
  }),
  watch: {
    // 监听 实时数据/历史数据 tab切换
    'sForm.dataType': function (v) {
      if (!this.sForm.did)
        return
      this.getDataList()
    },
    // 监听排放口， 如果为空， 则清除 表格数据
    'sForm.did': function (v) {
      if (!v) {
        this.tableData = []
        this.tableHeaders = []
      }
    },
    // 监听 实时数据的 表格/图表 的切换
    radio_real(v) {
      if (v === 1)
        return
      this.$nextTick(() => {
        this.initChart_real()
      })
    },
    // 监听 历史数据的 表格/图表 的切换
    radio_his(v) {
      if (v === 1)
        return
      this.$nextTick(() => {
        this.initChart_his()
      })
    },

    // 监听 列表数据变化，同步更新echarts图表
    tableData(v) {
      if (this.radio_real === 2) {
        this.initChart_real()
      }
      if (this.radio_his === 2) {
        this.initChart_his()
      }
    },
  },
  created() {
    this.getComList() // 获取企业列表
  },
  methods: {
    getDataList() {
      getDevData(this.sForm).then((res) => {
        const resD = res.data
        let tarStr = ''
        let dt = []
        if (resD.success) {
          if (resD.result) {
            // tarStr = Object.keys(resD.result[0] || {}).join(',') + ','
            tarStr = this.genTarStr(resD.result[0] || {})
            dt = resD.result || []
          }
        }
        this.fixDataFn(tarStr, dt)
      })
    },
    // 生成校验字符串
    genTarStr(obj) {
      const str = Object.keys(obj)
        .join(',')
        .replace(/max|min|avg|cou|zsmax|zsmin|zsavg/gi, '')
      const midArr = [...new Set(str.split(','))]
      return `${midArr.join(',')},`
    },
    // 处理数据
    fixDataFn(tarStr, dt) {
      if (tarStr === '') {
        this.tableHeaders = []
        this.tableData = []
        return
      }

      // 生成表头
      this.tableHeaders = headersMap.filter(item => tarStr.includes(`${item.prop},`))
      // 生成数据
      this.tableData = dt
    },
    // 获取企业列表（调 设备分组接口）
    getComList() {
      this.comList = []
      getDeviceGroup().then((res) => {
        const resD = res.data
        if (resD.success === true) {
          this.comList = resD.result
        }
      })
    },
    // 生成排放口列表
    genDevList() {
      this.$set(this.sForm, 'did', '') // 清空上次所选
      this.devList = []
      getDevList(this.sForm).then((res) => {
        const resD = res.data
        if (resD.success) {
          this.devList = resD.result
        }
      })
    },
    // 时间选择器
    dateChange(v) {
      const form = this.sForm
      if (v) {
        form.queryTime = v
      }
      else {
        delete form.queryTime
      }
    },

    // 搜索按钮
    searchFn() {
      if (!this.sForm.did) {
        this.$message.error('请选择排放口')
        return
      }
      this.getDataList()
    },

    // 公用 初始化图表 方法
    initChart(name, options) {
      this.allCharts[name] = this.$echarts.init(document.getElementById(name))
      this.allCharts[name].setOption(options)
    },
    // 初始化 实时图表
    initChart_real() {
      // 如果没有数据， 则清空
      if (this.tableData.length === 0) {
        this.allCharts.chart_real && this.allCharts.chart_real.clear()
        return
      }
      // 初始化 实时图表
      this.initChart('chart_real', {
        grid: {
          height: '90%',
          left: 0,
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.tableData.map(item => item.eventDate),
        },
        yAxis: {
          type: 'value',
          min: 'dataMin',
          max: 'dataMax',
        },
        legend: {
          right: '4%',
          data: this.tableHeaders.map(item => item.label),
        },
        series: this.genSeriesReal(),
      })
    },
    // 初始化 历史图表
    initChart_his() {
      // 如果没有数据， 则清空
      if (this.tableData.length === 0) {
        this.allCharts.chart_his && this.allCharts.chart_his.clear()
        return
      }
      // 初始化 历史图表
      this.initChart('chart_his', {
        grid: {
          height: '90%',
          left: 0,
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.tableData.map(item => item.eventDate),
        },
        yAxis: {
          type: 'value',
          min: 'dataMin',
          max: 'dataMax',
        },
        legend: {
          right: '4%',
          type: 'scroll',
          width: '50%',
          data: this.genSeriesHis()[0],
        },
        series: this.genSeriesHis()[1],
      })
    },

    // 生成 实时图表series
    genSeriesReal() {
      let temp
      return this.tableHeaders
        .filter(f => f.label !== '时间')
        .map((item) => {
          temp = {}
          temp.type = 'line'
          temp.name = item.label
          temp.data = this.tableData.map(t => t[item.prop])

          return temp
        })
    },
    // 生成 历史图表legend和series
    genSeriesHis() {
      const legends = []
      const series = []
      let str
      let temp
      this.tableHeaders
        .filter(f => f.label !== '时间')
        .forEach((item) => {
          ;(item.his || []).forEach((h) => {
            temp = {}
            str = item.label + h.label

            // 生成legend
            legends.push(str)
            // 生成series
            temp.type = 'line'
            temp.name = str
            temp.data = this.tableData.map(t => t[h.prop])
            series.push(temp)
          })
        })
      return [legends, series]
    },

    // 导出excel (实时数据、历史数据)
    exportExc() {
      exportDevDataExcel(this.sForm)
        .then((res) => {
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            window.open(resD.result)
            this.$message.success(msg || '导出excel成功')
          }
          else {
            this.$message.error(msg || '导出excel失败')
          }
        })
        .catch((err) => {
          this.$message.error('导出excel失败')
        })
    },
  },
}
</script>

<template>
  <div class="online-yihua">
    <!-- 搜索 -->
    <el-row>
      <el-col :span="24">
        <el-form
          ref="sForm"
          inline
          :model="sForm"
          label-width="75px"
          size="mini"
        >
          <el-form-item label="企业">
            <el-select
              v-model="sForm.companyId"
              placeholder="请选择"
              style="width: 100%"
              @change="genDevList"
            >
              <el-option
                v-for="item in comList"
                :key="item.id"
                :label="item.groupName"
                :value="item.id"
              >
                <span>{{ item.groupName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="排放口类型">
            <el-select
              v-model="sForm.deviceType"
              placeholder="请选择"
              style="width: 100%"
              @change="genDevList"
            >
              <el-option
                v-for="item in devTypeList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="排放口">
            <el-select
              v-model="sForm.did"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in devList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 搜索条件的 隐藏区域  -->
          <span v-if="drop">
            <el-form-item
              v-if="sForm.dataType != 1"
              label="时间"
            >
              <el-date-picker
                v-model="sDate"
                style="width: 100%"
                size="mini"
                value-format="timestamp"
                type="date"
                @change="dateChange"
              />
            </el-form-item>
          </span>

          <el-form-item style="margin-left: 20px">
            <el-button
              type="primary"
              icon="el-icon-search"
              size="mini"
              @click="searchFn"
            >
              搜索
            </el-button>
            <el-button
              type="text"
              style="margin-left: 15px"
              @click="drop = !drop"
            >
              {{ drop ? '收起' : '展开' }}
              <i
                class="el-icon--right"
                :class="[drop ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"
                style="margin-left: 0"
              />
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <!-- tab 标签页 -->
    <el-tabs v-model="sForm.dataType">
      <!-- 实时数据 -->
      <el-tab-pane
        label="实时数据"
        name="1"
      >
        <!-- 按钮 -->
        <el-row
          type="flex"
          align="middle"
        >
          <el-col :span="24">
            <el-button
              type="primary"
              icon="el-icon-document"
              size="mini"
              @click="exportExc"
            >
              Excel导出
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-document"
              size="mini"
            >
              PDF导出
            </el-button>
            <el-radio-group
              v-model="radio_real"
              style="margin-left: 20px"
            >
              <el-radio
                :label="1"
                style="margin-right: 15px"
              >
                表格
              </el-radio>
              <el-radio
                :label="2"
                style="margin-left: 0"
              >
                曲线
              </el-radio>
            </el-radio-group>
          </el-col>
        </el-row>

        <!-- 表格 -->
        <el-row
          v-if="radio_real === 1 && sForm.dataType == 1"
          class="mid-con"
        >
          <el-col :span="24">
            <auto-table
              :headers="tableHeaders"
              :data="tableData"
            />
          </el-col>
        </el-row>

        <!-- 曲线 -->
        <el-row
          v-else
          class="mid-con"
        >
          <div
            id="chart_real"
            class="chart"
          />
        </el-row>
      </el-tab-pane>

      <!-- 历史数据 -->
      <el-tab-pane
        label="历史数据"
        name="2"
      >
        <!-- 按钮 -->
        <el-row
          type="flex"
          align="middle"
        >
          <el-col :span="24">
            <el-button
              type="primary"
              icon="el-icon-document"
              size="mini"
              @click="exportExc"
            >
              Excel导出
            </el-button>
            <el-button
              type="danger"
              icon="el-icon-document"
              size="mini"
            >
              PDF导出
            </el-button>
            <el-radio-group
              v-model="radio_his"
              style="margin-left: 20px"
            >
              <el-radio
                :label="1"
                style="margin-right: 15px"
              >
                表格
              </el-radio>
              <el-radio
                :label="2"
                style="margin-left: 0"
              >
                曲线
              </el-radio>
            </el-radio-group>
          </el-col>
        </el-row>

        <!-- 表格 -->
        <el-row
          v-if="radio_his === 1 && sForm.dataType == 2"
          class="mid-con"
        >
          <el-col :span="24">
            <auto-table
              :headers="tableHeaders"
              :data="tableData"
              dtType="his"
            />
          </el-col>
        </el-row>

        <!-- 曲线 -->
        <el-row
          v-else
          class="mid-con"
        >
          <div
            id="chart_his"
            class="chart"
          />
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.online-yihua {
  position: relative;
  padding: 10px;
  .mid-con {
    padding: 2vh 0;
    .group-table {
      .el-button {
        padding: 5px 7px;
      }
    }
    .chart {
      height: 60vh;
    }
  }

  .el-tabs__item {
    box-shadow: none;
  }
  .el-tabs__item:focus.is-active.is-focus:not(:active) {
    box-shadow: none;
  }
}
</style>
