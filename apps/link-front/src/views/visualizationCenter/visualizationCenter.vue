<script>
import icon2 from '@/assets/anqiBi/icon2.png'
import { getTenantCompany } from '@/http/map/companyManage.js'
import AnqiBiLeft from './components/anqiBiLeft.vue'
import anqiBiMidBottom from './components/anqiBiMidBottom.vue'
import anqiBiMidTop from './components/anqiBiMidTop.vue'
import AnqiBiRight from './components/anqiBiRight.vue'
import ScaleBox from './scaleBox/index.vue'

export default {
  name: 'visualizationCenter',
  components: {
    ScaleBox,
    AnqiBiLeft,
    AnqiBiMidTop: anqiBiMidTop,
    AnqiBiMidBottom: anqiBiMidBottom,
    AnqiBiRight,
  },
  data() {
    return {
      title: '集团可视化中心',
      routerList: [],
      styleSize: {
        width: 1920,
        height: 937,
      },
      trainList: [
        {
          count: 35241,
          icon: require('@/assets/anqiBi/trainTimeIcon.png'),
          name: '培训总时长(h)',
          color: '#fde148',
        },
        {
          count: 6531,
          icon: require('@/assets/anqiBi/trainPeoIcon.png'),
          name: '培训总人次',
          color: '#00ffe4',
        },
        {
          count: 42,
          icon: require('@/assets/anqiBi/trainSumIcon.png'),
          name: '培训总数量',
          color: '#00ffe4',
        },
      ],
      earth01: [
        {
          id: 't-00',
          name: '总公司',
          top: '31%',
          left: '33.5%',
          pointTop: '24.8%',
          pointLeft: '35.9%',
        },
        {
          id: 't-01',
          name: '土耳其公司',
          top: '21%',
          left: '19%',
          pointTop: '17.3%',
          pointLeft: '21.2%',
        },
        {
          id: 't-02',
          name: '沙特公司',
          top: '35%',
          left: '18%',
          pointTop: '31.2%',
          pointLeft: '19.4%',
        },
        {
          id: 't-03',
          name: '孟加拉公司',
          top: '42%',
          left: '25%',
          pointTop: '38.7%',
          pointLeft: '27.9%',
        },
        {
          id: 't-04',
          name: '澳大利亚公司',
          top: '69%',
          left: '46%',
          pointTop: '69%',
          pointLeft: '43.6%',
        },
        {
          id: 't-05',
          name: '加拿大公司',
          top: '18%',
          left: '67.5%',
          pointTop: '14.5%',
          pointLeft: '69.4%',
        },
        {
          id: 't-06',
          name: '美国公司',
          top: '35%',
          left: '71.5%',
          pointTop: '31.5%',
          pointLeft: '76%',
        },
      ],
      china02: [
        {
          id: 't-00',
          name: '总公司',
          top: '34%',
          left: '36.5%',
          pointTop: '29%',
          pointLeft: '38.8%',
        },
        {
          id: 't-01',
          name: '分公司',
          top: '26%',
          left: '23.5%',
          pointTop: '22.5%',
          pointLeft: '26%',
        },
        {
          id: 't-02',
          name: '分公司',
          top: '39%',
          left: '22.5%',
          pointTop: '35%',
          pointLeft: '24.5%',
        },
        {
          id: 't-03',
          name: '分公司',
          top: '45%',
          left: '27%',
          pointTop: '41.5%',
          pointLeft: '31.8%',
        },
        {
          id: 't-04',
          name: '分公司',
          top: '69%',
          left: '48%',
          pointTop: '68.5%',
          pointLeft: '45.5%',
        },
        {
          id: 't-05',
          name: '分公司',
          top: '24%',
          left: '66%',
          pointTop: '20%',
          pointLeft: '68%',
        },
        {
          id: 't-06',
          name: '分公司',
          top: '39%',
          left: '71.5%',
          pointTop: '35%',
          pointLeft: '73.7%',
        },
      ],
      yichang03: [
        /*   { id:'t-00',name:'总公司', top: '32.5%' ,left: '41.5%', pointTop:'30.4%', pointLeft: '38.8%'},
        { id:'t-01',name:'分公司', top: '27.5%' ,left: '23.5%', pointTop:'23.6%', pointLeft: '26%'},
        { id:'t-02',name:'分公司', top: '40%' ,left: '22%', pointTop:'36%', pointLeft: '24.5%'},
        { id:'t-03',name:'分公司', top: '46.5%' ,left: '27%', pointTop:'42.8%', pointLeft: '31.8%'},
        { id:'t-04',name:'分公司', top: '70%' ,left: '48%', pointTop:'69.5%', pointLeft: '45.5%'},
        { id:'t-05',name:'分公司', top: '25%' ,left: '66%', pointTop:'21.3%', pointLeft: '68%'},
        { id:'t-06',name:'分公司', top: '40%' ,left: '71.5%', pointTop:'36.3%', pointLeft: '73.7%'}, */
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

      userData: undefined, // 用户数据
      defaultPath: [],
      // 城市坐标"
      yiChang_city: '203+地市',

      // 所有公司 - 信息
      companyList: [],
      // 位置图标
      icon2,
    }
  },
  beforeMount() {
    this.constituentCompany = this.earth01
  },
  mounted() {
    // session中取到权限数据
    this.userData = JSON.parse(sessionStorage.getItem('user'))
    if (this.userData.hasOwnProperty('tenantId')) {
      //
      this.getCompanyIntroduceLocation(this.userData.tenantId)
    }
    // console.log('userData:',this.userData);

    this.currMapUrl = this.mapList[0].url
    this.routerList = JSON.parse(sessionStorage.getItem('routerList') || '[]')
    if (this.routerList.length >= 6) {
      this.routerList = this.routerList.slice(0, 6)
    }
  },

  methods: {
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
  <div style="width: 100%; height: 100%; position: relative">
    <!--    <scale-box v-bind="styleSize"> -->
    <div
      class="mapScreen"
      :style="`background-image:url(${currMapUrl});`"
    >
      <!-- <div class='headCompany'>总公司</div> -->

      <!-- 地图名称 -->
      <div
        v-for="(item, index) in constituentCompany"
        :key="index"
        class="company-name"
        :style="`top: calc(${item.top} - 28px);left: calc(${item.left} - 20px);`"
        @click="clickCompanyName(item)"
      >
        <span :style="{ fontSize: nameId === item.id ? '1vw' : '0.5vw' }"> {{ item.name }}</span>
      </div>
      <!-- 地图圆点 :style="{'background': mapId === 'yichang03' ? '#efff1e': '#f0ff1e00'}" -->
      <div
        v-for="item in constituentCompany"
        :key="item.id"
        class="map-ponit"
        :style="`top:${item.top};left: ${item.left}`"
        @click="clickCompanyName(item)"
      >
        <img :src="icon2">
      </div>
    </div>
    <div class="bigScreen">
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
      <AnqiBiLeft />
    </div>
    <div class="bg-main-side-right">
      <AnqiBiRight />
    </div>
    <div class="bg-main-midle-bottom">
      <anqiBiMidBottom
        ref="anqiBiMidBottom"
        @setMapImage="setMapImage"
      />
    </div>
    <div class="bg-main-midle-top">
      <anqiBiMidTop :trainList="trainList" />
    </div>
    <!--  <div class="bg-main">
		<div class="bg-main-side">
			<AnqiBiLeft />
		</div>

      <div class="bg-main-middle-buttom">
        <anqiBiMidBottom @setMapImage="setMapImage"></anqiBiMidBottom>
      </div>
      <div class="bg-main-side">
        <AnqiBiRight />
      </div>
    </div>
   </scale-box> -->
  </div>
</template>

<style scoped lang="scss">
.mapScreen {
  z-index: 2;
  position: absolute;
  //width: 1700px;
  //height: 780px;
  width: 80%;
  height: 82%;
  top: 57%;
  left: 51%;
  transform: translate(-50%, -50%);
  margin: auto;
  //background-image: url('~@/assets/anqiBi/worldMapIcon.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  .headCompany {
    width: 6vw;
    height: 3.5vh;
    top: 29.5%;
    left: 33.5%;
    position: absolute;
    color: #ffffff;
    font-size: 1.15vw;
    line-height: 3vh;
    text-align: center;
  }

  .company-name {
    z-index: 10;
    /* width: 6vw; */
    width: auto;
    height: 4vh;
    position: absolute;
    span {
      z-index: 11;
      color: #ffffff;
      font-size: 0.5vw;
      line-height: 3vh;
      text-align: center;
    }
    span:hover {
      z-index: 11;
      color: #fff204;
      font-size: 1vw;
      line-height: 3vh;
      text-align: center;
    }
  }
  .map-ponit {
    z-index: 12;
    position: absolute;
    cursor: pointer;
    width: 25px;
    height: 25px;
    > img {
      width: 25px;
      height: 25px;
    }
    /*background:#efff1e;
    border: 3px solid #ed9f2ac9;
    border-radius: 50%; */
  }

  /*   .company-name:hover {
	z-index: 100;
	width: 6vw;
    height: 4vh;
	color: #fff204;
	font-size: 1vw;
	line-height: 3vh;
	text-align: center;
  } */
}
.bigScreen {
  z-index: 1;
  position: absolute;
  width: 100%;
  height: 100%;
  //width: 1920px;
  //height: 937px;
  //height: calc(100vh - 50px);
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
  background-image: url('~@/assets/anqiBi/left-bg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
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
