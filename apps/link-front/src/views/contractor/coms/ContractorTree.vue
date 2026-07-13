<script>
import { contractorAll } from '@/http/contractor-api'
import TreeBox from './TreeBox.vue'

export default {
  components: {
    TreeBox,
  },
  props: {
    title: {
      type: String,
      default: '承包商',
    },
  },
  data() {
    return {
      propData: {
        title: this.title,
        getTreeFunc: contractorAll,
      },
    }
  },
  methods: {
    treeNodeTap(params) {
      this.$emit('treeNodeTap', params)
    },
    getTreeData() {
      const result = this.$refs.depTree.treeData
      return result
    },
    // 清空选中状态及模糊查询
    refreshTree() {
      this.$refs.depTree.refreshClick()
    },
    // 单纯清空选中状态
    clearSel() {
      this.$refs.depTree.clearSel()
    },
  },
}
</script>

<template>
  <TreeBox
    v-bind="propData"
    ref="depTree"
    @treeNodeTap="treeNodeTap"
  />
</template>
