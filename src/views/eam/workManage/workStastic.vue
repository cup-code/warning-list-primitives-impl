<script>
import { getWorkStatistics } from '@/http/workmanage/work-api.js'

export default {
  data() {
    return {
      form: {
        year: `${new Date().getFullYear()}`,
      },
      typeList: [],
      allCharts: {
        chart_status: null, // 工单状态统计
        chart_back: null, // 工单回执占比统计
      },
    }
  },
  mounted() {
    this.initAll()
    this.getDataList()
  },
  methods: {
    async getDataList() {
      const { data } = await getWorkStatistics(this.form)
      console.log('data: ', data)
      if (data.code === 200) {
        this.typeList = data.result.groupByDepart
        this.set_chart_status(data.result.orderStatusStatistics)
        this.set_chart_back(data.result.groupByStatus)
      }
      else {
        this.$message.error(data.message || '查询失败')
        this.typeList = []
        this.set_chart_status([])
        this.set_chart_back([])
      }
    },
    // 重置
    resetFn() {
      this.form = {}
      this.getDataList()
    },
    // 初始化图表
    initChart(name, options) {
      this.allCharts[name] = this.$echarts.init(document.getElementById(name))
      this.allCharts[name].setOption(options)
    },
    initAll() {
      // 工单状态统计
      this.initChart('chart_status', {
        color: ['#0069b9', '#9cc5f9'],
        legend: {
          top: 0,
          data: ['工单数量', '未处理工单'],
          itemWidth: 16, // 图例颜色块的 宽度
          itemHeight: 9,
          itemGap: 15, // 图例 之间的 间隔
          inactiveColor: '#ddd', // 图例未选中时 的 颜色值 (对 图例的 颜色块和文字 都有 作用)
          textStyle: {
            fontSize: 10,
            color: '#111', // 图例选中时的 文字颜色
          },
        },
        grid: {
          height: '90%',
          left: '0%',
          right: '0%',
          bottom: '3%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            crossStyle: {
              color: '#999',
            },
          },
        },
        xAxis: {
          type: 'category',
          splitNumber: 6,
          axisLine: {
            lineStyle: {
              color: '#474d55', // 控制 x轴的 颜色
            },
          },
          axisTick: {
            show: true, // 控制 x轴 是否显示刻度
          },
          axisLabel: {
            margin: 3, // x轴 与 刻度值 的 间距
            fontSize: 10, // 刻度字体大小
          },
          data: [],
        },
        yAxis: [
          {
            type: 'value',
            axisLabel: {
              formatter: '{value}',
              margin: 4, // y轴 与 刻度值 的 间距
              fontSize: 8, // 刻度字体大小
            },
            axisLine: {
              show: false,
              lineStyle: {
                color: '#474d55', // 控制 y轴的 颜色
              },
            },
            axisTick: {
              show: false, // 控制 y轴 是否显示刻度
            },
            splitLine: {
              show: true, // 分割线显示与否
              lineStyle: {
                color: '#ccc',
              },
            },
          },
        ],
        series: [
          {
            name: '工单数量',
            type: 'bar',
            barMaxWidth: '26%',
            itemStyle: {
              borderRadius: [3, 3, 0, 0],
            },
            data: [],
          },
          {
            name: '未处理工单',
            type: 'bar',
            barMaxWidth: '26%',
            itemStyle: {
              borderRadius: [3, 3, 0, 0],
            },
            data: [],
          },
        ],
      })

      // 工单回执占比统计
      this.initChart('chart_back', {
        color: ['#9cc5f9', '#0069b9'],
        tooltip: {
          trigger: 'item',
        },
        legend: {
          top: 0,
          data: ['未处理工单', '待处理工单'],
          itemWidth: 16, // 图例颜色块的 宽度
          itemHeight: 9,
          itemGap: 15, // 图例 之间的 间隔
          inactiveColor: '#fff', // 图例未选中时 的 颜色值 (对 图例的 颜色块和文字 都有 作用)
          textStyle: {
            fontSize: 8,
            color: '#999', // 图例选中时的 文字颜色
          },
        },
        series: [
          {
            type: 'pie',
            height: '100%',
            labelLine: {
              show: false,
            },
            label: {
              position: 'inner',
              fontSize: 14,
              formatter(param) {
                return `${param.name}\n\n${param.value}个`
              },
            },
            data: [],
          },
        ],
      })
    },
    set_chart_status(dt) {
      const tags = []
      const d1 = []
      const d2 = []
      dt.forEach((item) => {
        tags.push(item.departmentName)
        d1.push(item.orderTotal)
        d2.push(item.todoOrderTotal)
      })
      this.allCharts.chart_status.setOption({
        xAxis: {
          data: tags,
        },
        series: [{ data: d1 }, { data: d2 }],
      })
    },
    set_chart_back(dt) {
      this.allCharts.chart_back.setOption({
        series: [
          {
            data: dt.map(item => ({
              value: item.amount,
              name: item.groupName,
            })),
          },
        ],
      })
    },
  },
}
</script>

