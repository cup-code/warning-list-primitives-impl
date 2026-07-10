<script setup>
const props = defineProps({
  tasks: {
    type: Array,
    default: () => [],
    // [{ id, title, detail }]
  },
});
</script>

<template>
  <section class="panel violation-panel">
    <div class="panel-header">
      <span class="panel-title">超时任务</span>
    </div>

    <div class="violation-list">
      <div v-for="task in tasks" :key="task.id" class="violation-card">
        <div class="violation-bar"></div>
        <div class="violation-content">
          <span class="violation-title">{{ task.title }}</span>
          <span class="violation-detail">{{ task.detail }}</span>
        </div>
      </div>
      <div v-if="tasks.length === 0" class="empty-tip">暂无超时任务</div>
    </div>
  </section>
</template>

<style scoped>
.panel {
  background: rgba(18, 38, 60, 0.85);
  border-radius: 8px;
  padding: 12px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  position: relative;
  padding-left: 12px;
}

.panel-header::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 100%;
  height: 24px;
  background: url("@/assets/xingfa/titleIcon.png") no-repeat left center;
  background-size: contain;
  opacity: 0.9;
}

.panel-title {
  font-size: 14px;
  font-weight: 600;
  margin-left: 12px;
  color: var(--text-primary, #ffffff);
  z-index: 88;
}

.violation-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.violation-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 4px;
}

.violation-list::-webkit-scrollbar {
  width: 4px;
}

.violation-list::-webkit-scrollbar-track {
  background: var(--border-dim, #1e3050);
}

.violation-list::-webkit-scrollbar-thumb {
  background: var(--accent-cyan, #00d4ff);
  opacity: 0.5;
}

.violation-card {
  display: flex;
  align-items: stretch;
  gap: 10px;
  background: var(--border-dim, #1e3050);
  border-radius: 0;
  padding: 12px;
}

.violation-bar {
  width: 4px;
  border-radius: 0;
  background: #ff4560;
}

.violation-content {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.violation-title {
  font-size: 13px;
  color: var(--text-primary, #ffffff);
}

.violation-detail {
  font-size: 11px;
  color: var(--accent-red, #ff4560);
}

.empty-tip {
  font-size: 12px;
  color: var(--text-muted, #4a5f85);
  text-align: center;
  padding: 20px 0;
}
</style>
