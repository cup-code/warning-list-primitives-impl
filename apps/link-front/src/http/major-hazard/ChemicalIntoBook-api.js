import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'

/* 危化品入库台账 */
// 分页查询危化品
export function getChemistryIntoByPage(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  if (params.inNo) {
    pr += `&inNo=${params.inNo}`
  }
  if (params.chemicalName) {
    pr += `&chemicalName=${encodeURIComponent(params.chemicalName)}`
  }
  if (params.transportUnit) {
    pr += `&transportUnit=${params.transportUnit}`
  }
  if (params.salesCompanyName) {
    pr += `&salesCompanyName=${params.salesCompanyName}`
  }
  if (params.transportCompanyName) {
    pr += `&transportCompanyName=${params.transportCompanyName}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/hazardousgoods/majorhazardChemistry/add/page${pr}`)
}

// 删除危化品
export function chemistryIntoDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `/hazardousgoods/majorhazardChemistry/add/delete/${id}`)
}

export function chemistryIntoAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/hazardousgoods/majorhazardChemistry/add/saveOrUpdate`, params)
}
