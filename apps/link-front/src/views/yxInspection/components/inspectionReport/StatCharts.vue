<script>
import { computed } from "vue";
import { InspectionReportStatSummaryFirstRowCount } from "../../config";

const COLOR_ON_TIME = "#4A90D9";
const COLOR_OVERTIME = "#FFD93D";
const COLOR_MISSED = "#FF4560";
const COLOR_ABNORMAL = "#FF4560";
const COLOR_NORMAL = "#00E396";

/** 将十六进制颜色按比例变暗 */
function darkenColor(hex, amount) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.round(((num >> 16) & 0xff) * (1 - amount)));
  const g = Math.max(0, Math.round(((num >> 8) & 0xff) * (1 - amount)));
  const b = Math.max(0, Math.round((num & 0xff) * (1 - amount)));
  return `rgb(${r},${g},${b})`;
}

/**
 * 构造假3D饼图 series 数组
 * 在主饼图下方叠加 depth 层深色副本，形成侧面厚度效果
 */
function build3DPieSeries({ data, center, radius, label, labelLine, depth = 12 }) {
  const [cx, cy] = center;
  const series = [];
  for (let i = 0; i < depth; i++) {
    series.push({
      type: "pie",
      radius,
      center: [cx, `${parseFloat(cy) + (depth - i) * 0.55}%`],
      data: data.map((d) => ({
        ...d,
        itemStyle: {
          color: darkenColor(d.itemStyle?.color || "#999", 0.2 + i * 0.02),
        },
      })),
      label: { show: false },
      labelLine: { show: false },
      silent: true,
      z: i,
      animation: false,
    });
  }
  // 顶部主饼图
  series.push({
    type: "pie",
    radius,
    center,
    avoidLabelOverlap: true,
    data,
    label,
    labelLine,
    itemStyle: { borderWidth: 2, borderColor: "#fff" },
    emphasis: {
      itemStyle: {
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowColor: "rgba(0,0,0,0.15)",
      },
    },
    z: depth + 1,
    animation: false,
  });
  return series;
}

