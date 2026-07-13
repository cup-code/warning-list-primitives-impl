import request from '@/utils/request'

// 新增应急队伍
export function addTeam(data) {
  return request({
    url: '/resources/emergency/team/save',
    method: 'post',
    data,
  })
}

// 查询应急队伍
export function queryTeam(data) {
  return request({
    url: '/resources/emergency/team/queryPageInfo',
    method: 'post',
    data,
  })
}

// 删除应急队伍
export function deleteTeam(id) {
  return request({
    url: `/resources/emergency/team/delete?id=${id}`,
    method: 'delete',
  })
}

// 编辑应急队伍
export function updateTeam(data) {
  return request({
    url: '/resources/emergency/team/update',
    method: 'post',
    data,
  })
}

// 获取单条应急队伍数据
export function getByIdTeam(id) {
  return request({
    url: `/resources/emergency/team/getById?id=${id}`,
    method: 'get',
  })
}
