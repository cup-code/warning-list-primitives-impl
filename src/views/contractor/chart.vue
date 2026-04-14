<script>
import moment from 'moment'
import {
  getContractorAqEduStat,
  getContractorDataCount,
  getContractorWorkTicket,
  getCountBookingsStatistics,
  getCountContractorStatus,
  getIncentiveExamineCount,
  getIncentiveExamineStatistics,
} from '@/http/contractor-api'
import ContractorTree from './coms/ContractorTree.vue'

export default {
  components: {
    ContractorTree,
  },
  data() {
    return {
      form: {},
      allCharts: {
        chart_card: null, // 红黄绿牌
        chart_score: null, // 合格、不合格、黑名单
        chart_et: null, // 考试、培训
      },
      data: [],
      dataCount: {},
      user: JSON.parse(sessionStorage.getItem('user')),
    }
  },
  mounted() {
    this.initAll()
    this.getDataList()
  },
  methods: {
    async getDataList() {
      const deptId = this.form.departmentId || this.user.departmentId

      const { data: conDt } = await getContractorDataCount(deptId)
      const { data: bookDt } = await getCountBookingsStatistics(deptId)
      const { data: statDt } = await getCountContractorStatus(deptId)
      const { data: workDt } = await getContractorWorkTicket(this.form.departmentId)

      // 培训考试次数
      const { data: trainDt } = await getContractorAqEduStat(deptId)

      // 近一月三违考核数量
      const endDate = moment(new Date()).format('YYYY-MM-DD')
      const startDate = moment(+new Date() - 86400000 * 30).format('YYYY-MM-DD')
      const { data: incDt } = await getIncentiveExamineCount({
        comDepId: this.user.companyDepartmentId,
        startDate,
        endDate,
      })

      // 三违排行榜
      const { data: threeDt } = await getIncentiveExamineStatistics(this.user.companyId)

      if (conDt.code === 200) {
        Object.assign(this.dataCount, conDt.result || {})
      }
      if (workDt.code === 200) {
        Object.assign(this.dataCount, workDt.result || {})
      }
      if (bookDt.code === 200) {
        this.set_chart_card(bookDt.result || [])
      }
      if (statDt.code === 200) {
        this.set_chart_score(statDt.result || [])
      }
      if (trainDt.code === 200) {
        this.set_chart_et(trainDt.result || [])
      }
      if (incDt.code === 200) {
        Object.assign(this.dataCount, { threeNum: incDt.result || 0 })
      }
      if (threeDt.code === 200) {
        this.data = threeDt.result.list || []
      }
    },
    treeNodeTap(data) {
      if (data) {
        this.form.departmentId = data.id
      }
      else {
        delete this.form.departmentId
      }
      this.getDataList()
    },
    // 初始化图表
    initChart(name, options) {
      this.allCharts[name] = this.$echarts.init(document.getElementById(name))
      this.allCharts[name].setOption(options)
    },
    initAll() {
      // 红黄绿牌
      this.initChart('chart_card', {
        color: ['#46bc15', '#fffa1a', '#ef0023'],
        tooltip: {
          trigger: 'item',
        },
        series: [
          {
            type: 'pie',
            height: '100%',
            radius: ['40%', '70%'],
            labelLine: {
              show: true,
              length: 5,
              length2: 10,
            },
            label: {
              show: true,
              fontSize: 10,
              color: '#000',
              formatter(param) {
                return `${param.name}\n${param.value}`
              },
            },
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            data: [
              { name: '绿牌承包商', value: 0 },
              { name: '黄牌承包商', value: 0 },
              { name: '红牌承包商', value: 0 },
            ],
          },
        ],
      })

      // 合格、不合格、黑名单
      this.initChart('chart_score', {
        color: ['#1d5fef', '#7f38d6', '#000'],
        tooltip: {
          trigger: 'item',
        },
        series: [
          {
            type: 'pie',
            height: '100%',
            labelLine: {
              show: true,
              length: 5,
              length2: 10,
            },
            label: {
              show: true,
              fontSize: 10,
              color: '#000',
              formatter(param) {
                return `${param.name}\n${param.value}`
              },
            },
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            data: [
              { name: '合格承包商', value: 0 },
              { name: '不合格承包商', value: 0 },
              { name: '黑名单承包商', value: 0 },
            ],
          },
        ],
      })

      // 考试培训
      this.initChart('chart_et', {
        color: ['#1d5fef', '#72a6f8'],
        legend: {
          top: 0,
          data: ['承包商人员考试次数', '承包商人员培训次数'],
          itemWidth: 16, // 图例颜色块的 宽度
          itemHeight: 9,
          itemGap: 15, // 图例 之间的 间隔
          inactiveColor: '#ddd', // 图例未选中时 的 颜色值 (对 图例的 颜色块和文字 都有 作用)
          textStyle: {
            fontSize: 8,
            color: '#999', // 图例选中时的 文字颜色
          },
        },
        grid: {
          height: '80%',
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
          axisLine: {
            lineStyle: {
              color: '#474d55', // 控制 x轴的 颜色
            },
          },
          axisTick: {
            show: true, // 控制 x轴 是否显示刻度
          },
          axisLabel: {
            margin: 4, // x轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
          },
          data: [
            '1月',
            '2月',
            '3月',
            '4月',
            '5月',
            '6月',
            '7月',
            '8月',
            '9月',
            '10月',
            '11月',
            '12月',
          ],
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
              show: true, // 控制 y轴 是否显示刻度
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
            name: '承包商人员考试次数',
            type: 'bar',
            barMaxWidth: 20,
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          },
          {
            name: '承包商人员培训次数',
            type: 'bar',
            barMaxWidth: 20,
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          },
        ],
      })
    },
    // 设置红黄牌图表
    set_chart_card(dt) {
      if (dt.length === 0)
        return
      const res = dt.map((item) => {
        return {
          value: item.count,
          name: `${item.bookingsName}承包商`,
          itemStyle: {
            color:
              item.bookingsName === '红牌'
                ? '#ef0023'
                : item.bookingsName === '黄牌'
                  ? '#fffa1a'
                  : '#46bc15',
          },
        }
      })
      this.allCharts.chart_card.setOption({
        series: [{ data: res }],
      })
    },
    // 设置合格等状态图表
    set_chart_score(dt) {
      if (dt.length === 0)
        return
      const res = dt.map((item) => {
        return {
          value: item.count,
          name: `${item.contractorStatusName}承包商`,
          itemStyle: {
            color:
              item.contractorStatusName === '准合格'
                ? '#7f38d6'
                : item.contractorStatusName === '黑名单'
                  ? '#000'
                  : '#1d5fef',
          },
        }
      })
      this.allCharts.chart_score.setOption({
        series: [{ data: res }],
      })
    },
    set_chart_et(dt) {
      if (dt.length === 0)
        return
      const tags = []
      const d1 = []
      const d2 = []
      dt.forEach((item) => {
        tags.push(item.monthStr)
        d1.push(item.examCount)
        d2.push(item.trainCount)
      })
      this.allCharts.chart_et.setOption({
        xAxis: {
          data: tags,
        },
        series: [{ data: d1 }, { data: d2 }],
      })
    },
  },
}
</script>

