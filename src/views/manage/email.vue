<script>
import { editEmailInfo, getEmailInfo } from '@/http/manage-api'

export default {
  data: () => ({
    loading: false,
    form: {},
    rules: {
      from: [{ required: true, message: '请填写 邮箱账户', trigger: 'blur' }],
      host: [{ required: true, message: '请填写 服务器域名', trigger: 'blur' }],
      password: [{ required: true, message: '请填写 密码或授权码', trigger: 'blur' }],
      port: [{ required: true, message: '请填写 端口号', trigger: 'blur' }],
      username: [{ required: true, message: '请填写 用户名', trigger: 'blur' }],
    },
    submitLoading: false,
  }),
  created() {
    this.getDataList()
  },
  methods: {
    getDataList() {
      this.loading = true
      getEmailInfo()
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

        editEmailInfo(this.form)
          .then((res) => {
            const resD = res.data
            const msg = resD.message
            this.submitLoading = false
            if (resD.success === true) {
              this.$message.success('修改成功')
              this.getDataList()
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
        label-width="95px"
        :rules="rules"
      >
        <el-form-item
          label="邮箱账户"
          prop="from"
        >
          <el-input
            v-model="form.from"
            placeholder="发件邮箱账户，遵循RFC-822标准"
          />
        </el-form-item>
        <el-form-item
          label="服务器域名"
          prop="host"
        >
          <el-input
            v-model="form.host"
            placeholder="SMTP服务器域名"
          />
        </el-form-item>
        <el-form-item
          label="密码或授权码"
          prop="password"
        >
          <el-input
            v-model="form.password"
            placeholder="发送账户密码或授权码"
          />
        </el-form-item>
        <el-form-item
          label="端口号"
          prop="port"
        >
          <el-input
            v-model="form.port"
            placeholder="邮箱服务端口"
          />
        </el-form-item>
        <el-form-item
          label="用户名"
          prop="username"
        >
          <el-input
            v-model="form.username"
            placeholder="发件人用户名,如果使用foxmail或腾讯邮箱，此处user为qq号"
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
