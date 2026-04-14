/* * @Author: xiaorui 部门负责人绩效考评台账页面 * @Date: 2023-02-28 14:28:25 * @Last Modified by:
xiaorui * @Last Modified time: 2023-12-08 17:33:48 */
<script>
import { getDepartHeaderEvaluateListByPageFn } from '@/http/evaluate-manage/evaluate-api'
import { DEPARTMENT_EVALUATE_LIST } from '@/http/excel-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import { DepartmentTypeList } from '@/views/evaluateManage/config/constant'
import DepartmentEvaluationDetail from './dialog/departmentEvaluationDetail'
import DepartmentSafeCheck from './dialog/departmentSafeCheck'

let beforePageNum = 1
export default {
  components: {
    OwnDeparmentTree,
    DepartmentEvaluationDetail,
    DepartmentSafeCheck,
  },
  beforeRouteEnter(to, from, next) {
    beforePageNum = from.params.pageNum || 1
    next()
  },
  data: () => ({
    loading: false,
    tableData: [],
    total: 0,
    sForm: {
      pageNum: 1,
      pageSize: 10,
      departmentId: '',
      departmentType: '', // 部门类型
      startDate: '', // 开始时间
      endDate: '', // 结束时间
      userName: '', // 姓名
    },
    DepartmentTypeList, // 部门类别list
    timeValue: '', // 搜索条件中的起止时间
    showExportDialog: false, // excel导出弹窗开关
    exportProp: {}, // excel导出弹窗参数
  }),
  created() {
    this.sForm.pageNum = beforePageNum || 1
    this.getDataList()
  },
  methods: {
    // 点击部门树的item
    treeNodeTap(v) {
      // 记录部门id
      if (v.onlyTreeUse)
        return
      this.sForm.pageNum = 1
      this.sForm.departmentId = v.id
      this.getDataList()
    },
    getDataList() {
      // 查询记录
      this.loading = true
      getDepartHeaderEvaluateListByPageFn(this.sForm)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total
          }
          else {
            this.$message.warning(data.message || '查询失败')
          }
        })
        .catch(() => {
          this.$message.error('查询失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    searchFn() {
      this.sForm.pageNum = 1
      this.getDataList()
    },
    // 获取起止时间
    getTimeValue(v) {
      if (v) {
        // 获取上个月份
        const currentDate = new Date(v)
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
        this.sForm.startDate = this.moment(lastMonth).format('YYYY-MM')
        this.sForm.endDate = v
      }
      else {
        this.sForm.startDate = ''
        this.sForm.endDate = ''
      }
    },
    getLabel(val, list) {
      return (
        this[list].find((item) => {
          return item.value === val
        }) || {}
      ).label
    },
    // 复核、查看、修改
    toDetailClick(row, method) {
      this.$refs.departmentEvaluationDetail.init(row, method)
    },
    resetEvent() {
      this.sForm.userName = ''
      this.sForm.departmentType = ''
      this.sForm.startDate = ''
      this.sForm.endDate = ''
      this.sForm.pageNum = 1
      this.getDataList()
    },
    // 查看隐患排查详情
    viewSafeCheck(row) {
      this.$refs.departmentSafeCheck.init(row)
    },
    // 跳转至其他业务统计页面
    toOtherBook(row, routerName, isFinish = false) {
      let startDate, endDate
      const arr01 = ['threeViolationList', 'fastReportList', 'dangerBookList']
      const arr02 = [
        'weeklyMeetingManagement',
        'weeklyMeetingTask',
        'machineAccount',
        'externalInspection',
      ]
      if (arr01.includes(routerName)) {
        startDate = this.moment(row.evaluationStart).format('YYYY-MM-DD')
        endDate = this.moment(row.evaluationEnd).format('YYYY-MM-DD')
      }
      else if (arr02.includes(routerName)) {
        startDate = row.evaluationStart
        endDate = row.evaluationEnd
      }
      this.$router.push({
        name: routerName,
        params: {
          fromEvaluate: true,
          departmentId: row.departmentId, // 部门id
          userId: row.userId, // 部门id
          startDate, // 考核起始时间
          endDate, // 考核截止时间
          isRepeat: true, // 重复隐患
          isFinish,
          pageNum: this.sForm.pageNum,
        },
      })
    },
    /* 点击导出 */
    exportClick() {
      const params = {}
      for (const key in this.sForm) {
        if ((this.sForm[key] || this.sForm[key] === 0) && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.sForm[key]
        }
      }
      this.exportProp = {
        businessData: DEPARTMENT_EVALUATE_LIST,
        reqData: params,
      }
      this.showExportDialog = true
    },
    // 获取考核月份，如果日期是小于15，那就是evaluationStart的，否则就是evaluationEnd的
    getEvaluationMonth(row) {
      const day = new Date(row.evaluationStart).getDate()
      const evaluationMonth
        = day < 15
          ? this.moment(row.evaluationStart).format('YYYY-MM')
          : this.moment(row.evaluationEnd).format('YYYY-MM')
      return evaluationMonth
    },
  },
}
</script>

