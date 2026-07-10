import { asyncRoutes, resetRouter } from '@/router/index'

const state = {
  authtoken: null,
  token: null,
  tenantToken: '',
  sessionAliveExp: null,
  user: null,
  menus: [],
  ltMenus: [], // 左上布局中的左侧菜单
}

const mutations = {
  AUTHTOKEN(state, token) {
    state.authtoken = token
  },
  TOKEN(state, token) {
    state.token = token
  },
  TENANT_TOKEN(state, token) {
    state.tenantToken = token || ''
  },
  SESSION_ALIVE_EXP(state, exp) {
    state.sessionAliveExp = exp
  },
  USER(state, user) {
    state.user = user
  },
  MENUS(state, menus) {
    state.menus = menus

    asyncRoutes.length = 0 // 先清空权限路由
    asyncRoutes.push(...menus) // 再添加
    resetRouter() // 重新设置路由（根据生成的路由表）
  },
  LTMENUS(state, menus) {
    state.ltMenus = menus || []
  },
  LOGOUT(state) {
    state.authtoken = null
    state.token = null
    state.tenantToken = ''
    state.sessionAliveExp = null
    state.user = {}
    state.menus = []
  },
}

const actions = {
  authtoken({ commit }, token) {
    commit('AUTHTOKEN', token)
  },
  token({ commit }, token) {
    commit('TOKEN', token)
  },
  tenantToken({ commit }, token) {
    commit('TENANT_TOKEN', token)
  },
  sessionAliveExp({ commit }, exp) {
    commit('SESSION_ALIVE_EXP', exp)
  },
  user({ commit }, user) {
    commit('USER', user)
  },
  menus({ commit }, menus) {
    menus.push({ path: '*', redirect: '/404', hidden: true })
    // 保存权限路由 + 重新生成路由表
    commit('MENUS', menus)
  },
  ltMenus({ commit }, menus) {
    commit('LTMENUS', menus)
  },
  logout({ commit }) {
    commit('LOGOUT')
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
