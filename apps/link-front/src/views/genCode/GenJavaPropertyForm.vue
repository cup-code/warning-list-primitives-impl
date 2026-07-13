<script>
import { getFieldsFn } from '@/http/safe-production/genCode/table-list-api'

export default {
  data() {
    return {
      dialogTableVisible: false,
      javaFields: [],
      dataListSelections: [],
      type: 1,
      row: '',
    }
  },
  methods: {
    init(row, type) {
      this.row = row
      this.type = type
      this.dialogTableVisible = true
      const params = {
        value: row.javaType,
      }
      getFieldsFn(params).then(({ data }) => {
        this.javaFields = data.genCustomObj.genCustomFieldList
        this.javaFields.forEach((item, index) => {
          if (
            row.javaField.includes('.'.concat(item.name, '|'))
            || row.javaField.includes('|'.concat(item.name, '|'))
            || row.javaField.endsWith('|'.concat(item.name))
            || row.javaField.endsWith('.'.concat(item.name))
          ) {
            this.$nextTick(function () {
              this.$refs.propretyTable.toggleRowSelection(this.javaFields[index], true)
            })
          }
        })
      })
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val
    },
    doSubmit() {
      this.dataListSelections.sort((a, b) => {
        return a.sort - b.sort
      })
      if (this.type === 1 || this.type === 3) {
        const fieldLabels = this.dataListSelections
          .map((item) => {
            return item.remarks
          })
          .join('|')
        this.$emit('getJavaFieldLabels', fieldLabels)
      }
      if (this.type === 2 || this.type === 3) {
        const fieldNames = this.dataListSelections
          .map((item) => {
            return item.name
          })
          .join('|')
        this.$emit('getJavaFieldNames', fieldNames)
      }
      this.dialogTableVisible = false
    },
  },
}
</script>

<template>
  <el-dialog

    title="选择关联字段"
    append-to-body
    :visible.sync="dialogTableVisible"
  >
    <el-table
      ref="propretyTable"
      :data="javaFields"
      :header-cell-style="{ background: '#f5f5f5' }"
      @selection-change="selectionChangeHandle"
    >
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="50"
      />
      <el-table-column
        prop="name"
        align="center"
        label="java属性"
      />
      <el-table-column
        prop="remarks"
        align="center"
        label="说明"
      />
    </el-table>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="dialogTableVisible = false"
      >关闭</el-button>
      <el-button
        v-noMoreClick
        type="primary"
        size="small"
        @click="doSubmit"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
