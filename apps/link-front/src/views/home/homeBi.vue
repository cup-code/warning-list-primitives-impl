<script>
import BiLeft from './biComps/BiLeft'
import BiMid from './biComps/BiMid'
import BiRight from './biComps/BiRight'

export default {
  name: 'homeBi',
  components: { BiLeft, BiMid, BiRight },
  data() {
    return {
      isLoading: false,
      title: '',
      routerList: [],
      defaultPath: '',
    }
  },
  created() {
    this.title
      = JSON.parse(localStorage.getItem('globalData'))?.appSystemName || '两山智联云'
    // 获取登录用户拥有的路由权限
    this.routerList = JSON.parse(sessionStorage.getItem('routerList') || '[]')
    if (this.routerList.length >= 6) {
      this.routerList = this.routerList.slice(0, 6)
    }
  },
  methods: {
    toCenterClick() {
      this.change(this.routerList[0])
    },

    change(item) {
      this.defaultPath = item.path
      this.openDefaultMenu(item)
      console.log(item, 333)
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
  <div v-loading="isLoading" class="xingfa-bi">
    <div class="bi-top">
      <div class="bi-top-title">
        {{ title }}
      </div>
      <div class="bi-top-right" @click="toCenterClick">
        <div style="width: 100%; height: 50%; line-height: 0.8333vw">
          您好，{{ $store.state.user.user.fullName }}
        </div>
        <div
          style="
            width: 100%;
            height: 50%;
            line-height: 1.25vw;
            font-size: 1vw;
            color: #00e7ff;
            cursor: pointer;
          "
        >
          进入管理中心>>
        </div>
      </div>
    </div>
    <div class="bi-main">
      <div class="bi-side">
        <BiLeft />
      </div>
      <BiMid ref="centerComp" :routerList="routerList" />
      <div class="bi-side">
        <BiRight />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.xingfa-bi {
  background-image: url("~@/assets/xingfa/layer.png");
  background-repeat: no-repeat;
  background-size: 102% 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  .bi-top {
    background-image: url("~@/assets/xingfa/top bg.png");
    background-size: 100% 100%;
    width: 100%;
    height: 8.05%;
    position: relative;
    color: #feffff;
    .bi-top-title {
      width: 43.6%;
      height: 42.52%;
      margin: auto;
      margin-top: 0.8333vw;
      font-size: 2vw;
      font-family: FZDaHei-B02;
      font-weight: 400;
      text-align: center;
    }
    .bi-top-right {
      position: absolute;
      top: 15%;
      right: 2.4%;
      width: 8.3333vw;
      height: 5vh;
      display: flex;
      flex-wrap: wrap;
      font-size: 0.9vw;
      z-index: 99;
    }
  }
  .bi-main {
    width: 100%;
    height: 91.94%;
    display: flex;
    color: #feffff;
    .bi-side {
      width: 24.5%;
      height: 100%;
    }
  }
}
</style>
