<script>
export default {
  name: 'ECard',
  props: {
    // 卡片模块类型 “搜索模块search”、“侧边栏模块sidebar”
    // 默认为空
    type: {
      type: String,
      default: '',
    },
    customStyle: {
      type: String,
      default: '',
    },
    noneBottom: {
      type: Boolean,
      default: false,
    },
    icon: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    getStyle() {
      return `${this.noneBottom ? `margin-bottom: 0px!important` : ''}${
        this.customStyle
      }`
    },
  },
}
</script>

<template>
  <div
    class="e-card"
    :class="`e-card-${type}`"
    :style="getStyle"
  >
    <div
      v-if="$slots.title"
      class="title"
      :class="{ icon }"
    >
      <slot name="title" />
    </div>
    <slot />
  </div>
</template>

<style scoped lang="scss">
.e-card {
  background: #ffffff;
  border-radius: 6px;
  padding: 12px 10px;
  height: 100%;
  margin-bottom: 10px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  .title {
    font-size: 14px;
    font-weight: 500;
    color: #333333;
    display: flex;
    align-items: center;
  }

  .icon {
    position: relative;
    padding-left: 10px;

    &::before {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      left: 0px;
      content: "";
      display: inline-block;
      width: 4px;
      height: 14px;
      background: var(--ky-primary);
    }
  }

  .card-cell {
    margin-bottom: 10px;
  }

  &-search {
    padding: 14px 10px 4px;
    height: auto !important;
  }

  &-sidebar {
    padding: 20px 10px;
    width: 200px;
    height: 100%;
    margin-right: 16px;
    margin-bottom: 0 !important;
  }

  &-footer {
    padding: 10px 20px;
    height: auto !important;
    margin-bottom: 0 !important;
  }
}
</style>
