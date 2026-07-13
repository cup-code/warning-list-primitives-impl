// @/http/common/utils   ./common/utils
import {
  axiosGet,
  axiosPost,
  createAxiosFromStore,
  createFormUrlencodedAxios,
} from '@/http/common/utils'

// 人员定位
// #region

// 查询所有定位卡最后的位置(所有卡位置，用于页面首次加载定位展示)
export function getLastLocations(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `locationBusiness/getLastLocations?buildId=${id}`)
}

// 查询所有位置变化的定位卡的位置---(实时变化，用于页面位置动态追踪)
export function getRealLocations(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `locationBusiness/getRealLocations?buildId=${id}`)
}

// 查询指定定位卡的历史时间段位置
export function getHistoryLocations(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `locationBusiness/getHistoryLocations`, params)
}

// 查询区域人车分布情况
export function getAreaPeopleCar(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `locationBusiness/getAreaPeopleCar?buildId=${id}`)
}

// 文档接口：人员定位 / 定位报警接口 / 报警统计
// 人员定位报警接口 /api/locationAlarm/getAlarmStat
export function locationGetAlarmStat(id) {
  // let axios = createAxiosFromStore()  buildId
  // return axiosGet(axios, `riskArea/getAll`)
  const axios = createAxiosFromStore()
  return axiosGet(axios, `locationAlarm/getAlarmStat?buildId=${id}`)
}

// 一人一档：查询用户详细信息
export function getUserDetailFn(userId) {
  return get(`sysUser/extend/detailById/${userId}`)
}
// 查询指定公司下的所有部门
export function getAllDepartByCompanyFn(companyId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysDepartment/companyDepartment/${companyId}`)
}
// 查询指定公司下或部门下的所有用户
export function selectCompany(params) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `joySuchUser/getAll/${params.busId}/${params.busIdType}`)
}
// 获取所有的开屏页list
export function getScreenListFn(companyId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysTenantMenu/getTenantMenu?companyId=${companyId}`)
}

//  获取厂区人数相关
export function getGroupByUser() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/groupByUserType`)
}

// #endregion

// 风险区域
// #region

export function getRiskAreaByPage(params) {
  const axios = createAxiosFromStore()
  let pr // `pageNum=${params.pageNum}&pageSize=${params.pageSize}`;
  for (const key in params) {
    if (params[key] != undefined) {
      if (pr === undefined) {
        // 第一个参数
        pr = `${key}=${params[key]}`
      }
      else {
        pr += `&${key}=${params[key]}`
      }
    }
  }
  return axiosGet(axios, `dpm/riskRegion/page?${pr}`)
}

// 分页查询分析分析单元
export function getAnalyseUnitByPage(params) {
  const axios = createAxiosFromStore()
  let pr
  for (const key in params) {
    if (pr === undefined) {
      pr = `${key}=${params[key]}`
    }
    else {
      pr += `&${key}=${params[key]}`
    }
  }
  return axiosGet(axios, `dpm/riskAnalysisUnit/page?${pr}`)
}
// 获取所有分析单元-下拉列表用
export function getAnalyseUnitAll() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/riskAnalysisUnit/allList`)
}

// 分页查询风险事件
export function getRiskEventByPage(params) {
  const axios = createAxiosFromStore()
  let pr
  for (const key in params) {
    if (pr === undefined) {
      pr = `${key}=${params[key]}`
    }
    else {
      pr += `&${key}=${params[key]}`
    }
  }
  return axiosGet(axios, `dpm/riskEvent/page?${pr}`)
}

// 获取所有风险区域
export function getRiskAreaAll() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/riskRegion/allList`)
}

// 根据条件分页获取区域
export function getLocationArea(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`

  // 公司id
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }

  // 模糊查询
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }
  return axiosGet(axios, `locationArea/getPageList?${pr}`)
}

// 根据id查询区域
export function getLocationAreaById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `locationArea/getById?id=${id}`)
}

// 根据id删除区域
export function delLocationAreaById(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `locationArea/deleteById?id=${id}`)
}

// 添加或修改区域
export function updateLocationArea(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `locationArea/saveOrUpdate`, params)
}

// 根据卡号、名称等关键字检索人员或车辆
export function getCardsByKey(buildId, keyWords) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `locationBusiness/getLocationCardsByKeyWords?buildId=${buildId}&keyWords=${keyWords}`,
  )
}

// 查询指定定位卡的实时位置  /  所在区域人车  摄像头 busType:3
export function getRecentLocations(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `locationBusiness/getRecentLocations`, params)
}

