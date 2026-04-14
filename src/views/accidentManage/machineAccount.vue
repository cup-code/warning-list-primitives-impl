<!-- @description：machineAccount 事故台账  -->
<!--  @modified By：lee  -->
<!--  @version: 1.0.0  -->
<script>
import { accidentAccountDelete, accidentAccountPage } from '@/http/accidentManage/investigation'
import { showFileWindow } from '@/utils/checkFile.js'
import reportDialog from './investigationReport/components/reportDialog.vue'
import addProcess from './processReport/components/addProcess.vue'
import addWorkInjury from './workInjuryManage/components/addWorkInjury.vue'

export default {
  name: 'machineAccount',
  components: {
    ReportDialog: reportDialog,
    AddProcess: addProcess,
    AddWorkInjury: addWorkInjury,
  },
  data() {
    return {
      isLoading: false,
      companyList: [],
      dateRange: [],
      tableData: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        accidentName: '',
        accidentNature: '',
        accidentType: '',
        startDate: '',
        endDate: '',
        occurringUnit: '', // 所属公司的部门id
      },
      total: 0,
      fromEvaluate: false, // 判断是否从评价管理-指标分析页面跳转过来的，默认false
    }
  },
  watch: {
    dateRange(val, oldVal) {
      this.queryParams.startDate = val?.[0] || null
      this.queryParams.endDate = val?.[1] || null
    },
  },
  created() {
    // 从评价管理过来的话，携带的参数
    this.fromEvaluate = this.$route.params.fromEvaluate || false
    if (this.fromEvaluate) {
      this.queryParams.accidentNature = this.$route.params.typeName || ''
      this.queryParams.occurringUnit = this.$route.params.departmentId || ''
      this.queryParams.personLiable = this.$route.params.userId || ''
      this.queryParams.startDate = this.$route.params.startDate || ''
      this.queryParams.endDate = this.$route.params.endDate || ''
      this.backPageNum = this.$route.params.pageNum || 1 // 返回评价管理时，需要说明返回第几页
    }
    this.getList()
  },
  methods: {
    showFileWindow,
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.dateRange = []
      Object.assign(this.queryParams, this.$options.data().queryParams)
      this.handleQuery()
    },
    async getList() {
      this.isLoading = true
      const res = await accidentAccountPage(this.queryParams)
      this.isLoading = false
      if (res.success) {
        this.tableData = res.result.list || []
        this.total = res.result.total
      }
      else {
        this.$message.warning(res.message || '查询失败')
      }
    },
    operateFn(data, flag) {
      if (flag == 'investigation') {
        this.$refs.reportDialog.visible = true
        this.$refs.reportDialog.page_type = 'look'
        this.$refs.reportDialog.accidentId = data
        // 调查报告详情 需要查看审批人
        this.$refs.reportDialog.showAudit = true
        this.$refs.reportDialog.showMoreAuditDetails = true

        this.$refs.reportDialog.fileProp.editable = false
      }
      else if (flag == 'process') {
        this.$refs.addAccident.visible = true
        this.$refs.addAccident.page_type = 'audit_look'
        this.$refs.addAccident.inputForm.handlingId = data
        // this.$refs.addAccident.inputForm.handlerId =
        this.$refs.addAccident.fileProp.editable = false
      }
      else if (flag == 'del') {
        this.$confirm('是否确认删除当前数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(async () => {
          this.isLoading = true
          const res = await accidentAccountDelete({ id: data.handlingId }) // 之前是accidentNumber
          this.isLoading = false
          if (res.success) {
            this.handleQuery()
            this.$message.success(res.message || '删除成功')
          }
          else {
            this.$message.warning(res.message || '删除失败')
          }
        })
      }
      else if (flag == 'workI') {
        // 查看
        this.$refs.addWorkInjuryDialog.visible = true
        this.$refs.addWorkInjuryDialog.init({ ...data, id: data.workInjuryId }, 'look')
      }
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
    v-loading="isLoading"
    :isShowLeft="false"
    :isShowSearch="!fromEvaluate"
  >
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item label="事故性质">
        <el-select
          v-model="queryParams.accidentNature"
          placeholder="全部"
          clearable
          filterable
        >
          <el-option
            v-for="item in $dictUtils.getDictList('character_accident')"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.dictCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="事故名称">
        <el-input
          v-model="queryParams.accidentName"
          placeholder="事故名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="事故发生时间">
        <el-date-picker
          v-model="dateRange"
          unlink-panels
          value-format="yyyy-MM-dd HH:mm:ss"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item label="事故类型">
        <el-select
          v-model="queryParams.accidentType"
          placeholder="全部"
          clearable
          filterable
        >
          <el-option
            v-for="item in $dictUtils.getDictList('reasonType')"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.dictName"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-search"
          @click="handleQuery"
        >
          查询
        </el-button>
        <el-button
          size="mini"
          icon="el-icon-refresh-right"
          @click="resetQuery"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <div slot="auxiliary">
      <el-button
        v-if="fromEvaluate"
        type="primary"
        plain
        @click="goBack"
      >
        返回
      </el-button>
    </div>
    <!-- 表格 -->
    <el-table
      slot="table"
      height="100%"
      :data="tableData"
      :header-cell-style="{
        borderLeft: 'none',
        borderRight: 'none',
        background: '#F6F7FA',
      }"
      align="center"
    >
      <el-table-column
        fixed
        label="序号"
        align="center"
        min-width="50"
      >
        <template slot-scope="scope">
          {{ queryParams.pageSize * (queryParams.pageNum - 1) + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="事故编号"
        prop="accidentNumber"
        align="center"
      />
      <el-table-column
        label="事故名称"
        prop="accidentName"
        align="center"
      />
      <el-table-column
        label="事故发生位置"
        prop="placeOfOccurrence"
        align="center"
        min-width="100px"
      />
      <el-table-column
        :show-overflow-tooltip="true"
        label="事故发生时间"
        prop="timeOfAccident"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="事故类型"
        prop="accidentType"
        align="center"
      />
      <el-table-column
        label="事故性质"
        prop="accidentNature"
        align="center"
      >
        <template slot-scope="scope">
          {{ $dictUtils.getDictLabel('character_accident', scope.row.accidentNature) }}
        </template>
      </el-table-column>
      <el-table-column
        label="事故调查报告"
        prop="surveyEnclosure"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="showFileWindow(scope.row.surveyEnclosureAddress)"
          >
            {{ scope.row.surveyEnclosure }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="调查报告审批状态"
        prop="surveyStatus"
        align="center"
        min-width="120px"
      />
      <el-table-column
        label="调查报告详情"
        prop="companyName"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="operateFn(scope.row.accidentId, 'investigation')"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="事故处理报告"
        prop="accidentEnclosure"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="showFileWindow(scope.row.accidentEnclosureAddress)"
          >
            {{ scope.row.accidentEnclosure }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="处置报告审批状态"
        prop="accidentStatus"
        align="center"
        min-width="120px"
      />
      <el-table-column
        label="处置报告详情"
        prop="accidentDetailsId"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="operateFn(scope.row.handlingId, 'process')"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="工伤详情"
        prop="companyName"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="operateFn(scope.row, 'workI')"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="150"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('accident-book-delete')"
            type="text"
            style="color: var(--ky-danger)"
            @click="operateFn(scope.row, 'del')"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
      style="margin: 0 20px 0 0"
      :current-page.sync="queryParams.pageNum"
      :page-size.sync="queryParams.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      @current-change="getList"
      @size-change="getList"
    />
    <report-dialog
      slot="dialog"
      ref="reportDialog"
      @getList="getList"
    />
    <add-process
      slot="dialog"
      ref="addAccident"
      @getList="getList"
    />
    <add-work-injury
      slot="dialog"
      ref="addWorkInjuryDialog"
      @getList="getList"
    />
  </KyTreeTable>
</template>

<style scoped lang="scss"></style>
