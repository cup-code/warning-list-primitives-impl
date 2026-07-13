<script setup name="TaskStatusPanel">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from "vue";
import * as echarts from "echarts";

const props = defineProps({
  completed: {
    type: Number,
    default: 0,
  },
  ongoing: {
    type: Number,
    default: 0,
  },
  toStart: {
    type: Number,
    default: 0,
  },
});

// 颜色定义
const COLORS = {
  completed: "#00E396",
  ongoing: "#00D4FF",
  toStart: "#FFD93D",
  empty: "#4A5F85",
};

// 图表 DOM 引用
const chartRef = ref(null);
let chartInstance = null;

// 计算总数
const total = computed(() => props.completed + props.ongoing + props.toStart);

// 是否有数据
const hasData = computed(() => total.value > 0);

// 获取 ECharts 配置
function getChartOption() {
  if (!hasData.value) {
    // 无数据时显示灰色饼图
    return {
      animation: false,
      series: [
        {
          type: "pie",
          radius: ["0%", "76%"],
          center: ["50%", "50%"],
          silent: true,
          label: { show: false },
          data: [{ value: 1, itemStyle: { color: COLORS.empty } }],
        },
      ],
      graphic: [
        {
          type: "text",
          left: "center",
          top: "center",
          style: {
            text: "0",
            fontSize: 20,
            fontWeight: 700,
            fill: "#ffffff",
            textAlign: "center",
            textVerticalAlign: "middle",
          },
        },
        {
          type: "text",
          left: "center",
          top: "center",
          style: {
            text: "进行中",
            fontSize: 10,
            fill: "#4a5f85",
            textAlign: "center",
            textVerticalAlign: "bottom",
            y: 18,
          },
        },
      ],
    };
  }

  // 有数据时显示正常饼图
  const data = [];
  if (props.completed > 0) {
    data.push({
      name: "已完成",
      value: props.completed,
      itemStyle: { color: COLORS.completed },
    });
  }
  if (props.ongoing > 0) {
    data.push({
      name: "进行中",
      value: props.ongoing,
      itemStyle: { color: COLORS.ongoing },
    });
  }
  if (props.toStart > 0) {
    data.push({
      name: "待开始",
      value: props.toStart,
      itemStyle: { color: COLORS.toStart },
    });
  }

  return {
    animation: false,
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c} ({d}%)",
    },
    series: [
      {
        type: "pie",
        radius: "50%",
        center: ["50%", "50%"],
        avoidLabelOverlap: true,
        label: {
          show: true,
          position: "outer",
          formatter: "{b}: {c}",
          fontSize: 12,
          color: "#8b9dc3",
        },
        labelLine: {
          show: true,
          length: 8,
          length2: 12,
          lineStyle: {
            color: "#4a5f85",
            width: 1,
          },
        },
        emphasis: {
          scale: false,
        },
        data,
      },
    ],
  };
}

// 初始化图表
function initChart() {
  if (!chartRef.value) return;
  if (chartInstance) {
    chartInstance.dispose();
  }
  chartInstance = echarts.init(chartRef.value);
  chartInstance.setOption(getChartOption());
}

// 更新图表
function updateChart() {
  if (!chartInstance) return;
  chartInstance.setOption(getChartOption());
}

// 监听数据变化
watch(
  () => [props.completed, props.ongoing, props.toStart],
  () => {
    nextTick(updateChart);
  }
);

// 处理窗口 resize
function handleResize() {
  if (!chartInstance) return;
  chartInstance.resize();
}

onMounted(() => {
  initChart();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <section class="panel task-status-panel">
    <div class="panel-header">
      <span class="panel-title">任务状态</span>
    </div>

    <div class="pie-chart-container">
      <div ref="chartRef" class="pie-chart"></div>
    </div>

    <div class="chart-legend">
      <div class="legend-item">
        <span class="legend-dot green"></span>
        <span>已完成 {{ completed }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot cyan"></span>
        <span>进行中 {{ ongoing }}</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot yellow"></span>
        <span>待开始 {{ toStart }}</span>
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

.task-status-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.task-status-panel .panel-header {
  flex-shrink: 0;
}

.pie-chart-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
  position: relative;
}

.pie-chart {
  width: 100%;
  height: 180px;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary, #8b9dc3);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.cyan {
  background: var(--accent-cyan, #00d4ff);
}

.legend-dot.green {
  background: var(--accent-green, #00e396);
}

.legend-dot.yellow {
  background: var(--accent-yellow, #ffd93d);
}
</style>
