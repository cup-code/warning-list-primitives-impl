import {
  axiosGet,
  createAxiosFromStore,
} from '@/http/common/utils'
// 分页查询指定公司部门及年月的执行纪录
export function getReportTable(params) {
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  if (params.month) {
    pr += `&month=${params.month}`
  }
  if (params.year) {
    pr += `&year=${params.year}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `inspectionPlanScheduleRecord/queryPageByDepartmentAndDate${pr}`)
}