// 根据条件分页获取风险区域
export function getRiskArea(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.pageNum}&pageSize=${params.pageSize}`

  // 模糊查询
  if (params.fuzzyQuery) {
    pr += `&fuzzyQuery=${params.fuzzyQuery}`
  }

  return axiosGet(axios, `riskArea/getPageList?${pr}`)
}

// 根据id查询风险区域
export function getRiskAreaById(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `riskArea/getById?id=${id}`)
}

// 根据id删除风险区域
export function delRiskAreaById(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `riskArea/deleteById?id=${id}`)
}

// 添加或修改风险区域
export function updateRiskArea(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `riskArea/saveOrUpdate`, params)
}

// 获取全部风险区域
export function getAllRiskArea() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `riskArea/getAll`)
}

// 风险隐患
// 接口文档路径: -双预防机制 / 隐患 / 台账分页查询
export function queryTroubldData(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] || params[key] === 0) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/hiddenDanger/recordPage${reqStr}`)
}

// 获取查询任务子任务分页
export function safeCheckDetailsById(troubleId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/hiddenDanger/getDetail/${troubleId}`)
}
// 获取设备异常隐患的详情
export function deviceCheckDetailsById(troubleId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/hiddenTrouble/getDetail/${troubleId}`)
}

// 查询当前登录用户的公司及其子公司
export function getSubordinateCompany() {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, 'sysCompany/getSubordinateCompany')
}
// 查询当前登录人或其角色的简单信息部门树
export function getDepartListSimple() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysDepartment/getSimpleTree`)
}
// 查询指定公司下所有岗位
export function getAllPostByCompanyFn(companyId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysCompanyPost/getAll/${companyId}`)
}
// 查询指定公司下的所有用户
export function getByCompanyId(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `sysUser/getByCompanyId/${id}`)
}

// #endregion

// 两单四知卡
// #region
// 操作规程卡分页
export function handleRuleCardByPage(params) {
  const axios = createFormUrlencodedAxios()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/operatingProcedureCard/page${reqStr}`)
}
//  操作规程卡获取富文本
export function getHandleRuleCardRichText(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/operatingProcedureCard/richText/${id}`)
}

// 应急处置卡分页
export function emCardByPage(params) {
  const axios = createFormUrlencodedAxios()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/emergencyTreatmentCard/page${reqStr}`)
}
//  应急处置卡获取富文本
export function getEmCardRichText(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/emergencyTreatmentCard/richText/${id}`)
}

// 岗位职责卡分页
export function workDutyCardByPage(params) {
  const axios = createFormUrlencodedAxios()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] !== undefined) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/jobResponsibilitiesCard/page${reqStr}`)
}
// 岗位职责卡获取富文本
export function getWorkDutyCardRichText(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/jobResponsibilitiesCard/richText/${id}`)
}

// 风险辨识卡分页
export function riskEvaCardByPage(params) {
  const axios = createFormUrlencodedAxios()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/riskIdentificationCard/page${reqStr}`)
}
// 风险辨识卡获取富文本
export function getRiskEvaCardRichText(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `dpm/riskIdentificationCard/richText/${id}`)
}

// 安全风险分级管控清单
export function riskLevelCtrlDetailByPage(params) {
  const axios = createFormUrlencodedAxios()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] || params[key] === 0) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/riskInventory/controlPage${reqStr}`)
}

// 危害因素辨识排查清单
export function riskEvaCheckDetailByPage(params) {
  const axios = createFormUrlencodedAxios()
  let reqStr = '?'
  for (const key in params) {
    if (params[key] || params[key] === 0) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `dpm/riskInventory/identificationPage${reqStr}`)
}
// #endregion

// 重大危险源
// #region
// 分页查询重大危险源
export function getMhsArchives(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `mhs/archives/pageQuery`, params)
}

