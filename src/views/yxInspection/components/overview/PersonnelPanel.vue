<script setup>
import { User } from "lucide-vue";

const props = defineProps({
  staffList: {
    type: Array,
    default: () => [],
  },
  staffStats: {
    type: Object,
    default: () => ({ online: 0, offline: 0, sos: 0 }),
  },
  focusedUserId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["staff-click"]);

function onStaffRowClick(staff) {
  // 有用户ID时才可点击
  if (staff.id) {
    emit("staff-click", staff);
  }
}
</script>

<template>
  <section class="panel personnel-panel">
    <div class="panel-header">
      <span class="panel-title">人员状态</span>
    </div>

    <div class="personnel-summary">
      <div class="summary-item">
        <span class="status-dot online"></span>
        <span>在线 {{ staffStats.online }}</span>
      </div>
      <div class="summary-item">
        <span class="status-dot offline"></span>
        <span>离线 {{ staffStats.offline }}</span>
      </div>
      <div class="summary-item">
        <span class="status-dot sos"></span>
        <span>报警 {{ staffStats.sos }}</span>
      </div>
    </div>

    <div class="personnel-list">
      <div
        v-for="staff in staffList"
        :key="staff.id"
        class="personnel-card"
        :class="{
          clickable: staff.id,
          focused: focusedUserId === staff.id,
        }"
        @click="onStaffRowClick(staff)"
      >
        <div class="staff-avatar" :style="{ backgroundColor: staff.avatarColor }">
          <User :size="32" :stroke-width="1.5" color="currentColor" />
        </div>
        <div class="staff-info">
          <div class="staff-name">{{ staff.name }}</div>
          <div class="staff-point">{{ staff.pointName || "未关联点位" }}</div>
        </div>
        <span class="status-indicator" :class="staff.status"></span>
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

.personnel-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.personnel-summary {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-shrink: 0;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary, #8b9dc3);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.online {
  background: var(--accent-green, #00e396);
}

.status-dot.offline {
  background: var(--text-muted, #4a5f85);
}

.status-dot.sos {
  background: var(--accent-red, #ff4560);
}

.personnel-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  padding-right: 4px;
}

.personnel-list::-webkit-scrollbar {
  width: 4px;
}

.personnel-list::-webkit-scrollbar-track {
  background: var(--border-dim, #1e3050);
}

.personnel-list::-webkit-scrollbar-thumb {
  background: var(--accent-cyan, #00d4ff);
  opacity: 0.5;
}

.personnel-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--border-dim, #1e3050);
  border-radius: 0;
  padding: 10px;
}

.personnel-card.clickable {
  cursor: pointer;
  transition: background 0.2s;
}

.personnel-card.clickable:hover {
  background: rgba(0, 212, 255, 0.1);
}

.personnel-card.focused {
  background: rgba(0, 212, 255, 0.2);
  border: 1px solid var(--accent-cyan, #00d4ff);
}

.staff-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary, #0b1120);
}

.staff-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.staff-name {
  font-size: 13px;
  color: var(--text-primary, #ffffff);
}

.staff-point {
  font-size: 11px;
  color: var(--text-muted, #4a5f85);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.online {
  background: var(--accent-green, #00e396);
}

.status-indicator.sos {
  background: var(--accent-red, #ff4560);
  animation: sos-blink 1s ease-in-out infinite;
}

.status-indicator.offline {
  background: var(--text-muted, #4a5f85);
}

@keyframes sos-blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}
</style>
