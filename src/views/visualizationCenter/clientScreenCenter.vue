<script>
import ClientBottom from './clientChart/clientBottom.vue'
import ClientLeft from './clientChart/clientLeft.vue'
import ClientMap from './clientChart/clientMap.vue'
import ClientRight from './clientChart/clientRight.vue'
import ScaleBox from './scaleBox/index.vue'

export default {
  name: 'visualizationCenter',
  components: {
    ScaleBox,
    ClientLeft,
    ClientRight,
    ClientBottom,
    ClientMap,
  },
  data() {
    return {
      title: '客户服务中心',
      routerList: [],
      currMapUrl: '',
      userData: undefined,
    }
  },
  beforeMount() {
    this.constituentCompany = this.earth01
  },
  mounted() {
    // session中取到权限数据
    this.userData = JSON.parse(sessionStorage.getItem('user'))
    // if (this.userData.hasOwnProperty('tenantId')) {
    // }

    this.routerList = JSON.parse(sessionStorage.getItem('routerList') || '[]')
    if (this.routerList.length >= 6) {
      this.routerList = this.routerList.slice(0, 6)
    }
  },
  methods: {
    toCenterClick() {
      console.log(this.routerList, 887)
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
    <ClientMap />
    <!-- <div class="mapScreen"></div> -->
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
      <ClientLeft />
    </div>
    <div class="bg-main-side-right">
      <ClientRight />
    </div>
    <div class="bg-main-midle-bottom">
      <ClientBottom />
    </div>
  </div>
</template>

<style scoped lang="scss">
.mapScreen {
  z-index: 2;
  position: absolute;
  width: 80%;
  height: 70%;
  top: 40%;
  left: 51%;
  transform: translate(-50%, -50%);
  margin: auto;
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
  }
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
      z-index: 4;
      font-size: 0.8vw;
    }
  }
}

.bg-main-side-left {
  z-index: 3;
  position: absolute;
  left: 0vh;
  bottom: 1.5vh;
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
  right: 2vh;
  top: 9vh;
  color: #feffff;
  width: 25vw;
  height: 62vh;
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
  width: 72vw;
  height: 27vh;
  bottom: 1vh;
  right: 4vh;
  // left: 50%;
  // transform: translateX(-50%);
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
