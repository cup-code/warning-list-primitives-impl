import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '../common/utils'

// 工单列表
export function getWorkList(params) {
  const axios = createAxiosFromStore()
  let param = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}&`

  if (params.departmentId) {
    param += `departmentId=${params.departmentId}&`
  }

  if (params.dateEnd || params.dateStart) {
    param += `dateEnd=${params.dateEnd}&dateStart=${params.dateStart}&`
  }

  if (params.workOrderNum) {
    param += `workOrderNum=${params.workOrderNum}&`
  }

  if (params.workOrderType) {
    param += `workOrderType=${params.workOrderType}&`
  }

  return axiosGet(axios, `workOrderDevice/page${param}`)
}

// 新建、处理工单
export function addNeWWork(params) {
  const axios = createAxiosFromStore()

  return axiosPost(axios, `workOrderDevice/saveOrUpdate`, params)
}

// 工单转办
export function transferWork(params) {
  const axios = createAxiosFromStore()

  return axiosPost(axios, `workOrderDevice/transfer`, params)
}

// 删除工单
export function deleteWork(id) {
  const axios = createAxiosFromStore()

  return axiosPost(axios, `workOrderDevice/delete?id=${id}`)
}

// 工单统计信息
export function getWorkStatistics(params) {
  const axios = createAxiosFromStore()

  let param = `?`
  if (params.year) {
    param += `year=${params.year}&`
  }

  if (params.month) {
    param += `month=${params.month}&`
  }
  return axiosGet(axios, `workOrderDevice/statistic${param}`)
}
