<script>
export default {
  name: 'CTable',
  props: {
    loading: Boolean,
    selection: Boolean,
    list: {
      type: Array,
      default: () => [],
    },
    tableData: {
      type: Array,
      default: () => [],
    },
    height: {
      type: [String, Number],
      default: 'auto',
    },
    selectable: {
      type: Function,
      default: null,
    },
    type: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      headerCellStyle: { background: 'var(--ky-head-color)' },
    }
  },
  methods: {
    getColumnProps(item) {
      return {
        prop: item.prop,
        label: item.label,
        type: item.type,
        fixed: item.fixed || false,
        align: item.align || 'center',
        minWidth: item.width || 150,
        reserveSelection: item.reserveSelection || null,
      }
    },
    handleSelectionChange(s) {
      console.log(s, 's')
      this.$emit('select', s)
    },
    setSelection(rows) {
      console.log(rows, 'rows')

      this.$nextTick(() => {
        if (Array.isArray(rows) && rows.length > 0) {
          rows.forEach((row) => {
            const index = this.tableData.findIndex(item => item.id === row.id)
            if (index !== -1) {
              // this.tableData[index].isSelected = true;
              this.$refs.table.toggleRowSelection(this.tableData[index], true)
            }
          })
        }
        else {
          this.$refs.table.clearSelection()
        }
      })
    },
  },
}
</script>

<template>
  <el-table
    ref="table"
    v-loading="loading"
    :data="tableData"
    :height="height"
    :header-cell-style="headerCellStyle"
    reserve-selection
    @selection-change="handleSelectionChange"
  >
    <el-table-column v-if="selection" type="selection" width="55" />
    <el-table-column v-if="type" :type="type" label="序号" />
    <el-table-column
      v-for="(item, index) in list"
      :key="item.prop || index"
      :type="item.type"
      v-bind="getColumnProps(item)"
    >
      <template #default="{ row }">
        <slot v-if="item.slot" :name="item.slot" :info="row" />
        <span v-else>{{ row[item.prop] }}</span>
      </template>
    </el-table-column>
  </el-table>
</template>
