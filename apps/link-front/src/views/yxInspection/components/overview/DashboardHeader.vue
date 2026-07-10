<script setup>
import { Maximize, Minimize } from "lucide-vue";

const props = defineProps({
  userName: {
    type: String,
    default: "用户",
  },
  isFullscreen: {
    type: Boolean,
    default: false,
  },
  isBigScreenHome: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["fullscreen-toggle", "enter-management"]);
</script>

<template>
  <header class="dashboard-header">
    <div class="header-title-wrapper">
      <div class="header-decoration left"></div>
      <h1 class="header-title">巡检总览</h1>
      <div class="header-decoration right"></div>
    </div>
    <div class="header-right">
      <div class="user-info" v-if="isBigScreenHome">
        <div class="user-greeting">您好，{{ userName }}</div>
        <div class="management-entry" @click="emit('enter-management')">
          进入管理中心 &gt;&gt;
        </div>
      </div>
      <button class="fullscreen-btn" @click="emit('fullscreen-toggle')">
        <Maximize
          v-if="!isFullscreen"
          :size="18"
          :stroke-width="2"
          color="currentColor"
        />
        <Minimize v-else :size="18" :stroke-width="2" color="currentColor" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  padding: 0 24px;
  background: var(--bg-panel-header, #0d1829);
  background-image: url("~@/assets/xingfa/top bg.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 0;
  position: relative;
  border-bottom: 1px solid rgba(0, 212, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.1), inset 0 -1px 0 rgba(0, 212, 255, 0.2);
}

.header-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.header-decoration {
  width: 120px;
  height: 2px;
  background: linear-gradient(
    to right,
    transparent,
    var(--accent-cyan, #00d4ff),
    transparent
  );
  box-shadow: 0 0 10px var(--accent-cyan, #00d4ff);
}

.header-decoration.right {
  background: linear-gradient(
    to left,
    transparent,
    var(--accent-cyan, #00d4ff),
    transparent
  );
}

.header-title {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 4px;
  color: var(--accent-cyan, #00d4ff);
  margin: 0;
  position: relative;
  z-index: 1;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
}

.header-right {
  position: absolute;
  right: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.user-greeting {
  font-size: 12px;
  color: var(--text-primary, #ffffff);
  white-space: nowrap;
}

.management-entry {
  font-size: 12px;
  color: var(--accent-cyan, #00d4ff);
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s;
}

.management-entry:hover {
  opacity: 0.8;
}

.fullscreen-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: var(--accent-cyan, #00d4ff);
  cursor: pointer;
  transition: all 0.2s;
}

.fullscreen-btn:hover {
  background: rgba(0, 212, 255, 0.1);
  border-color: var(--accent-cyan, #00d4ff);
}
</style>
