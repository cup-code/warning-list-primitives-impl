<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: '请选择',
    },
  },
  data() {
    return {
      value: '',
    }
  },
  methods: {
    onChange(event) {
      this.value = event
      this.$emit('change', event ? this.list.find(item => item.name === event) : '')
    },
  },
}
</script>

<template>
  <el-select
    v-model="value"
    clearable
    :placeholder="placeholder"
    @change="onChange"
  >
    <el-option
      v-for="item in list"
      :key="item.name"
      :label="item.name"
      :value="item.name"
    />
  </el-select>
</template>
