import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'

/* 报警设置 */
// 保存报警设置
export function noticSetSave(params) {
  const axios = createAxiosFromStore()
  const reqData = {
    alarmContacts: JSON.stringify(params.alarmContacts),
    earlyWarningContacts: JSON.stringify(params.earlyWarningContacts),
    earlyWarningLimit: params.earlyWarningLimit,
    businessType: params.businessType ? params.businessType : '1',
    companyId: params.companyId,
  }
  if (params.id) {
    reqData.id = params.id
  }
  return axiosPost(axios, `alarmSettings/saveOrUpdate`, reqData)
}

// 查询报警设置
export function getNoticSet(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `alarmSettings/query?companyId=${id}`)
}
