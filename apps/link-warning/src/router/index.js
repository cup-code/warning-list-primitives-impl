import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/layout'

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
// import Layout3D from '@/layout/magic'

export const constantRoutes = [

  // 培训考试  end
  {
    path: '/',
    redirect: '/login',
  },

  // 用户登录
  {
    name: 'login',
    path: '/login',
    component: () => import('@/views/login/index'), // 新的登录页
    hidden: true,
  },

  // 自动登录
  {
    name: 'autoLogin',
    path: '/autoLogin',
    component: () => import('@/views/login/autoLogin'), // 自动登录
    hidden: true,
  },

  // 用户注册
  // {
  //   name: 'register',
  //   path: '/register',
  //   component: () => import('@/views/register/index'),
  //   hidden: true,
  // },

  // 404
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true,
  },
  // 推送通知书给当事人

  // 个人中心
  {
    hidden: true,
    path: '/userCenter',
    component: Layout,
    children: [{
      path: 'index',
      name: 'userCenter',
      component: () => import('@/views/userCenter/index'), // 个人中心
      meta: {
        title: '个人中心',
        icon: 'el-icon-user',
      },
    }],
  },

  // 详情
  {
    hidden: true,
    path: '/detail',
    component: Layout,
    children: [
      {
        path: 'warningDetail',
        name: 'warningDetail',
        component: () => import('@/views/detail/warningDetail'),
        meta: {
          title: '预警详情',
        },
      },
      {
        path: 'userDetail',
        name: 'userDetail',
        component: () => import('@/views/detail/userDetail'),
        meta: {
          title: '用户信息一人一档',
        },
      },
    ],
  },
]

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
    if (item.englishName == to.name) {
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
