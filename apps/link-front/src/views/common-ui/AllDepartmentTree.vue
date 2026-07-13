/* * @Author: xiaorui 所有的组织架构树 * @Date: 2022-07-15 09:52:19 * @Last Modified by: xiaorui *
@Last Modified time: 2022-07-15 09:59:18 */
<script>
import { getDepartListDetail } from '@/http/safe-production/depart-manage-api'
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
    hasResponsible: {
      type: Boolean,
      default: false,
    },
    // 过滤掉某一类型的部门，比如承包商
    disappear: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      propData: {
        title: this.title,
        hasResponsible: this.hasResponsible,
        disappear: this.disappear,
        isAdd: false,
        isEdit: false,
        isDel: false,
        getTreeFunc: getDepartListDetail,
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
