import axios from 'axios'
import { Message } from 'element-ui'
import { merge } from 'lodash'
import { getAuthToken, getTenantToken, clearSession } from '@/utils/tab-session'
import qs from 'qs'
import Vue from 'vue'
import router from '@/router'

// 超时时间
axios.defaults.timeout = 100000
// 跨域请求，允许保存cookie
axios.defaults.withCredentials = false
// axios.defaults.headers = {'Content-Type': 'application/json; charset=utf-8'}
axios.defaults.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8'
// 非生产环境 && 开启代理, 接口前缀统一使用[/api]前缀做代理拦截!
const BASE_URL
  = process.env.NODE_ENV !== 'production' ? window.g.BASE_URL_DEV : window.g.BASE_URL_PRO
// 对面暴露的基础请求路径
axios.BASE_URL = BASE_URL

/**
 * 请求拦截
 */
let loading
axios.interceptors.request.use(
  (config) => {
    const authToken = getAuthToken()
    const tenantToken = getTenantToken()

    config.headers.Authorization = authToken
    // zxr 添加 解决分享出去的组态无法加载问题
    if (!authToken) {
      delete config.headers.Authorization
    }
    // zxr 添加end
    config.headers['X-Link-Tenant'] = tenantToken
    config.headers.clientChannel = 'WEB'

    // 请求地址处理
    if (!config.url.startsWith('http')) {
      config.url = BASE_URL + config.url.slice(1)
    }

    const type = config.method
    const defaults = {}
    const arrayFormat = config.headers.arrayFormat || 'indices'
    if (
      type === 'post'
      && config.headers['Content-Type'] === 'application/x-www-form-urlencoded; charset=utf-8'
    ) {
      // post请求参数处理
      config.data = qs.stringify(config.data, {
        allowDots: true,
        arrayFormat,
      })
    }
    else if (type === 'get') {
      // get请求参数处理
      config.params = qs.stringify(config.params, {
        allowDots: true,
        arrayFormat,
      })
      config.params = qs.parse(config.params)
      config.params = merge(defaults, config.params)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

/**
 * 响应拦截
 */
axios.interceptors.response.use(
  (response) => {
    if (loading) {
      loading.close()
    }
    if (response.data && response.data.success === false) {
      Message({
        message: response.data.msg || response.data.message,
        type: 'error',
        showClose: true,
        dangerouslyUseHTMLString: true,
        duration: 3000,
        customClass: 'zZindex',
      })
    }
    return response
  },
  (error) => {
    if (loading) {
      loading.close()
    }
    if (error.response.status === 401) {
      // token 无效或过期，清理会话并跳转登录
      clearSession()
      router.push({ name: 'login' })
    }
    else if (error.response.status === 402 || error.response.status === 403) {
      // 402 未登录或者refresh token过时， 403 账号在其他地方登录
      clearSession()
      router.push({ name: 'login' })
      Message({
        message: error.response.data.msg || error.response.data.exception,
        type: 'error',
        showClose: true,
        dangerouslyUseHTMLString: true,
        duration: 3000,
        customClass: 'zZindex',
      })
    }
    else if (error.response.status === 404) {
      // 路径找不到
      Message({
        message: `404，路径找不到` + `:${error.response.data.path}`,
        type: 'error',
        showClose: true,
        duration: 3000,
      })
    }
    else if (error.response.status === 504) {
      Message({
        message: `网络连接错误` + `:${error.response.data}`,
        type: 'error',
        showClose: true,
        duration: 3000,
        customClass: 'zZindex',
      })
    }
    else {
      Message({
        message:
          error.response.data.msg
          || error.response.data.exception
          || error.response.data
          || error.response
          || error,
        type: 'error',
        showClose: true,
        duration: 5000,
        customClass: 'zZindex',
      })
    }

    return Promise.reject(error)
  },
)

export default axios
