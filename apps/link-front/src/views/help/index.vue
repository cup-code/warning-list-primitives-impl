<script>
export default {
  computed: {
    src() {
      return this.$route.query.src
    },
    // 是否是企业版   0不是  1是
    isCo() {
      return Boolean(+this.$route.query.isCo)
    },
  },
}
</script>

<template>
  <div class="help-center">
    <div class="top-con">
      <div class="top-left">
        <img src="../../assets/login/logoTitle.png">
        <span v-if="isCo">企业版</span>
      </div>
    </div>
    <div class="bot-con">
      <iframe
        :src="src"
        frameborder="0"
        style="width: 100%; height: 100%"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.help-center {
  background-image: url('../../assets/login/bg1.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  .top-con {
    background: rgba(255, 255, 255, 0.1);
    height: 50px;
    padding: 0 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .top-left {
      height: 100%;
      display: flex;
      align-items: center;
      img {
        height: 70%;
      }
      span {
        color: #fff;
        background-color: #409eff;
        border-radius: 5px;
        padding: 4px 10px;
        margin-left: 6px;
        font-size: 12px;
        font-weight: bold;
        margin-left: 16px;
      }
    }
  }
  .bot-con {
    flex: 1;
    overflow: hidden;
  }
}
</style>
