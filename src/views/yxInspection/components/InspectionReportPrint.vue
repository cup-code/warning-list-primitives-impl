<script>
import { getCurrentInstance, ref, computed, watch } from "vue";
import { getScheduleRecordDetail } from "@/http/inspection/yx-inspection-api";
import { resolveMediaUrl } from "@/utils/media";

export default {
  name: "InspectionReportPrint",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    scheduleRecordId: {
      type: String,
      default: "",
    },
    lineName: {
      type: String,
      default: "",
    },
    postName: {
      type: String,
      default: "",
    },
  },
  emits: ["update:visible", "close"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const loading = ref(false);
    const detail = ref({});
    const executePlaceInfoList = ref([]);

    // 图片预览相关
    const previewVisible = ref(false);
    const previewImages = ref([]);
    const previewIndex = ref(0);

    // 打印配置
    const printObj = computed(() => ({
      id: "print-report-content",
      popTitle: "巡检班次报告",
    }));

    // 统计数据（优先使用 scheduleReportVO，否则前端计算）
    const statistics = computed(() => {
      const reportVO = detail.value.scheduleReportVO;
      if (reportVO) {
        return {
          placeCount: reportVO.placeCount || 0,
          contentCount: reportVO.contentCount || 0,
          abnormalCount: reportVO.abnormalCount || 0,
          photoCount: reportVO.photoCount || 0,
          videoCount: reportVO.videoCount || 0,
          audioCount: reportVO.audioCount || 0,
        };
      }

      // 前端计算
      let contentCount = 0;
      let abnormalCount = 0;
      let photoCount = 0;
      let videoCount = 0;
      let audioCount = 0;

      executePlaceInfoList.value.forEach((place) => {
        const contentList = place.executeContentInfoList || [];
        contentCount += contentList.length;
        contentList.forEach((item) => {
          if (item.abnormal) abnormalCount++;
          if (item.photo) {
            photoCount += item.photo.split(",").filter((u) => u.trim()).length;
          }
          if (item.video) {
            videoCount += item.video.split(",").filter((u) => u.trim()).length;
          }
          if (item.audio) {
            audioCount += item.audio.split(",").filter((u) => u.trim()).length;
          }
        });
      });

      return {
        placeCount: executePlaceInfoList.value.length,
        contentCount,
        abnormalCount,
        photoCount,
        videoCount,
        audioCount,
      };
    });

    // 巡检人名称
    const executorNames = computed(() => {
      const names = detail.value.executeUsersName;
      if (Array.isArray(names) && names.length) {
        return names.join("、");
      }
      return "-";
    });

    // 周期文字
    const cycleText = computed(() => {
      const cycle = detail.value.cycleFiled;
      const frequency = detail.value.frequency;
      if (!cycle || !frequency) return "-";
      const cycleMap = {
        DAY: "天",
        WEEK: "周",
        MONTH: "月",
        YEAR: "年",
      };
      return `每${cycleMap[cycle] || cycle}${frequency}班`;
    });

    // 提交时间（使用 executeEndTime）
    const submitTime = computed(() => {
      return detail.value.executeEndTime || "-";
    });

    // 异常巡检项列表（用于任务总结）
    const abnormalItems = computed(() => {
      const items = [];
      executePlaceInfoList.value.forEach((place) => {
        const contentList = place.executeContentInfoList || [];
        contentList.forEach((item) => {
          if (item.abnormal) {
            items.push({
              placeName: place.placeName,
              contentName: item.contentName,
              executeResult: item.executeResult,
              problemDesc: item.problemDesc || "",
            });
          }
        });
      });
      return items;
    });

    // 获取详情数据
    const fetchDetail = async () => {
      if (!props.scheduleRecordId) return;
      loading.value = true;
      try {
        const { data } = await getScheduleRecordDetail(props.scheduleRecordId);
        if (data?.success && data.result) {
          detail.value = data.result;
          executePlaceInfoList.value = data.result.executePlaceInfoList || [];
        } else {
          proxy.$message.error("获取巡检详情失败");
        }
      } catch (error) {
        console.error("获取巡检详情失败", error);
        proxy.$message.error("获取巡检详情失败");
      } finally {
        loading.value = false;
      }
    };

    // 关闭弹窗
    const handleClose = () => {
      emit("update:visible", false);
      emit("close");
    };

    // 监听 visible 变化
    watch(
      () => props.visible,
      (val) => {
        if (val) {
          fetchDetail();
        }
      },
      { immediate: true }
    );

    // 获取结果样式
    const getResultClass = (abnormal) => {
      return abnormal ? "text-red-500" : "text-green-500";
    };

    // 获取结果文字
    const getResultText = (abnormal, executeResult) => {
      if (executeResult) return executeResult;
      return abnormal ? "异常" : "正常";
    };

    // 获取照片数量
    const getPhotoCount = (photo) => {
      if (!photo) return 0;
      return photo.split(",").filter((u) => u.trim()).length;
    };

    // 获取照片URL列表
    const getPhotoUrls = (photo) => {
      if (!photo) return [];
      return photo
        .split(",")
        .filter((u) => u.trim())
        .map((url) => resolveMediaUrl(url.trim()));
    };

    // 获取打卡照片数量
    const getMarkPhotoCount = (markPhoto) => {
      if (!markPhoto) return 0;
      return markPhoto.split(",").filter((u) => u.trim()).length;
    };

    // 处理图片预览
    const handlePreviewImages = (photo) => {
      const urls = getPhotoUrls(photo);
      if (urls.length > 0) {
        previewImages.value = urls;
        previewIndex.value = 0;
        previewVisible.value = true;
      }
    };

    return {
      loading,
      detail,
      executePlaceInfoList,
      printObj,
      statistics,
      executorNames,
      cycleText,
      submitTime,
      abnormalItems,
      handleClose,
      getResultClass,
      getResultText,
      getPhotoCount,
      getPhotoUrls,
      getMarkPhotoCount,
      handlePreviewImages,
      resolveMediaUrl,
      // 图片预览
      previewVisible,
      previewImages,
      previewIndex,
    };
  },
};
</script>

