<script>
import { debounce } from "lodash";
import { getScreenDatas } from "./common";
import Panel from "./Panel.vue";

export default {
  components: {
    Panel,
  },
  props: {
    screenData: {
      alarmLive: null,
      alarmStatusLive: null,
      alarmLevelLive: null,
      videoAlarmList: null,
      departmentAlarmRank: null,
      cameraAlarmRank: null,
    },
    departmentIds: {
      type: Array,
      default: [],
    },
    defaultPeriod: {
      type: Object,
      default: {},
    },
  },
  data() {
    return {
      alarmLive: {
        cameraNormal: 0,
        cameraUnusual: 0,
        cameraSkillNumber: 0,
      },
      alarmTrend: {},
      alarmTypeRank: {},
      statusList: [
        {
          icon: require("@/assets/produce/zhengcahng.png"),
          count: 0,
          label: "正常运行",
          type: "cameraNormal",
        },
        {
          icon: require("@/assets/produce/guanlian.png"),
          count: 0,
          label: "关联技能数",
          type: "cameraSkillNumber",
        },
        {
          icon: require("@/assets/produce/yunxing.png"),
          count: 0,
          label: "运行技能数",
          type: "cameraSkillNumber",
        },
      ],
      periods: [
        {
          value: "0",
          label: "日",
        },
        {
          value: "1",
          label: "周",
        },
        {
          value: "2",
          label: "月",
        },
      ],
      selectedTrendPeriod: "1", // 默认选中的趋势按钮
      selectedRankingPeriod: "1", // 默认选中的排名按钮
    };
  },
  computed: {
    warningTypeChartHeight() {
      const baseFontSize = window.innerWidth / 100;
      const baseHeight =
        Number(this.alarmTypeRank.length) * Number(baseFontSize * 0.8) * 4;

      return baseHeight;
    },
    getTrendText() {
      const tendTime = {
        0: "今日",
        1: "本周",
        2: "本月",
      };
      return `${tendTime[this.selectedTrendPeriod]}暂预警信息`;
    },
    getRankingText() {
      const tendTime = {
        0: "今日",
        1: "本周",
        2: "本月",
      };
      return `${tendTime[this.selectedRankingPeriod]}暂预警信息`;
    },
  },
  watch: {
    defaultPeriod: {
      handler(val) {
        const { trendPeriod, typePeriod } = { ...val };
        this.selectedTrendPeriod = trendPeriod || "1";
        this.selectedRankingPeriod = typePeriod || "1";
        this.getTrendData({
          type: 2,
          timeType: this.selectedTrendPeriod,
        });
        this.getRankingData({
          type: 3,
          timeType: this.selectedRankingPeriod,
        });
      },
      immediate: true,
    },
    departmentIds: {
      handler(val) {
        this.getTrendData({
          type: 2,
          timeType: this.selectedTrendPeriod,
        });
        this.getRankingData({
          type: 3,
          timeType: this.selectedRankingPeriod,
        });
      },
      immediate: true,
    },
    "screenData.alarmLive": {
      handler(val) {
        this.alarmLive = val;
        this.initAlarmLive(val);
      },
      deep: true,
    },
  },
  created() {
    this.getPrefix();
  },
  mounted() {
    // Add resize handler for responsive elements
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    // Remove event listener when component is destroyed
    window.removeEventListener("resize", this.handleResize);
  },

  methods: {
    async getTrendData(form) {
      const data = await getScreenDatas(form, "alarmTrend", this.departmentIds);
      const { digital } = data;
      this.alarmTrend = digital;
      this.$nextTick(() => {
        this.initAlarmTrend(digital);
      });
    },
    async getRankingData(form) {
      const data = await getScreenDatas(form, "alarmTypeRank", this.departmentIds);
      const { digital } = data;
      this.alarmTypeRank = digital;
      this.$nextTick(() => {
        this.initAlarmTypeRank(digital);
      });
    },

    initAlarmLive(val) {
      this.statusList.forEach((item, index) => {
        item.count = val[item.type];
      });
    },
    initAlarmTrend(digital) {
      try {
        // 图表切换时，始终先销毁旧图表，避免残留
        const chartDom = document.getElementById("trendChart");
        if (chartDom) {
          const existingChart = this.$echarts.getInstanceByDom(chartDom);
          if (existingChart) {
            existingChart.dispose();
          }
        }

        // 没有数据时，直接返回，不再初始化新图表
        if (!digital || Object.keys(digital).length === 0) {
          return;
        }

        if (!chartDom) return;

        const chart = this.$echarts.init(chartDom);

        const sortedKeys = Object.keys(digital).sort();

        // Add responsive font size calculation
        const baseFontSize = Math.min(window.innerWidth / 100, 16);
        const fontSize = Math.max(baseFontSize, 9);
        const labelFontSize = Math.max(baseFontSize * 0.8, 8);

        const option = {
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow",
            },
            textStyle: {
              fontSize,
            },
          },
          grid: {
            top: "15%",
            left: "3%",
            right: "5%",
            bottom: "3%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            data: sortedKeys,
            axisLine: {
              lineStyle: {
                color: "#8c8c8c",
              },
            },
            axisLabel: {
              color: "#fff",
              fontSize: labelFontSize,
              interval: "auto",
              rotate: sortedKeys.length > 6 ? 30 : 0,
            },
          },
          yAxis: {
            type: "value",
            axisLine: {
              lineStyle: {
                color: "#8c8c8c",
              },
            },
            splitLine: {
              lineStyle: {
                color: "rgba(140, 140, 140, 0.2)",
              },
            },
            minInterval: 1,
            axisLabel: {
              color: "#fff",
              fontSize: labelFontSize,
              formatter(value) {
                if (value >= 1000) {
                  return `${Math.floor(value / 1000)}k`;
                }
                return Math.floor(value);
              },
            },
          },
          series: [
            {
              data: sortedKeys.map((key) => digital[key]),
              type: "line",
              smooth: true,
              symbol: "circle",
              symbolSize: Math.max(fontSize * 0.5, 5),
              lineStyle: {
                color: "#00f0ff",
                width: Math.max(fontSize * 0.15, 1.5),
              },
              itemStyle: {
                color: "#00f0ff",
                borderWidth: Math.max(fontSize * 0.15, 1.5),
              },
              areaStyle: {
                color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: "rgba(0, 240, 255, 0.3)",
                  },
                  {
                    offset: 1,
                    color: "rgba(0, 240, 255, 0)",
                  },
                ]),
              },
            },
          ],
        };

        chart.setOption(option);

        // Improve resize handling
        const resizeHandler = debounce(() => {
          chart.resize();
          // Update font sizes on resize
          const baseFontSize = Math.min(window.innerWidth / 100, 16);
          const fontSize = Math.max(baseFontSize, 9);
          const labelFontSize = Math.max(baseFontSize * 0.8, 8);

          option.tooltip.textStyle.fontSize = fontSize;
          option.xAxis.axisLabel.fontSize = labelFontSize;
          option.yAxis.axisLabel.fontSize = labelFontSize;
          option.series[0].symbolSize = Math.max(fontSize * 0.5, 5);
          option.series[0].lineStyle.width = Math.max(fontSize * 0.15, 1.5);
          option.series[0].itemStyle.borderWidth = Math.max(fontSize * 0.15, 1.5);

          chart.setOption(option);
        }, 200);

        window.addEventListener("resize", resizeHandler);

        // Clean up event listener when component is destroyed
        this.$once("hook:beforeDestroy", () => {
          window.removeEventListener("resize", resizeHandler);
        });
      } catch (error) {
        console.error("初始化趋势图表失败:", error);
      }
    },

    initAlarmTypeRank(digital) {
      const chartDom = document.getElementById("warningTypeChart");
      const existingChart = this.$echarts.getInstanceByDom(chartDom);
      if (existingChart) existingChart.dispose();

      if (!digital || Object.keys(digital).length === 0) return;
      const data = digital.slice(0, 10);

      const chart = this.$echarts.init(chartDom);

      // Add responsive font size calculation
      const baseFontSize = window.innerWidth / 100;
      const labelFontSize = Number(baseFontSize * 0.8).toFixed(0);

      const option = {
        grid: {
          top: "10%",
          left: "5%",
          right: "10%",
          bottom: "5%",
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "none",
          },
          formatter: (params) => `${params[0].name} : ${params[0].value}`,
          textStyle: {
            fontSize: labelFontSize,
          },
        },
        xAxis: {
          show: false,
          type: "value",
          max: Math.max(...data.map((item) => item.alarmNumber)) + 1,
        },
        yAxis: [
          {
            type: "category",
            inverse: true,
            axisLabel: {
              show: false,
              color: "#fff",
            },
            splitLine: {
              show: false,
            },
            axisTick: {
              show: false,
            },
            axisLine: {
              show: false,
            },
            data: data.map((item) => item.alarmType),
          },
        ],
        series: [
          {
            name: "背景",
            type: "bar",
            barWidth: labelFontSize,
            barGap: "-100%",
            data: data.map((item) => item.alarmNumber),
            showBackground: true,
            itemStyle: {
              normal: {
                barBorderRadius: 30,
                color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  {
                    offset: 0,
                    color: "rgba(57,89,255,1)",
                  },
                  {
                    offset: 1,
                    color: "rgba(46,200,207,1)",
                  },
                ]),
              },
            },
            backgroundStyle: {
              color: "rgba(225, 225, 225, 0.5)",
              barBorderRadius: 30,
            },
            label: {
              normal: {
                color: "#fff",
                show: true,
                position: [0, -baseFontSize],
                fontSize: labelFontSize,
                formatter: (a) => {
                  // Truncate and format long names for better display
                  let name = a.name;
                  const maxLength = Math.max(
                    Math.min(Math.floor(window.innerWidth / 70), 15),
                    8
                  );

                  if (name.length > maxLength) {
                    name = `${name.substring(0, maxLength)}...`;
                  }

                  // Format number for better display
                  let value = a.value;
                  if (value >= 1000) {
                    value = `${(value / 1000).toFixed(1)}k`;
                  }

                  return `${name}: ${value}`;
                },
              },
            },
          },
        ],
      };
      chart.setOption(option);

      // Improve resize handling
      const resizeHandler = debounce(() => {
        chart.resize();
        // Update font sizes and spacings on resize
        const baseFontSize = Math.min(window.innerWidth / 100, 16);
        const fontSize = Math.max(baseFontSize, 9);
        const labelFontSize = Math.max(baseFontSize * 0.8, 8);
        const itemCount = data.length;
        const itemHeight = Math.min(28, Math.floor(300 / (itemCount || 1)));

        // Update relevant options
        option.tooltip.textStyle.fontSize = fontSize;
        option.series[0].barWidth = Math.max(Math.min(itemHeight * 0.2, 10), 4);
        option.series[0].label.normal.fontSize = labelFontSize;

        chart.setOption(option);
      }, 200);

      chart.on("click", (params) => {
        this.$router.push({
          path: "/videoOperation/ForeWarningManagement/clientWarningInfoList",
          query: {
            alarmType: params.name,
            timeType: this.selectedRankingPeriod,
          },
        });
      });

      window.addEventListener("resize", resizeHandler);

      // Clean up event listener when component is destroyed
      this.$once("hook:beforeDestroy", () => {
        window.removeEventListener("resize", resizeHandler);
      });
    },
    handleTrendButtonClick(period) {
      this.selectedTrendPeriod = period; // 更新选中的趋势按钮
      this.getTrendData({
        type: 2,
        timeType: period,
      });
    },
    handleTypesButtonClick(period) {
      this.selectedRankingPeriod = period; // 更新选中的预警类型排名
      this.getRankingData({
        type: 3,
        timeType: period,
      });
    },
    RefreshLive() {
      this.$emit("getScreenData", {
        type: 1,
      });
    },
    RefreshtRend() {
      // 使用当前选中的趋势按钮值刷新数据
      this.getTrendData({
        type: 2,
        timeType: this.selectedTrendPeriod,
      });
    },
    RefreshtRanking() {
      // 使用当前选中的排名按钮值刷新数据
      this.getRankingData({
        type: 3,
        timeType: this.selectedRankingPeriod,
      });
    },
    handleResize() {
      // Recalculate chart heights and responsiveness
      this.$nextTick(() => {
        if (this.alarmTrend) {
          this.initAlarmTrend(this.alarmTrend);
        }
        if (this.alarmTypeRank.length > 0) {
          this.initAlarmTypeRank(this.alarmTypeRank);
        }
      });
    },
  },
};
</script>

