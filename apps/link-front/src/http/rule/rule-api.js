import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
  createAxiosFromStore,
} from '@/http/common/utils'

// 根据条件分页获取报警规则信息
export function getAlertRuleList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`

  // 报警规则名称
  if (params.name) {
    pr += `&name=${encodeURIComponent(params.name)}`
  }
  // 报警状态
  if (params.state) {
    pr += `&state=${params.state}`
  }
  // 触发类型
  if (params.triggerType) {
    pr += `&triggerType=${params.triggerType}`
  }

  // 树id
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  return axiosGet(axios, `alert/rule/list?${pr}`)
}

// 新增报警规则
export function addAlertRule(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `alert/rule`, params)
}

// 删除报警规则
export function deleteAlertRule(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `alert/rule/${id}`)
}

// 修改报警规则
export function editAlertRule(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `alert/rule?ruleId=${params.id}`, params)
}

// 停用/启用规则
export function changeRuleState(id, state) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `alert/rule/changeState?ruleId=${id}&state=${state}`)
}

// 修改规则条件触发类型
export function changeTriggerType(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `alert/rule/changeTriggerType?ruleId=${params.id}&type=${params.type}`)
}

// 按Id获取规则基础信息
export function getRuleBaseInfo(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `alert/rule/${id}`)
}

// 获取指定规则的所有触发条件
export function getRuleCondition(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `alert/condition/all/${id}`)
}

// 新增规则触发条件
export function addRuleCondition(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `alert/condition`, params)
}

// 删除规则的触发条件
export function deleteRuleCondition(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `alert/condition/${id}`)
}

// 修改规则的触发条件
export function editRuleCondition(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `alert/condition?conditionId=${params.id}`, params)
}

// 获取指定规则的所有触发执行动作
export function getRuleAction(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `alert/action/all/${id}`)
}

// 新增执行动作
export function addRuleAction(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `alert/action`, params)
}

// 删除执行动作
export function deleteRuleAction(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `alert/action/${id}`)
}

// 修改执行动作
export function editRuleAction(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `alert/action?actionId=${params.id}`, params)
}
