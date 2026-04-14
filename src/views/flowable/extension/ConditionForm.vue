<script>
import {
  extensionConditionSave,
  getExtensionConditionById,
} from '@/http/safe-production/flowable-api'

export default {
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      loading: false,
      conditionTab: '0',
      inputForm: {
        id: '',
        name: '',
        expression: '',
        remarks: '',
      },
    }
  },
  methods: {
    init(method, id) {
      this.method = method
      this.inputForm.id = id
      if (method === 'add') {
        this.title = `新建流程表达式`
      }
      else if (method === 'edit') {
        this.title = '修改流程表达式'
      }
      else if (method === 'view') {
        this.title = '查看流程表达式'
      }
      this.visible = true
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        this.conditionTab = '0'
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          getExtensionConditionById(this.inputForm.id).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.condition)
          })
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          extensionConditionSave(this.inputForm)
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
      class="dialog-conditionForm-extension-flowable"
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
              label="表达式"
              prop="expression"
              :rules="[{ required: true, message: '表达式不能为空', trigger: 'blur' }]"
            >
              <el-input
                v-model="inputForm.expression"
                placeholder="请填写表达式"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="备注"
              prop="remarks"
              :rules="[]"
            >
              <el-input
                v-model="inputForm.remarks"
                type="textarea"
                placeholder="请填写备注"
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
.dialog-conditionForm-extension-flowable {
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
