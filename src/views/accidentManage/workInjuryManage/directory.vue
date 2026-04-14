<script>
import {
  deleteDirectoryById,
  modifyDirectory,
  querySuperiorDirectory,
  qureyTree,
} from '@/http/accidentManage/investigation'
import DirectoryForm from './components/directoryForm.vue'

export default {
  components: {
    DirectoryForm,
  },
  data: () => ({
    loading: false,
    treeData: [],
    defaultProps: {
      value: 'id',
      children: 'children',
      label: 'name',
    },
    filterText: '',
    form: {
      id: '',
      parentId: '',
      parentName: '',
      name: '',
      suspensionAndSalaryRetentionPeriod: '',
      sort: '',
    },
    rules: {
      parentId: [{ required: true, message: '上级分类不能为空', trigger: 'change' }],
      name: [{ required: true, message: '分类名称不能为空', trigger: 'change' }],
    },
    currentNode: '', // 记录当前选中的节点
    expandedList: [], // 记录展开的节点
  }),
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },
    'form.suspensionAndSalaryRetentionPeriod': function (val) {
      if (String(val).includes('.')) {
        // 值为小数
        const ns = String(val).split('.')
        if (ns[1] !== '5') {
          // 小数点后不为5，重置为5
          this.$message.warning('停工留薪水期最小单位0.5个月')
          this.form.suspensionAndSalaryRetentionPeriod = Number(`${ns[0]}.5`)
        }
      }
    },
  },
  mounted() {
    this.getDataList()
  },
  methods: {
    // 清除选中
    clearHandle() {
      this.form.parentId = ''
      this.clearSelected()
    },
    /* 清空选中样式 */
    clearSelected() {
      const allNode = document.querySelectorAll('#tree-option .el-tree-node')
      allNode.forEach(element => element.classList.remove('is-current'))
    },
    // 选择上级分类
    handleNodeClick(node) {
      if (node.id === this.form.id) {
        this.$message.warning('上级不能为当前分类!')
        this.form.parentId = ''
        this.form.parentName = ''
        this.$refs.selectTree.setCurrentKey(null)
      }
      else {
        this.form.parentId = node.superId
        this.form.parentName = node[this.defaultProps.label]
      }
    },
    // 搜索
    filterNode(value, data) {
      if (!value)
        return true
      return data.name.includes(value)
    },
    // 获取数据列表
    async getDataList() {
      const res = await qureyTree()
      this.treeData = res.result
      this.$nextTick(() => {
        this.$refs.tree.setCurrentKey(this.currentNode)
      })
    },
    // 保存并修改
    submitForm() {
      modifyDirectory(this.form).then((res) => {
        if (res.success) {
          this.getDataList()
        }
      })
    },
    // 增加部门
    addRootDp() {
      this.$refs.directoryForm.init('add', {
        id: '',
        parent: '',
        parentName: '',
      })
    },
    // 点击树节点后面的增加
    async appendChild(parentData) {
      this.$refs.directoryForm.init('addChild', {
        id: parentData.id,
        parentId: parentData.superId,
        parentName: parentData.name,
      })
    },
    // 删除部门
    removeDepart(data) {
      this.$confirm('您确认要删除此部门?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteDirectoryById({ id: data.superId })
            .then((data) => {
              if (data.success) {
                this.$message.success('删除成功')
                this.$refs.form.resetFields()
                this.getDataList()
              }
              else {
                this.$message.error(data.message || '删除失败')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败')
            })
        })
        .catch(() => {})
    },
    // 点击树的item
    treeNodeTap(v) {
      this.currentNode = v.id
      Object.assign(this.form, this.$options.data().form)
      querySuperiorDirectory({ id: v.parentId }).then((res) => {
        this.form.parentName = res.message
      })
      this.form = this.recover(this.form, JSON.parse(JSON.stringify(v)))
    },

    // 节点展开
    nodeExpand(data) {
      this.expandedList.push(data.id) // 在节点展开是添加到默认展开数组
    },
    // 节点收起
    nodeCollapse(data) {
      this.expandedList.splice(this.expandedList.indexOf(data.id), 1) // 收起时删除数组里对应选项
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
  <div class="depart-manage">
    <div class="head-search">
      <!-- 按钮头部 -->
      <el-row class="top">
        <el-col :span="24">
          <el-button
            type="primary"
            plain
            @click="addRootDp"
          >
            增加
          </el-button>
        </el-col>
      </el-row>
    </div>

    <!-- 主要内容 -->
    <el-row class="bot">
      <!-- 左侧 -->
      <el-col
        :span="8"
        class="left"
      >
        <el-alert :closable="false">
          <div slot="title">
            停工留薪分类目录
          </div>
        </el-alert>
        <el-input
          v-model="filterText"
          placeholder="输入关键字进行过滤"
          style="margin-top: 10px"
        />
        <div
          class="tree-bar"
          style="height: 68vh; overflow: auto"
        >
          <el-tree
            ref="tree"
            v-loading="loading"
            :data="treeData"
            :props="defaultProps"
            :default-expanded-keys="expandedList"
            highlight-current
            :expand-on-click-node="false"
            node-key="id"
            :filter-node-method="filterNode"
            @node-click="treeNodeTap"
            @node-expand="nodeExpand"
            @node-collapse="nodeCollapse"
          >
            <span
              slot-scope="{ node, data }"
              class="custom-tree-node"
              @mouseleave="mouseleave(data, $event)"
            >
              <span @mouseover="mouseover(data, $event)">{{ node.label }}</span>
              <span
                style="margin-left: 30px"
                class="none"
              >
                <el-button
                  type="text"
                  @click.stop="appendChild(data)"
                >
                  <i class="el-icon-circle-plus-outline" />
                </el-button>
                <el-button
                  type="text"
                  @click.stop="() => removeDepart(data)"
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
      </el-col>
      <!-- 右侧 -->
      <el-col
        v-show="currentNode"
        :span="13"
        class="right"
      >
        <el-alert :closable="false">
          <div slot="title">
            分类目录信息
          </div>
        </el-alert>
        <el-form
          ref="form"
          :rules="rules"
          :model="form"
          label-width="100px"
          class="demo-ruleForm"
        >
          <el-form-item
            label="上级分类"
            prop="parentName"
          >
            <el-select
              v-model="form.parentName"
              style="width: 100%"
              clearable
              @clear="clearHandle"
            >
              <el-option
                :value="form.parentId"
                :label="form.parentName"
              >
                <el-tree
                  id="tree-option"
                  ref="selectTree"
                  :data="treeData"
                  :props="defaultProps"
                  :node-key="defaultProps.value"
                  @node-click="handleNodeClick"
                />
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="分类名称"
            prop="name"
          >
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item
            label="停工留薪水期"
            prop="suspensionAndSalaryRetentionPeriod"
          >
            <el-input
              v-model.number="form.suspensionAndSalaryRetentionPeriod"
              :precision="1"
              type="number"
            >
              <template slot="append">
                月
              </template>
            </el-input>
          </el-form-item>
          <el-form-item
            label="排序"
            prop="sort"
          >
            <el-input
              v-model.number="form.sort"
              type="number"
              style="width: 200px; margin-right: 10px"
            />
            <span>值越小越靠前，支持小数</span>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="submitForm('form')"
            >
              保存并修改
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>

    <!-- 弹窗, 新增 / 修改 -->
    <directory-form
      ref="directoryForm"
      @refreshDataList="getDataList"
    />
  </div>
</template>

<style lang="scss" scoped>
.depart-manage {
  width: 100%;
  position: relative;
  padding: 10px;
  background: #f3f7f9;

  .head-search {
    width: 100%;
    box-sizing: border-box;
    background: #ffffff;
    display: flex;
    align-items: center;
    margin-bottom: 15px;
  }

  .top {
    margin: 10px;
  }

  .bot {
    background: #ffffff;
    padding: 5px;

    .select-clear {
      margin-left: 10px;
      color: #409eff;
    }

    .tree-bar {
      margin-top: 6px;
    }

    .form {
      .choose-icon-btn {
        cursor: pointer;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }

    .right {
      margin-left: 20px;
    }
  }
}

.none {
  display: none;
}

.block {
  display: inline-block;
}
.demo-ruleForm {
  width: 500px;
  padding: 10px;
}
</style>
