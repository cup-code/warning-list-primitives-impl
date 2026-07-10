<script>
import { getSubordinateCompany } from '@/http/user-api'
import TreeBox from '@/views/common-ui/TreeBox.vue'

export default {
  components: {
    TreeBox,
  },
  props: {
    title: {
      type: String,
      default: '集团组织架构',
    },
  },
  data() {
    return {
      propData: {
        title: this.title,
        isAdd: false,
        isEdit: false,
        isDel: false,
        getTreeFunc: getSubordinateCompany,
        defaultProps: {
          children: 'childrenCompany',
          label: 'companyName',
          id: 'id',
          sort: 'sort',
          pid: 'parentId',
        },
        isTreeType: false,
      },
    }
  },
  methods: {
    /* 点击部门树的item */
    treeNodeTap(params) {
      this.$emit('treeNodeTap', params)
    },
    /* 获取数据 1:扁平结构 非1:树形结构 */
    getTreeData(type) {
      let result = this.$refs.companyTreeBox.treeData
      if (type === 1) {
        result = this.$refs.companyTreeBox.treeList
      }
      return result
    },
    /* 清空选中状态及模糊查询 */
    refreshTree() {
      this.$refs.companyTreeBox.refreshClick()
    },
  },
}
</script>

<template>
  <TreeBox
    v-bind="propData"
    ref="companyTreeBox"
    @treeNodeTap="treeNodeTap"
  />
</template>
