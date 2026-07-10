<script>
import LivePlayer from '@liveqing/liveplayer'
import EZUIKit from 'ezuikit-js'
import {
  getCameraUrl,
  getCameraUrlHk,
  getIoTrendHis,
  getIoTrendReal,
  getRealDataById,
  setDevIoVal,
} from '@/http/dev/manage-api'
import { formatDate } from '@/utils'

export default {
  components: { LivePlayer },
  props: ['pid', 'did', 'dcd'],
  data: () => ({
    isCamera: false, // 是否是摄像头设备
    cameraType: '0', // '0'是萤石云； '1'是海康
    loading: false,
    tableData: [],
    typeList: [],
    drawer: false,
    form: {},
    rules: {},
    submitLoading: false,

    drawer_et: false,
    drawer_et_title: '实时趋势',
    drawer_et_type: 0, // 默认实时
    allCharts: {
      chart_real: null, // 实时
      chart_his: null, // 历史
    },
    inter: null,

    drawer_play: false, // 摄像头播放滑框
    drawer_play_title: '摄像头监控',
    ezVideo: null, // 记录 EZUIKitPlayer实例
    valueCopy: 0,
    sDate: '',
    pickerOptions: {
      shortcuts: [
        {
          text: '今天',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            picker.$emit('pick', [start, end])
          },
        },
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
    icd: '', // 测点编码
    sForm: {
      page: 1,
      pageSize: 12,
    },
    total: 0,
    lpUrl: '', // livePlayer视频播放地址
    switchStates: new Map(), // 用于存储每个测点的开关状态
  }),
  created() {
    this.getDataList()
    this.getPrefix()
    this.typeList = this.$dictUtils?.getDictList('output_type') || []
    this.initSwitchStates()
  },
  methods: {
    formatDate,
    getDataList() {
      this.loading = true
      getRealDataById(this.pid, this.did, this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message

          if (resD.code !== 201 && resD.code !== 301) {
            this.isCamera = false
          }
          else {
            this.isCamera = true
            this.cameraType = resD.code === 301 ? '1' : '0'
          }

          if (resD.success && resD.result) {
            const oData = resD.result.list || []
            this.total = resD.result.total
            this.fixDataFn(oData)
          }
          else {
            this.$message.error(msg || '获取 实时测点数据 失败')
          }
        })
        .catch(() => {
          this.loading = false
          this.$message.error('获取 实时测点数据 失败')
        })
    },
    fixDataFn(dt) {
      this.tableData = dt.map((item) => {
        this.typeList.forEach((v) => {
          if (v.dictCode === item.type) {
            item.typeStr = v.dictName
          }
        })

        if (item.varType === 4) {
          item.valueCopy = Number(item.value) === 1
        }

        return item
      })
    },
    // 写值
    writeFn(v) {
      this.form = JSON.parse(JSON.stringify(v))
      this.drawer = true
    },
    submitFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true
        const params = {
          pid: this.pid,
          did: this.did,
          ioCode: this.form.code,
          value: this.form.value,
        }
        setDevIoVal(params)
          .then((res) => {
            this.submitLoading = false
            const resD = res.data
            const msg = resD.message
            if (resD.success) {
              this.$message.success(msg || '写值成功')
              this.drawer = false
              this.getDataList()
            }
            else {
              this.$message.error(msg || '写值失败')
            }
          })
          .catch((err) => {
            this.submitLoading = false
            this.$message.error('写值失败')
          })
      })
    },
    refreshFn() {
      this.getDataList()
    },
    // 历史趋势、实时趋势 按钮
    chartFn(v, code) {
      this.icd = code // 记录测点编码（历史趋势 选择时间时用到）
      this.drawer_et = true
      this.drawer_et_type = v
      this.drawer_et_title = !v ? `实时趋势 -- ${code}` : `历史趋势 -- ${code}`
      this.$nextTick(() => {
        // 实时
        if (!v) {
          this.genRealChart(code)
        }
        // 历史
        else {
          this.sDate = [+new Date() - 3600 * 1000 * 24 * 30, +new Date()] // 默认时间周期是 一月
          this.genHisChart(code)
        }
      })
    },
    // echarts抽屉 关闭事件
    etCloseFn() {
      if (this.inter) {
        clearInterval(this.inter)
        this.inter = null
      }
    },

    // 初始化图表
    initChart(name, options) {
      this.allCharts[name] = this.$echarts.init(document.getElementById(name))
      this.allCharts[name].setOption(options)
    },
    // 加载实时图表
    genRealChart(code) {
      // 初始化图表
      this.initChart('chart_real', {
        grid: {
          height: '90%',
          left: '3%',
          right: '4%',
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
            data: [],
          },
        ],
      })

      // 请求数据 && 填入图表
      const oData = []
      let temp
      this.inter = setInterval(() => {
        getIoTrendReal(this.dcd, code).then((res) => {
          const resD = res.data
          if (resD.success) {
            temp = resD.result || {}
            temp.xName = +new Date()
            oData.push(temp)
            this.fillRealChart(oData)
          }
        })
      }, 1000)
    },
    // 加载历史图表
    genHisChart(code) {
      // 初始化图表
      this.initChart('chart_his', {
        grid: {
          height: '90%',
          left: '3%',
          right: '4%',
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
      })

      const params = {
        dcd: this.dcd,
        icd: code,
        startDate: this.sDate[0],
        endDate: this.sDate[1],
      }
      // 请求数据 并 填入图表
      getIoTrendHis(params).then((res) => {
        const resD = res.data
        if (resD.success) {
          const oData = resD.result || []
          this.fillHisChart(oData) // 回填历史图表
        }
      })
    },
    // 回填历史图表
    fillHisChart(dt) {
      const tags = []
      const vals = []
      dt.forEach((item) => {
        tags.push(item.eventDate)
        vals.push(item.value)
      })

      this.allCharts.chart_his.setOption({
        xAxis: {
          data: tags,
        },
        series: [{ data: vals }],
      })
    },
    // 回填实时图表
    fillRealChart(dt) {
      const tags = []
      const vals = []
      dt.forEach((item) => {
        tags.push(formatDate(+item.xName))
        vals.push({ name: item.eventDate, value: item.value })
      })

      this.allCharts.chart_real.setOption({
        xAxis: {
          data: tags,
        },
        series: [{ data: vals }],
      })
    },

    // 播放按钮
    playFn(v) {
      this.drawer_play_title = `摄像头 --- ${v.name}`
      this.drawer_play = true

      // 萤石云
      if (this.cameraType === '0') {
        getCameraUrl(this.did, v.code).then((res) => {
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.initPlayer(resD.result || {})
          }
          else {
            this.$message.error(msg || '获取地址失败')
          }
        })
      }
      // 海康
      else if (this.cameraType === '1') {
        getCameraUrlHk(this.did, v.code).then((res) => {
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.initPlayer(resD.result || {})
          }
          else {
            this.$message.error(msg || '获取地址失败')
          }
        })
      }
    },
    initPlayer(info) {
      // 使用ezuikit萤石播放器
      if (this.cameraType === '0') {
        this.ezVideo = new EZUIKit.EZUIKitPlayer({
          autoplay: true,
          id: 'ezuikit_video',
          accessToken: info.accessToken,
          url: info.url,
          template: 'standard', // simple - 极简版;  standard-标准版;  security - 安防版(预览回放);  voice-语音版；
          audio: 1, // 是否默认开启声音 0 - 关闭 1 - 开启
        })
      }
      // 使用livePlayer播放器
      else if (this.cameraType === '1') {
        this.lpUrl = info.url
      }
    },

    // switch change事件
    switchFn(eventValue, row) {
      const params = {
        pid: this.pid,
        did: this.did,
        ioCode: row.code,
        value: Number(eventValue),
      }

      // 保存之前的状态，以便失败时回滚
      const previousValue = row.valueCopy

      // 先更新 UI
      row.valueCopy = eventValue

      setDevIoVal(params)
        .then((res) => {
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.$message.success(msg || '写值成功')
            // 成功后不需要刷新整个列表，只需要更新当前行的值
            row.value = eventValue
            setTimeout(() => {
              this.getDataList()
            }, 200)
          }
          else {
            // 失败时回滚状态
            row.valueCopy = previousValue
            this.$message.error(msg || '写值失败')
          }
        })
        .catch(() => {
          // 失败时回滚状态
          row.valueCopy = previousValue
          this.$message.error('写值失败')
        })
    },

    // 时间选择器
    dateChange(v) {
      if (!v)
        return

      const params = {
        dcd: this.dcd,
        icd: this.icd,
        startDate: v[0],
        endDate: v[1],
      }
      // 请求数据 并 填入图表
      getIoTrendHis(params).then((res) => {
        const resD = res.data
        if (resD.success) {
          const oData = resD.result || []
          this.fillHisChart(oData) // 回填历史图表
        }
      })
    },
    pageSizeFn(v) {
      this.sForm.page = 1
      this.sForm.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    searchFn() {
      this.sForm.page = 1
      this.getDataList()
    },
    handleSwitchChange(row) {
      const key = row.measureCode // 或其他能唯一标识测点的字段
      const currentState = this.switchStates.get(key) ?? false
      this.switchStates.set(key, !currentState)

      // 这里可以添加调用后端 API 的逻辑
      this.updatePointState(row, !currentState)
    },
    async updatePointState(row, state) {
      try {
        // 调用后端 API 更新状态
        // const response = await updatePointState({
        //   measureCode: row.measureCode,
        //   state: state
        // })

        // 如果后端更新成功，保持新状态
        this.$message.success('状态更新成功')
      }
      catch (error) {
        // 如果失败，回滚状态
        this.switchStates.set(row.measureCode, !state)
        this.$message.error('状态更新失败')
      }
    },
    initSwitchStates() {
      // 假设你的表格数据在 tableData 中
      this.tableData.forEach((row) => {
        // 根据后端返回的状态初始化
        this.switchStates.set(row.measureCode, row.state === 1) // 假设 1 代表开启状态
      })
    },
  },
}
</script>

