import request from '@/utils/request'

// 新增演练计划
export function addDrillPlan(data) {
  return request({
    url: '/resources/emergency/drillPlan/add',
    method: 'post',
    data,
  })
}

// 查询演练计划
export function queryDrillPlan(data) {
  return request({
    url: '/resources/emergency/drillPlan/queryPageInfo',
    method: 'post',
    data,
  })
}

// 删除演练计划
export function deleteDrillPlan(id) {
  return request({
    url: `/resources/emergency/drillPlan/delete?id=${id}`,
    method: 'delete',
  })
}

// 编辑演练计划
export function updateDrillPlan(data) {
  let url = '/resources/emergency/drillPlan/update'
  if (data.todoId) {
    url += `?todoId=${data.todoId}`
  }
  return request({
    url,
    method: 'post',
    data,
  })
}

// 获取单条演练计划数据
export function getByIdDrillPlan(id) {
  return request({
    url: `/resources/emergency/drillPlan/getById?id=${id}`,
    method: 'get',
  })
}

// 新增修改演练计划校验
export function canAddOrUpdate() {
  return request({
    url: `/resources/emergency/drillPlan/isAddOrUpdate`,
    method: 'get',
  })
}
