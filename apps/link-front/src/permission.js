import { getMyTenantInfo } from '@/http/manage-api'
import router from '@/router'
import { asyncRoutes, resetRouter } from '@/router/index'
import store from '@/store'
import {
  initRouter,
  setPermissionTreeData,
} from '@/utils'
import { getSessionAlive, getAuthToken, clearSession, validateSession } from '@/utils/tab-session'

// Safe sessionStorage read (returns null when blocked by browser in cross-origin iframe)
function safeSessionGet(key) {
  try {
    return sessionStorage.getItem(key)
  }
  catch (e) {
    return null
  }
}

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
      // 同步回写 localStorage，确保组件直接读 globalData 时能拿到最新值
      try {
        const prev = JSON.parse(localStorage.getItem('globalData')) || {}
        const merged = { ...prev, ...res }
        localStorage.setItem('globalData', JSON.stringify(merged))
      }
      catch (e) { /* ignore */ }
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

  // FR-009: Session consistency validation (Vuex-first, sessionStorage fallback)
  const hasUser = !!store.state.user.user || !!safeSessionGet('user')
  const hasToken = !!store.state.user.token || !!safeSessionGet('tk')
  if (checkFlag && hasUser !== hasToken) {
    clearSession()
    next({ name: 'login' })
    return
  }

  // Vuex has no user but sessionStorage might (page refresh or iframe restore)
  const sessionUser = safeSessionGet('user')
  if (sessionUser && !store.state.user.user) {
    // 刷新
    // session中取到权限数据
    const user = JSON.parse(sessionUser)
    const permsTree = setPermissionTreeData(user.permissions)

    // 在 全局状态store中 存储user
    store.dispatch('user/user', user)
    // Restore token to Vuex from sessionStorage (if available)
    const sessionToken = safeSessionGet('tk')
    if (sessionToken) {
      store.dispatch('user/token', sessionToken)
    }
    const sessionTenantToken = safeSessionGet('authToken')
    if (sessionTenantToken) {
      store.dispatch('user/tenantToken', sessionTenantToken)
    }
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
      if (getAuthToken()) {
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
  else if (!getSessionAlive() && checkFlag) {
    // localStorage设置的半小时失效, 重新到登录页
    next({ name: 'login' })
  }
  else if (!store.state.user.user && !safeSessionGet('user') && checkFlag) {
    // session失效, 重新到登录页
    next({ name: 'login' })
  }
  else {
    next()
  }
})
