import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
  createAxiosFromStore,
  createFormDataAxios,
} from '@/http/common/utils'

// 查询所有设备
export function getAllDevice() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `devices/all`)
}
// 根据产品id查询同类型的所有设备
export function getHmiDevs(specId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `devices/byProducId/${specId}`)
}

// 根据条件获取设备信息
export function getDeviceList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`

  // 设备名称
  if (params.deviceName) {
    pr += `&deviceName=${params.deviceName}`
  }
  // 设备编码
  if (params.deviceCode) {
    pr += `&deviceCode=${params.deviceCode}`
  }
  // 所属公司
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  // 设备所属产品id
  if (params.productId) {
    pr += `&productId=${params.productId}`
  }
  // 设备状态
  if (params.deviceState) {
    pr += `&deviceState=${params.deviceState}`
  }
  // 设备所属产品协议id
  if (params.protocolId) {
    pr += `&protocolId=${params.protocolId}`
  }
  // 设备分组id
  if (params.groupId) {
    pr += `&groupId=${params.groupId}`
  }

  return axiosGet(axios, `devices/list?${pr}`)
}
// 查询租户下指定产品类型的设备
export function getDeviceListByPid(productId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `devices/byProducId/${productId}`)
}
// 新增设备
export function addDevice(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `devices`, params)
}

// 删除设备
export function deleteDevice(pid, id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `devices/${pid}/${id}`)
}

// 修改设备
export function editDevice(params) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `devices`, params)
}

// 当前设备运行状态
export function getCurrentDeviceState() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `fc/device/status`)
}

// 根据产品id和设备id获取设备基础信息
export function getInfoById(pid, id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `devices/baseInfo/${pid}/${id}`)
}

// 设备状态数量统计,首页使用
export function getDeviceStatistics() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `devices/statistics`)
}
// 根据设备id查设备测点信息
export function getBaseInfo(groupId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `device/pointGroup/getAllIoByGroupId/${groupId}`)
}
// 根据产品id和设备id获取设备测点 实时信息
export function getRealDataById(pid, id, params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`
  if (params.ioName) {
    pr += `&ioName=${encodeURIComponent(params.ioName)}`
  }
  if (params.ioCode) {
    pr += `&ioCode=${encodeURIComponent(params.ioCode)}`
  }
  return axiosGet(axios, `devices/realData/${pid}/${id}?${pr}`)
}

// 根据产品id和设备id获取设备测点 历史信息
export function getHisDataById(pid, id, params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`

  // 设备测点 ioCode
  if (params.ioCode) {
    pr += `&ioCode=${params.ioCode}`
  }
  // 查询事件类型,同测点类型数据字典
  if (params.type) {
    pr += `&type=${params.type}`
  }
  // 开始时间
  if (params.startTime) {
    pr += `&startTime=${params.startTime}`
  }
  // 结束时间
  if (params.endTime) {
    pr += `&endTime=${params.endTime}`
  }
  return axiosGet(axios, `devices/hisData/${pid}/${id}?${pr}`)
}

// 导出设备测点历史数据
export function exportHisDataById(params) {
  const axios = createAxiosFromStore()
  let pr = '?'

  // 设备测点 ioCode
  if (params.ioCode) {
    pr += `&ioCode=${params.ioCode}`
  }
  // 查询事件类型,同测点类型数据字典
  if (params.type) {
    pr += `&type=${params.type}`
  }
  // 开始时间
  if (params.startTime) {
    pr += `&startTime=${params.startTime}`
  }
  // 结束时间
  if (params.endTime) {
    pr += `&endTime=${params.endTime}`
  }
  pr = pr.replace('?&', '?')

  return axiosGet(axios, `device/io/export/${params.pid}/${params.did}${pr}`)
}

// 设备测点写值
export function setDevIoVal(params) {
  const axios = createAxiosFromStore()
  return axiosPost(
    axios,
    `devices/setIo/${params.pid}/${params.did}?ioCode=${params.ioCode}&value=${params.value}`,
  )
}

// 获取指定设备测点的历史趋势
export function getIoTrendHis(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `device/io/historyTrend/${params.dcd}/${params.icd}?startDate=${params.startDate}&endDate=${params.endDate}`,
  )
}
// 获取指定设备测点的实时趋势
export function getIoTrendReal(did, ioCode) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `device/io/realTrend/${did}/${ioCode}`)
}
// 根据设备id获取设备所有测点信息
export function getAllIoById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `device/io/all/${id}`)
}

// 根据设备id获取设备测点信息
export function getIoById(id, params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`
  if (params.ioName) {
    pr += `&ioName=${encodeURIComponent(params.ioName)}`
  }
  return axiosGet(axios, `device/io/${id}?${pr}`)
}

// 新增设备测点
export function addIo(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `device/io`, params)
}

// 修改设备测点
export function editIo(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `device/io/update`, params)
}

// 删除设备测点
export function deleteIo(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `device/io/${id}`)
}

// 获取设备测点图标列表
export function getIoIcon() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `device/io/iconList`)
}

// 获取海康威视摄像头播放地址
export function getCameraUrl(did, type, hmiId) {
  const axios = createAxiosFromStore()
  if (hmiId) {
    // 组态中需要传画面id或code
    return axiosGet(axios, `camera/getURL?deviceId=${did}&type=${type}&${hmiId}`)
  }
  else {
    return axiosGet(axios, `camera/getURL?deviceId=${did}&type=${type}`)
  }
}
// 获取海康威视摄像头播放地址
export function getCameraUrlHk(did, type, hmiId) {
  const axios = createAxiosFromStore()
  if (hmiId) {
    // 组态中需要传画面id或code
    return axiosGet(axios, `hikisc/getURL?deviceId=${did}&type=${type}&${hmiId}`)
  }
  else {
    return axiosGet(axios, `hikisc/getURL?deviceId=${did}&type=${type}`)
  }
}
// 上传设备图片
export function upLoadDeviceImg(file) {
  const axios = createFormDataAxios()
  const form = new FormData()
  form.append('file', file)
  return axiosPost(axios, `sys/uploadFile?fileType=DEVICE_ICON`, form)
}
// 获取指定终端分组下的终端信息
export function getDeviceListByGroupFn(groupId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `device/group/info/${groupId}`)
}
