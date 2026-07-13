<script>
import { getWorkRecord } from '@/http/specialOperation/specialWork-api.js'

export default {
  props: {
    // 作业票类型
    workTicketType: {
      type: Number,
      default: 1001,
    },
    // 特殊作业id
    sid: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      tableData: [],
    }
  },
  created() {
    setTimeout(() => {
      this.getWorkRecordFn(this.sid)
    }, 300)
  },
  methods: {
    getWorkRecordFn(id) {
      getWorkRecord(id).then(({ data }) => {
        if (data.success) {
          this.tableData = data.result || []
        }
      })
    },
  },
}
</script>

<template>
  <div class="handle">
    <el-table
      :data="tableData"
      row-key="sort"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      align="center"
    >
      <el-table-column
        label="序号"
        align="center"
        type="index"
      />
      <el-table-column
        label="申请时间"
        align="center"
        prop="createdTime"
        width="140"
      />
      <el-table-column
        label="经办人"
        align="center"
        prop="agentName"
        width="140"
      />
      <el-table-column
        label="当前节点"
        align="center"
        prop="processNode"
        width="100"
      />
      <el-table-column
        label="下一经办人"
        align="center"
        width="180"
        prop="nextAgentName"
      />
      <el-table-column
        label="下一流程"
        align="center"
        width="180"
        prop="nextProcessNode"
      />
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
.handle {
  height: 800px;
}
</style>
