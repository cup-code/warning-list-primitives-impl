/* * @Author: xiaorui 三违考核新增、审核列表页 * @Date: 2023-03-21 11:20:38 * @Last
Modified by: xiaorui * @Last Modified time: 2023-12-25 17:40:45 */
<script>
import { THREE_VIOLATION_LIST } from '@/http/excel-api'
import {
  deleteExamineRecordFn,
  getThreeViolationListByPageFn,
} from '@/http/rewardAssessment/reward'
import GlobalDepartmentTree from '@/views/common-ui/GlobalDepartmentTree'
import ThreeViolation from './dialog/detailForm'

export default {
  components: {
    GlobalDepartmentTree,
    ThreeViolation,
  },
  data: () => ({
    loading: false,
    companyId: '', // 登录用户所属公司id，用于查询左侧组织架构树
    assessStatusList: [
      {
        label: '待编辑',
        value: 0,
      },
      {
        label: '待审批',
        value: 1,
      },
      {
        label: '拒绝',
        value: 2,
      },
      {
        label: '同意',
        value: 3,
      },
    ],
    executeList: [
      {
        label: '待执行',
        value: 0,
      },
      {
        label: '已执行',
        value: 1,
      },
    ],
    tableData: [],
    total: 0,
    sForm: {
      pageNum: 1,
      pageSize: 10,
      departmentId: '',
      examineDepartmentId: '', // 被考核组织结构id
      examineUserId: '', // 被考核人id
      examineUserName: '', // 被考核人姓名
      assessCategory: '', // 考核类别
      assessType: '', // 考核类型
      assessStatus: '', // 考核状态
      executed: '', // 执行状态
      startDate: '', // 开始时间
      endDate: '', // 结束时间
    },
    timeValue: '', // 搜索条件中的起止时间
    isShow: false,
    fromStatistics: false, // 判断是否从三违统计台账页面跳转过来的，默认false
    showExportDialog: false,
    exportProp: {},
  }),
  created() {
    this.fromStatistics
      = this.$route.params.fromStatistics || this.$route.params.fromEvaluate || false
    console.log(this.$route.params.fromStatistics, this.$route.params.fromEvaluate, 8800)
    if (this.fromStatistics) {
      // 从三违考核-考核台账跳转过来的，需要被考核组织结构id和 考核类别
      this.sForm.departmentId = this.$route.params.departmentId
      this.sForm.assessCategory = this.$route.params.assessCategory
      // 从评价管理-安全员考核台账跳转过来的，需要被考核组织结构id和开始结束时间
      this.sForm.examineUserId = this.$route.params.userId // 从安全风险金跳转过来，需要被考核人id
      this.sForm.startDate = this.$route.params.startDate
      this.sForm.endDate = this.$route.params.endDate
      // 如果是从统计台账跳转过来的，只查询执行过的
      this.sForm.executed = 1
      this.backPageNum = this.$route.params.pageNum || 1 // 需要说明返回第几页
    }
    this.companyId = this.$store.state.user.user.companyId
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
      getThreeViolationListByPageFn(this.sForm)
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
      if (v && v.length) {
        this.sForm.startDate = v[0]
        this.sForm.endDate = v[1]
      }
      else {
        this.sForm.startDate = ''
        this.sForm.endDate = ''
      }
    },
    // 新增、查看、修改弹框
    clickFn(method, id, assessStatus) {
      this.$refs.threeViolation.init(method, id, assessStatus)
    },
    // 删除
    deleteFn(id) {
      this.$confirm('您确认删除此条考核记录？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteExamineRecordFn(id)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(data.message || '删除失败')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败')
            })
            .finally(() => {
              this.loading = false
            })
        })
        .catch(() => {})
    },
    canEdit(row) {
      const currentUser = JSON.parse(sessionStorage.getItem('user'))
      const currentUserId = currentUser.id
      // 当登录人为发起人，并且审批状态为待编辑、待审核或拒绝时，可修改
      return (
        row.initiatorId === currentUserId
        && (row.assessStatus === 0 || row.assessStatus === 1 || row.assessStatus === 2)
      )
    },
    canReview(row) {
      const currentUser = JSON.parse(sessionStorage.getItem('user'))
      const currentUserId = currentUser.id
      // 当登录人为审批人，并且审批状态为待审核时，可审批
      return row.approverId === currentUserId && row.assessStatus === 1
    },
    canDelete(row) {
      const currentUser = JSON.parse(sessionStorage.getItem('user'))
      const currentUserId = currentUser.id
      // 当登录人为发起人，并且未执行之前，可以删除
      return row.initiatorId === currentUserId && !row.executed
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
      this.$refs.sForm.resetFields()
      this.timeValue = []
      this.sForm.startDate = ''
      this.sForm.endDate = ''
      this.sForm.pageNum = 1
      this.getDataList()
    },
    getLabel(list, val) {
      return (
        this[list].find((item) => {
          return item.value === val
        }) || {}
      ).label
    },
    /* 点击导出 */
    exportClick() {
      const params = {}
      for (const key in this.sForm) {
        if (
          (this.sForm[key] || this.sForm[key] === 0)
          && !['pageNum', 'pageSize'].includes(key)
        ) {
          params[key] = this.sForm[key]
        }
      }
      this.exportProp = {
        businessData: THREE_VIOLATION_LIST,
        reqData: params,
      }
      this.showExportDialog = true
    },
    // 从评价管理跳转过来的，需要展示返回按钮
    goBack() {
      this.$route.params.pageNum = this.backPageNum
      this.$router.back()
    },
  },
}
</script>

