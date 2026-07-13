<script>
import { axiosGet, createAxiosFromStore } from '@/http/common/utils'

export default {
  name: 'el-tree-select',
  props: {
    /* 配置项 */
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
    /* 选项列表数据(树形结构的对象数组) */
    data: {
      type: Array,
      default: () => {
        return []
      },
    },
    /* 选项列表数据(树形结构的对象数组) */
    list: {
      type: Array,
      default: () => {
        return null
      },
    },
    /* 初始值 */
    value: null,
    /* 初始值 */
    url: {
      type: String,
      default: () => {
        return null
      },
    },
    disabled: {
      type: Boolean,
      dafault: () => {
        return false
      },
    },
    showCheckbox: {
      type: Boolean,
      dafault: () => {
        return false
      },
    },
    /* 初始值 */
    label: {
      type: String,
      default: () => {
        return null
      },
    },
    /* 可清空选项 */
    clearable: {
      type: Boolean,
      default: () => {
        return true
      },
    },
    /* 自动收起 */
    accordion: {
      type: Boolean,
      default: () => {
        return false
      },
    },
    // 在显示复选框的情况下，是否严格的遵循父子不互相关联的做法，默认为 false
    checkStrictly: {
      type: Boolean,
      default: () => {
        return false
      },
    },
    size: {
      type: String,
      default: () => {
        return 'mini'
      },
    },
    placeholder: {
      type: String,
      default: () => {
        return '请选择'
      },
    },
    isOnlySelectLeaf: {
      type: Boolean,
      default: () => {
        return false
      },
    },
  },
  data() {
    return {
      valueId: this.value, // 初始值
      valueTitle: this.label,
      defaultExpandedKey: [],
      placeholderText: this.placeholder,
      treeList: [],
      valueData: this.data,
      filterText: '',
    }
  },
  computed: {
    optionData() {
      if (this.list) {
        const cloneData = JSON.parse(JSON.stringify(this.list)) // 对源数据深度克隆
        return cloneData.filter((father) => {
          // 循环所有项，并添加children属性
          const branchArr = cloneData.filter(child => father.id === child.parentId) // 返回每一项的子级数组
          // eslint-disable-next-line no-unused-expressions
          branchArr.length > 0 ? (father.children = branchArr) : '' // 给父级添加一个children属性，并赋值
          return !father.parentId // 返回第一层
        })
      }
      else {
        return this.valueData
      }
    },
  },
  watch: {
    label: {
      immediate: true, // 刷新页面立即触发
      deep: true, // 深度监听
      handler() {
        this.$nextTick(() => {
          this.valueTitle = this.label
        })
      },
    },
    value() {
      this.valueId = this.value
      if (
        this.value === ''
        || this.value === null
        || this.value === undefined
        || !this.value.length
      ) {
        this.clearHandle()
      }
      else {
        this.initHandle()
      }
    },
    data() {
      this.valueData = this.data
    },
    url() {
      this.getTree()
    },
    filterText(val) {
      this.$refs.selectTree.filter(val)
    },
  },
  mounted() {
    this.axios = createAxiosFromStore()
    this.getTree()
    if (this.value) {
      this.initHandle()
    }
  },
  methods: {
    getTree() {
      if (this.url) {
        this.placeholderText = '加载数据中...'
        axiosGet(this.axios, this.url).then(({ data }) => {
          if (data.success) {
            this.valueData = this.setTreeData(data.result || data.treeData || [])
          }
          this.setTreeList(this.valueData)
          this.$nextTick(() => {
            this.initHandle()
            this.placeholderText = this.placeholder
          })
        })
      }
      else {
        this.valueData = this.optionData
        this.treeList = []
        this.setTreeList(this.valueData)
      }
    },
    setTreeList(datas) {
      // 遍历树  获取id数组
      for (const i in datas) {
        this.treeList.push(datas[i])
        if (datas[i].children) {
          this.setTreeList(datas[i].children)
        }
      }
    },
    // 初始化值
    initHandle() {
      if (this.valueId) {
        if (this.showCheckbox) {
          const ids = this.valueId.split(',')
          this.$refs.selectTree.setCheckedKeys(ids)
          const titles = []
          this.getTree()
          ids.forEach((id) => {
            this.treeList.forEach((d) => {
              if (id === d[this.props.value]) {
                titles.push(d[this.props.label])
              }
            })
          })
          this.valueTitle = titles.join(',')
        }
        else if (this.$refs.selectTree.getNode(this.valueId)) {
          this.valueTitle = this.$refs.selectTree.getNode(this.valueId).data[this.props.label] // 初始化显示
          this.$refs.selectTree.setCurrentKey(this.valueId) // 设置默认选中
          this.defaultExpandedKey = [this.valueId] // 设置默认展开
        }
      }
      this.initScroll()
    },
    getNode(id) {
      return this.$refs.selectTree.getNode(id)
    },
    // 初始化滚动条
    initScroll() {
      this.$nextTick(() => {
        const scrollWrap = document.querySelectorAll('.el-scrollbar .el-select-dropdown__wrap')[0]
        const scrollBar = document.querySelectorAll('.el-scrollbar .el-scrollbar__bar')
        if (scrollWrap) {
          scrollWrap.style.cssText = 'margin: 0px; max-height: none; overflow: hidden;'
        }
        if (scrollBar) {
          scrollBar.forEach((ele) => {
            return (ele.style.width = 0)
          })
        }
      })
    },
    // 切换选项
    handleNodeClick(node) {
      if (this.showCheckbox) {
        return
      }
      if (node.onlyTreeUse) {
        return
      }
      if (node.disabled) {
        this.$message.warning(`节点（${node[this.props.label]}）被禁止选择，请重新选择。`)
        return
      }
      if (this.isOnlySelectLeaf && node.children.length > 0) {
        this.$message.warning(`不能选择根节点（${node[this.props.label]}）请重新选择。`)
        return
      }
      this.valueTitle = node[this.props.label]
      this.valueId = node[this.props.value]
      this.$emit('getValue', this.valueId, this.valueTitle, node)
    },
    handleCheckChange(data, checked, indeterminate) {
      const nodes = this.$refs.selectTree.getCheckedNodes()
      this.valueTitle = nodes
        .map((node) => {
          return node[this.props.label]
        })
        .join(',')
      this.valueId = nodes
        .map((node) => {
          return node[this.props.value]
        })
        .join(',')
      this.$emit('getValue', this.valueId, this.valueTitle, nodes)
    },
    // 清除选中
    clearHandle() {
      this.valueTitle = ''
      this.valueId = null
      this.defaultExpandedKey = []
      if (this.showCheckbox) {
        this.$refs.selectTree.setCheckedKeys([])
      }
      this.clearSelected()
      this.$emit('getValue', null, null, null)
    },
    /* 清空选中样式 */
    clearSelected() {
      const allNode = document.querySelectorAll('#tree-option .el-tree-node')
      allNode.forEach(element => element.classList.remove('is-current'))
    },
    filterNode(value, data) {
      if (!value)
        return true
      return data[this.props.label].includes(value)
    },
    /* 关闭下拉列表 */
    closeSelect() {
      this.$refs.selectDown.blur()
    },
  },
}
</script>

