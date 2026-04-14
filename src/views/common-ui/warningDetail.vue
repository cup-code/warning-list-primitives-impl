<script>
import {
  useMutation,
  useQueryClient,
} from '@tanstack/vue-query'
import {
  getCurrentInstance,
  nextTick,
  onMounted,
  ref,
  toRefs,
  watch,
} from 'vue'
import {
  clientWarningAudit,
  maintenanceWarningAudit,
} from '@/http/videoWarning/warning-api'
// import videoPlay from "./videoPlay.vue"

export default {
  name: 'WarningDetail',
  // components: {
  //   videoPlay
  // },
  props: {
    showDetail: {
      type: Boolean,
      default: false,
    },
    detailForm: {
      type: Object,
      default: () => ({}),
    },
    apiType: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const queryClient = useQueryClient()
    const filePrefix = ref(
      JSON.parse(localStorage.getItem('globalData')).minioFilePrefix,
    )
    const {
      detailForm,
      apiType,
    } = toRefs(props)

    // 响应式数据
    const picture = ref('')
    const auditRes = ref('')
    const annotations = ref([])
    const imageContainer = ref(null)
    const canvas = ref(null)
    const activeTab = ref('detail')
    const videoUrl = ref('http://vjs.zencdn.net/v/oceans.mp4')
    // const videoUrl = ref("http://192.168.2.17:8412/spi/minio/windmill/store/video/2025-3-10/46428971-a4e7-47ab-8b31-0418742ee17b.mp4?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20250310%2Fbj%2Fs3%2Faws4_request&X-Amz-Date=20250310T080944Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=4a115c4cec95837ab947f62bc0c509a3c657eaa7aa92fd5424c0aa97e315e0cb");
    // const liveUrl = ref("rtmp://example.com/live/stream");
    const isPending = ref(false)

    // 视频播放方法
    const openPlayerWindow = (url) => {
      const features = 'width=800,height=600,menubar=no,toolbar=no'
      const win = window.open('', '_blank', features)

      const playerHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>视频播放器</title>
          <style>
            body { margin: 0; background: #000; }
            video {
              width: 100%;
              height: 100vh;
              object-fit: contain;
            }
            .error {
              color: white;
              text-align: center;
              padding: 20px;
            }
          </style>
        </head>
        <body>
          <video controls autoplay>
            <source src="${url}" type="video/mp4">
            您的浏览器不支持视频播放
          </video>
          <script>
            const video = document.querySelector('video');
            let hasError = false;

            video.addEventListener('ended', () => {
              window.close();
            });

            video.addEventListener('error', () => {
              if(hasError) return;
              hasError = true;
              document.body.innerHTML = '<div class="error"><h3>视频加载失败</h3><button onclick="window.close()">关闭</button></div>';
            });
          <\/script>
        </body>
        </html>
      `

      try {
        win.document.write(playerHTML)
      }
      catch (e) {
        alert('弹出窗口被阻止，请允许弹出窗口')
        window.open(url, '_blank')
      }
    }

    // 播放控制方法
    const playVideo = () => openPlayerWindow(videoUrl.value)
    // const playLive = () => openPlayerWindow(liveUrl.value);

    // 绘制图像和检测框的函数
    const drawImageWithBoxes = () => {
      const canvasEl = canvas.value
      if (!canvasEl)
        return

      const ctx = canvasEl.getContext('2d')
      const container = imageContainer.value
      if (!container)
        return
      // 获取容器尺寸
      const containerWidth = container.clientWidth
      const containerHeight = container.clientHeight || containerWidth * 0.75
      const devicePixelRatio = window.devicePixelRatio
      // 设置canvas尺寸
      canvasEl.width = containerWidth * devicePixelRatio
      canvasEl.height = containerHeight * devicePixelRatio
      // 创建图像对象
      const img = new Image()
      img.crossOrigin = 'Anonymous' // 处理跨域问题
      img.src = picture.value

      img.onload = () => {
        const originalWidth = img.width
        const originalHeight = img.height
        // 清除画布
        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
        // 绘制图像
        ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height)
        // 存储比例供后续使用
        const widthRatio = containerWidth / originalWidth
        const heightRatio = containerHeight / originalHeight
        // 绘制检测框
        if (annotations.value?.length) {
          ctx.strokeStyle = 'red'
          ctx.lineWidth = 2
          annotations.value.forEach((item) => {
            const [x, y, width, height] = item.bbox
            // 计算检测框在canvas中的位置和尺寸
            const boxX = x * widthRatio * devicePixelRatio
            const boxY = y * heightRatio * devicePixelRatio
            const boxWidth = width * widthRatio * devicePixelRatio
            const boxHeight = height * heightRatio * devicePixelRatio
            // 绘制检测框
            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)
          })
        }
      }

      img.onerror = (err) => {
        // 显示错误信息
        ctx.fillStyle = '#f5f5f5'
        ctx.fillRect(0, 0, canvasEl.width, canvasEl.height)
        ctx.fillStyle = '#f00'
        ctx.font = '14px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('图片加载失败', canvasEl.width / 2, canvasEl.height / 2)
      }
    }

    // 表单处理方法
    const radioFn = (val) => {
      auditRes.value = val
    }

    // 数据提交方法
    const api = {
      maintenanceWarningAudit,
      clientWarningAudit,
    }
    const { mutate: auditWarning } = useMutation({
      mutationFn: params => api[apiType.value](params),
      onSuccess: () => {
        vm.$message.success('审核成功')
        queryClient.invalidateQueries({
          queryKey: apiType.value === 'maintenanceWarningAudit'
            ? ['maintenanceWarningList']
            : [
                'clientWarningList',
              ],
        })
        onCancel()
      },
      onError: () => {
        vm.$message.error('审核失败')
      },
    })

    const onSubmit = () => {
      if (!auditRes.value) {
        vm.$message.error('请选择审核结果')
        return
      }
      auditWarning({
        alarmId: detailForm.value.id,
        status: auditRes.value,
      })
    }

    // 生命周期和监听
    onMounted(() => {
      if (props.showDetail) {
        drawImageWithBoxes()
      }
      // 监听窗口大小变化，重新绘制canvas
      window.addEventListener('resize', handleResize)
    })
    // 处理窗口大小变化
    const handleResize = () => {
      if (props.showDetail && activeTab.value === 'detail') {
        drawImageWithBoxes()
      }
    }

    watch(activeTab, async (newVal) => {
      if (newVal === 'detail') {
        await nextTick()
        drawImageWithBoxes()
      }
    })

    watch(
      () => props.showDetail,
      (val) => {
        if (val) {
          picture.value = filePrefix.value + props.detailForm.pic
          auditRes.value = props.detailForm.auditStatus
          annotations.value = JSON.parse(props.detailForm.annotations)
          nextTick(() => {
            if (activeTab.value === 'detail')
              drawImageWithBoxes()
          })
        }
      },
    )

    // 关闭处理
    const onCancel = () => {
      auditRes.value = ''
      activeTab.value = 'detail'
      emit('update:showDetail', false)
    }

    const atDetailFn = () => {
      console.log(detailForm.value)
    }

    return {
      auditRes,
      picture,
      activeTab,
      videoUrl,
      // liveUrl,
      playVideo,
      // playLive,
      onCancel,
      onSubmit,
      atDetailFn,
      isPending,
      canvas,
      imageContainer,
      radioFn,
      dtForm: ref(null),
      filePrefix,
      imageRatio: ref({
        widthRatio: 1,
        heightRatio: 1,
        originalWidth: 0,
        originalHeight: 0,
        containerWidth: 0,
        containerHeight: 0,
      }),
      positionList: ref([]),
    }
  },
  beforeDestroy() {
    // 移除事件监听器
    window.removeEventListener('resize', this.handleResize)
  },
}
</script>

<template>
  <el-dialog
    v-max-dialog
    class="detail-dialog diy"
    title="报警详情"
    :visible="showDetail"
    append-to-body
    width="50%"
    @close="onCancel"
  >
    <!-- 切换选项卡 -->
    <div class="switch-tabs">
      <el-radio-group v-model="activeTab" size="small">
        <el-radio-button label="detail">
          报警详情
        </el-radio-button>
        <el-radio-button label="video">
          事件视频
        </el-radio-button>
        <el-radio-button label="live">
          实时监控
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 报警详情内容 -->
    <div class="flex">
      <div
        v-show="activeTab === 'detail'"
        ref="imageContainer"
        class="w-2/3 relative h-full"
      >
        <canvas
          id="images"
          ref="canvas"
          style="width: 100%; height: 100%"
        />
      </div>
      <!-- 事件视频内容 -->
      <div v-show="activeTab === 'video'" class="w-2/3 relative h-full">
        <div class="video-container">
          <div
            v-if="videoUrl"
            class="video-preview"
            @click="playVideo"
          >
            <img
              src="https://fastly.picsum.photos/id/907/200/200.jpg?hmac=SdeLZNONJ3CX-OB15hSXsCheWDC6yYac5N5VUJM7FIQ"
              class="video-thumbnail"
              alt="视频缩略图"
            >
            <div class="play-overlay">
              <i class="el-icon-video-play" />
              <p>点击播放视频</p>
            </div>
          </div>
          <div v-else class="no-video">
            暂无视频数据
          </div>
        </div>
      </div>

      <!-- 实时监控内容 -->
      <div v-show="activeTab === 'live'" class="w-2/3 relative h-full">
        <div class="live-container" />
      </div>

      <div class="ml-5 w-1/3">
        <el-form
          ref="dtForm"
          :model="detailForm"
          label-width="80px"
          label-align="right"
          size="mini"
        >
          <el-form-item label="摄像头名称:">
            <span>{{ detailForm.camName }}</span>
          </el-form-item>
          <el-form-item label="预警时间:">
            <span>{{ detailForm.alarmDate }}</span>
          </el-form-item>
          <el-form-item label="抓拍地点:">
            <span>{{ detailForm.camName }}</span>
          </el-form-item>

          <el-form-item label="预警类型:">
            <span>{{ detailForm.alarmInfo }}</span>
          </el-form-item>
          <el-form-item v-if="detailForm.alarmLevel" label="预警等级:">
            <span>{{ detailForm.alarmLevel }}</span>
          </el-form-item>
          <el-form-item label="所属公司:">
            <span>{{ detailForm.companyName }}</span>
          </el-form-item>
          <el-form-item
            label="审核结果:"
            :required="
              detailForm.auditStatus === '待审核' || detailForm.auditStatus === '待处理'
            "
          >
            <el-radio-group v-model="auditRes" @input="radioFn">
              <el-radio label="误报" />
              <el-radio label="真实" />
            </el-radio-group>
          </el-form-item>
          <el-form-item label="状态:">
            <el-tag
              :type="
                detailForm.auditStatus === '待审核' || detailForm.auditStatus === '待处理'
                  ? 'warning'
                  : detailForm.auditStatus === '已验收'
                    ? 'success'
                    : detailForm.auditStatus === '误报'
                      ? 'info'
                      : 'danger'
              "
            >
              {{ detailForm.auditStatus }}
            </el-tag>
          </el-form-item>

          <el-form-item
            v-if="
              detailForm.auditStatus === '已验收' || detailForm.auditStatus === '处理中'
            "
            label="详情:"
          >
            <el-button type="text" @click="atDetailFn">
              查看详情
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="onCancel">
        取消
      </el-button>
      <el-button
        type="primary"
        :loading="isPending"
        @click="onSubmit"
      >
        提交审核
      </el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
  .detail-dialog {
    .el-dialog__body {
      padding: 20px;
    }

    .el-dialog__footer {
      padding: 10px 20px 20px;
    }
  }

  .switch-tabs {
    margin-bottom: 20px;

    ::v-deep .el-radio-group {
      display: flex;
      width: 100%;

      .el-radio-button {
        flex: 1;

        &:not(:last-child) {
          margin-right: 5px;
        }

        .el-radio-button__inner {
          width: 100%;
          padding: 12px 0;
          font-size: 14px;
        }
      }
    }
  }

  .video-container,
  .live-container {
    height: 300px;
    position: relative;
    background: #000;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;

    .video-preview,
    .live-preview {
      width: 100%;
      height: 100%;
      position: relative;
    }

    .video-thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s;
    }

    .play-overlay,
    .live-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      transition: opacity 0.3s;

      i {
        font-size: 48px;
        margin-bottom: 10px;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      }

      p {
        margin: 0;
        font-size: 16px;
        font-weight: 500;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }
    }

    &:hover {
      .play-overlay {
        opacity: 0.9;
      }

      .video-thumbnail {
        transform: scale(1.02);
      }
    }
  }

  .no-video,
  .no-live {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-size: 16px;
    text-align: center;
  }

  .dialog-footer {
    .el-button {
      min-width: 100px;

      &+.el-button {
        margin-left: 15px;
      }
    }
  }

  .ml-5 {
    margin-left: 1.25rem;
  }

  .w-2\/3 {
    width: 66.666667%;
  }

  .w-1\/3 {
    width: 33.333333%;
  }

  .el-form-item {
    margin-bottom: 12px;

    &::v-deep .el-form-item__label {
      color: #606266;
    }

    span {
      color: #303133;
    }
  }

  .el-tag {
    font-size: 12px;
    padding: 0 8px;
    height: 24px;
    line-height: 22px;
  }
</style>
