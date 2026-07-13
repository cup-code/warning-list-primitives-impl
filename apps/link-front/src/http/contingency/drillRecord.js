import request from '@/utils/request'

// 新增演练记录
export function addDrillRecord(data) {
  return request({
    url: '/resources/emergency/drillRecord/add',
    method: 'post',
    data,
  })
}

// 查询演练记录
export function queryDrillRecord(data) {
  return request({
    url: '/resources/emergency/drillRecord/queryPageInfo',
    method: 'post',
    data,
  })
}

// 删除演练记录
export function deleteDrillRecord(id) {
  return request({
    url: `/resources/emergency/drillRecord/delete?id=${id}`,
    method: 'delete',
  })
}

// 编辑演练记录
export function updateDrillRecord(data) {
  return request({
    url: '/resources/emergency/drillRecord/update',
    method: 'post',
    data,
  })
}
// 整改演练记录
export function fixDrillRecord(data) {
  return request({
    url: '/resources/emergency/drillRecord/problemRectification',
    method: 'post',
    data,
  })
}

// 获取单条演练记录数据
export function getByIdDrillRecord(id) {
  return request({
    url: `/resources/emergency/drillRecord/getById?id=${id}`,
    method: 'get',
  })
}

// 删除问题不足演练记录
export function deleteProblem(id) {
  return request({
    url: `/resources/emergency/drillRecord/deleteProblem?id=${id}`,
    method: 'delete',
  })
}
