const state = {
  leftHide: false, // 左侧是否折叠
  rightHide: false, // 右侧是否折叠 true折叠 false 展开
}

const mutations = {
  LEFT_HIDE: (state, flag) => {
    state.leftHide = flag
  },
  RIGHT_HIDE: (state, flag) => {
    state.rightHide = flag
  },
}

const actions = {
  leftHide({ commit }, flag) {
    commit('LEFT_HIDE', flag)
  },
  rightHide({ commit }, flag) {
    commit('RIGHT_HIDE', flag)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
