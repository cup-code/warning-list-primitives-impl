<script>
import { computed, ref } from "vue";
import { resolveMediaUrl } from "@/utils/media";

export default {
  name: "ExceptionRecordPrint",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    info: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:visible", "close"],
  setup(props, { emit }) {
    // 图片URL列表
    const photoList = computed(() => {
      if (!props.info.photo) return [];
      return props.info.photo
        .split(",")
        .filter((url) => url.trim())
        .map((url) => resolveMediaUrl(url.trim()));
    });

    // 视频URL
    const videoUrl = computed(() => {
      if (!props.info.video) return "";
      return resolveMediaUrl(props.info.video);
    });

    // 语音数量
    const audioCount = computed(() => {
      if (!props.info.audio) return 0;
      return props.info.audio.split(",").filter((url) => url.trim()).length;
    });

    // 统计数据
    const statistics = computed(() => ({
      photoCount: photoList.value.length,
      videoCount: props.info.video ? 1 : 0,
      audioCount: audioCount.value,
    }));

    // 打印配置
    const printObj = computed(() => ({
      id: "print-exception-content",
      popTitle: "异常记录报告",
    }));

    // 图片预览相关
    const previewVisible = ref(false);
    const previewImages = ref([]);
    const previewIndex = ref(0);

    // 处理图片预览
    const handlePreviewImages = () => {
      const urls = photoList.value;
      if (urls.length > 0) {
        previewImages.value = urls;
        previewIndex.value = 0;
        previewVisible.value = true;
      }
    };

    // 格式化异常时间
    const formatExceptionTime = (val) => {
      if (!val) return "-";
      const str = String(val).trim().replace(/-/g, "/");
      const match = str.match(/^(\d{4}\/\d{1,2}\/\d{1,2})\s*(\d{1,2}:\d{2})/);
      return match ? `${match[1]} ${match[2]}` : val;
    };

    // 获取审核结果文本
    const getAuditResultText = (result) => {
      if (result === "0") return "误报";
      if (result === "1") return "问题";
      if (result === "2") return "安全隐患";
      return "-";
    };

    // 获取异常级别文本
    const getAbnormalLevelText = (level) => {
      if (level === "1") return "一般";
      if (level === "3") return "紧急";
      return "-";
    };

    // 关闭弹窗
    const handleClose = () => {
      emit("update:visible", false);
      emit("close");
    };

    return {
      photoList,
      videoUrl,
      audioCount,
      statistics,
      printObj,
      previewVisible,
      previewImages,
      previewIndex,
      handlePreviewImages,
      formatExceptionTime,
      getAuditResultText,
      getAbnormalLevelText,
      handleClose,
    };
  },
};
</script>

