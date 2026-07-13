import request from '@/utils/request'

// 新增应急预案
export function addPlan(data) {
  return request({
    url: '/resources/emergency/contingencyPlan/add',
    method: 'post',
    data,
  })
}

// 查询应急预案
export function queryPlan(data) {
  return request({
    url: '/resources/emergency/contingencyPlan/queryPageInfo',
    method: 'post',
    data,
  })
}

// 删除应急预案
export function deletePlan(id) {
  return request({
    url: `/resources/emergency/contingencyPlan/delete?id=${id}`,
    method: 'delete',
  })
}

// 编辑应急预案
export function updatePlan(data) {
  let url = '/resources/emergency/contingencyPlan/update'
  if (data.todoId) {
    url += `?todoId=${data.todoId}`
  }
  return request({
    url,
    method: 'post',
    data,
  })
}

// 获取单条应急预案数据
export function getByIdPlan(id) {
  return request({
    url: `/resources/emergency/contingencyPlan/getById?id=${id}`,
    method: 'get',
  })
}

// 查看流转记录
export function getFlowRecordById(id) {
  return request({
    url: `/resources/emergency/contingencyPlan/getFlowRecordById?id=${id}`,
    method: 'get',
  })
}

// 新增修改应急预案校验
export function canAddOrUpdate() {
  return request({
    url: `/resources/emergency/contingencyPlan/isAddOrUpdate`,
    method: 'get',
  })
}
