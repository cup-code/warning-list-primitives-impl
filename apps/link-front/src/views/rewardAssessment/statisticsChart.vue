/* * @Author: xiaorui 奖励考核：汇总分析页面 * @Date: 2023-07-27 16:21:33 * @Last Modified by:
xiaorui * @Last Modified time: 2023-07-28 10:22:35 */
<script>
import moment from 'moment'
import TreeSelect from '@/components/treeSelect/treeSelect'
import {
  getAssessAndRewardCountFn,
  getAssessCountByMonthFn,
  getAssessSortListByCompanyFn,
  getAssessSortListByDepFn,
  getAssessSortListByPersonFn,
  getExecuteListByPageFn,
  getRewardCountByMonthFn,
  getRewardSortListByCompanyFn,
  getRewardSortListByDepFn,
  getRewardSortListByPersonFn,
  getSafeRewardExecuteListByPageFn,
} from '@/http/rewardAssessment/reward'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import ChartDialog from './chartDialog'

export default {
  components: {
    TreeSelect,
    ChartDialog,
  },
  data() {
    return {
      // 柱状图共用参数
      commonOption: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        legend: {
          left: 'right',
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, 0.01],
        },
      },
      // 饼图参数
      pieOption: {
        title: {
          text: '按照奖励考核类别统计金额',
        },
        tooltip: {
          trigger: 'item',
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '55%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            data: [],
          },
        ],
      },
      depList: [], // 组织架构列表
      sForm: {
        // 表格的搜索条件
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        type: 1,
        fuzzyQuery: '',
        startDate: '',
        endDate: '',
        executed: 1,
      },
      total: 0,
      loading: false, // 表格的加载动画
      tableData: [],
      pieRadio: 'week', // 饼图的查询周期
      pieParam: {
        start: '',
        end: '',
      },
      sortRadio: 'assess', // 排序的查询类型
      activeName: 'first', // 排行榜页签
      sortParam: {
        pageNum: 1,
        pageSize: 10,
      },
      sortLoading: false,
      sortTotal: 0,
      sortTableData: [], // 排行榜的表格数据
    }
  },
  computed: {
    /* 设置背景高度 */
    setHeight() {
      const settings = this.$store.state.settings
      let height = '45px'
      if (settings.tagModel && settings.layout !== 'lr') {
        height = '100px'
      }
      return `height:calc(130vh - ${height})`
    },
  },
  created() {
    getDepartListSimple().then(({ data }) => {
      this.depList = data.result || []
    })
  },
  mounted() {
    this.getAssessCountByMonth()
    this.getRewardCountByMonth()
    this.getDataList()
    this.getPieData()
    this.getSortList()
    this.pieChart = this.$editorEcharts(document.getElementById('pieChart'))
  },
  methods: {
    // 按照考核类型统计金额柱状图
    getAssessCountByMonth() {
      getAssessCountByMonthFn().then(({ data }) => {
        const xData = []
        const commandData = [] // 违章指挥的数据
        const operationData = [] // 违章操作的数据
        const disciplineData = [] // 违章劳动纪律的数据
        data.result.forEach((item) => {
          xData.push(`${item.month}月`)
          const comand = (
            item.groupByCountBOList.find((group) => {
              return group.groupBy === '1'
            }) || {}
          ).count
          const operation = (
            item.groupByCountBOList.find((group) => {
              return group.groupBy === '2'
            }) || {}
          ).count
          const discipline = (
            item.groupByCountBOList.find((group) => {
              return group.groupBy === '3'
            }) || {}
          ).count
          commandData.push(comand)
          operationData.push(operation)
          disciplineData.push(discipline)
          const title = {
            text: '按照考核类型统计金额',
          }
          const xAxis = {
            type: 'category',
            data: xData,
          }
          const series = [
            {
              name: '违章指挥',
              type: 'bar',
              barWidth: '10%',
              data: commandData,
            },
            {
              name: '违章操作',
              type: 'bar',
              barWidth: '10%',
              data: operationData,
            },
            {
              name: '违反劳动纪律',
              type: 'bar',
              barWidth: '10%',
              data: disciplineData,
            },
          ]
          const option = Object.assign(this.commonOption, {
            title,
            xAxis,
            series,
          })
          this.threeViolationChart = this.$editorEcharts(
            document.getElementById('threeViolationChart'),
          )
          this.threeViolationChart.setOption(option)
        })
      })
    },
    // 按照奖励类型统计金额柱状图
    getRewardCountByMonth() {
      getRewardCountByMonthFn().then(({ data }) => {
        const xData = []
        const hiddenDangerData = [] // 隐患举报的数据
        const suggestData = [] // 合理化建议的数据
        const threeViolationData = [] // 三违举报的数据
        const fastReportData = [] // 安全随手拍的数据
        const otherData = [] // 其他的数据
        data.result.forEach((item) => {
          xData.push(`${item.month}月`)
          const hiddenDanger = (
            item.groupByCountBOList.find((group) => {
              return group.groupBy === '1'
            }) || {}
          ).count
          const suggest = (
            item.groupByCountBOList.find((group) => {
              return group.groupBy === '2'
            }) || {}
          ).count
          const threeViolation = (
            item.groupByCountBOList.find((group) => {
              return group.groupBy === '3'
            }) || {}
          ).count
          const fastReport = (
            item.groupByCountBOList.find((group) => {
              return group.groupBy === '4'
            }) || {}
          ).count
          const other = (
            item.groupByCountBOList.find((group) => {
              return group.groupBy === '5'
            }) || {}
          ).count
          hiddenDangerData.push(hiddenDanger)
          suggestData.push(suggest)
          threeViolationData.push(threeViolation)
          fastReportData.push(fastReport)
          otherData.push(other)
          const title = {
            text: '按照奖励类型统计金额',
          }
          const xAxis = {
            type: 'category',
            data: xData,
          }
          const series = [
            {
              name: '隐患举报',
              type: 'bar',
              barWidth: '10%',
              data: hiddenDangerData,
            },
            {
              name: '合理化建议',
              type: 'bar',
              barWidth: '10%',
              data: suggestData,
            },
            {
              name: '三违举报',
              type: 'bar',
              barWidth: '10%',
              data: threeViolationData,
            },
            {
              name: '安全随手拍',
              type: 'bar',
              barWidth: '10%',
              data: fastReportData,
            },
            {
              name: '其他',
              type: 'bar',
              barWidth: '10%',
              data: otherData,
            },
          ]
          const option = Object.assign(this.commonOption, {
            title,
            xAxis,
            series,
          })
          this.safeRewardChart = this.$editorEcharts(document.getElementById('safeRewardChart'))
          this.safeRewardChart.setOption(option)
        })
      })
    },
    searchFn() {
      this.sForm.pageNum = 1
      this.getDataList()
    },
    resetEvent() {
      // console.log('reset')
      this.$refs.sForm.resetFields()
      this.searchFn()
    },
    getDataList() {
      this.loading = true
      let funcFn
      if (this.sForm.type === 1) {
        funcFn = getExecuteListByPageFn
        this.sForm.examineUserName = this.sForm.fuzzyQuery
      }
      else if (this.sForm.type === 2) {
        funcFn = getSafeRewardExecuteListByPageFn
        this.sForm.rewardUserName = this.sForm.fuzzyQuery
      }
      funcFn(this.sForm)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total || 0
          }
          else {
            this.$message.warning(data.message || '查询列表失败')
          }
        })
        .catch(() => {
          this.$message.error('查询列表失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 查看详情
    clickFn(row) {
      this.$refs.chartDialog.init(row, this.sForm.type)
    },
    // 按照奖励考核类别统计金额饼图
    getPieData() {
      if (this.pieRadio === 'week') {
        this.pieParam.start = moment(this.getFirstDayOfWeek()).format('YYYY-MM-DD HH:mm:ss')
      }
      else if (this.pieRadio === 'month') {
        this.pieParam.start = moment(this.getFirstDayOfMonth()).format('YYYY-MM-DD HH:mm:ss')
      }
      else if (this.pieRadio === 'year') {
        this.pieParam.start = moment(this.getFirstDayOfYear()).format('YYYY-MM-DD HH:mm:ss')
      }
      this.pieParam.end = moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
      getAssessAndRewardCountFn(this.pieParam).then(({ data }) => {
        if (data.success) {
          const seriesData = data.result.map((item) => {
            return {
              value: item.count,
              name: item.groupByDesc + item.count,
            }
          })
          this.pieOption.series[0].data = seriesData
          this.pieChart.setOption(this.pieOption)
        }
      })
    },
    // 获取本周周一日期
    getFirstDayOfWeek() {
      // 获取当前时间对象
      const currentDate = new Date()
      // 获取当天是周几
      const weekDay = currentDate.getDay()
      // 计算距离周一的天数
      let distance = weekDay - 1
      if (weekDay === 0) {
        distance = 6
      }
      // 计算周一是哪天
      const firstDayOfWeek = new Date()
      firstDayOfWeek.setDate(currentDate.getDate() - distance)
      firstDayOfWeek.setHours(0, 0, 0, 0)
      return firstDayOfWeek
    },
    // 获取本月第一天日期
    getFirstDayOfMonth() {
      // 获取当前时间对象
      const currentDate = new Date()
      // 新建一个时间对象，设置日期为1
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      return firstDayOfMonth
    },
    // 获取本年第一天日期
    getFirstDayOfYear() {
      // 获取当前时间对象
      const currentDate = new Date()
      // 新建一个时间对象，设置日期为1
      const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1)
      return firstDayOfYear
    },
    // 排行榜页签变化时
    handleClick() {
      this.sortParam.pageNum = 1
      this.getSortList()
    },
    // 获取排行数据
    getSortList() {
      this.sortLoading = true
      let funcFn
      // 考核类型的排序
      if (this.sortRadio === 'assess') {
        if (this.activeName === 'first') {
          funcFn = getAssessSortListByDepFn
          this.sortParam.companyId = this.$store.state.user.user.companyId
        }
        else if (this.activeName === 'second') {
          funcFn = getAssessSortListByPersonFn
          this.sortParam.companyId = this.$store.state.user.user.companyId
        }
        else if (this.activeName === 'third') {
          funcFn = getAssessSortListByCompanyFn
        }
      }
      else if (this.sortRadio === 'reward') {
        if (this.activeName === 'first') {
          funcFn = getRewardSortListByDepFn
          this.sortParam.companyId = this.$store.state.user.user.companyId
        }
        else if (this.activeName === 'second') {
          funcFn = getRewardSortListByPersonFn
          this.sortParam.companyId = this.$store.state.user.user.companyId
        }
        else if (this.activeName === 'third') {
          funcFn = getRewardSortListByCompanyFn
        }
      }
      funcFn(this.sortParam)
        .then(({ data }) => {
          if (data.success) {
            this.sortTableData = data.result.list || []
            this.sortTotal = data.result.total || 0
          }
          else {
            this.$message.warning(data.message || '查询排行榜失败')
          }
        })
        .catch(() => {
          this.$message.error('查询排行榜失败')
        })
        .finally(() => {
          this.sortLoading = false
        })
    },
  },
}
</script>

