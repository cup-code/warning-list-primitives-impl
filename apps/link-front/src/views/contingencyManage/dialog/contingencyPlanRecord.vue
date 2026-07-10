/* * @Author: yangjie 应急预案审批流转记录弹框 * @Date: 2023-03-14 14:55:13 */
<script>
import { getFlowRecordById } from '@/http/contingency/contingencyPlan.js'
// 应急预案接口路径
export default {
  data() {
    return {
      visible: false,
      loading: false,
      tableData: [],
      sForm: {},
    }
  },
  created() {},
  methods: {
    init(row, method) {
      this.visible = true
      this.method = method
      if (row) {
        // 查看应急记录
        getFlowRecordById(row.id)
          .then((data) => {
            this.tableData = data.result.list
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    getDataList() {
      // 查询记录
      this.loading = true
    },
  },
}
</script>

<template>
  <el-dialog
    title="流转记录"
    :close-on-click-modal="false"
    width="800px"

    :visible.sync="visible"
    class="normal-dialog"
  >
    <!-- 表格 -->
    <el-table
      ref="table"
      v-loading="loading"
      :data="tableData"
      size="mini"
      height="600"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
    >
      <el-table-column
        label="序号"
        type="index"
        width="50"
      />
      <el-table-column
        label="流转时间"
        prop="flowTime"
        align="center"
      />
      <el-table-column
        label="经办人"
        prop="flowPerson"
        align="center"
      />
      <el-table-column
        label="流程节点"
        prop="flowCore"
        align="center"
      />
      <el-table-column
        label="下一经办人"
        prop="nextFlowPerson"
        align="center"
      />
      <el-table-column
        label="下一节点"
        prop="nextFlowCore"
        align="center"
      />
    </el-table>
  </el-dialog>
</template>
