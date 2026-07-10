<script>
export default {
  // 化学品信息
  name: 'ChemistryInfoDialog',
  props: {
    chemistyTable: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {}
  },
  computed: {},
  created() {},
  mounted() {},
  methods: {},
}
</script>

<template>
  <div style="height: 100%">
    <el-table
      :data="chemistyTable"
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
        prop="chemistryName"
        align="center"
        label="化学品名称"
      />
      <el-table-column
        prop="casCharacter"
        align="center"
        label="CAS号"
      />
      <el-table-column
        prop="checkCoefficient"
        align="center"
        label="校正系数(β)"
      />
      <el-table-column
        prop="chemistryQuantity"
        align="center"
        label="危化品临界量/t(Q)"
      />
      <el-table-column
        prop="qvalue"
        align="center"
        label="存储量"
      />
      <el-table-column
        prop="qvalueType"
        align="center"
        label="实际量"
      />
      <el-table-column
        prop="toxicityName"
        align="center"
        label="毒性气体/类别"
      />
    </el-table>
  </div>
</template>

<style lang="scss" scoped></style>
