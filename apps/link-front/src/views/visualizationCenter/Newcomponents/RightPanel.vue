<script>
import { debounce } from "lodash";
import { getScreenDatas } from "./common";
import getAlarmRecode from "./getAlarmRecode.vue";
import Panel from "./Panel.vue";

export default {
  components: {
    Panel,
    GetAlarmRecode: getAlarmRecode,
  },
  props: {
    screenData: {
      videoAlarmList: [],
    },
    defaultPeriod: {
      type: Object,
      default: {},
    },
    departmentIds: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      videoAlarmList: [],
      departmentAlarmRank: [],
      cameraAlarmRank: [],
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
      customerStatus: ["待加急处理", "待处理", "有效", "误报"],
      selectedTrendPeriod: "1", // 默认选中的趋势按钮
      selectedRankingPeriod: "1", // 默认选中的排名按钮
    };
  },
  computed: {
    departHeight() {
      const baseFontSize = window.innerWidth / 100;
      // 根据数据长度动态计算高度，每项30px，最小高度200px，最大高度400px
      const baseHeight =
        Number(this.departmentAlarmRank.length) * Number(baseFontSize * 0.8) * 4;
      return baseHeight;
    },
    cameraHeight() {
      const baseFontSize = window.innerWidth / 100;
      // 根据数据长度动态计算高度，每项30px，最小高度200px，最大高度400px
      const baseHeight =
        Number(this.cameraAlarmRank.length) * Number(baseFontSize * 0.8) * 4;
      return baseHeight;
    },
    getOrgRankingText() {
      const tendTime = {
        0: "今日",
        1: "本周",
        2: "本月",
      };
      return `${tendTime[this.selectedTrendPeriod]}暂预警信息`;
    },
    getDeviceRankingText() {
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
        const { devicePeriod, orgPeriod } = { ...val };
        this.selectedTrendPeriod = orgPeriod || "1";
        this.selectedRankingPeriod = devicePeriod || "1";
        this.getDepartmentRankingData({
          type: 7,
          timeType: this.selectedTrendPeriod,
        });
        this.getCameraRankingData({
          type: 8,
          timeType: this.selectedRankingPeriod,
        });
      },
      immediate: true,
    },
    departmentIds: {
      handler(val) {
        this.getDepartmentRankingData({
          type: 7,
          timeType: this.selectedTrendPeriod,
        });
        this.getCameraRankingData({
          type: 8,
          timeType: this.selectedRankingPeriod,
        });
      },
      immediate: true,
    },
    "screenData.videoAlarmList": {
      handler(val) {
        this.videoAlarmList = val;
      },
      deep: true,
    },
  },
  created() {},
  methods: {
    async getDepartmentRankingData(form) {
      const data = await getScreenDatas(form, "departmentAlarmRank", this.departmentIds);
      const { digital } = data;
      console.log(data, "组织预警排名TOP10data");
      const date =
        Object.keys(digital).map((key) => ({
          name: key,
          value: digital[key],
        })) || [];
      this.departmentAlarmRank = date;
      this.$nextTick(() => {
        this.initOrgRankingChart(date);
      });
    },
    async getCameraRankingData(form) {
      const data = await getScreenDatas(form, "cameraAlarmRank", this.departmentIds);
      const { digital } = data;
      console.log(data, "设备预警排名TOP10data");
      const date =
        Object.keys(digital).map((key) => ({
          name: key,
          value: digital[key],
        })) || [];
      this.cameraAlarmRank = date;
      this.$nextTick(() => {
        this.initDeviceRankingChart(date);
      });
    },
    // 根据状态返回颜色

    initOrgRankingChart(digital) {
      try {
        const data = digital.slice(0, 10);

        const chartDom = document.getElementById("orgRankingChart");
        if (!chartDom) {
          console.error("未找到图表容器");
          return;
        }

        const existingChart = this.$echarts.getInstanceByDom(chartDom);
        if (existingChart) {
          existingChart.dispose();
        }
        if (!data || Object.keys(data).length === 0) return;
        const chart = this.$echarts.init(chartDom);
        const baseFontSize = window.innerWidth / 100;
        const labelFontSize = Number(baseFontSize * 0.8).toFixed(0);

        // Calculate proper spacing for chart items
        const option = {
          grid: {
            top: "10%",
            left: "2%",
            right: "5%",
            bottom: "1%",
            containLabel: true,
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "none",
            },
            formatter: (params) => {
              return `${params[0].name} : ${params[0].value}`;
            },
            textStyle: {
              fontSize: labelFontSize,
            },
          },
          xAxis: {
            show: false,
            type: "value",
            max: Math.max(...data.map((item) => item.value)) + 1,
          },
          yAxis: [
            {
              type: "category",
              inverse: true,
              axisLabel: {
                show: false,
                color: "#fff",
                margin: 40, // 增加标签间距
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
              data: data.map((item) => item.name),
            },
          ],
          series: [
            {
              name: "背景",
              type: "bar",
              barWidth: labelFontSize,
              barGap: "-100%",
              data: data.map((item) => item.value),
              showBackground: true,
              itemStyle: {
                normal: {
                  barBorderRadius: 30,
                  color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    {
                      offset: 0,
                      color: "rgb(57,89,255,1)",
                    },
                    {
                      offset: 1,
                      color: "rgb(46,200,207,1)",
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
                  formatter: (a) => `${a.name}: ${a.value}`,
                },
              },
            },
          ],
        };

        chart.setOption(option);
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

        window.addEventListener("resize", resizeHandler);

        chart.on("click", (params) => {
          this.$router.push({
            path: "/videoOperation/ForeWarningManagement/clientWarningInfoList",
            query: {
              departmentName: params.name,
              timeType: this.selectedTrendPeriod,
            },
          });
        });

        this.$once("hook:beforeDestroy", () => {
          window.removeEventListener("resize", resizeHandler);
        });
      } catch (error) {
        console.error("初始化组织排名图表失败:", error);
      }
    },
    initDeviceRankingChart(digital) {
      try {
        const chartDom = document.getElementById("deviceRankingChart");
        if (!chartDom) {
          console.error("未找到图表容器");
          return;
        }

        const existingChart = this.$echarts.getInstanceByDom(chartDom);
        if (existingChart) {
          existingChart.dispose();
        }
        const data = digital.slice(0, 10);

        if (!data || Object.keys(data).length === 0) return;

        const chart = this.$echarts.init(chartDom);
        const baseFontSize = window.innerWidth / 100;
        const labelFontSize = Number(baseFontSize * 0.8).toFixed(0);

        const option = {
          grid: {
            top: "5%",
            left: "3%",
            right: "10%",
            bottom: "5%",
            containLabel: true,
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "none",
            },
            formatter: (params) => {
              return `${params[0].name} : ${params[0].value}`;
            },
            textStyle: {
              fontSize: labelFontSize,
            },
          },
          xAxis: {
            show: false,
            type: "value",
            max: Math.max(...data.map((item) => item.value)) + 1,
          },
          yAxis: [
            {
              type: "category",
              inverse: true,
              axisLabel: {
                show: false,
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
              data: data.map((item) => item.name),
            },
          ],
          series: [
            {
              name: "背景",
              type: "bar",
              barWidth: labelFontSize,
              barGap: "-100%",
              data: data.map((item) => item.value),
              showBackground: true,
              itemStyle: {
                normal: {
                  barBorderRadius: 30,
                  color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    {
                      offset: 0,
                      color: "rgb(57,89,255,1)",
                    },
                    {
                      offset: 1,
                      color: "rgb(46,200,207,1)",
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
                  formatter: (a) => `${a.name}: ${a.value}`,
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

        window.addEventListener("resize", resizeHandler);

        chart.on("click", (params) => {
          this.$router.push({
            path: "/videoOperation/ForeWarningManagement/clientWarningInfoList",
            query: {
              cameraName: params.name,
              timeType: this.selectedRankingPeriod,
            },
          });
        });

        // Clean up event listener when component is destroyed
        this.$once("hook:beforeDestroy", () => {
          window.removeEventListener("resize", resizeHandler);
        });
      } catch (error) {
        console.error("初始化设备排名图表失败:", error);
      }
    },
    // 刷新预警记录
    async refreshRecords() {
      // 使用当前选中的排名按钮值刷新数据
      this.$emit("getScreenData", {
        type: 6,
        timeType: 0,
      });
    },
    // 刷新组织预警排名
    async refreshOrgRanking() {
      // 使用当前选中的排名按钮值刷新数据
      this.getDepartmentRankingData({
        type: 7,
        timeType: this.selectedTrendPeriod,
      });
    },
    // 刷新设备预警排名
    async refreshDeviceRanking() {
      // 使用当前选中的排名按钮值刷新数据
      this.getCameraRankingData({
        type: 8,
        timeType: this.selectedRankingPeriod,
      });
    },
    async handleOrgRankingButtonClick(period) {
      this.selectedTrendPeriod = period;
      this.getDepartmentRankingData({
        type: 7,
        timeType: period,
      });
    },
    async handleDeviceRankingButtonClick(period) {
      this.selectedRankingPeriod = period;
      this.getCameraRankingData({
        type: 8,
        timeType: period,
      });
    },
  },
};
</script>

<template>
  <div class="panelBox">
    <!-- <Panel title="预警记录" @refresh="refreshRecords">
      <div class="record-list">
        <div v-for="(record, index) in videoAlarmList" :key="index" class="record-item">
          <div class="type">{{ record.alarmType }}</div>
          <div class="time">{{ record.alarmDate }}</div>
          <div class="status" :style="{ color: getStatusColor(record.customerStatus) }">
            {{ customerStatus[record.customerStatus] || "未知状态" }}
          </div>
        </div>
      </div>
    </Panel> -->
    <getAlarmRecode :departmentIds="departmentIds" />
    <Panel title="组织预警排名TOP10" @refresh="refreshOrgRanking">
      <div class="overflow-hidden relative custom-charts flex_column">
        <div class="time-period-buttons">
          <el-button
            v-for="period in periods"
            :key="period.value"
            type="primary"
            size="mini"
            :class="{ active: selectedTrendPeriod === period.value }"
            @click="handleOrgRankingButtonClick(period.value)"
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
          <div :style="`height: ${departHeight}px;min-height: 100px`">
            <div id="orgRankingChart" />
            <template v-if="!Object.keys(departmentAlarmRank).length">
              <div
                class="flex absolute top-0 right-0 bottom-0 left-0 z-40 justify-center items-center h-full text-sm text-gray-50"
              >
                {{ getOrgRankingText }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </Panel>
    <Panel title="设备预警排名TOP10" @refresh="refreshDeviceRanking">
      <div class="overflow-hidden relative custom-charts flex_column">
        <div class="time-period-buttons">
          <el-button
            v-for="period in periods"
            :key="period.value"
            type="primary"
            sx
            size="mini"
            :class="{ active: selectedRankingPeriod === period.value }"
            @click="handleDeviceRankingButtonClick(period.value)"
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
          <div :style="`height: ${cameraHeight}px;min-height: 100px`">
            <div id="deviceRankingChart" />
            <template v-if="!Object.keys(cameraAlarmRank).length">
              <div
                class="flex absolute top-0 right-0 bottom-0 left-0 z-40 justify-center items-center h-full text-sm text-gray-50"
              >
                {{ getDeviceRankingText }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </Panel>
  </div>
</template>

<style scoped lang="scss">
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

.datetime {
  color: #fff;
  font-size: 14px;
  background: rgba(0, 21, 41, 0.3);
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid rgba(10, 82, 153, 0.3);
}

/* 预警记录样式 */
.record-box {
  background-color: rgba(21, 47, 89);
}

.info {
  display: flex;
  width: 100%;
  /* 确保子元素占满父容器 */
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 21, 41, 0.8);
}

::-webkit-scrollbar-thumb {
  background: #0a5299;
  border-radius: 2px;
}

/* 调整图表尺寸 */
#handlingChart,
#levelChart {
  width: 100% !important;
  height: 100% !important;
  min-height: 180px;
}

/* 图表尺寸调整 */
#trendChart,
#warningTypeChart,
#handlingChart,
#levelChart,
#orgRankingChart,
#deviceRankingChart {
  width: 100% !important;
  height: 100% !important;
}

#deviceRankingChart {
  width: 100% !important;
  height: 100% !important;
}

body,
.panelBox,
.record-item,
.type,
.time,
.status {
  font-size: 1vw;
}

.panelBox {
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 8px;
  height: 100%;
}

#orgRankingChart,
#deviceRankingChart {
  width: 100% !important;
  height: 100% !important;
}
</style>
