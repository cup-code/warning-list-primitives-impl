<script>
import logo from '@/assets/logo.png'
import slogo from '@/assets/slogo.png'

export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true,
    },
  },
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
    // 系统logo，首先取用户所属公司的logo。其次取系统设置的logo，最后取静态资源
    systemlogo() {
      return this.userInfo.companyLogo
        ? this.filePrefix + this.userInfo.companyLogo
        : this.globalData.companyLogo
          ? this.filePrefix + this.globalData.companyLogo
          : this.logo
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
  <div
    class="sidebar-logo-container"
    :class="{ collapse }"
  >
    <transition name="sidebarLogoFade">
      <router-link
        v-if="collapse"
        key="collapse"
        class="sidebar-logo-link"
        to=""
      >
        <img
          :src="shrinkLogo"
          class="sidebar-logo-magnify"
        >
      </router-link>
      <router-link
        v-else
        key="expand"
        class="sidebar-logo-link"
        to=""
      >
        <img
          :src="systemlogo"
          class="sidebar-logo-narrow"
        >
      </router-link>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  background: #2b2f3a;
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & .sidebar-logo-magnify {
      width: 36px;
      height: 36px;
      vertical-align: middle;
      // margin-left: 5px;
    }
    & .sidebar-logo-narrow {
      width: 190px;
      height: 32px;
      vertical-align: middle;
      margin-right: 12px;
      margin-top: 5px;
    }
    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #fff;
      font-weight: 600;
      line-height: 50px;
      font-size: 14px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;

      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

  &.collapse {
    .sidebar-logo {
      margin-right: 0px;
    }
  }
}
</style>
