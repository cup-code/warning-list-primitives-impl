import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'

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
export function importFileByID(entityId) {
  // 文件回显：根据实体id查询文件集
  const axios = createAxiosFromStore()
  return axiosPost(axios, `/commonFile/getByEntityId?entityId=${entityId}`)
}
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

// 三同时卫生
export function getHygieneThree(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.buildUnit) {
    pr += `&buildUnit=${params.buildUnit}`
  }
  if (params.projectName) {
    pr += `&projectName=${params.projectName}`
  }
  if (params.threeType) {
    pr += `&threeType=${params.threeType}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/hygieneThree/page${pr}`)
}
export function removeHygieneThree(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `occupation/hygieneThree/${id}`)
}
export function addHygieneThree(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `occupation/hygieneThree/saveOrUpdate`, params)
}

// 三同时报告
export function getThreeReportList() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/hygieneThree/arrList`)
}
// 职业危害因素辨识
export function getHygieneIdentification(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.contactUserName) {
    pr += `&contactUserName=${params.contactUserName}`
  }
  if (params.harmFactor) {
    pr += `&harmFactor=${params.harmFactor}`
  }
  if (params.identifyDate) {
    pr += `&identifyDate=${params.identifyDate}`
  }
  if (params.postName) {
    pr += `&postName=${params.postName}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.workContent) {
    pr += `&workContent=${params.workContent}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/harmFactor/page${pr}`)
}
export function removeHygieneIdentification(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `occupation/harmFactor/${id}`)
}
export function addHygieneIdentification(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `occupation/harmFactor/saveOrUpdate`, params)
}

// 职业危害因素监测报告
export function getMonitorReport(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.monitorDate) {
    pr += `&monitorDate=${params.monitorDate}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/monitorReport/page${pr}`)
}
export function removeMonitorReport(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `occupation/monitorReport/${id}`)
}
export function getThirdBookArrList() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/thirdBook/arrList`)
}
export function addMonitorReport(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `occupation/monitorReport/saveOrUpdate`, params)
}

// 职业危害因素检测
export function getFactorTest(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.testingDate) {
    pr += `&testingDate=${params.testingDate}`
  }
  if (params.testingPostName) {
    pr += `&testingPostName=${params.testingPostName}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/harmFactorTesting/page${pr}`)
}
export function removeFactorTest(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `occupation/harmFactorTesting/${id}`)
}
export function addFactorTest(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `occupation/harmFactorTesting/saveOrUpdate`, params)
}

// 第三方单位台账
export function getThirdBook(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.unitName) {
    pr += `&unitName=${params.unitName}`
  }
  if (params.unitType) {
    pr += `&unitType=${params.unitType}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/thirdBook/page${pr}`)
}
export function removeThirdBook(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `occupation/thirdBook/${id}`)
}
export function addThirdBook(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `occupation/thirdBook/saveOrUpdate`, params)
}

// 职业健康管理方案
export function getHealthyPlan(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.filledNameBy) {
    pr += `&filledNameBy=${params.filledNameBy}`
  }
  if (params.implementationUnit) {
    pr += `&implementationUnit=${params.implementationUnit}`
  }
  if (params.programmeDate) {
    pr += `&programmeDate=${params.programmeDate}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/healthyPlan/page${pr}`)
}
export function removeHealthyPlan(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `occupation/healthyPlan/${id}`)
}
export function addHealthyPlan(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `occupation/healthyPlan/saveOrUpdate`, params)
}
export function getHealthyPlanArrList() {
  // 查询外部检测报告列表
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/monitorReport/arrList`)
}
export function getPlanAlarm() {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `occupation/healthyPlan/planAlarm`)
}

// 体检记录台账
export function getExaminationN(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}&year=3`
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  if (params.postName) {
    pr += `&postName=${params.postName}`
  }
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }
  if (params.userName) {
    pr += `&userName=${params.userName}`
  }
  if (params.harmFactor) {
    pr += `&harmFactor=${params.harmFactor}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/examinationBook/pageYear${pr}`)
}

// 体检记录台账---详情
export function getExaminationBookDetails(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.harmFactor) {
    pr += `&harmFactor=${params.harmFactor}`
  }
  if (params.userId) {
    pr += `&userId=${params.userId}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/examinationBook/getExaminationBookDetails${pr}`)
}

// 体检记录列表
export function getExaminationBook(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.postName) {
    pr += `&postName=${params.postName}`
  }
  if (params.userName) {
    pr += `&userName=${params.userName}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.harmFactor) {
    pr += `&harmFactor=${params.harmFactor}`
  }
  if (params.examinationNature) {
    pr += `&examinationNature=${params.examinationNature}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/examinationBook/page${pr}`)
}
export function removeExaminationBook(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `occupation/examinationBook/${id}`)
}
export function detailsExaminationBook(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/examinationBook/details/${id}`)
}
export function addExaminationBook(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `occupation/examinationBook/saveOrUpdate`, params)
}

export function getUserPostName(userId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/getById/${userId}`)
}

// 高温作业
export function getHotWork(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.postName) {
    pr += `&postName=${params.postName}`
  }
  if (params.moon) {
    pr += `&moon=${params.moon}`
  }
  if (params.year) {
    pr += `&year=${params.year}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/temperature/days/page${pr}`)
}
// 删除高温作业
export function removeHotWork(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `occupation/temperature/${id}`)
}

// 高温调查、审批记录
export function getSurveyApprovalList(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  if (params.examineStatus) {
    pr += `&examineStatus=${params.examineStatus}`
  }
  if (params.postId) {
    pr += `&postId=${params.postId}`
  }
  if (params.reportWriterDate) {
    pr += `&reportWriterDate=${params.reportWriterDate}`
  }
  if (params.year) {
    pr += `&year=${params.year}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/temperature/page${pr}`)
}

// 新增or更新高温作业
export function addHotWork(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `occupation/temperature/saveOrUpdate`, params)
}

// 分页劳保计划
export function getLaborPlanList(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.planEndDate) {
    pr += `&planEndDate=${params.planEndDate}`
  }
  if (params.planName) {
    pr += `&planName=${params.planName}`
  }
  if (params.planStartDate) {
    pr += `&planStartDate=${params.planStartDate}`
  }
  if (params.postId) {
    pr += `&postId=${params.postId}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `Labor/plan/page${pr}`)
}

// 新增or更新劳保计划
export function addLaborPlan(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `Labor/plan/saveOrUpdate`, params)
}

// 分页劳保领用记录
export function getLaborRequisitionRecordList(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.laborRecordRef) {
    pr += `&laborRecordRef=${params.laborRecordRef}`
  }
  if (params.planName) {
    pr += `&planName=${params.planName}`
  }
  if (params.postName) {
    pr += `&postName=${params.postName}`
  }
  if (params.useDate) {
    pr += `&postId=${params.useDate}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `Labor/record/page${pr}`)
}

// 获取下拉劳保计划
export function getPlanList() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `Labor/plan/drop`)
}

// 新增or更新劳保领用记录
export function addLaborRecord(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `Labor/record/saveOrUpdate`, params)
}
