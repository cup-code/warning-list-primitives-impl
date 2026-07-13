<script>
import { getTenantCompany } from '@/http/map/companyManage.js'
import anqiBiMidBottom from './components/anqiBiMidBottom.vue'
import ServiceScreenLeft from './components/serviceScreenLeft.vue'
import ServiceScreenRight from './components/serviceScreenRight.vue'
import ServiceScreenTop from './components/serviceScreenTop.vue'
import ScaleBox from './scaleBox/index.vue'

export default {
  name: 'visualizationCenter',
  components: {
    ScaleBox,
    ServiceScreenLeft,
    ServiceScreenTop,
    AnqiBiMidBottom: anqiBiMidBottom,
    ServiceScreenRight,
  },
  data() {
    return {
      title: '客户服务中心',
      routerList: [],

      trainList: [
        {
          count: 18,
          icon: require('@/assets/anqiBi/trainSumIcon.png'),
          name: '客户总数',
          color: '#fde148',
        },
        {
          count: 300,
          icon: require('@/assets/anqiBi/trainSumIcon.png'),
          name: '设备总数',
          color: '#00ffe4',
        },
        {
          count: 240,
          icon: require('@/assets/anqiBi/trainSumIcon.png'),
          name: '在线设备',
          color: '#00ffe4',
        },
        {
          count: 5,
          icon: require('@/assets/anqiBi/trainSumIcon.png'),
          name: '故障设备',
          color: '#00ffe4',
        },
        {
          count: 80,
          icon: require('@/assets/anqiBi/trainSumIcon.png'),
          name: '在线率',
          color: '#00ffe4',
        },
      ],
      nameId: 't-00',
      constituentCompany: [],
      mapList: [
        { id: 'earth01', url: require('@/assets/anqiBi/worldMap.png') },
        { id: 'china02', url: require('@/assets/anqiBi/china01.png') },
        { id: 'yichang03', url: require('@/assets/anqiBi/yichang04.png') },
      ],
      currMapUrl: undefined,
      mapId: 'earth01',
      allCharts: {
        chart_map: null,
      },
      userData: undefined, // 用户数据

      // 城市坐标"
      yiChang_city: '203+地市',

      // 所有公司 - 信息
      companyList: [],
      // 位置图标
    }
  },
  beforeMount() {
    this.constituentCompany = this.earth01
  },
  mounted() {
    this.initAll()
    window.addEventListener('resize', this.resizeCharts) // 图表自适应大小

    // session中取到权限数据
    this.userData = JSON.parse(sessionStorage.getItem('user'))
    if (this.userData.hasOwnProperty('tenantId')) {
      //
      this.getCompanyIntroduceLocation(this.userData.tenantId)
    }

    this.currMapUrl = this.mapList[0].url
    this.routerList = JSON.parse(sessionStorage.getItem('routerList') || '[]')
    if (this.routerList.length >= 6) {
      this.routerList = this.routerList.slice(0, 6)
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
  },

  methods: {
    /* 重置图表大小 */
    resizeCharts() {
      for (const key in this.allCharts) {
        if (this.allCharts[key]) {
          this.allCharts[key].resize()
        }
      }
    },
    initChart(name, options) {
      const elem = document.getElementById(name)
      this.allCharts[name] = this.$echarts.init(elem)
      this.allCharts[name].setOption(options)
    },
    // 初始化图表
    initAll() {
      this.initChart('chart_map', {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          orient: 'vertical',
          x: '22%',
          y: 80,
          textStyle: { color: '#fff' },
          data: ['设备数量'],
        },
        dataRange: {
          x: '22%',
          y: 'bottom',
          textStyle: { color: '#fff' },
          splitList: [
            { start: 1500 },
            { start: 900, end: 1500 },
            { start: 310, end: 1000 },
            { start: 200, end: 300 },
            { start: 10, end: 200 },
            { start: 5, end: 10, color: '#d566a0' },
            { end: 5 },
          ],
          color: ['#E0022B', '#E09107', '#A3E00B'],
        },
        roamController: {
          show: false,
          x: 'right',
          mapTypeControl: {
            china: true,
          },
        },
        series: [
          {
            name: '设备数量',
            type: 'map',
            mapType: 'china',
            roam: true,
            mapLocation: { x: 'center', y: 'center' },
            itemStyle: {
              normal: {
                label: {
                  show: true,
                  textStyle: {
                    color: 'rgb(249, 249, 249)',
                  },
                },
              },
              emphasis: { label: { show: true } },
            },
            data: [
              { name: '北京', value: Math.round(Math.random() * 2000) },
              { name: '天津', value: Math.round(Math.random() * 2000) },
              { name: '上海', value: Math.round(Math.random() * 2000) },
              { name: '重庆', value: Math.round(Math.random() * 2000) },
              { name: '河北', value: 0 },
              { name: '河南', value: Math.round(Math.random() * 2000) },
              { name: '云南', value: 5 },
              { name: '辽宁', value: 305 },
              { name: '黑龙江', value: Math.round(Math.random() * 2000) },
              { name: '湖南', value: 200 },
              { name: '安徽', value: Math.round(Math.random() * 2000) },
              { name: '山东', value: Math.round(Math.random() * 2000) },
              { name: '新疆', value: Math.round(Math.random() * 2000) },
              { name: '江苏', value: Math.round(Math.random() * 2000) },
              { name: '浙江', value: Math.round(Math.random() * 2000) },
              { name: '江西', value: Math.round(Math.random() * 2000) },
              { name: '湖北', value: Math.round(Math.random() * 2000) },
              { name: '广西', value: Math.round(Math.random() * 2000) },
              { name: '甘肃', value: Math.round(Math.random() * 2000) },
              { name: '山西', value: Math.round(Math.random() * 2000) },
              { name: '内蒙古', value: Math.round(Math.random() * 2000) },
              { name: '陕西', value: Math.round(Math.random() * 2000) },
              { name: '吉林', value: Math.round(Math.random() * 2000) },
              { name: '福建', value: Math.round(Math.random() * 2000) },
              { name: '贵州', value: Math.round(Math.random() * 2000) },
              { name: '广东', value: Math.round(Math.random() * 2000) },
              { name: '青海', value: Math.round(Math.random() * 2000) },
              { name: '西藏', value: Math.round(Math.random() * 2000) },
              { name: '四川', value: Math.round(Math.random() * 2000) },
              { name: '宁夏', value: Math.round(Math.random() * 2000) },
              { name: '海南', value: Math.round(Math.random() * 2000) },
              { name: '台湾', value: Math.round(Math.random() * 2000) },
              { name: '香港', value: Math.round(Math.random() * 2000) },
              { name: '澳门', value: Math.round(Math.random() * 2000) },
            ],
          },
        ],
      })
    },
    // 获取公司简介和位置
    getCompanyIntroduceLocation(tenantId) {
      getTenantCompany(tenantId)
        .then((res) => {
          if (res.data.success) {
            this.companyList = res.data.result || []
            // 市级公司
            const yichangCompanyList = this.companyList.filter((item) => {
              // 城市 203+地市    去除空格 replace(/[\t\r\f\n\s]*/g,'')
              return (
                item.hasOwnProperty('longitudeLatitude')
                && item.hasOwnProperty('city')
                && item.city.replace(/\s*/g, '') === '203+地市'
              )
            })
            // longitudeLatitude: ["48.49951597289448%", "44.237288135593225%"]
            // businessScope: "公司简介"
            yichangCompanyList.forEach((element) => {
              this.yichang03.push({
                id: element.id,
                name: element.companyName,
                businessScope: element.hasOwnProperty('businessScope')
                  ? element.businessScope
                  : '--',
                top: element.longitudeLatitude[1],
                left: element.longitudeLatitude[0],
                pointTop: element.longitudeLatitude[1],
                pointLeft: element.longitudeLatitude[0],
              })
            })
          }
          else {
            this.$message.warning(res.data.message || '请求数据失败')
          }
        })
        .catch((error) => {
          this.$message.error('请求数据出错：', error)
        })
        .finally(() => {})
    },

    clickCompanyName(item) {
      const {
        id,
        name,
        businessScope,
      } = item
      this.nameId = id
      this.$refs.anqiBiMidBottom.companyNameInMap(name, businessScope)
      this.$refs.anqiBiMidBottom.showIntroduce = true
    },

    // 地图路径
    setMapImage(index) {
      this.currMapUrl = this.mapList[index].url
      this.mapId = this.mapList[index].id
      if (index === 0) {
        this.constituentCompany = this.earth01
      }
      else if (index === 1) {
        this.constituentCompany = this.china02
      }
      else if (index === 2) {
        this.constituentCompany = this.yichang03
      }
    },

    toCenterClick() {
      console.log(this.routerList, 7766)
      this.clickchange(this.routerList[0])
    },
    clickchange(item) {
      this.defaultPath = item.path
      this.openDefaultMenu(item)
    },
    openDefaultMenu(item) {
      if (item.children && item.children.length > 0) {
        this.defaultPath += `/${item.children[0].path}`
        if (item.children[0].query) {
          this.defaultPath += `?${item.children[0].query}`
        }
        this.openDefaultMenu(item.children[0])
      }
      else {
        if (item.pageSourceType == 1) {
          // 如果是前端组件类型
          this.$router.push(this.defaultPath)
        }
        else if (item.pageSourceType == 3) {
          // 如果是外链地址
          const element = document.createElement('a')
          element.setAttribute('href', item.externalUrl)
          element.setAttribute('target', '_blank')
          element.style.display = 'none'
          document.body.appendChild(element)
          element.click()
          document.body.removeChild(element)
        }
      }
    },
  },
}
</script>

