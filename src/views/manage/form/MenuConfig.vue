<script>
import { saveTenantMenu } from '@/http/safe-production/menu-config-api'
import { getMenuList, getTenantMenuList } from '@/http/safe-production/menu-manage-api'

export default {
  data() {
    return {
      visible: false,
      saveLoading: false,
      tenantId: '',
      treeLeft: [],
      treeRight: [{}],
      standardTree: [], // 标准树，为左侧树中可以通用的菜单
    }
  },
  methods: {
    init(id) {
      this.tenantId = id
      this.visible = true
      if (!this.treeLeft.length) {
        this.getLeftTree()
      }
      this.treeRight = [{}] // 使右侧菜单为空，否则会回显上个公司的菜单
      this.getRightTree()
    },
    handleDragstart(node, event) {
      this.$refs.tree2.$emit('tree-node-drag-start', event, { node })
    },
    handleDragend(draggingNode, endNode, position, event) {
      // 插入一个空节点用于占位
      const emptyData = { id: +new Date(), children: [] }
      this.$refs.tree1.insertBefore(emptyData, draggingNode)

      this.$refs.tree2.$emit('tree-node-drag-end', event)
      this.$nextTick(() => {
        // 如果是移动到了当前树上，需要清掉空节点
        if (this.$refs.tree1.getNode(draggingNode.data)) {
          this.$refs.tree1.remove(emptyData)
        }
        else {
          // 如果移动到了别的树上，需要恢复该节点，并清掉空节点
          const data = JSON.parse(JSON.stringify(draggingNode.data))
          this.$refs.tree1.insertAfter(data, this.$refs.tree1.getNode(emptyData))
          this.$refs.tree1.remove(emptyData)
        }
      })
    },
    returnTrue() {
      return true
    },
    returnFalse() {
      return false
    },
    clear() {
      this.treeRight = [{}]
    },
    standard(type) {
      if (type === 'all') {
        this.treeRight = this.standardTree
        return
      }
      this.treeRight = this.standardTree.filter(item => item.canCommon === type)
    },
    getLeftTree() {
      getMenuList().then(({ data }) => {
        if (data.success && data.result) {
          this.standardTree = this.setTreeData(
            data.result.filter((item) => {
              return item.canCommon
            }),
          )
          this.treeLeft = this.setTreeData(data.result)
        }
      })
    },
    getRightTree() {
      this.saveLoading = true
      getTenantMenuList(this.tenantId).then(({ data }) => {
        this.saveLoading = false
        if (data.success && data.result) {
          this.treeRight = data.result.length ? this.setTreeData(data.result) : [{}]
        }
      })
    },
    submitList() {
      this.saveLoading = true
      const idx = this.treeRight.findIndex((item) => {
        return Object.keys(item).length === 0
      })
      if (idx !== -1) {
        this.treeRight.splice(idx, 1)
      }
      const list = this.treeToList(this.treeRight) // 把树形结构转为list结构
      saveTenantMenu(this.tenantId, list).then(({ data }) => {
        this.saveLoading = false
        if (data.success) {
          this.visible = false
          this.$message.success(data.message)
        }
        else {
          this.$message.error(data.message)
        }
      })
    },
    treeToList(tree, list = []) {
      for (const i in tree) {
        const node = tree[i]
        list.push({
          menuId: node.id,
          menuName: node.menuName,
          parentId: node.parentId,
          sort: node.sort,
          icon: node.icon,
          canCommon: node.canCommon,
        })
        if (node.children && node.children.length) {
          this.treeToList(node.children, list)
        }
      }
      return list
    },
    remove(node, data) {
      this.$confirm('此操作会造成当前租户下的角色丢失该菜单权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          const parent = node.parent
          const children = parent.data.children || parent.data
          const index = children.findIndex(d => d.id === data.id)
          children.splice(index, 1)
        })
        .catch(() => {})
    },
    mouseleave(data, $event) {
      $event.currentTarget.firstElementChild.nextElementSibling.setAttribute('class', 'none')
    },
    mouseover(data, $event) {
      $event.currentTarget.nextElementSibling.setAttribute('class', 'block')
    },
  },
}
</script>

<template>
  <el-dialog
    class="normal-dialog edit-dialog"
    title="菜单配置"
    :close-on-click-modal="false"

    width="600px"
    :visible.sync="visible"
  >
    <div class="tree-drag">
      <el-tree
        ref="tree1"
        :data="treeLeft"
        class="tree"
        node-key="id"
        :props="{
          label: 'menuName',
          children: 'children',
        }"
        draggable
        default-expand-all
        :allow-drop="returnFalse"
        @node-drag-start="handleDragstart"
        @node-drag-end="handleDragend"
      />
      <div class="middle">
        <!-- <EButton
          type="success"
          v-for="(item, index) in $dictUtils.getDictList('customize_menu')"
          :key="index"
          @click="standard(item.dictCode)"
          style="margin: 10px"
        >
          {{ item.dictName }}
        </EButton> -->
        <EButton
          type="success"
          style="margin: 10px"
          @click="standard('all')"
        >
          标准
        </EButton>

        <EButton
          type="warning"
          style="margin: 10px"
          @click="clear"
        >
          清空
        </EButton>
      </div>
      <el-tree
        ref="tree2"
        :data="treeRight"
        class="tree"
        :props="{
          label: 'menuName',
          children: 'children',
        }"
        node-key="id"
        draggable
        default-expand-all
        :allow-drop="returnTrue"
      >
        <span
          slot-scope="{ node, data }"
          @mouseleave="mouseleave(data, $event)"
        >
          <span @mouseover="mouseover(data, $event)">{{ node.label }}</span>
          <span
            style="margin-left: 30px"
            class="none"
          >
            <el-button
              type="text"
              size="mini"
              @click="() => remove(node, data)"
            >
              <i
                class="el-icon-delete"
                style="color: #ff4949"
              />
            </el-button>
          </span>
        </span>
      </el-tree>
    </div>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <EButton @click="visible = false">关闭</EButton>
      <EButton
        v-noMoreClick
        type="primary"
        btnIcon="el-icon-check"
        plain
        :loading="saveLoading"
        @click="submitList()"
      >保存</EButton>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.menu-config .el-dialog {
  margin-top: 15px !important;
}
.tree {
  display: inline-block;
  vertical-align: top;
  width: 42%;
  height: 380px;
  padding: 10px 0;
  border: 1px solid rgb(224, 219, 219);
  border-radius: 6px;
  overflow: auto;
  font-size: 12px;
}
.tree-drag {
  display: flex;
}
.middle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.none {
  display: none;
}
.block {
  display: inline-block;
}
</style>
