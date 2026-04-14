<script>
import { getShowTypeDetailFn, saveShowTypeFn } from '@/http/safe-production/genCode/show-type-api'

export default {
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      loading: false,
      inputForm: {
        id: '',
        label: '',
        value: '',
        sort: '',
        component: '',
        importPath: '',
      },
    }
  },
  methods: {
    init(method, id) {
      this.method = method
      this.inputForm.id = id
      if (method === 'add') {
        this.title = '\u65B0\u5EFA\u63A7\u4EF6\u7C7B\u578B'
      }
      else if (method === 'edit') {
        this.title = '修改控件类型'
      }
      else if (method === 'view') {
        this.title = '查看控件类型'
      }
      this.visible = true
      this.loading = false
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.loading = true
          getShowTypeDetailFn(this.inputForm.id).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.genShowType)
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
          saveShowTypeFn(this.inputForm).then(({ data }) => {
            if (data && data.success) {
              this.visible = false
              this.$message.success(data.msg)
              this.$emit('refreshDataList')
            }
            else {
              this.$message.error(data.msg)
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
            label="标签"
            prop="label"
            :rules="[{ required: true, message: '标签不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.label"
              placeholder="请填写标签"
            />
          </el-form-item>
        </el-col>
        <el-col :span="20">
          <el-form-item
            label="值"
            prop="value"
            :rules="[{ required: true, message: '值不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.value"
              placeholder="请填写值"
            />
          </el-form-item>
        </el-col>
        <el-col :span="20">
          <el-form-item
            label="UI组件"
            prop="component"
          >
            <el-input
              v-model="inputForm.datcomponentaUrl"
              placeholder="element ui基础组件请勿填写，自定义或者第三方组件请填写"
            />
          </el-form-item>
        </el-col>
        <el-col :span="20">
          <el-form-item
            label="引入路径"
            prop="importPath"
          >
            <el-input
              v-model="inputForm.importPath"
              placeholder="element ui基础组件请勿填写，自定义或者第三方组件请填写"
            />
          </el-form-item>
        </el-col>
        <el-col :span="20">
          <el-form-item
            label="排序"
            prop="sort"
            :rules="[{ required: true, message: '排序不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.sort"
              placeholder="请填写排序"
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
