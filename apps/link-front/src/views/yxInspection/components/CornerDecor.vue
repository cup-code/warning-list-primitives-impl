<script>
/**
 * 角落装饰组件 - 科技风格边框角标
 * 用于面板四角的括号装饰效果
 */
export default {
  name: "CornerDecor",
  props: {
    // 角落位置: tl(左上) | tr(右上) | bl(左下) | br(右下)
    position: {
      type: String,
      default: "tl",
      validator: (val) => ["tl", "tr", "bl", "br"].includes(val),
    },
    // 颜色
    color: {
      type: String,
      default: "#00D4FF",
    },
    // 边长
    size: {
      type: Number,
      default: 16,
    },
    // 线宽
    strokeWidth: {
      type: Number,
      default: 4,
    },
  },
  computed: {
    path() {
      const s = this.size;
      const paths = {
        tl: `M${s} 0 H0 V${s}`,
        tr: `M0 0 H${s} V${s}`,
        bl: `M${s} ${s} H0 V0`,
        br: `M0 ${s} H${s} V0`,
      };
      return paths[this.position];
    },
    viewBox() {
      return `0 0 ${this.size} ${this.size}`;
    },
  },
};
</script>

<template>
  <svg
    class="corner-decor"
    :class="`corner-${position}`"
    :viewBox="viewBox"
    :width="size"
    :height="size"
    fill="none"
  >
    <!-- 发光层 -->
    <path
      :d="path"
      :stroke="color"
      :stroke-width="strokeWidth + 6"
      stroke-linecap="square"
      opacity="0.2"
    />
    <!-- 主线条 -->
    <path
      :d="path"
      :stroke="color"
      :stroke-width="strokeWidth"
      stroke-linecap="square"
    />
  </svg>
</template>

<style scoped>
.corner-decor {
  position: absolute;
  pointer-events: none;
  filter: drop-shadow(0 0 6px currentColor);
  animation: corner-pulse 3s ease-in-out infinite;
}

@keyframes corner-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.corner-tl {
  top: 0;
  left: 0;
}
.corner-tr {
  top: 0;
  right: 0;
}
.corner-bl {
  bottom: 0;
  left: 0;
}
.corner-br {
  bottom: 0;
  right: 0;
}
</style>