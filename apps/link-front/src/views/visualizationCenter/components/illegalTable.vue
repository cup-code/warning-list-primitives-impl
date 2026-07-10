<script>
export default {
  // 违规统计表
  name: 'illegalTable',
  props: {
    tableData: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {}
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
        type="index"
        align="center"
      />
      <el-table-column
        label="部门车间"
        prop="responsibilityDeptName"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="岗位"
        prop="postName"
        align="center"
      />
      <el-table-column
        label="负责人"
        prop="responsibilityUserName"
        align="center"
      />
      <el-table-column
        label="风险单元类型"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ $dictUtils.getDictLabelById('analysis_type', scope.row.unitType, '--') }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="风险单元名称"
        prop="unitName"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="风险单元描述"
        prop="unitDesc"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="风险事件"
        prop="eventName"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="风险事件描述"
        prop="eventDesc"
        align="center"
        min-width="100px"
      />
    </el-table>
  </div>
</template>

<style lang="scss" scoped></style>
