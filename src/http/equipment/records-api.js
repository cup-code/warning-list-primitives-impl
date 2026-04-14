/**
 * 设备清单接口
 */
import {
  axiosDelete,
  axiosPost,
  axiosUpload,
  createAxiosFromStore,
  createFormDataAxios,
  createFormUrlencodedAxios,
} from '@/http/common/utils'

/**
 * 分页查询设备清单记录
 * @param params 查询参数
 * @returns {*}
 */
export function queryEquipmentRecord(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'equipment/record/pageQuery', params)
}

/**
 * 保存设备清单记录
 * @param params 表单数据
 * @returns {*}
 */
export function saveEquipmentRecord(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, 'equipment/record/addOrUpdate', params)
}

/**
 * 删除设备清单记录
 * @param id 主键
 * @returns {*}
 */
export function deleteEquipmentRecord(id) {
  const axios = createFormUrlencodedAxios()
  return axiosDelete(axios, `equipment/record/delete/${id}`)
}

/**
 * 下载设备清单模板文件
 */
export function downloadEquipmentRecordTemplateFile() {
  this.$utils.download('/excel/getImportTemplate/EquipmentRecords', null)
}

/**
 * 导入设备清单记录
 * @param params 参数
 */
export function importEquipmentRecord(params) {
  const axios = createFormDataAxios()
  return axiosUpload(axios, '/excel/importData/EquipmentRecords', params)
}
