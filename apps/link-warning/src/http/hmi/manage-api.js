import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
  createAxiosFromStore,
  createFormDataAxios,
} from '@/http/common/utils'

// 根据条件分页获取组态画面信息
export function getHmi(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`
  // 组态名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 分组id
  if (params.groupId) {
    pr += `&groupId=${params.groupId}`
  }
  // 组态状态   0上架  1下架
  if (params.status || params.status == '0') {
    pr += `&status=${params.status}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }

  return axiosGet(axios, `hmi/list?${pr}`)
}

// 新增画面
export function addHmi(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `hmi/${params.templateId}`, params)
}

// 修改画面
export function editHmi(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `hmi?hmiId=${params.id}`, params)
}

// 删除画面
export function deleteHmi(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `hmi/${id}`)
}

// 上下架画面
export function editHmiState(params) {
  // state: 0是上架； 1是下架
  const axios = createAxiosFromStore()
  return axiosPut(axios, `hmi/changeState?hmiId=${params.id}&state=${params.state}`)
}

// 查询租户下指定类型的所有画面
export function getAllHmi(type) {
  type = `${type}` // 转为字符串
  const axios = createAxiosFromStore()
  let pr = ''
  if (type) {
    pr += `?type=${type}`
  }
  return axiosGet(axios, `hmi/all${pr}`)
}

// 获取组态画面分享地址
export function getHmiShareUrl(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmi/getShareUrl?id=${id}`)
}

// 修改画面时 上传图片接口
export function editHmiUpPic(pic) {
  const axios = createFormDataAxios() // formData格式
  const form = new FormData()
  form.append('file', pic)
  return axiosPost(axios, `sys/uploadFile?fileType=HMI_COVER`, form)
}

// 组态管理中--自定义图库
// 获取图库列表
export function getPicListFn(params) {
  const axios = createAxiosFromStore()
  const pr = `pageNum=${params.page}&pageSize=${params.pageSize}`
  return axiosGet(axios, `hmi/pictureMaterial/list?${pr}`)
}
// 增加图片
export function addPic(params) {
  const axios = createFormDataAxios() // formData格式
  const form = new FormData()
  params.icons.forEach((item) => {
    form.append('file', item.raw)
  })
  return axiosPost(axios, `hmi/pictureMaterial?name=${params.name}`, form)
}
// 删除图片
export function deletePic(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `/hmi/pictureMaterial/${id}`)
}
// 组态模板部分接口
// 查询所有模板,租户返回可用的,superAdmin返回全部
export function getAllTemplate() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmiTemplate/all`)
}
// 新增模板
export function addTemplate(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `hmiTemplate`, params)
}
// 修改模板
export function editTemplate(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `hmiTemplate/${params.id}`, params)
}
// 删除模板
export function deleteTemplate(templateId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `hmiTemplate/${templateId}`)
}

// 上下架模板
export function editTemplateState(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `hmiTemplate/changeState/${params.id}?state=${params.state}`)
}
// 查询指定部门下的组态画面
export function getHmiListByDepartFn(departmentId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmi/getByDepartmentId/${departmentId}`)
}
