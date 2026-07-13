/* * @Author: xiaorui 设备树，包含部门以及部门下的设备 * @Date: 2022-07-13 10:37:55 * @Last Modified
by: xiaorui * @Last Modified time: 2022-07-13 10:55:09 */
<script>
import { getDeviceWithDepartFn } from '@/http/dev_new/inspection-api'
import TreeBox from '@/views/common-ui/TreeBox.vue'

export default {
  components: {
    TreeBox,
  },
  props: {
    title: {
      type: String,
      default: '设备清单',
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
        getTreeFunc: getDeviceWithDepartFn,
        defaultProps: {
          children: 'children',
          label: 'nodeName',
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