<template>
  <el-dialog
    title="打印异常记录"
    :visible.sync="visible"
    width="800px"
    :close-on-click-modal="false"
    destroy-on-close
    custom-class="print-exception-dialog"
    @close="handleClose"
  >
    <div class="max-h-[60vh] overflow-y-auto p-5 bg-gray-100">
      <!-- 打印内容区域 -->
      <div id="print-exception-content" class="bg-white p-8 min-h-[500px] shadow-md">
        <!-- 页眉 -->
        <div
          class="flex items-center justify-between mb-8 pb-5 border-b-2 border-gray-200"
        >
          <div class="flex items-center gap-2.5">
            <img src="/blob.png" alt="logo" class="w-10 h-10 object-contain" />
            <span class="text-sm text-gray-600 font-medium">两山智联-易巡</span>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-800">异常记录报告</h1>
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
            <div class="text-sm text-gray-600 mb-2">图片数量</div>
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
            <div class="text-sm text-gray-600 mb-2">语音数量</div>
            <div class="text-3xl font-bold text-amber-500">
              {{ statistics.audioCount }}<span class="text-base ml-0.5">条</span>
            </div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="mb-8 p-5 bg-gray-50 rounded-lg">
          <div class="flex gap-10 mb-3">
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">计划名称：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                info.planName || "-"
              }}</span>
            </div>
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">巡检岗位：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                info.inspectionPost || info.postName || "-"
              }}</span>
            </div>
          </div>
          <div class="flex gap-10 mb-3">
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">巡检人员：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                info.inspector || info.executeUsername || "-"
              }}</span>
            </div>
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">异常时间：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                formatExceptionTime(info.exceptionTime || info.executeDate)
              }}</span>
            </div>
          </div>
          <div class="flex gap-10 mb-3">
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">所属部门：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                info.department || info.departmentName || "-"
              }}</span>
            </div>
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">巡检班次：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                info.inspectionShift || info.taskName || "-"
              }}</span>
            </div>
          </div>
          <div class="flex gap-10 mb-3">
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">巡检点：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                info.placeName || "-"
              }}</span>
            </div>
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">巡检位置：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                info.placePosition || "-"
              }}</span>
            </div>
          </div>
          <div class="flex gap-10">
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">巡检内容：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                info.contentName || "-"
              }}</span>
            </div>
            <div class="flex-1 flex items-start">
              <span class="text-sm text-gray-500 min-w-[70px]">巡检标准：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                info.inspectionBenchmark || info.inspectionStandard || "-"
              }}</span>
            </div>
          </div>
        </div>

        <!-- 多媒体展示区域 -->
        <div class="mb-8">
          <!-- 图片 -->
          <div class="flex items-start mb-4">
            <div class="text-sm text-gray-800 font-medium mb-2">图片：</div>
            <div v-if="photoList.length > 0" class="flex gap-2">
              <img
                v-for="(url, idx) in photoList.slice(0, 3)"
                :key="idx"
                :src="url"
                class="w-20 h-20 object-cover rounded cursor-pointer border border-gray-200 hover:border-blue-400"
                @click="handlePreviewImages"
              />
              <span
                v-if="photoList.length > 3"
                class="flex items-center justify-center w-20 h-20 bg-gray-100 rounded text-sm text-gray-500 cursor-pointer"
                @click="handlePreviewImages"
              >
                +{{ photoList.length - 3 }}
              </span>
            </div>
            <span v-else class="text-sm text-gray-400">暂无图片</span>
          </div>

          <!-- 视频 -->
          <!-- <div class="flex items-start mb-4">
            <div class="text-sm text-gray-800 font-medium mb-2">视频：</div>
            <div
              v-if="videoUrl"
              class="flex items-center justify-center w-[200px] h-[120px] rounded overflow-hidden bg-gray-100"
            >
              <span class="text-sm text-gray-400">打印无法展示视频</span>
            </div>
            <span v-else class="text-sm text-gray-400">暂无视频</span>
          </div> -->

          <!-- 语音（语音转文字） -->
          <div class="mb-4">
            <div class="flex items-center">
              <span class="text-sm text-gray-800 font-medium">语音：</span>
              <span v-if="info.audioText" class="text-sm text-gray-600">{{
                info.audioText
              }}</span>
              <span v-else class="text-sm text-gray-400">暂无语音文字</span>
            </div>
          </div>

          <!-- 文字（问题描述） -->
          <div class="mb-4">
            <div class="flex items-start">
              <span class="text-sm text-gray-800 font-medium">文字：</span>
              <span v-if="info.problemDesc" class="text-sm text-gray-600">{{
                info.problemDesc
              }}</span>
              <span v-else class="text-sm text-gray-400">暂无文字内容</span>
            </div>
          </div>
        </div>

        <!-- 审核信息 -->
        <div class="mb-8 p-5 bg-gray-50 rounded-lg">
          <div class="flex gap-10 mb-3">
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">审核结果：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                getAuditResultText(info.auditResult)
              }}</span>
            </div>
            <div class="flex-1 flex items-center">
              <span class="text-sm text-gray-500 min-w-[70px]">异常级别：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                getAbnormalLevelText(info.abnormalLevel)
              }}</span>
            </div>
          </div>
          <div class="flex gap-10">
            <div class="flex-1 flex items-start">
              <span class="text-sm text-gray-500 min-w-[70px]">问题描述：</span>
              <span class="text-sm text-gray-800 font-medium">{{
                info.problemDesc || "-"
              }}</span>
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

<style lang="scss" scoped>
.print-exception-dialog ::v-deep .el-dialog__body {
  padding: 0;
  max-height: 70vh;
  overflow: hidden;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

@media print {
  .print-exception-dialog ::v-deep .el-dialog__header,
  .print-exception-dialog ::v-deep .el-dialog__footer {
    display: none !important;
  }

  .print-exception-dialog ::v-deep .el-dialog__body {
    max-height: none !important;
    overflow: visible !important;
  }

  .max-h-\[60vh\] {
    max-height: none !important;
    overflow: visible !important;
    padding: 0 !important;
    background: white !important;
  }

  #print-exception-content {
    box-shadow: none !important;
    padding: 20px !important;
  }

  /* 确保背景色打印 */
  .bg-gradient-to-br,
  .bg-gray-50,
  .bg-amber-50 {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* 分页控制 */
  .bg-gray-50 {
    page-break-inside: avoid;
  }

  .mb-8 {
    page-break-inside: avoid;
  }
}
</style>
