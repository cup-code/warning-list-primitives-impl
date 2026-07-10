// 导入所有模块
import allLayer from './allLayer'
import buildIndoorArea from './buildIndoorArea'
import dangerOrigin from './dangerOrigin'
import deviceData from './deviceData'
import fireProtectionData from './fireProtectionData'
import histroyTrack from './histroyTrack'
import importantDanger from './importantDanger'
import importantDangerOriginData from './importantDangerOriginData'
import { componentNames, menuList } from './menuList'
import occupationDiseaseData from './occupationDiseaseData'
import personData from './personData'
import riskArea from './riskArea'
import riskTrobleData from './riskTrobleData'
import {
  safeOperationData,
  ticketStatusList,
  ticketTypeList,
} from './ticketData'
import viewerOptions from './viewerOptions'

// 构建zq_config对象
const zq_config = {
  layerList: allLayer,
  menuList,
  // 组件名称数组 []
  componentNames,
  // 初始化激活菜单  0:人员定位、1:风险区域、2:作业安全、  3:重大危险源、4:重要危险源、5:消防管理、6:职业病因素分布图
  currMenu: 0, // 默认0

  // 设备装置静态名称
  deviceData,

  // 未使用
  personData,

  // 消防管理-数据
  fireProtectionData,

  // 作业安全-数据
  // 作业票状态
  ticketStatusList,
  // 作业票类型
  ticketTypeList,

  // 未使用
  safeOperationData,

  // 风险隐患——测试数据
  riskTrobleData,

  // 重要危险源——测试数据
  importantDangerOriginData,

  // 职业病因素—测试数据
  occupationDiseaseData,
  // dangerData: dangerData,
  // 视图位置-   view2d_top 顶视图： "rotate":360,"tilt":360
  viewerOptions,

  dangerData: [
    /*         {x: 111.61675923636477, y: 30.363688424620406, z: 16.26,id:'dander01-01',name:'甲醛罐1'},
        {x: 111.61687932081999, y: 30.36379224914364, z: 16.26,id:'dander01-02',name:'甲醛罐2'},
        {x: 111.61687238738952, y: 30.363575101855492, z: 16.26,id:'dander01-03',name:'甲醛罐3'},
        {x: 111.61700419179384, y: 30.36367892667506, z: 16.26,id:'dander01-04',name:'甲醛罐4'}, */
    {
      x: 111.61701650252571,
      y: 30.363554996445444,
      z: 1.5,
      id: 'dander01-04',
      name: '甲醛罐5',
    },
  ],
}

// 导出所有模块
export {
  buildIndoorArea,
  dangerOrigin,
  histroyTrack,
  importantDanger,
  riskArea,
  zq_config,
}
