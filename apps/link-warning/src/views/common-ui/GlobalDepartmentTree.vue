/* * @Author: xiaorui 租户下所有组织架构树 * @Date: 2023-03-10 16:53:21 * @Last Modified by: xiaorui
* @Last Modified time: 2023-12-18 11:23:23 */
<script>
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
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
    companyId: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      propData: {
        title: this.title,
        hasResponsible: this.companyId,
        isAdd: false,
        isEdit: false,
        isDel: false,
        getTreeFunc: getAllDepartByCompanyFn,
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
