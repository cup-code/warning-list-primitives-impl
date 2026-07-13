<script>
import FInput from './Finput.vue'
import FPickerTime from './FpickerTime.vue'
import FSelection from './Fselection.vue'

export default {
  name: 'CFilter',
  components: { FSelection, FPickerTime, FInput },
  props: {
    formInline: {
      type: Object,
      default: () => {
        return {}
      },
    },
    list: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  data() {
    return {
      info: {},
    }
  },
  methods: {
    onSearch() {
      this.$emit('search', this.info)
    },
    onChange(e, key) {
      if (key === 'workTime') {
        this.info.dateStart = e.dateStart
        this.info.dateEnd = e.dateEnd
        return
      }
      this.info = {
        ...this.info,
        [key]: e,
      }
    },
    onReset() {
      this.$emit('update:formInline', {
        workOrderNum: '',
        workOrderType: '',
        workTime: [],
      })
      this.info = {}
      this.onSearch()
    },
  },
}
</script>

<template>
  <el-form
    ref="formInline"
    :inline="true"
    :model="formInline"
    class="demo-form-inline"
  >
    <el-form-item
      v-for="item in list"
      :key="item.label"
      :label="item.label"
      :prop="item.prop"
    >
      <component
        :is="item.component"
        :placeholder="item.placeholder"
        :options="item.options"
        :value.sync="formInline[item.prop]"
        @change="onChange($event, item.prop)"
      />
    </el-form-item>
    <el-form-item>
      <EButton
        size="mini"
        type="primary"
        icon="search"
        @click="onSearch"
      >
        查询
      </EButton>
      <EButton
        plain
        icon="sync"
        @click="onReset"
      >
        重置
      </EButton>
    </el-form-item>
  </el-form>
</template>
