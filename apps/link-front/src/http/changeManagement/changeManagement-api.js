import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '../common/utils'

// 获取变更详情(验收详情)
export function getChangeDetail(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `changeApply/details/${id}`)
}

// 查询变更申请列表
export function getchangeManagementList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 关键字
  if (params.keyQuery) {
    pr += `&keyQuery=${params.keyQuery}`
  }
  // 变更状态
  if (params.changeStatus || params.changeStatus === 0) {
    pr += `&changeStatus=${params.changeStatus}`
  }
  // 变更等级
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }

  return axiosGet(axios, `changeApply/page?${pr}`)
}

// 确认申请变更
export function confirmApplication(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `changeApply/saveOrUpdate`, params)
}

// 获取申请基本详情
export function getapplyDetail(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `changeApply/applyDetails/${id}`)
}

// 删除变更详情
export function deleteChange(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `changeApply/${id}`)
}

// 查询四新评审列表
export function getIVNewReviewList(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 项目名称
  if (params.keyQuery) {
    pr += `&keyQuery=${params.keyQuery}`
  }
  // 申请部门
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  // 审批状态
  if (params.reviewStatus || params.reviewStatus === 0) {
    pr += `&reviewStatus=${params.reviewStatus}`
  }

  return axiosGet(axios, `changeReview/page?${pr}`)
}
// 获取四新评审详情
export function getChangeReviewDetail(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `changeReview/details/${id}`)
}

// 四新评审：问题整改
export function saveProblemRectification(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `changeReview/saveOrUpdate`, params)
}

// 四新评审：评审完毕
export function saveReviewFinish(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `changeReview/reviewFinish`, params)
}

// 删除安全评审验收问题
export function deleteCheckQuestion(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `changeReview/checkQuestion/${id}`)
}

// 删除危险分析
export function deleteHazardAnalyse(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `changeReview/hazardAnalyse/${id}`)
}

// 验收问题整改
export function saveOrAddCheck(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `changeApply/saveOrAddCheck`, params)
}

// 确认验收
export function saveCheckFinish(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `changeApply/checkFinish`, params)
}

export function uploadFileList(data) {
  // 多文件上传
  const formData = new FormData()
  for (const key in data) {
    if (key === 'files') {
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

// 查询文件集
export function getByEntityId(entityId) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `commonFile/getByEntityId?entityId=${entityId}`)
}

// 变更统计
export function getChangeStatistics(params) {
  const axios = createAxiosFromStore()
  const pr = `applyDateType=${params.applyDateType}&questionDateType=${params.questionDateType}`
  return axiosGet(axios, `changeApply/statistics?${pr}`)
}

// 变更配置
export function saveChangeConfiguration(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `changeRequestConfiguration/save`, params)
}
// 获取配置
export function getChangeConfiguration() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `changeRequestConfiguration/getAll`)
}
