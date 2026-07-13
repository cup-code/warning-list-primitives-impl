<script>
import {
  computed,
  getCurrentInstance,
  ref,
} from 'vue'
import { tableListConfig } from '../config'

export default {
  name: 'ForewarningList',
  props: {
    tableData: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: '',
    },
    height: {
      type: String,
      default: '',
    },
    allType: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    form: {
      type: Object,
      default: () => {
        return {}
      },
    },
    selection: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const level = ref(['一级', '二级', '三级', '四级'])
    const { proxy } = getCurrentInstance()

    // 处理查看
    const handleView = (row) => {
      const data = {
        detailId: row.id,
        type: props.allType ? 'all' : props.type,
        form: props.form,
      }
      proxy.$router.push({
        path: `/detail/warningDetail`,
        query: {
          data: JSON.stringify(data),
        },
      })
    }

    const getStatus = computed(() => {
      return (status) => {
        const statusList = proxy.$dictUtils.getDictList(props.type)
        let text = ''
        if (props.type !== 'CustomerStatus') {
          text = status !== '0' ? '已审核 |' : ''
        }
        else {
          text = status !== '0' && status !== '1' ? '已处理 |' : ''
        }

        return `${text} ${statusList.find(s => s.dictCode === status)?.dictName}`
      }
    })

    const tagType = computed(() => {
      return (status) => {
        const statusList = proxy.$dictUtils.getDictList(props.type)
        const code = statusList.find(s => s.dictCode === status)?.dictCode

        const color = {
          0: props.type === 'CustomerStatus' ? 'danger' : 'primary',
          1: props.type === 'CustomerStatus' ? 'primary' : 'danger',
          2: 'success',
          3: 'info',
          4: props.type === 'CustomerStatus' ? undefined : 'info',
        }
        return color[Number(code)] || '--'
      }
    })

    const getLevel = computed(() => {
      return (levels) => {
        return `${level.value[Number(levels) - 1] || '--'}`
      }
    })

    return {
      handleView,
      getStatus,
      tagType,
      tableListConfig,
      getLevel,
    }
  },

  methods: {
    onSelection(selection) {
      this.$emit('selection', selection)
    },

    setSelections(ids) {
      this.$refs.tables.setSelection(ids)
    },
  },
}
</script>

<template>
  <CTable
    ref="tables"
    :list="tableListConfig"
    :table-data="tableData"
    :loading="loading"
    :selection="selection"
    :height="height"
    @select="onSelection"
  >
    <!-- 状态列 -->
    <template #status="{ info }">
      <el-tag :type="tagType(info.auditStatus)">
        {{ getStatus(info.auditStatus) }}
      </el-tag>
    </template>

    <!-- 预警等级列 -->
    <template #level="{ info }">
      <span> {{ getLevel(info.alarmLevel) }}</span>
    </template>

    <!-- 操作列 -->
    <template #operation="{ info }">
      <el-button type="text" size="small" @click="handleView(info)">
        查看
      </el-button>
    </template>
  </CTable>
</template>
