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
        label: '',
        value: '',
        sort: '',
      },
    }
  },
  methods: {
    init(method, obj) {
      this.method = method
      this.visible = true
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        this.inputForm.id = ''
        if (method === 'add') {
          this.title = '新增表字段物理类型'
          this.oldInputForm = ''
        }
        else if (method === 'edit') {
          this.title = '修改表字段物理类型'
          this.oldInputForm = obj
          this.inputForm = JSON.parse(JSON.stringify(obj))
        }
        else if (method === 'view') {
          this.title = '查看表字段物理类型'
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
        <el-col :span="22">
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
