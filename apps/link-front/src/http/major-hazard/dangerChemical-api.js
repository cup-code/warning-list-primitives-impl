import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
  createFormUrlencodedAxios,
} from '@/http/common/utils'

/* 危化品台账 */
// 分页查询危化品
export function majorHazardChemistryByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `hazardousgoods/majorhazardChemistry/pageQuery`, params)
}
// 按id查询危化品
export function majorHazardChemistryById(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `hazardousgoods/majorhazardChemistry/getById?id=${id}`)
}
// 添加危化品
export function majorHazardChemistryAdd(data) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  for (const key in data) {
    if (key === 'files' || key === 'securityFile') {
      if (key === 'files') {
        data.files.forEach((item) => {
          formData.append(key, item)
        })
      }
      if (key === 'securityFile') {
        data.securityFile.forEach((item) => {
          formData.append(key, item)
        })
      }
    }
    else {
      formData.append(key, data[key])
    }
  }
  return axiosPost(axios, `hazardousgoods/majorhazardChemistry/add`, formData)
}
// 删除危化品
export function majorHazardChemistryDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `hazardousgoods/majorhazardChemistry/delete?id=${id}`)
}
// 更新危化品
export function majorHazardChemistryUpdate(data) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  for (const key in data) {
    if (key === 'files' || key === 'securityFile') {
      data[key].forEach((item) => {
        formData.append(key, item)
      })
    }
    else {
      formData.append(key, data[key])
    }
  }
  return axiosPost(axios, `hazardousgoods/majorhazardChemistry/update`, formData)
}

// 删除说明书文件
export function infoFileDel(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `hazardousgoods/majorhazardChemistry/delFile`, params)
}
