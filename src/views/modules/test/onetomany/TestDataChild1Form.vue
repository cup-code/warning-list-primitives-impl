<script>
export default {
  components: {},
  data() {
    return {
      window,
      title: '',
      method: '',
      visible: false,
      oldInputForm: '',
      inputForm: {
        id: '',
        srartarea: '',
        endarea: '',
        remarks: '',
      },
    }
  },
  methods: {
    init(method, obj) {
      this.method = method
      if (method === 'add') {
        this.title = `新建火车票`
      }
      else if (method === 'edit') {
        this.title = '修改火车票'
      }
      else if (method === 'view') {
        this.title = '查看火车票'
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

    :visible.sync="visible"
  >
    <el-form
      ref="inputForm"
      size="small"
      :model="inputForm"
      :class="method === 'view' ? 'readonly' : ''"
      :disabled="method === 'view'"
      label-width="120px"
      @keyup.enter.native="doSubmit()"
    >
      <el-row :gutter="15">
        <el-col :span="12">
          <el-form-item
            label="出发地"
            prop="srartarea"
            :rules="[]"
          >
            <el-input
              v-model="inputForm.srartarea"
              placeholder="请填写出发地"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="目的地"
            prop="endarea"
            :rules="[]"
          >
            <el-input
              v-model="inputForm.endarea"
              placeholder="请填写目的地"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
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
        v-if="method === 'add'"
        size="small"
        type="primary"
        @click="continueDoSubmit()"
      >继续添加</el-button>
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-if="method !== 'view'"
        size="small"
        type="primary"
        @click="doSubmit()"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
