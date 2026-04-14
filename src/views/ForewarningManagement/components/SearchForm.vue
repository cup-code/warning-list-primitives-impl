<script>
import moment from 'moment'
import { ref } from 'vue'

export default {
  name: 'SearchForm',
  props: {
    initialTimeType: {
      type: [Number, String],
      default: 1,
    },
  },
  emits: ['form'],
  setup(props, { emit }) {
    const timeType = ref(props.initialTimeType)
    const dateRange = ref([])

    const form = ref({
      timeType: props.initialTimeType,
      alarmDateStart: moment().startOf('week').format('YYYY-MM-DD HH:mm:ss'),
      alarmDateEnd: moment().endOf('week').format('YYYY-MM-DD 23:59:59'),
    })

    // 格式化日期
    const formatDate = (date) => {
      if (date === 'week') {
        return moment().startOf('week').add(1, 'day').format('YYYY-MM-DD HH:mm:ss')
      }
      else {
        return moment().startOf(date).format('YYYY-MM-DD HH:mm:ss')
      }
    }

    // 处理日期类型变化
    const handleDateTypeChange = (type) => {
      console.log(type, 'type')
      if (type === 'custom') {
        return
      }
      const typeMap = { 0: 'date', 1: 'week', 2: 'month' }
      form.value.timeType = type
      form.value.alarmDateEnd = moment().format('YYYY-MM-DD 23:59:59')
      form.value.alarmDateStart = formatDate(typeMap[type])

      emit('search', form.value)
    }

    // 处理自定义日期变化
    const handleDateChange = (val) => {
      delete form.value.timeType
      if (val) {
        form.value.alarmDateStart = val[0]
        form.value.alarmDateEnd = val[1]
      }
      else {
        form.value.alarmDateStart = ''
        form.value.alarmDateEnd = ''
      }

      console.log(form, 'form')

      customSearch()
    }

    // 搜索
    const customSearch = () => {
      emit('search', form.value)
    }

    customSearch()

    // 重置
    const reset = () => {
      dateRange.value = []
      timeType.value = 1
      handleDateTypeChange(1)
      customSearch()
    }

    return {
      timeType,
      dateRange,
      form,
      handleDateTypeChange,
      handleDateChange,
      customSearch,
      reset,
    }
  },
}
</script>

<template>
  <ECard noneBottom type="search">
    <el-form
      :model="form"
      size="mini"
      inline
    >
      <el-form-item label="时间范围">
        <div class="date-filter">
          <el-radio-group v-model="timeType" @change="handleDateTypeChange">
            <el-radio-button :label="0">
              日
            </el-radio-button>
            <el-radio-button :label="1">
              周
            </el-radio-button>
            <el-radio-button :label="2">
              月
            </el-radio-button>
            <el-radio-button label="custom">
              自定义
            </el-radio-button>
          </el-radio-group>
        </div>
      </el-form-item>
      <el-form-item v-if="timeType === 'custom'">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
          @change="handleDateChange"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="customSearch"
        >
          查询
        </el-button>
        <el-button icon="el-icon-refresh-right" @click="reset">
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </ECard>
</template>

<style scoped>
.date-filter {
  display: flex;
  align-items: center;
}
</style>
