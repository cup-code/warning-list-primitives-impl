const requiredApiNames = [
  'allWarningAudit',
  'allWarningList',
  'attentionAlarm',
  'clientWarningAudit',
  'clientWarningList',
  'maintenanceWarningAudit',
  'maintenanceWarningList',
]

export function createDetailInfoModule(api = {}) {
  for (const name of requiredApiNames) {
    if (typeof api[name] !== 'function') {
      throw new TypeError(`createDetailInfoModule requires api.${name} to be a function`)
    }
  }
  const {
    allWarningAudit, allWarningList, attentionAlarm,
    clientWarningAudit, clientWarningList,
    maintenanceWarningAudit, maintenanceWarningList,
  } = api

// 预警等级列表
const alarmLevelList = ['一级', '二级', '三级', '四级']

const state = {
  detailForms: {}, // 当前详情数据
  userType: '', // 用户类型
  queryForm: {}, // 查询参数
  lists: [], // 列表数据
  currentIndex: 0, // 当前索引
  currentId: '', // 当前详情ID
  isLoading: false, // 加载状态
  hasOperations: false, // 是否有操作行为，用于返回列表时决定是否刷新
}

const mutations = {
  SET_DETAIL_FORMS(state, detailForms) {
    state.detailForms = detailForms
  },
  SET_USER_TYPE(state, userType) {
    state.userType = userType
  },
  SET_QUERY_FORM(state, queryForm) {
    state.queryForm = queryForm
  },
  SET_LISTS(state, lists) {
    state.lists = lists
  },
  SET_CURRENT_INDEX(state, currentIndex) {
    state.currentIndex = currentIndex
  },
  SET_CURRENT_ID(state, currentId) {
    state.currentId = currentId
  },
  SET_LOADING(state, isLoading) {
    state.isLoading = isLoading
  },
  SET_HAS_OPERATIONS(state, hasOperations) {
    state.hasOperations = hasOperations
  },
  // 更新列表中某一项的数据
  UPDATE_LIST_ITEM(state, { id, changes }) {
    const index = state.lists.findIndex(item => item.id === id)
    if (index !== -1) {
      state.lists[index] = { ...state.lists[index], ...changes }
    }
  },
  // 从列表中移除某一项
  REMOVE_LIST_ITEM(state, id) {
    const index = state.lists.findIndex(item => item.id === id)
    if (index !== -1) {
      state.lists.splice(index, 1)
      // 更新当前索引
      if (index <= state.currentIndex && state.currentIndex > 0) {
        state.currentIndex--
      }
    }
  },
}

const actions = {
  // 获取详情列表数据
  async getDetailInfo({ commit, state }, { userType, queryForm }) {
    commit('SET_LOADING', true)

    // 使用对应的API获取列表数据
    const listApi = {
      CustomerStatus: clientWarningList,
      InternalStatus: maintenanceWarningList,
      all: allWarningList,
    }

    try {
      const { data } = await listApi[userType](queryForm)

      if (!data?.result) {
        commit('SET_LISTS', [])
        commit('SET_LOADING', false)
        return
      }

      const { list } = data.result

      // 格式化列表数据
      const formattedList = list.map(item => ({
        ...item,
        auditStatus:
          userType !== 'CustomerStatus' ? item.internalStatus : item.customerStatus,
        alarmLevel: alarmLevelList[Number(item.alarmLevel) - 1],
        auditUser:
          userType !== 'CustomerStatus'
            ? item.internalDisposeUserName
            : item.customerDisposeUserName || '--',
        auditTime:
          userType !== 'CustomerStatus'
            ? item.internalDisposeTime
            : item.customerDisposeTime || '--',
      }))

      commit('SET_LISTS', formattedList)

      // 如果有当前ID，更新当前索引
      if (state.currentId) {
        const index = formattedList.findIndex(item => item.id === state.currentId)
        if (index !== -1) {
          commit('SET_CURRENT_INDEX', index)
        }
        else if (formattedList.length > 0) {
          // 如果找不到当前ID，默认选择第一项
          commit('SET_CURRENT_INDEX', 0)
          commit('SET_CURRENT_ID', formattedList[0].id)
          commit('SET_DETAIL_FORMS', formattedList[0])
        }
      }
    }
    catch (error) {
      console.error('获取详情列表失败:', error)
    }
    finally {
      commit('SET_LOADING', false)
    }
  },

  // 设置当前详情ID并更新导航状态
  setCurrentDetail({ commit, state }, id) {
    commit('SET_CURRENT_ID', id)

    // 更新当前索引
    const index = state.lists.findIndex(item => item.id === id)
    if (index !== -1) {
      commit('SET_CURRENT_INDEX', index)
      commit('SET_DETAIL_FORMS', state.lists[index])
    }
  },

  // 切换到上一个详情
  prevDetail({
    commit,
    state,
    dispatch,
  }) {
    if (state.currentIndex > 0) {
      const prevIndex = state.currentIndex - 1
      const prevItem = state.lists[prevIndex]

      commit('SET_CURRENT_INDEX', prevIndex)
      commit('SET_CURRENT_ID', prevItem.id)
      commit('SET_DETAIL_FORMS', prevItem)
    }
  },

  // 切换到下一个详情
  nextDetail({
    commit,
    state,
    dispatch,
  }) {
    if (state.currentIndex < state.lists.length - 1) {
      const nextIndex = state.currentIndex + 1
      const nextItem = state.lists[nextIndex]

      commit('SET_CURRENT_INDEX', nextIndex)
      commit('SET_CURRENT_ID', nextItem.id)
      commit('SET_DETAIL_FORMS', nextItem)
    }
  },

  // 提交审核/处理
  async submitAudit({
    commit,
    state,
    dispatch,
  }, {
    status,
    type,
    opinion,
  }) {
    const AuditApi = {
      CustomerStatus: clientWarningAudit,
      InternalStatus: maintenanceWarningAudit,
      all: allWarningAudit,
    }

    const params = {
      alarmId: state.detailForms.id,
      status,
      type,
    }

    if (opinion) {
      params.opinion = opinion
    }

    if (state.userType === 'CustomerStatus') {
      delete params.type
    }

    if (state.userType === 'all') {
      params.tCode = state.detailForms.tenantCode
    }

    try {
      const { data } = await AuditApi[state.userType](params)

      if (data.code === 200) {
        // 标记有操作行为
        commit('SET_HAS_OPERATIONS', true)

        // 更新列表中的状态
        commit('UPDATE_LIST_ITEM', {
          id: state.detailForms.id,
          changes: {
            auditStatus: status,
            auditTime:
              `${new Date().toISOString().split('T')[0]
              } ${
                new Date().toTimeString().split(' ')[0]}`,
          },
        })

        // 如果当前是最后一条并且操作后列表为空，直接返回上一页面
        if (state.lists.length === 1) {
          return { success: true, message: '操作成功，无更多数据', shouldReturn: true }
        }
        // 如果有下一条，自动切换到下一条
        else if (state.currentIndex < state.lists.length - 1) {
          dispatch('nextDetail')
          return { success: true, message: '操作成功，已切换到下一条' }
        }
        else {
          return { success: true, message: '操作成功，已是最后一条' }
        }
      }
      else {
        return { success: false, message: data.message || '操作失败' }
      }
    }
    catch (error) {
      console.error('提交审核失败:', error)
      return { success: false, message: '网络请求异常' }
    }
  },

  // 关注/取消关注
  async toggleAttention({
    commit,
    state,
    dispatch,
  }, isAttention) {
    try {
      const { data } = await attentionAlarm({
        alarmId: state.detailForms.id,
        isAttention,
      })

      if (data.code === 200) {
        // 标记有操作行为
        commit('SET_HAS_OPERATIONS', true)

        // 更新详情和列表中的关注状态
        commit('SET_DETAIL_FORMS', {
          ...state.detailForms,
          archivesState: isAttention,
        })

        commit('UPDATE_LIST_ITEM', {
          id: state.detailForms.id,
          changes: { archivesState: isAttention },
        })

        return {
          success: true,
          message: isAttention === 1 ? '关注成功' : '取消关注成功',
        }
      }
      else {
        return { success: false, message: data.message || '操作失败' }
      }
    }
    catch (error) {
      console.error('关注/取消关注失败:', error)
      return { success: false, message: '网络请求异常' }
    }
  },

  // 重置状态
  resetState({ commit }) {
    commit('SET_DETAIL_FORMS', {})
    commit('SET_CURRENT_INDEX', 0)
    commit('SET_CURRENT_ID', '')
    commit('SET_HAS_OPERATIONS', false)
  },
}

return {
  namespaced: true,
  state,
  mutations,
  actions,
}
}
