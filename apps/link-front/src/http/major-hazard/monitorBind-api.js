import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'

/* 重大危险源：监测绑定 */
// 分页查询监测绑定信息
export function monitorBindByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/bind/hazardBindInfoPaging`, params)
}

/* 绑定测点 */
// 保存绑定测点信息
export function pointGroupSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `device/pointGroup/save`, params)
}
// 查询已有的绑定测点信息
export function getPointGroup(params) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `device/pointGroup/getAllIoByGroupId/${params}`)
}
// 删除测点组下单个测点
export function pointGroupDeleteByIo(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `device/pointGroup/deleteByIo/${id}`)
}

/* 绑定摄像头 */
// 获取摄像头信息
export function getHkAlarmList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 公司id
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  // 摄像品牌
  if (params.brand) {
    pr += `&brand=${params.brand}`
  }
  // 视频名称或位置
  if (params.cameraNameOrLoc) {
    pr += `&cameraNameOrLoc=${params.cameraNameOrLoc}`
  }
  return axiosGet(axios, `haikang/getCameraPageList?${pr}`)
}

// 保存绑定摄像头信息
export function cameraBindInfoSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `bind/saveCameraBindInfo`, params)
}

// 查询已有的绑定摄像头信息
export function getCameraGroup(params) {
  const axios = createAxiosFromStore()
  const pr = {
    hazardId: params,
  }
  return axiosPost(axios, `bind/getBindCameraInfo`, pr)
}
