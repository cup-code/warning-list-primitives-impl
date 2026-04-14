<script>
import { mapState } from 'vuex'
import AppMain from '@/layout/components/AppMain'
import AppMainMagic from '@/layout/components/AppMainMagic'
import TagBar from '@/layout/components/TagBar'
import AiAssistant from '../components/AiAssistant.vue'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar/index.vue'

export default {
  name: 'LTLayout',
  components: {
    AiAssistant,
    Navbar,
    AppMain,
    AppMainMagic,
    Sidebar,
    TagBar,
  },
  props: ['base3D'],
  data() {
    return {
      isMounted: false,
    }
  },
  computed: {
    ...mapState({
      sidebar: state => state.app.sidebar,
      fixedHeader: state => state.settings.fixedHeader,
      userTenantId: state => state.user.user.tenantId,
    }),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
      }
    },
    tagModel() {
      if (this.isMounted)
        this.setWindow()
      return this.$store.state.settings.tagModel
    },
  },
  mounted() {
    this.isMounted = true
    this.setWindow()
  },
  methods: {
    setWindow() {
      const model = this.$store.state.settings.tagModel
      const normalDom = document.querySelector('.app-main')
      const magicDom = document.querySelector('.app-main-magic')
      const sideDom = document.querySelectorAll('.app-main-magic .side')
      let minHeight = 'calc(100vh - 45px)'
      let paddingTop = '45px'
      // 是否开启了页签模式
      if (model) {
        minHeight = 'calc(100vh - 90px)'
        paddingTop = '90px'
      }
      // 是否开启了固定header
      if (!this.fixedHeader)
        paddingTop = '0px'
      // 是否是3d页面
      if (this.base3D) {
        magicDom.style.minHeight = minHeight
        magicDom.style.paddingTop = paddingTop
        for (const item of sideDom) {
          item.style.minHeight = minHeight
          item.style.top = paddingTop
        }
      }
      else {
        normalDom.style.minHeight = minHeight
        normalDom.style.paddingTop = paddingTop
      }
    },
  },
}
</script>

<template>
  <div :class="classObj" class="lt-wrapper">
    <sidebar class="sidebar-container" />
    <div class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <navbar />
      </div>
      <!-- 页签 -->
      <div
        v-if="tagModel"
        class="tag-bg"
        :class="{ 'fixed-tag': fixedHeader, 'fixed-left': !sidebar.opened }"
      >
        <TagBar class="tag-container" />
      </div>
      <!-- 常规内容区域 -->
      <app-main v-if="!base3D" />

      <AiAssistant v-if="userTenantId === '1'" />
      <!-- magic: 带3D底图的内容区域 -->
      <app-main-magic v-if="base3D" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";
@import "~@/styles/variables.scss";
.lt-wrapper {
  // @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
  &:after {
    content: "";
    display: table;
    clear: both;
  }
}
.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$sideBarWidth});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}
.tag-bg {
  background: white;
  width: 100%;
  height: 45px;
  box-shadow: 0 1px 4px RGBA(0, 21, 41, 0.08);
}
.tag-container {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: flex-start;
}
.fixed-tag {
  position: fixed;
  width: calc(100% - #{$sideBarWidth});
  top: 45px;
  right: 0;
  z-index: 9;
  transition: width 0.28s;
}
.fixed-left {
  width: calc(100% - 60px);
}
</style>
