const state = {
  companyId: '',
  companyName: '',
}

const mutations = {
  SET_COMPANY_ID: (state, companyId) => {
    state.companyId = companyId
  },
}

const actions = {
  getCompanyId({ commit }, data) {
    commit('SET_COMPANY_ID', data)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
