<script>
import {
  getAllAssetStatistics,
  getRepairByAssets,
  getRepairByAssetsType,
  getRepairCompletionRate,
} from '@/http/eam-api'

export default {
  data: () => ({
    loading_all: false,
    loading_type: false,
    loading_done: false,
    loading_bad: false,

    allCharts: {
      chart_all: null, // 汇总统计
      chart_type: null, // 报修分类
      chart_done: null, // 完工率
      chart_bad: null, // 故障次数
    },
    // 汇总统计
    all_form: {
      startDate: '',
      endDate: '',
    },
    // 报修分类
    type_form: {
      startDate: '',
      endDate: '',
    },
    // 完工率
    done_form: {
      startDate: '',
      endDate: '',
    },
    // 故障次数
    bad_form: {
      startDate: '',
      endDate: '',
    },
  }),
  mounted() {
    this.initAll()
    this.firstInit()
  },
  methods: {
    // 第一次渲染
    firstInit() {
      // 生成周期为一周的起止时间
      const endDate = +new Date()
      const startDate = endDate - 3600 * 1000 * 24 * 7 // 一周

      this.all_form.startDate = startDate
      this.all_form.endDate = endDate
      this.type_form.startDate = startDate
      this.type_form.endDate = endDate
      this.done_form.startDate = startDate
      this.done_form.endDate = endDate
      this.bad_form.startDate = startDate
      this.bad_form.endDate = endDate

      this.allFormFn()
      this.typeFormFn()
      this.badFormFn()
      this.doneFormFn()
    },
    // 初始化图表
    initChart(name, options) {
      this.allCharts[name] = this.$echarts.init(document.getElementById(name))
      this.allCharts[name].setOption(options)
    },
    initAll() {
      // 汇总统计
      this.initChart('chart_all', {
        color: ['#b68189', '#edd7a3', '#dad5d9'],
        tooltip: {
          trigger: 'item',
        },
        legend: {
          top: 0,
          data: ['维修', '保养', '巡检'],
          itemWidth: 16, // 图例颜色块的 宽度
          itemHeight: 9,
          itemGap: 15, // 图例 之间的 间隔
          inactiveColor: '#ddd', // 图例未选中时 的 颜色值 (对 图例的 颜色块和文字 都有 作用)
          textStyle: {
            fontSize: 8,
            color: '#999', // 图例选中时的 文字颜色
          },
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            height: '105%',
            avoidLabelOverlap: false,
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 6,
            },
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '20',
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              { value: 0, name: '维修' },
              { value: 0, name: '保养' },
              { value: 0, name: '巡检' },
            ],
          },
        ],
      })

      // 报修分类
      this.initChart('chart_type', {
        color: ['#b68189', '#edd7a3'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        grid: {
          height: '80%',
          left: 0,
          right: 0,
          bottom: 0,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          axisLine: {
            lineStyle: {
              color: '#c1cbd7', // 控制 x轴的 颜色
            },
          },
          axisTick: {
            show: false, // 控制 x轴 是否显示刻度
          },
          axisLabel: {
            color: '#999', // 字体颜色
            margin: 4, // x轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
          },
          data: [],
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              width: 0, // 不显示y轴轴线
              color: '#c1cbd7', // 控制 y轴的 颜色
            },
          },
          axisTick: {
            show: false, // 控制 y轴 是否显示刻度
          },
          axisLabel: {
            margin: 4, // y轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
            color: '#999', // 字体颜色
          },
          splitLine: {
            show: true, // 分割线显示与否
            lineStyle: {
              color: '#c1cbd7',
            },
          },
        },
        series: [
          {
            type: 'bar',
            barWidth: 60,
            data: [],
          },
        ],
      })

      // 完工率
      this.initChart('chart_done', {
        tooltip: {
          formatter: '{b} : {c}%',
        },
        series: [
          {
            type: 'gauge',
            radius: '100%', // 仪表盘 大小
            center: ['50%', '60%'],
            detail: {
              formatter: '{value}%',
              offsetCenter: [0, '30%'],
              fontSize: 16,
              color: '#b68189',
              fontWeight: 'bold',
            },
            axisLine: {
              lineStyle: {
                width: 50,
                color: [
                  [
                    1,
                    new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                      {
                        offset: 0.1,
                        color: '#dad5d9',
                      },
                      {
                        offset: 1,
                        color: '#b68189',
                      },
                    ]),
                  ],
                ],
              },
            },
            // 控制 大分割线 样式
            splitLine: {
              show: false,
            },
            // 控制 小分割线的 样式
            axisTick: {
              show: false,
            },
            // 控制 仪表 数字刻度的 样式
            axisLabel: {
              show: false,
            },
            // 指针样式
            pointer: {
              length: '60%', // 指针 长度
              width: 8, // 指针 宽度
            },
            // 控制标题样式
            title: {
              offsetCenter: [0, '70%'],
              fontSize: 18,
              color: '#999',
            },
            min: 0,
            max: 0,
            data: [{ value: 0, name: '完工率' }],
          },
        ],
      })

      // 故障次数
      this.initChart('chart_bad', {
        color: ['#edd7a3'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        grid: {
          height: '80%',
          left: 0,
          right: 0,
          bottom: 0,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          axisLine: {
            lineStyle: {
              color: '#c1cbd7', // 控制 x轴的 颜色
            },
          },
          axisTick: {
            show: false, // 控制 x轴 是否显示刻度
          },
          axisLabel: {
            color: '#999', // 字体颜色
            margin: 4, // x轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
          },
          data: [],
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              width: 0, // 不显示y轴轴线
              color: '#c1cbd7', // 控制 y轴的 颜色
            },
          },
          axisTick: {
            show: false, // 控制 y轴 是否显示刻度
          },
          axisLabel: {
            margin: 4, // y轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
            color: '#999', // 字体颜色
          },
          splitLine: {
            show: true, // 分割线显示与否
            lineStyle: {
              color: '#c1cbd7',
            },
          },
        },
        series: [
          {
            type: 'bar',
            barWidth: 60,
            data: [],
          },
        ],
      })
    },

    // 汇总统计 -- 查询按钮
    allFormFn() {
      this.get_chart_all()
    },
    // 报修分类 -- 查询按钮
    typeFormFn() {
      this.get_chart_type()
    },
    // 故障次数 -- 查询按钮
    badFormFn() {
      this.get_chart_bad()
    },
    // 完工率 -- 查询按钮
    doneFormFn() {
      this.get_chart_done()
    },

    // 设置 汇总统计图表
    set_chart_all(dt) {
      this.allCharts.chart_all.setOption({
        series: [
          {
            data: [
              { value: dt.REPAIR || 0, name: '维修' },
              { value: dt.MAINTENANCE || 0, name: '保养' },
              { value: dt.INSPECTION || 0, name: '巡检' },
            ],
          },
        ],
      })
    },
    // 设置 报修分类统计图表
    set_chart_type(dt) {
      const tags = []
      const d1 = []
      dt.forEach((item) => {
        tags.push(item.name)
        d1.push(item.repairCount)
      })
      this.allCharts.chart_type.setOption({
        xAxis: {
          data: tags,
        },
        series: [{ data: d1 }],
      })
    },
    // 设置 故障次数统计图表
    set_chart_bad(dt) {
      const tags = []
      const d1 = []
      dt.forEach((item) => {
        tags.push(item.name)
        d1.push(item.repairCount)
      })
      this.allCharts.chart_bad.setOption({
        xAxis: {
          data: tags,
        },
        series: [{ data: d1 }],
      })
    },
    // 设置 完工率统计图表
    set_chart_done(dt) {
      this.allCharts.chart_done.setOption({
        series: [
          {
            max: dt[1] || 0,
            data: [{ value: dt[0] || 0, name: '完工率' }],
          },
        ],
      })
    },

    // 获取 汇总统计 数据
    get_chart_all() {
      if (!this.all_form.startDate || !this.all_form.endDate) {
        this.$message.error('请选择起始时间!')
        return
      }
      this.loading_all = true
      getAllAssetStatistics(this.all_form)
        .then((res) => {
          this.loading_all = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.set_chart_all(resD.result || {})
          }
          else {
            this.$message.error(msg || '查询失败!')
          }
        })
        .catch((err) => {
          this.loading_all = false
          this.$message.error('查询失败!')
        })
    },
    // 获取 报修分类 数据
    get_chart_type() {
      if (!this.type_form.startDate || !this.type_form.endDate) {
        this.$message.error('请选择起始时间!')
        return
      }
      this.loading_type = true
      getRepairByAssetsType(this.type_form)
        .then((res) => {
          this.loading_type = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.set_chart_type(resD.result || {})
          }
          else {
            this.$message.error(msg || '查询失败!')
          }
        })
        .catch((err) => {
          this.loading_type = false
          this.$message.error('查询失败!')
        })
    },
    // 获取 故障次数 数据
    get_chart_bad() {
      if (!this.bad_form.startDate || !this.bad_form.endDate) {
        this.$message.error('请选择起始时间!')
        return
      }
      this.loading_bad = true
      getRepairByAssets(this.bad_form)
        .then((res) => {
          this.loading_bad = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.set_chart_bad(resD.result || {})
          }
          else {
            this.$message.error(msg || '查询失败!')
          }
        })
        .catch((err) => {
          this.loading_bad = false
          this.$message.error('查询失败!')
        })
    },
    // 获取 完工率 数据
    get_chart_done() {
      if (!this.done_form.startDate || !this.done_form.endDate) {
        this.$message.error('请选择起始时间!')
        return
      }
      this.loading_done = true
      getRepairCompletionRate(this.done_form)
        .then((res) => {
          this.loading_done = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.set_chart_done(resD.result || [])
          }
          else {
            this.$message.error(msg || '查询失败!')
          }
        })
        .catch((err) => {
          this.loading_done = false
          this.$message.error('查询失败!')
        })
    },
  },
}
</script>

