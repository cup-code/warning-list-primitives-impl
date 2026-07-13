import request from '@/utils/request'

// 新增应急物资
export function addGoods(data) {
  return request({
    url: '/resources/emergency/supplies/save',
    method: 'post',
    data,
  })
}

// 查询应急物资
export function queryGoods(data) {
  return request({
    url: '/resources/emergency/supplies/pageQuery',
    method: 'post',
    data,
  })
}

// 删除应急物资
export function deleteGoods(id) {
  return request({
    url: `/resources/emergency/supplies/removeById?id=${id}`,
    method: 'delete',
  })
}

// 编辑应急物资
export function updateGoods(data) {
  return request({
    url: '/resources/emergency/supplies/updete',
    method: 'post',
    data,
  })
}

// 获取单条应急物资数据
export function getByIdGoods(id) {
  return request({
    url: `/resources/emergency/supplies/getById?id=${id}`,
    method: 'get',
  })
}
// 检查记录
// 新增应急物资检查记录
export function addGoodsRecord(data) {
  return request({
    url: '/emergency/inspectRecord/save',
    method: 'post',
    data,
  })
}
// 获取单条应急物资检查记录数据
export function getByIdGoodsRecord(id) {
  return request({
    url: `/emergency/inspectRecord/selectById?id=${id}`,
    method: 'get',
  })
}

// 编辑应急物资检查记录
export function updateGoodsRecord(data) {
  return request({
    url: '/emergency/inspectRecord/updateInfo',
    method: 'post',
    data,
  })
}

// 删除单条应急物资检查记录数据
export function removeInfoById(id) {
  return request({
    url: `/emergency/inspectRecord/removeInfoById?id=${id}`,
    method: 'delete',
  })
}
