<script>
import logo from '@/assets/logo.png'
import slogo from '@/assets/slogo.png'

export default {
  name: 'tbLayoutLogo',
  data() {
    return {
      logo,
      slogo,
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.user.user || JSON.parse(sessionStorage.getItem('user')) || {}
    },
    // 伸缩logo，首先取用户所属公司的收缩logo。其次取系统设置的收缩logo，最后取静态资源
    shrinkLogo() {
      return this.userInfo.shrinkLogo
        ? this.filePrefix + this.userInfo.shrinkLogo
        : this.globalData.shrinkLogo
          ? this.filePrefix + this.globalData.shrinkLogo
          : this.slogo
    },
  },
  created() {
    this.getPrefix()
    this.globalData = JSON.parse(localStorage.getItem('globalData')) || {}
  },
}
</script>

<template>
  <div class="tbLayout-logo-container">
    <img
      :src="shrinkLogo"
      class="sidebar-logo"
    >
  </div>
</template>

<style lang="scss" scoped>
@import '~@/styles/variables.scss';
.tbLayout-logo-container {
  background: transparent;
  position: relative;
  height: 50px;
  line-height: 50px;
  padding: 0 12px;
  max-width: $sideBarWidth;
  display: flex;
  align-items: center;
  & .sidebar-logo {
    width: 40px;
    height: 40px;
    vertical-align: middle;
    margin-left: 5px;
    // margin-right: 12px;
    // border-radius: 50%;
  }

  & .sidebar-title {
    margin: 0;
    color: #000;
    font-weight: 600;
    line-height: normal;
    font-size: 14px;
    font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
    vertical-align: middle;
    overflow: auto;
    height: 100%;
    padding: 6px 0;
    display: flex;
    align-items: center;
  }
}
</style>
