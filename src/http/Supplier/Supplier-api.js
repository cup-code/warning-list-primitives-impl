import {
  axiosDelete,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
/* 供应商 */
// 分页查询
export function getSupplierByPage(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `info/supplierInfoEntity/pageQuery`, params)
}
// 新增
export function addSupplierCost(data) {
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
  console.log(formData)
  return axiosPost(axios, `info/supplierInfoEntity/addOrUpdate`, formData)
}
// 删除
export function supplierDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `info/supplierInfoEntity/delete/${id}`)
}
