<script>
export default {
  name: 'ExamineLog',
  props: {},
  data() {
    return {
      params: {
        pageNum: 1,
        pageSize: 10,
      },
      total: 0,
      tableData: [],
    }
  },
}
</script>

<template>
  <ECard>
    <el-table
      ref="singleTable"
      highlight-current-row
      :data="tableData"
      size="mini"
      height="400px"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
    >
      <el-table-column
        label="序号"
        type="index"
        width="50"
      />
      <el-table-column
        label="流转时间"
        prop="departmentName"
        align="center"
        min-width="100"
      />
      <el-table-column
        label="经办人"
        prop="assetName"
        align="center"
        min-width="120"
      />
      <el-table-column
        label="流程节点"
        prop="assetTypeName"
        align="center"
        min-width="120"
      />
    </el-table>

    <el-pagination
      style="text-align: right; margin-top: 20px"
      :current-page.sync="params.pageNum"
      :page-sizes="[10, 20, 50]"
      background
      :page-size.sync="params.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getList"
      @current-change="getList"
    />
  </ECard>
</template>
