<script>
import {
  computed,
  getCurrentInstance,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { createNamespacedHelpers } from "vuex";
import { uploadBase64 } from "@/http/fireControl-api";
import {
  queryWarningDetailById,
  uploadWarningImage,
} from "@/http/videoWarning/warning-api";
import flvjs from "@/utils/flv.min.js";

const { mapState, mapActions } = createNamespacedHelpers("detailInfo");

export default {
  name: "WarningDetail",
  setup() {
    const vm = getCurrentInstance().proxy;

    // 本地UI状态
    const tabPosition = ref("事件图片");
    const auditRes = ref("");
    const disposeOpinion = ref("");
    const auditResList = ref([]);
    const isSubmitting = ref(false);
    const alarmVideo = ref("");
    const picture = ref("");
    const annotationPic = ref("");
    const annotations = ref([]);
    const url = ref("");
    const Flv = ref(null);
    const origins = ref("");

    // DOM引用
    const dialogRef = ref(null);
    const canvas = ref(null);
    const imageContainer = ref(null);

    // 文件前缀
    const filePrefix = ref(
      JSON.parse(localStorage.getItem("globalData")).minioFilePrefix
    );

    // 预警等级列表
    const alarmLevelList = ref(["一级", "二级", "三级", "四级"]);

    // 初始化详情页面
    const initDetail = () => {
      const { detailId, type, form, origin } = JSON.parse(vm.$route.query.data || "{}");

      if (!detailId) {
        vm.$message.error("缺少必要参数");
        return;
      }

      vm.$store.commit("detailInfo/SET_USER_TYPE", type);

      origins.value = origin;
      if (origin === "notification") {
        queryWarningDetailById(detailId).then(({ data }) => {
          if (data.code === 200) {
            const { result } = data;
            const info = {
              ...result,
              auditStatus: result.customerStatus,
              alarmLevel: alarmLevelList.value[Number(result.alarmLevel) - 1],
              auditUser: result.customerDisposeUserName || "--",
              auditTime: result.customerDisposeTime || "--",
            };
            // 获取审核选项
            const statusOptions = {
              CustomerStatus: [
                { label: "有效", value: "2" },
                { label: "误报", value: "3" },
              ],
              Other: [
                { label: "有效", value: "2" },
                { label: "无效", value: "3" },
                { label: "误报", value: "4" },
                { label: "不确定", value: "5" },
              ],
            };

            auditResList.value = statusOptions[type] || statusOptions.Other;
            vm.$store.commit("detailInfo/SET_DETAIL_FORMS", info);
          }
        });

        return;
      }

      // 设置状态管理中的用户类型和查询参数
      vm.$store.commit("detailInfo/SET_QUERY_FORM", form);
      vm.$store.commit("detailInfo/SET_CURRENT_ID", detailId);

      // 获取详情列表数据
      vm.$store
        .dispatch("detailInfo/getDetailInfo", { userType: type, queryForm: form })
        .then(() => {
          // 获取审核选项
          const statusOptions = {
            CustomerStatus: [
              { label: "有效", value: "2" },
              { label: "误报", value: "3" },
            ],
            Other: [
              { label: "有效", value: "2" },
              { label: "无效", value: "3" },
              { label: "误报", value: "4" },
              { label: "不确定", value: "5" },
            ],
          };

          auditResList.value = statusOptions[type] || statusOptions.Other;
          vm.$store.dispatch("detailInfo/setCurrentDetail", detailId);
        });
    };

    // 从Vuex同步数据到本地状态
    const updateLocalState = () => {
      const detailForms = vm.$store.state.detailInfo.detailForms;

      if (!detailForms || !detailForms.id) return;

      // 更新审核状态
      auditRes.value = detailForms.auditStatus === "1" ? "2" : detailForms.auditStatus;
      // 更新处理意见
      disposeOpinion.value =
        vm.$store.state.detailInfo.userType !== "CustomerStatus"
          ? detailForms.internalDisposeOpinion || ""
          : detailForms.customerDisposeOpinion || "";
      // 更新图片和视频
      picture.value = filePrefix.value + detailForms.alarmPic;
      annotationPic.value = detailForms?.alarmPicAnnotation
        ? filePrefix.value + detailForms?.alarmPicAnnotation
        : "";
      alarmVideo.value = detailForms.alarmVideo;
      // 更新标注数据
      try {
        annotations.value = JSON.parse(detailForms.annotations || "[]");
      } catch (_e) {
        annotations.value = [];
      }

      // 重新绘制图片
      handleTabChange(tabPosition.value);
    };

    // 监听详情数据变化
    watch(
      () => vm.$store.state.detailInfo.detailForms,
      () => {
        updateLocalState();
      },
      { deep: true }
    );

    // 计算属性
    const levelTagType = computed(() => {
      return (level) => {
        return {
          一级: "#f54a41",
          二级: "#f9ae3d",
          三级: "#cfde00",
          四级: "#0069b9",
        }[level];
      };
    });

    const getStatus = computed(() => {
      return (status, type) => {
        const statusList = vm.$dictUtils.getDictList(
          type === "all" ? "InternalStatus" : type
        );

        let text = "";
        if (type !== "CustomerStatus") {
          text = status !== "0" ? "已审核 |" : "";
        } else {
          text = status && status !== "0" && status !== "1" ? "已处理 |" : "";
        }
        return `${text} ${
          statusList.find((s) => s.dictCode === status)?.dictName || "--"
        }`;
      };
    });

    const getResult = computed(() => {
      return (result) => {
        const resultList = {
          YES: "有效",
          NO: "无效",
        };
        return `${resultList[result] || "--"}`;
      };
    });

    const tagType = computed(() => {
      return (status, type) => {
        const statusList = vm.$dictUtils.getDictList(
          type === "all" ? "InternalStatus" : type
        );

        const code = statusList.find((s) => s.dictCode === status)?.dictCode;

        const color = {
          0: type === "CustomerStatus" ? "danger" : "primary",
          1: type === "CustomerStatus" ? "primary" : "danger",
          2: "success",
          3: "info",
          4:
            vm.$store.state.detailInfo.userType === "CustomerStatus" ? undefined : "info",
          5: "warning",
        };
        return color[Number(code)] || "--";
      };
    });

    // 销毁FLV播放器的辅助函数
    const destroyFlvPlayer = () => {
      if (Flv.value) {
        try {
          Flv.value.pause();
          Flv.value.unload();
          Flv.value.detachMediaElement();
          Flv.value.destroy();
        } catch (error) {
          console.error("销毁播放器时出错:", error);
        } finally {
          Flv.value = null;
        }
      }
    };

    // 事件处理函数
    const handleTabChange = (tab) => {
      // 切换tab前先销毁播放器
      if (tab !== "实时监控") {
        destroyFlvPlayer();
      }

      tabPosition.value = tab;

      if (tab === "事件图片") {
        setTimeout(() => {
          drawImageWithBoxes();
        }, 300);
      } else if (tab === "事件视频") {
        // 不需要特殊处理，模板中已绑定alarmVideo
      } else if (tab === "实时监控") {
        const streamUrl = vm.$store.state.detailInfo.detailForms.streamUrl;
        if (streamUrl) {
          // 使用 nextTick 确保DOM已更新
          vm.$nextTick(() => {
            getVideo(streamUrl, "videoElement");
          });
        } else {
          console.error("实时监控URL为空");
          vm.$message.warning("暂无实时监控流地址");
        }
      }
    };

    const radioFn = (val) => {
      auditRes.value = val;
    };

    const onCancel = () => {
      vm.$router.back();
    };

    const onSubmit = async (submitType) => {
      if (!auditRes.value) {
        vm.$message.error("请选择审核结果");
        return;
      }

      isSubmitting.value = true;

      try {
        const result = await vm.$store.dispatch("detailInfo/submitAudit", {
          status: auditRes.value,
          type: submitType,
          opinion: disposeOpinion.value,
        });

        if (result.success) {
          vm.$message.success(result.message);
          // 如果操作后无更多数据，自动返回上一页
          if (result.shouldReturn) {
            vm.$router.back();
          }
        } else {
          vm.$message.error(result.message);
        }
      } catch (error) {
        vm.$message.error(`操作失败：${error.message || "未知错误"}`);
      } finally {
        isSubmitting.value = false;
      }
    };

    const handleAttention = async (isAttention) => {
      try {
        const result = await vm.$store.dispatch(
          "detailInfo/toggleAttention",
          isAttention
        );

        if (result.success) {
          // 如果是取消关注，可能需要从列表中移除
          if (isAttention === "0") {
            vm.$store
              .dispatch("detailInfo/getDetailInfo", {
                userType: vm.$store.state.detailInfo.userType,
                queryForm: vm.$store.state.detailInfo.queryForm,
              })
              .then(() => {
                if (vm.$store.state.detailInfo.lists.length === 0) {
                  vm.$router.back();
                }
              });
          }
          vm.$message.success(result.message);
        } else {
          vm.$message.error(result.message);
        }
      } catch (error) {
        vm.$message.error(`操作失败：${error.message || "未知错误"}`);
      }
    };

    const onPrev = () => {
      vm.$store.dispatch("detailInfo/prevDetail");
      // updateLocalState();
    };

    const onNext = () => {
      vm.$store.dispatch("detailInfo/nextDetail");
      // updateLocalState();
    };

    const handleResize = () => {
      // if (annotationPic.value) {
      //   return;
      // }
      drawImageWithBoxes();
    };
    // 处理 CORS 问题：将 canvas 转为 base64 前，确保图片已设置 crossOrigin 并已加载
    const uploadCanvasImage = (img) => {
      try {
        uploadBase64({
          fileType: "VIDEO_ALARM",
          base64Img: img,
        }).then((res) => {
          if (res.data.success) {
            uploadWarningImage({
              alarmId: vm.$store.state.detailInfo.detailForms.id,
              annotationPic: res.data.result,
              tCode: vm.$store.state.detailInfo.detailForms.tenantCode,
            }).then((res) => {});
          }
        });
      } catch (e) {
        console.log(e);
      }
    };

    const drawImageWithBoxes = () => {
      const canvasEl = canvas.value;
      if (!canvasEl) {
        return;
      }

      const ctx = canvasEl.getContext("2d");
      const container = imageContainer.value;
      if (!container) {
        return;
      }

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight || containerWidth * 0.75;
      const devicePixelRatio = window.devicePixelRatio;
      canvasEl.width = containerWidth * devicePixelRatio;
      canvasEl.height = containerHeight * devicePixelRatio;

      const img = new Image();
      img.crossOrigin = "Anonymous";

      // 确保图片URL有效
      if (!picture.value) {
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
        ctx.fillStyle = "#f00";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("没有图片数据", canvasEl.width / 2, canvasEl.height / 2);
        return;
      }

      // 已有标注图片时，直接用已有图片绘制 canvas，跳过上传
      const detailForms = vm.$store.state.detailInfo.detailForms;
      if (detailForms?.alarmPicAnnotation) {
        img.src = annotationPic.value;
        img.onload = () => {
          ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
          ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);
          url.value = annotationPic.value;
        };
        img.onerror = () => {
          ctx.fillStyle = "#f5f5f5";
          ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
          ctx.fillStyle = "#f00";
          ctx.font = "24px Arial";
          ctx.textAlign = "center";
          ctx.fillText("标注图片加载失败", canvasEl.width / 2, canvasEl.height / 2);
        };
        return;
      }

      img.src = picture.value;

      img.onload = () => {
        const originalWidth = img.width;
        const originalHeight = img.height;

        ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);

        const widthRatio = containerWidth / originalWidth;
        const heightRatio = containerHeight / originalHeight;

        if (annotations.value && annotations.value.length > 0) {
          ctx.strokeStyle = "red";
          ctx.lineWidth = 2;
          annotations.value.forEach((item) => {
            const [x, y, width, height] = item.bbox;

            const boxX = x * widthRatio * devicePixelRatio;
            const boxY = y * heightRatio * devicePixelRatio;
            const boxWidth = width * widthRatio * devicePixelRatio;
            const boxHeight = height * heightRatio * devicePixelRatio;

            ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
          });
        }

        // 在完成绘制后再生成 base64 并上传
        try {
          url.value = canvasEl.toDataURL("image/jpeg", 0.6);
          if (url.value && url.value !== "") {
            uploadCanvasImage(url.value);
          }
        } catch (e) {
          console.error("canvas 转 base64 失败，可能是跨域导致:", e);
        }
      };

      img.onerror = () => {
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
        ctx.fillStyle = "#f00";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("图片加载失败", canvasEl.width / 2, canvasEl.height / 2);
      };

      // 注意：不要在图片 onload 之前生成 base64，否则会得到空白图
    };

    const getVideo = (url, type) => {
      if (!flvjs.isSupported()) {
        console.error("FLV.js is not supported in this browser.");
        vm.$message.error("当前浏览器不支持视频播放");
        return;
      }

      if (!url) {
        console.error("视频流URL为空");
        vm.$message.error("视频流地址无效");
        return;
      }

      try {
        // 销毁旧的播放器实例
        if (Flv.value) {
          Flv.value.destroy();
          Flv.value = null;
        }

        Flv.value = flvjs.createPlayer({
          url,
          type: "flv",
          autoPlay: true,
          isLive: true,
          bufferLength: 3,
          hasAudio: false, // 禁用音频解码，解决不支持的音频编解码器问题
        });

        Flv.value.attachMediaElement(vm.$refs[type]);

        // 添加错误事件监听器 - 这是关键！
        Flv.value.on(flvjs.Events.ERROR, (errorType, errorDetail) => {
          console.error("FLV播放器错误:", errorType, errorDetail);

          let errorMessage = "视频加载失败";

          if (errorType === flvjs.ErrorTypes.NETWORK_ERROR) {
            errorMessage = "网络错误：无法连接视频流";
          } else if (errorType === flvjs.ErrorTypes.MEDIA_ERROR) {
            errorMessage = "媒体错误：视频格式不支持或损坏";
          } else if (errorType === flvjs.ErrorTypes.OTHER_ERROR) {
            errorMessage = `播放错误：${errorDetail || "未知错误"}`;
          }

          vm.$message.error(errorMessage);
        });

        // 添加其他有用的事件监听
        Flv.value.on(flvjs.Events.LOADING_COMPLETE, () => {
          console.log("视频流加载完成");
        });

        Flv.value.on(flvjs.Events.STATISTICS_INFO, (stats) => {
          // 可以在这里监控视频流质量
          // console.log("统计信息:", stats);
        });

        Flv.value.load();
        Flv.value.play();
      } catch (error) {
        console.error("创建FLV播放器失败:", error);
        vm.$message.error(`视频播放器初始化失败：${error.message}`);
      }
    };

    const handleFullScreen = () => {
      dialogRef.value.showModal();
      const fullScreen = document.getElementById("fullScreen");
      // 清空容器中已有的内容
      fullScreen.innerHTML = "";
      const img = new Image();
      img.src = url.value;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "contain";
      fullScreen.appendChild(img);
    };

    const closeFullScreen = () => {
      dialogRef.value.close();
    };

    // 生命周期钩子
    onMounted(() => {
      initDetail();
      window.addEventListener("resize", handleResize);
    });

    onBeforeUnmount(() => {
      destroyFlvPlayer();
      window.removeEventListener("resize", handleResize);
      // 重置状态
      vm.$store.dispatch("detailInfo/resetState");
    });

    return {
      // 本地状态
      tabPosition,
      auditRes,
      disposeOpinion,
      auditResList,
      isSubmitting,
      alarmVideo,
      picture,
      url,
      annotationPic,
      origins,
      // DOM引用
      dialogRef,
      canvas,
      imageContainer,

      // 计算属性
      levelTagType,
      getStatus,
      getResult,
      tagType,

      // 事件处理方法
      handleTabChange,
      radioFn,
      onCancel,
      onSubmit,
      handleAttention,
      onPrev,
      onNext,
      handleFullScreen,
      closeFullScreen,
    };
  },

  computed: {
    // 从Vuex映射状态
    ...mapState({
      detailForms: (state) => state.detailForms,
      currentIndex: (state) => state.currentIndex,
      lists: (state) => state.lists,
      userType: (state) => state.userType,
      isLoading: (state) => state.isLoading,
    }),

    // 导航状态计算属性
    hasPrevious() {
      return this.currentIndex > 0;
    },
    hasNext() {
      return this.currentIndex < this.lists.length - 1;
    },
  },

  methods: {
    // 从Vuex映射actions
    ...mapActions([
      "prevDetail",
      "nextDetail",
      "submitAudit",
      "toggleAttention",
      "resetState",
    ]),
  },
};
</script>

