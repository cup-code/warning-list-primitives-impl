export default {
  data() {
    return {
      isBatch: false,
      selected: [],
      checkboxGroup: [],
      checkAll: false,
      isIndeterminate: true,
    }
  },
  methods: {
    handleCheckAllChange(val, tableData) {
      this.checkAll = val
      this.checkboxGroup = val ? tableData.map(item => item.id) : []
      this.selected = val ? tableData : []
      this.isIndeterminate = false
    },
    cancelBatch() {
      this.checkboxGroup = []
      this.selected = []
      this.checkAll = false
      this.isIndeterminate = true
    },
    handleChecked(value, tableData) {
      const checkedCount = value.length
      this.checkAll = checkedCount === tableData.length
      this.selected = tableData.filter(s => value.includes(s.id))
      this.checkboxGroup = value
      this.isIndeterminate = checkedCount > 0 && checkedCount < tableData.length
    },
    onSelected(value, tableData) {
      this.selected = value
      this.checkboxGroup = value.map(s => s.id)
      const checkedCount = value.length
      this.checkAll = checkedCount === tableData.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < tableData.length
    },
  },
}
