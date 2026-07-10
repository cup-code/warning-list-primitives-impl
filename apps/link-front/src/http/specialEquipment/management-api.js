/**
 * 基础信息接口
 */
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosUpload,
  createAxiosFromStore,
  createFormDataAxios,
  createFormUrlencodedAxios,
  get,
  post,
} from '@/http/common/utils'

/**
 * 保存基础信息
 * @param params 待保存数据
 * @returns {*}
 */
export function saveBasic(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'specialEquipment/info/saveBasic', params)
}

/**
 * 保存设备相关参数
 * @param params 待保存数据
 * @returns {*}
 */
export function saveParams(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'specialEquipment/info/saveParams', params)
}

/**
 * 保存制造投用信息
 * @param params 待保存数据
 * @returns {*}
 */
export function saveManufacturer(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'specialEquipment/info/saveManufacturer', params)
}

/**
 * 保存检验计划
 * @param params 待保存数据
 */
export function saveInspectionPlan(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'specialEquipment/inspectionPlan/save', params)
}

/**
 * 删除
 * @param id 主键编号
 * @returns {*}
 */
export function deleteById(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `specialEquipment/info/delete/${id}`)
}

/**
 * 根据主键查询
 * @param id 主键编号
 * @returns {*}
 */
export function getById(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `specialEquipment/info/get/${id}`)
}

/**
 * 分页查询
 * @param params 查询参数
 */
export function getPaging(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'specialEquipment/info/pageQuery', params)
}
// 分页查询设备的检验计划
export function getInspectionPlanPaging(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'specialEquipment/inspectionPlan/pageQuery', params)
}
// 根据设备唯一编号查询检验计划列表
export function getAllPlanListByIdFn(equipmentId) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `specialEquipment/inspectionPlan/list/${equipmentId}`)
}
// 删除检验计划
export function deletePlanByIdFn(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `specialEquipment/inspectionPlan/delete/${id}`)
}
// 分页查询设备的检验记录
export function getInspectionRecordPaging(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'specialEquipment/inspectionRecords/pageQuery', params)
}
// 保存检验记录
export function saveInspectionRecordFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'specialEquipment/inspectionRecords/save', params)
}
// 删除检验记录
export function deleteRecordByIdFn(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `specialEquipment/inspectionRecords/delete/${id}`)
}

/**
 * 导入基本信息记录
 * @param params 参数
 */
export function importBasicInfoRecord(params) {
  const axios = createFormDataAxios()
  return axiosUpload(axios, '/excel/importData/SpecialEquipmentBasicRecord', params)
}
// 特种设备统计：各类别数量统计
export function getCountByTypeFn() {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `specialEquipment/info/countByTypeRule`)
}
// 按设备类型和参数类型统计
export function getCountByEquipmentTypeAndParamKey(companyId, type, key) {
  const axios = createAxiosFromStore()
  return axiosPost(
    axios,
    `specialEquipment/info/countByEquipmentTypeAndParamKey/${companyId}?equipmentType=${type}&paramKey=${key}`,
  )
}
// 特种设备统计：各状态数量统计
export function getCountByStatusFn() {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `specialEquipment/info/countByStatusRule`)
}

// 分页计量设备管理
export function getMeteringEquipmentList(params) {
  return get('specialEquipment/meteringManage/page', params)
}
// 删除计量设备管理
export function deleteSpecialEquipmentFn(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `specialEquipment/meteringManage/${id}`)
}
// 新增或修改计量设备管理
export function saveSpecialEquipmentFn(params) {
  return post('specialEquipment/meteringManage/saveOrUpdate', params)
}

// 导入
export function importMeasuringEquipment(params) {
  const axios = createFormDataAxios()
  return axiosUpload(axios, '/excel/importData/MeteringManage', params)
}
