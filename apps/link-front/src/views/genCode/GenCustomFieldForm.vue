<script>
export default {
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      oldInputForm: '',
      inputForm: {
        id: '',
        name: '',
        sort: '',
        remarks: '',
      },
    }
  },
  methods: {
    init(method, obj) {
      this.method = method
      if (method === 'add') {
        this.title = '\u65B0\u5EFAjava\u5B57\u6BB5'
      }
      else if (method === 'edit') {
        this.title = '修改java字段'
      }
      else if (method === 'view') {
        this.title = '查看java字段'
      }
      this.visible = true
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        this.inputForm.id = ''
        this.oldInputForm = ''
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.oldInputForm = obj
          this.inputForm = JSON.parse(JSON.stringify(obj))
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.$emit('addRow', this.oldInputForm, JSON.parse(JSON.stringify(this.inputForm)))
          this.visible = false
        }
      })
    },
    continueDoSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.$emit('addRow', this.oldInputForm, JSON.parse(JSON.stringify(this.inputForm)))
          this.$refs.inputForm.resetFields()
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
    append-to-body
    :visible.sync="visible"
  >
    <el-form
      ref="inputForm"
      :disabled="method === 'view'"
      :model="inputForm"
      label-width="120px"
      @submit.native.prevent
    >
      <el-row :gutter="15">
        <el-col :span="22">
          <el-form-item
            label="java属性"
            prop="name"
            :rules="[{ required: true, message: 'java属性不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.name"
              placeholder="请填写java属性"
            />
          </el-form-item>
        </el-col>
        <el-col :span="22">
          <el-form-item
            label="备注信息"
            prop="remarks"
          >
            <el-input
              v-model="inputForm.remarks"
              placeholder="请填写说明"
            />
          </el-form-item>
        </el-col>
        <el-col :span="22">
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
        v-if="method === 'add'"
        type="primary"
        size="small"
        @click="continueDoSubmit()"
      >继续添加</el-button>
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        type="primary"
        size="small"
        @click="doSubmit()"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
