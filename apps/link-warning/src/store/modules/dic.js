// import { getDic } from '@/http/manage-api'
const state = {
  dic: [],
}

const mutations = {
  UPDATE_DIC: (state, data) => {
    state.dic = data
  },
}

const actions = {
  // updateDic({ commit }) {
  //   getDic().then(res => {
  //       let resD = res.data;
  //       if(resD.success) {
  //           commit('UPDATE_DIC', resD.result || []);
  //       }else {
  //           commit('UPDATE_DIC', []);
  //       }
  //   }).catch(err => {
  //       commit('UPDATE_DIC', []);
  //   })
  // },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
