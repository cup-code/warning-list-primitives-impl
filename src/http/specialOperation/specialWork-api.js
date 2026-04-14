import {
  axiosGet,
  createAxiosFromStore,
} from '@/http/common/utils'

// 获取作业票详情
export function getWorkDetail(ticketId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `workTicket/getInfoById/${ticketId}`)
}

// 查询指定作业票的审核纪录
export function getApprovalRecord(ticketId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `workTicket/approval/getByTicketId/${ticketId}`)
}

// 查询指定作业票的安全措施落实任务纪录
export function getSafetyMeasuresList(ticketId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `workTicket/safetyMeasures/getByTicketId/${ticketId}`)
}

// 查询指定待办任务id的安全措施落实任务
export function getMeasuresList(ticketId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `workTicket/safetyMeasures/getTask/${ticketId}`)
}

// 查询指定作业票的气体分析任务纪录
export function getGasAnalysisList(ticketId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `workTicket/gasAnalysis/getByTicketId/${ticketId}`)
}

// 查询指定作业票的巡检纪录
export function getCheckList(ticketId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `workTicket/check/getByTicketId/${ticketId}`)
}

// 查询指定作业票的验收纪录
export function getAcceptInfo(ticketId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `workTicket/accept/getByTicketId/${ticketId}`)
}

// 统计指定时间指定公司各部门作业票数量
export function getCorporateDepartmentQuantity(params) {
  const axios = createAxiosFromStore()
  let pr = `?companyId=${params.companyId}`
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  return axiosGet(axios, `workTicket/statistics/countByDepartment${pr}`)
}

// 统计指定时间指定公司作业票状态数量
export function getTimeCompanyStateQuantity(params) {
  const axios = createAxiosFromStore()
  let pr = `?companyId=${params.companyId}`
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  return axiosGet(axios, `workTicket/statistics/countStateByCompany${pr}`)
}

// 统计指定时间指定公司作业票类型数量
export function getCountTypeByCompanyTypeQuantity(params) {
  const axios = createAxiosFromStore()
  let pr = `?companyId=${params.companyId}`
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  return axiosGet(axios, `workTicket/statistics/countTypeByCompany${pr}`)
}

// 分页获取指定公司指定时间段作业票信息
export function getpageQuery(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  return axiosGet(axios, `workTicket/statistics/pageQuery${pr}`)
}

// 查询作业流转记录
export function getWorkRecord(workTicketId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `workTicket/history/${workTicketId}`)
}

// 事故类型列表，全部(危险辨识)
export function getAccTypeListAll() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/accident/allList`)
}
