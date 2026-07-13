import {
  axiosDelete,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
/* 安全生产目标 */
// 安全生产目标分页查询
export function getSafeTargetByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `productionTargets/pageQuery`, params)
}

// 保存安全生产目标
export function safeTargetSave(data) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  for (const key in data) {
    if (key === 'files' && data[key]) {
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
  return axiosPost(axios, `productionTargets/addOrUpdate`, formData)
}
// 删除安全生产目标
export function safeTargetDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `productionTargets/delete/${id}`)
}
