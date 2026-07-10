import {
  axiosParams,
  axiosPost,
  createAxiosFromStore,
} from '../common/utils'

/**
 * 获取巡检项列表
 * @param {object} params - 查询参数
 * @param {string} params.cameraName - 摄像头名称
 * @param {string} params.companyId - 公司ID
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 */
export function getInspectionItemsList(params) {
  return axiosParams('get', `/videoInspect/queryCameraConfig`, params)
}

/**
 * 新增巡检项（绑定算法）
 * @param {object} data - 巡检项数据
 */
export function addInspectionItems(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/videoInspect/souCameraConfig`, data)
}

// /**
//  * 编辑巡检项
//  * @param {object} data - 巡检项数据
//  */
// export function editInspectionItems(data) {
//   const axios = createAxiosFromStore()
//   return axiosPost(axios, `/inspection/items/edit`, data)
// }

/**
 * 删除巡检项
 * @param {string} id - 巡检项ID
 */
export function deleteInspectionItems(id) {
  return axiosParams('POST', `/videoInspect/delCameraConfig?id=${id}`)
}

/**
 * 获取巡检项详情
 * @param {string} id - 巡检项ID
 */
export function getInspectionItemsDetail(id) {
  return axiosParams('get', `/videoInspect/queryCameraConfigById?id=${id}`)
}

/**
 * 导出巡检项列表
 * @param {object} params - 查询参数
 */
export function exportInspectionItemsList(params) {
  return axiosParams('get', `/inspection/items/export`, params, { responseType: 'blob' })
}

/**
 * 获取算法列表（用于绑定算法下拉选择）
 */
export function getAlgorithmList() {
  return axiosParams('get', `/inspection/algorithm/list`)
}

/**
 * 获取摄像头列表（用于绑定算法下拉选择）
 * @param {object} params - 查询参数
 * @param {string} params.companyId - 公司ID
 */
export function getCameraList(params) {
  return axiosParams('get', `/inspection/camera/list`, params)
}


// 巡检计划
/**
 * 获取巡检计划列表
 * @param {object} params - 查询参数
 * @param {string} params.planName - 巡检计划名称
 * @param {string} params.companyId - 公司ID
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 */
export function getInspectionPlanList(params) {
  return axiosParams('get', `/videoInspect/queryVideoInspectPlan`, params)
}


/**
/**
 * 新增巡检计划
 * @param {object} params - 巡检计划数据
 * @param {string} params.companyId - 所属公司ID
 * @param {string} [params.id] - 主键id（编辑时传）
 * @param {Array<object>} params.inspectPlaces - 巡检地点列表
 * @param {string} params.inspectPlaces[].placeId - 巡检地点id
 * @param {number} params.inspectPlaces[].sortOrder - 排序号
 * @param {string} params.planCode - 计划编码
 * @param {string} params.planName - 计划名称
 * @param {string} params.remarks - 备注
 * @param {string} params.sortOrder - 排序号
 */
export function addInspectionPlan(data) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/videoInspect/souVideoInspectPlan`, data)
}


/**
 * 查询巡检计划详情
 * @param {string} id - 巡检计划ID
 */
export function getInspectionPlanDetail(id) {
  return axiosParams('get', `/videoInspect/queryInspectPlanById?id=${id}`)
}

/**
 * 删除巡检计划
 * @param {string} id - 巡检计划ID
 */
export function deleteInspectionPlan(id) {
  return axiosParams('delete', `/videoInspect/delVideoInspectPlan?id=${id}`)
}