export default {
  name: "StatCharts",
  props: {
    statCards: {
      type: Array,
      default: () => [],
    },
    /** 原始报表对象，用于汇总巡检项执行总数等 */
    reportData: {
      type: Object,
      default: () => ({}),
    },
    showCharts: {
      type: Boolean,
      default: true,
    },
  },
  setup(props) {
    const toNumber = (val) => {
      if (val === null || val === undefined || val === "") return 0;
      const num = typeof val === "number" ? val : parseFloat(String(val));
      return Number.isFinite(num) ? num : 0;
    };

    const formatInt = (n) => {
      const v = Math.round(toNumber(n));
      return Number.isFinite(v) ? v.toLocaleString("zh-CN") : "0";
    };

    const normalizedStatCards = computed(() => {
      return (props.statCards || []).map((card) => ({
        ...card,
        numericValue: toNumber(card.value),
      }));
    });

    const findByKey = (key) => normalizedStatCards.value.find((c) => c.key === key);

    /** 巡检项执行总数：优先从班次明细汇总，否则用统计卡「巡检项数量」或异常数兜底 */
    const totalExecuteItems = computed(() => {
      const rd = props.reportData || {};
      let n = 0;
      for (const sch of rd.executeScheduleList || []) {
        for (const place of sch.executePlaceInfoList || []) {
          n += (place.executeContentInfoList || []).length;
        }
      }
      if (n > 0) return n;
      const fromApi = toNumber(
        rd.executeContentCount ??
          rd.executedContentCount ??
          rd.inspectionItemExecuteCount ??
          rd.contentExecuteTotal
      );
      if (fromApi > 0) return fromApi;
      const contentCount = findByKey("contentCount")?.numericValue ?? 0;
      const abnormal = findByKey("abnormalCount")?.numericValue ?? 0;
      if (contentCount > 0) return contentCount;
      return abnormal;
    });

    const planCompletionData = computed(() => {
      const rd = props.reportData || {};
      const execute =
        findByKey("executeScheduleCount")?.numericValue ??
        toNumber(rd.executeScheduleCount);
      const overtime =
        findByKey("overtimeCount")?.numericValue ?? toNumber(rd.overtimeCount);
      const missed = findByKey("missedCount")?.numericValue ?? toNumber(rd.missedCount);
      const onTime = Math.max(0, execute - overtime);
      return {
        onTime,
        overtime,
        missed,
        hasData: true,
      };
    });

    const pieLabelFormatter = (params) => {
      if (params.name === "暂无数据") return "";
      const pct =
        params.percent != null && Number.isFinite(params.percent) ? params.percent : 0;
      return `${pct.toFixed(1)}%`;
    };

    const pieSeriesLabel = {
      show: true,
      formatter: pieLabelFormatter,
      fontSize: 12,
      color: "#374151",
    };

    const planCompletionChartOption = computed(() => {
      const { onTime, overtime, missed } = planCompletionData.value;
      const data = [
        { name: "按时完成", value: onTime, itemStyle: { color: COLOR_ON_TIME } },
        { name: "超时完成", value: overtime, itemStyle: { color: COLOR_OVERTIME } },
        { name: "漏检", value: missed, itemStyle: { color: COLOR_MISSED } },
      ];
      const legendFormatter = (name) => {
        const row = data.find((d) => d.name === name);
        const v = row ? row.value : 0;
        return `${name}（${formatInt(v)}）`;
      };
      return {
        animation: false,
        color: [COLOR_ON_TIME, COLOR_OVERTIME, COLOR_MISSED],
        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
        legend: {
          bottom: 0,
          left: "center",
          icon: "circle",
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 16,
          data: data.map((d) => d.name),
          formatter: legendFormatter,
          textStyle: { fontSize: 11, color: "#3D3D3D" },
        },
        series: build3DPieSeries({
          data,
          center: ["50%", "38%"],
          radius: ["0%", "52%"],
          label: pieSeriesLabel,
          labelLine: { show: true, length: 10, length2: 8 },
        }),
      };
    });

    const abnormalPieData = computed(() => {
      const rd = props.reportData || {};
      const abnormal =
        findByKey("abnormalCount")?.numericValue ?? toNumber(rd.abnormalCount);
      const normal = findByKey("contentCount")?.numericValue ?? toNumber(rd.contentCount);
      const total = abnormal + normal;
      return {
        abnormal,
        normal,
        total,
        hasData: true,
      };
    });

    const statCardRows = computed(() => {
      const list = props.statCards || [];
      const cut = InspectionReportStatSummaryFirstRowCount;
      return [list.slice(0, cut), list.slice(cut)];
    });

    const abnormalPieChartOption = computed(() => {
      const { abnormal, normal } = abnormalPieData.value;
      const data = [
        { name: "异常项数量", value: abnormal, itemStyle: { color: COLOR_ABNORMAL } },
        { name: "正常项数量", value: normal, itemStyle: { color: COLOR_NORMAL } },
      ];
      const legendFormatter = (name) => {
        const row = data.find((d) => d.name === name);
        const v = row ? row.value : 0;
        return `${name}（${formatInt(v)}）`;
      };
      return {
        animation: false,
        color: [COLOR_ABNORMAL, COLOR_NORMAL],
        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
        legend: {
          bottom: 0,
          left: "center",
          icon: "circle",
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 16,
          data: data.map((d) => d.name),
          formatter: legendFormatter,
          textStyle: { fontSize: 11, color: "#3D3D3D" },
        },
        series: build3DPieSeries({
          data,
          center: ["50%", "38%"],
          radius: ["0%", "52%"],
          label: pieSeriesLabel,
          labelLine: { show: true, length: 10, length2: 8 },
        }),
      };
    });

    return {
      formatInt,
      statCardRows,
      planCompletionData,
      abnormalPieData,
      totalExecuteItems,
      planCompletionChartOption,
      abnormalPieChartOption,
    };
  },
};
</script>

