import {
  axiosDelete,
  axiosGet,
  axiosPost,
  axiosUpload,
  createAxiosFromStore,
  createFormDataAxios,
} from './common/utils'

// 查询所有安全投入预算
export function getSafeBudgetAll() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `safetyInvestment/budget/all`)
}

// 分页查询安全投入预算
export function getSafeBudgetPage(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`

  // 预算年度
  if (params.budgetYear) {
    pr += `&budgetYear=${params.budgetYear}`
  }

  // 公司id
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }

  return axiosGet(axios, `safetyInvestment/budget/page?${pr}`)
}

// 根据主键删除安全投入预算
export function deleteSafeBudgetById(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `safetyInvestment/budget/delete/${id}`)
}

// 保存安全投入预算
export function saveSafeBudget(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `safetyInvestment/budget/save`, params)
}

// 查询所有安全投入计划
export function getSafePlanAll() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `safetyInvestment/plan/all`)
}

// 分页查询安全投入计划
export function getSafePlanPage(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`

  // 安全投入分类id
  if (params.safetyInvestmentTypeId) {
    pr += `&safetyInvestmentTypeId=${params.safetyInvestmentTypeId}`
  }

  // 部门id
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }

  return axiosGet(axios, `safetyInvestment/plan/page?${pr}`)
}

// 根据主键删除安全投入计划
export function deleteSafePlanById(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `safetyInvestment/plan/delete/${id}`)
}

// 保存安全投入预算
export function saveSafePlan(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `safetyInvestment/plan/save`, params)
}

// 查询所有安全投入分类
export function getSafeTypeAll() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `safetyInvestment/type/all`)
}

// 根据主键删除安全投入分类
export function deleteSafeTypeById(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `safetyInvestment/type/delete/${id}`)
}

// 保存安全投入分类
export function saveSafeType(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `safetyInvestment/type/save`, params)
}

// 查询所有安全投入记录
export function getSafeRecordAll() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `safetyInvestment/record/all`)
}

// 分页查询安全投入记录
export function getSafeRecordPage(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`

  // 费用产生截止日期
  if (params.endDate) {
    pr += `&endDate=${params.endDate}`
  }
  // 项目名称模糊查询
  if (params.itemName) {
    pr += `&itemName=${params.itemName}`
  }
  // 安全投入分类id
  if (params.safetyInvestmentTypeId) {
    pr += `&safetyInvestmentTypeId=${params.safetyInvestmentTypeId}`
  }
  // 费用产生起始日期
  if (params.startDate) {
    pr += `&startDate=${params.startDate}`
  }

  // 部门id
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }

  return axiosGet(axios, `safetyInvestment/record/page?${pr}`)
}

// 根据主键删除安全投入记录
export function deleteSafeRecordById(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `safetyInvestment/record/delete/${id}`)
}

// 保存安全投入记录
export function saveSafeRecord(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `safetyInvestment/record/save`, params)
}

// 安全投入预算导入
export function importBudget(params) {
  const axios = createFormDataAxios()
  return axiosUpload(axios, '/excel/importData/safetyInvestmentBudgetImport', params)
}
// 安全投入计划导入
export function importPlan(params) {
  const axios = createFormDataAxios()
  return axiosUpload(axios, '/excel/importData/safetyInvestmentPlanImport', params)
}
// 安全投入记录导入
export function importRecord(params) {
  const axios = createFormDataAxios()
  return axiosUpload(axios, '/excel/importData/safetyInvestmentRecordImport', params)
}
// 演练计划导入
export function importDrillPlan(params) {
  const axios = createFormDataAxios()
  return axiosUpload(axios, '/excel/importData/DrillPlan', params)
}
