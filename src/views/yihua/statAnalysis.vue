<script>
import { getDeviceGroup } from '@/http/dev/group-api'
import {
  exportStatDataExcel,
  getDevList,
  getDevStatData,
} from '@/http/yihua-api'
import AutoTable from './extends/AutoTable'
import headersMap from './extends/headersMap.json'

export default {
  components: { AutoTable },
  data: () => ({
    drop: true, // 搜索条件框是否展开
    radio_detect: 1, // 控制 监测数据的 表格和曲线切换： 1是表格, 2是曲线
    sForm: {
      deviceType: 1, // 默认选中 废水
      dataType: 1, // 默认选中 日数据
      statType: '1', // 默认选中 检测数据 （1:检测数据；2:超标记录）
    },
    sDate: '',
    tableHeaders: [], // 表格的表头
    tableData: [], // 表格数据
    allCharts: {
      chart_det: null, // 监测图表
    },
    comList: [],
    devTypeList: [
      { name: '废水', value: 1 },
      { name: '废气', value: 2 },
    ],
    devList: [],
    dataTypeList: [
      { name: '日数据', value: 1 },
      { name: '月数据', value: 2 },
      { name: '季数据', value: 3 },
      { name: '年数据', value: 4 },
    ],
  }),
  computed: {
    pickerType() {
      let res = ''
      switch (this.sForm.dataType) {
        case 2:
        case 3:
          res = 'month'
          break
        case 4:
          res = 'year'
          break
        default:
          res = 'date'
          break
      }
      return res
    },
  },
  watch: {
    // 监听 监测数据/超标记录 tab切换
    'sForm.statType': function (newVal) {
      if (!this.sForm.did)
        return
      if (newVal) {
        this.getDataList()
      }
    },
    // 监听排放口， 如果为空， 则清除 表格数据
    'sForm.did': function (v) {
      if (!v) {
        this.tableData = []
        this.tableHeaders = []
      }
    },
    // 监听 监测数据的 表格/图表 的切换
    radio_detect(v) {
      if (v === 1)
        return
      this.$nextTick(() => {
        this.initChart_det()
      })
    },
    // 监听 列表数据变化，同步更新echarts图表
    tableData(newData) {
      if (this.radio_detect === 2 && newData.length) {
        this.initChart_det()
      }
    },
  },
  created() {
    this.getComList() // 获取企业列表
  },
  methods: {
    getDataList() {
      getDevStatData(this.sForm).then((res) => {
        const resD = res.data
        let tarStr = ''
        let dt = []
        if (resD.success) {
          if (resD.result) {
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
      this.tableHeaders = headersMap.filter(
        item => tarStr.includes(`${item.prop},`),
      )
      // 生成数据
      this.tableData = dt
    },
    // 获取企业列表（调 设备分组��口）
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
    // 初始化 监测图表
    initChart_det() {
      // 如果没有数据， 则清空
      if (this.tableData.length === 0) {
        this.allCharts.chart_det && this.allCharts.chart_det.clear()
        return
      }
      // 初始化 监测图表
      this.initChart('chart_det', {
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
          data: this.genSeriesDet()[0],
        },
        series: this.genSeriesDet()[1],
      })
    },
    // 生成 监测图表legend和series
    genSeriesDet() {
      const legends = []
      const series = []
      let str
      let temp
      this.tableHeaders
        .filter(f => f.label !== '时间')
        .forEach((item) => {
          (item.det || []).forEach((h) => {
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

    // 导出excel (监测数据、超标记录)
    exportExc() {
      exportStatDataExcel(this.sForm)
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
        .catch((error) => {
          console.error('Export failed:', error)
          this.$message.error('导出excel失败')
        })
    },
  },
}
</script>

<template>
  <div class="statAnalysis-yihua">
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
            <el-form-item label="数据类型">
              <el-select
                v-model="sForm.dataType"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in dataTypeList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                >
                  <span>{{ item.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="时间">
              <el-date-picker
                v-model="sDate"
                style="width: 100%"
                size="mini"
                value-format="timestamp"
                :type="pickerType"
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
              {{ drop ? "收起" : "展开" }}
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
    <el-tabs v-model="sForm.statType">
      <!-- 监测数据 -->
      <el-tab-pane label="监测数据" name="1">
        <!-- 按钮 -->
        <el-row type="flex" align="middle">
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
            <el-radio-group v-model="radio_detect" style="margin-left: 20px">
              <el-radio :label="1" style="margin-right: 15px">
                表格
              </el-radio>
              <el-radio :label="2" style="margin-left: 0">
                曲线
              </el-radio>
            </el-radio-group>
          </el-col>
        </el-row>

        <!-- 表格 -->
        <el-row v-if="radio_detect === 1 && sForm.statType == 1" class="mid-con">
          <el-col :span="24">
            <auto-table
              :headers="tableHeaders"
              :data="tableData"
              dtType="det"
            />
          </el-col>
        </el-row>

        <!-- 曲线 -->
        <el-row v-else class="mid-con">
          <div id="chart_det" class="chart" />
        </el-row>
      </el-tab-pane>

      <!-- 超标记录 -->
      <el-tab-pane label="超标记录" name="2">
        <!-- 按钮 -->
        <el-row type="flex" align="middle">
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
          </el-col>
        </el-row>

        <!-- 表格 -->
        <el-row v-if="sForm.statType == 2" class="mid-con">
          <el-col :span="24">
            <auto-table
              :headers="tableHeaders"
              :data="tableData"
              dtType="det"
            />
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
.statAnalysis-yihua {
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

.your-class {
  color: $menuText;
}
</style>
