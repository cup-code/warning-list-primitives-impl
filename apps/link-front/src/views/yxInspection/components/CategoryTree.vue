<script>
import TreeBox from "@/views/common-ui/TreeBox.vue";

export default {
  name: "CategoryTree",
  components: {
    TreeBox,
  },
  data() {
    return {
      propData: {
        title: "检查项分类",
        getTreeFunc: this.getDictTreeData,
        isAdd: false,
        isEdit: false,
        isDel: false,
        defaultProps: {
          children: "children",
          label: "name",
          id: "id",
          pid: "parentId",
          sort: "sort",
        },
      },
    };
  },
  methods: {
    /* 获取字典树数据 - 适配 TreeBox 的 Promise 格式 */
    getDictTreeData() {
      return new Promise((resolve) => {
        const categories = this.$dictUtils?.getDictList("inspectionCategory") || [];
        const result = categories.map((item) => ({
          ...item,
          name: item.dictName,
          id: item.dictCode,
        }));
        resolve({
          data: {
            success: true,
            result: result,
          },
        });
      });
    },
    /* 点击树的item */
    handleTreeNodeTap(params) {
      console.log(params, "params");
      this.$emit("treeNodeTap", params);
    },
    /* 清空选中状态及模糊查询 */
    refreshTree() {
      this.$refs.treeBox.refreshClick();
    },
    /* 获取数据 1:扁平结构 非1:树形结构 */
    getTreeData(type) {
      let result = this.$refs.treeBox.treeData;
      if (type === 1) {
        result = this.$refs.treeBox.treeList;
      }
      return result;
    },
  },
};
</script>

<template>
  <TreeBox v-bind="propData" ref="treeBox" @treeNodeTap="handleTreeNodeTap" />
</template>
