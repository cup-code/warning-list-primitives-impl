import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
  createAxiosFromStore,
} from '@/http/common/utils'

// 获取所有协议信息,不含元数据
export function getAllProtocol() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `protocol/all`)
}

// 获取协议列表
export function getProtocolList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 协议编码
  if (params.code) {
    pr += `&code=${params.code}`
  }
  // 协议id
  if (params.protocolId) {
    pr += `&protocolId=${params.protocolId}`
  }
  // 协议名称
  if (params.protocolName) {
    pr += `&protocolName=${params.protocolName}`
  }
  // 协议状态
  if (params.state) {
    pr += `&state=${params.state}`
  }
  // 协议类型 (HTTP、TCP、UTP、MQTT等)
  if (params.type) {
    pr += `&type=${params.type}`
  }
  return axiosGet(axios, `protocol/list?${pr}`)
}

// 新增协议
export function addProtocol(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `protocol`, params)
}

// 删除协议
export function deleteProtocol(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `protocol/${id}`)
}

// 修改协议
export function editProtocol(params) {
  const axios = createAxiosFromStore()
  let pr = '?'

  // 协议id
  if (params.id) {
    pr += `&protocolId=${params.id}`
  }
  // 协议编码
  if (params.code) {
    pr += `&code=${params.code}`
  }
  // 协议名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 协议类型
  if (params.type) {
    pr += `&type=${params.type}`
  }
  // 协议描述
  if (params.remarks) {
    pr += `&remarks=${params.remarks}`
  }
  pr = pr.replace('?&', '?')

  return axiosPost(axios, `protocol/update${pr}`)
}

// 修改协议状态
export function editProtocolState(id, state) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `protocol/state/${id}?state=${state}`)
}

// 根据协议code获取协议完整信息,含元数据
export function getInfoByCode(code) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `protocol/infoByCode/${code}`)
}

// 根据协议id获取协议完整信息,含元数据
export function getInfoById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `protocol/infoById/${id}`)
}

// 根据协议id获取协议元数据
export function getMetaById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `protocol/meta/${id}`)
}

// 协议新增元数据
export function addProtocolMeta(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `protocol/meta`, params)
}

// 修改协议元数据
export function editProtocolMeta(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `protocol/meta?metaId=${params.id}`, params)
}

// 删除协议元数据
export function deleteProtocolMeta(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `protocol/meta/${id}`)
}

// 获取指定协议的所有父节点元数据
export function getParentNodesById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `protocol/meta/parentNodes/${id}`)
}

// 根据设备id和协议id获取改设备的协议元数据和协议参数
export function getDevProtocolMeta(did, pid) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `device/protocol/getMetaAndParam?deviceId=${did}&protocolId=${pid}`)
}

// 保存设备协议参数
export function saveDevProtocolMeta(did, params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `device/protocol/saveParam/${did}`, params)
}