<template>
  <div class="panelBox">
    <Panel title="预警实况" @refresh="RefreshLive">
      <div class="overflow-hidden relative flex_column">
        <div
          class="overflow-y-scroll status-grid"
          style="height: 90%; scrollbar-width: none; -ms-overflow-style: none"
        >
          <div v-for="(item, index) in statusList" :key="index" class="status-item">
            <el-image :src="`${item.icon}`" alt="正常运行" class="icon" fit="cover" />
            <div class="status-info">
              <span class="count">{{ item.count || 0 }}</span>
              <span class="label">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>
    </Panel>
    <Panel title="预警趋势" @refresh="RefreshtRend">
      <div class="flex_column">
        <div class="time-period-buttons">
          <el-button
            v-for="period in periods"
            :key="period.value"
            type="primary"
            :class="{ active: selectedTrendPeriod === period.value }"
            size="mini"
            @click="handleTrendButtonClick(period.value)"
          >
            {{ period.label }}
          </el-button>
        </div>
        <div class="relative chart-wrapper">
          <div id="trendChart" style="height: 100%; width: 100%" />
          <div
            v-if="Object.keys(alarmTrend).length === 0"
            class="flex absolute top-0 right-0 bottom-0 left-0 z-40 justify-center items-center h-full text-sm text-gray-50"
          >
            {{ getTrendText }}
          </div>
        </div>
      </div>
    </Panel>
    <Panel title="预警类型排名TOP10" @refresh="RefreshtRanking">
      <div class="overflow-hidden custom-charts flex_column">
        <div class="time-period-buttons">
          <el-button
            v-for="period in periods"
            :key="period.value"
            type="primary"
            :class="{ active: selectedRankingPeriod === period.value }"
            size="mini"
            @click="handleTypesButtonClick(period.value)"
          >
            {{ period.label }}
          </el-button>
        </div>
        <div
          class="overflow-y-scroll relative chart-wrapper"
          style="
            height: 18vh;
            margin-top: 8px;
            scrollbar-width: none;
            -ms-overflow-style: none;
          "
        >
          <div :style="`height: ${warningTypeChartHeight}px;min-height: 100px`">
            <div id="warningTypeChart" />
            <template v-if="!Object.keys(alarmTypeRank).length">
              <div
                class="flex absolute top-0 right-0 bottom-0 left-0 z-40 justify-center items-center h-full text-sm text-gray-50"
              >
                {{ getRankingText }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </Panel>
  </div>
</template>

<style lang="scss" scoped>
.panelBox {
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 8px;
  height: 100%;
  font-size: 1.1rem;

  .status-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 8px;
    height: 75%;
    position: relative;

    // 响应式三角形布局，等高
    @media (max-width: 600px) {
      grid-template-rows: 1fr 1fr;
      grid-template-columns: 1fr 1fr;
    }

    .status-item {
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 21, 41, 0.85);
      border-radius: 6px;
      border: 1px solid rgba(0, 240, 255, 0.18);
      transition: border-color 0.3s, box-shadow 0.3s;
      position: relative;
      padding: 0;
      height: 100%;
      min-height: 0;
      min-width: 0;

      &:hover {
        border: 0.18vw solid #00f0ff;
        box-shadow: 0 0.4vw 2vw rgba(0, 240, 255, 0.12);
      }

      .icon {
        width: 30%;
        display: block;
        margin-bottom: 0.5em;
      }

      .status-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        .count {
          font-size: 1em;
          font-weight: bold;
          color: #00ffe4;
          margin-bottom: 0.3em;
          text-shadow: 0 0 1em rgba(0, 240, 255, 0.3);
          letter-spacing: 0.05em;
        }
        .label {
          font-size: 1em;
          color: #8c8c8c;
          white-space: nowrap;
          letter-spacing: 0.03em;
        }
      }
    }

    // 三角形布局
    .status-item:nth-child(1) {
      grid-column: 1 / span 2;
      grid-row: 1;
      align-self: stretch;
      justify-self: center;
      height: 100%;
      z-index: 2;
    }
    .status-item:nth-child(2) {
      grid-column: 1;
      grid-row: 2;
      align-self: stretch;
      justify-self: end;
      height: 100%;
      z-index: 1;
    }
    .status-item:nth-child(3) {
      grid-column: 2;
      grid-row: 2;
      align-self: stretch;
      justify-self: start;
      height: 100%;
      z-index: 1;
    }
  }

  .flex_column {
    display: flex;
    flex-direction: column !important;
    height: 80%;

    .chart-wrapper {
      height: 77%;
      width: 100%;
      margin-top: 8px;
    }

    /* 日期切换组件样式 */
    .time-period-buttons {
      /* margin-top: 10px; */
      display: flex;
      justify-content: flex-end;

      .active {
        background: #00f0ff;
        color: #000;
        border-color: #00f0ff;
        box-shadow: 0 0 10px rgba(0, 240, 255, 0.5);

        &:hover {
          border-color: #00f0ff;
          color: #fff;
        }
      }
    }

    .time-period-buttons .el-button {
      padding: 0.3vw 0.8vw;
      font-size: 0.9vw;
    }
  }

  #warningTypeChart {
    width: 100% !important;
    height: 100% !important;
    min-height: 7vw;
  }

  body,
  .panelBox,
  .status-item,
  .count,
  .label {
    font-size: 1vw;
  }

  // .panelBox > .panel {
  //   height: 100%;
  //   display: flex;
  //   flex-direction: column;
  // }
}
</style>
