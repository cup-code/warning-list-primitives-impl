/* * @Author: xiaorui 三违考核统计页面 * @Date: 2023-03-24 15:36:59 * @Last Modified by: xiaorui *
@Last Modified time: 2023-11-22 15:05:53 */
<script>
import { THREE_VIOLATION_COUNT_LIST } from '@/http/excel-api'
import { getExamineStatisticsByPageFn } from '@/http/rewardAssessment/reward'
import GlobalDepartmentTree from '@/views/common-ui/GlobalDepartmentTree'
import StatisticsDialog from './dialog/statisticsDialog'

let beforePageNum = 1
export default {
  components: {
    GlobalDepartmentTree,
    StatisticsDialog,
  },
  beforeRouteEnter(to, from, next) {
    beforePageNum = from.params.pageNum || 1
    next()
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
      startDate: '', // 开始时间
      endDate: '', // 结束时间
    },
    timeValue: '', // 搜索条件中的起止时间
    showExportDialog: false,
    exportProp: {},
  }),
  created() {
    this.sForm.pageNum = beforePageNum || 1
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
      getExamineStatisticsByPageFn(this.sForm)
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
    // 跳转列表页面
    toList(row, assessCategory) {
      const departmentId = row.departmentId
      this.$router.push({
        name: 'threeViolationList',
        params: {
          fromStatistics: true,
          departmentId, // 部门id
          assessCategory, // 考核类别
          pageNum: this.sForm.pageNum,
        },
      })
    },
    // 查看
    clickFn(row) {
      this.$refs.statisticsDialog.init(row)
    },
    resetEvent() {
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
        businessData: THREE_VIOLATION_COUNT_LIST,
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
      noneBottom
      type="search"
    >
      <el-form
        ref="sForm"
        :inline="true"
        :model="sForm"
        size="mini"
        class="sForm"
        @submit.native.prevent
      >
        <el-form-item label="日期">
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
        </el-form-item>
      </el-form>
    </ECard>

    <ECard slot="table">
      <div class="card-cell">
        <div v-if="hasBtnPermission('three_violation_statistics_export')">
          <el-button
            type="success"
            plain
            icon="el-icon-upload2"
            @click="exportClick"
          >
            excel导出
          </el-button>
        </div>
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
          label="所属公司"
          prop="companyName"
          align="center"
        />
        <el-table-column
          label="部门"
          prop="departmentName"
          align="center"
        />
        <el-table-column
          label="违章指挥"
          prop="illegalCommandCount"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="toList(scope.row, 1)"
            >
              {{ scope.row.illegalCommandCount }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="违章操作"
          prop="illegalOperationCount"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="toList(scope.row, 2)"
            >
              {{ scope.row.illegalOperationCount }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="违反劳动纪律"
          prop="violationLaborDisciplineCount"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="toList(scope.row, 2)"
            >
              {{ scope.row.violationLaborDisciplineCount }}
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
          label="考核总次数"
          prop="examineCountTotal"
          align="center"
        />
        <el-table-column
          label="考核金额总汇(元)"
          prop="assessTotalAmount"
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
              v-if="hasBtnPermission('three_violation_statistics_view')"
              type="text"
              @click="clickFn(scope.row)"
            >
              查看
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

    <statistics-dialog
      slot="dialog"
      ref="statisticsDialog"
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
