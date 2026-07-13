<script>
export default {
  name: 'SignBlock',
  props: {
    // 签名描述文字
    description: {
      type: String,
      default: '',
    },
    // 签名标题
    title: {
      type: String,
      default: '',
    },
    // 签名图片URL
    signImageUrl: {
      type: String,
      default: '',
    },
    // 签名时间
    signTime: {
      type: String,
      default: '',
    },
  },
  created() {
    this.getPrefix()
  },
}
</script>

<template>
  <div class="signature-section">
    <p
      v-if="description"
      class="description"
    >
      {{ description }}
    </p>
    <slot />
    <div class="signature-line">
      <span v-if="title">{{ title }}</span>
      <el-image
        v-if="signImageUrl"
        class="signature-area"
        :src="`${filePrefix}${signImageUrl}`"
        mode="scaleToFill"
      />
      <span
        v-else
        class="signature-area"
      >暂未签名</span>
    </div>
    <div class="date-line">
      {{ signTime }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.signature-section {
  margin: 10px 0;

  p {
    text-indent: 2em;
    margin-bottom: 6px;
  }

  .signature-line {
    display: flex;
    align-items: center;
    margin: 10px 0 0;
  }

  .signature-area {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 120px;
    height: 70px;
    border-bottom: 1px solid #999;
    text-align: center;
  }

  .date-line {
    margin-top: 5px;
    text-align: right;
  }
}
</style>
