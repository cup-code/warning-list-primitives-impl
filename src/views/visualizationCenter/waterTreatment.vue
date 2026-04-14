<script>
import Treatment from './waterTreatment/treatment.vue'

export default {
  name: 'visualizationCenter',
  components: {
    Treatment,
  },
  data() {
    return {
      title: '日常生产批次安排',
      routerList: [],
    }
  },
}
</script>

<template>
  <div style="width: 100vw; height: 100vh">
    <!-- <div class="mapScreen" id="chart_map"></div> -->
    <img
      src="@/assets/anqiBi/bg.png"
      class="fixed bottom-0 left-0 right-0 top-0 h-screen w-screen"
      loading="lazy"
    >
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
        <div style="width: 100%; height: 50%; line-height: 1.25vw; color: #00e7ff; cursor: pointer">
          进入管理中心>>
        </div>
      </div>
    </div>

    <Treatment />
  </div>
</template>

<style lang="scss" scoped>
.bg-titleTop {
  width: 100%;
  height: 13vh;
  position: relative;
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
// }
</style>
