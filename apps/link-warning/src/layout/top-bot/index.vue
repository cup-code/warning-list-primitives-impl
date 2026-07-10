<script>
import { mapState } from 'vuex'
import AppMain from '@/layout/components/AppMain'
import AppMainMagic from '@/layout/components/AppMainMagic'
import TagBar from '@/layout/components/TagBar'
import Navbar from './components/Navbar'

export default {
  name: 'TBLayout',
  components: {
    Navbar,
    AppMain,
    AppMainMagic,
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
      fixedHeader: state => state.settings.fixedHeader,
    }),
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
        minHeight = 'calc(100vh - 90px)!important'
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
  <div class="tb-layout-container">
    <!-- 头部 -->
    <div :class="{ 'fixed-header': fixedHeader }">
      <navbar />
    </div>
    <!-- 页签 -->
    <div
      v-if="tagModel"
      class="tag-bg"
      :class="{ 'fixed-tag': fixedHeader }"
    >
      <TagBar class="tag-container" />
    </div>
    <!-- 常规内容区域 -->
    <app-main v-if="!base3D" />

    <!-- magic: 带3D底图的内容区域 -->
    <app-main-magic v-if="base3D" />
  </div>
</template>

<style lang="scss" scoped>
.tb-layout-container {
  min-height: 100%;
  position: relative;

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: 100%;
  }

  .fixed-tag {
    position: fixed;
    top: 45px;
    left: 0;
    z-index: 9;
  }

  .tag-bg {
    background: white;
    width: 100%;
    height: 45px;
    box-shadow: 0 1px 4px RGBA(0, 21, 41, 0.08);

    .tag-container {
      height: 100%;
      width: 100%;
      display: flex;
      justify-content: flex-start;
    }
  }
}
</style>
