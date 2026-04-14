import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
} from '@/http/common/utils'
/* 事故上报 */
// 新增事故上报
export function accReportAdd(data) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  console.log(data.eventTypeId)
  for (const key in data) {
    if (key === 'files') {
      data.files.forEach((item) => {
        formData.append('files', item)
      })
    }
    else {
      formData.append(key, data[key])
    }
  }
  return axiosPost(axios, `resources/emergencyIncidentReport/add`, formData)
}
// 更新事故上报
export function accReportUpdate(data) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  for (const key in data) {
    if (key === 'files') {
      data.files.forEach((item) => {
        formData.append('files', item)
      })
    }
    else {
      formData.append(key, data[key])
    }
  }
  return axiosPost(axios, `resources/emergencyIncidentReport/update`, formData)
}
// 删除事故上报
export function accReportDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `resources/emergencyIncidentReport/delete/${id}`)
}
// 按ID查询事故上报
export function accReportGetById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `resources/emergencyIncidentReport/getById?id=${id}`)
}
// 分页查询事故上报
export function accReportGetByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `resources/emergencyIncidentReport/queryPageInfo`, params)
}