<template>
  <TreeTable ref="treeTable">
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <el-form
      slot="search"
      ref="sForm"
      :inline="true"
      :model="sForm"
      size="mini"
      class="sForm"
      @submit.native.prevent
    >
      <el-form-item
        prop="userName"
        label="姓名"
      >
        <el-input
          v-model="sForm.userName"
          placeholder="姓名"
          clearable
          style="width: 120px"
        />
      </el-form-item>
      <el-form-item
        prop="departmentType"
        label="部门类别"
      >
        <el-select
          v-model="sForm.departmentType"
          placeholder="请选择"
          filterable
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="item in DepartmentTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="考评月份">
        <el-date-picker
          v-model="timeValue"
          type="month"
          value-format="yyyy-MM"
          @change="getTimeValue"
        />
      </el-form-item>
      <el-form-item>
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
      </el-form-item>
    </el-form>
    <div slot="auxiliary">
      <el-button
        v-if="hasBtnPermission('department_evaluation_list_export')"
        type="success"
        plain
        icon="el-icon-upload2"
        @click="exportClick"
      >
        excel导出
      </el-button>
    </div>
    <el-table
      slot="table"
      ref="table"
      v-loading="loading"
      :data="tableData"
      size="mini"
      height="100%"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
      :border="true"
      class="customer-table"
    >
      <el-table-column
        label="序号"
        type="index"
        width="50"
      />
      <el-table-column
        label="部门"
        prop="departmentName"
        align="center"
      />
      <el-table-column
        label="部门类别"
        prop="departmentType"
        align="center"
        width="80"
      >
        <template slot-scope="scope">
          {{ getLabel(scope.row.departmentType, 'DepartmentTypeList') }}
        </template>
      </el-table-column>
      <el-table-column
        label="姓名"
        prop="userName"
        align="center"
      />
      <el-table-column
        label="考评月份"
        align="center"
      >
        <template slot-scope="scope">
          {{ getEvaluationMonth(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column
        label="生成日期"
        prop="createdTime"
        align="center"
      />
      <el-table-column
        label="考评标准(元)"
        prop="evaluationCriteria"
        align="center"
      />
      <el-table-column
        label="实际兑现金额"
        prop="cashAmount"
        align="center"
      />
      <el-table-column
        label="事故次数(数量)"
        prop="accident"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="toOtherBook(scope.row, 'machineAccount')"
          >
            {{ scope.row.accident }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="政府处罚(数量)"
        prop="governmentPenalty"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="toOtherBook(scope.row, 'externalInspection')"
          >
            {{ scope.row.governmentPenalty }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="隐患排查(元)"
        prop="hiddenDanger"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="viewSafeCheck(scope.row)"
          >
            {{ scope.row.hiddenDanger }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="安全周会(元)"
        prop="weeklyMeetingAttend"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="toOtherBook(scope.row, 'weeklyMeetingManagement')"
          >
            {{ scope.row.weeklyMeetingAttend }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="周会工作任务(元)"
        prop="weeklyMeetingTasks"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="toOtherBook(scope.row, 'weeklyMeetingTask', true)"
          >
            {{ scope.row.weeklyMeetingTasks }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="安全随手拍(元)"
        prop="safetyFollowUp"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="toOtherBook(scope.row, 'fastReportList')"
          >
            {{ scope.row.safetyFollowUp }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="三违考核(元)"
        prop="threeViolationsAssessment"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="toOtherBook(scope.row, 'threeViolationList')"
          >
            {{ scope.row.threeViolationsAssessment }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="重复隐患(元)"
        prop="repeatHiddenDanger"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="toOtherBook(scope.row, 'dangerBookList')"
          >
            {{ scope.row.repeatHiddenDanger }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        min-width="140"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === 2"
            type="text"
          >
            已复核
          </el-button>
          <el-button
            v-if="scope.row.status !== 2 && hasBtnPermission('department_evaluation_list_review')"
            type="text"
            @click="toDetailClick(scope.row, 'review')"
          >
            复核
          </el-button>
          <el-button
            v-if="hasBtnPermission('department_evaluation_list_view')"
            type="text"
            @click="toDetailClick(scope.row, 'view')"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('department_evaluation_list_modify')"
            type="text"
            style="color: var(--ky-warning)"
            @click="toDetailClick(scope.row, 'edit')"
          >
            修改
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      slot="page"
      :current-page.sync="sForm.pageNum"
      :page-sizes="[10, 20, 50]"
      background
      :page-size.sync="sForm.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getDataList"
      @current-change="getDataList"
    />
    <!-- 详情弹框 -->
    <department-evaluation-detail
      slot="dialog"
      ref="departmentEvaluationDetail"
      @refreshList="getDataList"
    />
    <!-- excel导出 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      title="Excel导出"
      :visible.sync="showExportDialog"
      width="650px"
      append-to-body
      :close-on-click-modal="false"
    >
      <KyExcelExport
        v-if="showExportDialog"
        v-bind="exportProp"
        @close="showExportDialog = false"
      />
    </el-dialog>
    <department-safe-check
      slot="dialog"
      ref="departmentSafeCheck"
    />
  </TreeTable>
</template>

<style lang="scss" scoped>
.sForm ::v-deep {
  .el-form-item--mini {
    margin-bottom: 18px;
  }
}
</style>
