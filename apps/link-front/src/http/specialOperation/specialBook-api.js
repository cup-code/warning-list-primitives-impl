/*
 * @Author: wangyang
 * @Date: 2023-03-21 12:05:08
 * @Last Modified by: wangyang
 * @Last Modified time: 2023-04-15 18:35:14
 */
import {
  axiosGet,
  createAxiosFromStore,
} from '@/http/common/utils'
/* 特殊作业台账 */
// 分页查询特殊作业台账
export function getSpecialWorkBookByPage(params) {
  const axios = createAxiosFromStore()

  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.jobNumber) {
    pr += `&jobNumber=${params.jobNumber}`
  }
  if (params.workInfo) {
    pr += `&workInfo=${params.workInfo}`
  }
  if (params.workTicketType) {
    pr += `&workTicketType=${params.workTicketType}`
  }
  return axiosGet(axios, `workTicket/pageQuery${pr}`)
}

// 分页查询承包商作业票信息
export function getContractorWorkBookByPage(params) {
  const axios = createAxiosFromStore()

  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.workUnitId) {
    pr += `&workUnitId=${params.workUnitId}`
  }
  if (params.jobNumber) {
    pr += `&jobNumber=${params.jobNumber}`
  }
  if (params.workInfo) {
    pr += `&workInfo=${params.workInfo}`
  }
  if (params.workTicketType) {
    pr += `&workTicketType=${params.workTicketType}`
  }
  return axiosGet(axios, `workTicket/contractorPageQuery${pr}`)
}

// 获取所有作业票
export function getWorklistAll(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `workTicket/listAll${reqStr}`)
}

// 获取当前登录人可见的承包商
export function getContractorVisibleLogin() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `contractor/listAll`)
}
