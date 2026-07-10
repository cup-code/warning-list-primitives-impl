import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'

// 删除固废
export function threeTimeSolidWasteProdDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `threetime/solidwaste/delete?id=${id}`)
}

// 分页查询固废
export function threeTimeSolidWasteProdByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/solidwaste/queryPageInfo`, params)
}

// 按id查询固废数据
export function threeTimeSolidWasteProdById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `threetime/solidwaste/getById?id=${id}`)
}

// 修改固废数据
export function threeTimeSolidWasteUpdate(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/solidwaste/update`, params)
}

// 新增固废数据
export function threeTimeSolidWasteAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/solidwaste/save`, params)
}