<template>
  <div>
    <div class="report-stat-summary flex flex-col gap-3">
      <div
        class="report-stat-cards-row1 grid grid-cols-2 gap-3 md:grid-cols-4 print:grid-cols-4"
      >
        <div
          v-for="item in statCardRows[0]"
          :key="item.key"
          class="min-w-0 rounded-md border border-amber-100 bg-amber-50 px-3 py-2"
        >
          <div class="text-xs text-gray-500">
            {{ item.label }}
          </div>
          <div class="mt-1 text-base font-semibold text-amber-500 sm:text-lg">
            {{ item.value }}{{ item.unit }}
          </div>
        </div>
      </div>
      <div
        class="report-stat-cards-row2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 print:grid-cols-5"
      >
        <div
          v-for="item in statCardRows[1]"
          :key="item.key"
          class="min-w-0 rounded-md border border-amber-100 bg-amber-50 px-3 py-2"
        >
          <div class="text-xs text-gray-500">
            {{ item.label }}
          </div>
          <div class="mt-1 text-base font-semibold text-amber-500 sm:text-lg">
            {{ item.value }}{{ item.unit }}
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showCharts"
      class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 print:grid-cols-2"
    >
      <div v-if="planCompletionData.hasData" class="pie-chart-card">
        <div class="pie-chart-header">
          <span class="pie-chart-title">计划完成分布</span>
          <span class="pie-chart-subtitle">按时完成 · 超时完成 · 漏检</span>
        </div>
        <div class="chart-container pie-chart-area">
          <v-chart :options="planCompletionChartOption" autoresize />
        </div>
      </div>

      <div v-if="abnormalPieData.hasData" class="pie-chart-card">
        <div class="pie-chart-header">
          <span class="pie-chart-title">异常项占比</span>
          <span class="pie-chart-subtitle">
            基于巡检项执行总数 {{ formatInt(abnormalPieData.total) }}
          </span>
        </div>
        <div class="chart-container pie-chart-area">
          <v-chart :options="abnormalPieChartOption" autoresize />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.pie-chart-card {
  @apply w-full min-w-0 rounded-2xl border border-gray-100 bg-white px-8 pb-5 pt-8;
}
.pie-chart-header {
  @apply mb-2 flex justify-between items-center gap-1;
}
.pie-chart-title {
  @apply text-lg font-bold text-gray-800;
  font-size: 18px;
}
.pie-chart-subtitle {
  @apply text-xs text-gray-400;
  font-size: 13px;
}
.pie-chart-meta {
  @apply max-w-[65%] text-right text-xs leading-5 text-gray-500 sm:text-[13px];
}
.pie-chart-foot {
  @apply mt-2 rounded-lg bg-gray-100 px-3 py-2 text-center text-xs leading-relaxed text-gray-600;
}
.chart-container {
  width: 100%;
  height: 280px;
  min-height: 260px;
}

.pie-chart-area {
  padding-bottom: 0.2rem;
}

:deep(.echarts) {
  width: 100% !important;
  max-width: 100% !important;
  height: 100% !important;
  max-height: 100% !important;
  overflow: visible;
  box-sizing: border-box;
  display: block;
}

:deep(.v-chart) {
  width: 100% !important;
  height: 100% !important;
}

@media print {
  .chart-container {
    height: 260px !important;
    min-height: 240px !important;
  }
  .report-stat-summary {
    gap: 0.75rem !important;
  }
  .report-stat-cards-row1 {
    display: grid !important;
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    gap: 0.75rem !important;
  }
  .report-stat-cards-row2 {
    display: grid !important;
    grid-template-columns: repeat(5, minmax(0, 1fr)) !important;
    gap: 0.75rem !important;
  }
}
</style>