// 接口文档：重大危险源-档案-/重大危险源-档案/分页查询重大危险源档案 2023-05-11
export function dangerOriginPageQuery(params) {
  // 开始页 最大数量
  // ?isPage=${params.isPage}
  let pr = `?isPage=${params.isPage}&pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 公司id
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  // 名称
  if (params.unitName) {
    pr += `&unitName=${params.unitName}`
  }
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `/major/hazardDoc/page${pr}`)
}

// 接口文档：报警规则/报警记录相关接口/ 统计6天的报警数量(大屏)
// Statistical alarm record
export function statisticsTotal(params) {
  // hazardType  1 重大危险源  2 重要危险源
  let pr = `?hazardType=${params.hazardType}`
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `alert/record/statisticsTotal${pr}`)
}

// 接口路径：重大危险源-档案-/重大危险源-档案 / 详情查询重大危险源档案 (危险源详情, 重大危险源详情 )
export function dangerOriginDetail(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `major/hazardDoc/details/${id}`)
}

// 接口路径： 文件服务 / 查询文件集 ( 应急预案 )
export function getByEndityId(id) {
  const axios = createAxiosFromStore()
  // commonFile/getByEntityld/${id}
  return axiosPost(axios, `commonFile/getByEntityId?entityId=${id}`)
}

// 详情查询危化品 ( 化学品详细 )
// 接口路径：重大危险源-档案- / 重大危险源-化学品 / 详情查询危化品
export function chemistryDetails(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `major/chemistry/details/${id}`)
}

// 根据分组唯一编号查询所属测点的实时数据
export function getIORealTimeData(id) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `device/io/get/realtimeData/${id}`)
}

// 统计测点总数量
/* export function getIoTotalCount(params) {
    let axios = createAxiosFromStore()
    return axiosPost(axios, `device/io/getIoTotalCount`, params)
} */

// 统计重大危险源数量
export function getArchivesTotalCount(companyId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `mhs/archives/totalCount/${companyId}`)
}

// 根据等级统计报警记录数量
export function getAlertByLevel(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `alert/record/statisticsByLevel`, params)
}
// #endregion

// 重要危险源
// #region

// 所有重要危险列表
export function getAllImportantSourceByPage(params) {
  let pr = `?isPage=${params.isPage}&pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  /* // 危险级别
    if (params.hazardLevel) {
        pr += `&hazardLevel=${params.hazardLevel}`
    }
    // 风险区域
    if (params.riskRegion) {
        pr += `&riskRegion=${params.riskRegion}`
    }
    // 来源
    if (params.source) {
        pr += `&source=${params.source}`
    }
    // 类型
    if (params.unitType) {
        pr += `&unitType=${params.unitType}`
    } */

  // 单元名称 危险源名称
  if (params.unitName) {
    pr += `&unitName=${params.unitName}`
  }

  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `major/hazardDoc/importantPage${pr}`)
}

// 通过id查询危险源详情  get
export function getImportantSourceDetail(id) {
  const axios = createFormUrlencodedAxios()
  return axiosGet(axios, `major/hazardDoc/importantDetails/${id}`)
}

// application/x-www-form-urlencoded 请求类型

// 查询测点数  post (params.hazardType:1 重大危险源 ，2 重要危险源 )
export function hazardBindPointTotal(params) {
  let pr = `?companyId=${params.companyId}`
  // 危险源 id
  if (params.hazardId) {
    pr += `&hazardId=${params.hazardId}`
  }
  // 类型 1 重大危险源 ，2 重要危险源
  if (params.hazardType) {
    pr += `&hazardType=${params.hazardType}`
  }
  const axios = createAxiosFromStore()
  return axiosPost(axios, `mhs/bind/hazardBindPointTotal${pr}`)
}

// 统计6天的报警数量(大屏)  get
/* export function statisticsTotal(params){
    let axios = createAxiosFromStore();
    return axiosGet(axios,`alert/record/statisticsTotal`)

} */
// 模拟报警数据  路径:   终端管理 / 终端测试接口 / 模拟终端上报mqtt数据
export function testDeviceReport(params) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `deviceTest/testDeviceReport`, params)
}

// 查询危险源id 下 绑定的摄像头信息  post
export function getBindCameraInfo(params) {
  let pr = `?companyId=${params.companyId}`
  // 危险源 id
  if (params.hazardId) {
    pr += `&hazardId=${params.hazardId}`
  }
  // 类型 1 重大危险源 ，2 重要危险源
  if (params.hazardType) {
    pr += `&hazardType=${params.hazardType}`
  }
  const axios = createAxiosFromStore()
  return axiosPost(axios, `mhs/bind/getBindCameraInfo${pr}`, params)
}

// 查询危险源id绑定的测点   get  可以查多个测点 / 单个测点
export function queryPointGroupIoByPage(params) {
  // 开始页 最大数量
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`

  // 类型  1重大危险源 ，2重要危险源
  if (params.majorType) {
    pr += `&majorType=${params.majorType}`
  }
  // 公司id
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  // 危险源id
  if (params.groupId) {
    pr += `&groupId=${params.groupId}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `device/pointGroup/queryPointGroupIoByPage${pr}`)
}

// 获取指定设备测点的历史趋势  设备编码deviceCode  测点编码 ioCode
// 终端管理 / 终端测点组接口 / 查询指定设备测点集合的指定时间段内历史值
export function getIoTrendHis(params) {
  const per = {
    deviceAndIoCodeList: [
      {
        deviceCode: params.deviceCode,
        ioCode: params.ioCode,
        ioName: params.ioName,
      },
    ],
    startDate: params.startDate,
    endDate: params.endDate,
  }
  const axios = createAxiosFromStore()
  //  设备编码deviceCode  测点编码 ioCode
  return axiosPost(axios, `device/pointGroup/ioHistoryValue`, per)
  // return axiosGet(axios, `device/pointGroup/ioHistoryValue/${params.deviceCode}/${params.ioCode}?startDate=${params.startDate}&endDate=${params.endDate}`);
}

