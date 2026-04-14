<script>
export default {
  name: "LoadingText",
  props: {
    info: {
      type: Object,
      default: () => {
        return {
          text: "",
          isSuccess: false,
        };
      },
    },
  },
};
</script>

<style scoped lang="scss">
.warning-item {
  position: relative;
  min-height: 24px; // 确保高度稳定，避免布局抖动
}

.text-fade-enter-active,
.text-fade-leave-active {
  transition: opacity 0.3s ease;
}

.text-fade-enter-from,
.text-fade-leave-to {
  opacity: 0;
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.3s ease;
}

.icon-fade-enter-from,
.icon-fade-leave-to {
  opacity: 0;
}
</style>

<template>
  <div class="flex flex-col items-start mt-2 warning-item">
    <transition name="text-fade" mode="out-in">
      <div class="flex items-center px-5">
        <i
          v-if="info.isPending"
          key="icon-pending"
          class="mr-2 el-icon-loading text-white"
        />
        <div
          :class="[
            info.isPending
              ? 'text-white'
              : info.isSuccess
              ? 'text-green-400'
              : 'text-red-400',
          ]"
          :key="info.text"
        >
          {{ info.text }}
        </div>
        <i
          v-if="!info.isPending"
          :key="`icon-${info.isSuccess ? 'success' : 'error'}`"
          :class="[
            `ml-2`,
            info.isSuccess
              ? 'el-icon-check text-green-400'
              : 'el-icon-close text-red-400',
          ]"
        />
      </div>
    </transition>
  </div>
  <!-- </div> -->
</template>
