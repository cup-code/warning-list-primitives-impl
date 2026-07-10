/* * @Author: xiaorui 文档管理标签页面 * @Date: 2023-01-05 10:29:03 * @Last Modified by: xiaorui *
@Last Modified time: 2023-09-19 16:15:42 */
<script>
import SelectTree from '@/components/treeSelect/treeSelect'
import {
  deleteDocTagFn,
  getAllDocTagFn,
  saveDocTagFn,
} from '@/http/file-manager/fileTag-api'
import TagForm from './components/tagForm'

export default {
  components: {
    TagForm,
    SelectTree,
  },
  data: () => ({
    loading: false,
    treeData: [],
    defaultProps: {
      children: 'children',
      label: 'tagName',
    },
    form: {
      id: '',
      parentId: '', // 上级
      tagName: '', // 标签名称
      tagDescribe: '', // 描述
      sort: 0,
    },
    rules: {
      parentId: [{ required: true, message: '上级标签不能为空', trigger: 'change' }],
      tagName: [{ required: true, message: '标签名称不能为空', trigger: 'blur' }],
    },
    submitLoading: false,
    currentNode: '', // 记录当前选中的节点
    expandedList: [], // 记录展开的节点
  }),
  mounted() {
    this.getDataList()
  },
  methods: {
    // 获取数据列表
    getDataList() {
      this.loading = true
      getAllDocTagFn()
        .then(({ data }) => {
          if (data.success) {
            this.treeData = this.setTreeData(data.result || [])
            this.$nextTick(() => {
              this.$refs.tree.setCurrentKey(this.currentNode)
            })
          }
          else {
            this.$message.warning(data.message || '查询标签失败')
          }
        })
        .catch((err) => {
          this.$message.error('查询标签失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 增加一级标签
    addRootTag() {
      this.$refs.tagForm.init('add', { id: '', parent: { id: '' } })
    },
    // 点击树节点后面的增加
    appendChild(parentData) {
      this.$refs.tagForm.init('addChild', {
        id: '',
        parent: {
          id: parentData.id,
        },
      })
    },
    // 删除标签
    removeTag(depart) {
      this.$confirm('您确认要删除此标签？', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteDocTagFn(depart.id)
            .then(({ data }) => {
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
      this.$refs.form.clearValidate()
      this.currentNode = v.id
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
    // 保存并修改 按钮
    submitEdit() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        if (!this.form.id) {
          this.$message.warning('请先点击选择要修改的标签节点')
          return
        }
        this.submitLoading = true
        saveDocTagFn(this.form)
          .then(({ data }) => {
            if (data.success) {
              this.$message.success(data.message || '编辑成功')
              this.getDataList()
            }
            else {
              this.$message.warning(data.message || '编辑失败')
            }
          })
          .catch((err) => {
            this.$message.error('编辑失败')
          })
          .finally(() => {
            this.submitLoading = false
          })
      })
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
  <div
    v-if="hasBtnPermission('document_tag_add')"
    class="doctag-manage"
  >
    <div class="head-search">
      <!-- 按钮头部 -->
      <el-row class="top">
        <el-col :span="24">
          <el-button
            type="primary"
            plain
            @click="addRootTag"
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
        :span="7"
        class="left"
      >
        <el-alert :closable="false">
          <div slot="title">
            文档管理标签
          </div>
        </el-alert>
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
                  v-if="hasBtnPermission('document_tag_add')"
                  type="text"
                  @click.stop="appendChild(data)"
                >
                  <i class="el-icon-circle-plus-outline" />
                </el-button>
                <el-button
                  v-if="hasBtnPermission('document_tag_delete')"
                  type="text"
                  @click.stop="() => removeTag(data)"
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
        :span="12"
        class="right"
        :offset="1"
      >
        <el-alert :closable="false">
          <div slot="title">
            文档标签信息
          </div>
        </el-alert>
        <el-form
          ref="form"
          class="tree-bar"
          :model="form"
          label-width="85px"
          :rules="rules"
          size="mini"
        >
          <el-form-item
            v-if="form.parentId"
            label="上级标签"
            prop="parentId"
          >
            <SelectTree
              :props="{
                value: 'id', // ID字段名
                label: 'tagName', // 显示名称
                children: 'children', // 子级字段名
              }"
              :data="treeData"
              :value="form.parentId"
              :clearable="false"
              :accordion="true"
              @getValue="
                value => {
                  form.parentId = value
                }
              "
            />
          </el-form-item>
          <el-form-item
            label="标签名称"
            prop="tagName"
          >
            <el-input v-model="form.tagName" />
          </el-form-item>
          <el-form-item
            label="标签描述"
            prop="tagDescribe"
          >
            <el-input
              v-model="form.tagDescribe"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
            />
          </el-form-item>
          <el-form-item
            label="排序"
            prop="sort"
          >
            <el-input-number
              v-model="form.sort"
              :step="1"
              controls-position="right"
              :min="0"
              :max="1000"
            />
            <span style="margin-left: 5px; font-size: 12px; color: #606266">值越小越靠前，支持小数</span>
          </el-form-item>
          <el-form-item v-if="hasBtnPermission('document_tag_modify')">
            <el-button
              type="primary"
              :loading="submitLoading"
              @click="submitEdit"
            >
              保存并修改
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <!-- 弹窗, 新增 -->
    <tag-form
      ref="tagForm"
      :treeData="treeData"
      @refreshDataList="getDataList"
    />
  </div>
</template>

<style lang="scss" scoped>
.doctag-manage {
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
    .tree-bar {
      margin-top: 6px;
    }
  }
}
.none {
  display: none;
}
.block {
  display: inline-block;
}
</style>
