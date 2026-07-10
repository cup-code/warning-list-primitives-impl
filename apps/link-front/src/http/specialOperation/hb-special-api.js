import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
} from '@/http/common/utils'
/* 湖北当阳特殊作业 */
// 按code查询安全措施
// 1001,"动火作业"
// 1002,"受限空间安全作业"
// 1003,"登高安全作业"
// 1004,"临时用电安全作业"
// 1005,"断路安全作业"
// 1006,"动土安全作业"
// 1007,"吊装安全作业"
// 1008,"盲板抽堵安全作业"
export function getSafeMeasureListByCode(jobTypeCode) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `specialJob/safetyMeasures/getListByGroupCode?jobTypeCode=${jobTypeCode}`)
}
// 分页查询特殊作业台账
export function getSpecialWorkBookByPage(params) {
  const axios = createAxiosFromStore()
  const reqData = {}
  for (const key in params) {
    if (key == 'typeLv' && params[key]) {
      const typeLvList = params[key].split('-')
      if (typeLvList.length >= 2) {
        reqData.workTicketType = typeLvList[0]
        reqData.workLevel = typeLvList[1]
      }
      else {
        reqData.workTicketType = typeLvList[0]
      }
    }
    else {
      reqData[key] = params[key]
    }
  }
  return axiosPost(axios, `hb/workTicket/record`, reqData)
}
// 查询作业流转记录
// export function getWorkRecord(workTicketId) {
//   let axios = createAxiosFromStore()
//   return axiosGet(axios, `workTicket/history/${workTicketId}`);
// }
// 查询交底提要列表 sid-作业票id
export function getSafetyTrainList(sid) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `specialJob/safetyTrain/getTrainGroupList/${sid}`)
}

// 查看动火作业详情
export function getFireWorkById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hb/workTicket/hot/detail/${id}`)
}
// 查看受限作业详情
export function getLimitWorkById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hb/workTicket/confinedSpace/detail/${id}`)
}
// 查看登高作业详情
export function getHeightWorkById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hb/workTicket/ascend/detail/${id}`)
}
// 查看临电作业详情
export function getElecWorkById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hb/workTicket/temporaryElectricity/detail/${id}`)
}
// 查看断路作业详情
export function getCircuitWorkById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hb/workTicket/openCircuit/detail/${id}`)
}
// 查看动土作业详情
export function getGroundWorkById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hb/workTicket/breakGround/detail/${id}`)
}
// 查看吊装作业详情
export function getHoistWorkById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hb/workTicket/hoisting/detail/${id}`)
}
// 查看盲板作业详情
export function getBlindWorkById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `hb/workTicket/blindPlateBlocking/detail/${id}`)
}
