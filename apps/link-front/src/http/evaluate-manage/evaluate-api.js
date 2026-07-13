/*
 * @Author: xiaorui 评价管理板块的接口
 * @Date: 2023-02-21 14:25:03
 * @Last Modified by: xiaorui
 * @Last Modified time: 2023-11-02 10:26:23
 */
import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'
// 查询安全员考评规则
export function getSaferRulesFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, 'safetyScoringRules/get')
}
// 保存安全员考评规则
export function saveSaferRulesFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'safetyScoringRules/save', params)
}
// 查询部门负责人考评规则
export function getDepartmentRulesFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, 'departHeaderScoringRules/get')
}
// 保存部门负责人评规则
export function saveDepartmentRulesFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'departHeaderScoringRules/save', params)
}
// 分页查询安全员考评数据
export function getSaferEvaluateListByPageFn(params) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `safety/evaluate/pageQuery${reqStr}`)
}
// 查询安全员指定考评数据的详情
export function getSaferEvaluateDetailFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `safety/evaluate/getItem/${id}`)
}
// 修改安全员指定考评数据的详情
export function editSaferEvaluateDetailFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'safety/evaluate/updateItem', params)
}
// 复核安全员指定考评数据
export function reviewSaferEvaluateDetailFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'safety/evaluate/review', params)
}
// 查询指定考核期所有安全员考评排行数据
export function getAllByRankFn(date) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `safety/evaluate/getAllByRank?date=${date}`)
}
// 保存安全员考评金额规则
export function saveSaferEvaluateAdjustFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'safety/evaluate/adjust', params)
}
// 分页查询部门负责人考评数据
export function getDepartHeaderEvaluateListByPageFn(params) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `departHeader/evaluate/pageQuery${reqStr}`)
}
// 查询部门负责人指定考评数据的详情
export function getDepartEvaluateDetailFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `departHeader/evaluate/getBusinessInfo//${id}`)
}
// 修改部门负责人指定考评数据的详情
export function editDepartEvaluateDetailFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'departHeader/evaluate/updateBusinessInfo', params)
}
// 复核部门负责人指定考评数据
export function reviewDepartEvaluateDetailFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'departHeader/evaluate/review', params)
}
// 分页查询安全风险金考评数据
export function getSafetyRiskFundListByPageFn(params) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key] || params[key] === 0) {
      reqStr += `&${key}=${params[key]}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `safetyRiskFund/evaluate/pageQuery${reqStr}`)
}
// 复核指定安全风险金考评数据
export function reviewSafetyRiskFundDetailFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'safetyRiskFund/evaluate/review', params)
}
// 查询公司考核项目不同年份的数量对比数据
export function getEvaluateYearStatisticsFn(params) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key] || params[key] === 0) {
      reqStr += `&${key}=${params[key]}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `evaluate/statistics/itemContrast${reqStr}`)
}
// 查询指定公司所有部门安全员绩效统计数据
export function getEvaluateSaferStatisticsFn(params) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key] || params[key] === 0) {
      reqStr += `&${key}=${params[key]}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosPost(axios, `evaluate/statistics/safety${reqStr}`)
}
// 查询指定公司所有部门主负责人绩效统计数据
export function getEvaluateLeaderStatisticsFn(params) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key] || params[key] === 0) {
      reqStr += `&${key}=${params[key]}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosPost(axios, `evaluate/statistics/departLeader${reqStr}`)
}
// 分页查询指定考评业务类型的详情
export function getSaferItemDetailFn(params) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key] || params[key] === 0) {
      reqStr += `&${key}=${params[key]}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `safety/evaluate/getItemDetail${reqStr}`)
}
