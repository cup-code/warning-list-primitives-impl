<template>
  <div class="image-player">
    <el-image
      :src="src"
      :preview-src-list="[src]"
      fit="contain"
      class="image-content"
      :style="{ maxHeight: maxHeight }"
    >
      <div slot="error" class="image-error">
        <i class="el-icon-picture-outline" />
        <span>图片加载失败</span>
      </div>
      <div slot="placeholder" class="image-loading">
        <i class="el-icon-loading" />
        <span>加载中...</span>
      </div>
    </el-image>
  </div>
</template>

<script>
export default {
  name: 'ImagePlayer',
  props: {
    src: {
      type: String,
      required: true,
    },
    maxHeight: {
      type: String,
      default: '400px',
    },
  },
}
</script>

<style lang="scss" scoped>
.image-player {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;

  .image-content {
    max-width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .image-error,
  .image-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    color: #909399;

    i {
      font-size: 48px;
      margin-bottom: 12px;
    }

    span {
      font-size: 14px;
    }
  }
}
</style>