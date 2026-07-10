import {
  axiosParams,
  axiosPost,
  axiosUpload,
  createAxiosFromStore,
  createFormDataAxios,
} from '../common/utils'

// ==================== 点位编码 ====================

/**
 * 查询点位编码列表（分页）
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 每页条数（必填）
 * @param {string} [params.pointCode] - 点位编码
 * @param {string} [params.pointName] - 点位名称
 * @param {string} [params.processSection] - 所属工艺段
 */
export function queryYjPoint(params) {
  return axiosParams('get', `/yj/point/query`, params)
}

/**
 * 新增/修改点位编码
 * @param {object} data - 点位编码数据
 */
export function saveOrUpdateYjPoint(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yj/point/saveOrUpdate`, data)
}

/**
 * 删除点位编码
 * @param {string} id - 点位编码ID
 */
export function deleteYjPoint(id) {
  return axiosParams('post', `/yj/point/delete?id=${id}`)
}

// ==================== 易检数据 ====================

/**
 * 数据汇总查询（分页）
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 每页条数（必填）
 * @param {string} [params.factoryCode] - 厂区编码
 * @param {string} [params.pointCode] - 点位编码
 * @param {string} [params.sampleTimeStart] - 采样时间开始
 * @param {string} [params.sampleTimeEnd] - 采样时间结束
 * @param {string} [params.source] - 来源
 */
export function querySummaryData(params) {
  return axiosParams('get', `/yj/deviceData/querySummaryData`, params)
}

/**
 * 添加/修改数据汇总
 * @param {object} data - 数据汇总DTO
 */
export function saveOrUpdateSummaryData(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yj/deviceData/saveOrUpdateSummaryData`, data)
}

/**
 * 删除数据汇总
 * @param {string} id - 数据汇总ID
 */
export function deleteSummaryData(id) {
  return axiosParams('post', `/yj/deviceData/deleteSummaryData?id=${id}`)
}

/**
 * 下载数据汇总模板
 */
export function getSummaryDataTemplate() {
  return axiosParams('post', `/yj/deviceData/getSummaryDataTemplate`, {}, { responseType: 'blob' })
}

/**
 * 导入数据汇总
 * @param {File} file - 上传的Excel文件
 */
export function importSummaryData(file) {
  const axios = createFormDataAxios()
  return axiosUpload(axios, `/yj/deviceData/importSummaryData`, { file })
}

/**
 * 查询天健MQTT数据（分页）
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 每页条数（必填）
 * @param {string} [params.deviceCode] - 设备编码
 * @param {string} [params.sampleTimeStart] - 采样时间开始
 * @param {string} [params.sampleTimeEnd] - 采样时间结束
 */
export function queryTianjianMqtt(params) {
  return axiosParams('get', `/yj/deviceData/queryTianjianMqtt`, params)
}

// ==================== 天健安装记录 ====================

/**
 * 查询天健安装记录（分页）
 * @param {object} params - 查询参数
 * @param {number} params.pageNum - 页码（必填）
 * @param {number} params.pageSize - 每页条数（必填）
 * @param {string} [params.deviceCode] - 设备编码
 */
export function queryTianjianRecord(params) {
  return axiosParams('get', `/yj/tianjianRecord/query`, params)
}

/**
 * 新增/修改天健安装记录
 * @param {object} data - 天健安装记录数据
 */
export function saveOrUpdateTianjianRecord(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/yj/tianjianRecord/saveOrUpdate`, data)
}

/**
 * 删除天健安装记录
 * @param {string} id - 记录ID
 */
export function deleteTianjianRecord(id) {
  return axiosParams('post', `/yj/tianjianRecord/delete?id=${id}`)
}
