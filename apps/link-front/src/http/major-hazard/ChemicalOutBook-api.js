import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'

/* 危化品出库台账 */
// 分页查询危化品
export function getChemistryOutByPage(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  if (params.chemical) {
    pr += `&chemical=${params.chemical}`
  }
  if (params.outNo) {
    pr += `&outNo=${encodeURIComponent(params.outNo)}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/hazardousgoods/majorhazardChemistry/out/page${pr}`)
}

// 删除危化品
export function chemistryOutDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `/hazardousgoods/majorhazardChemistry/out/delete/${id}`)
}

export function chemistryOutAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/hazardousgoods/majorhazardChemistry/out/saveOrUpdate`, params)
}
