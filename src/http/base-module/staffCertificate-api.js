import { axiosUtil } from 'link-sdk'

const {
  createAxiosFromStore,
  get,
  post,
  axiosDelete,
} = axiosUtil

// 人员证照  begin
// 分页查询证照
export function getLicenseCategoryList(params) {
  return get(`license/category/pageQuery`, params)
}
// 保存证照类型
export function saveLicenseType(params) {
  return post(`license/type/saveOrUpdate`, params)
}
// 删除证照类型
export function deleteLicenseType(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `license/type/removeById/${id}`)
}
// 保存证照
export function saveLicense(params) {
  return post(`license/category/saveOrUpdate`, params)
}
// 删除证照
export function deleteLicense(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `license/category/removeById/${id}`)
}
// 查询所有证照类型
export function getAllLicenseType() {
  return get(`license/type/all`)
}
// 查询指定类型下的证照类别
export function getLicenseByTypeId(typeId) {
  return get(`license/category/getByTypeId/${typeId}`)
}

// 人员证照  end
