/* * @Author: xiaorui 获取当前登录用户所拥有的部门权限简单树 * @Date: 2022-04-20 14:56:43 * @Last
Modified by: xiaorui * @Last Modified time: 2023-03-23 14:35:27 */
<script>
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import TreeBox from '@/views/common-ui/TreeBox.vue'

export default {
  components: {
    TreeBox,
  },
  props: {
    title: {
      type: String,
      default: '组织架构',
    },
    businessType: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      propData: {
        title: this.title,
        businessType: this.businessType,
        isAdd: false,
        isEdit: false,
        isDel: false,
        getTreeFunc: getDepartListSimple,
        defaultProps: {
          children: 'children',
          label: 'departmentName',
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
      let result = this.$refs.depTree.treeData
      if (type === 1) {
        result = this.$refs.depTree.treeList
      }
      return result
    },
    /* 清空选中状态及模糊查询 */
    refreshTree() {
      this.$refs.depTree.refreshClick()
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
