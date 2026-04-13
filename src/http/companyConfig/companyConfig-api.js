import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'

// 保存或修改公司指定模块配置
export function setSpecifiedModule(companyId, module, params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysCompanyConfig/save/${companyId}/${module}`, params)
}

// 查询指定公司和业务模块的所有配置
export function getSpecifiedModule(companyId, module) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysCompanyConfig/getByModule/${companyId}/${module}`)
}
// 查询指定公司的预警设置
export function getRemainConfigFn(companyId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `specialEquipment/reminderSettings/get/${companyId}`)
}
// 保存或修改公司的预警设置
export function saveRemainConfigFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `specialEquipment/reminderSettings/save`, params)
}

// 保存部门扩展信息
export function saveExpandDepartment(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysDepartment/extend/saveExt`, params)
}

// 保存公司下的唯一扩展类型部门
export function saveCompanyExt(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `sysDepartment/extend/saveCompanyExt`, params)
}

// 获取指定公司下指定扩展类型的部门
export function getExpandDepartment(companyId, extType) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysDepartment/extend/getByCompanyIdAndExtType/${companyId}/${extType}`)
}
