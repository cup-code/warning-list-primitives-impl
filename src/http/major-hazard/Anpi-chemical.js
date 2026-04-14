import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosPut,
  axiosUpload,
  createAxiosFromStore,
  createFormDataAxios,
  createFormUrlencodedAxios,
} from '@/http/common/utils'

export function InspectionRecordIMPORT(data, type) {
  // Excel导入
  const formData = new FormData()
  for (const key in data) {
    if (key === 'file') {
      formData.append('file', data[key])
    }
    else {
      if (data[key] !== undefined) {
        formData.append(key, data[key])
      }
    }
  }
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/excel/importData/${type}`, formData)
}

/* 危化品清单 */
export function getChemistryListByPage(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  if (params.queryKey) {
    pr += `&queryKey=${params.queryKey}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/major/chemistry/page${pr}`)
}
export function chemistryListDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `/major/chemistry/${id}`)
}
export function chemistryListAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/major/chemistry/saveOrUpdate`, params)
}

// 危化品名称临界值
export function getCriticalityByNameByPage(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}&isPage=${params.isPage}&isQuantity=${params.isQuantity}`
  if (params.queryKey) {
    pr += `&queryKey=${params.queryKey}`
  }
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `/major/chemistry/selectArrQuantity/${pr}`)
}
export function CriticalityByNameDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `/major/chemistry/deleteQuantity/${id}`)
}
export function CriticalityByNameAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPut(
    axios,
    `/major/chemistry/updateQuantity?id=${params.id}&quantity=${params.quantity}`,
  )
}

// 危化品类别临界值
export function getCriticalityByTypeByPage(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.harmCategory) {
    pr += `&harmCategory=${params.harmCategory}`
  }
  if (params.key) {
    pr += `&key=${params.key}`
  }
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `/major/categoryQuantity/page${pr}`)
}
export function CriticalityByTypeDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `/major/categoryQuantity/${id}`)
}
export function CriticalityByTypeAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/major/categoryQuantity/saveOrUpdate`, params)
}

// 毒性气体校正系数  类别 名称
export function getGasByPage(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}&isPage=${params.isPage}&businessCategory=${params.businessCategory}`
  if (params.toxicityCharacter) {
    pr += `&toxicityCharacter=${params.toxicityCharacter}`
  }
  if (params.toxicityName) {
    pr += `&toxicityName=${params.toxicityName}`
  }
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `/major/toxicity/page${pr}`)
}
export function GasDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `/major/toxicity/${id}`)
}
export function GasAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/major/toxicity/saveOrUpdate`, params)
}

// 危化品导入
export function importChemistry(params) {
  const axios = createFormDataAxios()
  return axiosUpload(axios, '/excel/importData/Chemistry', params)
}
