<script>
import html2canvas from "html2canvas";
import { getCurrentInstance, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { exportWarningLevel } from "@/http/videoWarning/warning-api";
import ChartCard from "../ChartCard.vue";

export default {
  name: "WarningLevelChart",
  components: {
    ChartCard,
  },
  props: {
    data: {
      type: Array,
      required: true,
    },
    total: {
      type: Number,
      default: 0,
    },
    searchForm: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["export-success", "export-error", "refresh", "chart-click"],
  setup(props, { emit }) {
    // 获取当前组件实例及其proxy
    const internalInstance = getCurrentInstance();
    const proxy = internalInstance ? internalInstance.proxy : null;
    const chartInstance = ref(null);

    // 导出状态
    const exporting = ref(false);
    const exportingImage = ref(false);
    const refreshing = ref(false);

    const initChart = () => {
      const chartDom = document.getElementById("warningLevelChart");
      if (!chartDom || !proxy || !proxy.$echarts) return;

      // 使用全局注册的$echarts
      chartInstance.value = proxy.$echarts.init(chartDom) || null;
      updateChart(props.data, props.total);

      // 添加点击事件
      chartInstance.value.on("click", (params) => {
        emit("chart-click", { params, chart: "warningLevel" });
      });
    };

    const updateChart = (chartData = [], total = 0) => {
      if (!chartInstance.value) return;

      chartInstance.value.setOption({
        tooltip: {
          trigger: "item",
          formatter(params) {
            const percentage =
              total === 0 ? "0.00%" : `${((params.value / total) * 100).toFixed(2)}%`;
            return `${params.name}<br/>数量: ${params.value}次<br/>占比: ${percentage}`;
          },
        },
        legend: {
          orient: "vertical",
          right: "1%",
          top: "center",
          textStyle: {
            fontSize: 13,
            align: "right",
          },
          itemGap: 18,
          padding: [5, 10],
          borderRadius: 4,
          itemWidth: 15,
          itemHeight: 15,
          icon: "circle",
          formatter(name) {
            const { value: items } = chartData?.find((item) => item.name === name) || {
              value: 0,
            };
            const percentage =
              items === 0 ? "0.00%" : `${((items / total) * 100).toFixed(2)}%`;
            return `${name}  ${percentage}  ${items}次`;
          },
        },
        series: [
          {
            name: "预警等级",
            type: "pie",
            radius: ["40%", "70%"],
            center: ["24%", "50%"],
            avoidLabelOverlap: false,
            label: {
              show: false,
            },
            labelLine: {
              show: false,
            },
            data: chartData,
            emphasis: {
              scale: true,
              scaleSize: 5,
              itemStyle: {
                shadowBlur: 10,
                shadowColor: "rgba(0, 0, 0, 0.3)",
              },
            },
            animation: true,
            animationDuration: 1000,
            animationEasing: "elasticOut",
          },
        ],
      });
    };

    // 导出Excel
    const handleExportExcel = async () => {
      if (exporting.value) return;

      exporting.value = true;
      try {
        proxy.$openLoading({
          lock: true,
          text: "正在导出Excel，请稍候...",
          background: "rgba(0, 0, 0, 0.1)",
        });

        const params = {
          ...props.searchForm,
          type: 5, // 预警等级占比类型
        };

        await exportWarningLevel(params);

        emit("export-success", { type: "excel", chart: "warningLevel" });
        proxy.$message?.success("Excel导出成功");
      } catch (error) {
        console.error("导出Excel失败:", error);
        emit("export-error", { type: "excel", chart: "warningLevel", error });
        proxy.$message?.error("导出Excel失败，请稍后重试");
      } finally {
        exporting.value = false;
        proxy.$closeLoading();
      }
    };

    // 导出图片
    const handleExportImage = async () => {
      if (exportingImage.value) return;

      exportingImage.value = true;
      try {
        proxy.$openLoading({
          lock: true,
          text: "正在生成图片，请稍候...",
          background: "rgba(0, 0, 0, 0.1)",
        });

        const chartElement = document.getElementById("warningLevelChart");
        if (!chartElement) {
          throw new Error("未找到图表元素");
        }

        const canvas = await html2canvas(chartElement, {
          backgroundColor: "#ffffff",
          useCORS: true,
          scale: 2,
          willReadFrequently: true,
        });

        // 创建下载链接
        const link = document.createElement("a");
        link.download = `预警等级占比-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        emit("export-success", { type: "image", chart: "warningLevel" });
        proxy.$message?.success("图片导出成功");
      } catch (error) {
        console.error("导出图片失败:", error);
        emit("export-error", { type: "image", chart: "warningLevel", error });
        proxy.$message?.error("导出图片失败，请稍后重试");
      } finally {
        exportingImage.value = false;
        proxy.$closeLoading();
      }
    };

    const resizeChart = () => {
      if (chartInstance.value) {
        chartInstance.value.resize();
      }
    };

    // 监听数据变化
    watch(
      [() => props.data, () => props.total],
      () => {
        updateChart(props.data, props.total);
      },
      { deep: true }
    );

    onMounted(() => {
      initChart();
      window.addEventListener("resize", resizeChart);
    });

    onBeforeUnmount(() => {
      window.removeEventListener("resize", resizeChart);
      if (chartInstance.value) {
        chartInstance.value.dispose();
        chartInstance.value = null;
      }
    });

    return {
      chartInstance,
      exporting,
      exportingImage,
      refreshing,
      handleExportExcel,
      handleExportImage,
    };
  },
};
</script>

<template>
  <ChartCard
    title="预警等级占比"
    chartId="warningLevelChart"
    @export-excel="handleExportExcel"
    @export-image="handleExportImage"
  >
    <!-- 图表内容 -->
    <div id="warningLevelChart" class="chart" />
  </ChartCard>
</template>

<style scoped lang="scss">
.warning-level-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .chart-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: #fff;
    border-radius: 6px 6px 0 0;

    .chart-title {
      font-size: 16px;
      font-weight: 600;
    }

    .chart-actions {
      display: flex;
      gap: 8px;

      .el-button {
        padding: 6px 12px;
        border-radius: 4px;
        transition: all 0.3s ease;
        font-size: 12px;

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }

  .chart {
    flex: 1;
    background: #fff;
    border-radius: 0 0 6px 6px;
    padding: 16px;
    min-height: 300px;
  }

  // 响应式设计
  @media (max-width: 768px) {
    .chart-toolbar {
      flex-direction: column;
      gap: 12px;
      align-items: stretch;

      .chart-actions {
        justify-content: center;
        flex-wrap: wrap;
      }
    }
  }
}

// 加载动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