<template>
  <div class="stat-fireControl">
    <div class="rightCon">
      <!-- 查询条件 -->
      <el-form
        :model="form"
        label-width="40px"
        class="searchForm"
      >
        <el-row>
          <el-col :span="7">
            <el-form-item
              label="年份"
              prop="year"
            >
              <el-date-picker
                v-model="form.year"
                style="width: 100%"
                type="year"
                placeholder="年份"
                format="yyyy"
                value-format="yyyy"
              />
            </el-form-item>
          </el-col>
          <el-col
            :span="7"
            style="padding-left: 10px"
          >
            <el-form-item
              label="月份"
              prop="month"
            >
              <el-date-picker
                v-model="form.month"
                popper-class="diyMonPicker"
                style="width: 100%"
                type="month"
                placeholder="月份"
                format="MM"
                value-format="MM"
              />
            </el-form-item>
          </el-col>

          <!-- 按钮 -->
          <el-col
            :span="10"
            style="padding-left: 10px"
          >
            <el-button
              type="primary"
              icon="el-icon-search"
              @click="getDataList"
            >
              查询
            </el-button>
            <!-- <el-button icon="el-icon-refresh-right" @click="resetFn">重置</el-button> -->
          </el-col>
        </el-row>
      </el-form>

      <div class="main-box">
        <div class="top-info">
          <div
            v-for="(item, key) in typeList"
            :key="key"
            class="comm-item"
          >
            <span>{{ item.groupName }}:</span>
            <span>{{ item.amount }}个</span>
          </div>
        </div>

        <div class="chart-box">
          <div
            class="chart-item"
            style="flex: 2"
          >
            <div class="stat-title">
              <span class="title-name font-bold">工单状态统计</span>
            </div>

            <div class="stat-con">
              <div
                id="chart_status"
                class="con-canvas"
              />
            </div>
          </div>
          <div
            class="chart-item"
            style="flex: 1"
          >
            <div class="stat-title">
              <span class="title-name font-bold">工单处理占比统计</span>
            </div>

            <div class="stat-con">
              <div
                id="chart_back"
                class="con-canvas"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.stat-fireControl {
  height: calc(100vh - 50px);
  padding: 10px;
  background: #f3f7f9;
  display: flex;
  .leftCon {
    width: 200px;
    height: 100%;
    .leftTree .el-card {
      display: flex;
      flex-direction: column;
    }
  }
  .rightCon {
    flex: 1;
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    .searchForm {
      margin-bottom: 10px;
      padding: 10px 8px 0 10px;
      background: #fff;
      border-radius: 6px;
      overflow: hidden;
    }
    .main-box {
      background: #fff;
      flex: 1;
      overflow: hidden;
      padding: 10px;
      display: flex;
      flex-direction: column;
      border-radius: 6px;
      overflow: hidden;
      .top-info {
        width: 100%;
        display: flex;
        overflow: auto;
        .comm-item {
          flex-shrink: 0;
          padding: 10px;
          font-size: 16px;
          display: flex;
          font-weight: 400;
          position: relative;
          & > span:nth-child(2) {
            align-self: flex-end;
            margin-left: 4px;
            color: var(--ky-primary);
          }

          &::after {
            content: '';
            width: 1px;
            height: 40%;
            position: absolute;
            top: 50%;
            right: 0;
            transform: translateY(-50%);
            background-color: var(--ky-border-color);
          }
          &:last-child {
            &::after {
              display: none;
            }
          }
        }
      }
      .chart-box {
        padding: 10px;
        display: flex;
        overflow: hidden;
        flex: 1;
        .chart-item {
          border: 1px solid var(--ky-border-color);
          flex: 1;
          overflow: hidden;
          margin-right: 14px;
          // display: flex;
          // flex-direction: column;
          border-radius: 6px;
          overflow: hidden;
          &:last-child {
            margin: 0;
          }
          background: #fff;
          // box-shadow: 0px 2px 4px 0px rgba(217, 217, 217, 0.62);
          .stat-title {
            background: #f7fbff;
            padding: 10px;
            border-bottom: 1px solid #f2f5f8;
            display: flex;
            align-items: center;
            .title-name {
              font-size: 12px;
              color: #222;
            }
          }
          .stat-con {
            flex: 1;
            padding: 10px 16px;
            display: flex;
            flex-direction: column;
            .con-canvas {
              // height: 100%;
              height: 480px;
            }
          }
        }
      }
    }
  }
}
.diyMonPicker {
  .el-date-picker__header {
    display: none;
  }
}
</style>
