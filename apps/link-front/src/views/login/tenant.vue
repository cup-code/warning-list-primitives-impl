<script>
import Qrcode from '@chenfengyuan/vue-qrcode'
import copyright from '@/components/copyright'
import { login } from '@/http/user-api'
import {
  initRouter,
  setStorage,
  setTreeData,
} from '@/utils'
import { setAuthToken, setTenantToken, setSessionAlive } from '@/utils/tab-session'

export default {
  name: 'tenantLogin',
  components: {
    Copyright: copyright,
    Qrcode,
  },
  data() {
    return {
      loading: false,
      form: {},
      rules: {
        username: [{ required: true, trigger: 'blur', message: '请输入账号' }],
        password: [{ required: true, trigger: 'blur', message: '请输入密码' }],
      },
      appUrl: '', // app下载地址
    }
  },
  created() {
    this.appUrl = JSON.parse(localStorage.getItem('globalData')).appDownloadPath
  },
  methods: {
    // 登录按钮
    loginFn() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true
          const form = this.form
          const token = btoa(`${form.username}:${form.password}`)

          // 1、先清空sessionStorage（不影响其他标签页）
          sessionStorage.clear()
          this.$store.dispatch('user/logout') // 清空全局状态

          // 2、再登录
          login(form.username, form.password)
            .then((res) => {
              const resD = res.data
              const msg = resD.message
              const result = resD.result
              if (resD.success) {
                // localStorage.setItem('tk', 'Basic ' + token);
                setAuthToken(res.headers.authorization)
                this.$store.dispatch('user/token', res.headers.authorization)
                sessionStorage.setItem('tk', token)
                this.$store.dispatch('user/authtoken', token)

                sessionStorage.setItem('sessionId', msg)
                setTenantToken(result.authToken)
                this.$store.dispatch('user/tenantToken', result.authToken)
                sessionStorage.setItem('user', JSON.stringify(result))
                this.$store.dispatch('user/user', result)

                // 专门用来控制失效的(默认是半小时)
                // setStorage('isAlive', true);
                setStorage('isAlive', true, 365 * 24 * 60 * 60) // 一年
                setSessionAlive(365 * 24 * 60 * 60)

                const permsTree = setTreeData(result.permissions)
                initRouter(this.$store, { result: permsTree })

                // 请求字典数据 并且 全局保存
                // this.$store.dispatch('dic/updateDic');

                // 重定向方式
                // this.$router.push({ path: this.redirect || permsTree[0].path, query: this.otherQuery });

                // 默认打开第一个菜单下的第一个子级菜单
                let path = permsTree[0].path
                const children = permsTree[0].children || []
                if (children.length > 0) {
                  path += `/${children[0].path}`
                }
                this.$router.push({ path, query: this.otherQuery })
              }
              else {
                this.$message({
                  message: msg || '登录失败',
                  type: 'error',
                })
              }
            })
            .catch((err) => {
              this.$message({
                message: '登录失败',
                type: 'error',
              })
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
    // 跳转到租户申请页
    toRegister() {
      this.$router.push('/tenantRegister')
    },
    // 跳转到帮助页
    toHelp() {
      // 直接打开一个标签页的方式
      // window.open('https://cloud.kylink.cc/kcloud-doc/company/');

      // 使用自己组件打开的方式
      const routeUrl = this.$router.resolve({
        path: `/help`,
        query: {
          src: 'https://cloud.kylink.cc/kcloud-doc/company/',
          isCo: 1, // 是否是企业版
        },
      })
      window.open(routeUrl.href, '_blank')
    },
  },
}
</script>

<template>
  <div class="tenantLogin-container">
    <div class="top-con">
      <div class="top-left">
        <img src="../../assets/login/logoTitle.png">
        <span>企业版</span>
      </div>
      <div class="top-right">
        <span @click="toHelp">帮助中心</span>
      </div>
    </div>
    <el-card class="box-card">
      <div style="text-align: center; padding-bottom: 20px">
        <!-- <img src="../../assets/login/logoTitle1.png" style="width: 36%;"> -->
        <span style="font-weight: bold">企业号登录</span>
      </div>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-width="50px"
        size="medium"
      >
        <el-form-item prop="username" label="账号">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item prop="password" label="密码">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入登录密码"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            style="width: 100%"
            type="primary"
            :loading="loading"
            @click="loginFn"
          >
            登录
          </el-button>
        </el-form-item>

        <el-form-item style="text-align: right; margin: 0" size="mini">
          <el-popover
            placement="right"
            width="300"
            trigger="hover"
          >
            <div style="display: flex; flex-direction: column; align-items: center">
              <div style="padding-bottom: 6px; font-weight: bold">
                请扫码下载
              </div>
              <Qrcode
                :value="appUrl"
                tag="img"
                :options="{ size: 200 }"
              />
            </div>
            <el-button slot="reference" type="text">
              下载app
            </el-button>
          </el-popover>
          <span> | 暂无账号, </span>
          <el-button type="text" @click="toRegister">
            去注册
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 版权信息 -->
    <copyright />
  </div>
</template>

<style lang="scss" scoped>
.tenantLogin-container {
  background-image: url("../../assets/login/bg1.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  height: 100%;
  position: relative;
  .top-con {
    background: rgba(255, 255, 255, 0.1);
    height: 50px;
    padding: 0 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .top-left {
      height: 100%;
      display: flex;
      align-items: center;
      img {
        height: 70%;
      }
      span {
        color: #fff;
        background-color: #409eff;
        border-radius: 5px;
        padding: 4px 10px;
        margin-left: 6px;
        font-size: 12px;
        font-weight: bold;
        margin-left: 16px;
      }
    }
    .top-right {
      span {
        color: #fff;
        font-size: 13px;
        font-weight: bold;
        cursor: pointer;
      }
    }
  }
  .box-card {
    width: 400px;
    position: absolute;
    right: 40px;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