<template>
  <KyTreeTable
    ref="treeTable"
    :isShowLeft="!fromStatistics"
    :isShowSearch="!fromStatistics"
  >
    <!-- 左侧树 -->
    <GlobalDepartmentTree
      slot="tree"
      :companyId="companyId"
      @treeNodeTap="treeNodeTap"
    />
    <ECard
      slot="search"
      type="search"
      noneBottom
    >
      <el-form
        ref="sForm"
        :inline="true"
        :model="sForm"
        size="mini"
        class="sForm"
        @submit.native.prevent
      >
        <el-form-item prop="assessType" label="考核类型">
          <el-select
            v-model="sForm.assessType"
            placeholder="请选择"
            filterable
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('assess_type')"
              :key="item.id"
              :label="item.dictName"
              :value="+item.dictCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="assessCategory" label="考核类别">
          <el-select
            v-model="sForm.assessCategory"
            placeholder="请选择"
            filterable
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('assess_category')"
              :key="item.id"
              :label="item.dictName"
              :value="+item.dictCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item prop="examineUserName" label="被考核人姓名">
          <el-input
            v-model="sForm.examineUserName"
            placeholder="姓名"
            clearable
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item
          v-if="isShow"
          prop="assessStatus"
          label="审批状态"
        >
          <el-select
            v-model="sForm.assessStatus"
            placeholder="请选择"
            filterable
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in assessStatusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="isShow"
          prop="executed"
          label="执行状态"
        >
          <el-select
            v-model="sForm.executed"
            placeholder="请选择"
            filterable
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="item in executeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="isShow" label="日期">
          <el-date-picker
            v-model="timeValue"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
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
    </ECard>
    <ECard slot="table">
      <div class="card-cell">
        <el-button
          v-if="!fromStatistics && hasBtnPermission('three_violation_add')"
          icon="el-icon-plus"
          type="primary"
          plain
          @click="clickFn('add')"
        >
          新增
        </el-button>
        <el-button
          v-if="hasBtnPermission('three_violation_export')"
          type="success"
          plain
          icon="el-icon-upload2"
          @click="exportClick"
        >
          excel导出
        </el-button>
        <el-button
          v-if="fromStatistics"
          type="primary"
          plain
          @click="goBack"
        >
          返回
        </el-button>
      </div>
      <el-table
        v-loading="loading"
        :data="tableData"
        size="mini"
        height="100%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        highlight-current-row
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          label="日期"
          prop="assessDate"
          align="center"
        />
        <el-table-column
          label="发起人"
          prop="initiatorUserName"
          align="center"
        />
        <el-table-column
          label="发起人部门"
          prop="initiatorDepName"
          align="center"
        />
        <el-table-column
          label="考核类型"
          prop="assessType"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel("assess_type", scope.row.assessType) }}
          </template>
        </el-table-column>
        <el-table-column
          label="考核类别"
          prop="assessCategory"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel("assess_category", scope.row.assessCategory) }}
          </template>
        </el-table-column>
        <el-table-column
          label="被考核单位"
          prop="examineDepartmentName"
          align="center"
        />
        <el-table-column
          label="被考核人姓名"
          prop="examineUserName"
          align="center"
        />
        <el-table-column
          label="考核级别"
          prop="assessLevel"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel("assess_level", scope.row.assessLevel) }}
          </template>
        </el-table-column>
        <el-table-column
          label="考核总金额"
          prop="assessTotalAmount"
          align="center"
        />
        <el-table-column
          label="事实描述"
          prop="factDes"
          align="center"
        />
        <el-table-column
          label="考核执行部门"
          prop="executeDepartmentName"
          align="center"
        />
        <el-table-column
          label="审批状态"
          prop="assessStatus"
          align="center"
        >
          <template slot-scope="scope">
            <!-- <span>{{ scope.row.assessStatus === 1 ? '待审批' : scope.row.assessStatus === 2 ? '拒绝' : '同意'}}</span> -->
            <span> {{ getLabel("assessStatusList", scope.row.assessStatus) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="执行状态"
          prop="executed"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.executed ? "已执行" : "待执行" }}</span>
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
              v-if="hasBtnPermission('three_violation_view')"
              type="text"
              @click="clickFn('view', scope.row.id)"
            >
              查看
            </el-button>
            <el-button
              v-if="canEdit(scope.row) && hasBtnPermission('three_violation_modify')"
              type="text"
              style="color: var(--ky-warning)"
              @click="clickFn('edit', scope.row.id, scope.row.assessStatus)"
            >
              修改
            </el-button>
            <el-button
              v-if="canReview(scope.row) && hasBtnPermission('three_violation_review')"
              type="text"
              style="color: var(--ky-warning)"
              @click="clickFn('review', scope.row.id)"
            >
              审批
            </el-button>
            <el-button
              v-if="canDelete(scope.row) && hasBtnPermission('three_violation_delete')"
              type="text"
              style="color: var(--ky-danger)"
              @click="deleteFn(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <ECard slot="page" type="footer">
      <el-pagination
        :current-page.sync="sForm.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getDataList"
        @current-change="getDataList"
      />
    </ECard>

    <template slot="dialog">
      <ThreeViolation
        ref="threeViolation"
        @refreshDataList="getDataList"
      />
      <!-- excel导出 -->
      <el-dialog
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
    </template>
  </KyTreeTable>
</template>
