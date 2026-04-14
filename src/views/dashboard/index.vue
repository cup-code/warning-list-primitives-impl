<script>
import { getDeviceStatistics } from '@/http/dev/manage-api'
import { getAlertStatistics } from '@/http/notice/notice-api'

export default {
  data: () => ({
    loading_dev: false,
    loading_warn: false,
    allCharts: {
      chart_dev: null, // 设备统计
      chart_warn: null, // 报警统计
    },
    devInfo: {}, // 设备统计数据
    warnInfo: {}, // 报警统计数据
  }),
  mounted() {
    this.initAll()
    this.get_chart_dev()
    this.get_chart_warn()
  },
  methods: {
    // 初始化图表
    initChart(name, options) {
      this.allCharts[name] = this.$echarts.init(document.getElementById(name))
      this.allCharts[name].setOption(options)
    },
    initAll() {
      // 设备统计
      this.initChart('chart_dev', {
        color: ['#409EFF', '#909399'],
        tooltip: {
          trigger: 'item',
        },
        legend: {
          top: 0,
          data: ['在线设备', '离线设备'],
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
              { value: 0, name: '在线设备' },
              { value: 0, name: '离线设备' },
            ],
          },
        ],
      })

      // 报警统计
      this.initChart('chart_warn', {
        color: ['#409EFF', '#F56C6C'],
        tooltip: {
          trigger: 'item',
        },
        legend: {
          top: 0,
          data: ['已处理报警数', '未处理报警数'],
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
              { value: 0, name: '已处理报警数' },
              { value: 0, name: '未处理报警数' },
            ],
          },
        ],
      })
    },

    // 设置 设备统计图表
    set_chart_dev(dt) {
      this.allCharts.chart_dev.setOption({
        series: [
          {
            data: [
              { value: dt.total - dt.offline, name: '在线设备' },
              // {value: dt['alert'] || 0, name: '报警设备'},
              { value: dt.offline || 0, name: '离线设备' },
            ],
          },
        ],
      })
    },
    // 设置 报警统计图表
    set_chart_warn(dt) {
      this.allCharts.chart_warn.setOption({
        series: [
          {
            data: [
              { value: dt.total - dt.unHandled, name: '已处理报警数' },
              { value: dt.unHandled || 0, name: '未处理报警数' },
              // {value: dt['todayAlert'] || 0, name: '今日报警总数'}
            ],
          },
        ],
      })
    },

    // 获取 设备统计 数据
    get_chart_dev() {
      this.loading_dev = true
      getDeviceStatistics()
        .then((res) => {
          this.loading_dev = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.devInfo = resD.result || {}
            this.set_chart_dev(resD.result || {})
          }
          else {
            this.$message.error(msg || '查询失败!')
          }
        })
        .catch((err) => {
          this.loading_dev = false
          this.$message.error('查询失败!')
        })
    },
    // 获取 报警统计 数据
    get_chart_warn() {
      this.loading_warn = true
      getAlertStatistics()
        .then((res) => {
          this.loading_warn = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.warnInfo = resD.result || {}
            this.set_chart_warn(resD.result || {})
          }
          else {
            this.$message.error(msg || '查询失败!')
          }
        })
        .catch((err) => {
          this.loading_warn = false
          this.$message.error('查询失败!')
        })
    },
  },
}
</script>

<template>
  <div class="dashboard-home">
    <!-- 主体 -->
    <div class="statistics-body">
      <!-- 头部 -->
      <div class="body-com body-one">
        <!-- <div class="stat-box">
                    <div class="stat-title">
                        <span class="title-name">工单统计</span>
                    </div>
                    <div class="stat-con">
                        <div>
                            <span class="val">32</span>
                            <span class="name">未处理工单数</span>
                        </div>
                    </div>
                </div> -->

        <div class="stat-box">
          <div class="stat-title">
            <span class="title-name">设备统计</span>
          </div>
          <div class="stat-con">
            <div>
              <span class="val">{{ devInfo.offline || 0 }}</span>
              <span class="name">离线设备</span>
            </div>
            <div>
              <span class="val">{{ devInfo.alert }}</span>
              <span class="name">报警设备</span>
            </div>
            <div>
              <span class="val">{{ devInfo.total }}</span>
              <span class="name">设备总数</span>
            </div>
          </div>
        </div>

        <div class="stat-box">
          <div class="stat-title">
            <span class="title-name">报警统计</span>
          </div>
          <div class="stat-con">
            <div>
              <span class="val">{{ warnInfo.todayAlert || 0 }}</span>
              <span class="name">今日报警数</span>
            </div>
            <div>
              <span class="val">{{ warnInfo.unHandled || 0 }}</span>
              <span class="name">未处理报警数</span>
            </div>
            <div>
              <span class="val">{{ warnInfo.total || 0 }}</span>
              <span class="name">报警总数</span>
            </div>
          </div>
        </div>
      </div>

      <!--  第一行 -->
      <div class="body-com">
        <div class="stat-box">
          <div class="stat-title">
            <span class="title-name">设备统计</span>
          </div>

          <div
            v-loading="loading_dev"
            class="stat-con"
          >
            <div
              id="chart_dev"
              class="con-canvas"
            />
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-title">
            <span class="title-name">报警统计</span>
          </div>

          <div
            v-loading="loading_warn"
            class="stat-con"
          >
            <div
              id="chart_warn"
              class="con-canvas"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-home {
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
          background: #f2f6fc;
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
          height: 460px;
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

    .body-one {
      .stat-box {
        .stat-con {
          height: auto;
          flex-direction: row;
          padding: 20px 0;
          & > div {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            .val {
              font-size: 15px;
              font-weight: bold;
              color: #e6a23c;
              margin-bottom: 7px;
            }
            .name {
              font-size: 12px;
              color: #999;
            }
          }
        }
      }
    }
  }
}
</style>
