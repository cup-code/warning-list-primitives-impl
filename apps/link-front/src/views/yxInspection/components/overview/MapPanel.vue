<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { Radar } from "lucide-vue";

const props = defineProps({
  points: {
    type: Array,
    default: () => [],
    // [{ id, name, lng, lat, status, data }]
  },
  focusedPointId: {
    type: String,
    default: null,
  },
  defaultCenter: {
    type: Array,
    default: () => [113.264385, 23.129112],
  },
  defaultZoom: {
    type: Number,
    default: 14,
  },
});

const emit = defineEmits(["point-focus"]);

// 状态常量
const POINT_STATUS = {
  NO_CLOCK: "no_clock",
  CURRENT: "current",
  ABNORMAL: "abnormal",
  SOS: "sos",
};

const mapContainerId = "inspectionMapContainer";
const mapReady = ref(false);
const mapInstance = ref(null);
const markersMap = ref({});
const isMapInitialized = ref(false);

// 当前聚焦的点
const currentFocusedPoint = computed(() => {
  if (!props.focusedPointId) return null;
  return props.points.find((p) => p.id === props.focusedPointId);
});

// 获取点位颜色
function getPointColor(status) {
  const map = {
    [POINT_STATUS.CURRENT]: "#00E396",
    [POINT_STATUS.ABNORMAL]: "#FFD93D",
    [POINT_STATUS.NO_CLOCK]: "#4A5F85",
    [POINT_STATUS.SOS]: "#FF4560",
  };
  return map[status] || "#4A5F85";
}

// 初始化地图
function initMap() {
  if (!window.AMap) {
    console.error("高德地图 SDK 未加载");
    return;
  }

  const container = document.getElementById(mapContainerId);
  if (!container) {
    console.error("地图容器未找到");
    return;
  }

  // 计算地图中心点
  const points = props.points;
  let center = props.defaultCenter;
  let zoom = props.defaultZoom;

  if (points.length > 0) {
    const avgLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
    const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    if (!isNaN(avgLng) && !isNaN(avgLat)) {
      center = [avgLng, avgLat];
    }
  }

  // 创建地图实例
  mapInstance.value = new window.AMap.Map(mapContainerId, {
    zoom: zoom,
    center: center,
    viewMode: "3D",
    terrain: true,
    mapStyle: "amap://styles/dark",
    scrollWheel: true,
    dragEnable: true,
    zoomEnable: true,
    doubleClickZoom: true,
  });

  // 地图加载完成后调整视野并创建markers
  mapInstance.value.on("complete", () => {
    mapReady.value = true;
    isMapInitialized.value = true;
    if (props.points.length > 0) {
      createMarkers();
      mapInstance.value.setFitView(null, false, [50, 50, 50, 50]);
    }
  });
}

// 创建点位 marker
function createMarkers() {
  if (!mapInstance.value) return;

  // 清除现有 marker
  Object.values(markersMap.value).forEach((marker) => {
    marker.setMap(null);
  });
  markersMap.value = {};

  props.points.forEach((point) => {
    // 跳过无效坐标
    if (!point.lng || !point.lat || isNaN(point.lng) || isNaN(point.lat)) return;

    const color = getPointColor(point.status);
    const isSos = point.status === POINT_STATUS.SOS;

    // 创建自定义 marker 内容
    const markerContent = document.createElement("div");
    markerContent.className = "custom-marker";
    markerContent.innerHTML = `
      <div class="marker-dot ${isSos ? "sos-blink" : ""}" style="background-color: ${color}">
        <div class="marker-glow ${isSos ? "sos-glow-blink" : ""}" style="background-color: ${color}"></div>
      </div>
      <span class="marker-label">${point.name}</span>
    `;

    // 创建 marker
    const marker = new window.AMap.Marker({
      position: [point.lng, point.lat],
      content: markerContent,
      offset: new window.AMap.Pixel(-7, -7),
    });

    marker.setMap(mapInstance.value);

    // 点击事件
    marker.on("click", () => {
      emit("point-focus", point.id);
    });

    markersMap.value[point.id] = marker;
  });

  // 调整视野
  if (props.points.length > 0) {
    mapInstance.value.setFitView(null, false, [50, 50, 50, 50]);
  }
}

// 聚焦某个点位
function focusPoint(pointId) {
  const point = props.points.find((p) => p.id === pointId);
  if (!point || !mapInstance.value) return;

  mapInstance.value.setCenter([point.lng, point.lat]);
  mapInstance.value.setZoom(16);

  // 高亮对应的 marker
  const marker = markersMap.value[pointId];
  if (marker) {
    const content = marker.getContent();
    if (content) {
      const dot = content.querySelector(".marker-dot");
      if (dot) {
        dot.style.transform = "scale(1.3)";
      }
    }
  }
}

// 更新中心点
function updateCenter(points) {
  if (!mapInstance.value || points.length === 0) return;

  const avgLng = points.reduce((sum, p) => sum + p.lng, 0) / points.length;
  const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  mapInstance.value.setCenter([avgLng, avgLat]);
}

