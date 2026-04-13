<script>
export default {
  props: {
    // 最大层级, -1为不限制
    maxLv: {
      type: Number,
      default: -1,
    },
    // 是否可新增
    isAdd: {
      type: Boolean,
      default: true,
    },
    // 是否可编辑
    isEdit: {
      type: Boolean,
      default: true,
    },
    // 是否可删除
    isDel: {
      type: Boolean,
      default: true,
    },
    // 关系树配置
    defaultProps: {
      type: Object,
      default() {
        return {
          children: 'children',
          label: 'name',
          id: 'id',
          pid: 'parentId',
          sort: 'sort',
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
    // 新增/修改方法
    saveFunc: {
      type: Function,
      default: () => {},
    },
    // 删除方法
    delFunc: {
      type: Function,
      default: () => {},
    },
    // 请求的数据是否是树形结构
    isTreeType: {
      type: Boolean,
      default: true,
    },
    businessType: {
      type: String,
      default: '',
    },
    // 为所有的组织架构树时需要传这个参数，判断需不需要责任人信息
    hasResponsible: [String, Boolean],
    disappear: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      filterText: '', // 关系树-检索关键字
      loadingTree: false, // 关系树loading
      treeData: [], // 关系树数据--树形结构
      treeList: [], // 关系树数据--扁平结构
    }
  },
  computed: {
    setAddShow() {
      return function (level) {
        if (this.maxLv === -1) {
          return true
        }
        else {
          return this.maxLv > level + 1
        }
      }
    },
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
    /* 请求树数据 */
    getTreeData() {
      this.loadingTree = true
      this.getTreeFunc(this.hasResponsible)
        .then((res) => {
          if (res.data.success) {
            this.treeList = []
            // 树形结构
            if (this.isTreeType) {
              this.treeData = res.data.result || []
              this.getTreeList(this.treeData)
            }
            // 扁平结构
            else {
              let result = []
              // 如果限制了业务类型，则需要过滤调非公司类型且业务类型不等于businessType的部门
              if (this.businessType && res.data.result.length) {
                result = res.data.result.filter((item) => {
                  return (
                    !item.departmentType
                    || item.departmentType === 'COMPANY'
                    || (item.businessTypeList || []).includes(this.businessType)
                  )
                })
              }
              else {
                // 过滤掉某一部门类型的节点，比如承包商
                if (this.disappear) {
                  result = (res.data.result || []).filter(
                    item => item.departmentType !== this.disappear,
                  )
                }
                else {
                  result = res.data.result || []
                }
              }
              for (const item of result) {
                this.treeList.push({
                  id: item[this.defaultProps.id],
                  parentId: item[this.defaultProps.pid],
                  name: item[this.defaultProps.label],
                  sort: item[this.defaultProps.sort],
                })
              }
              // 排序
              result.sort((a, b) => {
                return a.sort - b.sort
              })
              this.treeData = this.getDataToTree(result)
            }
          }
          else {
            this.$message.warning(res.data.message || '查询类型树失败')
          }
        })
        .catch((err) => {
          // console.log(err)
          this.$message.warning('查询类型树出错', err)
        })
        .finally(() => {
          this.loadingTree = false
        })
    },
    /* 树形数据转扁平结构 */
    getTreeList(treeList) {
      for (const item of treeList) {
        this.treeList.push({
          id: item[this.defaultProps.id],
          parentId: item[this.defaultProps.pid],
          name: item[this.defaultProps.label],
          sort: item[this.defaultProps.sort],
        })
        if (item[this.defaultProps.children]) {
          this.getTreeList(item[this.defaultProps.children])
        }
      }
    },
    /* 扁平结构转树形结构 */
    getDataToTree(result) {
      const {
        id,
        pid,
        children,
      } = this.defaultProps
      const cloneData = JSON.parse(JSON.stringify(result))
      // cloneData.sort((a, b) => {
      //   return a.sort - b.sort
      // })
      return cloneData.filter((father) => {
        const branchArr = cloneData.filter(child => father[id] == child[pid])
        branchArr.length > 0 ? (father[children] = branchArr) : ''
        return !father[pid] // 返回第一层
      })
      // const treeObj = {}
      // const treeArr = []
      // // 将数组转为id为key的对象
      // for (let item of result) {
      //   treeObj[item[id]] = item
      // }
      // console.log(JSON.stringify(treeObj))
      // // 循环取出treeObj的key
      // for (let key in treeObj) {
      //   // 如果有parentId
      //   if (treeObj[key][pid]) {
      //     //  如果没有children就创建一个
      //     let parentId = treeObj[key][pid]
      //     if (!treeObj[parentId][children]) {
      //       treeObj[parentId][children] = []
      //     }
      //     // 找到父对象，将子对象push进去
      //     treeObj[parentId][children].push(treeObj[key])
      //   }
      //   // 如果没有parent，则作为第一层结构push进tree
      //   else {
      //     treeArr.push(treeObj[key])
      //   }
      // }
      // console.log(JSON.stringify(treeObj))
      // console.log(treeArr)
      // return treeArr
    },
    /* 对树节点进行筛选时执行的方法，返回 true 表示这个节点可以显示，返回 false 则表示这个节点会被隐藏 */
    filterNode(value, data) {
      if (!value) {
        return true
      }
      return data[this.defaultProps.label].includes(value)
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      const param = {
        id: data[this.defaultProps.id],
        name: data[this.defaultProps.label],
        onlyTreeUse: data.onlyTreeUse,
        level: data.level,
        nodeType: data.nodeType,
      }
      this.$emit('treeNodeTap', param)
    },
    /* 点击新增关系树 */
    addTreeClick(data) {
      const params = {}
      const parentId = data && data.parentId ? data[this.defaultProps.id] : '-1'
      let level = data ? data.level : 0
      if (level === undefined) {
        level = 0
      }
      params.parentId = parentId
      params.level = level

      this.$emit('showDialog', params)
    },
    /* 点击编辑关系树 */
    editTreeClick(data) {
      const params = { ...data }
      this.$emit('showDialog', params)
    },
    /* 点击删除关系树 */
    delTreeClick(data) {
      this.$confirm(`您确定要删除<${data[this.defaultProps.label]}>吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loadingTree = true
          this.delFunc(data[this.defaultProps.id])
            .then((res) => {
              if (res.data.success) {
                this.getTreeData()
              }
              else {
                this.$message.warning(res.data.message || '删除关系树节点失败')
              }
            })
            .catch((err) => {
              this.$message.warning('删除关系树节点出错', err)
            })
            .finally(() => {
              this.loadingTree = false
            })
        })
        .catch(() => {})
    },
    /* 提交节点新增/修改 */
    submitClick(params) {
      this.saveFunc(params)
        .then((res) => {
          if (res.data.success) {
            this.$message.success(res.data.message)
            this.getTreeData()
            this.$emit('showDialog', false)
          }
          else {
            this.$message.warning(res.data.message || '节点变更失败')
          }
        })
        .catch((err) => {
          this.$message.warning('节点变更出错', err)
        })
        .finally(() => {
          this.loadingDialog = false
        })
    },
    /* 清空选中状态 */
    refreshClick() {
      this.filterText = ''
      this.getTreeData()
      this.$emit('treeNodeTap', null)
    },
  },
}
</script>

<template>
  <div class="leftTree">
    <!-- 左侧 -->
    <el-card
      shadow="never"
      style="height: 100%; width: 100%; border: none; border-radius: 6px"
    >
      <div
        slot="header"
        class="space-between"
      >
        <span>{{ title }}</span>
        <div>
          <i
            v-if="isAdd"
            class="tree-btn el-icon-plus"
            @click="addTreeClick(undefined)"
          />
          <i
            class="tree-btn el-icon-refresh-right"
            @click="refreshClick"
          />
        </div>
      </div>
      <div style="height: 100%; width: 100%">
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
          :expand-on-click-node="false"
          node-key="id"
          check-strictly
          :filter-node-method="filterNode"
          @node-click="treeNodeTap"
        >
          <span
            slot-scope="{ node, data }"
            class="space-between tree-item"
          >
            <!-- <span :class="{ disabled: data.onlyTreeUse }">{{ data[defaultProps['label']] }}</span> -->
            <el-tooltip
              :content="data[defaultProps.label]"
              placement="top"
            >
              <span :class="{ disabled: data.onlyTreeUse }">
                {{ data[defaultProps.label] }}</span>
            </el-tooltip>
            <span class="btn-box">
              <i
                v-if="isAdd"
                v-show="setAddShow(data.level)"
                class="tree-btn el-icon-plus"
                @click.stop="addTreeClick(data)"
              />
              <i
                v-if="isEdit"
                class="tree-btn el-icon-edit"
                @click.stop="editTreeClick(data)"
              />
              <i
                v-if="isDel"
                class="tree-btn el-icon-delete"
                @click.stop="delTreeClick(data)"
              />
            </span>
          </span>
        </el-tree>
      </div>
    </el-card>
    <!-- 弹窗 -->
    <slot name="dialog" />
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
    padding: 10px;
    width: 100%;
    height: calc(100% - 50px);
    overflow: auto;
  }
}

.leftTree {
  height: 100%;
  width: 100%;
}

.space-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.treeBox-tree {
  width: 100%;
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
  color: var(--ky-primary);
  font-weight: bold;
}

.disabled {
  color: rgb(199, 199, 199);
}

.tree-item {
  // width: 100%;
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
