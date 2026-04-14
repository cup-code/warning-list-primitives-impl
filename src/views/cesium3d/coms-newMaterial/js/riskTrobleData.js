/* 隐患信息隐患描述 警示标识彩漆褪色，不醒目，需及时更换
        隐患类型 安全
        治理类型 限期整改
        隐患等级 低
        隐患状态 已复查
        排查人 张三
        发现时间 2022-12-20 15:09:03
        整改部门园区工厂食品原料生产一部
        整改人李四
        整改时间 2022-12-20 15:10:06
        验收人 王五
        验收人 2022-12-20 15:10:18
    */
// 风险隐患——测试数据
const riskTrobleData = [
  {
    type: 'fire_operate',
    id: 'fxyh-2023-02-01',

    troubleDesc: '警示标识彩漆褪色，不醒目，需及时更换', // 隐患描述
    troubleType: '安全', // 隐患类型
    governType: '限期整改', // 治理类型
    troubleLevel: '低', // 隐患等级
    troubleState: '已经复查', // 隐患状态
    checkPerson: '张兰', // 排查人
    discoverTime: '2023-02-01 12:20', // 发现时间
    rectifyDepartment: '园区工厂食品原料生产一部', // 整改部门
    rectifyPerson: '李子超', // 整改人
    rectifyTime: '2023-02-05 10:00', // 整改时间
    acceptPerson: '李子超', // 验收让你
    acceptTime: '2023-02-05 10:00', // 验收时间

    place: '调味品库', // 作业位置
    x: 111.3946121388517,
    y: 30.65332537957734,
    z: 12.52976717541281,
  },
  {
    type: 'fire_operate',
    id: 'fxyh-2023-02-02',

    troubleDesc: '生产车间螺栓松动,需紧固',
    troubleType: '安全', // 隐患类型
    governType: '限期整改', // 治理类型
    troubleLevel: '低', // 隐患等级
    troubleState: '已经复查', // 隐患状态
    checkPerson: '赵辉', // 排查人
    discoverTime: '2023-02-01 12:20', // 发现时间
    rectifyDepartment: '园区工厂食品原料生产一部', // 整改部门
    rectifyPerson: '李子超', // 整改人
    rectifyTime: '2023-02-05 10:00', // 整改时间
    acceptPerson: '李子超', // 验收让你
    acceptTime: '2023-02-05 10:00', // 验收时间

    place: '调味品库', // 作业位置
    x: 111.3946121388517,
    y: 30.65332537957734,
    z: 12.52976717541281,
  },
]

export default riskTrobleData
