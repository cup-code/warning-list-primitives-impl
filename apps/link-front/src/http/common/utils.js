import qs from 'qs'
import { createAxiosAuthorization } from './axiosConfig'
import { getAuthToken } from '@/utils/tab-session'

// 获取baseURL
export function getBaseUrl() {
  const env = process.env.NODE_ENV
  let baseUrl
  if (env == 'development') {
    baseUrl = window.g.BASE_URL_DEV
  }
  else {
    baseUrl = window.g.BASE_URL_PRO
  }
  return baseUrl
}

// 获取当前浏览器的地址栏 url
export function getLocalUrl() {
  return location.href.split('#')[1]
}

// 拿到token id和authToken传给axios的权限配置方法
export function createAxiosFromStore() {
  const baseUrl = getBaseUrl()
  const authToken = getAuthToken()
  return createAxiosAuthorization(baseUrl, authToken)
}
// 创建 formData版本
export function createFormDataAxios() {
  const baseUrl = getBaseUrl()
  const authToken = getAuthToken()
  return createAxiosAuthorization(baseUrl, authToken, 'formData')
}

// 创建 formUrlencoded版本
export function createFormUrlencodedAxios() {
  const baseUrl = getBaseUrl()
  const authToken = getAuthToken()
  return createAxiosAuthorization(baseUrl, authToken, 'formUrlencoded')
}

// axios的get方法封装
export function axiosGet(axios, path) {
  return axios.get(path)
}

// axios的post方法封装
export function axiosPost(axios, path, params) {
  return axios.post(path, params)
}

// 附件上传带进度条
export function axiosPostFile(axios, path, params, fileInfo) {
  return axios.post(path, params, {
    onUploadProgress(event) {
      if (fileInfo && fileInfo.onProgress) {
        const percent = Math.floor((event.loaded / event.total) * 100 || 0)
        let sta = null
        if (percent < 100) {
          // uploading, success, failed
          sta = 'uploading'
        }
        else {
          sta = 'success'
        }
        fileInfo.percentage = percent
        fileInfo.status = sta
        if (percent < 100) {
          event.percent = percent
          fileInfo.onProgress(event)
        }
      }
    },
  })
}

// axios的delete方法封装
export function axiosDelete(axios, path) {
  return axios.delete(path)
}

// axios的put方法封装
export function axiosPut(axios, path, params) {
  return axios.put(path, params)
}

// axios 请求文件流方法
export function axiosFile(axios, path, method = 'post', data) {
  return axios.request({
    url: path,
    method,
    responseType: 'blob',
    data,
  })
}

// axios 文件上传带表单参数
export function axiosUpload(axios, path, params) {
  const fileFieldName = 'file'
  const formData = new FormData()
  for (const key in params) {
    if (key === fileFieldName) {
      if (Array.isArray(params[key])) {
        params[key].forEach((item) => {
          formData.append(fileFieldName, item)
        })
      }
      else {
        formData.append(fileFieldName, params[key])
      }
    }
    else {
      if (params[key]) {
        formData.append(key, params[key])
      }
    }
  }
  return axiosPost(axios, path, formData)
}

export function axiosDownload(axios, path) {
  axios
    .request({
      url: path,
      method: 'get',
      responseType: 'blob',
    })
    .then((response) => {
      let filename = response.headers['content-disposition'] // 取出文件名字
      if (filename) {
        const index = filename.indexOf('fileName=')
        if (index >= 0) {
          filename = filename.substr(index + 9)
          filename = decodeURI(filename)
        }
        filename = filename.substr(index + 21)
        filename = decodeURI(filename)
      }
      const fileDownload = require('js-file-download')
      fileDownload(response.data, filename)
    })
}

// get请求
export function get(url, params) {
  return createAxiosFromStore()({
    url,
    method: 'get',
    params,
  })
}
// post请求
export function post(url, data) {
  return createAxiosFromStore()({
    url,
    method: 'post',
    data,
  })
}
// post query请求
export function postQuery(url, data) {
  const connectUrl = `${url}?${qs.stringify(data)}`
  return createAxiosFromStore()({
    url: connectUrl,
    method: 'post',
  })
}

// axios的get params参数封装封装
export function axiosParams(type, path, params = {}, config = {}) {
  let paramsStr = ''
  try {
    if (Object.keys(params).length > 0) {
      // 过滤掉空值（null、undefined、空字符串、空数组）
      const filteredParams = {}
      for (const key in params) {
        const value = params[key]
        // 只保留有值的键值对
        if (value !== null && value !== undefined && value !== '' && !(Array.isArray(value) && value.length === 0)) {
          filteredParams[key] = value
        }
      }
      // 原理：通过qs.stringify将params对象序列化为URL参数字符串，然后拼接到请求路径后面
      if (Object.keys(filteredParams).length > 0) {
        paramsStr = `?${qs.stringify(filteredParams)}`
      }
    }
  }
  catch (error) {
    throw new Error(error)
  }
  const connectUrl = `${path}${paramsStr}`
  return createAxiosFromStore()({
    url: connectUrl,
    method: type,
    ...config,
  })
}
