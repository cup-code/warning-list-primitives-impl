<script>
export default {
  name: 'tenantRegister',
  data() {
    return {
      loading: false,
      form: {},
      rules: {},
      sendFlag: true, // 控制发送验证码
      count: 120, // 距离下次可以发验证码的 秒数
      inter: null, // 计数定时器
    }
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

      this.sendFlag = false
      this.startInter() // 开启定时器计数
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

    // 申请按钮
    doFn() {
      this.$refs.form.validate((valid) => {
        if (valid) {
        }
      })
    },
  },
}
</script>

<template>
  <div class="tenantOneRegister-container">
    <div class="box-card">
      <div style="text-align: center; padding-bottom: 20px">
        <img
          src="../../assets/login/logoTitle.png"
          style="width: 36%"
        >
      </div>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        size="mini"
        label-width="80px"
      >
        <el-form-item
          prop="a"
          label="租户编码"
        >
          <el-input
            v-model="form.a"
            placeholder="请填写英文字母"
          />
        </el-form-item>
        <el-form-item
          prop="b"
          label="公司名称"
        >
          <el-input
            v-model="form.b"
            placeholder="请填写真实公司名称，以免审核失败"
          />
        </el-form-item>
        <el-form-item
          prop="c"
          label="管理员"
        >
          <el-input
            v-model="form.c"
            placeholder="请填写管理员账户名"
          />
        </el-form-item>
        <el-form-item
          prop="d"
          label="登录密码"
        >
          <el-input
            v-model="form.d"
            placeholder="请填写管理员登录密码"
            auto-complete="new-password"
          />
        </el-form-item>
        <el-form-item
          prop="e"
          label="确认密码"
        >
          <el-input
            v-model="form.e"
            placeholder="请再次填写管理员登录密码"
          />
        </el-form-item>
        <el-form-item
          prop="f"
          label="联系人姓名"
        >
          <el-input
            v-model="form.f"
            placeholder="请输入联系人姓名"
          />
        </el-form-item>
        <el-form-item
          prop="g"
          label="联系人电话"
        >
          <el-input
            v-model="form.g"
            placeholder="请输入联系人电话"
          />
        </el-form-item>

        <el-form-item
          prop="mobile"
          label="验证手机号"
        >
          <el-input
            v-model="form.mobile"
            placeholder="请输入接收验证码的手机号"
          />
        </el-form-item>
        <el-form-item
          label="验证码"
          prop="verificationCode"
        >
          <el-col :span="14">
            <el-input v-model="form.verificationCode" />
          </el-col>
          <el-col
            :span="10"
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
              style="padding: 7px"
              disabled
            >
              重新获取({{ count }}s)
            </el-button>
          </el-col>
        </el-form-item>

        <el-form-item>
          <el-button
            style="width: 100%"
            type="primary"
            :loading="loading"
            @click="doFn"
          >
            申请租户
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tenantOneRegister-container {
  background-image: url('../../assets/login/bg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  height: 100%;
  position: relative;
  .box-card {
    background-image: url('../../assets/login/cardBg.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    width: 400px;
    position: absolute;
    right: 40px;
    top: 50%;
    transform: translateY(-50%);
    padding: 30px 30px 20px;

    // 定义input输入框样式的 begin (如果只需要使用默认的，把这里注释掉就行)
    .el-form {
      .el-form-item.is-error input {
        border-color: #f56c73;
      }
      input {
        border-color: #409eff;
        background: transparent;
        -webkit-appearance: none;
        color: #fff;
        &:-webkit-autofill {
          box-shadow: 0 0 0px 1000px rgba(64, 158, 255, 0.1) inset !important;
          -webkit-text-fill-color: #333 !important;
        }
      }
    }
    // 定义input输入框样式的 end

    .el-form-item__label {
      color: #eee;
    }
  }
}
</style>
