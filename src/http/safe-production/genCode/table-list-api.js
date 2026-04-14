import qs from 'qs'
import {
  axiosDelete,
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'
// 分页查询表格内容
export function getTableListFn(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  if (params.orderBy) {
    pr += `&orderBy=${params.orderBy}`
  }
  if (params.nameLike) {
    pr += `&nameLike=${params.nameLike}`
  }
  if (params.dataSource.id) {
    pr += `&dataSource.id=${params.dataSource.id}`
  }
  return axiosGet(axios, `gen/genTable/list?${pr}`)
}
// 获取左侧树
export function getTreetFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `database/datalink/dataSource/treeData2`)
}
// 移除一条或多条数据
export function removeTableListFn(ids) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `gen/genTable/deleteAll?ids=${ids}`)
}
// 删除一条数据
export function delTableListFn(id) {
  const axios = createAxiosFromStore()
  return axiosDelete(axios, `gen/genTable/deleteDb?id=${id}`)
}
// 获取字典类型
export function getDictListFn(params) {
  const axios = createAxiosFromStore()
  const pr = `pageNo=${params.pageNo}&pageSize=${params.pageSize}`
  return axiosGet(axios, `sys/dict/type/list?${pr}`)
}
// 获取主表表名list
export function getQueryConfigFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `gen/genTable/queryConfig`)
}
// 根据id获取当前表的内容
export function getContentByIdFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `gen/genTable/queryById?id=${id}`)
}
// 保存或修改表数据提交
export function saveContentFn(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `gen/genTable/save`, paramsEncoded)
}
// 选择关联字段弹出框
export function getFieldsFn(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `gen/genCustomObj/getByValue`, paramsEncoded)
}
// 同步到数据库
export function synchDbFn(id, isForce) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `gen/genTable/synchDb?id=${id}&isForce=${isForce}`)
}
// 导入数据库表单：获取数据列表
export function importTableDataFn(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `gen/genTable/importTableData?name=${params.name}&dataSource.enName=${params.dataSource.enName}`,
  )
}
// 导入数据库表单提交
export function saveTableFromDBFn(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `gen/genTable/saveTableFromDB`, paramsEncoded)
}
// 生成代码：选择代码模块列表
export function genCodeTemplateFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `gen/genTable/queryGenCodeForm?genTable.id=${id}&tableType=0`)
}
// 生成代码：选择路径弹框
export function getFileTreeFn(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `gen/genScheme/getFileTree?parentNode=${id}`)
}
// 生成代码：提交表单
export function saveGenCodeFn(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `gen/genTable/genCode`, paramsEncoded)
}
// 创建菜单： 获取菜单列表
export function getMenuTreeDataFn() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sys/menu/treeData`)
}
// 创建菜单： 提交表单
export function createMenuFn(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `gen/genScheme/createMenu`, paramsEncoded)
}
// 添加到java类型
export function createCustomObjFn(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `gen/genCustomObj/add`, paramsEncoded)
}
// 获取流程表单
export function getFormUrlFn(params) {
  const axios = createFormUrlencodedAxios()
  const paramsEncoded = qs.stringify(params, {
    allowDots: true,
    arrayFormat: 'indices',
  })
  return axiosPost(axios, `gen/genTable/getFormUrl`, paramsEncoded)
}
