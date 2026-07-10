<!-- @description： investigationReport 事故处理报告 -->
<!--  @modified By： lee -->
<!--  @version: 1.0.0  -->
<script>
import {
  accidentHandlingDelete,
  reportApprovalPage,
} from '@/http/accidentHandling/accidentHandling.js'
import { showFileWindow } from '@/utils/checkFile.js'
import addProcess from './components/addProcess.vue'
import approvalRecords from './components/approvalRecords.vue'

export default {
  name: 'processReport',
  components: {
    AddProcess: addProcess,
    ApprovalRecords: approvalRecords,
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
        startDate: '',
        endDate: '',
      },
      total: 0,
      reasonTypeOptions: [],
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
    statusFormatter(row) {
      if (row.preventiveMeasureVOList) {
        return row.preventiveMeasureVOList
          .map((res, index) => {
            if (res.measures != '') {
              const data = `${index + 1}` + `:${res.measures}`
              return data
            }
          })
          .join(',')
      }
    },
    penaltyDescriptionFormatter(row) {
      if (row.penaltyMeasuresVOList) {
        return row.penaltyMeasuresVOList
          .map((res, index) => {
            if (res.penaltyDescription != '') {
              const data = `${index + 1}` + `:${res.penaltyDescription}`
              return data
            }
          })
          .join(',')
      }
    },
    async getList() {
      this.isLoading = true
      const res = await reportApprovalPage(this.queryParams)
      this.isLoading = false
      if (res.success) {
        this.tableData = res.result.list || []
        this.total = res.result.total
      }
      else {
        this.$message.warning(res.message || '查询失败')
      }
    },
    // 查看修改
    operateFn(data, params) {
      if (params == 'find') {
        this.$refs.addAccident.visible = true
        this.$refs.addAccident.page_type = params
        this.$refs.addAccident.inputForm.handlingId = data.handlingId
        this.$refs.addAccident.fileProp.editable = false
      }
      else if (params == 'edit') {
        this.$refs.addAccident.visible = true
        this.$refs.addAccident.page_type = params
        this.$refs.addAccident.inputForm.handlingId = data.handlingId
      }
      else if (params == 'del') {
        // 删除
        this.$confirm('是否确认删除当前数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(async () => {
          this.isLoading = true
          const res = await accidentHandlingDelete({ id: data.handlingId })
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
      else if (params == 'approvalRecords') {
        this.$refs.records.visible = true
        this.$refs.records.getList(data)
      }
    },
    // 新增
    operateBtn() {
      this.$refs.addAccident.visible = true
      this.$refs.addAccident.page_type = 'add'
    },
    // 删除
    delClick() {},
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
      <el-form-item label="事故性质">
        <el-select
          v-model="queryParams.accidentNature"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option
            v-for="item in $dictUtils.getDictList('character_accident')"
            :key="item.id"
            :label="item.dictName"
            :value="item.dictCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="事故发生时间">
        <el-date-picker
          v-model="dateRange"
          unlink-panels
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd HH:mm:ss"
        />
      </el-form-item>
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
    </el-form>
    <div slot="auxiliary">
      <el-button
        v-if="hasBtnPermission('accident_process_add')"
        type="primary"
        icon="el-icon-plus"
        @click="operateBtn('add')"
      >
        新增
      </el-button>
    </div>
    <!-- 表格 -->
    <el-table
      slot="table"
      height="100%"
      :data="tableData"
      :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
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
      <!-- <el-table-column label="处理报告名称" prop="report" align="center" /> -->
      <el-table-column
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
        label="事故类型"
        prop="accidentType"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="事故调查报告"
        prop="enclosure"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="showFileWindow(scope.row.enclosureAddress)"
          >
            {{ scope.row.enclosure }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="事故性质"
        prop="accidentNature"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          {{ $dictUtils.getDictLabel('character_accident', scope.row.accidentNature) }}
        </template>
      </el-table-column>
      <el-table-column
        label="处罚措施"
        prop="Penalties"
        align="center"
        min-width="100px"
        :formatter="penaltyDescriptionFormatter"
      />
      <el-table-column
        label="预防或纠正措施"
        prop="preventiveMeasureVOList"
        align="center"
        min-width="100px"
        :formatter="statusFormatter"
      />
      <el-table-column
        label="纠正预防措施状态"
        prop="state"
        align="center"
        min-width="160px"
      />
      <el-table-column
        label="审批状态"
        prop="approvalStatus"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="审批扭转记录"
        prop="ApprovalRecording"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('accident_process_audit_record')"
            type="text"
            @click="operateFn(scope.row, 'approvalRecords')"
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
            v-if="hasBtnPermission('accident_process_view')"
            type="text"
            @click="operateFn(scope.row, 'find')"
          >
            查看
          </el-button>
          <el-button
            v-if="!scope.row.approvalStatus && hasBtnPermission('accident_process_modify')"
            type="text"
            style="color: var(--ky-warning)"
            @click="operateFn(scope.row, 'edit')"
          >
            修改
          </el-button>
          <el-button
            v-if="!scope.row.approvalStatus && hasBtnPermission('accident_process_delete')"
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
    <add-process
      slot="dialog"
      ref="addAccident"
      @getList="getList"
    />
    <!-- 审批扭转记录 -->
    <approval-records
      slot="dialog"
      ref="records"
    />
  </SearchTable>
</template>