<template>
  <div class="statistics-eam">
    <!-- 主体 -->
    <div class="statistics-body">
      <!--  第一行 -->
      <div class="body-com">
        <div class="stat-box">
          <div class="stat-title">
            <span class="title-name">汇总统计</span>
            <div class="date-range">
              <el-date-picker
                v-model="all_form.startDate"
                size="mini"
                value-format="timestamp"
                type="date"
                placeholder="选择日期"
              />
              <span class="mid">至</span>
              <el-date-picker
                v-model="all_form.endDate"
                size="mini"
                value-format="timestamp"
                type="date"
                placeholder="结束日期"
              />
            </div>
            <el-button
              icon="el-icon-search"
              size="mini"
              @click="allFormFn"
            >
              查询
            </el-button>
          </div>

          <div
            v-loading="loading_all"
            class="stat-con"
          >
            <div class="con-top">
              <span>默认时间：一周</span>
            </div>
            <div
              id="chart_all"
              class="con-canvas"
            />
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-title">
            <span class="title-name">报修分类</span>
            <div class="date-range">
              <el-date-picker
                v-model="type_form.startDate"
                size="mini"
                value-format="timestamp"
                type="date"
                placeholder="选择日期"
              />
              <span class="mid">至</span>
              <el-date-picker
                v-model="type_form.endDate"
                size="mini"
                value-format="timestamp"
                type="date"
                placeholder="结束日期"
              />
            </div>
            <el-button
              icon="el-icon-search"
              size="mini"
              @click="typeFormFn"
            >
              查询
            </el-button>
          </div>

          <div
            v-loading="loading_type"
            class="stat-con"
          >
            <div class="con-top">
              <span>默认时间：一周</span>
            </div>
            <div
              id="chart_type"
              class="con-canvas"
            />
          </div>
        </div>
      </div>

      <!--  第二行 -->
      <div class="body-com">
        <div class="stat-box">
          <div class="stat-title">
            <span class="title-name">完工率</span>
            <div class="date-range">
              <el-date-picker
                v-model="done_form.startDate"
                size="mini"
                value-format="timestamp"
                type="date"
                placeholder="开始日期"
              />
              <span class="mid">至</span>
              <el-date-picker
                v-model="done_form.endDate"
                size="mini"
                value-format="timestamp"
                type="date"
                placeholder="结束日期"
              />
            </div>
            <el-button
              icon="el-icon-search"
              size="mini"
              @click="doneFormFn"
            >
              查询
            </el-button>
          </div>

          <div
            v-loading="loading_done"
            class="stat-con"
          >
            <div class="con-top">
              <span>默认时间：一周</span>
            </div>
            <div
              id="chart_done"
              class="con-canvas"
            />
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-title">
            <span class="title-name">故障次数</span>
            <div class="date-range">
              <el-date-picker
                v-model="bad_form.startDate"
                size="mini"
                value-format="timestamp"
                type="date"
                placeholder="开始日期"
              />
              <span class="mid">至</span>
              <el-date-picker
                v-model="bad_form.endDate"
                size="mini"
                value-format="timestamp"
                type="date"
                placeholder="结束日期"
              />
            </div>
            <el-button
              icon="el-icon-search"
              size="mini"
              @click="badFormFn"
            >
              查询
            </el-button>
          </div>

          <div
            v-loading="loading_bad"
            class="stat-con"
          >
            <div class="con-top">
              <span>默认时间：一周</span>
            </div>
            <div
              id="chart_bad"
              class="con-canvas"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.statistics-eam {
  position: relative;
  padding: 10px;
  .statistics-body {
    position: relative;
    .body-com {
      display: flex;
      padding-top: 10px;
      &:first-child {
        padding-top: 0;
      }
      .stat-box {
        border: 1px solid #eee;
        flex: 1;
        overflow: hidden;
        margin-right: 10px;
        &:last-child {
          margin: 0;
        }
        background: #fff;
        box-shadow: 0px 2px 4px 0px rgba(217, 217, 217, 0.62);
        &:hover {
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.9);
          border-color: #eee;
        }
        .stat-title {
          background: #eee;
          padding: 10px;
          border-bottom: 1px solid #f2f5f8;
          display: flex;
          align-items: center;
          .title-name {
            font-size: 12px;
            font-weight: bold;
            color: #666;
          }
          .date-range {
            color: #999;
            margin: 0 5px 0 10px;
            .mid {
              margin: 0 5px;
            }
          }
          .el-input {
            width: 105px;
            input {
              font-size: 12px;
              // background: #f3f3f3;
              border: none;
              padding: 0 20px;
            }
            .el-input__prefix {
              .el-input__icon {
                text-align: left;
              }
            }
            .el-input__suffix {
              .el-input__icon {
                text-align: right;
              }
            }
          }
        }
        .stat-con {
          padding: 10px;
          display: flex;
          flex-direction: column;
          height: 260px;
          .con-top {
            word-break: keep-all;
            white-space: nowrap;
            overflow: auto;
            color: #999;
            transform-origin: 0;
            transform: scale(0.8);
            width: 125%;

            // chrome浏览器隐藏滚动条
            &::-webkit-scrollbar {
              display: none;
            }
            // 火狐浏览器的滚动条隐藏
            scrollbar-width: none;

            & > span {
              margin-right: 5px;
            }
          }
          .con-canvas {
            flex: 1;
            overflow: hidden;
          }
        }
      }
    }
  }
}
</style>
