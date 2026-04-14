/**
 * Created by kobe on 2021/7/8.
 */
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
  createAxiosFromStore,
} from './common/utils'

// 传感器实时数据查询
export function getSensorCur(params) {
  const axios = createAxiosFromStore()

  if (!params.search) {
    params.search = ''
  }
  return axiosGet(
    axios,
    `sensor/current?page=${params.page}&pageSize=${params.pageSize}&search=${params.search}`,
  )
}

// 查询距今日指定天数的工单完成状态
export function getSheetHis(day) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `maintenance/sheet/his/${day}`)
}

// 查询24小时车位库存比例
export function getCount24() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `park/stockcount`)
}

// 查询停车记录
export function getParkRecord(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNumber=${params.pageNumber}&pageSize=${params.pageSize}`
  if (params.period || params.period == 0) {
    pr += `&period=${params.period}`
  }
  else {
    if (params.startTm) {
      pr += `&startTime=${params.startTm}`
    }
    if (params.endTm) {
      pr += `&endTime=${params.endTm}`
    }
  }
  // 排序
  if (params.sortType) {
    pr += `&sortType=${params.sortType}`
  }
  // 车牌号
  if (params.plate) {
    pr += `&plate=${params.plate}`
  }

  return axiosGet(axios, `park/record?${pr}`)
}

// 查询门房的日流量
export function getDoorFloat() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `park/clientInfo`)
}

// 查询门房设备状态
export function getDoorStatus() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `park/deviceStatus`)
}

// 查询停车记录拍照录像
export function getParkImg(rid, cid) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `park/image/${rid}/${cid}`)
}

// 查询设备在线数
export function getDevOnOff() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `devices/countDeviceByPoint?specificationType=Ul-5310`)
}

// 查询页面框架信息
export function getFrameList() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `users/findFrameList`)
}

// 添加页面框架信息
export function addFrame(param) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/users/frame`, param)
}

// 修改页面框架信息
export function editFrame(param) {
  const axios = createAxiosFromStore()
  return axiosPut(axios, `/users/frame`, param)
}

// 删除页面框架信息
export function deleteFrame(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `/users/frame/${id}`)
}

// 根据type请求hmi数据
export function getHmiSpecs(type) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmiScript/loadDateByType?type=${type}`)
}
// 根据设备类型id 请求所有同类型设备
export function getHmiDevs(specId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmiScript/loadDeviceInfo?specId=${specId}`)
}
// 根据设备类型id 请求所有IO点信息
export function getHmiIOs(specId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmiScript/loadSpecIOInfo?specId=${specId}`)
}

// 请求设备id和io点获取设备信息
export function getDevInfo(did, ioArr) {
  const axios = createAxiosFromStore()
  let str = ''
  ioArr.forEach((item) => {
    str += `&ioArray=${item}`
  })
  return axiosGet(axios, `devices/getDeviceByDidAndIOArray?did=${did}${str}`)
}
