<script>
import {
  getCodeParamDetailFn,
  saveCodeParamFn,
} from '@/http/safe-production/genCode/code-param-api'

export default {
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      loading: false,
      inputForm: {
        id: '',
        projectPath: '',
        frontPath: '',
        packageName: '',
        author: '',
      },
    }
  },
  methods: {
    init(method, id) {
      this.method = method
      this.inputForm.id = id
      if (method === 'add') {
        this.title = '\u65B0\u5EFA\u4EE3\u7801\u751F\u6210\u53C2\u6570'
      }
      else if (method === 'edit') {
        this.title = '修改代码生成参数'
      }
      else if (method === 'view') {
        this.title = '查看代码生成参数'
      }
      this.visible = true
      this.loading = false
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.loading = true
          getCodeParamDetailFn(this.inputForm.id).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.genCodeParam)
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
          saveCodeParamFn(this.inputForm).then(({ data }) => {
            if (data && data.success) {
              this.visible = false
              this.$message.success(data.message)
              this.$emit('refreshDataList')
            }
            else {
              this.$message.error(data.message)
            }
            this.loading = false
          })
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog

    :title="title"
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      label-width="120px"
      :model="inputForm"
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <el-row :gutter="15">
        <el-col :span="20">
          <el-form-item
            label="后端生成路径"
            prop="projectPath"
          >
            <el-input
              v-model="inputForm.projectPath"
              placeholder="请填写后端生成路径"
            />
          </el-form-item>
        </el-col>
        <el-col :span="20">
          <el-form-item
            label="前端生成路径"
            prop="frontPath"
          >
            <el-input
              v-model="inputForm.frontPath"
              placeholder="请填写前端生成路径"
            />
          </el-form-item>
        </el-col>
        <el-col :span="20">
          <el-form-item
            label="默认包名"
            prop="packageName"
          >
            <el-input
              v-model="inputForm.packageName"
              placeholder="请填写默认包名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="20">
          <el-form-item
            label="默认作者"
            prop="author"
          >
            <el-input
              v-model="inputForm.author"
              placeholder="请填写默认作者"
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
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-show="method !== 'view'"
        v-noMoreClick
        type="primary"
        size="small"
        @click="doSubmit()"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
