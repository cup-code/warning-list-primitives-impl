/*
 * @Author: xiaorui 安全员考评台账页面
 * @Date: 2023-02-15 09:55:13
 * @Last Modified by: xiaorui
 * @Last Modified time: 2024-01-11 11:40:22
 */
<script>
import { getSaferEvaluateListByPageFn } from '@/http/evaluate-manage/evaluate-api'
import { SAFETY_EVALUATE_LIST } from '@/http/excel-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import { DepartmentTypeList } from '@/views/evaluateManage/config/constant'
import SaferEducation from './dialog/saferEducation'
import SaferEvaluationDetail from './dialog/saferEvaluationDetail'
import SaferEvaluationStandard from './dialog/saferEvaluationStandard'

let beforePageNum = 1
export default {
  components: {
    OwnDeparmentTree,
    SaferEvaluationStandard,
    SaferEvaluationDetail,
    SaferEducation,
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
      top: '', // 排名
      userName: '', // 姓名
    },
    DepartmentTypeList, // 部门类别list
    timeValue: '', // 搜索条件中的起止时间
    showExportDialog: false, // excel导出弹窗开关
    exportProp: {}, // excel导出弹窗参数
    isShow: false,
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
      getSaferEvaluateListByPageFn(this.sForm).then(({ data }) => {
        if (data.success) {
          this.tableData = data.result.list || []
          this.total = data.result.total
        }
        else {
          this.$message.warning(data.message || '查询失败')
        }
      }).catch(() => {
        this.$message.error('查询失败')
      }).finally(() => {
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
    // 考评金额计算弹框
    evaluateClick() {
      this.$refs.saferEvaluationStandard.init()
    },
    // 复核、查看、修改
    toDetailClick(row, method) {
      this.$refs.SaferEvaluationDetail.init(row, method)
    },
    openUp() {
      this.isShow = true
      setTimeout(() => {
        this.$refs.treeTable.setTableHeight()
      }, 200)
    },
    putAway() {
      this.isShow = false
      setTimeout(() => {
        this.$refs.treeTable.setTableHeight()
      }, 200)
    },
    resetEvent() {
      this.sForm.userName = ''
      this.sForm.departmentType = ''
      this.sForm.top = ''
      this.sForm.startDate = ''
      this.sForm.endDate = ''
      this.sForm.pageNum = 1
      this.getDataList()
    },
    // 查看隐患排查详情
    viewEducationDetail(row) {
      this.$refs.saferEducation.init(row)
    },
    // 跳转至其他业务统计页面
    // isEquipment 是设备设施未检查传值为true
    toOtherBook(row, routerName, isEquipment = false) {
      let startDate, endDate
      const arr01 = ['dangerBookList', 'threeViolationList', 'fastReportList', 'changeApplicationList', 'specialWorkList', 'safetCertificate']
      const arr02 = ['weeklyMeetingTask', 'machineAccount', 'externalInspection', 'trainPlan']
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
          startDate, // 考核起始时间
          endDate, // 考核截止时间
          isEquipment,
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
        businessData: SAFETY_EVALUATE_LIST,
        reqData: params,
      }
      this.showExportDialog = true
    },
    // 获取考核月份，如果日期是小于15，那就是evaluationStart的，否则就是evaluationEnd的
    getEvaluationMonth(row) {
      const day = new Date(row.evaluationStart).getDate()
      const evaluationMonth = day < 15 ? this.moment(row.evaluationStart).format('YYYY-MM') : this.moment(row.evaluationEnd).format('YYYY-MM')
      return evaluationMonth
    },
  },
}
</script>

