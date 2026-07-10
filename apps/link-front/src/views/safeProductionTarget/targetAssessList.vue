/* * @Author: xiaorui 目标责任制考核台账页面 * @Date: 2023-05-12 14:54:25 * @Last Modified by:
xiaorui * @Last Modified time: 2023-06-13 14:43:51 */
<script>
import { SAFETY_PRODUCTION_EXAM_STANDING } from '@/http/excel-api'
import {
  deleteAssessRecordFn,
  getTargetAssessListByPageFn,
} from '@/http/safeProductionTarget/safe-production-target-api'
import ExcelExport from '@/views/common-ui/excelHandle/ExcelExport'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import AssessDetailDialog from './dialog/assessDetailDialog'

export default {
  components: {
    OwnDeparmentTree,
    AssessDetailDialog,
    ExcelExport,
  },
  data: () => ({
    pickerOptions: {
      shortcuts: [
        {
          text: '最近三天',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 3)
            picker.$emit('pick', [start, end])
          },
        },
        {
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          },
        },
        {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          },
        },
      ],
    },
    loading: false,
    companyId: '', // 登录用户所属公司id，用于查询左侧组织架构树
    timeValue: '',
    tableData: [],
    total: 0,
    sForm: {
      pageNum: 1,
      pageSize: 10,
      deptId: '',
      keyWords: '',
      startDate: '',
      endDate: '',
    },
    showExportDialog: false,
    exportProp: {},
  }),
  created() {
    this.companyId = this.$store.state.user.user.companyId
    this.getDataList()
  },
  methods: {
    getDataList() {
      // 查询记录
      this.loading = true
      getTargetAssessListByPageFn(this.sForm)
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
    // 点击部门树的item
    treeNodeTap(v) {
      // 记录部门id
      if (v.onlyTreeUse)
        return
      this.sForm.deptId = v.id
      this.searchFn()
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
      this.$refs.assessDetailDialog.init(method, id)
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
          deleteAssessRecordFn(id)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.warning(data.message || '删除失败')
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
        businessData: SAFETY_PRODUCTION_EXAM_STANDING,
        reqData: params,
      }
      this.showExportDialog = true
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
        prop="keyWords"
        label="关键字"
      >
        <el-input
          v-model="sForm.keyWords"
          placeholder="输入工号、金额、姓名查询"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="考核日期">
        <el-date-picker
          v-model="timeValue"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          :picker-options="pickerOptions"
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
        label="公司"
        prop="companyName"
        align="center"
      />
      <el-table-column
        label="部门"
        prop="deptName"
        align="center"
      />
      <el-table-column
        label="姓名"
        prop="fullName"
        align="center"
      />
      <el-table-column
        label="岗位"
        prop="postName"
        align="center"
      />
      <el-table-column
        label="工号"
        prop="jobNumber"
        align="center"
      />
      <el-table-column
        label="考核日期"
        prop="startDate"
        align="center"
        min-width="130"
      >
        <template slot-scope="scope">
          {{ `${scope.row.startDate}至${scope.row.endDate}` }}
        </template>
      </el-table-column>
      <el-table-column
        label="实际提取金额(元)"
        prop="realExtract"
        align="center"
      />
      <el-table-column
        label="汇总考核金额"
        prop="summaryTotal"
        align="center"
      />
      <el-table-column
        label="实际兑现金额"
        prop="realCash"
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
            @click="clickFn('view', scope.row.id)"
          >
            查看
          </el-button>
          <el-button
            type="text"
            style="color: var(--ky-danger)"
            @click="deleteFn(scope.row.id)"
          >
            删除
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
    <assess-detail-dialog
      slot="dialog"
      ref="assessDetailDialog"
      @refreshDataList="searchFn"
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
      <ExcelExport
        v-if="showExportDialog"
        v-bind="exportProp"
        @close="showExportDialog = false"
      />
    </el-dialog>
  </TreeTable>
</template>
