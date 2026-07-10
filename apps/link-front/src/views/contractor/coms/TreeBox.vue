<script>
export default {
  props: {
    // 关系树配置
    defaultProps: {
      type: Object,
      default() {
        return {
          children: 'children',
          label: 'contractorName',
          id: 'id',
        }
      },
    },
    // 标题
    title: {
      type: String,
      default: '',
    },
    // 获取树数据方法
    getTreeFunc: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      filterText: '', // 关系树-检索关键字
      loadingTree: false, // 关系树loading
      treeData: [], // 关系树数据--树形结构
    }
  },
  watch: {
    filterText(val) {
      this.$refs.treeLeft.filter(val)
    },
  },
  created() {
    this.getTreeData()
  },
  methods: {
    getTreeData() {
      this.loadingTree = true
      this.getTreeFunc()
        .then(({ data }) => {
          if (data.success) {
            this.treeData = data.result
          }
          else {
            this.$message.warning(data.message || '查询承包商列表失败')
          }
        })
        .catch((err) => {
          this.$message.warning('查询承包商列表出错', err)
        })
        .finally(() => {
          this.loadingTree = false
        })
    },
    filterNode(value, data) {
      if (!value) {
        return true
      }
      return data[this.defaultProps.label].includes(value)
    },
    treeNodeTap(data) {
      this.$emit('treeNodeTap', data)
    },
    // 清空选中状态
    refreshClick() {
      this.filterText = ''
      this.getTreeData()
      this.$emit('treeNodeTap', null)
    },
    // 单纯清空选中状态
    clearSel() {
      this.filterText = ''
      this.getTreeData()
    },
  },
}
</script>

<template>
  <div class="leftTree">
    <!-- 左侧 -->
    <el-card
      shadow="always"
      style="height: 100%"
    >
      <div
        slot="header"
        class="space-between"
      >
        <span>{{ title }}</span>
        <div>
          <i
            class="tree-btn el-icon-refresh-right"
            @click="refreshClick"
          />
        </div>
      </div>
      <div style="height: 100%">
        <el-input
          v-model="filterText"
          placeholder="输入关键字进行过滤"
          clearable
        />
        <el-tree
          ref="treeLeft"
          v-loading="loadingTree"
          class="treeBox-tree"
          :data="treeData"
          :props="defaultProps"
          highlight-current
          :expand-on-click-node="false"
          node-key="id"
          check-strictly
          :filter-node-method="filterNode"
          @node-click="treeNodeTap"
        >
          <span
            slot-scope="{ data }"
            class="space-between tree-item"
          >
            <span>{{ data[defaultProps.label] }}</span>
          </span>
        </el-tree>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.leftTree ::v-deep {
  .el-card__header {
    padding: 8px 10px;
    height: 48px;
    line-height: 32px;
  }
  .el-card__body {
    padding: 8px;
    height: calc(100% - 50px);
    overflow: auto;
  }
}
.leftTree {
  width: 100%;
  height: 100%;
}
.space-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.treeBox-tree {
  height: calc(100% - 50px);
  margin-top: 8px;
  overflow: auto;
}
.tree-btn {
  font-size: 15px;
  width: 15px;
  height: 15px;
  text-align: center;
  cursor: pointer;
  user-select: none;
  margin: 0 0 0 5px;
}
.tree-btn:hover {
  color: #409eff;
  font-weight: bold;
}
.disabled {
  color: rgb(199, 199, 199);
}

.tree-item {
  width: 100%;
  .btn-box {
    display: none;
  }
}
.tree-item:hover {
  .btn-box {
    display: block;
  }
}
</style>
