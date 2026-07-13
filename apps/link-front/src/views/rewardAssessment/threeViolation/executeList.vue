/* * @Author: xiaorui三违考核执行部门执行列表 * @Date: 2023-03-24 10:09:38 * @Last Modified by:
xiaorui * @Last Modified time: 2023-09-05 14:45:13 */
<script>
import { THREE_VIOLATION_EXECUTE_LIST } from '@/http/excel-api'
import { executeRecordFn, getExecuteListByPageFn } from '@/http/rewardAssessment/reward'
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
    tableData: [],
    total: 0,
    sForm: {
      pageNum: 1,
      pageSize: 10,
      departmentId: '',
      examineUserName: '', // 被考核人姓名
      assessCategory: '', // 考核类别
      assessType: '', // 考核类型
      startDate: '', // 开始时间
      endDate: '', // 结束时间
    },
    timeValue: '', // 搜索条件中的起止时间
    isShow: false,
    showExportDialog: false,
    exportProp: {},
  }),
  created() {
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
      getExecuteListByPageFn(this.sForm)
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
    // 查看
    clickFn(method, id) {
      this.$refs.threeViolation.init(method, id)
    },
    // 是否显示执行按钮
    canExecute(row) {
      const currentUser = JSON.parse(sessionStorage.getItem('user'))
      const currentUserId = currentUser.id
      // 当登录人为执行人，并且未执行之前，可执行
      return row.executorId === currentUserId && !row.executed
    },
    // 确定执行
    executeFn(id) {
      executeRecordFn(1, id).then(({ data }) => {
        if (data.success) {
          this.$message.success(data.message || '执行成功')
          this.getDataList()
        }
        else {
          this.$message.warning(data.message || '执行失败')
        }
      })
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
    /* 点击导出 */
    exportClick() {
      const params = {}
      for (const key in this.sForm) {
        if ((this.sForm[key] || this.sForm[key] === 0) && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.sForm[key]
        }
      }
      this.exportProp = {
        businessData: THREE_VIOLATION_EXECUTE_LIST,
        reqData: params,
      }
      this.showExportDialog = true
    },
  },
}
</script>

<template>
  <KyTreeTable ref="treeTable">
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
        <el-form-item
          prop="assessType"
          label="考核类型"
        >
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
        <el-form-item
          prop="assessCategory"
          label="考核类别"
        >
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
        <el-form-item
          prop="examineUserName"
          label="被考核人姓名"
        >
          <el-input
            v-model="sForm.examineUserName"
            placeholder="姓名"
            clearable
            style="width: 120px"
          />
        </el-form-item>
        <el-form-item
          v-if="isShow"
          label="日期"
        >
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
      <div
        v-if="hasBtnPermission('three_violation_execute_export')"
        class="card-cell"
      >
        <el-button
          type="success"
          plain
          icon="el-icon-upload2"
          @click="exportClick"
        >
          excel导出
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
            {{ $dictUtils.getDictLabel('assess_type', scope.row.assessType) }}
          </template>
        </el-table-column>
        <el-table-column
          label="考核类别"
          prop="assessCategory"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('assess_category', scope.row.assessCategory) }}
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
            {{ $dictUtils.getDictLabel('assess_level', scope.row.assessLevel) }}
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
          label="执行状态"
          prop="executed"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.executed ? '已执行' : '待执行' }}</span>
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
              v-if="hasBtnPermission('three_violation_execute_view')"
              type="text"
              style="margin-right: 10px"
              @click="clickFn('view', scope.row.id)"
            >
              查看
            </el-button>
            <el-popconfirm
              title="确定已完成了考核结果吗？"
              @confirm="executeFn(scope.row.id)"
            >
              <el-button
                v-if="canExecute(scope.row) && hasBtnPermission('three_violation_execute')"
                slot="reference"
                type="text"
                style="color: var(--ky-warning)"
              >
                执行
              </el-button>
            </el-popconfirm>
            <el-button
              v-if="!scope.row.executorId"
              type="text"
              disabled
            >
              执行部门负责人未配置
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <ECard
      slot="page"
      type="footer"
    >
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

    <three-violation
      slot="dialog"
      ref="threeViolation"
      @refreshDataList="getDataList"
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
  </KyTreeTable>
</template>
