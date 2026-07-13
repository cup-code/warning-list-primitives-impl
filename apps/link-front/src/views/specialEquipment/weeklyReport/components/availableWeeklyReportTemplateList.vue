<!-- 当前登录用户可用的特种设备周报模板列表 -->
<script>
export default {
  name: 'availableWeeklyReportTemplateList',
  props: {
    /**
     * 数据记录
     */
    dataRecords: Array,
  },
  data() {
    return {
      selectedRowData: {},
    }
  },
  created() {},
  methods: {
    /**
     * 填报人格式化
     */
    reportWriterFormatter(row, column, cellValue, index) {
      let val = ''
      if (Array.isArray(cellValue) && cellValue.length > 0) {
        cellValue.forEach((v, i) => {
          if (i === 0) {
            val += v.fullName
          }
          else {
            val += `,${v.fullName}`
          }
        })
      }
      return val
    },
    /**
     * 表格行单击
     */
    tableRowClick(row, column, event) {
      this.selectedRowData = row
    },
    /**
     * 表格行双击
     */
    tableRowDblClick(row, column, event) {
      this.$emit('saveClick', event, row)
    },
    /**
     * 重置已选数据
     */
    resetFields() {
      this.selectedRowData = this.$options.data().selectedRowData
    },
  },
}
</script>

<template>
  <div>
    <el-table
      ref="specialEquipmentTable"
      :data="dataRecords"
      :header-cell-style="{ background: '#f5f5f5' }"
      height="100%"
      row-key="id"
      highlight-current-row
      :row-style="{ cursor: 'pointer' }"
      @row-click="tableRowClick"
      @row-dblclick="tableRowDblClick"
    >
      <el-table-column
        align="center"
        label="序号"
        min-width="50"
        type="index"
      />
      <el-table-column
        align="center"
        label="选择"
        width="60"
      >
        <template #default="scope">
          <el-radio
            v-model="selectedRowData"
            :label="scope.row"
          >
            <span />
          </el-radio>
        </template>
      </el-table-column>
      <el-table-column
        label="所属部门"
        align="center"
        prop="departmentName"
        width="200"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="标题"
        align="center"
        prop="templateTitle"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="填报人"
        align="center"
        prop="reportWriter"
        :formatter="reportWriterFormatter"
        :show-overflow-tooltip="true"
      />
      <el-table-column
        label="编制人"
        align="center"
        prop="createdName"
        width="120"
      />
      <el-table-column
        label="编制时间"
        align="center"
        prop="createdTime"
        width="160"
      />
    </el-table>
  </div>
</template>

<style scoped></style>
