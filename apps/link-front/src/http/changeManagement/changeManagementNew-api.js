import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '../common/utils'

// 通过待办跳转效果评估详情
export function getAssessContentInfo(params) {
  const axios = createAxiosFromStore()
  const pr = `applyId=${params.applyId}&contentId=${params.contentId}`
  return axiosGet(axios, `changeApplyNew/getAssessContent?${pr}`)
}

// 上传执行附件
export function uploadExecuteFile(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `changeApplyNew/uploadExecuteFile`, params)
}
