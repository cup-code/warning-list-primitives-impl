import { getMyTenantInfo } from '@/http/manage-api'
import router from '@/router'
import { asyncRoutes, resetRouter } from '@/router/index'
import store from '@/store'
import {
  getStorage,
  initRouter,
  setPermissionTreeData,
} from '@/utils'

// 更新网站标题、网站logo
function changeWeb(logo, title, bg) {
  if (logo) {
    const $webLogo = document.querySelector('link[rel*="icon"]')
    $webLogo.href = logo
  }
  if (title) {
    const $webTitle = document.querySelector('title')
    $webTitle.innerHTML = title
  }
}
// 更新左上角标题、logo 的 全局状态
function changeCom(dt) {
  store.dispatch('comInfo/comInfo', dt)
}
// 调整公司名称和logo
function fixComInfo() {
  getMyTenantInfo().then(({ data }) => {
    if (data.success) {
      const res = data.result || {}
      // 修改左上角标题和logo
      changeCom(res)
    }
  })
}

function lazyLoading(url) {
  return () => import(`@/${url}.vue`)
}

router.beforeEach((to, from, next) => {
  const checkFlag
    = to.name !== 'login'
      && to.name !== 'autoLogin'
      && to.name !== 'register'
      && to.name !== 'tenantRegister'
      && to.name !== 'tenantLogin'
      && to.name !== 'help'
      && to.name !== 'editor'
      && to.name !== 'excelreportDesigner'
      && to.name !== 'excelreportViewer'
      && to.name !== 'bigscreenDesigner'
    && to.name !== 'bigscreenViewer'
    && to.name !== 'kyReport'

  if (sessionStorage.getItem('user') && !store.state.user.user) {
    // 刷新
    // session中取到权限数据
    const user = JSON.parse(sessionStorage.getItem('user'))
    const permsTree = setPermissionTreeData(user.permissions)

    // 在 全局状态store中 存储user
    store.dispatch('user/user', user)
    // 重新生成路由表
    initRouter(store, { result: permsTree })

    // 请求字典数据 并且 全局保存
    // store.dispatch('dic/updateDic');

    // 更新网站标题、logo 和 公司名称、logo;
    // 登录页有自己的更新标题名称和logo的逻辑，所以这里排除他
    if (to.name != 'login') {
      const comInfo = localStorage.getItem('globalData')
        ? JSON.parse(localStorage.getItem('globalData'))
        : null
      if (comInfo) {
        changeWeb(comInfo.minioFilePrefix + comInfo.webLogo, comInfo.webTitle)
        changeCom(comInfo)
      }
      if (localStorage.getItem('tk')) {
        fixComInfo()
      }
    }

    // 如果用户设置了开屏页，则把开屏页加入路由
    if (user.afterLoginMenu) {
      asyncRoutes.push({
        path: '/afterLoginMenu',
        component: lazyLoading(user.afterLoginMenu),
        hidden: true,
      })
      resetRouter() // 重新设置路由（根据生成的路由表）
    }

    next({ ...to, replace: true })
  }
  else if (!getStorage('isAlive') && checkFlag) {
    // localStorage设置的半小时失效, 重新到登录页
    next({ name: 'login' })
  }
  else if (!sessionStorage.getItem('user') && checkFlag) {
    // session失效, 重新到登录页
    next({ name: 'login' })
  }
  else {
    next()
  }
})
