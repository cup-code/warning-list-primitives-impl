// 组态画面用到的接口
import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from './common/utils'
// 通过id或code去获取画面信息，是否是加密的画面，如果是加密的，则需要输入密码，没有密码，则直接返回画面地址，加载画面
export function isRequirePassword(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmi/preLoad?${id}`)
}
// 获取所有画面
export function getAllHmi(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmi/allByIdOrCode?${id}`)
}
// 数值输入事件---写值
export function writeValue(id, v, device, io) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `hmi/setIo?${id}&value=${v}&deviceCode=${device}&ioCode=${io}`)
}
// 保存画面或者模板
export function saveHmi(url, params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, url, params)
}
// 设置了密码的画面，需要输入密码打开画面
export function verify(id, pwd) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmi/checkPassword?password=${pwd}&code=${id}`)
}
// 获取画面动态数据
export function getScreenData(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmi/loadDynamicataData?${id}`)
}
// 上传图片
export function uploadImage(id, params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `hmi/uploadImg/${id}`, params)
}
// 选择数据源时获取产品数据
export function getProductData(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmi/allProduct?${id}`)
}
// 选择数据源时通过产品id获取产品下的设备数据
export function getDeviceData(id, pid) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmi/devicesByProduct/${pid}?${id}`)
}
// 选择数据源时通过设备id获取设备下的测点数据
export function getPointsData(id, did) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmi/deviceIo/${did}?${id}`)
}
// 选择数据源时获取系统变量数据
export function getSystemData(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmi/systemData?${id}`)
}
// 选择数据源时获取系统变量下的详情数据
export function getSysDetailData(id, code) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmi/systemData?type=${code}&${id}`)
}
// 通过设备和测点、起始时间获取历史数据
export function getHistoryData(id, device, io, start, end) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmi/historyTrend/${device}/${io}?startDate=${start}&endDate=${end}&${id}`)
}
// 通过设备code和测点code获取测点实时数据
export function getRealtimeData(id, deviceCode, ioCode) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmi/realTrend/${deviceCode}/${ioCode}?${id}`)
}
// 获取自定义图库
export function getCustomPic() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmi/pictureMaterial/all`)
}
// 保存我的元件
export function saveMyComponentFn(name, iconPath, info) {
  const axios = createAxiosFromStore()
  const params = {
    name,
    iconPath,
    info,
  }
  return axiosPost(axios, `hmiComponent/save`, params)
}
// 获取自定义元件
export function getCustomComponentFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmiComponent/all`)
}
// 通过终端code和测点code添加到曲线组
export function addToTrendGroupFn(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `hmiPointGroup/addByDeviceCodeAndIoCode`, params)
}
// 查询指定组态画面添加的曲线组
export function getTrendGroupFn(tenantCode, hmiId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hmiPointGroup/getPointsByHmiId/${tenantCode}/${hmiId}`)
}
// 保存组态测点组信息
export function saveTrendGroupFn(tenantCode, hmiId, params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `hmiPointGroup/saveHmiPointList/${tenantCode}/${hmiId}`, params)
}
// 查询指定组态画面的点组指定时间段的历史值
export function getMulHistoryData(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `hmiPointGroup/getHmiPointHistory`, params)
}
// 获取直连摄像头列表
export function getHkCameraList() {
  const axios = createAxiosFromStore()
  const pr = `isPage=false&isOnlySelfData=true`
  return axiosGet(axios, `haikang/getCameraPageList?${pr}`)
}
// 获取海康视频url
export function getCameraUrlHk(cameraId, hmiId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `video/playByIdHmi?cameraId=${cameraId}&${hmiId}`)
}
