<script>
import { getSmsProperties, saveSmsProperties } from '@/http/manage-api'

export default {
  data: () => ({
    loading: false,
    form: {
      smsSdkAppId: '', // 腾讯云短信应用id
      deviceAlertTemplateId: '', // 终端报警短信模板id
    },
    rules: {
      smsSdkAppId: [
        {
          required: true,
          message: '请填写腾讯短信服务应用id',
          trigger: 'blur',
        },
      ],
      deviceAlertTemplateId: [
        {
          required: true,
          message: '请填写终端报警短信模板id',
          trigger: 'blur',
        },
      ],
    },
    submitLoading: false,
  }),
  created() {
    this.getDataDetail()
  },
  methods: {
    getDataDetail() {
      this.loading = true
      getSmsProperties()
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.form = resD.result || {}
          }
          else {
            this.$message.error(msg || '查询失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询失败')
        })
    },
    submitFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        saveSmsProperties(this.form)
          .then((res) => {
            const resD = res.data
            const msg = resD.message
            this.submitLoading = false
            if (resD.success) {
              this.$message.success(msg || '修改成功')
            }
            else {
              this.$message.error(msg || '修改失败')
            }
          })
          .catch((err) => {
            this.submitLoading = false
            this.$message.error('修改失败')
          })
      })
    },
  },
}
</script>

<template>
  <div class="email-manage">
    <el-card>
      <el-form
        ref="form"
        v-loading="loading"
        class="email-form"
        :model="form"
        label-width="150px"
        :rules="rules"
      >
        <el-form-item
          label="腾讯短信服务应用ID"
          prop="smsSdkAppId"
        >
          <el-input
            v-model="form.smsSdkAppId"
            placeholder="请填写腾讯短信服务应用id"
          />
        </el-form-item>
        <el-form-item
          label="终端报警短信模板ID"
          prop="deviceAlertTemplateId"
        >
          <el-input
            v-model="form.deviceAlertTemplateId"
            placeholder="请填写终端报警短信模板id"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="submitFn"
          >
            确定
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.email-manage {
  position: relative;
  padding: 10px;
  .email-form {
    width: 50%;
  }
}
</style>
