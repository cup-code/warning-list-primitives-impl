import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
} from './common/utils'

// 工单回执
export function fireControlReceipt(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'fireControl/workOrderReceipt/receipt', params)
}

// 工单统计
export function getFireStat(params) {
  const axios = createAxiosFromStore()
  let pr = '?'
  // 年份
  if (params.year) {
    pr += `&year=${params.year}`
  }
  // 月份
  if (params.month) {
    pr += `&month=${params.month}`
  }
  pr = pr.replace('?&', '?')
  return axiosGet(axios, `fireControl/statistics${pr}`)
}

// 以下是 拓明提供的接口
// 消防点位分页查询
export function fireFightingPoint(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 报警编码
  if (params.code) {
    pr += `&code=${params.code}`
  }
  // 归属部门
  if (params.department) {
    pr += `&department=${params.department}`
  }
  // 是否生成工单
  if (params.generateWorkOrder || params.generateWorkOrder === false) {
    pr += `&generateWorkOrder=${params.generateWorkOrder}`
  }
  // 是否地图标注
  if (params.isDrawed || params.isDrawed === false) {
    pr += `&isDrawed=${params.isDrawed}`
  }
  return axiosPost(axios, `fireControl/fireFightingPoint/fireFightingPointPage?${pr}`)
}
// 消防点位查询全部--安环一张图使用的
export function getAllFirePointFn(params = {}) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosPost(axios, `fireControl/fireFightingPoint/fireFightingPoint${reqStr}`)
}
// 消防点位查看
export function firePointById(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `fireControl/fireFightingPoint/fireFightingPointQuery?id=${id}`)
}
// 消防点位新增
export function firePointAdd(params) {
  const axios = createAxiosFromStore()
  let pr = '?'
  for (const key in params) {
    if (params[key] != undefined) {
      pr += `&${key}=${encodeURIComponent(params[key])}`
    }
  }
  pr = pr.replace('?&', '?')
  return axiosPost(axios, `fireControl/fireFightingPoint/newFireFightingPoint${pr}`)
}
// 消防点位编辑
export function firePointEdit(params) {
  const axios = createAxiosFromStore()
  let pr = '?'
  for (const key in params) {
    if (params[key] != undefined) {
      pr += `&${key}=${encodeURIComponent(params[key])}`
    }
  }
  pr = pr.replace('?&', '?')
  return axiosPost(axios, `fireControl/fireFightingPoint/fireFightingPointRevise${pr}`)
}
// 消防点位删除
export function delFirePointById(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `fireControl/fireFightingPoint/fireFightingPointDelete?id=${id}`)
}
// 消防主机运行记录
export function getRunReords(params) {
  const axios = createAxiosFromStore()
  let pr = '?'
  for (const key in params) {
    if (params[key] != undefined) {
      pr += `&${key}=${encodeURIComponent(params[key])}`
    }
  }
  pr = pr.replace('?&', '?')
  return axiosGet(axios, `fireControl/fireFightingRecords${pr}`)
}
// 工单列表查询
export function getFireOrderList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`

  // 所属部门
  if (params.department) {
    pr += `&department=${params.department}`
  }
  // 工单编号
  if (params.workOrderCode) {
    pr += `&workOrderCode=${params.workOrderCode}`
  }

  return axiosGet(axios, `fireControl/workOrderManagement?${pr}`)
}
// 查询回执列表
export function getBackList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`

  // 所属部门
  if (params.department) {
    pr += `&department=${params.department}`
  }
  // 回执状态
  if (params.receiptStatus || params.receiptStatus === 0) {
    pr += `&receiptStatus=${params.receiptStatus}`
  }
  // 工单编号
  if (params.workOrderCode) {
    pr += `&workOrderCode=${params.workOrderCode}`
  }
  // 工单类型
  if (params.workOrderType) {
    pr += `&workOrderType=${params.workOrderType}`
  }
  return axiosGet(axios, `fireControl/workOrderReceipt/page?${pr}`)
}
// 工单回执查询全部--安环一张图使用的
export function getAllBackListFn(params = {}) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `fireControl/workOrderReceipt/getAll${reqStr}`)
}
// 查询回执详情
export function getBackInfoById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `fireControl/workOrderReceipt/detail/${id}`)
}
// 工单回执转办
export function fireBackTransfer(params) {
  const axios = createAxiosFromStore()
  let pr = `todoTaskId=${params.todoTaskId}`
  // 	转办理由
  if (params.transferReason) {
    pr += `&transferReason=${params.transferReason}`
  }
  // 转办人姓名
  if (params.transferToUserFullName) {
    pr += `&transferToUserFullName=${params.transferToUserFullName}`
  }
  // 转办人id
  if (params.transferToUserId) {
    pr += `&transferToUserId=${params.transferToUserId}`
  }
  return axiosGet(axios, `fireControl/workOrderReceipt/transfer?${pr}`)
}
// 公共处理文件接口 上传&回显
export function uploadFileList(data) {
  // 多文件上传
  const formData = new FormData()
  for (const key in data) {
    if (key === 'files' && data.files != undefined) {
      data.files.forEach((item) => {
        formData.append('file', item)
      })
    }
    else {
      if (data[key] !== undefined) {
        formData.append(key, data[key])
      }
    }
  }
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/commonFile/uploadMulti/V2`, formData)
}
// 公共处理文件接口 上传&回显
export function uploadFile(data) {
  // 多文件上传
  const formData = new FormData()
  for (const key in data) {
    if (key === 'files' && data.files != undefined) {
      data.files.forEach((item) => {
        formData.append('file', item)
      })
    }
    else {
      if (data[key] !== undefined) {
        formData.append(key, data[key])
      }
    }
  }
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/sys/uploadFileList`, formData)
}

