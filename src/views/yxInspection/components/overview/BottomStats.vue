<script setup>
import { MapPin, TriangleAlert, Clock, Wifi } from "lucide-vue";

const props = defineProps({
  overviewData: {
    type: Object,
    default: () => null,
  },
  pointStats: {
    type: Object,
    default: () => ({ total: 0 }),
  },
});
</script>

<template>
  <div class="bottom-stats">
    <div class="stat-item">
      <MapPin :size="16" :stroke-width="2" color="#00E396" />
      <span class="stat-label">巡检点</span>
      <span class="stat-value green">
        {{ overviewData?.placeCount || pointStats.total }}
      </span>
    </div>

    <div class="stat-item">
      <TriangleAlert :size="16" :stroke-width="2" color="#FF4560" />
      <span class="stat-label">异常</span>
      <span class="stat-value red">{{ overviewData?.abnormalCount || 0 }}</span>
    </div>

    <div class="stat-item">
      <Clock :size="16" :stroke-width="2" color="#FFD93D" />
      <span class="stat-label">漏检</span>
      <span class="stat-value yellow">{{ overviewData?.missedCount || 0 }}</span>
    </div>

    <div class="stat-item">
      <Wifi :size="16" :stroke-width="2" color="#00E396" />
      <span class="stat-label">SOS</span>
      <span class="stat-value green">{{ overviewData?.sosCount || 0 }}</span>
    </div>
  </div>
</template>

<style scoped>
.bottom-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 50px;
  padding: 6px 16px;
  background: rgba(18, 38, 60, 0.85);
  border-radius: 8px;
  position: relative;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary, #8b9dc3);
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
}

.stat-value.green {
  color: var(--accent-green, #00e396);
}

.stat-value.red {
  color: var(--accent-red, #ff4560);
}

.stat-value.yellow {
  color: var(--accent-yellow, #ffd93d);
}
</style>