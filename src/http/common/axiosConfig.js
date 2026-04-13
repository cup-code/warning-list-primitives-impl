import axios from 'axios'
import router from '@/router/index'

export function createAxiosAuthorization(baseUrl, authToken, contentType) {
  const headers = {
    clientChannel: 'WEB',
  }
  if (authToken) {
    headers.Authorization = authToken
  }
  if (contentType === 'formData') {
    headers['Content-Type'] = 'multipart/form-data'
  }
  else if (contentType === 'formUrlencoded') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
  }
  else {
    headers['Content-Type'] = 'application/json'
  }
  const http = axios.create({
    baseURL: baseUrl,
    headers,
  })
  http.interceptors.response.use(
    (res) => {
      if (res.data.code === 401) {
        setTimeout(() => {
          router.push({
            path: '/login',
          })
        }, 4000)
      }
      return res
    },
    (err) => {
      return err
    },
  )
  return http
}
