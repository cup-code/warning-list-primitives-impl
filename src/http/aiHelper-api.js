import { createAxiosAuthorization } from './common/axiosConfig'
import { axiosPost } from './common/utils'

// // 智能助手
export function getAiHelper(params) {
  const baseUrl = 'https://dashscope.aliyuncs.com'
  const authToken = 'Bearer sk-372932a37c4141e9b42793da85c856b2'
  const axios = createAxiosAuthorization(baseUrl, authToken)
  return axiosPost(axios, '/api/v1/apps/4119a4f6b5844e19904ef2bb0bc94a49/completion', params)
}
