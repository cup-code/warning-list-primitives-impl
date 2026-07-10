<script>
import html2canvas from "html2canvas";
import { getCurrentInstance, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { exportWarningTrend } from "@/http/videoWarning/warning-api";
import ChartCard from "../ChartCard.vue";

export default {
  name: "WarningTrendChart",
  components: {
    ChartCard,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    searchForm: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["export-success", "export-error", "refresh", "chart-click"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const chartInstance = ref(null);

    // 导出状态
    const exporting = ref(false);
    const exportingImage = ref(false);
    const refreshing = ref(false);

    const initChart = () => {
      const chartDom = document.getElementById("warningTrendChart");
      if (!chartDom) return;

      chartInstance.value = proxy.$echarts.init(chartDom);
      updateChart();

      // 添加点击事件
      chartInstance.value.on("click", (params) => {
        emit("chart-click", { params, chart: "warningTrend" });
      });
    };

    const updateChart = () => {
      if (!chartInstance.value) return;

      const trendKeys = Object.keys(props.data).sort();

      chartInstance.value.setOption({
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "line",
            lineStyle: {
              color: "#409EFF",
              width: 2,
            },
          },
          formatter(params) {
            const data = params[0];
            return `${data.name}<br/>${data.seriesName}: ${data.value}次`;
          },
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          borderColor: "#409EFF",
          borderWidth: 1,
          textStyle: {
            color: "#fff",
          },
        },
        grid: {
          top: "15%",
          left: "3%",
          right: "5%",
          bottom: "8%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: trendKeys,
          axisLabel: {
            interval: 0,
            rotate: 30,
            fontSize: 11,
          },
          axisLine: {
            lineStyle: {
              color: "#222222",
            },
          },
        },
        yAxis: {
          type: "value",
          minInterval: 1,
          axisLabel: {
            fontSize: 11,
          },
          axisLine: {
            lineStyle: {
              color: "#222",
            },
          },
          splitLine: {
            lineStyle: {
              color: "#eee",
              type: "dashed",
            },
          },
        },
        series: [
          {
            name: "预警数量",
            type: "line",
            data: trendKeys.map((key) => props.data[key] || 0),
            smooth: true,
            lineStyle: {
              width: 3,
              color: "#409EFF",
            },
            itemStyle: {
              color: "#409EFF",
              borderWidth: 2,
              borderColor: "#fff",
            },
            areaStyle: {
              color: {
                type: "linear",
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: "rgba(64, 158, 255, 0.5)",
                  },
                  {
                    offset: 1,
                    color: "rgba(64, 158, 255, 0.1)",
                  },
                ],
              },
            },
            symbol: "circle",
            symbolSize: 6,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: "rgba(64, 158, 255, 0.5)",
              },
            },
            animation: true,
            animationDuration: 1500,
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
          type: 2, // 预警趋势类型
        };

        await exportWarningTrend(params);

        emit("export-success", { type: "excel", chart: "warningTrend" });
        proxy.$message?.success("Excel导出成功");
      } catch (error) {
        console.error("导出Excel失败:", error);
        emit("export-error", { type: "excel", chart: "warningTrend", error });
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

        const chartElement = document.getElementById("warningTrendChart");
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
        link.download = `预警趋势-${new Date().getTime()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();

        emit("export-success", { type: "image", chart: "warningTrend" });
        proxy.$message?.success("图片导出成功");
      } catch (error) {
        console.error("导出图片失败:", error);
        emit("export-error", { type: "image", chart: "warningTrend", error });
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
      () => props.data,
      () => {
        updateChart();
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
    title="预警趋势"
    chartId="warningTrendChart"
    @export-excel="handleExportExcel"
    @export-image="handleExportImage"
  >
    <!-- 图表内容 -->
    <div id="warningTrendChart" class="flex-1 bg-white rounded-b-lg p-4 min-h-[300px]" />
  </ChartCard>
</template>

<style>
/* All styling is handled with Tailwind utility classes */
</style>
