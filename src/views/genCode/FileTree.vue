<script>
import { getFileTreeFn } from '@/http/safe-production/genCode/table-list-api'

export default {
  data() {
    return {
      filterText: '',
      selectValue: '',
      props: {
        label: 'text',
        isLeaf: 'isLeaf',
      },
      visible: false,
      data: [],
    }
  },
  watch: {
    filterText: function filterText(val) {
      this.$refs.tree.filter(val)
    },
  },
  methods: {
    init(id) {
      this.visible = true
    },
    loadNode(node, resolve) {
      const path = node.data.id ? encodeURIComponent(node.data.id) : '#'
      getFileTreeFn(path).then(({ data }) => {
        resolve(data.treeData)
      })
    },
    filterNode(value, data) {
      if (!value)
        return true
      return data.text.includes(value)
    },
    handleNodeClick(data) {
      this.selectValue = data.id
    },
    // 表单提交
    doSubmit() {
      this.visible = false
      this.$emit('getValue', this.selectValue)
    },
  },
}
</script>

<template>
  <el-dialog

    title="选择路径"
    append-to-body
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <el-input
      v-model="filterText"
      placeholder="输入关键字进行过滤"
      size="small"
    />
    <el-tree
      ref="tree"
      class="filter-tree"
      :data="data"
      :load="loadNode"
      lazy
      :props="props"
      :filter-node-method="filterNode"
      @node-click="handleNodeClick"
    />
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-noMoreClick
        type="primary"
        size="small"
        @click="doSubmit"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
