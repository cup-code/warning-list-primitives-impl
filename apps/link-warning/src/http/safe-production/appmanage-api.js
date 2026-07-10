import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
} from '@/http/common/utils'
// 分页查询
export function getMobileTerminalPage(params) {
  const axios = createAxiosFromStore()
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`

  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }
  if (params.osType) {
    pr += `&osType=${params.osType}`
  }
  if (params.uploadState || params.uploadState === 0) {
    pr += `&uploadState=${params.uploadState}`
  }
  return axiosGet(axios, `appInfo/page${pr}`)
}
// 上传移动端app安装包
export function AddMobileTerminal(data) {
  const axios = createFormDataAxios()
  const formData = new FormData()
  // console.log(data)
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
  return axiosPost(axios, `appInfo/uploadApp`, formData)
}

// 重新上传移动端app安装包
export function addAgainCost(data) {
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
  return axiosPost(axios, `appInfo/reUpload/${data.id}`, formData)
}

// 查询当前环节后端服务及登录人租户信息
export function getserver() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `appInfo/server`)
}
