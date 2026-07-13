<script>
import { getSysOfficeTreeData } from '@/http/safe-production/flowable-api'

export default {
  name: 'el-tree-select',
  props: {
    /* 配置项 */
    props: {
      type: Object,
      default() {
        return {
          value: 'id',
          // ID字段名
          label: 'departmentName',
          // 显示名称
          children: 'childrenDepartment', // 子级字段名
        }
      },
    },

    /* 选项列表数据(树形结构的对象数组) */
    data: {
      type: Array,
      default() {
        return []
      },
    },

    /* 选项列表数据(树形结构的对象数组) */
    list: {
      type: Array,
      default() {
        return null
      },
    },

    /* 初始值 */
    value: {
      type: String,
      default() {
        return null
      },
    },

    /* 初始值 */
    url: {
      type: String,
      default() {
        return null
      },
    },
    disabled: {
      type: Boolean,
      dafault() {
        return false
      },
    },
    showCheckbox: {
      type: Boolean,
      default() {
        return false
      },
    },

    /* 初始值 */
    label: {
      type: String,
      default() {
        return null
      },
    },

    /* 可清空选项 */
    clearable: {
      type: Boolean,
      default() {
        return true
      },
    },

    /* 自动收起 */
    accordion: {
      type: Boolean,
      default() {
        return false
      },
    },
    size: {
      type: String,
      default() {
        return 'mini'
      },
    },
  },
  data() {
    return {
      valueId: this.value,
      // 初始值
      valueTitle: this.label,
      defaultExpandedKey: [],
      placeholder: '请选择',
      valueData: this.data,
    }
  },
  computed: {
    optionData() {
      if (this.list) {
        const cloneData = JSON.parse(JSON.stringify(this.list)) // 对源数据深度克隆

        return cloneData.filter((father) => {
          // 循环所有项，并添加children属性
          const branchArr = cloneData.filter((child) => {
            return father.id === child.parentId
          }) // 返回每一项的子级数组

          branchArr.length > 0 ? (father.children = branchArr) : '' // 给父级添加一个children属性，并赋值

          return father.parentId === '0' // 返回第一层
        })
      }
      else {
        return this.valueData
      }
    },
  },
  watch: {
    value() {
      this.valueId = this.value

      if (this.value === '' || this.value === null || this.value === undefined) {
        this.clearHandle()
      }
      else {
        this.initHandle()
      }
    },
    data() {
      this.valueData = this.data
    },
  },
  created() {
    if (this.url !== null) {
      this.placeholder = '加载数据中...'

      const interval = setInterval(() => {
        this.placeholder = `${this.placeholder}.`
      }, 500)

      // this.$http({
      //     url: this.url,
      //     method: 'get'
      // }).then(_ref => {
      //     var data = _ref.data;
      //     this.valueData = data.treeData;

      //     this.$nextTick(() => {
      //         this.initHandle();

      //         this.placeholder = '请选择';
      //         clearInterval(interval);
      //     });
      // });

      getSysOfficeTreeData().then(({ data }) => {
        this.valueData = data.treeData

        this.$nextTick(() => {
          this.initHandle()

          this.placeholder = '请选择'
          clearInterval(interval)
        })
      })
    }
    else {
      this.valueData = this.data
    }
  },
  methods: {
    // 初始化值
    initHandle() {
      if (this.valueId && this.valueId !== '0' && this.$refs.selectTree.getNode(this.valueId)) {
        this.valueTitle = this.$refs.selectTree.getNode(this.valueId).data[this.props.label] // 初始化显示

        this.$refs.selectTree.setCurrentKey(this.valueId) // 设置默认选中

        this.defaultExpandedKey = [this.valueId] // 设置默认展开
      }

      this.initScroll()
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
      if (node.disabled) {
        this.$message.warning(`不能选择根节点（${node[this.props.label]}）请重新选择。`)
        return
      }

      this.valueTitle = node[this.props.label]
      this.valueId = node[this.props.value]
      this.$emit('getValue', this.valueId, this.valueTitle, node)
      this.defaultExpandedKey = []
    },
    // 清除选中
    clearHandle() {
      this.valueTitle = ''
      this.valueId = null
      this.defaultExpandedKey = []
      this.clearSelected()
      this.$emit('getValue', null, null, null)
    },

    /* 清空选中样式 */
    clearSelected() {
      const allNode = document.querySelectorAll('#tree-option .el-tree-node')
      allNode.forEach((element) => {
        return element.classList.remove('is-current')
      })
    },
  },
}
</script>

<template>
  <el-select
    :value="valueTitle"
    :size="size"
    :disabled="disabled"
    :clearable="clearable"
    :placeholder="placeholder"
    ``````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````
    popper-class="treeSelect-components-selfBpmn"
    @clear="clearHandle"
  >
    <el-option
      class="options"
      :value="valueTitle"
      :label="valueTitle"
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
        @node-click="handleNodeClick"
      />
    </el-option>
  </el-select>
</template>

<style lang="scss" scoped>
.treeSelect-components-selfBpmn {
  .el-scrollbar {
    .el-scrollbar__view {
      .el-select-dropdown__item {
        height: auto;
        max-height: 274px;
        padding: 0;
        overflow: hidden;
        overflow-y: auto;
      }
    }
  }
}
</style>
