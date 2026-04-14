import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'
/* 测点组管理 */
// 分页查询
export function getGroupByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `device/pointGroup/queryByPage${reqStr}`)
}
// 分页查询公司下的测点组及所绑定测点信息
export function getGroupPointByPage(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] !== undefined) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `device/pointGroup/queryPointGroupIoByPage${reqStr}`)
}
// 删除
export function deviceGroupDel(groupId) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `device/pointGroup/delete/${groupId}`)
}
// 保存
export function deviceIoGroupSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `device/pointGroup/save`, params)
}
/* 测点趋势 */
// 查询指定的多个测点的实时数据
export function getIoTrendReal(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `device/pointGroup/ioRealValue`, params)
}
// 查询指定的多个测点的历史数据
export function getIoTrendHis(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `device/pointGroup/ioHistoryValue`, params)
}
// 根据id查询指定测点组下的所有测点
export function getAllIoByGroup(groupId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `device/pointGroup/getAllIoByGroupId/${groupId}`)
}
// 获取当前登录人的测点组列表
export function getmyCompanyPointGroup() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `device/pointGroup/myCompanyPointGroup`)
}
