<script>
import { mapState } from 'vuex'
import {
  editPhoneCode,
  editUserPhone,
  editUserPw,
} from '@/http/manage-api'
import { clearUserSession } from '@/utils/storage-namespace'
import { $checkPhone } from '@/utils/validate'

export default {
  props: {
    userName: String,
  },
  data() {
    return {
      drawer: false,
      drawerType: 0, // 0：修改密码； 1：修改手机号
      form: {},
      rules: {
        oldPass: [
          {
            type: 'string',
            required: true,
            message: '不能为空',
            trigger: 'blur',
          },
        ],
        newPass: [
          {
            type: 'string',
            required: true,
            message: '不能为空',
            trigger: 'blur',
          },
          { validator: this.validator.isNewPwd, trigger: 'blur' },
        ],
        mobile: [{ required: true, trigger: 'blur', validator: $checkPhone }],
        verificationCode: [{ required: true, trigger: 'blur', message: '不能为空' }],
      },
      submitLoading: false,
      sendFlag: true, // 控制发送验证码
      count: 120, // 距离下次可以发验证码的 秒数
      inter: null, // 计数定时器
    }
  },
  computed: {
    ...mapState({
      user: state => state.user.user,
    }),
  },
  methods: {
    // 修改密码 按钮
    pwFn() {
      if (this.userName) {
        this.form = Object.assign(
          {},
          {
            username: this.userName,
          },
        )
      }
      // this.form = {};
      this.drawer = true
      this.drawerType = 0
    },
    // 修改手机号 按钮
    phoneFn() {
      if (this.userName) {
        this.form = Object.assign(
          {},
          {
            username: this.userName,
          },
        )
      }
      this.drawer = true
      this.drawerType = 1
    },
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

      // 调用接口
      editPhoneCode(mobile)
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
    submitFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        const {
          username,
          oldPass,
          newPass,
          mobile,
          verificationCode,
        } = this.form

        const params = { oldPass }
        if (username) {
          params.username = username
        }

        // 修改密码
        if (this.drawerType === 0) {
          params.newPass = newPass
          editUserPw(params)
            .then((res) => {
              const resD = res.data
              const msg = resD.message
              this.submitLoading = false

              if (resD.success) {
                this.$message.success('修改密码成功，请重新登录')
                this.restartFn() // 清空所有， 重新登录
                this.drawer = false
              }
              else {
                this.$message.error(msg || '修改密码失败')
              }
            })
            .catch((err) => {
              this.submitLoading = false
              this.$message.error('修改密码失败')
            })
        }
        // 修改手机号
        else if (this.drawerType === 1) {
          params.mobile = mobile
          params.verificationCode = verificationCode
          editUserPhone(params)
            .then((res) => {
              const resD = res.data
              const msg = resD.message
              this.submitLoading = false

              if (resD.success === true) {
                this.$message.success('修改手机成功，请重新登录')
                this.restartFn() // 清空所有， 重新登录
                this.drawer = false
              }
              else {
                this.$message.error(msg || '修改手机失败')
              }
            })
            .catch((err) => {
              this.submitLoading = false
              this.$message.error('修改手机失败')
            })
        }
      })
    },
    // 清空所有，重新登录
    restartFn() {
      // 清空storage (保留globalData/setting)
      clearUserSession()

      // 清空全局状态
      this.$store.dispatch('user/logout')

      // 跳转到 登录页面
      this.$router.push(`/login`)
    },
  },
}
</script>

<template>
  <div class="setting-UserCenter">
    <el-card
      class="box-card"
      shadow="hover"
    >
      <el-row
        align="middle"
        type="flex"
      >
        <el-col
          :span="3"
          class="title"
        >
          登录密码
        </el-col>
        <el-col
          :span="18"
          class="desc"
        >
          安全性高的密码可以使帐号更安全。建议您定期更换密码。
        </el-col>
        <el-col
          :span="3"
          class="btns"
        >
          <el-button
            type="primary"
            size="mini"
            @click="pwFn"
          >
            修改
          </el-button>
        </el-col>
      </el-row>
    </el-card>
    <el-card
      class="box-card"
      shadow="hover"
    >
      <el-row
        align="middle"
        type="flex"
      >
        <el-col
          :span="3"
          class="title"
        >
          手机绑定
        </el-col>
        <el-col
          :span="18"
          class="desc"
        >
          <span v-if="user.mobile">您已绑定了手机{{ user.mobile }}</span>
          <span v-else>您还未绑定手机</span>
        </el-col>
        <!-- <el-col :span="3" class="btns">
                <el-button type="primary" size="mini" @click="phoneFn">修改</el-button>
            </el-col> -->
      </el-row>
    </el-card>
    <!-- 修改微信  begin -->
    <!-- <el-card class="box-card" shadow="hover">
        <el-row align="middle" type="flex">
            <el-col :span="3" class="title">
                微信绑定
            </el-col>
            <el-col :span="18" class="desc">
                您已绑定了微信，昵称: 云平台
            </el-col>
            <el-col :span="3" class="btns">
                <el-button type="primary" size="mini">修改</el-button>
            </el-col>
        </el-row>
    </el-card> -->
    <!-- 修改微信  end -->

    <!-- 修改密码、手机号抽屉  -->
    <el-drawer
      :visible.sync="drawer"
      :with-header="false"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        修改密码
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="form"
          :model="form"
          label-width="60px"
          :rules="rules"
          size="mini"
        >
          <el-form-item
            label="用户名"
            prop="username"
          >
            <el-input
              v-model="form.username"
              :disabled="!!userName"
            />
          </el-form-item>
          <template v-if="drawerType == 0">
            <el-form-item
              label="旧密码"
              prop="oldPass"
            >
              <el-input
                v-model="form.oldPass"
                type="password"
                auto-complete="new-password"
                show-password
              />
            </el-form-item>
            <el-form-item
              v-if="drawerType == 0"
              label="新密码"
              prop="newPass"
            >
              <el-input
                v-model="form.newPass"
                type="password"
                show-password
              />
            </el-form-item>
            <el-button type="text">
              密码要求：
            </el-button>
            <br>
            <el-button type="text">
              1、必须包含大小写字母
            </el-button>
            <br>
            <el-button type="text">
              2、必须包含数字
            </el-button>
            <br>
            <el-button type="text">
              3、必须包含特殊字符：!、@、$、%、^、&、*
            </el-button>
            <br>
            <el-button type="text">
              4、密码长度不少于8个字符
            </el-button>
          </template>

          <template v-if="drawerType == 1">
            <el-form-item
              label="密码"
              prop="oldPass"
            >
              <el-input
                v-model="form.oldPass"
                type="password"
                auto-complete="new-password"
              />
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
                  size="mini"
                  @click="getCodeFn"
                >
                  获取验证码
                </el-button>
                <el-button
                  v-show="!sendFlag"
                  size="mini"
                  disabled
                >
                  重新获取({{ count }}s)
                </el-button>
              </el-col>
            </el-form-item>
          </template>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="submitFn"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss">
.setting-UserCenter {
  .box-card {
    margin-bottom: 20px;
    .title {
      font-size: 14px;
      font-weight: bold;
    }
    .btns {
      text-align: center;
    }
  }
}
</style>
