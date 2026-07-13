import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
} from '@/http/common/utils'

// 分页查询项目环评资料列表
export function threeTimeCheckPageQuery(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `threetime/information/pageQuery`, params)
}

// 删除项目环评资料
export function threeTimeCheckDel(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `threetime/information/delete?id=${id}`)
}

// 新增环评资料
export function threeTimeCheckSaveInfo(data) {
  const axios = createFormDataAxios()
  let params = '?'
  for (const key in data) {
    if (key !== 'files') {
      if (data[key] !== undefined) {
        params += `&${key}=${data[key]}`
      }
    }
  }
  params = params.replace('?&', '?')
  const formData = new FormData()
  Object.keys(data.files).forEach((key) => {
    formData.append('files', data.files[key])
  })
  return axiosPost(axios, `threetime/information/save${params}`, formData)
}

// 修改环评资料
export function threeTimeCheckUpdateInfo(data) {
  const axios = createFormDataAxios()
  let params = '?'

  for (const key in data) {
    if (key !== 'files') {
      params += `&${key}=${data[key]}`
    }
  }
  params = params.replace('?&', '?')

  const formData = new FormData()

  Object.keys(data.files).forEach((key) => {
    formData.append('files', data.files[key])
  })

  return axiosPost(axios, `threetime/information/update${params}`, formData)
}

// 删除环评资料附件
export function threeTimeCheckDelFile(params) {
  const axios = createAxiosFromStore()
  return axiosDelete(
    axios,
    `threetime/information/delFile?id=${params.id}&entityId=${params.entityId}`,
  )
}

// 查看项目环评单条数据
export function threeTimeCheckById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `threetime/information/getById/?id=${id}`)
}
