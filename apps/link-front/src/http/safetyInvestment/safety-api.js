import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
// 安全生产
// 分页查询安全投入计划
export function getSafetyInvestment(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `safetyInvestment/plan/pageQuery`, params)
}
// 删除安全投入计划
export function delSafetyInvestment(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `safetyInvestment/plan/delete/${id}`)
}
// 新增修改
export function addSafetyInvestment(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `safetyInvestment/plan/addOrUpdate`, params)
}
// 查询安全投入计划
export function getSafeInvestment(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `safetyInvestment/plan/getById/${id}`)
}
// 安全投入费用记录表
// 分页查询
export function getSafetyCost(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `safetyInvestment/cost/pageQuery`, params)
}
// 删除
export function delSafetyCost(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `safetyInvestment/cost/delete/${id}`)
}
// 新增
export function addSafetyCost(data) {
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
  return axiosPost(axios, `safetyInvestment/cost/addOrUpdate`, formData)
}
//   查询
export function getSafeCostId(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `safetyInvestment/cost/getById?id=${id}`)
}
