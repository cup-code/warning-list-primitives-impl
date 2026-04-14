<template>
  <div class="media-carousel">
    <!-- 媒体内容区 -->
    <div class="media-content">
      <!-- 空状态 -->
      <el-empty v-if="!items.length" description="暂无媒体文件" />

      <!-- 图片播放器 -->
      <ImagePlayer
        v-else-if="currentItem.type === 'image'"
        :key="currentIndex + 3"
        :src="currentItem.url"
        max-height="400px"
      />

      <!-- 视频播放器 -->
      <VideoPlayer
        v-else-if="currentItem.type === 'video'"
        ref="videoPlayer"
        :key="currentIndex + 1"
        :src="currentItem.url"
        max-height="400px"
      />

      <!-- 音频播放器 -->
      <AudioPlayer
        v-else-if="currentItem.type === 'audio'"
        ref="audioPlayer"
        :key="currentIndex + 2"
        :src="currentItem.url"
        :name="currentItem.name"
      />
    </div>

    <!-- 控制区域 -->
    <div v-if="items.length > 1" class="media-controls">
      <!-- 类型标签 -->
      <div class="media-type-tag">
        <el-tag :type="getTypeTagType(currentItem.type)" size="small">
          {{ getMediaTypeLabel(currentItem.type) }}
        </el-tag>
      </div>

      <!-- 导航控制 -->
      <div class="media-navigation">
        <el-button
          :disabled="currentIndex === 0"
          size="small"
          icon="el-icon-arrow-left"
          @click="handlePrev"
        >
          上一张
        </el-button>

        <span class="media-index"> {{ currentIndex + 1 }} / {{ items.length }} </span>

        <el-button
          :disabled="currentIndex === items.length - 1"
          size="small"
          @click="handleNext"
        >
          下一张
          <i class="el-icon-arrow-right" />
        </el-button>
      </div>

      <!-- 缩略图列表 -->
      <div v-if="showThumbnails" class="media-thumbnails">
        <div
          v-for="(item, index) in items"
          :key="index"
          class="thumbnail-item"
          :class="{ active: index === currentIndex }"
          @click="handleSelect(index)"
        >
          <i :class="getTypeIcon(item.type)" />
          <span>{{ item.name || `${getMediaTypeLabel(item.type)} ${index + 1}` }}</span>
        </div>
      </div>
    </div>

    <!-- 单个媒体时的信息显示 -->
    <div v-else-if="items.length === 1" class="media-single-info">
      <el-tag :type="getTypeTagType(currentItem.type)" size="small">
        {{ getMediaTypeLabel(currentItem.type) }}
      </el-tag>
      <span class="media-name">{{ currentItem.name }}</span>
    </div>
  </div>
</template>

<script>
import ImagePlayer from "./ImagePlayer.vue";
import VideoPlayer from "./VideoPlayer.vue";
import AudioPlayer from "./AudioPlayer.vue";
import { getMediaTypeLabel } from "@/utils/media";

export default {
  name: "MediaCarousel",
  components: {
    ImagePlayer,
    VideoPlayer,
    AudioPlayer,
  },
  props: {
    items: {
      type: Array,
      default: () => [],
      validator: (val) => {
        return val.every(
          (item) =>
            item.type && ["image", "video", "audio"].includes(item.type) && item.url
        );
      },
    },
    initialIndex: {
      type: Number,
      default: 0,
    },
    showThumbnails: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentIndex: 0,
    };
  },
  computed: {
    currentItem() {
      return this.items[this.currentIndex] || { type: "image", url: "", name: "" };
    },
  },
  watch: {
    initialIndex: {
      immediate: true,
      handler(val) {
        this.currentIndex = Math.max(0, Math.min(val, this.items.length - 1));
      },
    },
    items: {
      handler() {
        // 数据变化时重置索引
        this.currentIndex = Math.max(
          0,
          Math.min(this.currentIndex, this.items.length - 1)
        );
      },
    },
    currentIndex() {
      // 切换时暂停所有媒体
      this.pauseAllMedia();
    },
  },
  mounted() {
    // 监听键盘事件
    window.addEventListener("keydown", this.handleKeydown);
  },
  beforeDestroy() {
    window.removeEventListener("keydown", this.handleKeydown);
    this.pauseAllMedia();
  },
  methods: {
    getMediaTypeLabel,
    handlePrev() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    },
    handleNext() {
      if (this.currentIndex < this.items.length - 1) {
        this.currentIndex++;
      }
    },
    handleSelect(index) {
      this.currentIndex = index;
    },
    handleKeydown(e) {
      if (e.key === "ArrowLeft") {
        this.handlePrev();
      } else if (e.key === "ArrowRight") {
        this.handleNext();
      }
    },
    pauseAllMedia() {
      this.$nextTick(() => {
        if (this.$refs.videoPlayer) {
          this.$refs.videoPlayer.pause();
        }
        if (this.$refs.audioPlayer) {
          this.$refs.audioPlayer.pause();
        }
      });
    },
    getTypeTagType(type) {
      const typeMap = {
        image: "success",
        video: "primary",
        audio: "warning",
      };
      return typeMap[type] || "info";
    },
    getTypeIcon(type) {
      const iconMap = {
        image: "el-icon-picture",
        video: "el-icon-video-camera",
        audio: "el-icon-headset",
      };
      return iconMap[type] || "el-icon-document";
    },
  },
};
</script>

<style lang="scss" scoped>
.media-carousel {
  width: 100%;
  min-height: 300px;

  .media-content {
    width: 100%;
    min-height: 250px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f5f7fa;
    border-radius: 4px;
    overflow: hidden;
  }

  .media-controls {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;

    .media-type-tag {
      text-align: center;
    }

    .media-navigation {
      display: flex;
      align-items: center;
      gap: 16px;

      .media-index {
        font-size: 14px;
        color: #606266;
        min-width: 60px;
        text-align: center;
      }
    }

    .media-thumbnails {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-top: 8px;
      max-width: 100%;
      overflow-x: auto;

      .thumbnail-item {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 12px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;

        &:hover {
          border-color: #409eff;
          color: #409eff;
        }

        &.active {
          border-color: #409eff;
          background-color: #ecf5ff;
          color: #409eff;
        }

        i {
          font-size: 14px;
        }
      }
    }
  }

  .media-single-info {
    margin-top: 12px;
    text-align: center;

    .media-name {
      margin-left: 8px;
      color: #606266;
      font-size: 14px;
    }
  }
}
</style>
