import request from '@/utils/request'
import { post } from '../common/utils'

// 查询事故类型
export function accidentType(data) {
  return request({
    url: '/accidentInvestigation/accidentType',
    method: 'get',
    params: data,
  })
}
/**
 * 事故台账
 */
// 事故台账分页查询
export function accidentAccountPage(data) {
  return request({
    url: '/accidentAccount/accidentAccountPage',
    method: 'get',
    params: data,
  })
}
// 事故台账删除
export function accidentAccountDelete(data) {
  return request({
    url: '/accidentAccount/accidentAccountDelete',
    method: 'get',
    params: data,
  })
}

/**
 * 事故调查
 */
// 事故调查报告
export function accidentInvestigationReportPage(data) {
  return request({
    url: '/accidentInvestigation/accidentInvestigationReportPage',
    method: 'get',
    params: data,
  })
}
// 查询事故编号
export function queryAccidentNumber() {
  return request({
    url: '/accidentInvestigation/queryAccidentNumber',
    method: 'get',
  })
}
// 工伤查询事故编号
export function queryAccidentNumberIn() {
  return request({
    url: '/injuryOnTheJob/queryAccidentNumber',
    method: 'get',
  })
}
// 根据事故编号查询事故详情
export function queryByAccidentNumber(id) {
  return request({
    url: `/accidentInvestigation/queryByAccidentNumber/${id}`,
    method: 'get',
  })
}
// 新增修改调查报告
export function saveSurveyReport(data) {
  return request({
    url: `accidentInvestigation/saveSurveyReport`,
    method: 'post',
    data,
  })
}
// 暂存调查报告
export function temporaryStorageSurveyReport(data) {
  return request({
    url: `accidentInvestigation/temporaryStorageSurveyReport`,
    method: 'post',
    data,
  })
}

// 查询事故调查详情（事故调查报告的查看只传id）
export function accidentDetails(data) {
  return request({
    url: '/accidentInvestigation/accidentDetailsById',
    method: 'get',
    params: data,
  })
}

// 查询事故调查详情（事故调查报告的审批传递id和handlerId）
export function accidentDetailsShenpi(data) {
  return request({
    url: '/accidentInvestigation/accidentDetails',
    method: 'get',
    params: data,
  })
}

// 以最后一个事故调查为准，返回调查详情和多审核信息
export function getAccidentInvestigationDetails(data) {
  return request({
    url: `/accidentInvestigation/getAccidentInvestigationDetails/${data.accidentId}`,
    method: 'get',
    params: {},
  })
}

// 查询受伤人员详情
export function queryPersonnelDetails(data) {
  return request({
    url: '/injuryOnTheJob/queryPersonnelDetails',
    method: 'get',
    params: data,
  })
}

// 事故调查审批列表
export function surveyApprovalPage(data) {
  return request({
    url: '/accidentInvestigation/surveyApprovalPage',
    method: 'get',
    params: data,
  })
}

// 事故调查报告审批记录(旧版)
// export function approvalRecordPage(data) {
//   return request({
//     url: '/accidentInvestigation/approvalRecordPage',
//     method: 'get',
//     params: data
//   })
// }
// 事故调查报告审批记录
export function approvalRecordPage(data) {
  return request({
    url: '/accidentApproval/approvalRecordPage',
    method: 'get',
    params: data,
  })
}
// 上报事故
export function reportingAccidents(data) {
  return request({
    url: '/accidentInvestigation/reportingAccidents',
    method: 'post',
    data,
  })
}
// 事故调查审批（旧版）
export function reportApproval(data) {
  return request({
    url: '/accidentInvestigation/reportApproval',
    method: 'get',
    params: data,
  })
}
// 事故调查审批（新版，首页待办审批）
export function reportApprovalNew(data) {
  return request({
    url: '/accidentApproval/reportApprovalNew',
    method: 'post',
    params: data,
  })
}
// 事故调查报告删除
export function accidentInvestigationDelete(data) {
  return request({
    url: '/accidentInvestigation/accidentInvestigationDelete',
    method: 'get',
    params: data,
  })
}

/**
 * 工伤管理
 */
// 查询工伤信息列表
export function workInjuryManagement(data) {
  return request({
    url: '/injuryOnTheJob/workInjuryManagement',
    method: 'get',
    params: data,
  })
}

// 查询工伤信息
export function querWorkInjury(data) {
  return request({
    url: '/injuryOnTheJob/querWorkInjury',
    method: 'get',
    params: data,
  })
}
// 根据事故编号查询事故信息
export function accidentInformationByAccidentNumber(data) {
  return request({
    url: '/injuryOnTheJob/accidentInformationByAccidentNumber',
    method: 'post',
    data,
  })
}

// 查询工伤通知书
export function queryWorkInjuryNotice(data) {
  return request({
    url: '/injuryOnTheJob/queryWorkInjuryNotice',
    method: 'post',
    data,
  })
}

// 保存工伤通知书
export function saveWorkInjuryNotice(data) {
  return request({
    url: '/injuryOnTheJob/saveWorkInjuryNotice',
    method: 'post',
    data,
  })
}

// 查询停工留薪分类目录树
export function qureyTree(data) {
  return request({
    url: '/injuryOnTheJob/qureyTree',
    method: 'post',
    data,
  })
}

// 新增修改工伤信息
export function saveInjuryOnTheJob(data) {
  return request({
    url: '/injuryOnTheJob/saveInjuryOnTheJob',
    method: 'post',
    data,
  })
}

// 删除工伤信息
export function deleteInjuryonTheJob(data) {
  return request({
    url: '/injuryOnTheJob/deleteInjuryOnTheJob',
    method: 'get',
    params: data,
  })
}

// 修改目录
export function modifyDirectory(data) {
  return request({
    url: '/injuryOnTheJob/modifyDirectory',
    method: 'post',
    data,
  })
}

// 查询上级目录
export function querySuperiorDirectory(data) {
  return request({
    url: '/injuryOnTheJob/querySuperiorDirectory',
    method: 'get',
    params: data,
  })
}

// 新增一级目录
export function addAFirstLevelDirectory(data) {
  return request({
    url: '/injuryOnTheJob/addAFirstLevelDirectory',
    method: 'post',
    data,
  })
}

// 新增其他目录
export function addOtherDirectories(data) {
  return request({
    url: '/injuryOnTheJob/addOtherDirectories',
    method: 'post',
    data,
  })
}

// 删除目录
export function deleteDirectoryById(data) {
  return request({
    url: '/injuryOnTheJob/deleteDirectoryById',
    method: 'get',
    params: data,
  })
}

// 事故性质统计
export function accidentNatureStatistics(data) {
  return request({
    url: '/injuryOnTheJob/accidentNatureStatistics',
    method: 'post',
    data,
  })
}

// 各部门事故占比
export function proportionOfAccidentsInEachDepartment(data) {
  return request({
    url: '/injuryOnTheJob/proportionOfAccidentsInEachDepartment',
    method: 'post',
    data,
  })
}

// 事故分类统计
export function accidentClassificationStatistics(params) {
  return post(`injuryOnTheJob/accidentClassificationStatistics`, params)
}
