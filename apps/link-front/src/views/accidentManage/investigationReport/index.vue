<!-- @description： investigationReport 事故调查报告 -->
<!--  @modified By： lee -->
<!--  @version: 1.0.0  -->
<script>
import {
  accidentInvestigationDelete,
  accidentInvestigationReportPage,
} from '@/http/accidentManage/investigation'
import addAccident from './components/addAccident.vue'
import recordDialog from './components/recordDialog.vue'
import reportDialog from './components/reportDialog.vue'

export default {
  name: 'investigationReport',
  components: {
    AddAccident: addAccident,
    ReportDialog: reportDialog,
    RecordDialog: recordDialog,
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
        startDate: '',
        endDate: '',
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
      const res = await accidentInvestigationReportPage(this.queryParams)
      this.isLoading = false
      if (res.success) {
        this.tableData = res.result.list || []
        this.total = res.result.total
      }
      else {
        this.$message.warning(res.message || '查询失败')
      }
    },
    // 顶部按钮
    operateBtn(flag) {
      if (flag == 'send') {
        // 事故上报
        this.$refs.addAccident.visible = true
      }
      else if (flag == 'add') {
        // 新增调查报告
        this.$refs.reportDialog.visible = true
        this.$refs.reportDialog.page_type = 'add'
      }
    },
    // 列表栏按钮
    operateFn(data, flag) {
      if (flag == 'record') {
        // 扭转记录
        this.$refs.recordDialog.visible = true
        this.$refs.recordDialog.handleQuery(data.accidentId)
      }
      else if (flag == 'look') {
        // 查看
        this.$refs.reportDialog.visible = true
        this.$refs.reportDialog.page_type = flag
        this.$refs.reportDialog.accidentId = data.accidentId
      }
      else if (flag == 'edit') {
        // 编辑
        this.$refs.reportDialog.visible = true
        this.$refs.reportDialog.page_type = flag
        this.$refs.reportDialog.accidentId = data.accidentId
      }
      else if (flag == 'del') {
        // 删除
        this.$confirm('是否确认删除当前数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(async () => {
          this.isLoading = true
          const res = await accidentInvestigationDelete({ id: data.accidentId })
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
          type="daterange"
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
    <div slot="auxiliary">
      <el-button
        v-if="hasBtnPermission('accident_investigation_add')"
        type="primary"
        icon="el-icon-plus"
        @click="operateBtn('send')"
      >
        事故上报
      </el-button>
      <el-button
        v-if="hasBtnPermission('accident_investigation_report_add')"
        type="primary"
        icon="el-icon-plus"
        @click="operateBtn('add')"
      >
        新增调查报告
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
        :show-overflow-tooltip="true"
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
        label="事故上报时间"
        prop="accidentReportingTime"
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
        label="首次被调查人"
        prop="firstRespondent"
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
        label="审批状态"
        prop="approvalStatus"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="审批扭转记录"
        prop="companyName"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            style="color: var(--ky-success)"
            @click="operateFn(scope.row, 'record')"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        width="120"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('accident_investigation_report_view')"
            type="text"
            @click="operateFn(scope.row, 'look')"
          >
            查看
          </el-button>
          <el-button
            v-if="
              !scope.row.approvalStatus && hasBtnPermission('accident_investigation_report_modify')
            "
            type="text"
            style="color: var(--ky-warning)"
            @click="operateFn(scope.row, 'edit')"
          >
            修改
          </el-button>
          <el-button
            v-if="
              !scope.row.approvalStatus && hasBtnPermission('accident_investigation_report_delete')
            "
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
    <add-accident
      slot="dialog"
      ref="addAccident"
      @getList="getList"
    />
    <report-dialog
      slot="dialog"
      ref="reportDialog"
      @getList="getList"
    />
    <record-dialog
      slot="dialog"
      ref="recordDialog"
    />
  </SearchTable>
</template>

<style scoped lang="scss"></style>
