// 历史轨迹   7月 21 ， 9月14日
const histroyTrack = {
  // 人员轨迹数据  打印记录轨迹  PersonCar.vue  1055 开启 condole.log()

  // 是否离线测试  true 开启离线测试，
  isOffline: false,
  // 离线的人车
  personAndCarList: [
    {
      areaName: '园区工厂',
      peopleCount: 1,
      carCount: 0,
      items: [
        {
          buildId: '206092',
          cardCode: '1918FF06DA5D',
          timestamp: 1684894526000,
          longitude: 111.3962521753956,
          latitude: 30.655494858434693,
          floorNum: '2',
          busName: 'offline',
          busType: 1,
          userType: 'company',
          userPost: '安全主管',
          dept: '园区工厂安全环保部',
          online: false,
        },
      ],
    },
  ],

  // 当前人员轨迹
  aq_track: [],
}

export default histroyTrack
