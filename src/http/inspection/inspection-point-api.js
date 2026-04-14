import {
  axiosParams,
  axiosPost,
  createAxiosFromStore,
} from '../common/utils'

/**
 * 获取巡检点列表
 * @param {object} params - 查询参数
 * @param {string} params.pointName - 巡检点名称
 * @param {string} params.companyId - 公司ID
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 */
export function getInspectionPointList(params) {
  return axiosParams('get', `/videoInspect/queryVideoInspectPlace`, params)
}

/**
 * 新增巡检点
 * @param {object} data - 巡检点数据
 */
export function addInspectionPoint(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/videoInspect/souVideoInspectPlace`, data)
}

// /**
//  * 编辑巡检点
//  * @param {object} data - 巡检点数据
//  */
// export function editInspectionPoint(data) {
//   const axios = createAxiosFromStore()
//   return axiosPost(axios, `/inspection/point/edit`, data)
// }

/**
 * 删除巡检点
 * @param {string} id - 巡检点ID
 */
export function deleteInspectionPoint(id) {
  return axiosParams('post', `/videoInspect/delVideoInspectPlace?id=${id}`)
}

/**
 * 获取巡检点详情
 * @param {string} id - 巡检点ID
 */
export function getInspectionPointDetail(id) {
  return axiosParams('get', `/videoInspect/queryInspectPlaceById?id=${id}`)
}

/**
 * 导出巡检点列表
 * @param {object} params - 查询参数
 */
export function exportInspectionPointList(params) {
  return axiosParams('get', `/inspection/point/export`, params, { responseType: 'blob' })
}
