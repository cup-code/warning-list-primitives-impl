import {
  axiosGet,
  createAxiosFromStore,
} from '@/http/common/utils'

// 按条件查询设备各个状态的数量
export function getStateCountFn(params) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `/fc/station/queryByPage`,
  )
}
