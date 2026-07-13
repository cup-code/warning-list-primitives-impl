/**
 * 易检系统 - 表格列配置
 * 字段来源：数据展示.xlsx / API响应
 */

export const TrainingSetDataTableConfig = [
  { label: '序号', prop: 'index', width: 60, align: 'center' },
  { label: '来源', prop: 'source', minWidth: 100, align: 'center', showOverflowTooltip: true },
  { label: '厂区编码', prop: 'factoryCode', minWidth: 120, align: 'center', showOverflowTooltip: true },
  { label: '点位编码', prop: 'pointCode', minWidth: 120, align: 'center', showOverflowTooltip: true },
  { label: '采样时间', prop: 'sampleTime', minWidth: 160, align: 'center', showOverflowTooltip: true },
  { label: '吸光度SAC1', prop: 'sac', width: 200, align: 'center', slot: 'sac', showOverflowTooltip: true },
  { label: '吸光度SAC2', prop: 'sac1', width: 200, align: 'center', slot: 'sac1', showOverflowTooltip: true },
  { label: '吸光度SAC3', prop: 'sac2', width: 200, align: 'center', slot: 'sac2', showOverflowTooltip: true },
  { label: '吸光度SAC4', prop: 'sac3', width: 200, align: 'center', slot: 'sac3', showOverflowTooltip: true },
  { label: '吸光度SAC5', prop: 'sac4', width: 200, align: 'center', slot: 'sac4', showOverflowTooltip: true },
  { label: '化学需氧量COD', prop: 'cod', minWidth: 140, align: 'center', showOverflowTooltip: true },
  { label: '氨氮NH3N', prop: 'nh3n', minWidth: 110, align: 'center', showOverflowTooltip: true },
  { label: '硝氮NO3N', prop: 'no3n', minWidth: 110, align: 'center', showOverflowTooltip: true },
  { label: '总磷TP', prop: 'tp', minWidth: 80, align: 'center', showOverflowTooltip: true },
  { label: '总氮TN', prop: 'tn', minWidth: 80, align: 'center', showOverflowTooltip: true },
  { label: '酸碱度PH', prop: 'ph', minWidth: 80, align: 'center', showOverflowTooltip: true },
  { label: '溶解氧DO', prop: 'dissolvedOxygen', minWidth: 100, align: 'center', showOverflowTooltip: true },
  { label: '电导率COND', prop: 'cond', minWidth: 100, align: 'center', showOverflowTooltip: true },
  { label: '五日生化需氧量BOD5', prop: 'bod5', minWidth: 160, align: 'center', showOverflowTooltip: true },
  { label: '浊度SS', prop: 'ss', minWidth: 80, align: 'center', showOverflowTooltip: true },
  { label: '污泥浓度MLSS', prop: 'mlss', minWidth: 120, align: 'center', showOverflowTooltip: true },
  { label: '温度TEMP', prop: 'temp', minWidth: 90, align: 'center', showOverflowTooltip: true },
  { label: '总有机碳TOC', prop: 'toc', minWidth: 110, align: 'center', showOverflowTooltip: true },
  { label: 'AI-COD', prop: 'aiCod', minWidth: 90, align: 'center', showOverflowTooltip: true },
  { label: 'AI-NH3N', prop: 'aiNh3n', minWidth: 90, align: 'center', showOverflowTooltip: true },
  { label: 'AI-NO3N', prop: 'aiNo3n', minWidth: 90, align: 'center', showOverflowTooltip: true },
  { label: 'AI-TP', prop: 'aiTp', minWidth: 80, align: 'center', showOverflowTooltip: true },
  { label: 'AI-TN', prop: 'aiTn', minWidth: 80, align: 'center', showOverflowTooltip: true },
  { label: 'AI-PH', prop: 'aiPh', minWidth: 80, align: 'center', showOverflowTooltip: true },
  { label: 'AI-DO', prop: 'aiDo', minWidth: 80, align: 'center', showOverflowTooltip: true },
  { label: 'AI-COND', prop: 'aiCond', minWidth: 90, align: 'center', showOverflowTooltip: true },
  { label: 'AI-BOD5', prop: 'aiBod5', minWidth: 90, align: 'center', showOverflowTooltip: true },
  { label: 'AI-SS', prop: 'aiSs', minWidth: 80, align: 'center', showOverflowTooltip: true },
  { label: 'AI-MLSS', prop: 'aiMlss', minWidth: 90, align: 'center', showOverflowTooltip: true },
  { label: 'AI-TEMP', prop: 'aiTemp', minWidth: 90, align: 'center', showOverflowTooltip: true },
  { label: 'AI-TOC', prop: 'aiToc', minWidth: 80, align: 'center', showOverflowTooltip: true },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 210,
    align: 'center',
  },
]

