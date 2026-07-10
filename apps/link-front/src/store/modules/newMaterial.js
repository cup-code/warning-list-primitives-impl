const state = {
  leftHide: false, // 左侧是否折叠
  rightHide: false, // 右侧是否折叠 true折叠 false 展开
  isExpand: false, // 是否展开
}

const mutations = {
  LEFT_HIDE: (state, flag) => {
    state.leftHide = flag
  },
  RIGHT_HIDE: (state, flag) => {
    state.rightHide = flag
  },

  IS_EXPAND: (state, flag) => {
    state.isExpand = flag
  },
}

const actions = {
  leftHide({ commit }, flag) {
    commit('LEFT_HIDE', flag)
  },
  rightHide({ commit }, flag) {
    commit('RIGHT_HIDE', flag)
  },
  setIsExpand({ commit }, flag) {
    commit('IS_EXPAND', flag)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
