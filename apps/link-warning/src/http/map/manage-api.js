import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
  createAxiosFromStore,
  createFormDataAxios,
} from '@/http/common/utils'

// 根据条件分页获取组态地图信息
export function getMap(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 地图名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 地图状态
  if ([0, 1].includes(params.status)) {
    pr += `&status=${params.status}`
  }

  return axiosGet(axios, `map/list?${pr}`)
}

// 新增地图
export function addMap(params) {
  const axios = createAxiosFromStore()
  let pr = '?'
  if (params.name) {
    pr += `&name=${params.name}`
  }
  if (params.remarks) {
    pr += `&remarks=${params.remarks}`
  }
  pr = pr.replace('?&', '?')

  return axiosPost(axios, `map${pr}`)
}

// 修改地图
export function editMap(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `map/${params.id}`, params)
}

// 删除地图
export function deleteMap(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `map/${id}`)
}

// 上传地图标记图片
export function addMapIcon(img) {
  const axios = createFormDataAxios() // formData格式
  const form = new FormData()
  form.append('file', img)
  return axiosPost(axios, `sys/uploadFile?fileType=MAP_PATH`, form)
}

// 查询租户下所有地图画面,用于菜单绑定自定义地图
export function getAllMap() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmi/all`)
}

// 根据地图id获取地图信息
export function getMapInfoById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `map/getInfoById/${id}`)
}

// 标注点管理-添加或修改标注点
export function addOrEditMarker(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `markInfo/saveOrUpdate`, params)
}

// 标注点管理-删除标注点
export function deleteMarker(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `markInfo/deleteById?id=${id}`)
}

// 标注点管理-根据条件分页获取标注点信息
export function getMarkerList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.markName) {
    pr += `&markName=${params.markName}`
  }
  if (params.markType) {
    pr += `&markType=${params.markType}`
  }
  return axiosGet(axios, `markInfo/getPageList?${pr}`)
}

// 标注类型
export function getMarkerTypeList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  if (params.typeName) {
    pr += `&typeName=${params.typeName}`
  }
  if (params.refModuleCode) {
    pr += `&refModuleCode=${params.refModuleCode}`
  }
  return axiosGet(axios, `markType/getPageList?${pr}`)
}

// 添加标注类型
export function addMarkerType(params) {
  const axios = createAxiosFromStore()

  return axiosPost(axios, `markType/saveOrUpdate`, params)
}

// 删除标注类型
export function deleteMarkerType(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `markType/deleteById?id=${id}`)
}

// 视角设置列表
export function getViewPointList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.viewName) {
    pr += `&viewName=${params.viewName}`
  }
  return axiosGet(axios, `viewConf/getPageList?${pr}`)
}

// 视角添加/修改
export function addOrEditViewPoint(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `viewConf/saveOrUpdate`, params)
}

// 视角删除
export function deleteViewPoint(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `viewConf/deleteById?id=${id}`)
}
