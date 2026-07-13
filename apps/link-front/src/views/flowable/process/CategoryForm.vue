<script>
import {
  flowableModelUpdateCategory,
  getExtensionActCategoryTreeData,
} from '@/http/safe-production/flowable-api'

export default {
  data() {
    return {
      visible: false,
      categoryTreeData: [],
      selectCategoryName: '',
      inputForm: {
        id: '',
        category: '',
      },
    }
  },
  methods: {
    init(id, category) {
      this.visible = true
      this.inputForm.id = id
      this.inputForm.category = ''
      this.$nextTick(() => {
        this.selectCategoryName = ''
        this.refreshTree()
      })
    },
    // 获取树数据
    refreshTree() {
      getExtensionActCategoryTreeData().then(({ data }) => {
        this.categoryTreeData = data.treeData
      })
    },
    handleNodeClick(data) {
      this.inputForm.category = data.name
      this.selectCategoryName = `已选类型: ${data.name}`
    },
    // 表单提交
    inputFormSubmit() {
      if (!this.inputForm.category) {
        this.$message.error('请选择一个分类!')
        return
      }
      flowableModelUpdateCategory(this.inputForm).then(({ data }) => {
        if (data && data.success) {
          this.$message.success({
            dangerouslyUseHTMLString: true,
            message: data.msg,
          })
          this.$emit('refreshList')
          this.visible = false
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog
    class="dialog-categoryForm-process-flowable"
    title="请选择流程分类"
    :close-on-click-modal="false"

    :visible.sync="visible"
    width="500px"
  >
    {{ selectCategoryName }}
    <el-tree
      ref="categoryTree"
      class="filter-tree"
      :data="categoryTreeData"
      :props="{
        value: 'id', // ID字段名
        label: 'name', // 显示名称
        children: 'children', // 子级字段名
      }"
      default-expand-all
      :expand-on-click-node="false"
      @node-click="handleNodeClick"
    />

    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="mini"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        size="mini"
        type="primary"
        :disabled="!inputForm.category"
        @click="inputFormSubmit()"
      >确定</el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-categoryForm-process-flowable {
  .el-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: calc(100% - 30px);
    max-width: calc(100% - 30px);
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    .el-dialog__header {
      border-bottom: 1px solid #e8e8e8;
    }
    .el-dialog__body {
      overflow: auto;
    }
    .el-dialog__footer {
      border-top: 1px solid #e8e8e8;
      border-radius: 0 0 4px 4px;
    }
  }
}
</style>
