<script>
export default {
  name: 'FInput',
  props: {
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
  <el-input
    v-model="inputValue"
    :placeholder="placeholder"
    clearable
    @change="onChange"
  />
</template>
