/* * @Author: xiaorui 目标配置中，选择目标的弹框 * @Date: 2023-04-28 09:52:38 * @Last Modified by:
xiaorui * @Last Modified time: 2023-04-28 11:26:23 */
<script>
import { TargetConfigList } from '../constant'

export default {
  data() {
    return {
      visible: false,
      TargetConfigList,
      choosedTarget: [], // 选中的考核项
    }
  },
  methods: {
    init(choosedTarget) {
      // 这里要从源数据里找出对应的数据，否则因为object发生变化，会赋值不上
      const rows = []
      choosedTarget.forEach((item) => {
        const obj = this.TargetConfigList.find((target) => {
          return target.code === item.code
        })
        rows.push(obj)
      })
      this.visible = true
      this.$nextTick(() => {
        this.$refs.multipleTable.clearSelection()
        rows.forEach((row) => {
          this.$refs.multipleTable.toggleRowSelection(row, true)
        })
      })
    },
    handleSelectionChange(val) {
      this.choosedTarget = val
    },
    submitTarget() {
      this.visible = false
      this.$emit('setChooseTarget', this.choosedTarget)
    },
  },
}
</script>

<template>
  <el-dialog
    title="选择考核目标"
    :close-on-click-modal="false"

    :visible.sync="visible"
    class="normal-dialog"
    :append-to-body="true"
  >
    <el-table
      ref="multipleTable"
      :data="TargetConfigList"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="55"
      />
      <el-table-column
        label="序号"
        type="index"
        width="50"
      />
      <el-table-column
        align="center"
        label="考核目标"
        min-width="130"
      >
        <template slot-scope="scope">
          <el-input
            v-model="scope.row.name"
            type="textarea"
            :rows="3"
            :disabled="scope.row.type === 0"
          />
        </template>
      </el-table-column>
    </el-table>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        style="margin: 0 10px 0 0"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        size="small"
        type="primary"
        @click="submitTarget()"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
