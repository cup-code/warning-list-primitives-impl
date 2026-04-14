// 大修记录的接口
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'
// 分页查询部门下的大修记录
export function getRepairTable(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.deviceNameOrCode) {
    pr += `&deviceNameOrCode=${encodeURIComponent(params.deviceNameOrCode)}`
  }
  if (params.repairContent) {
    pr += `&repairContent=${params.repairContent}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `capitalRepair/queryByPage${pr}`)
}
// 保存或修改大修记录
export function addRepairRecord(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `capitalRepair/save`, params)
}
// 删除大修记录
export function removeRepairRecord(repairId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `capitalRepair/delete/${repairId}`)
}
