import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'
/* 产生 */
// 分页查询危废产生
export function threeTimeRiskWasteProdByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/riskwasteprod/queryPageInfo`, params)
}
// 删除危废产生
export function threeTimeRiskWasteProdDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `threetime/riskwasteprod/delete?id=${id}`)
}
// 按id查询危废产生数据
export function threeTimeRiskWasteProdById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `threetime/riskwasteprod/getById?id=${id}`)
}
// 新增危废产生数据
export function threeTimeRiskWasteProdSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/riskwasteprod/save`, params)
}
// 修改危废产生数据
export function threeTimeRiskWasteProdUpdate(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/riskwasteprod/update`, params)
}

/* 转移 */
// 分页查询危废转移
export function threeTimeRiskWasteTransferByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/riskwastetransfer/queryPageInfo`, params)
}
// 删除危废转移
export function threeTimeRiskWasteTransferDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `threetime/riskwastetransfer/delete?id=${id}`)
}
// 按id查询危废转移数据
export function threeTimeRiskWasteTransferById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `threetime/riskwastetransfer/getById?id=${id}`)
}
// 新增危废转移数据
export function threeTimeRiskWasteTransferSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/riskwastetransfer/save`, params)
}
// 修改危废转移数据
export function threeTimeRiskWasteTransferUpdate(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/riskwastetransfer/update`, params)
}

/* 入库 */
// 分页查询危废入库
export function threeTimeRiskWasteInputByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/riskwasteput/queryPageInfo`, params)
}
// 删除危废入库
export function threeTimeRiskWasteInputDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `threetime/riskwasteput/delete?id=${id}`)
}
// 按id查询危废入库数据
export function threeTimeRiskWasteInputById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `threetime/riskwasteput/getById?id=${id}`)
}
// 新增危废入库数据
export function threeTimeRiskWasteInputSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/riskwasteput/save`, params)
}
// 修改危废入库数据
export function threeTimeRiskWasteInputUpdate(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/riskwasteput/update`, params)
}

/* 出库 */
// 分页查询危废出库
export function threeTimeRiskWasteOutputByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/riskwasteout/queryPageInfo`, params)
}
// 删除危废出库
export function threeTimeRiskWasteOutputDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `threetime/riskwasteout/delete?id=${id}`)
}
// 按id查询危废出库数据
export function threeTimeRiskWasteOutputById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `threetime/riskwasteout/getById?id=${id}`)
}
// 新增危废出库数据
export function threeTimeRiskWasteOutputSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/riskwasteout/save`, params)
}
// 修改危废出库数据
export function threeTimeRiskWasteOutputUpdate(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/riskwasteout/update`, params)
}
