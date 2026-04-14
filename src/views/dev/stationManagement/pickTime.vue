<script>
export default {
  name: 'PickTime',
  props: {
    textColor: {
      type: String,
      default: 'text-white',
    },
  },
  data() {
    return {
      value1: new Date().toISOString().split('T')[0],
      selectedTime: 'date',
      isCurrent: true,
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
      },
    }
  },
  watch: {
    value1(newVal) {
      const today = new Date().setHours(0, 0, 0, 0)
      const newValFormat = new Date(newVal).setHours(0, 0, 0, 0)
      this.isCurrent = newValFormat >= today
    },
  },
  mounted() {
    this.handleChange(this.value1, 'date')
  },
  methods: {
    getTimeFormat(value) {
      const date = new Date(value)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    handleChange(value, type) {
      this.selectedTime = type
      this.$emit('change', this.getTimeFormat(value))
    },
    changeTime(type) {
      const date = new Date(this.value1)
      if (type === 'prev') {
        this.value1 = date.setDate(date.getDate() - 1)
        this.selectedTime = 'prev'
      }
      else {
        if (this.isCurrent) {
          return
        }
        this.value1 = date.setDate(date.getDate() + 1)
        this.selectedTime = 'next'
      }

      this.$emit('change', this.getTimeFormat(this.value1))
    },
  },
}
</script>

<template>
  <div
    class="box-border flex z-10 flex-row justify-center items-center px-2 w-72 rounded-md border border-dashed"
    :class="{ 'border-white': textColor === 'text-white' }"
  >
    <div
      class="px-1 pr-2 text-xs border-r border-white cursor-pointer"
      :class="{
        'text-blue-500': selectedTime === 'prev',
        'text-white': textColor === 'text-white',
      }"
      @click="changeTime('prev')"
    >
      前一天
    </div>
    <div
      class="flex flex-row justify-center items-center h-7 cursor-pointer"
      :class="{
        'selected-date': selectedTime === 'date',
        'text-blue-500': selectedTime === 'prev',
        'text-white': textColor === 'text-white',
      }"
      @click="handleChange(value1, 'date')"
    >
      <span class="pl-1 text-xs"> 当前时间: </span>
      <el-date-picker
        v-model="value1"
        type="date"
        placeholder="选择日期"
        :clearable="false"
        format="yyyy-MM-dd"
        size="mini"
        :picker-options="pickerOptions"
        :class="{ 'text-white': textColor === 'text-white' }"
        @change="handleChange($event, 'date')"
      />
    </div>
    <div
      class="px-1 pl-2 text-xs border-l border-white cursor-pointer"
      :class="{
        'text-gray-400': isCurrent,
        'text-blue-500': selectedTime === 'next' && !isCurrent,
        'text-white': textColor === 'text-white',
      }"
      @click="changeTime('next')"
    >
      后一天
    </div>
  </div>
</template>

<style scoped>
.el-date-editor.el-input {
  background: transparent !important;
  width: 110px;
  border: none;
  color: #333;
  height: 100%;
  line-height: 28px;
  font-weight: 400;
}

.selected-date {
  ::v-deep .el-input--mini .el-input__inner {
    color: #3b82f6;
  }
}

::v-deep.el-input--mini .el-input__inner {
  background: transparent !important;
  width: 110px;
  border: none;
  color: #333;
  height: 100%;
  font-size: 12px;
  font-weight: 400;
  padding-right: 0px !important;
  line-height: 28px;
}

::v-deep .el-input--prefix .el-input__inner {
  padding-right: 0px !important;
}

::v-deep .el-input__prefix {
  color: #333 !important;
}
</style>