<template>
  <div class="page-container-fixed">
    <ECard
      customStyle="display: flex; flex-direction: column; justify-content: space-between;"
    >
      <ETitle title="预警详情" />
      <div class="box-border flex flex-auto px-3">
        <div style="width: 64%" class="pt-4 pb-7 rounded-lg bg-ky-blue">
          <div class="flex justify-between items-center px-4 mb-5">
            <el-radio-group v-model="tabPosition" @change="handleTabChange">
              <el-radio-button border label="事件图片" />
              <el-radio-button border label="事件视频" />
              <el-radio-button border label="实时监控" />
            </el-radio-group>

            <div
              v-if="tabPosition === '事件图片'"
              class="flex items-center p-3 cursor-pointer"
              @click="handleFullScreen"
            >
              <i class="el-icon-full-screen" />
            </div>
          </div>

          <div
            ref="imageContainer"
            class="flex relative justify-center px-5 w-full"
            style="height: 86%"
          >
            <el-image
              v-show="tabPosition === '事件图片'"
              :src="picture"
              style="border-radius: 4px; z-index: 1"
              class="absolute top-0 left-0 h-full"
            />

            <!-- <el-image
              :src="annotationPic"
              v-show="tabPosition === '事件图片'"
              style="border-radius: 4px; z-index: 3"
            /> -->
            <canvas
              v-show="tabPosition === '事件图片'"
              id="images"
              ref="canvas"
              style="width: 100%; height: 100%; border-radius: 4px; z-index: 3"
            />
            <div v-if="tabPosition === '事件视频'" style="width: 100%">
              <video
                v-if="detailForms.alarmVideo"
                ref="eventVideo"
                controls
                crossorigin="anonymous"
                width="100%"
                height="100%"
              >
                <source :src="alarmVideo" type="video/mp4" />
              </video>
              <el-empty v-else description="视频为空" />
            </div>
            <video
              v-if="tabPosition === '实时监控'"
              ref="videoElement"
              controls
              crossorigin="anonymous"
              width="100%"
              height="100%"
            />
          </div>
        </div>
        <div class="flex flex-col justify-between pl-3" style="height: 100%; width: 36%">
          <div>
            <div class="mb-1 text-lg font-bold">预警信息</div>
            <div style="max-height: 65vh" class="overflow-y-auto scrollbar-thin">
              <el-form
                ref="dtForm"
                :model="detailForms"
                label-width="90px"
                label-align="right"
                size="small"
              >
                <el-form-item label="预警类型:">
                  <span>{{ detailForms.alarmType || "--" }}</span>
                </el-form-item>
                <el-form-item label="摄像头名称:">
                  <span>{{ detailForms.cameraName || "--" }}</span>
                </el-form-item>
                <el-form-item v-if="userType === 'all'" label="所属租户:">
                  <span>{{ detailForms.tenantName || "--" }}</span>
                </el-form-item>
                <el-form-item label="所属公司:">
                  <span>{{ detailForms.companyName || "--" }}</span>
                </el-form-item>
                <el-form-item label="所属部门:">
                  <span>{{ detailForms.departmentName || "--" }}</span>
                </el-form-item>

                <el-form-item
                  :label="userType === 'CustomerStatus' ? '处理状态:' : '审核状态:'"
                >
                  <el-tag :type="tagType(detailForms.auditStatus, userType)">
                    {{ getStatus(detailForms.auditStatus, userType) }}
                  </el-tag>
                </el-form-item>

                <el-form-item v-if="userType !== 'CustomerStatus'" label="AI复判结果:">
                  <div
                    class="flex items-center"
                    :class="
                      detailForms.aiJudge === 'YES' ? 'text-success' : 'text-danger'
                    "
                  >
                    {{ getResult(detailForms.aiJudge) || "--" }}
                  </div>
                </el-form-item>

                <el-form-item v-if="userType !== 'CustomerStatus'" label="客户处理状态:">
                  <el-tag :type="tagType(detailForms.customerStatus, 'CustomerStatus')">
                    {{ getStatus(detailForms.customerStatus, "CustomerStatus") }}
                  </el-tag>
                </el-form-item>

                <el-form-item label="预警等级:">
                  <el-tag
                    effect="plain"
                    style="color: #ffffff; border-color: #ffffff"
                    :color="levelTagType(detailForms.alarmLevel)"
                  >
                    {{ detailForms.alarmLevel || "--" }}
                  </el-tag>
                </el-form-item>
                <el-form-item label="预警时间:">
                  <span>{{ detailForms.alarmDate || "--" }}</span>
                </el-form-item>

                <el-form-item v-if="userType !== 'CustomerStatus'" label="上报时间:">
                  <span>{{ detailForms.createdTime || "--" }}</span>
                </el-form-item>

                <el-form-item
                  :label="userType !== 'CustomerStatus' ? '审核人:' : '处理人:'"
                >
                  <span>{{ detailForms.auditUser || "--" }}</span>
                </el-form-item>
                <el-form-item
                  :label="userType !== 'CustomerStatus' ? '审核时间:' : '处理时间:'"
                >
                  <span>{{ detailForms.auditTime || "--" }}</span>
                </el-form-item>

                <el-form-item label="是否关注:">
                  <el-tag>
                    {{ detailForms.archivesState === 1 ? "已关注" : "未关注" }}
                  </el-tag>
                </el-form-item>

                <el-form-item
                  :label="userType === 'CustomerStatus' ? '处理结果:' : '审核结果:'"
                >
                  <el-radio-group v-model="auditRes" @input="radioFn">
                    <el-radio
                      v-for="item in auditResList"
                      :key="item.value"
                      :label="item.value"
                    >
                      {{ item.label }}
                    </el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item
                  :label="userType === 'CustomerStatus' ? '处理意见:' : '审核意见:'"
                >
                  <el-input v-model="disposeOpinion" type="textarea" />
                </el-form-item>
              </el-form>
            </div>
          </div>

          <div>
            <div class="flex justify-end py-2 mr-7">
              <EButton @click="onCancel"> 取消 </EButton>
              <EButton type="primary" :loading="isSubmitting" @click="onSubmit('1')">
                {{ userType === "CustomerStatus" ? "确认" : "提交审核" }}
              </EButton>
              <EButton
                v-if="userType !== 'CustomerStatus'"
                type="primary"
                :disabled="auditRes !== '2'"
                @click="onSubmit('2')"
              >
                加急处理
              </EButton>

              <template v-if="userType === 'CustomerStatus'">
                <EButton
                  v-if="detailForms.archivesState !== 1"
                  type="primary"
                  @click="handleAttention(1)"
                >
                  关注
                </EButton>
                <EButton
                  v-if="detailForms.archivesState === 1"
                  type="danger"
                  @click="handleAttention('0')"
                >
                  取消关注
                </EButton>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-end items-end pt-4 pb-1">
        <div v-if="origins !== 'notification'" class="flex justify-center w-1/3">
          <EButton type="default" :disabled="!hasPrevious" size="small" @click="onPrev">
            上一个
          </EButton>
          <div class="mx-11 w-5">
            <EButton type="text" size="medium">
              {{ currentIndex + 1 }}/{{ lists.length }}
            </EButton>
          </div>
          <EButton type="default" :disabled="!hasNext" size="small" @click="onNext">
            下一个
          </EButton>
        </div>
      </div>
    </ECard>

    <dialog
      ref="dialogRef"
      class="fixed top-0 left-0 z-50 p-0 m-0 w-full h-full bg-black bg-opacity-90"
    >
      <div class="absolute top-4 right-4 z-10">
        <el-button circle type="danger" @click="closeFullScreen">
          <i class="el-icon-close" />
        </el-button>
      </div>
      <div id="fullScreen" class="flex justify-center items-center p-4 w-full h-full">
        <!-- 图片将通过JS动态添加 -->
      </div>
    </dialog>
  </div>
</template>

<style lang="scss" scoped>
::v-deep .el-form .el-form-item {
  margin-bottom: 6px !important;
}
::v-deep .el-form-item--small .el-form-item__label {
  font-size: 30px;
  font-weight: bold;
}

::v-deep .el-form-item--small .el-form-item__content {
  font-size: 30px;
}

::v-deep .el-radio {
  margin-right: 17px !important;
}
</style>
