<script>
import Law from '@/components/law'
import {
  register,
  registerCode,
  resetPassword,
} from '@/http/user-api'
import { $checkPassword, $checkPhone } from '@/utils/validate'

export default {
  name: 'Register',
  components: {
    Law,
  },
  data() {
    const $checkPw = (rule, value, callback) => {
      if (this.form.password != value) {
        callback(new Error('两次密码不同'))
      }
      else {
        callback()
      }
    }
    return {
      loading: false,
      form: {},
      rules: {
        username: [{ required: true, trigger: 'blur', message: '请输入用户名' }],
        mobile: [{ required: true, trigger: 'blur', validator: $checkPhone }],
        verificationCode: [{ required: true, trigger: 'blur', message: '不能为空' }],
        password: [{ required: true, trigger: 'blur', validator: $checkPassword }],
        pw_done: [{ required: true, trigger: 'blur', validator: $checkPw }],
      },
      sendFlag: true, // 控制发送验证码
      count: 120, // 距离下次可以发验证码的 秒数
      inter: null, // 计数定时器
      lawDialog: false, // 法律条文弹窗
      isMust: false,
    }
  },
  computed: {
    // 判断是否是重置密码
    isReset() {
      return this.$route.query.mode === 'reset'
    },
    pwdText() {
      return this.$route.query.mode === 'reset' ? '新密码' : '密码'
    },
  },
  methods: {
    // 获取验证码
    getCodeFn() {
      const mobile = this.form.mobile ? this.form.mobile.trim() : ''
      const reg = /^1[3-9]\d{9}$/
      if (!reg.test(mobile)) {
        this.$message.error('请输入正确的手机号')
        return
      }
      // 如果是重置密码的，则需要用户名
      if (this.isReset) {
        if (!this.form.username) {
          this.$message.error('请输入用户名')
          return
        }
      }
      this.sendFlag = false
      this.startInter() // 开启定时器计数

      const username = this.isReset ? this.form.username : null
      // 调用接口，如果是注册username为null，如果是重置密码，则需要username
      registerCode(mobile, username)
        .then((res) => {
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.$message.success(msg || '发送成功')
          }
          else {
            this.$message.error(msg || '发送失败')
          }
        })
        .catch((err) => {
          this.$message.error('发送失败')
        })
    },
    // 注册按钮
    submitFn() {
      // 如果没有勾选法律条文，则退出
      if (!this.isMust) {
        this.$message.error('请先勾选服务条款')
        return
      }
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.loading = true

        const params = JSON.parse(JSON.stringify(this.form))
        params.mobile = params.mobile.trim()
        delete params.pw_done

        register(params)
          .then((res) => {
            this.loading = false
            const resD = res.data
            const msg = resD.message
            if (resD.success) {
              this.$message.success(msg || '注册成功')
              // 跳转到登录页
              this.toLogin()
            }
            else {
              this.$message.error(msg || '注册失败')
            }
          })
          .catch((err) => {
            this.loading = false
            this.$message.error('注册失败')
          })
      })
    },
    // 开启 计数定时器
    startInter() {
      if (this.inter)
        return
      this.inter = setInterval(() => {
        this.count--
        if (this.count == 0) {
          this.count = 120
          this.sendFlag = true
          this.endInter() // 关闭定时器
        }
      }, 1000)
    },
    // 关闭定时器
    endInter() {
      clearInterval(this.inter)
      this.inter = null
    },
    // 跳转到登录页
    toLogin() {
      this.$router.push(`/login`)
    },
    // 点击 法律条文
    showLaw() {
      this.lawDialog = true
    },
    // 确认重置密码按钮
    resetFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.loading = true
        const params = JSON.parse(JSON.stringify(this.form))
        params.mobile = params.mobile.trim()
        delete params.pw_done
        resetPassword(params)
          .then((res) => {
            this.loading = false
            const resD = res.data
            const msg = resD.message
            if (resD.success) {
              this.$message.success(msg || '重置成功')
              // 跳转到登录页
              this.toLogin()
            }
            else {
              this.$message.error(msg || '重置失败')
            }
          })
          .catch((err) => {
            this.loading = false
            this.$message.error('重置失败')
          })
      })
    },
  },
}
</script>

<template>
  <div class="register-container">
    <el-card class="box-card">
      <!-- <div style="text-align: center; padding-bottom: 30px;">注册账号</div> -->
      <div style="text-align: center; padding-bottom: 20px">
        <img
          src="../../assets/login/logoTitle1.png"
          style="width: 36%"
        >
      </div>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="70px"
        size="medium"
      >
        <el-form-item
          v-if="isReset"
          label="用户名"
          prop="username"
        >
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item
          label="手机号"
          prop="mobile"
        >
          <el-input v-model="form.mobile" />
        </el-form-item>
        <el-form-item
          label="验证码"
          prop="verificationCode"
        >
          <el-col :span="16">
            <el-input v-model="form.verificationCode" />
          </el-col>
          <el-col
            :span="8"
            style="text-align: right"
          >
            <el-button
              v-show="sendFlag"
              type="primary"
              @click="getCodeFn"
            >
              获取验证码
            </el-button>
            <el-button
              v-show="!sendFlag"
              style="padding: 10px"
              disabled
            >
              重新获取({{ count }}s)
            </el-button>
          </el-col>
        </el-form-item>
        <el-form-item
          :label="pwdText"
          prop="password"
        >
          <el-input
            v-model="form.password"
            type="password"
            auto-complete="new-password"
          />
        </el-form-item>
        <el-form-item
          label="确认密码"
          prop="pw_done"
        >
          <el-input
            v-model="form.pw_done"
            type="password"
          />
        </el-form-item>
        <template v-if="isReset">
          <el-form-item style="margin: 0">
            <el-button
              style="width: 100%"
              type="primary"
              :loading="loading"
              @click="resetFn"
            >
              重置密码
            </el-button>
          </el-form-item>
        </template>
        <template v-if="!isReset">
          <el-form-item style="margin: 0">
            <el-button
              style="width: 100%"
              type="primary"
              :loading="loading"
              @click="submitFn"
            >
              注册
            </el-button>
          </el-form-item>
          <el-form-item style="margin: 0">
            <el-checkbox v-model="isMust" />
            <span style="margin-left: 6px; font-size: 14px">我同意并遵守</span>
            <el-button
              type="text"
              @click="showLaw"
            >
              《云平台服务条款》
            </el-button>
          </el-form-item>
        </template>
        <el-form-item style="text-align: right; margin: 0">
          <span>已有账号, </span>
          <el-button
            type="text"
            @click="toLogin"
          >
            去登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 法律条文 弹窗 -->
    <el-dialog
      :visible.sync="lawDialog"
      custom-class="law-dialog"
      width="80%"
      top="6vh"
    >
      <law />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.register-container {
  background-color: #2d3a4b;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .box-card {
    width: 480px;
  }
}
</style>
