<template>
  <div class="video-player">
    <video
      ref="videoElement"
      :src="src"
      controls
      class="video-content"
      :style="{ maxHeight: maxHeight }"
      preload="metadata"
    >
      您的浏览器不支持视频播放
    </video>
  </div>
</template>

<script>
export default {
  name: 'VideoPlayer',
  props: {
    src: {
      type: String,
      required: true,
    },
    maxHeight: {
      type: String,
      default: '400px',
    },
  },
  data() {
    return {
      hasError: false,
    }
  },
  watch: {
    src() {
      // 当源改变时重置状态
      this.hasError = false
      if (this.$refs.videoElement) {
        this.$refs.videoElement.load()
      }
    },
  },
  methods: {
    /**
     * 暂停视频
     */
    pause() {
      if (this.$refs.videoElement) {
        this.$refs.videoElement.pause()
      }
    },
    /**
     * 播放视频
     */
    play() {
      if (this.$refs.videoElement) {
        this.$refs.videoElement.play()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.video-player {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #000;
  border-radius: 4px;
  overflow: hidden;

  .video-content {
    max-width: 100%;
    width: 100%;
    outline: none;
  }
}
</style>