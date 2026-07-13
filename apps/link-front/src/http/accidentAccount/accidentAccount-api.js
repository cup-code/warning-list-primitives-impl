import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
} from '@/http/common/utils'
// 分页查询
export function getAccidentAccount(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `resources/emergencyIncidentRecord/pageQuery`, params)
}

// 新增
export function addAccidentAccount(data) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  for (const key in data) {
    if (key === 'files') {
      data.files.forEach((item) => {
        formData.append('files', item)
      })
    }
    else {
      if (data[key] !== undefined) {
        formData.append(key, data[key])
      }
    }
  }

  return axiosPost(axios, `resources/emergencyIncidentRecord/addOrUpdate`, formData)
}
// 根据id查询
export function accAccidentGetById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `resources/emergencyIncidentRecord/get/${id}`)
}
