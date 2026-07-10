import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'
// 查询所有设备类型
export function getAllDeviceTypeFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `assetDeviceType/getAll`)
}
// 分页查询设备
export function getDeviceByPageFn(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.assetState === '全部') {
    delete params.assetState
  }
  if (params.assetState) {
    pr += `&assetState=${params.assetState}`
  }
  if (params.assetTypeId) {
    pr += `&assetTypeId=${params.assetTypeId}`
  }
  if (params.assetDeviceName) {
    pr += `&assetDeviceName=${encodeURIComponent(params.assetDeviceName)}`
  }
  if (params.model) {
    pr += `&model=${encodeURIComponent(params.model)}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  return axiosGet(axios, `assetDevice/queryByPage${pr}`)
}
// 按条件查询设备各个状态的数量
export function getStateCountFn(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `assetDevice/groupBystate?assetTypeId=${
      params.assetTypeId
    }&assetDeviceName=${encodeURIComponent(params.assetDeviceName)}&model=${encodeURIComponent(
      params.model,
    )}&departmentId=${params.departmentId}`,
  )
}
// 新增或修改设备
export function addDeviceFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `assetDevice/save`, params)
}
// 删除设备
export function deleteDeviceFn(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `assetDevice/delete/${id}`)
}
// 查询指定设备id的信息
export function getInfoByIdFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `assetDevice/getById/${id}`)
}
// 查询指定部门(穿透子部门)下的的所有设备
export function getDeviceListByDepartFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `assetDevice/getAllByDepartment?departmentId=${id}`)
}
// 查询指定设备的技术参数
export function getTechnicalParamFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `assetParameters/getByAssetId/${id}`)
}
// 批量保存设备技术参数
export function addTechnicalParamFn(deviceId, params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `assetParameters/batchSave/${deviceId}`, params)
}
// 查询指定设备的辅机备件
export function getMountingsFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `assetSpare/getByAssetId/${id}`)
}
// 批量保存设备技术参数
export function addMountingsFn(deviceId, params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `assetSpare/batchSave/${deviceId}`, params)
}
// 查询指定设备绑定的测点
export function getDataPointFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `assetBindIo/getAllIoByAssetId/${id}`)
}
// 批量保存设备绑定的数据测点
export function addDataPointFn(deviceId, params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `assetBindIo/save/${deviceId}`, params)
}
// 解除资产设备绑定的数据测点
export function deleteDataPointFn(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `assetBindIo/delete/${id}`)
}
// 获取数据测点实时数据
export function getPointRealDataFn(bandId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `assetBindIo/realTrend/${bandId}`)
}
// 获取数据测点历史趋势数据
export function getPointHisDataFn(bandId, startDate, endDate) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `assetBindIo/historyTrend/${bandId}?startDate=${startDate}&endDate=${endDate}`,
  )
}
// 查询指定公司或部门的建筑id
export function getBuildIdFn(busId, busIdType) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `location/getBuildId/${busId}/${busIdType}`)
}
