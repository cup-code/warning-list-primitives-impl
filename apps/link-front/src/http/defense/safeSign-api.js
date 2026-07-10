import {
  axiosDelete,
  axiosGet,
  axiosPut,
  createAxiosFromStore,
  createFormDataAxios,
} from '@/http/common/utils'

// 获取安全标志分页
export function getSafeSignList(data) {
  const axios = createAxiosFromStore()
  let reqStr = `fuzzyQuery=${data.fuzzyQuery}`
  reqStr += `&pageNum=${data.pageNum}`
  reqStr += `&pageSize=${data.pageSize}`
  reqStr += `&signType=${data.signType}`
  return axiosGet(axios, `dpm/safeSigns/page?${reqStr}`)
}

// 删除安全标志
export function delSafeSign(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `dpm/safeSigns/delete/${id}`)
}

// 安全标志保存
export function saveSafeSign(data) {
  const formData = new FormData()
  Object.keys(data).forEach((key) => {
    formData.append(key, data[key])
  })
  const axios = createFormDataAxios()

  return axiosPut(axios, `dpm/safeSigns/save`, formData)
}

// 获取全部安全标志
export function getAllSafeSign() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/safeSigns/allList`)
}
