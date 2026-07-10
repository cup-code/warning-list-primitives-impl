<script>
import { mapState } from 'vuex'
import AppMain from '@/layout/components/AppMain'
import AppMainMagic from '@/layout/components/AppMainMagic'
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar/index.vue'

export default {
  name: 'LRLayout',
  components: {
    Navbar,
    Sidebar,
    AppMain,
    AppMainMagic,
  },
  props: ['base3D'],
  computed: {
    ...mapState({
      sidebar: state => state.app.sidebar,
      fixedHeader: state => state.settings.fixedHeader,
    }),
    classObj() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
      }
    },
  },
}
</script>

<template>
  <div
    :class="classObj"
    class="app-wrapper"
  >
    <sidebar class="sidebar-container" />
    <div class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <navbar />
      </div>
      <!-- 常规内容区域 -->
      <app-main v-if="!base3D" />

      <!-- magic: 带3D底图的内容区域 -->
      <app-main-magic v-if="base3D" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
@import '~@/styles/variables.scss';

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;
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
</style>
