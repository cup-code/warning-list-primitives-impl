<script>
import SelectTree from '@/components/flowable/treeSelect/treeSelect.vue'

import {
  extensionActCategorySave,
  getExtensionActCategoryById,
} from '@/http/safe-production/flowable-api'

export default {
  components: {
    SelectTree,
  },
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      loading: false,
      inputForm: {
        id: '',
        parent: {
          id: '',
        },
        name: '',
        sort: '',
        remarks: '',
      },
    }
  },
  methods: {
    init(method, obj) {
      this.method = method
      this.inputForm.id = obj.id
      if (method === 'add') {
        this.title = '新建流程分类'
      }
      else if (method === 'addChild') {
        this.title = '添加下级流程分类'
      }
      else if (method === 'edit') {
        this.title = '修改流程分类'
      }
      else if (method === 'view') {
        this.title = '查看流程分类'
      }
      this.visible = true
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        this.inputForm.parent.id = obj.parent.id
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          getExtensionActCategoryById(this.inputForm.id).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.actCategory)
          })
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          extensionActCategorySave(this.inputForm)
            .then(({ data }) => {
              if (data && data.success) {
                this.visible = false
                this.$message.success(data.msg)
                this.$emit('refreshDataList')
              }
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      class="dialog-actCategoryForm-extension-flowable"
      :title="title"
      :close-on-click-modal="false"

      :visible.sync="visible"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        size="small"
        :model="inputForm"
        :class="method === 'view' ? 'readonly' : ''"
        :disabled="method === 'view'"
        label-width="120px"
        @keyup.enter.native="doSubmit()"
        @submit.native.prevent
      >
        <el-row :gutter="15">
          <el-col :span="24">
            <el-form-item
              label="上级流程分类"
              prop="parent.id"
              :rules="[]"
            >
              <SelectTree
                v-if="visible"
                ref="parent"
                :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :url="`/extension/actCategory/treeData?extId=${inputForm.id}`"
                :value="inputForm.parent.id"
                :clearable="true"
                :accordion="true"
                @getValue="
                  value => {
                    inputForm.parent.id = value
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="名称"
              prop="name"
              :rules="[{ required: true, message: '名称不能为空', trigger: 'blur' }]"
            >
              <el-input
                v-model="inputForm.name"
                placeholder="请填写名称"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="排序"
              prop="sort"
              :rules="[
                { required: true, message: '排序不能为空', trigger: 'blur' },
                { validator: validator.isNumber, trigger: 'blur' },
              ]"
            >
              <el-input
                v-model="inputForm.sort"
                placeholder="请填写排序"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="备注信息"
              prop="remarks"
              :rules="[]"
            >
              <el-input
                v-model="inputForm.remarks"
                type="textarea"
                placeholder="请填写备注信息"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="mini"
          @click="visible = false"
        >关闭</el-button>
        <el-button
          v-if="method != 'view'"
          v-noMoreClick
          size="mini"
          type="primary"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.dialog-actCategoryForm-extension-flowable {
  .el-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: calc(100% - 30px);
    max-width: calc(100% - 30px);
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    .el-dialog__header {
      border-bottom: 1px solid #e8e8e8;
    }
    .el-dialog__body {
      overflow: auto;
    }
    .el-dialog__footer {
      border-top: 1px solid #e8e8e8;
      border-radius: 0 0 4px 4px;
    }
  }
}
</style>