<template>
  <el-dialog
    title="打印巡检报告"
    :visible.sync="visible"
    width="900px"
    :close-on-click-modal="false"
    destroy-on-close
    custom-class="print-report-dialog"
    @close="handleClose"
  >
    <div v-loading="loading" class="max-h-[60vh] overflow-y-auto p-5 bg-gray-100">
      <!-- 打印内容区域 -->
      <div id="print-report-content" class="bg-white p-8 min-h-[500px] shadow-md">
        <!-- 页眉 -->
        <div
          class="flex items-center justify-between mb-8 pb-5 border-b-2 border-gray-200"
        >
          <div class="flex items-center gap-2.5">
            <img src="/blob.png" alt="logo" class="w-10 h-10 object-contain" />
            <span class="text-sm text-gray-600 font-medium">两山智联-易巡</span>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-800">易巡班次报告</h1>
          </div>
          <div>
            <span class="text-xs text-gray-500">智联无界，易巡有方</span>
          </div>
        </div>

        <!-- 统计卡片 -->
        <div
          class="flex justify-between gap-4 mb-8 p-5 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg"
        >
          <div class="flex-1 text-center p-4 bg-white rounded-md shadow-sm">
            <div class="text-sm text-gray-600 mb-2">巡检点总数</div>
            <div class="text-3xl font-bold text-amber-500">
              {{ statistics.placeCount }}<span class="text-base ml-0.5">个</span>
            </div>
          </div>
          <div class="flex-1 text-center p-4 bg-white rounded-md shadow-sm">
            <div class="text-sm text-gray-600 mb-2">巡检项总数</div>
            <div class="text-3xl font-bold text-amber-500">
              {{ statistics.contentCount }}<span class="text-base ml-0.5">个</span>
            </div>
          </div>
          <div class="flex-1 text-center p-4 bg-white rounded-md shadow-sm">
            <div class="text-sm text-gray-600 mb-2">异常数量</div>
            <div class="text-3xl font-bold text-amber-500">
              {{ statistics.abnormalCount }}<span class="text-base ml-0.5">个</span>
            </div>
          </div>
          <div class="flex-1 text-center p-4 bg-white rounded-md shadow-sm">
            <div class="text-sm text-gray-600 mb-2">照片数量</div>
            <div class="text-3xl font-bold text-amber-500">
              {{ statistics.photoCount }}<span class="text-base ml-0.5">张</span>
            </div>
          </div>
          <div class="flex-1 text-center p-4 bg-white rounded-md shadow-sm">
            <div class="text-sm text-gray-600 mb-2">视频数量</div>
            <div class="text-3xl font-bold text-amber-500">
              {{ statistics.videoCount }}<span class="text-base ml-0.5">条</span>
            </div>
          </div>
          <div class="flex-1 text-center p-4 bg-white rounded-md shadow-sm">
            <div class="text-sm text-gray-600 mb-2">录音数量</div>
            <div class="text-3xl font-bold text-amber-500">
              {{ statistics.audioCount }}<span class="text-base ml-0.5">条</span>
            </div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="mb-8 p-5 bg-gray-50 rounded-lg">
          <div class="flex gap-10 mb-3">
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">巡检班次：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                detail.taskName || "-"
              }}</span>
            </div>
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">开始时间：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                detail.scheduleStartTime || "-"
              }}</span>
            </div>
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">结束时间：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                detail.scheduleEndTime || "-"
              }}</span>
            </div>
          </div>
          <div class="flex gap-10 mb-3">
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">提交时间：</span>
              <span class="text-sm text-gray-800 font-medium">{{ submitTime }}</span>
            </div>
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">周期：</span>
              <span class="text-sm text-gray-800 font-medium">{{ cycleText }}</span>
            </div>
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">巡检路线：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                lineName || detail.lineName || "-"
              }}</span>
            </div>
          </div>
          <div class="flex gap-10">
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">所属部门：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                detail.departmentName || "-"
              }}</span>
            </div>
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">巡检岗位：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                postName || detail.postName || "-"
              }}</span>
            </div>
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">巡检人：</span>
              <span class="text-sm text-gray-800 font-medium">{{ executorNames }}</span>
            </div>
          </div>
        </div>

        <!-- 巡检点详情 -->
        <div class="mb-8">
          <div v-for="(place, pIndex) in executePlaceInfoList" :key="pIndex" class="mb-8">
            <!-- 巡检点标题 -->
            <div class="flex items-center gap-2 mb-4 pb-2.5 border-b-2 border-amber-400">
              <span class="text-lg">📍</span>
              <span class="text-base font-bold text-gray-800"
                >【{{ pIndex + 1 }}#{{ place.placeName }}】</span
              >
            </div>

            <!-- 打卡信息 -->
            <div
              v-if="place.markInfoList && place.markInfoList.length"
              class="bg-sky-50 p-3 px-4 rounded-md mb-4"
            >
              <div
                v-for="(mark, mIndex) in place.markInfoList"
                :key="mIndex"
                class="flex items-center gap-8 mb-2 last:mb-0 flex-wrap"
              >
                <span class="flex items-center gap-1.5 text-sm text-gray-600">
                  <span class="text-sm">👤</span>
                  打卡人：{{ mark.markUserName || "-" }}
                </span>
                <span class="flex items-center gap-1.5 text-sm text-gray-600">
                  <span class="text-sm">🕐</span>
                  打卡时间：{{ mark.markTime || "-" }}
                </span>
                <span
                  v-if="mark.markPhoto"
                  class="flex items-center gap-1.5 text-sm text-gray-600"
                >
                  <span class="text-sm">📷</span>
                  现场照片：
                  <div class="flex gap-1">
                    <img
                      v-for="(url, idx) in getPhotoUrls(mark.markPhoto).slice(0, 3)"
                      :key="idx"
                      :src="url"
                      class="w-8 h-8 object-cover rounded cursor-pointer border border-gray-200 hover:border-blue-400"
                      @click="handlePreviewImages(mark.markPhoto)"
                    />
                    <span
                      v-if="getMarkPhotoCount(mark.markPhoto) > 3"
                      class="flex items-center justify-center w-8 h-8 bg-gray-100 rounded text-xs text-gray-500 cursor-pointer"
                      @click="handlePreviewImages(mark.markPhoto)"
                    >
                      +{{ getMarkPhotoCount(mark.markPhoto) - 3 }}
                    </span>
                  </div>
                </span>
              </div>
            </div>

            <!-- 巡检项表格 -->
            <table class="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th
                    class="bg-gray-100 border border-gray-300 p-2.5 px-2 text-gray-800 font-semibold text-center w-[50px]"
                  >
                    序号
                  </th>
                  <th
                    class="bg-gray-100 border border-gray-300 p-2.5 px-2 text-gray-800 font-semibold min-w-[120px]"
                  >
                    内容
                  </th>
                  <th
                    class="bg-gray-100 border border-gray-300 p-2.5 px-2 text-gray-800 font-semibold min-w-[100px]"
                  >
                    标准
                  </th>
                  <th
                    class="bg-gray-100 border border-gray-300 p-2.5 px-2 text-gray-800 font-semibold text-center w-[80px]"
                  >
                    巡检人
                  </th>
                  <th
                    class="bg-gray-100 border border-gray-300 p-2.5 px-2 text-gray-800 font-semibold text-center w-[60px]"
                  >
                    结果
                  </th>
                  <th
                    class="bg-gray-100 border border-gray-300 p-2.5 px-2 text-gray-800 font-semibold min-w-[80px]"
                  >
                    文字
                  </th>
                  <th
                    class="bg-gray-100 border border-gray-300 p-2.5 px-2 text-gray-800 font-semibold text-center w-[100px]"
                  >
                    上报时间
                  </th>
                  <th
                    class="bg-gray-100 border border-gray-300 p-2.5 px-2 text-gray-800 font-semibold text-center w-[70px]"
                  >
                    照片
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(item, cIndex) in place.executeContentInfoList"
                  :key="cIndex"
                  class="border-b border-gray-200"
                >
                  <td class="border border-gray-300 p-2 px-2 text-center">
                    {{ cIndex + 1 }}
                  </td>
                  <td class="border border-gray-300 p-2 px-2">
                    {{ item.contentName || "-" }}
                  </td>
                  <td class="border border-gray-300 p-2 px-2">
                    {{ item.inspectionBenchmark || "-" }}
                  </td>
                  <td class="border border-gray-300 p-2 px-2 text-center">
                    {{ item.executorName || "-" }}
                  </td>
                  <td
                    class="border border-gray-300 p-2 px-2 text-center font-medium"
                    :class="getResultClass(item.abnormal)"
                  >
                    {{ getResultText(item.abnormal, item.executeResult) }}
                  </td>
                  <td class="border border-gray-300 p-2 px-2">
                    {{ item.audioText || "-" }}
                  </td>
                  <td class="border border-gray-300 p-2 px-2 text-center">
                    {{ item.reportingTime || "-" }}
                  </td>
                  <td class="border border-gray-300 p-2 px-2 text-center">
                    <div
                      v-if="getPhotoCount(item.photo) > 0"
                      class="flex justify-center gap-1"
                    >
                      <img
                        v-for="(url, idx) in getPhotoUrls(item.photo).slice(0, 3)"
                        :key="idx"
                        :src="url"
                        class="w-8 h-8 object-cover rounded cursor-pointer border border-gray-200 hover:border-blue-400"
                        @click="handlePreviewImages(item.photo)"
                      />
                      <span
                        v-if="getPhotoCount(item.photo) > 3"
                        class="flex items-center justify-center w-8 h-8 bg-gray-100 rounded text-xs text-gray-500"
                        @click="handlePreviewImages(item.photo)"
                      >
                        +{{ getPhotoCount(item.photo) - 3 }}
                      </span>
                    </div>
                    <span v-else>-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 任务总结 -->
        <div class="mt-8 p-5 bg-gray-50 rounded-lg">
          <div
            class="text-base font-bold text-gray-800 mb-4 pb-2.5 border-b border-gray-200"
          >
            任务总结
          </div>
          <div class="text-sm leading-7">
            <div v-if="abnormalItems.length > 0" class="mb-4">
              <div class="text-gray-600 mb-2">
                1、本次巡检共发现{{ abnormalItems.length }}项"异常"巡检项：
              </div>
              <div v-for="(item, index) in abnormalItems" :key="index" class="ml-5 mb-3">
                <div class="text-red-500 mb-1">
                  **{{ item.placeName }}：{{ item.contentName }}
                  <span v-if="item.executeResult" class="font-medium">
                    （{{ item.executeResult }}）
                  </span>
                  <span v-if="item.problemDesc" class="text-gray-500">
                    ；{{ item.problemDesc }}
                  </span>
                </div>
                <div
                  v-if="item.executeResult || item.problemDesc"
                  class="text-gray-600 ml-2.5"
                >
                  **改进建议：请考虑因受季节影响因素提高适当{{ item.contentName }}设置；
                </div>
              </div>
            </div>
            <div v-else class="text-green-500 mb-4">
              <div class="mb-2">1、本次巡检未发现异常巡检项。</div>
            </div>
            <div class="text-gray-600">
              <div class="mb-2">2、巡检时长正常，无漏检和超时。</div>
              <div>**无紧急报警；</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="dialog-footer">
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" v-print="printObj">打印</el-button>
    </div>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="previewVisible"
      :on-close="() => (previewVisible = false)"
      :url-list="previewImages"
      :initial-index="previewIndex"
    />
  </el-dialog>
</template>

<style scoped lang="scss">
.print-report-dialog ::v-deep .el-dialog__body {
  padding: 0;
  max-height: 70vh;
  overflow: hidden;
}

@media print {
  .print-report-dialog ::v-deep .el-dialog__header,
  .print-report-dialog ::v-deep .el-dialog__footer {
    display: none !important;
  }

  .print-report-dialog ::v-deep .el-dialog__body {
    max-height: none !important;
    overflow: visible !important;
  }

  .max-h-\[60vh\] {
    max-height: none !important;
    overflow: visible !important;
    padding: 0 !important;
    background: white !important;
  }

  #print-report-content {
    box-shadow: none !important;
    padding: 20px !important;
  }

  /* 确保背景色打印出来 */
  .bg-gradient-to-br,
  .bg-gray-50,
  .bg-sky-50 {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* 分页控制 */
  .mb-8 {
    page-break-inside: avoid;
  }
}
</style>
