<!-- @description：investigationAudit 事故处理审批列表 -->
<!--  @modified By：  -->
<!--  @version: 1.0.0  -->
<script>
import { getApprovalList } from '@/http/accidentHandling/accidentHandling.js'
// import viewList from './components/viewList.vue'
// import viewApprove from './components/viewApprove.vue'
import { showFileWindow } from '@/utils/checkFile.js'
import addProcess from './components/addProcess.vue'
import approvalRecords from './components/approvalRecords.vue'

export default {
  name: 'processAudit',
  components: {
    // viewList,
    // viewApprove,
    AddProcess: addProcess,
    ApprovalRecords: approvalRecords,
  },
  data() {
    return {
      isLoading: false,
      companyList: [],
      dateRange: [],
      tableData: [],
      recordsdata: '',
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
    this.handleQuery()
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
      const res = await getApprovalList(this.queryParams)
      this.isLoading = false
      if (res.success) {
        this.tableData = res.result.list || []
        this.total = res.result.total
      }
      else {
        this.$message.warning(res.message || '查询失败')
      }
    },
    operateFn(data, param) {
      if (param == 'approvalRecords') {
        this.$refs.records.visible = true
        this.$refs.records.getList(data)
      }
      else if (param == 'audit_look' || param == 'audit') {
        this.$refs.addAccident1.visible = true
        this.$refs.addAccident1.page_type = param
        // 事故处理审批详情需要这三个参数 ：处理报告id，处理人id，审批序号
        this.$refs.addAccident1.inputForm.handlingId = data.handlingId // 处理报告id
        this.$refs.addAccident1.inputForm.approvalNo = data.approvalNo // 审批序号
        this.$refs.addAccident1.inputForm.handlerId = data.handlerId // 处理人id
        this.$refs.addAccident1.auditForm.relationId = data.reportId
        this.$refs.addAccident1.fileProp.editable = false
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
      <el-form-item label="事故性质">
        <el-select
          v-model="queryParams.accidentNature"
          placeholder="请选择"
          style="width: 100%"
        >
          <el-option
            v-for="item in $dictUtils.getDictList('character_accident')"
            :key="item.dictCode"
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
            v-if="hasBtnPermission('accident_process_audit_view')"
            type="text"
            @click="operateFn(scope.row, 'audit_look')"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('accident_process_audit')"
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
    <!-- 查看 -->
    <!-- <view-list slot="dialog" ref="viewlist"></view-list> -->
    <!-- 审批 -->
    <!-- <view-approve slot="dialog" ref="viewapprove"></view-approve> -->

    <add-process
      slot="dialog"
      ref="addAccident1"
      @getList="getList"
    />
    <!-- 审批扭转记录 -->
    <approval-records
      slot="dialog"
      ref="records"
    />
  </SearchTable>
</template>

<style scoped lang="scss"></style>
