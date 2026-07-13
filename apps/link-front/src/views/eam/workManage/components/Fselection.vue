<script>
export default {
  name: 'FSelection',
  props: {
    options: {
      type: Array,
      default: () => {
        return []
      },
    },
    placeholder: {
      type: String,
      default: '请选择',
    },
    value: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      inputValue: '',
    }
  },
  watch: {
    value: {
      handler(val) {
        this.inputValue = val
      },
    },
  },
  methods: {
    onChange(e) {
      this.$emit('change', e)
      this.$emit('update:value', e)
    },
  },
}
</script>

<template>
  <el-select
    v-model="inputValue"
    clearable
    filterable
    :placeholder="placeholder"
    @change="onChange"
  >
    <el-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
    />
  </el-select>
</template>
