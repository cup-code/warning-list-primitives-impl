// @/http/common/utils   ./common/utils
import {
  axiosGet,
  createAxiosFromStore,
} from '@/http/common/utils'

// 查询指定租户下的所有公司 (公司简介 ， 公司位置坐标)
// 路径：公司管理 / 查询指定租户下的所有公司
//    let axios = createAxiosFromStore()
// return axiosGet(axios, `locationBusiness/getRealLocations?buildId=${id}`)
export function getTenantCompany(tenantId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysCompany/getByTenantId/${tenantId}`)
}