<template>
  <div style="width: 100vw; height: 100vh; position: relative">
    <div
      id="chart_map"
      class="mapScreen"
    />
    <div class="bigScreen">
      <img
        src="@/assets/anqiBi/bg.png"
        class="fixed bottom-0 left-0 right-0 top-0 h-screen w-screen"
        loading="lazy"
      >

      <div class="bg-titleTop">
        <div class="bi-top-title">
          {{ title }}
        </div>
        <div
          class="bi-top-right"
          @click="toCenterClick"
        >
          <div style="width: 100%; height: 50%; line-height: 0.8333vw; color: #ffffff">
            您好，{{ $store.state.user.user.fullName }}
          </div>
          <div
            style="width: 100%; height: 50%; line-height: 1.25vw; color: #00e7ff; cursor: pointer"
          >
            进入管理中心>>
          </div>
        </div>
      </div>
    </div>
    <div class="bg-main-side-left">
      <ServiceScreenLeft />
    </div>
    <div class="bg-main-side-right">
      <ServiceScreenRight />
    </div>
    <div class="bg-main-midle-top">
      <ServiceScreenTop :trainList="trainList" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.mapScreen {
  z-index: 99;
  position: absolute;
  width: 80%;
  height: 82%;
  top: 57%;
  left: 51%;
  transform: translate(-50%, -50%);
  margin: auto;
}

