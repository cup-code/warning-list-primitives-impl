/*
 * @Author: xiaorui 奖励考核部分的接口
 * @Date: 2023-03-21 11:43:53
 * @Last Modified by: xiaorui
 * @Last Modified time: 2023-12-26 10:49:12
 */
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  get,
} from '@/http/common/utils'
// 三违考核部分
// 分页查询三违考核纪录
export function getThreeViolationListByPageFn(params = {}) {
  return get(`incentive/examine/item/pageQuery`, params)
}
// 查询当前登录用户可选的考核/奖励级别
export function getMyIncentiveLevelFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `incentive/getMyIncentiveLevel`)
}
// 查询指定考核纪录的详情
export function getExamineDetailFn(examineItemId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `incentive/examine/item/getItemById/${examineItemId}`)
}
// 修改指定考核纪录的考核内容
export function editExamineDetailFn(params = {}) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `incentive/examine/item/update`, params)
}
// 新增保存三违考核纪录
export function saveThreeViolationFn(params = {}) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `incentive/examine/save`, params)
}
// 审批记录，type1-三违考核，2-安全奖励
export function approveRecordFn(params = {}) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `incentive/approve`, params)
}
// 删除三违考核记录
export function deleteExamineRecordFn(examineItemId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `incentive/examine/item/delete/${examineItemId}`)
}
// 分页查询三违考核项目执行纪录
export function getExecuteListByPageFn(params = {}) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `incentive/examine/item/executePageQuery${reqStr}`)
}
// 执行 type1-三违考核，2-安全奖励
export function executeRecordFn(type, id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `incentive/execute/${type}/${id}`)
}
// 三违考核统计：分页查询部门考核次数和金额
export function getExamineStatisticsByPageFn(params = {}) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `incentive/examine/countPageQuery${reqStr}`)
}
// 分页查询指定部门已执行的三违考核纪录
export function getExecutedListByDepartFn(params = {}) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `incentive/examine/item/departmentPageQuery${reqStr}`)
}
// 安全奖励部分
// 分页查询安全奖励纪录
export function getSafeRewardListByPageFn(params = {}) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key] || params[key] === 0) {
      reqStr += `&${key}=${params[key]}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `incentive/reward/item/pageQuery${reqStr}`)
}
// 新增保存安全奖励纪录
export function saveSafeRewardFn(params = {}) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `incentive/reward/save`, params)
}
// 查询指定安全奖励的详情
export function getSafeRewardDetailFn(rewardItemId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `incentive/reward/item/getItemById/${rewardItemId}`)
}
// 修改指定奖励纪录的奖励内容
export function editSafeRewardDetailFn(params = {}) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `incentive/reward/item/update`, params)
}
// 分页查询安全奖励项目执行纪录
export function getSafeRewardExecuteListByPageFn(params = {}) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `incentive/reward/item/executePageQuery${reqStr}`)
}
// 删除安全奖励记录
export function deleteRewardRecordFn(rewardItemId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `incentive/reward/item/delete/${rewardItemId}`)
}
// 安全奖励统计：分页查询部门奖励次数和金额
export function getRewardStatisticsByPageFn(params = {}) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `incentive/reward/countPageQuery${reqStr}`)
}
// 分页查询指定部门已执行的安全奖励纪录
export function getExecutedRewardListByDepartFn(params = {}) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `incentive/reward/item/departmentPageQuery${reqStr}`)
}
// 汇总分析页面
// 按照考核类型统计金额--柱状图，查询当前登录人所属公司本年度各月份下各考核类别金额总计
export function getAssessCountByMonthFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `incentive/examine/statistics/category/monthsOfThisYear`)
}
// 按照奖励类型统计金额--柱状图，查询当前登录人所属公司本年度各月份各奖励类别金额总计
export function getRewardCountByMonthFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `incentive/reward/statistics/category/monthsOfThisYear`)
}
// 查询指定公司下各部门三违考核金额排行
export function getAssessSortListByDepFn(params) {
  const axios = createAxiosFromStore()
  const reqStr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  return axiosGet(axios, `incentive/examine/statistics/departAmount/${params.companyId}${reqStr}`)
}
// 查询指定公司下人员三违考核金额排行
export function getAssessSortListByPersonFn(params) {
  const axios = createAxiosFromStore()
  const reqStr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  return axiosGet(axios, `incentive/examine/statistics/userAmount/${params.companyId}${reqStr}`)
}
// 查询集团内各公司考核金额排行
export function getAssessSortListByCompanyFn(params) {
  const axios = createAxiosFromStore()
  const reqStr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  return axiosGet(axios, `incentive/examine/statistics/companyAmount${reqStr}`)
}
// 查询指定公司下各部门奖励金额排行
export function getRewardSortListByDepFn(params) {
  const axios = createAxiosFromStore()
  const reqStr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  return axiosGet(axios, `incentive/reward/statistics/departAmount/${params.companyId}${reqStr}`)
}
// 查询指定公司下人员奖励金额排行
export function getRewardSortListByPersonFn(params) {
  const axios = createAxiosFromStore()
  const reqStr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  return axiosGet(axios, `incentive/reward/statistics/userAmount/${params.companyId}${reqStr}`)
}
// 查询集团内各公司奖励金额排行
export function getRewardSortListByCompanyFn(params) {
  const axios = createAxiosFromStore()
  const reqStr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  return axiosGet(axios, `incentive/reward/statistics/companyAmount${reqStr}`)
}
// 按不同时间段查询两种激励类型的数量
export function getAssessAndRewardCountFn(params) {
  const axios = createAxiosFromStore()
  const reqStr = `?start=${params.start}&end=${params.end}`
  return axiosGet(axios, `incentive/countByIncentiveTypeAndDate${reqStr}`)
}
