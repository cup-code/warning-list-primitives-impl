// 🔥 关键修改：通过别名导入路由配置，rsbuild.config.js 中根据 TASK 环境变量配置了不同的别名
// 这样可以确保在编译时只打包对应版本的路由，实现真正的 Tree Shaking
import constantRoutes from './routes-all'
import Vue from 'vue'

import Router from 'vue-router'
import store from '@/store'

Vue.use(Router)
// 解决ElementUI导航栏中的vue-router在3.0版本以上重复点菜单报错问题
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}
const originalReplace = Router.prototype.replace
Router.prototype.replace = function replace(location) {
  return originalReplace.call(this, location).catch(err => err)
}

// 导出常量路由，供其他模块使用
export { constantRoutes }

export const asyncRoutes = [] // 动态权限菜单

function createRouter() {
  return new Router({
    mode: 'hash',
    scrollBehavior: () => ({
      y: 0,
    }),
    routes: [...constantRoutes, ...asyncRoutes],
  })
}

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
  router.options = newRouter.options
}

/* 全局导航守卫 */
router.beforeEach((to, from, next) => {
  // 开启多页签模式时，根据进入的页面添加内容
  const userData = JSON.parse(sessionStorage.getItem('user') || '{}')
  const menuList = userData.permissions || []
  let isExist = false
  for (const item of menuList) {
    if (item.englishName === to.name) {
      isExist = true
      break
    }
  }
  if (isExist) {
    if (store.state.settings.tagModel) {
      if (to.meta.title) {
        store.dispatch('settings/addTag', {
          path: to.fullPath,
          title: to.meta.title,
          closable: true,
        })
      }
    }
  }

  next()
})

export default router
