import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'

// 重大危险源档案列表页
export function getDangerSourceByPage(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}&isPage=${params.isPage}`
  // 	危险级别
  if (params.hazardLevel) {
    pr += `&hazardLevel=${params.hazardLevel}`
  }
  // 重大危险源名称
  if (params.unifyName) {
    pr += `&unifyName=${params.unifyName}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `/major/hazardDoc/page${pr}`)
}
export function dangerSourceDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `/major/hazardDoc/${id}`)
}
export function getDangerSourceDetail(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `/major/hazardDoc/details/${id}`)
}
export function dangerSourceAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/major/hazardDoc/saveOrUpdate`, params)
}

export function getDropList() {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `/major/categoryQuantity/dropList`)
}

export function riskTableRowDel(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `/major/hazardDoc/risk/${id}`)
}

// 分页查询危废品
export function getMajorRubbish(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 	年份
  if (params.year) {
    pr += `&year=${params.year}`
  }
  // 	废物名称/代码
  if (params.queryKey) {
    pr += `&queryKey=${params.queryKey}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `major/rubbish/page${pr}`)
}

// 新增or更新危废品
export function saveMajorRubbish(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `major/rubbish/saveOrUpdate`, params)
}

// 删除数据危废品
export function delMajorRubbish(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `major/rubbish/${id}`)
}

// 下拉危废品
export function getMajorRubbishAll(year) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `major/rubbish/selectDrop?year=${year}`)
}

// 分页查询危废品入库
export function getMajorRubbishPut(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`

  // 年份
  if (params.year) {
    pr += `&year=${params.year}`
  }

  // 申请人(name)
  if (params.applyPersonName) {
    pr += `&applyPersonName=${params.applyPersonName}`
  }

  // 申请部门
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }

  // 废物名称
  if (params.rubbishName) {
    pr += `&rubbishName=${params.rubbishName}`
  }

  // 废物来源
  if (params.rubbishSource) {
    pr += `&rubbishSource=${params.rubbishSource}`
  }

  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `major/rubbishPut/page${pr}`)
}

// 新增or更新危废品入库
export function saveMajorRubbishPut(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `major/rubbishPut/saveOrUpdate`, params)
}

// 删除数据危废品入库
export function delMajorRubbishPut(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `major/rubbishPut/${id}`)
}

// 危废品入库审批
export function examMajorRubbishPut(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `major/rubbishPut/examine`, params)
}

// 危废品入库消息推送
export function pushMajorRubbishPut(params) {
  let pr = `?`

  // 推送类型
  if (params.msgType) {
    pr += `&msgType=${params.msgType}`
  }

  // 推送消息
  if (params.msgContent) {
    pr += `&msgContent=${params.msgContent}`
  }

  // 推送人
  if (params.ids) {
    pr += `&ids${encodeURIComponent('[]')}=${params.ids}`
  }

  pr = pr.replace('?&', '?')
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `major/rubbishPut/msgPush${pr}`)
}

// 分页查询监测绑定信息
export function mhsBindInfo(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `mhs/bind/hazardBindInfoPaging`, params)
}

// 查询绑定的摄像头信息
export function mhsBindCamera(params) {
  const axios = createAxiosFromStore()
  let pr = '?'
  for (const key in params) {
    if (params[key] != undefined) {
      pr += `&${key}=${encodeURIComponent(params[key])}`
    }
  }
  pr = pr.replace('?&', '?')
  return axiosPost(axios, `mhs/bind/getBindCameraInfo${pr}`)
}

// 保存摄像头绑定信息
export function mhsBindCameraSave(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `mhs/bind/saveCameraBindInfo`, params)
}

// 删除危险源下单个摄像头
export function deleteBindCameraById(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `mhs/bind/${id}`)
}

// 重要危险源分页查询
export function getImportantSourceByPage(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}&isPage=${params.isPage}`
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  // 危险级别
  if (params.hazardLevel || params.hazardLevel == 0) {
    pr += `&hazardLevel=${params.hazardLevel}`
  }
  // 风险区域
  if (params.riskRegion) {
    pr += `&riskRegion=${params.riskRegion}`
  }
  // 来源
  if (params.source) {
    pr += `&source=${params.source}`
  }
  // 单元名称
  if (params.unitName) {
    pr += `&unitName=${params.unitName}`
  }
  // 类型
  if (params.unitType) {
    pr += `&unitType=${params.unitType}`
  }

  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `major/hazardDoc/importantPage${pr}`)
}

// 重要危险源详情查询
export function getImportantSourceDetail(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `major/hazardDoc/importantDetails/${id}`)
}

// 重要危险源保存or新增
export function importantSourceAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `major/hazardDoc/importantSaveOrUpdate`, params)
}

// 查询危险源下的所有组态
export function getBindHmiByHazardId(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `mhs/hmi/getHmiByHazardId?hazardId=${id}`)
}
// 删除危险源下某组态
export function deleteBindHmiById(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `mhs/hmi/${id}`)
}
// 保存组态绑定讯息
export function saveBindHmi(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `mhs/hmi/save`, params)
}
