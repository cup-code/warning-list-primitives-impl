const state = {
  comInfo: null,
}

const mutations = {
  COMINFO(state, comInfo) {
    state.comInfo = comInfo
  },
}

const actions = {
  comInfo({ commit }, comInfo) {
    commit('COMINFO', comInfo)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
