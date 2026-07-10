<script>
import { RiskLevel } from '@/views/doubleDefense/shandong/config/constant.js'
// import { RiskLevelList } from '../common/constant'
export default {
  name: 'RiskListTable',
  props: {
    tableData: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      // 风险等级下拉列表
      RiskLevel,
    }
  },
  computed: {
    /* 设置风险等级样式 */
    setDangerLv() {
      return function (riskLv) {
        let name = ''
        let bgColor = ''
        for (const item of this.RiskLevel) {
          if (item.value == riskLv) {
            name = item.label
            bgColor = item.bgColor
          }
        }
        return {
          style: `padding:4px 6px;border-radius: 2px;background:${bgColor};`,
          name,
        }
      }
    },
  },
  created() {},
  mounted() {},
  methods: {},
}
</script>

<template>
  <div style="height: 100%">
    <el-table
      :data="tableData"
      stripe
      :highlight-current-row="true"
      height="100%"
    >
      <el-table-column
        label="序号"
        align="center"
        type="index"
        width="80"
      />
      <el-table-column
        label="流转时间"
        align="center"
        prop="transferTime"
        width="160"
      />
      <el-table-column
        label="经办人"
        align="center"
        prop="assigneeName"
        width="120"
      />
      <el-table-column
        label="当前节点"
        align="center"
        prop="point"
        min-width="160"
      />
      <el-table-column
        label="备注"
        align="center"
        prop="remark"
        min-width="160"
      />
      <el-table-column
        label="下一经办人"
        align="center"
        width="120"
        prop="nextAssigneeName"
      />
      <el-table-column
        label="下一流程"
        align="center"
        min-width="160"
        prop="nextPoint"
      />
    </el-table>
  </div>
</template>

<style lang="scss" scoped></style>
