<!-- @description：investigationAudit 事故调查审批列表 -->
<!--  @modified By：  -->
<!--  @version: 1.0.0  -->
<script>
import { surveyApprovalPage } from '@/http/accidentManage/investigation'
import reportDialog from './components/reportDialog.vue'

export default {
  name: 'investigationAudit',
  components: {
    ReportDialog: reportDialog,
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
        approvalStatus: '',
        handlerId: '',
        // startDate: '2023-03-31 12:00:00',
        // endDate: '2023-03-31 12:00:00'
        startDate: null,
        endDate: null,
      },
      total: 0,
    }
  },
  watch: {
    dateRange(val, oldVal) {
      this.queryParams.startDate = val?.[0] || null
      this.queryParams.endDate = val?.[1] || null
    },
  },
  created() {
    this.getList()
  },
  methods: {
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
      const res = await surveyApprovalPage(this.queryParams)
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
      this.$refs.reportDialog.page_type = flag
      this.$refs.reportDialog.visible = true
      this.$refs.reportDialog.accidentId = data.accidentId
      this.$refs.reportDialog.handlerId = data.handlerId
      this.$refs.reportDialog.approvalNo = data.approvalNo
      this.$refs.reportDialog.reportId = data.reportId
      this.$refs.reportDialog.auditForm.relationId = data.reportId
      // if (flag == 'look') {
      //   // 查看
      //   this.$refs.reportDialog.visible = true
      //   this.$refs.reportDialog.id = data.id
      //   this.$refs.reportDialog.fileProp.editable = false
      // } else if (flag == 'audit') {
      //   this.$refs.reportDialog.visible = true
      //   this.$refs.reportDialog.id = data.id
      //   this.$refs.reportDialog.fileProp.editable = false
      // }
    },
  },
}
</script>

<template>
  <SearchTable v-loading="isLoading">
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item label="事故名称">
        <el-input
          v-model="queryParams.accidentName"
          placeholder="事故名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="审批状态">
        <el-select
          v-model="queryParams.approvalStatus"
          placeholder="全部"
          clearable
          filterable
        >
          <el-option
            v-for="item in $dictUtils.getDictList('check_status')"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.dictName"
          />
        </el-select>
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
      <el-form-item label="事故发生时间">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd HH:mm:ss"
          unlink-panels
        />
      </el-form-item>
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
        :show-overflow-tooltip="true"
        label="事故名称"
        prop="accidentName"
        align="center"
      />
      <el-table-column
        :show-overflow-tooltip="true"
        label="事故发生时间"
        prop="timeOfAccident"
        align="center"
        min-width="100px"
      />
      <el-table-column
        :show-overflow-tooltip="true"
        label="首次调查时间"
        prop="timeOfFirstInvestigation"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="首次调查地点"
        prop="locationOfTheFirstInvestigation"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="首次调查人员"
        prop="firstInvestigator"
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
        label="审批人员"
        prop="handler"
        align="center"
      />
      <el-table-column
        label="审批日期"
        prop="circulationTime"
        align="center"
      />
      <el-table-column
        label="审批状态"
        prop="approvalStatus"
        align="center"
      />
      <el-table-column
        label="操作"
        width="150"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('accident_investigation_audit_view')"
            type="text"
            @click="operateFn(scope.row, 'audit_look')"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('accident_investigation_audit')"
            type="text"
            style="color: var(--ky-warning)"
            @click="operateFn(scope.row, 'audit')"
          >
            审批
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
  </SearchTable>
</template>

<style scoped lang="scss"></style>
