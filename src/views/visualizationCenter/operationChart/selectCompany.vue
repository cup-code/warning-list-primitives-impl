<script>
export default {
  name: 'SelectCompany',
  data() {
    return {
      value: '',
      list: [
        { label: '力源宝', value: 'a' },
        { label: '美富特', value: 'b' },
        { label: '尚川', value: 'c' },
        { label: '新大禹', value: 'd' },
        { label: '蓝莹', value: 'e' },
      ],
    }
  },
  methods: {
    onChange(v) {
      this.$store.dispatch('company/getCompanyId', v.value)
    },
  },
}
</script>

<template>
  <el-select
    v-model="value"
    placeholder="选择目标公司"
    @change="onChange"
  >
    <el-option
      v-for="item in list"
      :key="item.value"
      :label="item.label"
      :value="item"
    />
  </el-select>
</template>

<style lang="scss" scoped>
.select-block {
  width: 100%;
}
::v-deep .el-input__inner {
  background-color: rgba(10, 30, 70, 0.4) !important;
  border-color: #0069b9 !important;
  color: #fff;
}

::v-deep.el-select-dropdown {
  background-color: rgba(10, 30, 70, 0.4) !important;
}
</style>
