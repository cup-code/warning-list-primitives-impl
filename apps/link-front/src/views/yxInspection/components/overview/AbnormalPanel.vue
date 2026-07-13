<script setup>
const props = defineProps({
  points: {
    type: Array,
    default: () => [],
    // [{ id, name, placeCode, status, statusText, severity, taskName }]
    // status: 0-待审核，1-已确认
  },
  stats: {
    type: Object,
    default: () => ({}),
  },
});

function getSeverityColor(severity) {
  const map = {
    critical: "#FF4560",  // 已确认 - 红色
    warning: "#FFD93D",   // 待审核 - 黄色
  };
  return map[severity] || "#FFD93D";
}
</script>

<template>
  <section class="panel abnormal-panel">
    <div class="panel-header">
      <span class="panel-title">异常巡检点</span>
    </div>

    <div class="divider"></div>

    <div class="abnormal-list">
      <div v-for="point in points" :key="point.id" class="abnormal-card">
        <div
          class="abnormal-bar"
          :style="{ backgroundColor: getSeverityColor(point.severity) }"
        ></div>
        <div class="abnormal-content">
          <div class="abnormal-name">{{ point.name }}</div>
          <div class="abnormal-status">
            <span class="status-tag" :class="point.status === '1' ? 'confirmed' : 'pending'">
              {{ point.statusText }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="points.length === 0" class="empty-tip">
        暂无异常巡检点
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
}

.abnormal-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.divider {
  height: 1px;
  background: var(--border-dim, #1e3050);
  flex-shrink: 0;
}

.abnormal-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 4px;
}

.abnormal-list::-webkit-scrollbar {
  width: 4px;
}

.abnormal-list::-webkit-scrollbar-track {
  background: var(--border-dim, #1e3050);
}

.abnormal-list::-webkit-scrollbar-thumb {
  background: var(--accent-cyan, #00d4ff);
  opacity: 0.5;
}

.abnormal-card {
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 12px;
  background: var(--border-dim, #1e3050);
}

.abnormal-bar {
  width: 3px;
  border-radius: 0;
}

.abnormal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.abnormal-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #ffffff);
}

.abnormal-status {
  display: flex;
  align-items: center;
}

.status-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 2px;
}

.status-tag.pending {
  background: rgba(255, 217, 61, 0.15);
  color: #FFD93D;
}

.status-tag.confirmed {
  background: rgba(255, 69, 96, 0.15);
  color: #FF4560;
}

.empty-tip {
  font-size: 12px;
  color: var(--text-muted, #4a5f85);
  text-align: center;
  padding: 20px 0;
}
</style>
