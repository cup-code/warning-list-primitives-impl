/*
 * @Author: xiaorui 安全生产目标与责任部分的接口
 * @Date: 2023-04-24 09:49:24
 * @Last Modified by: xiaorui
 * @Last Modified time: 2023-05-23 10:54:25
 */
import {
  axiosDelete,
  createAxiosFromStore,
  get,
  post,
} from '@/http/common/utils'
// 分页查询责任目标列表
export function getTargetListByPageFn(params = {}) {
  return get(`safetyProduction/target/paging`, params)
}
// 保存制定目标
export function saveTargetFn(data = {}) {
  return post(`safetyProduction/target/add`, data)
}
// 获取单个目标的详情
export function getTargetDetailByIdFn(id) {
  return get(`safetyProduction/target/getById/${id}`)
}
// 修改单个目标
export function updateTargetFn(data = {}) {
  return post(`safetyProduction/target/update`, data)
}
// 签署安全目标责任书
export function signTargetFn(data = {}) {
  return post(`safetyProduction/target/signTarget`, data)
}
// 删除单个目标
export function deleteTargetFn(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `safetyProduction/target/delete/${id}`)
}
// 分页查询目标责任书台账(已签署的列表)
export function getSignedListByPageFn(params = {}) {
  return get(`safetyProduction/standing/paging`, params)
}
// 分页查询目标配置台账
export function getTargetConfigListByPageFn(params = {}) {
  return get(`safetyProduction/target/config/paging`, params)
}
// 保存目标配置
export function saveTargetConfigFn(data = {}) {
  return post(`safetyProduction/target/config/saveOrUpdate`, data)
}
// 通过id查询单条目标配置详情
export function getTargetConfigDetailFn(id) {
  return get(`safetyProduction/target/config/getById/${id}`)
}
// 删除单条目标配置
export function deleteTargetConfigFn(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `safetyProduction/target/config/delete/${id}`)
}
// 分页查询待考核的目标责任制
export function getTargetAssessByPageFn(params = {}) {
  return get(`safetyProduction/exam/paging`, params)
}
// 获取考核信息
export function getAssessDetailByIdFn(data = {}) {
  return post(`safetyProduction/exam/getExamInfo`, data)
}
// 保存考核信息
export function saveAssessDetailFn(data = {}) {
  return post(`safetyProduction/exam/toExam`, data)
}
// 分页查询目标责任制台账
export function getTargetAssessListByPageFn(params = {}) {
  return get(`safetyProduction/exam/standing/paging`, params)
}
// 获取已考核详情信息
export function getFinishAssessDetailByIdFn(id) {
  return get(`safetyProduction/exam/standing/getById/${id}`)
}
// 删除目标责任制考核台账单条记录
export function deleteAssessRecordFn(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `safetyProduction/exam/standing/delete/${id}`)
}
