<script>
import { Base64 } from 'js-base64'
import copyright from '@/components/copyright'
import { initDictToLocalstorage } from '@/http/anji-report/dict-data'
import { getGlobalParameters, getMyTenantInfo } from '@/http/manage-api'
import { getDictListMap } from '@/http/safe-production/dict-manage-api'
import { login } from '@/http/user-api'
import { asyncRoutes, resetRouter } from '@/router/index'
import {
  initRouter,
  setPermissionTreeData,
  setStorage,
} from '@/utils'
import { setAuthToken, setTenantToken, setSessionAlive, clearSession } from '@/utils/tab-session'

export default {
  components: {
    Copyright: copyright,
  },
  data() {
    return {
      loading: true,
      form: {},
    }
  },
  created() {
    this.getGlobalData()
    this.parseCodeParam()
  },
  methods: {
    // 解析URL中的code参数
    parseCodeParam() {
      try {
        if (this.form.username && this.form.password) {
          this.form = {
            username: this.$route.query.name,
            password: this.$route.query.pw,
          }
          this.loginFn()
          return
        }

        // 检查URL中是否包含code参数
        const code = this.$route.query.code
        if (!code)
          return

        // 解码Base64获取用户名和密码
        const decodedData = Base64.decode(code)
        // 期望格式: username|password
        const parts = decodedData.split('|')
        if (parts.length === 2) {
          this.form = {
            username: parts[0],
            password: parts[1],
          }
        }

        this.loginFn()
      }
      catch (error) {
        console.error('解析code参数失败:', error)
      }
    },
    // 登录按钮
    loginFn() {
      this.loading = true
      const form = this.form
      const token = btoa(`${form.username}:${form.password}`)

      // 1、先清空sessionStorage（不影响其他标签页）
      clearSession()
      this.$store.dispatch('user/logout') // 清空全局状态

      // 2、再登录
      login(form.username, form.password)
        .then((res) => {
          const resD = res.data
          const msg = resD.message
          const result = resD.result

          if (resD.success) {
            this.changeWeb(resD.result.webIcon || '')

            setAuthToken(res.headers.authorization)
            this.$store.dispatch('user/token', res.headers.authorization)
            sessionStorage.setItem('tk', token)
            this.$store.dispatch('user/authtoken', token)
            const saveSet = {}
            for (const setData of result.companyConfigList || []) {
              if (setData.module == 'LayoutSettings') {
                saveSet[setData.item] = setData.value
              }
            }
            if (saveSet) {
              localStorage.setItem('setting', JSON.stringify(saveSet))
              this.$store.dispatch('settings/refreshSetting')
            }
            else {
              this.$store.dispatch('settings/resetTag')
            }
            sessionStorage.setItem('sessionId', msg)
            setTenantToken(result.authToken)
            this.$store.dispatch('user/tenantToken', result.authToken)
            sessionStorage.setItem('user', JSON.stringify(result))
            this.$store.dispatch('user/user', result)
            // 专门用来控制失效的(默认是半小时)
            // setStorage('isAlive', true);
            setStorage('isAlive', true, 365 * 24 * 60 * 60) // 一年
            setSessionAlive(365 * 24 * 60 * 60)

            const permsTree = setPermissionTreeData(result.permissions)
            console.log(permsTree, 112)
            initRouter(this.$store, { result: permsTree })
            // 请求字典数据 并且 全局保存
            // this.$store.dispatch('dic/updateDic');
            getDictListMap().then(({ data }) => {
              sessionStorage.setItem('dictList', JSON.stringify(data.result || '[]'))
            })

            // 报表设计用到的字典
            initDictToLocalstorage()

            // 更新网站标题、网站logo和公司名称、公司logo
            // this.fixComInfo();
            if (resD.result.afterLoginMenu) {
              asyncRoutes.push({
                path: '/afterLoginMenu',
                component: this.lazyLoading(resD.result.afterLoginMenu),
                hidden: true,
              })
              resetRouter() // 重新设置路由（根据生成的路由表）
            }
            // 如果设置了开屏页面，则直接进入开屏页；否则进入第一个菜单页
            if (resD.result.afterLoginMenu) {
              this.$router.push({ path: '/afterLoginMenu' })
            }
            else {
              // 默认打开第一个菜单下的第一个子级菜单
              this.defaultPath = permsTree[0].path
              // 递归找出打开的第一个菜单
              this.openDefaultMenu(permsTree[0])
            }
          }
        })
        .catch(() => {
          this.$message({
            message: '登录失败',
            type: 'error',
          })
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 默认打开第一个板块下的第一个菜单
    openDefaultMenu(item) {
      if (item.children && item.children.length > 0) {
        this.defaultPath += `/${item.children[0].path}`
        this.openDefaultMenu(item.children[0])
      }
      else {
        this.$router.push({ path: this.defaultPath, query: this.otherQuery })
      }
    },
    // 获取全局变量
    getGlobalData() {
      getGlobalParameters().then((res) => {
        if (res.data.success) {
          this.comInfo = res.data.result
          localStorage.setItem('globalData', JSON.stringify(this.comInfo))
          this.filePrefix = this.comInfo.minioFilePrefix
          this.changeWeb(
            this.comInfo.webLogo,
            this.comInfo.webTitle,
            this.comInfo.loginPic,
          )
        }
      })
    },
    // 请求公司信息并更新网站标题、网站logo、公司名称和公司logo
    fixComInfo() {
      getMyTenantInfo().then(({ data }) => {
        if (data.success) {
          const res = data.result || {}
          // 存储comInfo到localStorage
          localStorage.setItem('comInfo', JSON.stringify(res))

          // 修改网站的标题和logo
          this.changeWeb(res.webLogo, res.webTitle)

          // 修改左上角标题和logo
          this.changeCom(res)
        }
      })
    },
    lazyLoading(url) {
      return () => import(`@/${url}.vue`)
    },
    // 更新网站标题、网站logo
    changeWeb(logo, title, bg) {
      if (logo) {
        logo = this.filePrefix + logo
        const $webLogo = document.querySelector('link[rel*="icon"]')
        $webLogo.href = logo
      }
      if (title) {
        const $webTitle = document.querySelector('title')
        $webTitle.innerHTML = title
      }
      if (bg) {
        bg = this.filePrefix + bg
        this.$set(this.sty, 'backgroundImage', bg)
      }
    },
    // 更新左上角标题、logo 的 全局状态
    changeCom(dt) {
      this.$store.dispatch('comInfo/comInfo', dt)
    },
  },
}
</script>

<template>
  <div
    v-loading="loading"
    class="loginOne-container"
    element-loading-text="正在登录..."
    element-loading-background="rgba(0, 0, 0, 0.8)"
    element-loading-spinner="el-icon-loading"
  >
    <!-- 版权信息 -->
    <Copyright />
  </div>
</template>

<style lang="scss" scoped>
.loginOne-container {
  background-image: url("../../assets/login/bg.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  height: 100%;
  position: relative;
}
</style>
