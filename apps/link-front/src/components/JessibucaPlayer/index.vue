<script>
import { loadJessibuca } from '@/utils/loadJessibuca'

export default {
  name: 'JessibucaPlayer',
  props: {
    videoUrl: {
      type: String,
      default: '',
    },
    id: {
      type: Number,
      required: true,
    },
    setHeight: {
      type: String,
      default: '100%',
    },
    controlAutoHide: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      $jessibuca: null,
      videoLoaded: false,
      jessibucaLoading: false,
    }
  },
  watch: {
    videoUrl: {
      handler(v) {
        if (v) {
          this.$nextTick(() => {
            this.init()
          })
        }
        if (!v && this.$jessibuca) {
          this.$jessibuca.destroy()
        }
      },
      immediate: true,
    },
  },
  methods: {
    async init() {
      // 防止重复加载
      if (this.jessibucaLoading) {
        return
      }

      try {
        this.jessibucaLoading = true
        this.videoLoaded = false

        // 动态加载 Jessibuca
        await loadJessibuca()

        // 确保 Jessibuca 已加载
        if (!window.Jessibuca) {
          throw new Error('Jessibuca 加载失败')
        }

        this.$jessibuca = new window.Jessibuca({
          decoder: 'jessibuca/decoder.js',
          // useMSE: true,
          container: this.$refs.jessibuca_player,
          videoBuffer: 0.2, // 设置最大缓冲时长，单位毫秒，播放器会自动消除延迟。
          forceNoOffscreen: true, // 是否不使用离屏模式（提升渲染能力）
          hasAudio: true, // 是否有音频
          rotate: 0, // 设置旋转角度，只支持，0(默认) ，180，270 三个值
          isResize: false, // 1.当为true的时候：视频画面做等比缩放后,高或宽对齐canvas区域,画面不被拉伸,但有黑边;2.当为false的时候：视频画面完全填充canvas区域,画面会被拉伸
          isFullSize: true, // 当为true的时候：视频画面做等比缩放后,完全填充canvas区域,画面不被拉伸,没有黑边,但画面显示不全
          debug: false, // 是否开启控制台调试打印
          timeout: 30, // 设置超时时长, 单位秒,在连接成功之前和播放中途,如果超过设定时长无数据返回,则回调timeout事件
          supportDblclickFullscreen: true, // 是否支持屏幕的双击事件，触发全屏，取消全屏事件。
          showBandwidth: true, // 是否显示网速
          controlAutoHide: this.controlAutoHide, // 是否开启控制条自动隐藏
          operateBtns: {
            // 配置功能
            fullscreen: true, // 是否显示全屏按钮
            screenshot: true, // 是否显示截图按钮
            play: true, // 是否显示播放暂停按钮
            audio: true, // 是否显示声音按钮
          },
          keepScreenOn: false, // 开启屏幕常亮，在手机浏览器上, canvas标签渲染视频并不会像video标签那样保持屏幕常亮。
          isNotMute: false, // 是否开启声音，默认是关闭声音播放的。
          loadingText: '加载中...', // 加载过程中文案。
          background: '', // 背景图片。
        })
        // 事件：
        this.jessibuca_load()
        // 1. 监听 $jessibuca 初始化事件。
        this.$jessibuca.on('load', () => {
          this.jessibuca_load()
        })
        // 2. 信息，包含错误信息
        this.$jessibuca.on('log', data => this.jessibuca_log(data))
        // 3. 触发暂停事件
        this.$jessibuca.on('pause', this.jessibuca_pause)
        // 4. 触发播放事件
        this.$jessibuca.on('play', this.jessibuca_play)
        // 5. 当前是否全屏
        this.$jessibuca.on('fullscreen', this.jessibuca_fullscreen)
        // 6. 触发声音事件，返回boolean值
        this.$jessibuca.on('mute', this.jessibuca_mute)
        // 7. 当解析出音频信息时回调
        this.$jessibuca.on('audioInfo', this.jessibuca_audioInfo)
        // 8. 当解析出视频信息时回调
        this.$jessibuca.on('videoInfo', this.jessibuca_videoInfo)
        // 9. 错误信息
        this.$jessibuca.on('error', this.jessibuca_error)
        // 10. 当设定的超时时间内无数据返回,则回调
        this.$jessibuca.on('timeout', this.jessibuca_timeout)
        // 11. 流状态统计，流开始播放后回调，每秒1次
        this.$jessibuca.on('stats', this.jessibuca_stats)
        // 12. 渲染性能统计，流开始播放后回调，每秒1次
        this.$jessibuca.on('performance', this.jessibuca_performance)
        // 13. 当前网速， 单位KB 每秒1次,
        this.$jessibuca.on('kBps', this.jessibuca_kBps)
      }
      catch (error) {
        console.error('Jessibuca 初始化失败:', error)
        this.$message?.error('视频播放器加载失败，请刷新页面重试')
      }
      finally {
        this.jessibucaLoading = false
      }
    },
    // 事件：
    jessibuca_load() {
      // 监听 $jessibuca 初始化事件。
      console.log('on load')
      console.log('module', this.videoUrl)
      this.methods_play(this.videoUrl)
    },
    jessibuca_log(data) {
      // 信息，包含错误信息
      console.log('on log', data)
    },
    jessibuca_pause(flag) {
      // 触发暂停事件
      console.log('on pause', flag)
    },
    jessibuca_play(flag) {
      // 触发播放事件
      console.log('on play', flag)
    },
    jessibuca_fullscreen(flag) {
      // 当前是否全屏
      console.log('on fullscreen', flag)
      if (flag) {
        const myEvent = new Event('resize')
        setTimeout(() => {
          window.dispatchEvent(myEvent)
        }, 100)
      }
    },
    jessibuca_mute(flag) {
      // 触发声音事件
      console.log('on mute', flag)
    },
    jessibuca_audioInfo(data) {
      // 当解析出音频信息时回调，2个回调参数
      // 1. numOfChannels：声频通道
      // 2. sampleRate 采样率
      console.log('audioInfo', data)
    },
    jessibuca_videoInfo(data) {
      // 当解析出视频信息时回调
      // 1. w：视频宽
      // 2. h：视频高
      console.log('videoInfo', data)
    },
    jessibuca_error(error) {
      // 错误信息
      console.log('error:', error)
    },
    jessibuca_timeout() {
      // 当设定的超时时间内无数据返回,则回调
      console.log('timeout')
    },
    jessibuca_stats(s) {
      // 流状态统计，流开始播放后回调，每秒1次
      // 1. buf: 当前缓冲区时长，单位毫秒
      // 2. fps: 当前视频帧率,
      // 3. abps: 当前音频码率，单位bit,
      // 4. vbps: 当前视频码率，单位bit，
      // 5. ts:当前视频帧pts，单位毫秒
      // console.log('stats is', s);
      this.videoLoaded = true
    },
    jessibuca_performance(performance) {
      // 渲染性能统计，流开始播放后回调，每秒1次。
      // 0: 表示卡顿、1: 表示流畅、2: 表示非常流程
      console.log('performance', performance)
    },
    jessibuca_kBps(kBps) {
      // 当前网速， 单位KB 每秒1次,
      // console.log('kBps', kBps);
    },
    // 方法：
    methods_play(url) {
      // 播放
      if (this.$jessibuca.hasLoaded()) {
        this.$jessibuca.play(url)
      }
      else {
        this.$jessibuca.on('load', () => {
          this.$jessibuca.play(url)
        })
      }
    },
    methods_mute() {
      // 静音
      this.$jessibuca.mute()
    },
    methods_cancelMute() {
      // 取消静音
      this.$jessibuca.cancelMute()
    },
    methods_pause() {
      // 暂停
      this.$jessibuca.pause()
    },
    methods_setVolume(volume) {
      // 设置音量
      this.$jessibuca.setVolume(volume)
    },
    methods_setRotate(rotate) {
      // 设置旋转角度 0\180\270
      this.$jessibuca.setRotate(rotate)
    },
    methods_destroy() {
      // 关闭视频，释放底层资源
      if (this.$jessibuca) {
        this.$jessibuca.destroy()
      }
    },
    methods_fullscreen(flag) {
      // 全屏(取消全屏)播放视频
      this.$jessibuca.setFullscreen(flag)
    },
    methods_screenShot() {
      // 截图
      // 1. screenshot(filename, format, quality)
      // 2. {string} filename、 {string} format、{number} quality
      // 3.filename: 保存的文件名, 默认 时间戳、format : 截图的格式，可选png或jpeg或者webp ,默认 png、quality: 可选参数，当格式是jpeg或者webp时，压缩质量，取值0 ~ 1 ,默认 0.92
      this.$jessibuca.screenshot()
    },
    methods_setBufferTime(time) {
      // 设置最大缓冲时长，单位秒，播放器会自动消除延迟。
      // {number} time
      this.$jessibuca.setBufferTime(Number(time))
    },
    methods_setScaleMode(mode) {
      // 设置播放器填充
      // 1. 0 视频画面完全填充canvas区域,画面会被拉伸 等同于参数 isResize 为false
      // 2. 1 视频画面做等比缩放后,高或宽对齐canvas区域,画面不被拉伸,但有黑边 等同于参数 isResize 为true
      // 3. 2 视频画面做等比缩放后,完全填充canvas区域,画面不被拉伸,没有黑边,但画面显示不全 等同于参数 isFullSize 为true
      this.$jessibuca.setScaleMode(Number(mode))
    },
    restartPlay() {
      // 重新加载
      this.methods_destroy()
      this.methods_play(this.videoUrl)
    },
  },
}
</script>

<template>
  <div class="jessibuca-player" :style="{ width: '100%', height: setHeight }">
    <div
      :id="id"
      ref="jessibuca_player"
      class="container"
    />
  </div>
</template>