<template>
  <div class="point-template">
    <el-row>
      <el-col :span="18">
        <el-form
          ref="searchForm"
          size="small"
          :inline="true"
          :model="sForm"
          @keyup.enter.native="searchFn()"
          @submit.native.prevent
        >
          <el-form-item prop="ioName">
            <el-input
              v-model="sForm.ioName"
              size="small"
              placeholder="测点名称"
              clearable
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="small"
              icon="el-icon-search"
              @click="searchFn()"
            >
              查询
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col :span="6" style="text-align: right">
        <el-button size="mini" type="warning" @click="refreshFn">
          刷新
        </el-button>
      </el-col>
    </el-row>

    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <!-- 非摄像头设备 的 测点 -->
        <el-table
          v-if="!isCamera"
          v-loading="loading"
          class="point-table"
          :data="tableData"
          border
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: 'var(--ky-head-color)' }"
        >
          <el-table-column label="测点图片" prop="icon" align="center">
            <template slot-scope="props">
              <div style="display: flex; align-items: center; justify-content: center">
                <img
                  v-if="props.row.icon"
                  :src="filePrefix + props.row.icon"
                  style="height: 30px"
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column label="测点编码" prop="code" align="center" />
          <el-table-column label="测点名称" prop="name" align="center" />
          <el-table-column label="测点值" prop="value" align="center" />
          <el-table-column label="测点值单位" prop="unit" align="center" />
          <el-table-column label="测点类型" prop="typeStr" align="center" />
          <el-table-column label="事件时间" prop="eventDate" align="center">
            <template slot-scope="props">
              {{ formatDate(props.row.eventDate) }}
            </template>
          </el-table-column>
          <el-table-column label="接收时间" prop="receivedDate" align="center">
            <template slot-scope="props">
              {{ formatDate(props.row.receivedDate) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="230">
            <template slot-scope="props">
              <el-button
                v-if="props.row.writable && props.row.varType !== 4"
                size="mini"
                type="primary"
                @click="writeFn(props.row)"
              >
                写值
              </el-button>
              <el-switch
                v-if="props.row.writable && props.row.varType === 4"
                v-model="props.row.valueCopy"
                style="margin-right: 10px"
                @change="(value) => switchFn(value, props.row)"
              />
              <el-button size="mini" type="success" @click="chartFn(0, props.row.code)">
                实时趋势
              </el-button>
              <el-button size="mini" type="warning" @click="chartFn(1, props.row.code)">
                历史趋势
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 摄像头设备的 测点 -->
        <el-table
          v-if="isCamera"
          v-loading="loading"
          class="point-table"
          :data="tableData"
          border
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: 'var(--ky-head-color)' }"
        >
          <el-table-column label="摄像头图片" prop="icon" align="center">
            <template slot-scope="props">
              <div style="display: flex; align-items: center; justify-content: center">
                <img
                  v-if="props.row.icon"
                  :src="filePrefix + props.row.icon"
                  style="height: 30px"
                >
              </div>
            </template>
          </el-table-column>
          <el-table-column label="摄像头名称" prop="name" align="center" />
          <el-table-column label="摄像头code" prop="code" align="center" />
          <el-table-column label="操作" align="center" width="230">
            <template slot-scope="props">
              <el-button size="mini" type="success" @click="playFn(props.row)">
                播放
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <!-- 页码 -->
    <el-row>
      <el-pagination
        style="text-align: right"
        :current-page="sForm.page"
        :page-sizes="[12, 24, 60]"
        :page-size="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </el-row>

    <!-- 写值 抽屉 -->
    <el-drawer :visible.sync="drawer" :with-header="false">
      <!-- 标题 -->
      <div class="drawer-title">
        写值
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="form"
          :model="form"
          label-width="50px"
          :rules="rules"
          size="mini"
        >
          <el-form-item :label="form.code" prop="value">
            <el-input v-model="form.value" />
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="submitFn"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- echarts 抽屉 -->
    <el-drawer
      :visible.sync="drawer_et"
      :with-header="false"
      size="35%"
      @close="etCloseFn"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        {{ drawer_et_title }}
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <!-- tabindex 可以解决打开抽屉时 自动聚焦 -->
      <div class="drawer-con" tabindex="0">
        <!-- 实时 -->
        <div v-if="!drawer_et_type" id="chart_real" style="height: 40%" />

        <!-- 历史 -->
        <el-form v-if="drawer_et_type" label-width="60px" size="mini" inline>
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
        <div v-if="drawer_et_type" id="chart_his" style="height: 40%" />
      </div>
    </el-drawer>

    <!-- 萤石ezuikit 播放抽屉 -->
    <el-drawer :visible.sync="drawer_play" :with-header="false" size="35%">
      <!-- 标题 -->
      <div class="drawer-title">
        {{ drawer_play_title }}
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <!-- 加v-if, 可以解决再次打开时ezuikit_video内加载了多个video,始终保持ezuikit_video内只有一个video -->
        <!-- 采用v-if方式，是因为没有找到萤石播放器的销毁方法 (如果有的话，可以在抽屉的关闭事件中，进行销毁) -->
        <div
          v-if="drawer_play && cameraType === '0'"
          id="ezuikit_video"
          style="width: 100%; height: 60%"
        />

        <LivePlayer
          v-if="drawer_play && cameraType === '1'"
          :videoUrl="lpUrl"
          fluent
          autoplay
          live
          stretch
        />
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.point-template {
  .mid-con {
    // padding: 15px 0;
    .point-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
