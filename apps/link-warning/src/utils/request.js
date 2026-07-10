import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import { clearUserSession } from '@/utils/storage-namespace'
// 创建axios实例
const service = axios.create({
  baseURL: process.env.NODE_ENV !== 'production' ? window.g.BASE_URL_DEV : window.g.BASE_URL_PRO,
  timeout: 20000, // 请求超时时间
})

// request拦截器
service.interceptors.request.use(
  (config) => {
    const authToken = localStorage.getItem('tk')
    const tenantToken = localStorage.getItem('authToken') ? localStorage.getItem('authToken') : ''

    config.headers.Authorization = authToken
    config.headers['X-Link-Tenant'] = tenantToken
    config.headers.clientChannel = 'WEB'

    if (config.method === 'post' || config.method === 'put') {
      config.headers['Content-Type'] = 'application/json;charset=UTF-8'
    }

    return config
  },
  (error) => {
    Promise.reject(error)
  },
)

// response 拦截器
service.interceptors.response.use(
  (response) => {
    /**
     * code为非20000是抛错 可结合自己业务进行修改
     */
    const res = response.data
    // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
    if (res.code == '50008' || res.code == '50012' || res.code == '50014') {
      MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '重新登录', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        clearUserSession()
        window.location.href = '/'
      })
    }
    else if (res.code !== '200') {
      // Message({
      //   message: res.message,
      //   type: 'error',
      //   duration: 5 * 1000
      // })
      return response.data
    }
    else {
      return response.data
    }
  },
  (error) => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000,
    })
    return Promise.reject(error)
  },
)

export default service