<template>
  <div
    :style="setHeight"
    class="statisticsChart"
  >
    <el-row
      class="topArea"
      :gutter="10"
    >
      <el-col
        :span="12"
        style="height: 100%"
      >
        <div
          id="threeViolationChart"
          class="card"
        />
      </el-col>
      <el-col
        :span="12"
        style="height: 100%"
      >
        <div
          id="safeRewardChart"
          class="card"
        />
      </el-col>
    </el-row>
    <el-row
      class="bottomArea"
      :gutter="10"
    >
      <el-col
        class="bottomLeft card"
        :span="16"
      >
        <el-form
          ref="sForm"
          :inline="true"
          :model="sForm"
          size="mini"
          class="sForm"
          @submit.native.prevent
        >
          <el-form-item
            label="责任组织"
            prop="departmentId"
          >
            <TreeSelect
              :props="{
                value: 'id', // ID字段名
                label: 'departmentName', // 显示名称
                children: 'children', // 子级字段名
              }"
              :list="depList"
              :value="sForm.departmentId"
              :clearable="true"
              :accordion="true"
              @getValue="
                value => {
                  sForm.departmentId = value
                }
              "
            />
          </el-form-item>
          <el-form-item
            prop="type"
            label="奖励考核类别"
          >
            <el-select
              v-model="sForm.type"
              placeholder="请选择"
              filterable
              @change="searchFn"
            >
              <el-option
                label="三违考核"
                :value="1"
              />
              <el-option
                label="安全奖励"
                :value="2"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="姓名"
            prop="fuzzyQuery"
          >
            <el-input
              v-model="sForm.fuzzyQuery"
              placeholder="姓名"
              clearable
            />
          </el-form-item>
          <el-form-item
            label="开始时间"
            prop="startDate"
          >
            <el-date-picker
              v-model="sForm.startDate"
              type="date"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-form-item
            label="结束时间"
            prop="endDate"
          >
            <el-date-picker
              v-model="sForm.endDate"
              type="date"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            :loading="loading"
            @click="searchFn"
          >
            查询
          </el-button>
          <el-button
            class="reset"
            icon="el-icon-refresh-left"
            :loading="loading"
            @click="resetEvent"
          >
            重置
          </el-button>
        </el-form>
        <el-table
          v-loading="loading"
          :data="tableData"
          size="mini"
          :header-cell-style="{ background: 'var(--ky-head-color)' }"
          highlight-current-row
          height="calc(100% - 130px)"
        >
          <el-table-column
            label="序号"
            type="index"
            width="50"
          />
          <el-table-column
            v-if="sForm.type === 1"
            key="1"
            label="日期"
            prop="assessDate"
            align="center"
          />
          <el-table-column
            v-if="sForm.type === 1"
            key="2"
            label="所属公司"
            prop="examineCompanyName"
            align="center"
          />
          <el-table-column
            v-if="sForm.type === 1"
            key="3"
            label="部门"
            prop="examineDepartmentName"
            align="center"
          />
          <el-table-column
            v-if="sForm.type === 1"
            key="4"
            label="姓名"
            prop="examineUserName"
            align="center"
          />
          <el-table-column
            v-if="sForm.type === 1"
            key="5"
            label="岗位"
            prop="examineUserPost"
            align="center"
          />
          <el-table-column
            v-if="sForm.type === 1"
            key="21"
            label="政治面貌"
            prop="politicalAttribute"
            align="center"
          >
            <template slot-scope="scope">
              {{ $dictUtils.getDictLabel('politics_status', scope.row.politicalAttribute) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="sForm.type === 1"
            key="6"
            label="事实描述"
            prop="factDes"
            align="center"
          />
          <el-table-column
            v-if="sForm.type === 1"
            key="7"
            label="处理结果"
            prop="illustrate"
            align="center"
          />
          <el-table-column
            v-if="sForm.type === 1"
            key="8"
            label="奖励考核类别"
            align="center"
          >
            <template slot-scope="scope">
              三违考核
            </template>
          </el-table-column>
          <el-table-column
            v-if="sForm.type === 1"
            key="9"
            label="奖励考核类型"
            prop="assessCategory"
            align="center"
          >
            <template slot-scope="scope">
              {{ $dictUtils.getDictLabel('assess_category', scope.row.assessCategory) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="sForm.type === 1"
            key="10"
            label="考核奖励金额"
            prop="assessTotalAmount"
            align="center"
          />
          <el-table-column
            v-if="sForm.type === 2"
            key="11"
            label="日期"
            prop="rewardDate"
            align="center"
          />
          <el-table-column
            v-if="sForm.type === 2"
            key="12"
            label="所属公司"
            prop="rewardCompanyName"
            align="center"
          />
          <el-table-column
            v-if="sForm.type === 2"
            key="13"
            label="部门"
            prop="rewardDepartmentName"
            align="center"
          />
          <el-table-column
            v-if="sForm.type === 2"
            key="14"
            label="姓名"
            prop="rewardUserName"
            align="center"
          />
          <el-table-column
            v-if="sForm.type === 2"
            key="15"
            label="岗位"
            prop="rewardUserPost"
            align="center"
          />
          <el-table-column
            v-if="sForm.type === 2"
            key="22"
            label="政治面貌"
            prop="politicalAttribute"
            align="center"
          >
            <template slot-scope="scope">
              {{ $dictUtils.getDictLabel('politics_status', scope.row.politicalAttribute) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="sForm.type === 2"
            key="16"
            label="事实描述"
            prop="factDes"
            align="center"
          />
          <el-table-column
            v-if="sForm.type === 2"
            key="17"
            label="处理结果"
            prop="illustrate"
            align="center"
          />
          <el-table-column
            v-if="sForm.type === 2"
            key="18"
            label="奖励考核类别"
            align="center"
          >
            <template slot-scope="scope">
              安全奖励
            </template>
          </el-table-column>
          <el-table-column
            v-if="sForm.type === 2"
            key="19"
            label="奖励考核类型"
            prop="rewardCategory"
            align="center"
          >
            <template slot-scope="scope">
              {{ $dictUtils.getDictLabel('reward_category', scope.row.rewardCategory) }}
            </template>
          </el-table-column>
          <el-table-column
            v-if="sForm.type === 2"
            key="20"
            label="考核奖励金额"
            prop="rewardTotalAmount"
            align="center"
          />
          <el-table-column
            label="操作"
            min-width="140"
            align="center"
            fixed="right"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="clickFn(scope.row)"
              >
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="text-align: right"
          :current-page.sync="sForm.pageNum"
          :page-sizes="[10, 20, 50]"
          background
          :page-size.sync="sForm.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="getDataList"
          @current-change="getDataList"
        />
      </el-col>
      <el-col
        class="bottomRight"
        :span="8"
      >
        <div class="card pieArea">
          <div id="pieChart" />
          <el-radio-group
            v-model="pieRadio"
            class="pieRadio"
            @input="getPieData"
          >
            <el-radio-button label="week">
              按周
            </el-radio-button>
            <el-radio-button label="month">
              按月
            </el-radio-button>
            <el-radio-button label="year">
              按年
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="card pieArea">
          <h2 style="margin: 0">
            考核奖励金额排行榜
          </h2>
          <el-radio-group
            v-model="sortRadio"
            class="pieRadio"
            @input="handleClick"
          >
            <el-radio-button label="assess">
              考核金额
            </el-radio-button>
            <el-radio-button label="reward">
              奖励金额
            </el-radio-button>
          </el-radio-group>
          <el-tabs
            v-model="activeName"
            :stretch="true"
            @tab-click="handleClick"
          >
            <el-tab-pane
              label="按部门"
              name="first"
            />
            <el-tab-pane
              label="按人员"
              name="second"
            />
            <el-tab-pane
              label="按公司"
              name="third"
            />
          </el-tabs>
          <el-table
            v-loading="sortLoading"
            :data="sortTableData"
            size="mini"
            :header-cell-style="{ background: 'var(--ky-head-color)' }"
            highlight-current-row
            height="calc(100% - 120px)"
          >
            <el-table-column
              label="排名"
              type="index"
              width="50"
            />
            <el-table-column
              v-if="activeName === 'first'"
              key="1"
              label="部门名称"
              prop="departmentName"
              align="center"
            />
            <el-table-column
              v-if="activeName === 'first'"
              key="2"
              label="所属公司"
              prop="companyName"
              align="center"
            />
            <el-table-column
              v-if="activeName === 'second'"
              key="3"
              label="姓名"
              prop="userName"
              align="center"
            />
            <el-table-column
              v-if="activeName === 'second'"
              key="4"
              label="所属部门"
              prop="departmentName"
              align="center"
            />
            <el-table-column
              v-if="activeName === 'third'"
              key="5"
              label="公司名称"
              prop="companyName"
              align="center"
            />
            <el-table-column
              label="金额"
              prop="count"
              align="center"
            />
          </el-table>
          <el-pagination
            style="text-align: right"
            :current-page.sync="sortParam.pageNum"
            :page-sizes="[10, 20, 50]"
            background
            :page-size.sync="sortParam.pageSize"
            layout="total, sizes, prev, pager, next"
            :total="sortTotal"
            @size-change="getSortList"
            @current-change="getSortList"
          />
        </div>
      </el-col>
    </el-row>
    <chart-dialog ref="chartDialog" />
  </div>
</template>

<style lang="scss" scoped>
.statisticsChart {
  background: #f6fafe;
  padding: 20px;
  .topArea {
    height: 20%;
  }
  .bottomArea {
    height: 80%;
    margin: 10px 0 0 0 !important;
    .bottomLeft {
      height: 100%;
      .sForm {
        height: 95px;
      }
    }
    .bottomRight {
      height: 100%;
      .pieArea {
        height: 50%;
        position: relative;
        .pieRadio {
          position: absolute;
          top: 10px;
          right: 5px;
        }
      }
    }
  }
}
#threeViolationChart,
#safeRewardChart {
  height: 100%;
}
#pieChart {
  height: 100%;
}
.card {
  padding: 10px 5px 0;
  border-radius: 5px;
  background: white;
  box-shadow: 0 0 4px 0 rgba(45, 45, 45, 0.5);
}
</style>
