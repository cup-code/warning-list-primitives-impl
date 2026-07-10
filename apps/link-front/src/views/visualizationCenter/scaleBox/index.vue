<script>
export default {
  name: 'scaleBox',
  props: {
    width: {
      type: Number,
      default: () => {
        return 1920
      },
    },
    height: {
      type: Number,
      default: () => {
        return 1080
      },
    },
  },
  data() {
    return {
      scale: 0,
      // width: 1920,
      // height: 1080,
    }
  },
  mounted() {
    this.setScale()
    window.addEventListener('resize', this.debounce(this.setScale))
  },
  methods: {
    getScale() {
      // 固定好16：9的宽高比，计算出最合适的缩放比
      const { width, height } = this
      const wh = window.innerHeight / height
      const ww = window.innerWidth / width
      // console.log(ww < wh ? ww : wh);
      return ww < wh ? ww : wh
    },
    setScale() {
      // 获取到缩放比例，设置它
      this.scale = this.getScale()
      if (this.$refs.ScaleBox) {
        this.$refs.ScaleBox.style.setProperty('--scale', this.scale)
      }
    },
    debounce(fn, delay) {
      const delays = delay || 500
      let timer
      return function () {
        const th = this
        const args = arguments
        if (timer) {
          clearTimeout(timer)
        }
        timer = setTimeout(() => {
          timer = null
          fn.apply(th, args)
        }, delays)
      }
    },
  },
}
</script>

<template>
  <div
    ref="ScaleBox"
    class="ScaleBox"
    :style="{
      width: `${width}px`,
      height: `${height}px`,
    }"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
#ScaleBox {
  --scale: 1;
}

.ScaleBox {
  position: absolute;
  transform: scale(var(--scale)) translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  transform-origin: 0 0;
  left: 50%;
  top: 50%;
  transition: 0.3s;
  z-index: 999;
  // background: rgba(255, 0, 0, 0.3);
}
</style>
