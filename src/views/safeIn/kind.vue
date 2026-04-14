<script>
import SelectTree from '@/components/treeSelect/treeSelect'
import {
  deleteSafeTypeById,
  getSafeTypeAll,
  saveSafeType,
} from '@/http/safeIn-api'

export default {
  components: {
    SelectTree,
  },
  data() {
    return {
      kinds: [],
      editForm: {},
      editRules: {},
      editLoading: false,
      dialog: false,
      addForm: {},
      addRules: {},
      addLoading: false,
    }
  },
  created() {
    this.getDataList()
  },
  methods: {
    async getDataList() {
      const { data } = await getSafeTypeAll()
      if (data.code == 200) {
        this.kinds = this.setTreeData(data.result || [])
      }
      else {
        this.$message.error(data.message || '查询失败')
        this.kinds = []
      }
    },
    // 转化成树
    // setTreeData(source) {
    //     let cloneData = JSON.parse(JSON.stringify(source))
    //     cloneData.sort((a, b) => {
    //         return a.sort - b.sort
    //     })
    //     return cloneData.filter((father) => {
    //         let branchArr = cloneData.filter((child) => father.id == child.parentId)
    //         branchArr.length > 0 ? (father.children = branchArr) : ''
    //         return branchArr.length > 0 //返回第一层
    //     })
    // },
    addFn() {
      this.addForm = {
        enable: false,
      }
      this.dialog = true
    },
    saveAdd() {
      this.$refs.addForm.validate((valid) => {
        if (!valid)
          return
        this.addLoading = true
        saveSafeType(this.addForm)
          .then(({ data }) => {
            this.addLoading = false
            if (data.code === 200) {
              this.$message.success(data.message || '保存成功')
              this.dialog = false
              this.getDataList()
            }
            else {
              this.$message.error(data.message || '保存失败')
            }
          })
          .catch((err) => {
            this.addLoading = false
          })
      })
    },
    treeNodeTap(v) {
      this.editForm = JSON.parse(JSON.stringify(v))
    },
    saveEdit() {
      this.$refs.editForm.validate((valid) => {
        if (!valid)
          return
        this.editLoading = true
        saveSafeType(this.editForm)
          .then(({ data }) => {
            this.editLoading = false
            if (data.code === 200) {
              this.$message.success(data.message || '保存成功')
              this.editForm = {}
              this.getDataList()
            }
            else {
              this.$message.error(data.message || '保存失败')
            }
          })
          .catch((err) => {
            this.editLoading = false
          })
      })
    },

    delTreeNode(data) {
      this.$confirm(`确定删除 “${data.typeName}” ?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        deleteSafeTypeById(data.id).then(({ data }) => {
          if (data && data.success) {
            this.$message.success(data.message || '删除成功！')
            this.getDataList()
            this.editForm = {}
          }
        })
      })
    },
  },
}
</script>

<template>
  <div class="kind-safeIn">
    <el-card>
      <div class="fun-box">
        <el-button
          type="primary"
          icon="el-icon-plus"
          plain
          @click="addFn"
        >
          新增
        </el-button>
      </div>
      <el-row>
        <el-col
          :span="6"
          class="left-kind"
        >
          <el-tag type="info">
            安全投入科目
          </el-tag>
          <el-tree
            :data="kinds"
            :props="{
              children: 'children',
              label: 'typeName',
            }"
            :expand-on-click-node="false"
            @node-click="treeNodeTap"
          >
            <span
              slot-scope="{ node, data }"
              class="custom-tree-node"
            >
              <span>{{ node.label }}</span>
              <span>
                <el-button
                  type="text"
                  class="tree-item-button"
                  icon="el-icon-delete"
                  @click="() => delTreeNode(data)"
                />
              </span>
            </span>
          </el-tree>
        </el-col>

        <el-col
          :offset="2"
          :span="10"
          class="right-info"
        >
          <div class="mid-line">
            <div
              v-for="item in 30"
              :key="item"
            />
          </div>
          <el-tag type="info">
            安全投入科目信息
          </el-tag>

          <el-form
            ref="editForm"
            :model="editForm"
            label-width="80px"
          >
            <el-form-item label="所属科目">
              <SelectTree
                :props="{
                  value: 'id', // ID字段名
                  label: 'typeName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :data="kinds"
                :value="editForm.parentId"
                :clearable="false"
                :accordion="true"
                @getValue="value => (editForm.parentId = value)"
              />
            </el-form-item>
            <el-form-item label="科目名称">
              <el-input v-model="editForm.typeName" />
            </el-form-item>
            <el-form-item label="科目描述">
              <el-input
                v-model="editForm.typeDescribe"
                type="textarea"
                :rows="6"
                placeholder="科目描述"
              />
            </el-form-item>
            <el-form-item label="排序">
              <el-input-number
                v-model="editForm.sort"
                :min="0"
                :step="0.1"
                label="排序"
              />
              <span style="padding-left: 10px; color: #999">值越小越靠前, 支持小数</span>
            </el-form-item>
            <el-form-item label="是否启用">
              <el-switch v-model="editForm.enable" />
            </el-form-item>

            <div style="text-align: center">
              <el-button
                type="primary"
                :loading="editLoading"
                @click="saveEdit"
              >
                保存并修改
              </el-button>
            </div>
          </el-form>
        </el-col>
      </el-row>
    </el-card>

    <el-dialog
      class="normal-dialog add-dialog"
      title="新增安全投入科目"
      :visible.sync="dialog"
      width="40%"
    >
      <el-form
        ref="addForm"
        :model="addForm"
        :rules="addRules"
        label-width="85px"
        size="mini"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="所属科目"
              prop="parentId"
            >
              <SelectTree
                :props="{
                  value: 'id', // ID字段名
                  label: 'typeName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :data="kinds"
                :value="addForm.parentId"
                :clearable="false"
                :accordion="true"
                @getValue="value => (addForm.parentId = value)"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="科目名称"
              prop="typeName"
            >
              <el-input
                v-model="addForm.typeName"
                placeholder="科目名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="科目描述"
              prop="typeDescribe"
            >
              <el-input
                v-model="addForm.typeDescribe"
                type="textarea"
                :rows="6"
                placeholder="科目描述"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="排序"
              prop="sort"
            >
              <el-input-number
                v-model="addForm.sort"
                :min="0"
                :step="0.1"
                label="排序"
              />
              <span style="padding-left: 10px; color: #999">值越小越靠前, 支持小数</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="是否启用">
              <el-switch v-model="addForm.enable" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialog = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="addLoading"
          @click="saveAdd"
        >
          确认保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.kind-safeIn {
  height: calc(100vh - 50px);
  padding: 10px;
  background: #f3f7f9;
  .el-card {
    height: 100%;
  }
  .el-card__body {
    padding: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    .fun-box {
      padding: 10px;
    }
    .el-row {
      padding: 10px;
      padding-top: 0;
      flex: 1;
      overflow: hidden;
      .el-tag {
        height: auto;
        padding: 2px 10px;
      }
      .el-col {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
      .left-kind {
        .el-tree {
          flex: 1;
          overflow: auto;
          margin-top: 10px;

          .el-tree-node__content {
            &:hover .tree-item-button {
              display: unset;
              color: #f56c6c;
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
      }
      .right-info {
        position: relative;
        .mid-line {
          position: absolute;
          left: -10%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          & > div {
            height: 2%;
            width: 2px;
            background: #ccc;
          }
        }
        .el-form {
          flex: 1;
          overflow: auto;
          margin-top: 20px;
        }
      }
    }
  }
}
.normal-dialog.add-dialog {
  .el-dialog__header {
    min-height: 46px;
    .el-dialog__title {
      font-size: 16px;
      &::before {
        height: 20px;
      }
    }
  }
  .el-dialog__footer {
    padding: 8px 20px;
    border-top: 1px solid #e8e8e8;
    .dialog-footer {
      height: 30px;
    }
  }
}
</style>
