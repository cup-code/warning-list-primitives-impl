<script>
export default {
  props: {
    // 标题
    title: {
      type: String,
      default: '',
    },
    // 高度
    height: {
      type: String,
      default: '28vh',
    },
    // 宽度
    width: {
      type: String,
      default: '25vw',
    },
  },
}
</script>

<template>
  <div
    class="card-item"
    :style="`height:${height};width:${width}`"
  >
    <div
      class="label"
      :style="`background-image:url(${require('@/assets/xingfa/labelitem.png').default});`"
    >
      <div
        class="label-icon"
        :style="`background-image:url(${require('@/assets/xingfa/label.png').default});`"
      />
      <div class="label-text">
        {{ title }}
      </div>
    </div>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.card-item {
  .label {
    background-repeat: no-repeat;
    background-size: 100% 100%;
    width: 100%;
    height: 2.5263vw;
    display: flex;
    .label-icon {
      background-image: url('~@/assets/xingfa/label.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
      width: 1.005vw;
      height: 1.005vw;
      margin: 0.73vw 0.95vw;
    }
    .label-text {
      font-size: 1vw;
      line-height: 2.5vw;
      width: 50%;
      height: 100%;
    }
  }
}
</style>
