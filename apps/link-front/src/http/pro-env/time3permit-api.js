import {
  axiosGet,
  axiosPut,
  createAxiosFromStore,
  createFormDataAxios,
} from '@/http/common/utils'

// 获取排污许可证图片
export function threeTimeGetPermit() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `threetime/licence/getImage`)
}

// 上传排污许可证图片
export function threeTimeUploadPermit(data) {
  const formData = new FormData()
  formData.append('file', data.file)
  const axios = createFormDataAxios()
  return axiosPut(axios, `threetime/licence/upload?type=${data.type}`, formData)
}