<template>
  <div class="chart-contractor">
    <div class="leftCon">
      <ContractorTree
        ref="contrTree"
        @treeNodeTap="treeNodeTap"
      />
    </div>
    <div class="rightCon">
      <el-card class="top-stat">
        <div class="barSty">
          承包商统计
        </div>
        <div class="stat-con">
          <div>
            <span class="name">承包商数量(个)</span>
            <span class="val">{{ dataCount.contractorCount || 0 }}</span>
          </div>
          <div>
            <span class="name">承包商特殊作业数量</span>
            <span class="val">{{ dataCount.workTicketCount || 0 }}</span>
          </div>
          <div>
            <span class="name">承包商人员数量</span>
            <span class="val">{{ dataCount.contractorUserCount || 0 }}</span>
          </div>
          <div>
            <span class="name">近一月特殊作业数量</span>
            <span class="val">{{ dataCount.workTicketCountMonth || 0 }}</span>
          </div>
          <div>
            <span class="name">近一月三违考核数量</span>
            <span class="val">{{ dataCount.threeNum }}</span>
          </div>
        </div>
      </el-card>
      <el-row class="bot-exam-train">
        <el-col
          :span="15"
          class="exam"
        >
          <div class="barSty">
            承包商考核及人员培训
          </div>
          <div class="chartBox">
            <div class="leftRight">
              <div id="chart_card" />
              <div id="chart_score" />
            </div>
            <div id="chart_et" />
          </div>
        </el-col>
        <el-col
          :offset="1"
          :span="8"
          class="train"
        >
          <div class="barSty">
            三违排行榜
          </div>
          <el-table
            :data="data"
            style="width: 100%"
            size="mini"
            :header-cell-style="{ background: '#f5f5f5' }"
            height="100%"
          >
            <el-table-column
              label="承包商名称"
              prop="departmentTypeParentName"
              align="center"
              width="90"
            />
            <el-table-column
              label="所属部门"
              prop="departmentName"
              align="center"
            />
            <el-table-column
              label="所属公司"
              prop="companyName"
              align="center"
            />
            <el-table-column
              label="三违扣分"
              prop="count"
              align="center"
            />
          </el-table>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chart-contractor {
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
    margin-right: 10px;
  }
  .rightCon {
    flex: 1;
    height: 100%;
    overflow: hidden;
    background: #fff;
    padding: 10px;
    display: flex;
    flex-direction: column;
    .barSty {
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 10px;
      &::before {
        display: inline-block;
        content: '';
        margin-right: 6px;
        width: 5px;
        height: 14px;
        background-color: #409eff;
      }
    }
    .top-stat {
      .stat-con {
        display: flex;
        & > div {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 20px;
          margin: 10px 0;
          border-right: 1px solid #ccc;
          color: #666;
          &:last-child {
            border: none;
          }
          .val {
            color: #000;
            padding-top: 10px;
            font-size: 14px;
            font-weight: bold;
          }
        }
      }
    }
    .bot-exam-train {
      margin-top: 20px;
      flex: 1;
      overflow: hidden;
      .el-col {
        height: 100%;
      }
      .exam {
        display: flex;
        flex-direction: column;
        .chartBox {
          flex: 1;
          display: flex;
          flex-direction: column;
          & > div {
            flex: 1;
          }
          .leftRight {
            display: flex;
            flex-direction: row;
            & > div {
              flex: 1;
            }
          }
        }
      }
      .train {
        display: flex;
        flex-direction: column;
      }
    }
  }
}
</style>
