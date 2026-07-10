import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
  createAxiosFromStore,
  createFormDataAxios,
} from '@/http/common/utils'

// 获取所有产品
export function getAllProduct() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `product/all`)
}

// 获取产品列表
export function getProductList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`

  // 产品名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 产品编码
  if (params.token) {
    pr += `&token=${params.token}`
  }
  // 产品类型
  if (params.type) {
    pr += `&type=${params.type}`
  }
  // 协议id
  if (params.protocolId) {
    pr += `&protocolId=${params.protocolId}`
  }
  // 产品状态
  if (params.state) {
    pr += `&state=${params.state}`
  }

  return axiosGet(axios, `product/list?${pr}`)
}

// 新增产品
export function addProduct(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `product`, params)
}

// 删除产品
export function deleteProduct(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `product/${id}`)
}

// 修改产品
export function editProduct(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `product/update`, params)
}

// 修改产品状态
export function editProductState(id, state) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `product/state/${id}?state=${state}`)
}

// 根据产品id 获取基础信息
export function getInfoById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `product/infoById/${id}`)
}

// 根据产品id 获取产品测点信息
export function getIoById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `product/io/${id}`)
}

// 新增产品测点
export function addIo(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `product/io`, params)
}

// 修改产品测点
export function editIo(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `product/io/update`, params)
}

// 删除产品测点
export function deleteIo(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `product/io/${id}`)
}

// 获取测点图标列表
export function getIoIcon() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `product/io/iconList`)
}

// 根据产品id 获取产品命令信息
export function getCommandById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `product/command/${id}`)
}

// 新增产品命令
export function addCommand(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `product/command`, params)
}

// 修改产品命令
export function editCommand(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `product/command?productCmdId=${params.id}`, params)
}

// 删除产品命令
export function deleteCommand(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `product/command/${id}`)
}

// 新增产品命令参数
export function addCommandParams(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `product/command/params`, params)
}

// 修改产品命令参数
export function editCommandParams(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `product/command/params?productCmdParamId=${params.id}`, params)
}

// 删除产品命令参数
export function deleteCommandParams(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `product/command/params/${id}`)
}

// 根据产品id获取产品扩展属性信息
export function getExtendById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `product/extend/${id}`)
}

// 新增产品扩展属性
export function addExtend(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `product/extend`, params)
}

// 修改产品扩展属性
export function editExtend(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `product/extend?productExtendId=${params.id}`, params)
}

// 删除产品扩展属性
export function deleteExtend(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `product/extend/${id}`)
}

// 根据条件分页获取网关设备纪录
export function getDevRecordList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 设备编码/机器授权码
  if (params.code) {
    pr += `&code=${params.code}`
  }
  // MAC地址
  if (params.mac) {
    pr += `&mac=${params.mac}`
  }
  // 生产序列化
  if (params.sn) {
    pr += `&sn=${params.sn}`
  }
  // 状态
  if (params.status) {
    pr += `&status=${params.status}`
  }
  // 划拨到的租户id
  if (params.transferTo) {
    pr += `&transferTo=${params.transferTo}`
  }
  return axiosGet(axios, `deviceRecord/list?${pr}`)
}

// 下载网关设备纪录模板文件
export function getDevRecordTempFile() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `deviceRecord/getTemplateFile`)
}

// 上传网关设备纪录文件
export function saveDevRecordFile(file) {
  const axios = createFormDataAxios() // formData格式
  const form = new FormData()
  form.append('file', file)
  return axiosPost(axios, `deviceRecord/saveDeviceRecordFile`, form)
}

// 启用/停用网关设备
export function enableDevRecord(id, flag) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `deviceRecord/enable/${id}?enable=${flag}`)
}

// 修改网关设备记录
export function editDevRecord(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `deviceRecord/${params.id}?remarks=${params.remarks}`, params)
}