.bigScreen {
  z-index: 1;
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url('~@/assets/anqiBi/bg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;

  .bg-titleTop {
    width: 100%;
    height: 14vh;
    top: 0;
    left: 0;
    position: absolute;
    background-image: url('~@/assets/anqiBi/top.png');
    background-size: 100% 100%;
    .bi-top-title {
      width: 40%;
      height: 8vh;
      margin: auto;
      text-align: center;
      background-image: linear-gradient(to top, #55c3fe 20%, #feffff); /* 线性渐变背景，方向向上 */
      -webkit-background-clip: text; /* 背景被裁剪成文字的前景色 */
      -webkit-text-fill-color: transparent; /* 文字填充颜色变透明 */
      line-height: 8vh;
      font-size: 2vw;
      font-family: FZDaHei-B02;
      font-weight: 800;
      letter-spacing: 10px;
    }
    .bi-top-right {
      position: absolute;
      top: 15%;
      right: 2.4%;
      width: 8.3333vw;
      height: 5vh;
      display: flex;
      flex-wrap: wrap;
      font-size: 0.8vw;
      z-index: 4;
    }
  }
}

.bg-main-side-left {
  z-index: 3;
  position: absolute;
  left: 0vh;
  bottom: 1vh;
  color: #feffff;
  width: 25vw;
  height: 90vh;
  margin: 0 1vw;
  // background-image: url('~@/assets/anqiBi/left-bg.png');
  // background-repeat: no-repeat;
  // background-size: 100% 100%;
}
.bg-main-side-right {
  z-index: 3;
  position: absolute;
  right: 0vh;
  bottom: 1vh;
  color: #feffff;
  width: 25vw;
  height: 90vh;
  margin: 0 1vw;
  background-image: url('~@/assets/anqiBi/left-bg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
.bg-main-midle-top {
  z-index: 3;
  position: absolute;
  width: 40vw;
  height: 8vh;
  top: 8.5vh;
  left: 50%;
  transform: translateX(-50%);
}
.bg-main-midle-bottom {
  z-index: 3;
  position: absolute;
  width: 46vw;
  height: 15vh;
  bottom: 1vh;
  left: 50%;
  transform: translateX(-50%);
}

.bg-main {
  z-index: 3;
  position: absolute;
  width: 100%;
  height: 90vh;
  margin-top: 9vh;
  display: flex;
  color: #feffff;
  .bg-main-side {
    width: 25vw;
    height: 90vh;
    margin: 0 1vw;
    background-image: url('~@/assets/anqiBi/left-bg.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
  .bg-main-middle-buttom {
    width: 46vw;
    height: 90vh;
  }
}
</style>
