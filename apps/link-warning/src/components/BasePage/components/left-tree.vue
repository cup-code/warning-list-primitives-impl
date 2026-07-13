<script>
import BaseDialog from '@/components/BasePage/components/base-dialog'

export default {
  components: {
    BaseDialog,
  },
  props: {
    url: {
      type: [String],
      default: () => {
        return ''
      },
    },
    id: {
      type: [String],
      default: () => {
        return 'id'
      },
    },
    label: {
      type: [String],
      default: () => {
        return ''
      },
    },
    value: {
      type: [String],
      default: () => {
        return ''
      },
    },
    props: {
      type: Object,
      default: () => {
        return {
          value: 'id', // ID字段名
          label: 'label', // 显示名称
          children: 'children', // 子级字段名
        }
      },
    },
    filterKey: {
      type: [String],
      default: () => {
        return 'name'
      },
    },
    labelName: String,
    enableFilter: Boolean,
    isOpen: Boolean,
    canDo: false,
    dialog: {},
    delApi: '',
  },
  data() {
    return {
      filterText: '',
      treeData: [],
      dialogVisible: false,
      dialogTitle: '',
      dataSource: {},
    }
  },
  watch: {
    filterText(val) {
      this.$refs.table_tree.filter(val)
    },
  },
  mounted() {
    this.queryData()
  },
  methods: {
    filterNode(val, data) {
      if (!val)
        return true
      return data[this.props.label].includes(val)
    },
    queryData() {
      if (this.isBlank(this.url)) {
        return
      }
      this.$http({
        url: this.url,
        method: 'GET',
      }).then(({ data }) => {
        if (data.code != '200') {
          return
        }
        this.treeData = this.setTreeData(data.result || [])
      })
    },
    // 点击tree节点时 将tree的id作为上级机构代码 查询列表
    nodeClick(node) {
      this.$emit('input', node.id)
      this.$emit('node-click', node.id)
    },
    checkedEvent(item, evt) {
      const ids = evt.checkedKeys.toString()
      this.$emit('input', ids)
    },
    setCurrentKey(id) {
      this.$refs.table_tree.setCurrentKey(id)
    },
    openDialog(type, data) {
      this.dialogVisible = true
      if (type === 'edit') {
        this.dialogTitle = `编辑${this.labelName}`
        this.dataSource = data || {}
      }
      else {
        this.dialogTitle = `新建${this.labelName}`
        this.dataSource = type === 'add' ? {} : { parentId: data.id || '' }
      }
    },
    // 删除
    delTreeNode(data) {
      this.$confirm(`确定删除所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.delApi(data.id).then(({ data }) => {
          if (data.code != '200') {
            this.$message.error(data.message || '删除失败!')
            return
          }
          this.queryData()
        })
      })
    },
  },
}
</script>

<template>
  <el-card>
    <div class="title">
      <span>{{ labelName }}</span>
      <el-button
        v-if="canDo"
        type="primary"
        icon="el-icon-plus"
        circle
        @click="openDialog('add')"
      />
    </div>
    <el-input
      v-if="enableFilter"
      v-model.trim="filterText"
      class="filterInput"
      placeholder="关键字检索"
    />
    <el-tree
      ref="table_tree"
      class="filter-tree"
      :data="treeData"
      :node-key="props.value"
      :default-expand-all="isOpen"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
      :props="props"
      :filterKey="filterKey"
      @node-click="nodeClick"
      @check="checkedEvent"
    >
      <span
        slot-scope="{ node, data }"
        class="custom-tree-node"
      >
        <span>{{ node.label }}</span>
        <span v-if="canDo">
          <el-button
            v-if="node.level < 3"
            type="text"
            class="tree-item-button"
            icon="el-icon-plus"
            @click="() => openDialog('addSub', data)"
          />
          <el-button
            type="text"
            class="tree-item-button"
            icon="el-icon-edit-outline"
            @click="() => openDialog('edit', data)"
          />
          <el-button
            type="text"
            class="tree-item-button"
            icon="el-icon-delete"
            @click="() => delTreeNode(data)"
          />
        </span>
      </span>
    </el-tree>

    <!--  -->
    <BaseDialog
      v-if="canDo"
      :width="dialog.width"
      :title="dialogTitle"
      :visible="dialogVisible"
      :formFields="dialog.formFields"
      :dataSource="dataSource"
      :api="dialog.api"
      @handleClose="dialogVisible = false"
      @refreshList="queryData"
    />
  </el-card>
</template>

<style scoped lang="scss">
.title {
  font-weight: 500;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.filterInput {
  margin: 15px 0;
}
.filter-tree {
  .el-tree-node__content {
    &:hover .tree-item-button {
      display: unset;
    }
    .tree-item-button {
      display: none;
    }

    .custom-tree-node {
      width: calc(100% - 30px);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
}
</style>
