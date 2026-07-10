// 设备维保部分的接口
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'
// 分页查询维保标准
export function getMaintenanceStandardListByPageFn(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.deviceId) {
    pr += `&deviceId=${params.deviceId}`
  }
  if (params.deviceName) {
    pr += `&deviceName=${encodeURIComponent(params.deviceName)}`
  }
  if (params.maintenanceContent) {
    pr += `&maintenanceContent=${encodeURIComponent(params.maintenanceContent)}`
  }
  return axiosGet(axios, `maintenanceStandard/queryByPage${pr}`)
}
// 查询指定设备的维保标准
export function getMaintenanceStandardListByIdFn(params) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `maintenanceStandard/getByAssetId/${params.deviceId}`)
}
// 保存或修改维保标准
export function addMaintenanceStandardFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `maintenanceStandard/save`, params)
}
// 删除维保标准
export function deleteMaintenanceFn(standardId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `maintenanceStandard/delete/${standardId}`)
}
// 分页查询维保计划
export function getPlanListByPageFn(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.planName) {
    pr += `&planName=${encodeURIComponent(params.planName)}`
  }
  return axiosGet(axios, `maintenancePlan/queryByPage${pr}`)
}
// 保存或修改完整维保计划信息
export function addMaintenancePlanFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `maintenancePlan/savePlanAndStandard`, params)
}
// 切换维保计划状态
export function changeMaintenancePlanStateFn(pid, state) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `maintenancePlan/changeState/${pid}/${state}`)
}
// 删除维保计划
export function deleteMaintenancePlanFn(planId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `maintenancePlan/delete/${planId}`)
}
// 查询指定计划id的信息
export function getPlanInfoByIdFn(planId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `maintenancePlan/getById/${planId}`)
}
// 分页查询维保记录
export function getMaintenanceRecordByPageFn(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.deviceId) {
    pr += `&deviceId=${params.deviceId}`
  }
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  if (params.maintenanceContent) {
    pr += `&maintenanceContent=${encodeURIComponent(params.maintenanceContent)}`
  }
  if (params.replaceParts) {
    pr += `&replaceParts=${encodeURIComponent(params.replaceParts)}`
  }
  return axiosGet(axios, `maintenancePlanExecute/queryByPage${pr}`)
}
// 分页查询维保任务
export function getTaskListByPageFn(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.planName) {
    pr += `&planName=${encodeURIComponent(params.planName)}`
  }
  return axiosGet(axios, `maintenancePlanExecute/queryTaskByPage${pr}`)
}
