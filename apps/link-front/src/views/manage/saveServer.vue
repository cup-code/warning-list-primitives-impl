<script>
import { getServiceConfiguration, setServiceConfiguration } from '@/http/manage-api'

export default {
  data: () => ({
    loading: false,
    form: {},
    rules: {
      ip: [{ required: true, message: 'IP地址为必填项', trigger: 'blur' }],
    },
    submitLoading: false,
  }),
  created() {
    this.getServiceConfiguration()
    this.getPrefix()
  },
  methods: {
    getServiceConfiguration() {
      this.loading = true
      getServiceConfiguration('env')
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
        setServiceConfiguration('env', this.form)
          .then(({ data }) => {
            const msg = data.message
            this.submitLoading = false
            if (data.success === true) {
              this.$message.success('修改成功')
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
  <div class="page-container-fixed">
    <ECard>
      <ETitle title="服务配置" classNameCell="mb-4" />
      <el-form
        ref="form"
        v-loading="loading"
        class="webApp-form"
        :model="form"
        label-width="95px"
        :rules="rules"
      >
        <el-form-item label="服务IP" prop="ip">
          <el-input v-model="form.ip" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="服务端口" prop="port">
          <el-input v-model="form.port" placeholder="请输入端口号" />
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
    </ECard>
  </div>
</template>

<style lang="scss" scoped>
.webApp-manage {
  position: relative;
  padding: 10px;
  .webApp-form {
    width: 50%;
    // 选择图片按钮的样式 begin
    .sel-pic-btn {
      color: #fff;
      background-color: #409eff;
      border-color: #409eff;
    }
    .el-input-group__append {
      border: none;
      background: #409eff;
    }
    // 选择图片按钮的样式 end
  }
}
</style>

<style lang="scss" scoped>
::v-deep .el-form-item--mini.el-form-item {
  margin-bottom: 20px !important;
  width: 50% !important;
}
</style>
