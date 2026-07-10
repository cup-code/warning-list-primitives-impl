import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from './common/utils'

// 查询当前用户能看到的所有承包商
export function contractorAll() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `contractor/listAll`)
}

// 承包商 分页查询
export function contractorPageQuery(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/pageQuery`, params)
}
// 承包商 新增、修改
export function contractorAddOrUpdate(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/addOrUpdate`, params)
}
// 根据id 查询承包商信息
export function contractorById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `contractor/get/${id}`)
}
// 根据承包商id查询存在/整改问题
export function problemById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `contractor/reaudit/getProblemByContractorId/${id}`)
}
// 申请复核
export function reauditApply(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/reaudit/apply`, params)
}
// 复核
export function reauditDone(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/reaudit/done`, params)
}

// 删除承包商
export function contractorDelete(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `contractor/delete/${id}`)
}
// 分页查询 档案资料库
export function archiveQuery(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/archive/pageQuery`, params)
}
// 分页查询 黑名单
export function blackListQuery(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/blacklist/pageQuery`, params)
}
// 加入黑名单
export function blackListAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/blacklist/add`, params)
}
// 移除黑名单
export function blackListRemove(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `contractor/blacklist/remove/${id}`)
}
// 分页查询 承包商审核列表
export function auditQuery(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/audit/pageQuery`, params)
}
// 承包商审核
export function auditAdd(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/audit/add`, params)
}
// 获取提醒配置
export function getContractorNotice() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `contractor/notice/get`)
}
// 新增或修改提醒配置
export function updateContractorNotice(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/notice/saveOrUpdate`, params)
}
// 查询承包商人员培训、考试记录
export function getContractorEdu(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/edu/pageQuery`, params)
}
// 分页查询承包商人员证照
export function getUserCertificate(params) {
  const axios = createAxiosFromStore()
  // return axiosPost(axios, `contractor/userCertificate/pageQuery`, params)
  return axiosPost(axios, `aqlicense/manage/queryPageInfoContractor`, params)
}
// 新增或修改承包商人员证照
export function updateUserCertificate(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/userCertificate/addOrUpdate`, params)
}
// 获取审核周期
export function getAuditPeriod() {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/auditPeriod/get`)
}
// 新增和修改审核周期
export function updateAuditPeriod(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `contractor/auditPeriod/addOrUpdate`, params)
}
// 获取承包商统计数量
export function getContractorDataCount(deptId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `contractor/data/count?deptId=${deptId}`)
}
// 获取红黄牌的数量
export function getCountBookingsStatistics(deptId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `contractor/data/countBookingsStatistics?deptId=${deptId}`)
}
// 获取不同状态的承包商数量
export function getCountContractorStatus(deptId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `contractor/data/countContractorStatus?deptId=${deptId}`)
}
// 穿透查询指定时间区间指定部门下指定部门类型的考核数量
export function getIncentiveExamineCount(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `incentive/examine/countByDepartType?contractorExamine=${true}&departmentId=${
      params.comDepId
    }&startDate=${params.startDate}&endDate=${params.endDate}`,
  )
}
// 查询指定公司下各部门考核金额排行
export function getIncentiveExamineStatistics(companyId) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `incentive/examine/statistics/departAmount/${companyId}?pageNum=1&pageSize=1000`,
  )
}
// 查询承包商培训考试次数按月统计
export function getContractorAqEduStat(deptId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `aqEduStat/getContractorStat?departmentId=${deptId}`)
}
// 承包商特殊作业数量统计
export function getContractorWorkTicket(deptId) {
  const axios = createAxiosFromStore()
  if (deptId) {
    return axiosGet(axios, `workTicket/countByContractorVO?deptId=${deptId}`)
  }
  else {
    return axiosGet(axios, `workTicket/countByContractorVO`)
  }
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