// 销毁地图
function destroyMap() {
  Object.values(markersMap.value).forEach((marker) => {
    marker.setMap(null);
  });
  markersMap.value = {};

  if (mapInstance.value) {
    mapInstance.value.destroy();
    mapInstance.value = null;
  }
  mapReady.value = false;
  isMapInitialized.value = false;
}

// 暴露给父组件的方法
defineExpose({
  initMap,
  createMarkers,
  focusPoint,
  updateCenter,
  destroyMap,
});

// 监听点位变化
watch(
  () => props.points,
  (newPoints) => {
    if (mapReady.value && mapInstance.value) {
      createMarkers();
      if (newPoints.length > 0) {
        updateCenter(newPoints);
      }
    }
  },
  { deep: true }
);

// 监听聚焦点位变化
watch(
  () => props.focusedPointId,
  (newId) => {
    if (newId) {
      focusPoint(newId);
    }
  }
);

onMounted(() => {
  setTimeout(() => {
    initMap();
  }, 100);
});

onUnmounted(() => {
  destroyMap();
});
</script>

<template>
  <div class="map-container">
    <!-- 高德地图容器 -->
    <div :id="mapContainerId" class="amap-wrapper"></div>

    <!-- 扫描雷达效果 -->
    <div class="radar-scan">
      <Radar :size="20" :stroke-width="2" color="#00D4FF" class="radar-icon" />
    </div>

    <!-- 点位详情浮层 -->
    <!-- <div v-if="focusedPointId && currentFocusedPoint" class="point-detail-popup-fixed">
      <div
        class="popup-title"
        :style="{ color: getPointColor(currentFocusedPoint.status) }"
      >
        {{ currentFocusedPoint.name }}
      </div>
      <div v-for="(val, key) in currentFocusedPoint.data" :key="key" class="popup-data">
        {{ key }}: {{ val }}
      </div>
    </div> -->
  </div>
</template>

<style scoped>
.map-container {
  flex: 1;
  background: rgba(18, 38, 60, 0.85);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  min-height: 400px;
}

.amap-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.radar-scan {
  position: absolute;
  top: 0;
  left: 0;
  padding: 8px;
  opacity: 0.8;
}

.radar-icon {
  animation: radar-pulse 2s ease-in-out infinite;
}

@keyframes radar-pulse {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(0.95);
  }
}

.point-detail-popup-fixed {
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(11, 17, 32, 0.95);
  border: 1px solid rgba(0, 212, 255, 0.5);
  border-radius: 0;
  padding: 10px 12px;
  min-width: 160px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 212, 255, 0.2);
  z-index: 100;
}

.popup-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 6px;
}

.popup-data {
  font-size: 11px;
  color: var(--text-secondary, #8b9dc3);
  font-family: "IBM Plex Mono", monospace;
  line-height: 1.6;
}
</style>

<!-- 全局样式 - 地图 marker 样式需要在全局定义 -->
<style>
.custom-marker {
  display: flex;
  align-items: center;
  gap: 4px;
}

.marker-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: relative;
  transition: transform 0.2s;
}

.marker-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  opacity: 0.3;
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%,
  100% {
    opacity: 0.3;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.marker-label {
  font-size: 12px;
  color: #fff;
  white-space: nowrap;
  background: rgba(11, 17, 32, 0.8);
  padding: 2px 6px;
  border-radius: 2px;
}

/* SOS 双闪动画 - 模拟警灯双闪效果 */
.marker-dot.sos-blink {
  animation: sos-double-blink 1s ease-in-out infinite;
}

@keyframes sos-double-blink {
  0%, 15% {
    opacity: 1;
    box-shadow: 0 0 10px #FF4560, 0 0 20px #FF4560;
  }
  20%, 25% {
    opacity: 0.2;
    box-shadow: none;
  }
  30%, 45% {
    opacity: 1;
    box-shadow: 0 0 10px #FF4560, 0 0 20px #FF4560;
  }
  50%, 55% {
    opacity: 0.2;
    box-shadow: none;
  }
  60%, 100% {
    opacity: 1;
    box-shadow: 0 0 10px #FF4560, 0 0 20px #FF4560;
  }
}

/* SOS 光晕双闪动画 */
.marker-glow.sos-glow-blink {
  animation: sos-glow-blink 1s ease-in-out infinite !important;
}

@keyframes sos-glow-blink {
  0%, 15% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.5);
    box-shadow: 0 0 20px #FF4560, 0 0 40px #FF4560;
  }
  20%, 25% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
    box-shadow: none;
  }
  30%, 45% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.5);
    box-shadow: 0 0 20px #FF4560, 0 0 40px #FF4560;
  }
  50%, 55% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1);
    box-shadow: none;
  }
  60%, 100% {
    opacity: 0.6;
    transform: translate(-50%, -50%) scale(1.5);
    box-shadow: 0 0 20px #FF4560, 0 0 40px #FF4560;
  }
}
</style>
