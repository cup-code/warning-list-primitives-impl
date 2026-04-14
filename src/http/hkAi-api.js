import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from './common/utils'

// 获取报警信息列表
export function getHkAlarmList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`

  // 开始时间
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  // 结束时间
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  // 摄像头
  if (params.camName) {
    pr += `&camName=${params.camName}`
  }
  // 告警类型
  if (params.aiAlarmType) {
    pr += `&aiAlarmType=${params.aiAlarmType}`
  }
  // 审核结果
  if (params.auditRes) {
    pr += `&auditRes=${params.auditRes}`
  }
  // 审核状态
  if (params.auditStatus) {
    pr += `&auditStatus=${params.auditStatus}`
  }
  // 告警等级
  if (params.aiAlarmLev) {
    pr += `&aiAlarmLev=${params.aiAlarmLev}`
  }
  // 公司id
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  // 摄像头ip
  if (params.camIp) {
    pr += `&camIp=${params.camIp}`
  }
  // 摄像头id集合
  if (params.camIds) {
    pr += `&camIds=${params.camIds}`
  }

  return axiosGet(axios, `haikang/getHkAlarmPageList?${pr}`)
}
// 根据id审核照片
export function auditAlarmInfo(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `haikang/auditAlarmInfo`, params)
}
// 批量审核
export function auditAlarmInfoList(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `haikang/auditAlarmInfoList`, params)
}
// 根据id获取报警信息
export function getAlarmInfoById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `haikang/getAlarmInfoById?id=${id}`)
}

// 分页获取摄像头列表
export function getHkCameraList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 公司id
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  // 部门id
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  // 品牌
  if (params.brand) {
    pr += `&brand=${params.brand}`
  }
  // 视频名称或位置
  if (params.cameraNameOrLoc) {
    pr += `&cameraNameOrLoc=${params.cameraNameOrLoc}`
  }
  // 是否默认查询自己数据
  if (params.isOnlySelfData) {
    pr += `&isOnlySelfData=${params.isOnlySelfData}`
  }
  return axiosGet(axios, `haikang/getCameraPageList?${pr}`)
}
// 添加或修改摄像头信息
export function updateCamera(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `haikang/saveOrUpdateCamera`, params)
}
// 查询摄像头信息
export function getCameraById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `haikang/getCameraById?id=${id}`)
}
// 根据id删除摄像头信息
export function deleteCameraById(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `haikang/deleteCameraById?id=${id}`)
}
// 查询摄像头绑定的重大危险源信息
export function getCameraHazardByCompany(companyId) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `bind/getBindCameraHazardInfo?companyId=${companyId}`)
}
// 根据重大危险源和公司id查询摄像头列表
export function getCameraListByHazard(companyId, hazardId) {
  const axios = createAxiosFromStore()
  return axiosPost(
    axios,
    `bind/getBindCameraInfo?companyId=${companyId}&hazardId=${hazardId}`,
  )
}
// 摄像头点播
export function videoPlayById(channelId, deviceId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `video/play?channelId=${channelId}&deviceId=${deviceId}`)
}

// 摄像头 通过id 播放
export function videoById(deviceId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `video/playById?id=${deviceId}`)
}

// 海康超脑盒子列表
export function getHKBoxList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.name) {
    pr += `&name=${params.name}`
  }
  if (params.ip) {
    pr += `&ip=${params.ip}`
  }
  return axiosGet(axios, `hkcfg/getHkAiBoxPageList?${pr}`)
}

// 海康超脑模型列表
export function getHKModelList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.mpName) {
    pr += `&mpName=${params.mpName}`
  }

  return axiosGet(axios, `hkcfg/getHkAiModelPageList?${pr}`)
}

// 添加海康模型
export function addHKModel(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `hkcfg/saveOrUpdateHkAiModel`, params)
}

// 删除海康模型
export function deleteHKModel(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `hkcfg/deleteHkAiModelById?id=${id}`)
}

// 添加海康超脑盒子
export function addHKBox(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'hkcfg/saveOrUpdateHkAiBox', params)
}

// 删除海康超脑盒子
export function deleteHKBox(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `hkcfg/deleteHkAiBoxById?id=${id}`)
}

// 注册设备布放报警
export function registerDevice(params) {
  const axios = createAxiosFromStore()
  return axiosPost(
    axios,
    `hkcfg/register?ip=${params.ip}&port=${params.port}&pwd=${params.pwd}&user=${params.user}`,
  )
}

// 注销设备撤防报警
export function unregisterDevice(ip) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hkcfg/unregister?ip=${ip}`)
}
