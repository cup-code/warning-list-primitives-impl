<script>
export default {
  name: 'cardItem',
  props: {
    // 标题
    title: {
      type: String,
      default: '',
    },
    // 是否查看更多
    labelTxt: {
      type: Boolean,
      default: false,
    },
    // 高度
    height: {
      type: Number,
      default: 22.5,
    },
    // 宽度
    width: {
      type: Number,
      default: 25,
    },
  },
}
</script>

<template>
  <div
    class="card-item"
    :style="`height:${height}vh;width:${width}vw`"
  >
    <div
      v-if="title"
      class="label-title"
      :style="`width:${width - 1}vw`"
    >
      <div class="label-text">
        {{ title }}
      </div>
      <div
        v-if="labelTxt"
        class="label-txt"
      >
        查看更多 >
      </div>
    </div>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.card-item {
  display: flex;
  flex-wrap: wrap;
  position: relative;
  .label-title {
    color: #ffffff;
    width: 24vw;
    height: 4.5vh;
    margin: 1vh 0;
    background-image: url('~@/assets/anqiBi/titleBg.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    display: flex;
    justify-content: space-between;
    .label-text {
      // float: left;
      height: 4.5vh;
      margin-left: 2.3vw;
      font-size: 1.1vw;
      font-weight: 500;
      line-height: 4.5vh;
    }
    .label-txt {
      // float: right;
      height: 4.5vh;
      color: #91a5c3;
      font-size: 0.7vw;
      line-height: 6vh;
    }
  }
}
</style>
