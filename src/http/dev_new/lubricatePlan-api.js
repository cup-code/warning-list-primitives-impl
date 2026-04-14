// 润滑计划的接口
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'
// 分页查询部门下的润滑计划
export function getPlanTable(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.deviceNameOrCode) {
    pr += `&deviceNameOrCode=${encodeURIComponent(params.deviceNameOrCode)}`
  }
  if (params.lubricatePosition) {
    pr += `&lubricatePosition=${params.lubricatePosition}`
  }
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `lubricatePlan/queryByPage${pr}`)
}
// 保存或修改润滑计划
export function addLubricatePlanFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `lubricatePlan/save`, params)
}
// 删除润滑计划
export function removeLubricatePlanFn(planId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `lubricatePlan/delete/${planId}`)
}

// 查询指定部门(穿透子部门)下的的所有设备
export function getDeviceListByDepartFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `assetDevice/getAllByDepartment?departmentId=${id}`)
}
// 查询指定公司下的所有用户,选择负责人
export function getAllUsersByCompany(companyId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/getByCompanyId/${companyId}`)
}

// 润滑记录的接口
// 分页查询部门下的润滑记录
export function getRecordTable(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.deviceNameOrCode) {
    pr += `&deviceNameOrCode=${encodeURIComponent(params.deviceNameOrCode)}`
  }
  if (params.lubricatePosition) {
    pr += `&lubricatePosition=${params.lubricatePosition}`
  }
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/lubricateRecord/queryByPage${pr}`)
}
