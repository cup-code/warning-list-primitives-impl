/* * @Author: xiaorui 隐患台账流转日志的弹框 * @Date: 2023-02-23 09:46:39 * @Last Modified by:
xiaorui * @Last Modified time: 2023-02-27 10:07:11 */
<script>
import { getTroubleLogFn } from '@/http/defense/shandong/safeCheck-api'

export default {
  data() {
    return {
      visible: false,
      loading: false,
      tableData: [],
      troubleId: '',
    }
  },
  methods: {
    init(troubleId) {
      this.troubleId = troubleId
      this.visible = true
      this.getTableData()
    },
    getTableData() {
      this.loading = true
      getTroubleLogFn(this.troubleId)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result || []
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据失败', err)
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>

<template>
  <el-dialog
    title="流转日志"
    :close-on-click-modal="false"

    :visible.sync="visible"
    class="normal-dialog"
  >
    <el-table
      v-loading="loading"
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      align="center"
      :height="300"
    >
      <el-table-column
        label="序号"
        align="center"
        type="index"
        width="50"
      />
      <el-table-column
        label="流转时间"
        align="center"
        prop="flowTime"
        min-width="100"
      />
      <el-table-column
        label="经办人"
        align="center"
        prop="agent"
        min-width="100"
      />
      <el-table-column
        label="流程节点"
        align="center"
        prop="processNode"
        min-width="100"
      />
      <el-table-column
        label="下一经办人"
        align="center"
        prop="nextAgent"
        min-width="100"
      />
      <el-table-column
        label="下一流程"
        align="center"
        prop="nextProcessNode"
        min-width="100"
      />
    </el-table>
  </el-dialog>
</template>
