<script>
import { editWxPubInfo, getWxPubInfo } from '@/http/manage-api'

export default {
  data: () => ({
    loading: false,
    form: {
      qiyeId: '', // 企业id
      agentId: '', // 应用id
      secret: '', // 秘钥
    },
    rules: {
      qiyeId: [{ required: true, message: '企业ID不能为空', trigger: 'blur' }],
      agentId: [{ required: true, message: '应用ID不能为空', trigger: 'blur' }],
      secret: [{ required: true, message: '秘钥不能为空', trigger: 'blur' }],
    },
    submitLoading: false,
  }),
  created() {
    this.getDataList()
  },
  methods: {
    getDataList() {
      this.loading = true
      getWxPubInfo()
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

        editWxPubInfo(this.form)
          .then((res) => {
            const resD = res.data
            const msg = resD.message
            this.submitLoading = false
            if (resD.success === true) {
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
  <div class="wechatMini-manage">
    <el-card>
      <el-form
        ref="form"
        v-loading="loading"
        class="webApp-form"
        :model="form"
        label-width="95px"
        :rules="rules"
      >
        <el-form-item
          label="企业ID"
          prop="qiyeId"
        >
          <el-input v-model="form.qiyeId" />
        </el-form-item>
        <el-form-item
          label="应用ID"
          prop="agentId"
        >
          <el-input v-model="form.agentId" />
        </el-form-item>
        <el-form-item
          label="秘钥"
          prop="secret"
        >
          <el-input v-model="form.secret" />
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
.wechatMini-manage {
  position: relative;
  padding: 10px;
  .webApp-form {
    width: 50%;
  }
}
</style>
