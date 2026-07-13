<script>
import Law from '@/components/law'
import { applySmSCode, applyTenant } from '@/http/manage-api'
import { $checkWord } from '@/utils/validate'

export default {
  name: 'tenantRegister',
  components: {
    Law,
  },
  data() {
    const $checkPw = (rule, value, callback) => {
      if (this.form.adminPassword != value) {
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
        token: [{ required: true, trigger: 'change', validator: $checkWord }],
        name: [{ required: true, trigger: 'blur', message: '不能为空' }],
        socialCreditCode: [{ required: true, trigger: 'blur', message: '不能为空' }],
        admin: [{ required: true, trigger: 'blur', message: '不能为空' }],
        adminPassword: [{ required: true, trigger: 'blur', message: '不能为空' }],
        pwd: [
          { required: true, trigger: 'blur', message: '不能为空' },
          { required: true, trigger: 'blur', validator: $checkPw },
        ],
        contactName: [{ required: true, trigger: 'blur', message: '不能为空' }],
        contactPhone: [{ required: true, trigger: 'blur', message: '不能为空' }],
        // verificationPhone: [
        //     {required: true, trigger: "blur", validator: $checkPhone }
        // ],
        verificationCode: [{ required: true, trigger: 'blur', message: '不能为空' }],
      },
      sendFlag: true, // 控制发送验证码
      count: 120, // 距离下次可以发验证码的 秒数
      inter: null, // 计数定时器
      lawDialog: false, // 法律条文弹窗
      isMust: false,
    }
  },
  methods: {
    // 获取验证码
    getCodeFn() {
      const mobile = this.form.contactPhone ? this.form.contactPhone.trim() : ''
      const reg = /^1[3-9]\d{9}$/
      if (!reg.test(mobile)) {
        this.$message.error('请输入正确的手机号')
        return
      }

      this.sendFlag = false
      this.startInter() // 开启定时器计数

      // 调用发送验证码接口
      applySmSCode(mobile)
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
    // 选择图片
    upBeforeFn(file) {
      this.$set(this.form, 'img', file.name) // 为了在input中显示名字
      this.form.imgObj = file // 记录所选文件，掉接口时需要
      return false
    },

    // 申请按钮
    doFn() {
      // 如果没有勾选法律条文，则退出
      if (!this.isMust) {
        this.$message.error('请先勾选服务条款')
        return
      }
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.loading = true

        const form = this.form
        const params = JSON.parse(JSON.stringify(this.form))
        params.logo = form.imgObj
        params.verificationPhone = params.contactPhone
        delete params.imgObj

        applyTenant(params)
          .then((res) => {
            this.loading = false
            const resD = res.data
            const msg = resD.message

            if (resD.success) {
              this.$message.success('已申请, 等待审核通过')
            }
            else {
              this.$message.error(msg || '租户申请失败')
            }
          })
          .catch((err) => {
            this.loading = false
            this.$message.error('租户申请失败')
          })
      })
    },

    // 跳转到企业登录页
    toLogin() {
      this.$router.push(`/tenantLogin`)
    },
    // 点击 法律条文
    showLaw() {
      this.lawDialog = true
    },
  },
}
</script>

<template>
  <div class="tenantRegister-container">
    <el-card class="box-card">
      <div style="text-align: center">
        <img
          src="../../assets/login/logoTitle1.png"
          style="width: 36%"
        >
      </div>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        size="mini"
        label-width="85px"
      >
        <el-form-item
          prop="token"
          label="公司编码"
        >
          <el-input
            v-model="form.token"
            placeholder="请填写英文字母"
          />
        </el-form-item>
        <el-form-item
          prop="name"
          label="公司名称"
        >
          <el-input
            v-model="form.name"
            placeholder="请填写真实公司名称，以免审核失败"
          />
        </el-form-item>
        <el-form-item
          prop="socialCreditCode"
          label="公司代码"
        >
          <el-input
            v-model="form.socialCreditCode"
            placeholder="请填写公司统一社会信用代码"
          />
        </el-form-item>
        <el-form-item
          label="公司logo"
          prop="img"
        >
          <el-input
            v-model="form.img"
            placeholder="请选择公司图标"
          >
            <template slot="append">
              <el-upload
                action=""
                :before-upload="upBeforeFn"
              >
                <el-button
                  size="mini"
                  type="primary"
                  class="sel-pic-btn"
                >
                  选择文件
                </el-button>
              </el-upload>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item
          prop="admin"
          label="管理员"
        >
          <el-input
            v-model="form.admin"
            placeholder="请填写管理员账户名"
          />
        </el-form-item>
        <el-form-item
          prop="adminPassword"
          label="登录密码"
        >
          <el-input
            v-model="form.adminPassword"
            type="password"
            placeholder="请填写管理员登录密码"
            auto-complete="new-password"
          />
        </el-form-item>
        <el-form-item
          prop="pwd"
          label="确认密码"
        >
          <el-input
            v-model="form.pwd"
            type="password"
            placeholder="请再次填写管理员登录密码"
          />
        </el-form-item>
        <el-form-item
          prop="contactName"
          label="联系人姓名"
        >
          <el-input
            v-model="form.contactName"
            placeholder="请输入联系人姓名"
          />
        </el-form-item>
        <el-form-item
          prop="contactPhone"
          label="联系人手机"
        >
          <el-input
            v-model="form.contactPhone"
            placeholder="请输入联系人手机号"
          />
        </el-form-item>

        <!-- <el-form-item prop="verificationPhone" label="验证手机号">
                    <el-input v-model="form.verificationPhone" placeholder="请输入接收验证码的手机号"></el-input>
                </el-form-item> -->
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
              style="padding: 7px"
              disabled
            >
              重新获取({{ count }}s)
            </el-button>
          </el-col>
        </el-form-item>

        <el-form-item style="margin: 0">
          <el-button
            style="width: 100%"
            type="primary"
            :loading="loading"
            @click="doFn"
          >
            申请企业号
          </el-button>
        </el-form-item>

        <el-form-item style="margin: 0">
          <el-checkbox v-model="isMust" />
          <span style="margin-left: 6px; font-size: 12px">我同意并遵守</span>
          <el-button
            type="text"
            @click="showLaw"
          >
            《云平台服务条款》
          </el-button>
        </el-form-item>

        <el-form-item
          style="text-align: right; margin: 0"
          size="mini"
        >
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
.tenantRegister-container {
  background-color: #2d3a4b;
  height: 100%;
  position: relative;
  .box-card {
    width: 500px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .el-card__body {
      padding: 0 20px;
    }

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