<template>
  <el-select
    ref="selectDown"
    :value="valueTitle"
    :size="size"
    :disabled="disabled"
    :clearable="clearable"
    :placeholder="placeholderText"
    @clear="clearHandle"
  >
    <el-input
      v-model.trim="filterText"
      clearable
      size="small"
      placeholder="输入关键字进行过滤"
    />
    <el-option
      :value="valueTitle"
      :label="valueTitle"
      class="options"
    >
      <el-tree
        id="tree-option"
        ref="selectTree"
        :accordion="accordion"
        :data="optionData"
        :show-checkbox="showCheckbox"
        :props="props"
        highlight-current
        :node-key="props.value"
        :default-expanded-keys="defaultExpandedKey"
        :filter-node-method="filterNode"
        :check-strictly="checkStrictly"
        @check-change="handleCheckChange"
        @node-click="handleNodeClick"
      >
        <template slot-scope="{ node, data }">
          <span :class="{ disabled: data.onlyTreeUse }">{{ data[props.label] }}</span>
        </template>
      </el-tree>
    </el-option>
  </el-select>
</template>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.el-select {
  width: 100%;
}
.el-scrollbar .el-scrollbar__view .el-select-dropdown__item {
  height: auto;
  max-height: 274px;
  padding: 0;
  overflow: hidden;
  overflow-y: auto;
}
.el-select-dropdown__item.selected {
  font-weight: normal;
}
ul li >>> .el-tree .el-tree-node__content {
  height: auto;
  padding: 0 20px;
}
.el-tree-node__label {
  font-weight: normal;
}
.el-tree >>> .is-current .el-tree-node__label {
  color: #409eff;
  font-weight: 700;
}
.el-tree >>> .is-current .el-tree-node__children .el-tree-node__label {
  color: #606266;
  font-weight: normal;
}
.disabled {
  color: rgb(199, 199, 199);
}
/* 开发禁用 */
/* .el-tree-node:focus>.el-tree-node__content{
    background-color:transparent;
    background-color: #f5f7fa;
    color: #c0c4cc;
    cursor: not-allowed;
  }
  .el-tree-node__content:hover{
    background-color: #f5f7fa;
  } */
</style>