/**
 * 天健MQTT数据 - 表格列配置
 * 字段来源：副本数据展示.xlsx - 天健MQTT数据sheet
 */
export const TianjianDataTableConfig = [
  { label: '序号', prop: 'index', width: 60, align: 'center' },
  { label: '设备编码', prop: 'deviceCode', minWidth: 120, align: 'center', showOverflowTooltip: true },
  { label: '数据时间', prop: 'eventTime', minWidth: 160, align: 'center', showOverflowTooltip: true },
  // { label: '工作状态', prop: 'workMode', minWidth: 100, align: 'center', showOverflowTooltip: true },
  { label: '光谱', prop: 'spe', width: 200, align: 'center', slot: 'spe', showOverflowTooltip: true },
  { label: '清水光谱', prop: 'speWater', width: 200, align: 'center', slot: 'speWater', showOverflowTooltip: true },
  { label: '吸光度谱', prop: 'speSac', width: 200, align: 'center', slot: 'speSac', showOverflowTooltip: true },
  { label: 'COD测量值', prop: 'cod', minWidth: 100, align: 'center', showOverflowTooltip: true },
  { label: '硝氮测量值', prop: 'no3n', minWidth: 100, align: 'center', showOverflowTooltip: true },
  { label: '浊度测量值', prop: 'ss', minWidth: 100, align: 'center', showOverflowTooltip: true },
  { label: '光谱传感器温度测量值', prop: 'temp', minWidth: 100, align: 'center', showOverflowTooltip: true },
  { label: '氨氮测量值', prop: 'dnh', minWidth: 100, align: 'center', showOverflowTooltip: true },
  { label: '氨氮PH测量值', prop: 'dnhPh', minWidth: 100, align: 'center', showOverflowTooltip: true },
  { label: '氨氮温度测量值', prop: 'dnhTemp', minWidth: 100, align: 'center', showOverflowTooltip: true },
  { label: 'TOC测量值', prop: 'toc', minWidth: 100, align: 'center', showOverflowTooltip: true },
  // { label: '柜体内部温度(℃)', prop: 'boxTemp', minWidth: 130, align: 'center', showOverflowTooltip: true },
  // { label: '当前流量(mL/min)', prop: 'flowRate', minWidth: 140, align: 'center', showOverflowTooltip: true },
  // { label: '加热带温度(℃)', prop: 'heatTemp', minWidth: 120, align: 'center', showOverflowTooltip: true },
  // { label: '加热带状态', prop: 'heatStatus', minWidth: 100, align: 'center', showOverflowTooltip: true },
  // { label: '蠕动泵旋转方向', prop: 'bumperRotation', minWidth: 120, align: 'center', showOverflowTooltip: true },
  // { label: '蠕动泵转速', prop: 'bumperSpeed', minWidth: 100, align: 'center', showOverflowTooltip: true },
  // { label: '蠕动泵启停', prop: 'bumperStart', minWidth: 100, align: 'center', showOverflowTooltip: true },
// createdBy
// createdTime
// deleted
// id
]

/**
 * 点位编码 - 表格列配置
 * 字段：点位编码、点位名称、所属工艺段
 */
export const PositionCodeTableConfig = [
  { label: '序号', prop: 'index', width: 60, align: 'center' },
  { label: '点位编码', prop: 'pointCode', minWidth: 160, align: 'center', showOverflowTooltip: true },
  { label: '点位名称', prop: 'pointName', minWidth: 160, align: 'center', showOverflowTooltip: true },
  { label: '所属工艺段', prop: 'processSection', minWidth: 160, align: 'center', showOverflowTooltip: true },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 210,
    align: 'center',
  },
]

/**
 * 天健安装记录 - 表格列配置
 * 字段：点位编码、设备编码、安装时间
 */
export const TianjianInstallationRecordTableConfig = [
  { label: '序号', prop: 'index', width: 60, align: 'center' },
  { label: '点位编码', prop: 'pointCode', minWidth: 160, align: 'center', showOverflowTooltip: true },
  { label: '设备编码', prop: 'deviceCode', minWidth: 160, align: 'center', showOverflowTooltip: true },
  { label: '安装时间', prop: 'installationTime', minWidth: 180, align: 'center', showOverflowTooltip: true },
  {
    label: '操作',
    prop: 'operation',
    slot: 'operation',
    fixed: 'right',
    width: 210,
    align: 'center',
  },
]
