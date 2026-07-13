const SETTINGS_VERSION = 1

const defaultState = {
  fixedHeader: true,
  sidebarLogo: true,
  theme: 'theme-default',
  layout: 'lt', // 默认左上布局
  tagModel: false, // 是否开启页签模式
  tagList: [], // 页签列表
}

const state = { ...defaultState }

const mutations = {
  REFRESH_SETTING: (state) => {
    // 拿出缓存
    let saveSet
    try {
      saveSet = JSON.parse(localStorage.getItem('setting') || '{}')
    }
    catch (e) {
      saveSet = {}
    }
    // 版本检查：如果版本不匹配则使用默认值
    if (!saveSet.version || saveSet.version < SETTINGS_VERSION) {
      saveSet = { ...defaultState, version: SETTINGS_VERSION }
      try {
        localStorage.setItem('setting', JSON.stringify(saveSet))
      }
      catch (e) {
        // quota error — continue with defaults
      }
    }
    for (const key in saveSet) {
      if (key === 'version') continue
      state[key] = saveSet[key]
    }
    // 如果设置了主题则赋予主题
    if (saveSet.theme) {
      document.body.className = saveSet.theme ? saveSet.theme : 'theme-default'
    }
    // 否则给默认主题
    else {
      state.theme = 'theme-default'
      document.body.className = 'theme-default'
    }
    state.tagList = []
  },
  CHANGE_SETTING: (state, { key, value }) => {
    // eslint-disable-next-line no-prototype-builtins
    if (state.hasOwnProperty(key)) {
      state[key] = value
      const saveData = JSON.stringify({ ...defaultState, ...state, version: SETTINGS_VERSION })
      localStorage.setItem('setting', saveData)
      if (key == 'theme') {
        document.body.className = value || 'theme-default'
      }
    }
  },
  RESET_TAG: (state, value) => {
    state.tagList = []
    if (value && value.path != '/home') {
      state.tagList.push(value)
    }
  },
  ADD_TAG: (state, value) => {
    for (const item of state.tagList) {
      if (item.title === value.title) {
        return
      }
    }
    state.tagList.push(value)
  },
  DEL_TAG: (state, value) => {
    state.tagList.splice(value, 1)
  },
}

const actions = {
  refreshSetting({ commit }) {
    commit('REFRESH_SETTING')
  },
  changeSetting({ commit }, data) {
    commit('CHANGE_SETTING', data)
  },
  /* 重置tagList */
  resetTag({ commit }, data) {
    commit('RESET_TAG', data)
  },
  /* 添加一个内容 tagList */
  addTag({ commit }, data) {
    commit('ADD_TAG', data)
  },
  /* 删除一个内容 tagList */
  delTag({ commit }, index) {
    commit('DEL_TAG', index)
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
}
