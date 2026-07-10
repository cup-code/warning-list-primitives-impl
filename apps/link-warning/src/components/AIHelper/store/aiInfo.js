import { getAiHelper } from '@/http/hkAi-api'

const state = {
  question: '',
  answer: '',
  conversationId: '',
  loading: false,
  isOpen: false,
}
const mutations = {
  QUESTION(state, question) {
    state.question = question
  },
  LOADING(state, loading) {
    state.loading = loading
  },
  ANSWER(state, answer) {
    state.answer = answer
  },
  CONVERSATIONID(state, conversationId) {
    state.conversationId = conversationId
  },
  ISOPEN(state, isOpen) {
    state.isOpen = isOpen
  },
}
const actions = {
  getAiInfo({ commit }) {
    const params = {
      cId: state.conversationId,
      q: state.question.question || '',
    }
    commit('LOADING', true)
    getAiHelper(params)
      .then((res) => {
        const { data } = res
        if (data.success) {
          commit('ANSWER', { answer: data.result.answer })
          commit('CONVERSATIONID', data.result.conversationId)
        }
        commit('LOADING', false)
      })
      .catch((error) => {
        commit('ANSWER', { answer: error })
        commit('LOADING', false)
      })
  },
  getQuestion({ commit }, question) {
    commit('QUESTION', { question })
  },
  getAnswer({ commit }, answer) {
    commit('ANSWER', answer)
  },
  getConversationId({ commit }, conversationId) {
    commit('CONVERSATIONID', conversationId)
  },
  getIsOpen({ commit }, isOpen) {
    commit('ISOPEN', isOpen)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
