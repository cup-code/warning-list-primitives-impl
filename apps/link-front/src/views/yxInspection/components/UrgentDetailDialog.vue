<script>
import { ref, computed, watch, getCurrentInstance } from "vue";

export default {
  name: "UrgentDetailDialog",
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
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const dialogVisible = ref(false);

    // 弹窗标题
    const dialogTitle = computed(() => "紧急记录详情");

    // filePrefix 前缀（用于图片、视频、音频URL）
    const filePrefix = computed(() => {
      const globalData = JSON.parse(localStorage.getItem("globalData")) || {};
      return globalData.minioFilePrefix || "";
    });

    // 图片列表（添加 filePrefix 前缀）
    const photoList = computed(() => {
      if (!props.info.photo) return [];
      return props.info.photo
        .split(",")
        .filter((url) => url.trim())
        .map((url) => filePrefix.value + url.trim());
    });

    // 视频URL（添加 filePrefix 前缀）
    const videoUrl = computed(() => {
      if (!props.info.video) return "";
      return filePrefix.value + props.info.video;
    });

    // 音频URL（添加 filePrefix 前缀）
    const audioUrl = computed(() => {
      if (!props.info.audio) return "";
      return filePrefix.value + props.info.audio;
    });

    // 格式化异常时间
    const formatExceptionTime = (val) => {
      if (!val) return "-";
      const str = String(val).trim().replace(/-/g, "/");
      const match = str.match(/^(\d{4}\/\d{1,2}\/\d{1,2})\s*(\d{1,2}:\d{2})/);
      return match ? `${match[1]} ${match[2]}` : val;
    };

    // 审核结果文本
    const auditResultText = computed(() => {
      const result = props.info.auditResult;
      if (result === "0") return "误报";
      if (result === "1") return "问题";
      if (result === "2") return "安全隐患";
      return "-";
    });

    // 异常级别文本
    const abnormalLevelText = computed(() => {
      const level = props.info.abnormalLevel;
      if (level === "1") return "一般";
      if (level === "3") return "紧急";
      return "-";
    });

    // 监听visible变化
    watch(
      () => props.visible,
      (val) => {
        dialogVisible.value = val;
      },
      { immediate: true }
    );

    // 关闭弹窗
    const handleClose = () => {
      emit("update:visible", false);
      emit("close");
    };

    return {
      dialogVisible,
      dialogTitle,
      filePrefix,
      photoList,
      videoUrl,
      audioUrl,
      formatExceptionTime,
      auditResultText,
      abnormalLevelText,
      handleClose,
    };
  },
};
</script>

<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <el-form label-width="90px" size="small">
      <!-- 基本信息：两列布局 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="计划名称：">
            <span class="detail-text">{{ info.planName || "-" }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="巡检岗位：">
            <span class="detail-text">{{
              info.inspectionPost || info.postName || "-"
            }}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="巡检人员：">
            <span class="detail-text">{{
              info.inspector || info.executeUsername || "-"
            }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="异常时间：">
            <span class="detail-text">{{
              formatExceptionTime(info.exceptionTime || info.executeDate)
            }}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="巡检点：">
            <span class="detail-text">{{ info.placeName || "-" }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="巡检位置：">
            <span class="detail-text">{{ info.placePosition || "-" }}</span>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 巡检信息 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="巡检内容：">
            <span class="detail-text">{{ info.contentName || "-" }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="巡检标准：">
            <span class="detail-text">{{ info.inspectionBenchmark || "-" }}</span>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 多媒体展示区域 -->
      <!-- 图片 -->
      <el-form-item label="图片">
        <div class="media-list">
          <div
            v-for="(url, index) in photoList"
            :key="index"
            class="media-item image-item"
          >
            <el-image
              :src="url"
              :preview-src-list="photoList"
              fit="cover"
              class="preview-image"
            >
              <div slot="error" class="image-error">
                <i class="el-icon-picture-outline"></i>
              </div>
            </el-image>
          </div>
          <div v-if="photoList.length === 0" class="no-media">暂无图片</div>
        </div>
      </el-form-item>

      <!-- 视频 -->
      <el-form-item label="视频：">
        <div class="media-list">
          <div v-if="videoUrl" class="media-item video-item">
            <video
              :src="videoUrl"
              controls
              class="preview-video"
              preload="metadata"
            ></video>
          </div>
          <div v-else class="no-media">暂无视频</div>
        </div>
      </el-form-item>

      <!-- 语音 -->
      <el-form-item label="语音：">
        <div class="media-list">
          <div v-if="audioUrl" class="media-item audio-item">
            <audio :src="audioUrl" controls class="preview-audio"></audio>
          </div>
          <div v-else class="no-media">暂无语音</div>
        </div>
      </el-form-item>

      <!-- 文字（语音转文字） -->
      <el-form-item label="文字：">
        <el-input
          :value="info.problemDesc || '-'"
          type="textarea"
          :rows="2"
          disabled
          placeholder="暂无文字内容"
        />
      </el-form-item>

      <!-- 处理信息 -->
      <el-form-item label="审核结果：">
        <span class="detail-text">{{ auditResultText }}</span>
      </el-form-item>

      <!-- 审核结果为"问题"时显示异常级别和问题描述 -->
      <template v-if="info.auditResult === '1'">
        <el-form-item label="异常级别：">
          <span class="detail-text">{{ abnormalLevelText }}</span>
        </el-form-item>

        <el-form-item label="问题描述：">
          <span class="detail-text">{{ info.problemDesc || "-" }}</span>
        </el-form-item>
      </template>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose" size="small">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
::v-deep .el-form-item__label {
  font-weight: bold;
}

.detail-text {
  color: #606266;
  line-height: 32px;
}

.media-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.media-item {
  border-radius: 4px;
  overflow: hidden;
  background-color: #f5f7fa;

  &.image-item {
    width: 80px;
    height: 80px;
  }

  &.video-item {
    width: 200px;
    height: 120px;
  }

  &.audio-item {
    width: 100%;
    max-width: 400px;
  }
}

.no-media {
  color: #909399;
  font-size: 12px;
}

.preview-image {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-audio {
  width: 100%;
  height: 40px;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 24px;
  color: #909399;
  background-color: #f5f7fa;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
