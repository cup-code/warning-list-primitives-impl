<script>
import { axiosGet, createAxiosFromStore } from '@/http/common/utils'

export default {
  name: 'NewSelect',
  props: {
    /* 配置项 */
    props: {
      type: Object,
      default: () => {
        return {
          value: 'value', // ID字段名
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
    label: {
      type: String,
      default: '',
    },
    showCheckbox: {
      type: Boolean,
      dafault: () => {
        return false
      },
    },
    /* 初始值 */
    // label: {
    //   type: String,
    //   default: () => {
    //     return null
    //   },
    // },
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
    textColor: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      valueId: this.value, // 初始值
      valueTitle: '丹务1',
      defaultExpandedKey: [],
      placeholderText: this.placeholder,
      treeList: [],
      valueData: this.data,
      filterText: '',
    }
  },
  computed: {
    optionData() {
      return [
        { id: 1, label: '后边1', value: '后边1' },
        { id: 2, label: '龙轩1', value: '龙轩1' },
        { id: 3, label: '文亚2', value: '文亚2' },
        { id: 4, label: '丹务2', value: '丹务2' },
        { id: 5, label: '丹寮下2-1', value: '丹寮下2-1' },
        { id: 6, label: '丹务1', value: '丹务1' },
        { id: 7, label: '后边2', value: '后边2' },
        { id: 8, label: '东坡北1', value: '东坡北1' },
        { id: 9, label: '调低1-1', value: '调低1-1' },
      ]
    },
  },
  watch: {
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
    // this.getTree()
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
          this.valueTitle = this.$refs.selectTree.getNode(this.valueId).data[
            this.props.label
          ] // 初始化显示
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
        const scrollWrap = document.querySelectorAll(
          '.el-scrollbar .el-select-dropdown__wrap',
        )[0]
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
      console.log(node, 9999)

      if (this.showCheckbox) {
        return
      }
      if (node.onlyTreeUse) {
        return
      }
      if (node.disabled) {
        this.$message.warning(
          `节点（${node[this.props.label]}）被禁止选择，请重新选择。`,
        )
        return
      }
      if (this.isOnlySelectLeaf && node.children.length > 0) {
        this.$message.warning(`不能选择根节点（${node[this.props.label]}）请重新选择。`)
        return
      }
      this.valueId = node[this.props.value]
      this.valueTitle = node[this.props.label]
      this.$emit('getValue', this.valueId, this.valueTitle, node)
    },
    handleCheckChange(data) {
      this.valueTitle = data
      this.valueId = data

      this.$emit('getValue', data, this.valueTitle)
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
  <div
    class="box-border flex overflow-hidden justify-center items-center p-2 h-7 rounded-md border border-gray-300 border-dashed line-height-7"
  >
    <el-dropdown trigger="click" @command="handleCheckChange">
      <span class="el-dropdown-link">
        <div
          class="flex justify-center items-center text-xs font-bold text-white"
        >
          <span>{{ label }}</span>
          <i class="ml-1 font-bold el-icon-caret-bottom text-s" />
          <el-divider v-if="valueTitle" direction="vertical" />
          <div
            v-if="valueTitle"
            class="flex items-center px-2 pr-1 text-xs font-normal rounded cursor-pointer group"
          >
            <span :class="textColor">{{ valueTitle }}</span>
            <div @click.stop="clearHandle">
              <i
                class="ml-1 text-white rounded-full cursor-pointer el-icon-circle-close"
              />
            </div>
          </div>
        </div>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item
          v-for="(item, index) in optionData"
          :key="index"
          :command="item.label"
          class="options"
          style="width: 6vw; padding: 0 10px; text-align: center"
        >
          <span>{{ item.label }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<style scoped>
.el-select {
  width: 100%;
  border: none;
}

.theme-default .el-dropdown-menu--mini .el-dropdown-menu__item {
  padding: 0 !important;
  margin-top: 8px !important;
}

::v-deep .el-input--small .el-input__inner {
  border: none !important;
}

::v-deep .el-tree .el-tree-node .el-tree-node__content:hover {
  border-radius: 0 !important;
}

::v-deep .el-tree .el-tree-node.is-current > .el-tree-node__content {
  border-radius: 0 !important;
}
</style>
