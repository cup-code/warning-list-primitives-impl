<script>
import flvjs from "@/utils/flv.min.js";
import { mapState } from "vuex";

export default {
  name: "WarningVideo",
  data() {
    return {
      Flv: null,
      videoUrl: "",
    };
  },
  computed: {
    ...mapState("cesium3dStore", ["cameraInfo"]),
  },
  watch: {
    cameraInfo: {
      handler(newVal) {
        console.log(newVal, "newVal");
        if (newVal && this.$refs.videoElement) {
          // 判断是否是FLV流
          if (newVal.streamUrl) {
            this.videoUrl = newVal.streamUrl;
            this.$nextTick(() => {
              this.setupFlvPlayer(newVal.streamUrl);
            });
          } else {
            // 普通视频文件（mp4等）
            this.destroyFlvPlayer();
            this.$nextTick(() => {
              this.$refs.videoElement.load();
              this.$refs.videoElement.play();
            });
          }
        }
      },
      immediate: true,
      deep: true,
    },
  },
  beforeDestroy() {
    this.destroyFlvPlayer();
  },
  methods: {
    destroyFlvPlayer() {
      if (this.Flv) {
        try {
          this.Flv.pause();
          this.Flv.unload();
          this.Flv.detachMediaElement();
          this.Flv.destroy();
        } catch (error) {
          console.error("销毁播放器时出错:", error);
        } finally {
          this.Flv = null;
        }
      }
    },
    setupFlvPlayer(url) {
      if (!url) {
        this.$message.warning("摄像头流地址为空");
        return;
      }

      // 设置一个延时，等待DOM渲染
      setTimeout(() => {
        if (!flvjs.isSupported()) {
          console.error("FLV.js is not supported in this browser.");
          this.$message.error("当前浏览器不支持视频播放");
          return;
        }

        try {
          // 销毁旧的播放器实例
          this.destroyFlvPlayer();

          this.flvPlay = flvjs.createPlayer({
            url: url,
            type: "flv",
            autoPlay: true,
            isLive: true,
            bufferLength: 3,
            hasAudio: false, // 禁用音频解码，解决不支持的音频编解码器问题
          });

          this.flvPlay.attachMediaElement(this.$refs.videoElement);

          // 添加错误事件监听器 - 关键修复！
          this.flvPlay.on(flvjs.Events.ERROR, (errorType, errorDetail) => {
            console.error("FLV播放器错误:", errorType, errorDetail);

            let errorMessage = "视频加载失败";

            if (errorType === flvjs.ErrorTypes.NETWORK_ERROR) {
              errorMessage = "网络错误：无法连接视频流";
            } else if (errorType === flvjs.ErrorTypes.MEDIA_ERROR) {
              errorMessage = "媒体错误：视频格式不支持或损坏";
            } else if (errorType === flvjs.ErrorTypes.OTHER_ERROR) {
              errorMessage = `播放错误：${errorDetail || "未知错误"}`;
            }

            this.$message.error(errorMessage);
          });

          // 添加加载完成事件
          this.flvPlay.on(flvjs.Events.LOADING_COMPLETE, () => {
            console.log("视频流加载完成");
          });

          this.flvPlay.load();
          this.flvPlay.play();
        } catch (error) {
          console.error("创建FLV播放器失败:", error);
          this.$message.error(`视频播放器初始化失败：${error.message}`);
        }
      }, 200);
    },
  },
};
</script>

<template>
  <div class="box-border h-full">
    <div
      class="text-white mb-2 p-1 w-1/3 rounded-sm"
      style="background-image: linear-gradient(30deg, #0f445d 10%, transparent 80%)"
    >
      视频监控
    </div>
    <div class="flex items-center justify-center h-[20vh] rounded-lg overflow-hidden">
      <!-- <video
        ref="videoElement"
        controls
        autoplay
        crossorigin="anonymous"
        width="300px"
        height="300px"
      >
        <source :src="videoUrl" type="video/mp4" />
      </video> -->

      <video
        ref="videoElement"
        controls
        crossorigin="anonymous"
        width="100%"
        height="100%"
      />
    </div>
    <!-- <video
      ref="videoElement"
      controls
      crossorigin="anonymous"
      width="100%"
      height="100%"
    ></video> -->
  </div>
</template>
