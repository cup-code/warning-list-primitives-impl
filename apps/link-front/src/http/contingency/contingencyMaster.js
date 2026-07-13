import request from '@/utils/request'

// 新增应急专家
export function addMaster(data) {
  return request({
    url: '/resources/emergency/personnel/save',
    method: 'post',
    data,
  })
}

// 查询应急专家
export function queryMaster(data) {
  return request({
    url: '/resources/emergency/personnel/queryPageInfo',
    method: 'post',
    data,
  })
}

// 删除应急专家
export function deleteMaster(id) {
  return request({
    url: `/resources/emergency/personnel/delete?id=${id}`,
    method: 'delete',
  })
}

// 编辑应急专家
export function updateMaster(data) {
  return request({
    url: '/resources/emergency/personnel/update',
    method: 'post',
    data,
  })
}

// 获取单条应急专家数据
export function getByIdMaster(id) {
  return request({
    url: `/resources/emergency/personnel/getById?id=${id}`,
    method: 'get',
  })
}
