<script>
export default {
  data() {
    return {
      visible: false,
      loading: false,
      urgeTypes: ['系统通知', '站内信', '短信', '邮件'],
      inputForm: {
        checkedUrgeTypes: ['系统通知', '站内信'],
        content: '',
      },
    }
  },
  methods: {
    init() {
      this.visible = true
      this.$refs.inputForm.resetFields()
    },
    // 表单提交
    inputFormSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.$message.success('催办成功')
          this.visible = false
          this.loading = false
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog
    class="dialog-urgeForm-task-flowable"
    :close-on-click-modal="false"
    title="流程催办"

    :visible.sync="visible"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      size="small"
      :model="inputForm"
      label-width="120px"
      @keyup.enter.native="inputFormSubmit()"
      @submit.native.prevent
    >
      <el-form-item
        label="催办方式"
        prop="checkedUrgeTypes"
        :rules="[{ required: true, message: '催办方式不能为空', trigger: 'blur' }]"
      >
        <el-checkbox-group v-model="inputForm.checkedUrgeTypes">
          <el-checkbox
            v-for="urgeType in urgeTypes"
            :key="urgeType"
            :label="urgeType"
          >
            {{ urgeType }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item
        label="催办内容"
        prop="content"
        :rules="[{ required: true, message: '催办内容不能为空', trigger: 'blur' }]"
      >
        <el-input
          v-model="inputForm.content"
          type="textarea"
          :rows="4"
          placeholder="请输入催办内容"
        />
      </el-form-item>
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
        v-noMoreClick
        size="mini"
        type="primary"
        @click="inputFormSubmit()"
      >确定</el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-urgeForm-task-flowable {
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
