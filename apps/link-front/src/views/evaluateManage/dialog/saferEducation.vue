/* * @Author: xiaorui 安全员教育培训详情 * @Date: 2023-11-08 11:31:04 * @Last Modified by:
xiaorui * @Last Modified time: 2024-01-11 14:49:37 */
<script>
import { getUserTrainRecordFn } from '@/http/safe-production/user-manage-api'
// import { rowRenderStatus } from 'link-sdk'
export default {
  data() {
    return {
      minWidth: 120,
      visible: false,
      isLoading: false,
      tableData: [],
      total: 0,
      sForm: {
        pageNum: 1,
        pageSize: 10,
        studyType: 1,
      },
    }
  },
  methods: {
    // rowRenderStatus,
    init(row) {
      this.visible = true
      this.sForm.pageNum = 1
      this.sForm.evaluateDepartmentId = row.departmentId
      this.sForm.evaluateStartTime = row.evaluationStart
      this.sForm.evaluateEndTime = row.evaluationEnd
      this.getDataList()
    },
    getDataList() {
      this.isLoading = true
      getUserTrainRecordFn(this.sForm)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total || 0
          }
          else {
            this.$message.warning(data.message || '获取表格数据失败')
          }
        })
        .catch(() => {
          this.$message.error('获取表格数据出错')
        })
        .finally(() => {
          this.isLoading = false
        })
    },
  },
}
</script>

<template>
  <el-dialog
    class="large-dialog"
    :close-on-click-modal="false"
    :visible.sync="visible"
    title="教育培训详情"
    append-to-body
  >
    <el-table
      v-loading="isLoading"
      height="80%"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
      :border="true"
      class="customer-table"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
        fixed="left"
      />
      <el-table-column
        label="姓名"
        prop="userName"
        align="center"
      />
      <el-table-column
        label="部门"
        prop="deptName"
        align="center"
      />
      <el-table-column
        label="任务来源分类"
        prop="sourceType"
        align="center"
        :min-width="minWidth"
      />
      <el-table-column
        label="任务来源名称"
        prop="sourceName"
        align="center"
        :min-width="minWidth"
      />
      <el-table-column
        label="内容类型"
        prop="contentType"
        align="center"
        :min-width="minWidth"
      />
      <el-table-column
        label="培训任务名称"
        prop="contentName"
        align="center"
        :min-width="minWidth"
      />
      <el-table-column
        label="关联考试任务名称"
        align="center"
        prop="examName"
      />
      <el-table-column label="任务时间" align="center">
        <template slot-scope="scope">
          {{ `${scope.row.taskStartTime}至${scope.row.taskEndTime}` }}
        </template>
      </el-table-column>
      <el-table-column label="培训状态" align="center">
        <template slot-scope="scope">
          <div v-html="$rowRenderStatus(scope.row.trainStatus)" />
        </template>
      </el-table-column>
      <el-table-column
        label="计划时长(分)"
        align="center"
        prop="needLearnDuration"
      />
      <el-table-column
        label="已学习(分)"
        align="center"
        prop="passLearnDuration"
      />
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      :disabled="isLoading"
      style="text-align: right"
      :current-page.sync="sForm.pageNum"
      :page-size.sync="sForm.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      @current-change="getDataList"
      @size-change="getDataList"
    />
  </el-dialog>
</template>
