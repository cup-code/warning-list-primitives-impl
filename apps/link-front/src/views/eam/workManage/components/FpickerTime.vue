<script>
export default {
  name: 'FPickerTime',
  props: {
    value: {
      type: Array,
      default: () => {
        return []
      },
    },
    type: {
      type: String,
      default: 'datetimerange',
    },
    placeholder: {
      type: Array,
      default: () => {
        return ['开始日期', '结束日期']
      },
    },
    defaultTime: {
      type: Array,
      default: () => {
        return ['00:00:00', '23:59:59']
      },
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
    onChangeTime(e) {
      this.$emit('update:value', e)
      this.$emit('change', { dateStart: e[0], dateEnd: e[1] })
    },
  },
}
</script>

<template>
  <el-date-picker
    v-model="inputValue"
    :type="type"
    :start-placeholder="placeholder[0]"
    value-format="yyyy-MM-dd HH:mm:ss"
    :end-placeholder="placeholder[1]"
    :default-time="defaultTime"
    @change="onChangeTime"
  />
</template>
