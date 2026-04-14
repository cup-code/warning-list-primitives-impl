<script>
export default {
  name: 'AppMain',
  computed: {
    key() {
      return this.$route.path
    },
  },
}
</script>

<template>
  <section
    class="app-main"
    :style="{
      minHeight: $store.state.settings.tagModel
        ? 'calc(100vh - 90px)'
        : 'calc(100vh - 45px)',
    }"
  >
    <transition name="fade-transform" mode="out-in">
      <!-- <keep-alive> -->
      <router-view :key="key" />
      <!-- </keep-alive> -->
    </transition>
  </section>
</template>

<style lang="scss" scoped>
.app-main {
  /*50 = navbar  */
  width: 100%;
  position: relative;
  top: 0;
  left: 0;
  overflow: hidden;
  box-sizing: border-box;
}
.fixed-header + .app-main {
  padding-top: 45px !important;
}

// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    // padding-right: 15px;
  }
}
</style>
