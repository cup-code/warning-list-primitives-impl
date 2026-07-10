<script setup>
const props = defineProps({
  list: {
    type: Array,
    default: () => [],
    // [{ id, name, pct, status }]
  },
  taskCount: {
    type: Number,
    default: 0,
  },
});

function getProgressColor(status) {
  const map = {
    completed: "#00E396",
    in_progress: "#00D4FF",
    warning: "#FFD93D",
    critical: "#FF4560",
  };
  return map[status] || "#00D4FF";
}
</script>

<template>
  <section class="panel progress-panel">
    <div class="panel-header">
      <div class="header-left">
        <span class="panel-title">执行进度</span>
      </div>
      <!-- <span class="progress-badge">{{ taskCount }} 项任务</span> -->
    </div>

    <div class="progress-table">
      <div class="table-header">
        <div class="th th-status">状态</div>
        <div class="th th-name">巡检点</div>
        <div class="th th-progress">巡检任务完成率</div>
      </div>

      <div class="table-body">
        <div
          v-for="(item, idx) in list"
          :key="item.id"
          class="table-row"
          :class="{ even: idx % 2 === 1 }"
        >
          <div class="td td-status">
            <span class="status-icon" :class="item.status"></span>
          </div>
          <div class="td td-name">{{ item.name }}</div>
          <div class="td td-progress">
            <div class="progress-bar-wrapper">
              <div
                class="progress-bar"
                :style="{
                  width: `${item.pct}%`,
                  backgroundColor: getProgressColor(item.status),
                }"
              ></div>
            </div>
            <span class="progress-pct">{{ item.pct }}%</span>
          </div>
        </div>
      </div>
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
  justify-content: space-between;
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
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent-cyan, #00d4ff);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.progress-badge {
  font-size: 11px;
  color: var(--text-muted, #4a5f85);
  font-family: "IBM Plex Mono", monospace;
}

.progress-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.progress-table {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.table-header {
  display: flex;
  padding: 8px 16px;
  background: #0a1420;
  flex-shrink: 0;
}

.th {
  font-size: 11px;
  color: var(--text-muted, #4a5f85);
  font-weight: 600;
}

.th-status {
  width: 60px;
}

.th-name {
  flex: 1;
}

.th-progress {
  width: 140px;
  text-align: right;
}

.table-body {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.table-body::-webkit-scrollbar {
  width: 4px;
}

.table-body::-webkit-scrollbar-track {
  background: var(--border-dim, #1e3050);
}

.table-body::-webkit-scrollbar-thumb {
  background: var(--accent-cyan, #00d4ff);
  opacity: 0.5;
}

.table-row {
  display: flex;
  align-items: center;
  padding: 10px 16px;
}

.table-row.even {
  background: #0a1420;
}

.td {
  display: flex;
  align-items: center;
}

.td-status {
  width: 60px;
}

.status-icon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-icon.completed {
  background: var(--accent-green, #00e396);
}

.status-icon.in_progress {
  background: var(--accent-cyan, #00d4ff);
}

.status-icon.critical {
  background: var(--accent-red, #ff4560);
}

.td-name {
  flex: 1;
  font-size: 12px;
  color: var(--text-secondary, #8b9dc3);
}

.td-progress {
  width: 140px;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.progress-bar-wrapper {
  flex: 1;
  height: 6px;
  background: var(--progress-bg, #1a2740);
  border-radius: 0;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  border-radius: 0;
  transition: width 0.3s ease;
}

.progress-pct {
  font-size: 11px;
  color: var(--text-primary, #ffffff);
}
</style>
