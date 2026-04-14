<!-- @description：recordDialog 事故调查报告审批扭转记录 -->
<!--  @modified By：  -->
<!--  @version: 1.0.0  -->
<script>
import { approvalRecordPage } from '@//http/accidentManage/investigation'

export default {
  name: 'recordDialog',
  data() {
    return {
      visible: false,
      tableData: [],
      loading: false,
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        id: '',
      },
      total: 0,
    }
  },
  methods: {
    async getList() {
      this.loading = true
      const res = await approvalRecordPage(this.queryParams)
      this.loading = false
      if (res.success) {
        this.tableData = res.result.list || []
        this.total = res.result.total
      }
      else {
        this.$message.warning(res.message || '查询失败')
      }
    },
    handleQuery(id) {
      this.queryParams.id = id
      this.getList()
    },

    closeDialog() {
      this.tableData = []
      Object.assign(this.queryParams, this.$options.data().queryParams)
    },
  },
}
</script>

<template>
  <el-dialog
    title="事故调查报告审批扭转记录"
    :close-on-click-modal="false"
    width="800px"

    :visible.sync="visible"
    class="normal-dialog"
    @close="closeDialog"
  >
    <!-- 表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      :header-cell-style="{
        background: '#f5f5f5',
        borderLeft: 'none',
        borderRight: 'none',
      }"
      align="center"
    >
      <el-table-column
        label="序号"
        type="index"
        width="50"
      />
      <el-table-column
        label="流转时间"
        prop="circulationTime"
        align="center"
      />
      <el-table-column
        label="经办人"
        prop="handler"
        align="center"
      />
      <el-table-column
        label="流程节点"
        prop="processNode"
        align="center"
      />
      <el-table-column
        label="下一经办人"
        prop="nextOperator"
        align="center"
      />
      <el-table-column
        label="下一节点"
        prop="nextNode"
        align="center"
      />
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      style="margin: 0 20px 0 0; text-align: right"
      :current-page.sync="queryParams.pageNum"
      :page-size.sync="queryParams.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      @current-change="getList"
      @size-change="getList"
    />
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
    </span>
  </el-dialog>
</template>

<style scoped lang="scss"></style>
