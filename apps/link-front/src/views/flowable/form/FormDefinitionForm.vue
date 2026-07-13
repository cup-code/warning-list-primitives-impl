<script>
import SelectTree from '@/components/flowable/treeSelect/treeSelect.vue'

import {
  extensionFormDefinitionSave,
  getExtensionFormDefinitionById,
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
        category: {
          id: '',
        },
        name: '',
      },
    }
  },
  methods: {
    init(method, id) {
      this.method = method
      this.inputForm.id = id
      if (method === 'add') {
        this.title = `新建流程表单`
      }
      else if (method === 'edit') {
        this.title = '修改流程表单'
      }
      else if (method === 'view') {
        this.title = '查看流程表单'
      }
      this.visible = true
      this.loading = false
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.loading = true
          getExtensionFormDefinitionById(this.inputForm.id)
            .then(({ data }) => {
              this.inputForm = this.recover(this.inputForm, data.formDefinition)
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          extensionFormDefinitionSave(this.inputForm)
            .then(({ data }) => {
              if (data && data.success) {
                this.visible = false
                this.$message.success(data.msg)
                if (this.method === 'add') {
                  this.$emit('showDesignForm', data.formDefinition.id)
                }
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
      class="dialog-formDefinitionForm-form-flowable"
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
      >
        <el-row :gutter="15">
          <el-col :span="24">
            <el-form-item
              label="分类"
              prop="category.id"
              :rules="[{ required: true, message: '分类不能为空', trigger: 'blur' }]"
            >
              <SelectTree
                ref="category"
                :props="{
                  value: 'id', // ID字段名
                  label: 'name', // 显示名称
                  children: 'children', // 子级字段名
                }"
                url="/extension/formCategory/treeData"
                :value="inputForm.category.id"
                :clearable="true"
                :accordion="true"
                @getValue="
                  value => {
                    inputForm.category.id = value
                  }
                "
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item
              label="表单名称"
              prop="name"
              :rules="[
                {
                  required: true,
                  message: '表单名称不能为空',
                  trigger: 'blur',
                },
              ]"
            >
              <el-input
                v-model="inputForm.name"
                placeholder="请填写表单名称"
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
.dialog-formDefinitionForm-form-flowable {
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