<template>
  <TreeTable ref="treeTable">
    <!-- 左侧树 -->
    <OwnDeparmentTree slot="tree" @treeNodeTap="treeNodeTap" />
    <el-form
      slot="search"
      ref="sForm"
      :inline="true"
      :model="sForm"
      size="mini"
      class="sForm"
      @submit.native.prevent
    >
      <el-form-item prop="userName" label="姓名">
        <el-input
          v-model="sForm.userName"
          placeholder="姓名"
          clearable
          style="width: 120px"
        />
      </el-form-item>
      <el-form-item prop="top" label="排名">
        <el-input
          v-model="sForm.top"
          placeholder="排名"
          clearable
          style="width: 120px"
        />
      </el-form-item>
      <el-form-item prop="departmentType" label="部门类别">
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
      <el-form-item v-if="isShow" label="考评月份">
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
        <el-button
          v-if="!isShow"
          type="text"
          icon="el-icon-arrow-down"
          @click="openUp"
        >
          高级筛选
        </el-button>
        <el-button
          v-else
          type="text"
          icon="el-icon-arrow-up"
          style="color: black"
          @click="putAway"
        >
          收起
        </el-button>
      </el-form-item>
    </el-form>
    <div slot="auxiliary">
      <el-button
        class="export-excel"
        type="primary"
        plain
        @click="evaluateClick"
      >
        考评金额计算
      </el-button>
      <el-button
        v-if="hasBtnPermission('safer_evaluation_list_export')"
        type="success"
        plain
        icon="el-icon-upload2"
        @click="exportClick"
      >
        excel导出
      </el-button>
      <br>
      <el-button type="text">
        <i class="el-icon-warning" />计算考评时间段内上报并整改完毕的随手拍、隐患数据
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
      <el-table-column label="考评月份" align="center">
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
        label="考评总分值"
        prop="totalScore"
        align="center"
      />
      <el-table-column
        label="排名"
        prop="rank"
        align="center"
      />
      <el-table-column
        label="事故次数(数量)"
        prop="accident"
        align="center"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="toOtherBook(scope.row, 'machineAccount')">
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
          <el-button type="text" @click="toOtherBook(scope.row, 'externalInspection')">
            {{ scope.row.governmentPenalty }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="隐患数量(分值)"
        prop="hiddenDanger"
        align="center"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="toOtherBook(scope.row, 'dangerBookList')">
            {{ scope.row.hiddenDanger }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="三违考核(分值)"
        prop="threeViolationsAssessment"
        align="center"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="toOtherBook(scope.row, 'threeViolationList')">
            {{ scope.row.threeViolationsAssessment }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="变更评审(分值)"
        prop="changeManagement"
        align="center"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="toOtherBook(scope.row, 'changeApplicationList')">
            {{ scope.row.changeManagement }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="教育培训(分值)"
        prop="trainingAndEducation"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            "
            @click="toOtherBook(scope.row, 'trainPlan')"
          >
            {{ scope.row.trainingAndEducation }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="安全随手拍(分值)"
        prop="safetyFollowUp"
        align="center"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="toOtherBook(scope.row, 'fastReportList')">
            {{ scope.row.safetyFollowUp }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="特种作业证照(分值)"
        prop="specialOperations"
        align="center"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="toOtherBook(scope.row, 'safetCertificate')">
            {{ scope.row.specialOperations }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="危险作业未审批(分值)"
        prop="hazardousOperation"
        align="center"
      />
      <el-table-column
        label="设备设施(分值)"
        prop="equipmentAndFacilities"
        align="center"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="toOtherBook(scope.row, 'dangerBookList', true)">
            {{ scope.row.equipmentAndFacilities }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="周会(分值)"
        prop="weeklyMeetingTasks"
        align="center"
      >
        <template slot-scope="scope">
          <el-button type="text" @click="toOtherBook(scope.row, 'weeklyMeetingTask')">
            {{ scope.row.weeklyMeetingTasks }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="实际兑现金额"
        prop="cashAmount"
        align="center"
      />
      <el-table-column
        label="操作"
        min-width="140"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button v-if="scope.row.status === 2" type="text">
            已复核
          </el-button>
          <el-button
            v-if="scope.row.status === 1 && hasBtnPermission('safer_evaluation_list_review')"
            type="text"
            @click="toDetailClick(scope.row, 'review')"
          >
            复核
          </el-button>
          <el-button
            v-if="hasBtnPermission('safer_evaluation_list_view')"
            type="text"
            @click="toDetailClick(scope.row, 'view')"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('safer_evaluation_list_modify')"
            type="text"
            style="color:var(--ky-warning);"
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
    <!-- 考评金额计算的弹框 -->
    <safer-evaluation-standard
      slot="dialog"
      ref="saferEvaluationStandard"
      @refreshList="searchFn"
    />
    <!-- 详情弹框 -->
    <safer-evaluation-detail
      slot="dialog"
      ref="SaferEvaluationDetail"
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
    <safer-education slot="dialog" ref="saferEducation" />
  </TreeTable>
</template>

<style lang="scss" scoped>
.sForm ::v-deep {
  .el-form-item--mini {
    margin-bottom: 18px;
  }
}
</style>
