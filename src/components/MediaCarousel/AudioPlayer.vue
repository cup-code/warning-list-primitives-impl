<template>
  <div class="audio-player">
    <div class="audio-visualizer">
      <div class="audio-icon">
        <i class="el-icon-headset" />
      </div>
      <div class="audio-info">
        <div class="audio-name">
          {{ name || '音频文件' }}
        </div>
        <div class="audio-status">
          {{ isPlaying ? '正在播放' : '点击播放' }}
        </div>
      </div>
    </div>
    <audio
      ref="audioElement"
      :src="src"
      controls
      class="audio-controls"
      preload="metadata"
    >
      您的浏览器不支持音频播放
    </audio>
  </div>
</template>

<script>
export default {
  name: 'AudioPlayer',
  props: {
    src: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isPlaying: false,
    }
  },
  mounted() {
    const audio = this.$refs.audioElement
    if (audio) {
      audio.addEventListener('play', () => {
        this.isPlaying = true
      })
      audio.addEventListener('pause', () => {
        this.isPlaying = false
      })
      audio.addEventListener('ended', () => {
        this.isPlaying = false
      })
    }
  },
  beforeDestroy() {
    if (this.$refs.audioElement) {
      this.$refs.audioElement.pause()
    }
  },
  methods: {
    /**
     * 暂停音频
     */
    pause() {
      if (this.$refs.audioElement) {
        this.$refs.audioElement.pause()
      }
    },
    /**
     * 播放音频
     */
    play() {
      if (this.$refs.audioElement) {
        this.$refs.audioElement.play()
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.audio-player {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  padding: 40px 20px;

  .audio-visualizer {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .audio-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;

      i {
        font-size: 40px;
        color: #fff;
      }
    }

    .audio-info {
      text-align: left;

      .audio-name {
        font-size: 16px;
        font-weight: 500;
        color: #fff;
        margin-bottom: 6px;
      }

      .audio-status {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }

  .audio-controls {
    width: 100%;
    max-width: 400px;
    outline: none;
  }
}
</style>