// 按条件查询测点的报警记录
export function queryAlertRecord(params) {
  // api/alert/record/list
  // 开始页 最大数量
  let pr = `?pageNum=${params.pageNum}&pageSize=${params.pageSize}`
  // 公司id
  if (params.companyId) {
    pr += `&companyId=${params.companyId}`
  }
  // 测点编码
  if (params.groupId) {
    pr += `&ioCode=${params.ioCode}`
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `alert/record/list${pr}`)
}

// 组态列表
// 根据条件分页获取组态画面信息
export function getHmi(params) {
  const axios = createAxiosFromStore()
  let pr = `pageNum=${params.page}&pageSize=${params.pageSize}`
  // 组态名称
  if (params.name) {
    pr += `&name=${params.name}`
  }
  // 分组id
  if (params.groupId) {
    pr += `&groupId=${params.groupId}`
  }
  // 组态状态   0上架  1下架
  if (params.status || params.status == '0') {
    pr += `&status=${params.status}`
  }
  if (params.departmentId) {
    pr += `&departmentId=${params.departmentId}`
  }
  return axiosGet(axios, `hmi/list?${pr}`)
}

// 查询危险源下的所有组态
// 重大危险源-监测绑定-/重大危险源-组态绑定/查询危险源下的所有组态
export function getHmiByHazardId(params) {
  // 公司 id
  let pr = `?companyId=${params.companyId}`
  // 危险源 id
  if (params.hazardId) {
    pr += `&hazardId=${params.hazardId}`
  }
  const axios = createAxiosFromStore()
  return axiosPost(axios, `mhs/hmi/getHmiByHazardId${pr}`)
}

// #endregion

// 作业安全

// 获取所有作业票
export function getWorklistAll(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `so/workTicket/listAll${reqStr}`)
}
// 获取当前登录人可见的承包商
export function getContractorVisibleLogin() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `contractor/listAll`)
}
// 查询作业流转记录
// export function getWorkRecord(workTicketId) {
//   let axios = createAxiosFromStore()
//   return axiosGet(axios, `workTicket/history/${workTicketId}`)
// }
export function getWorkRecord(param) {
  const axios = createAxiosFromStore()
  return axiosGet(
    axios,
    `/so/workTicket/getHotHistoryList?businessId=${param.businessId}&mainId=${param.mainId}`,
  )
}
export function getWorkDetail(ticketId) {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `/so/workTicket/hot/detail/${ticketId}`)
}

// -特殊作业-作业票 /  特殊作业票 / 按作业票类型统计作业数量  /api/workTicket/countByType
export function getCountByType(params) {
  const axios = createAxiosFromStore()
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${params[key]}`
    }
  }
  reqStr = reqStr.replace('?&', '?')
  return axiosGet(axios, `workTicket/statistics/countByType${reqStr}`)
}

// 人福-特殊作业-作业票 / 特殊作业票台账 / 获取所有作业票
/* export function getWorklistAll(params) {
    ///api/so/workTicket/listAll
    let axios = createAxiosFromStore()
    let reqStr = '?'
    for (let key in params) {
      if (params[key]) {
        reqStr += `&${key}=${params[key]}`
      }
    }
    reqStr = reqStr.replace('?&', '?')
    return axiosGet(axios, `so/workTicket/listAll${reqStr}`)
  } */

// 消防管理
// 消防点位查询全部--安环一张图使用的
export function getAllFirePointFn(params = {}) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosPost(axios, `fireControl/fireFightingPoint/fireFightingPoint${reqStr}`)
}
// 消防点位查看
export function firePointById(id) {
  const axios = createAxiosFromStore()
  return axiosPost(axios, `fireControl/fireFightingPoint/fireFightingPointQuery?id=${id}`)
}
// 工单回执查询全部--安环一张图使用的
export function getAllBackListFn(params = {}) {
  let reqStr = '?'
  for (const key in params) {
    if (params[key]) {
      reqStr += `&${key}=${encodeURIComponent(params[key])}`
    }
    reqStr = reqStr.replace('?&', '?')
  }
  const axios = createAxiosFromStore()
  return axiosGet(axios, `fireControl/workOrderReceipt/getAll${reqStr}`)
}

// 职业危害区域   接口文档路径： 职业健康管理/职业健康管理-职业危害因素辨别/危害因数大屏列表
export function occupationalHazardArea() {
  const axios = createAxiosFromStore()
  return axiosGet(axios, `occupation/harmFactor/location`)
}
