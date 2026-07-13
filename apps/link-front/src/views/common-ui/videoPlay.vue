<script>
import flvjs from '@/utils/flv.min.js'

export default {
  name: 'VideoPlay',
  props: {
    videoUrl: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      flvPlayer: null,
    }
  },
  created() {
    this.videoUrl = localStorage.getItem('videoUrl')
    console.log(this.videoUrl)
  },
  mounted() {
    this.setupFlvPlayer()
  },
  beforeDestroy() {
    this.destroyPlayer()
  },
  methods: {
    destroyPlayer() {
      if (this.flvPlayer) {
        try {
          this.flvPlayer.pause()
          this.flvPlayer.unload()
          this.flvPlayer.detachMediaElement()
          this.flvPlayer.destroy()
        }
        catch (error) {
          console.error('销毁播放器时出错:', error)
        }
        finally {
          this.flvPlayer = null
        }
      }
    },
    setupFlvPlayer() {
      if (!flvjs.isSupported()) {
        console.error('FLV.js is not supported in this browser.')
        this.$message?.error('当前浏览器不支持视频播放')
        return
      }

      if (!this.videoUrl) {
        console.error('视频URL为空')
        this.$message?.warning('视频地址无效')
        return
      }

      try {
        // 销毁旧的播放器实例
        this.destroyPlayer()

        this.flvPlayer = flvjs.createPlayer({
          url: this.videoUrl,
          type: 'flv',
          autoPlay: true,
          isLive: true,
          bufferLength: 3,
          hasAudio: false, // 禁用音频解码，解决不支持的音频编解码器问题
        })

        this.flvPlayer.attachMediaElement(this.$refs.videoElement)

        // 添加错误事件监听器
        this.flvPlayer.on(flvjs.Events.ERROR, (errorType, errorDetail) => {
          console.error('FLV播放器错误:', errorType, errorDetail)

          let errorMessage = '视频加载失败'

          if (errorType === flvjs.ErrorTypes.NETWORK_ERROR) {
            errorMessage = '网络错误：无法连接视频流'
          }
          else if (errorType === flvjs.ErrorTypes.MEDIA_ERROR) {
            errorMessage = '媒体错误：视频格式不支持或损坏'
          }
          else if (errorType === flvjs.ErrorTypes.OTHER_ERROR) {
            errorMessage = `播放错误：${errorDetail || '未知错误'}`
          }

          this.$message?.error(errorMessage)
        })

        // 添加加载完成事件
        this.flvPlayer.on(flvjs.Events.LOADING_COMPLETE, () => {
          console.log('视频流加载完成')
        })

        this.flvPlayer.load()
        this.flvPlayer.play()
      }
      catch (error) {
        console.error('创建FLV播放器失败:', error)
        this.$message?.error(`视频播放器初始化失败：${error.message}`)
      }
    },
  },
}
</script>

<template>
  <div>
    <video ref="videoElement" controls />
  </div>
</template>

<style scoped>
  video {
    width: 100%;
    height: auto;
  }
</style>
