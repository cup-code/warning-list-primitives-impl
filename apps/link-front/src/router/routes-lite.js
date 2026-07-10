import Layout from '@/layout'

// 精简版路由配置
export default [
  {
    path: '/',
    redirect: '/login',
  },
  // 用户登录
  {
    name: 'login',
    path: '/login',
    component: () => import('@/views/login/one'), // 新的登录页
    hidden: true,
  },
  // 自动登录
  {
    name: 'autoLogin',
    path: '/autoLogin',
    component: () => import('@/views/login/autoLogin'), // 自动登录
    hidden: true,
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true,
  },
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