export function uploadBase64(data) {
  const formData = new FormData()
  formData.append('fileType', data.fileType)
  formData.append('base64Img', data.base64Img)
  const axios = createFormDataAxios()
  return axiosPost(axios, `/sys/uploadBase64Img`, formData)
}

export function importFileByID(entityId) {
  // 文件回显：根据实体id查询文件集
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/commonFile/getByEntityId?entityId=${entityId}`)
}

// 安全标准化库具体项删除
export function deleteSafeLibEvalItem(params) {
  return postQuery(`fireControl/safeLibEval/deleteItem`, params)
}
// 安全标准化库类别删除
export function deleteSafeLibEvalType(params) {
  return post(`fireControl/safeLibEval/deleteType?id=${params}`)
}
// 安全标准化库类别查询
export function getAllSafeLibEvalType(params) {
  return get(`fireControl/safeLibEval/getAllType`, params)
}
// 安全标准化库具体项详情
export function getByIdSafeLibEvalItem(params) {
  return get(`fireControl/safeLibEval/getByIdItem`, params)
}
// 安全标准化库具体项分页查询
export function pageQuerySafeLibEvalItem(params) {
  return get(`fireControl/safeLibEval/pageQueryItem`, params)
}
// 具体人员安全标准化自评分页查询
export function pageQuerySafeLibEvalItemByUser(params) {
  return get(`fireControl/safeLibEval/pageQueryItemByUser`, params)
}
// 自评台账分页查询（安环部查所有已自评的数据）
export function pageQuerySafeLibEvalItemByUserAccount(params) {
  return get(`fireControl/safeLibEval/pageQueryItemByUserAccount`, params)
}
// 安全标准化库具体项新增修改
export function saveOrUpdateSafeLibEvalItem(params) {
  return post(`fireControl/safeLibEval/saveOrUpdateItem`, params)
}
// 具体人员安全标准化自评修改
export function saveOrUpdateSafeLibEvalItemByUser(params) {
  return post(`fireControl/safeLibEval/saveOrUpdateItemByUser`, params)
}
// 安全标准化库类别新增修改
export function saveOrUpdateSafeLibEvalType(params) {
  return post(`fireControl/safeLibEval/saveOrUpdateType`, params)
}
// 自评结论；只有传公司id时候才有一个公司的自评结论
export function getEvalResult(params) {
  return get(`fireControl/safeLibEval/getEvalResult`, params)
}

// 测点编码导入
export function importMeasurementPointEode(params) {
  const axios = createFormDataAxios()
  return axiosUpload(axios, '/excel/importData/fireFightingPointImport', params)
}
