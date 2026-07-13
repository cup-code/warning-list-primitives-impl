<script>
import { allMachineList, machineProvinceList } from '@/http/videoWarning/warning-api'
import ServiceScreenTop from '../components/serviceScreenTop.vue'
import ScreenLeft from './screenLeft.vue'
import ScreenRight from './screenRight.vue'

export default {
  name: 'machineScreenCenter',
  components: {
    ScreenLeft,
    ScreenRight,
    ServiceScreenTop,
  },
  data() {
    return {
      title: '视频智能运营驾驶舱',
      trainList: [
        {
          count: 0,
          icon: require('@/assets/anqiBi/trainSumIcon.png'),
          name: '一体机总数',
          color: '#00ffe4',
        },
      ],
      allCharts: {
        chart_map: null,
      },
      routerList: [],
      defaultPath: '',
      provinceData: [], // 存储省份数据
      MachineList: [],
    }
  },
  mounted() {
    this.getMachineList()
    this.getMachineProvinceList()
    window.addEventListener('resize', this.resizeCharts) // 图表自适应大小

    this.routerList = JSON.parse(sessionStorage.getItem('routerList') || '[]')
    if (this.routerList.length >= 6) {
      this.routerList = this.routerList.slice(0, 6)
    }
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCharts)
  },
  methods: {
    async getMachineList() {
      const res = await allMachineList({ isPage: false })
      this.trainList[0].count = res.data.result.length
      this.MachineList = res.data.result.map((item) => {
        return {
          id: item.id,
          name: item.machineName,
        }
      })
    },
    async getMachineProvinceList() {
      try {
        const res = await machineProvinceList()
        if (res.data.code === 200 && res.data) {
          this.provinceData = res.data.result
          // 调用初始化地图方法，传入真实数据
          this.initAll()
        }
        else {
          console.error('获取省份数据失败:', res.msg)
          // 获取失败时也初始化地图，但使用空数据
          this.initAll()
        }
      }
      catch (error) {
        console.error('获取省份数据异常:', error)
        // 发生异常时也初始化地图，但使用空数据
        this.initAll()
      }
    },
    toCenterClick() {
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
      // 格式化省份数据为地图所需格式
      const formattedData = this.formatProvinceData()

      this.initChart('chart_map', {
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            // 处理无数据或数据为0的情况，避免显示NaN
            const value
              = typeof params.value === 'number' && !isNaN(params.value) ? params.value : 0
            return `${params.name}: ${value} 台`
          },
        },
        legend: {
          orient: 'vertical',
          x: '22%',
          y: 80,
          textStyle: { color: '#fff' },
          data: ['一体机省份数量分布'],
        },
        visualMap: {
          type: 'piecewise',
          x: '22%',
          y: 'bottom',
          textStyle: { color: '#fff' },
          splitList: [
            { start: 12 },
            { start: 9, end: 12 },
            { start: 6, end: 9 },
            { start: 3, end: 6 },
            { start: 1, end: 3 },
            { start: 0, end: 0 },
          ],
          inRange: {
            color: ['#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#d566a0'],
          },
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
            name: '一体机区域数量分布',
            type: 'map',
            mapType: 'china',
            roam: true,
            mapLocation: { x: 'center', y: 'center' },
            itemStyle: {
              areaColor: '#ffffff',
              normal: {
                label: {
                  show: true,
                  textStyle: {
                    color: '#fff',
                  },
                },
              },
              emphasis: { label: { show: true } },
            },
            data: formattedData,
          },
        ],
      })
    },

    // 格式化省份数据方法
    formatProvinceData() {
      // 默认的省份列表，确保所有省份都有数据
      const defaultProvinces = [
        '北京市',
        '天津市',
        '上海市',
        '重庆市',
        '河北省',
        '河南省',
        '云南省',
        '辽宁省',
        '黑龙江省',
        '湖南省',
        '安徽省',
        '山东省',
        '新疆维吾尔自治区',
        '江苏省',
        '浙江省',
        '江西省',
        '湖北省',
        '广西壮族自治区',
        '甘肃省',
        '山西省',
        '内蒙古自治区',
        '陕西省',
        '吉林省',
        '福建省',
        '贵州省',
        '广东省',
        '青海省',
        '西藏自治区',
        '四川省',
        '宁夏回族自治区',
        '海南省',
        '台湾省',
        '香港特别行政区',
        '澳门特别行政区',
      ]

      // 如果API返回了数据，使用API返回的数据
      if (this.provinceData && this.provinceData.length > 0) {
        return defaultProvinces.map((province) => {
          const items = this.provinceData.find(item => item.province === province)

          if (items) {
            return {
              name: ['内蒙古自治区', '黑龙江省'].includes(province)
                ? province.substring(0, 3)
                : province.substring(0, 2), // 假设API返回的省份字段是provinceName
              value: Number(items.count) || 0, // 假设API返回的数量字段是count
            }
          }
          else {
            return {
              name: ['内蒙古自治区', '黑龙江省'].includes(province)
                ? province.substring(0, 3)
                : province.substring(0, 2),
              value: 0,
            }
          }
        })
      }
      // 如果API没有返回数据，使用默认数据结构，但值设为0
      else {
        return defaultProvinces.map((province) => {
          return {
            name: ['内蒙古自治区', '黑龙江省'].includes(province)
              ? province.substring(0, 3)
              : province.substring(0, 2),
            value: 0,
          }
        })
      }
    },
  },
}
</script>

<template>
  <div class="relative w-screen h-screen">
    <div class="bigScreen">
      <div class="bg-titleTop">
        <div class="bi-top-title">
          {{ title }}
        </div>
        <div class="flex absolute flex-wrap bi-top-right" @click="toCenterClick">
          <div class="w-full h-1/2 text-white" style="line-height: 0.8333vw">
            您好，{{ $store.state.user.user.fullName }}
          </div>
          <div
            class="w-full h-1/2 text-blue-500 cursor-pointer"
            style="line-height: 1.25vw"
          >
            进入管理中心>>
          </div>
        </div>
      </div>
    </div>
    <div id="chart_map" class="mapScreen" />
    <div class="bg-main-side-left">
      <ScreenLeft />
    </div>
    <div class="bg-main-side-right">
      <ScreenRight :allMachineList="MachineList" />
    </div>
    <div class="bg-main-midle-top">
      <ServiceScreenTop :trainList="trainList" />
      <!-- <SelectCompany /> -->
    </div>
  </div>
</template>

<style scoped lang="scss">
.mapScreen {
  z-index: 2;
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
  background-image: url("~@/assets/anqiBi/bg.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;

  .bg-titleTop {
    width: 100%;
    height: 14vh;
    top: 0;
    left: 0;
    position: absolute;
    background-image: url("~@/assets/anqiBi/top.png");
    background-size: 100% 100%;
    .bi-top-title {
      width: 40%;
      height: 8vh;
      margin: auto;
      text-align: center;
      background-image: linear-gradient(
        to top,
        #55c3fe 20%,
        #feffff
      ); /* 线性渐变背景，方向向上 */
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

.bg-main-side-right {
  z-index: 3;
  position: absolute;
  right: 0vh;
  bottom: 1vh;
  color: #feffff;
  width: 25vw;
  height: 90vh;
  margin: 0 1vw;
  background-image: url("~@/assets/anqiBi/left-bg.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
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
  background-image: url("~@/assets/anqiBi/left-bg.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.bg-main-midle-top {
  display: flex;
  align-items: center;
  z-index: 3;
  position: absolute;
  width: 44vw;
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
</style>
