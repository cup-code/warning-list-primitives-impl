<script>
import { createReportChartMixin } from "./reportChartMixin.js";
import ReportTable from "./ReportTable.vue";
import SkillTable from "@link/shared-ui/forewarning-management/skill-table";
import StatGrid from "./StatGrid.vue";

export default {
  name: "ReportPreview",
  components: {
    SkillTable,
    StatGrid,
    ReportTable,
  },
  mixins: [createReportChartMixin()],
  props: {
    host: {
      type: Object,
      required: true,
    },
    reportTitle: {
      type: String,
      default: "",
    },
    defaultReportTitle: {
      type: String,
      default: "视频智能运营平台管理周报",
    },
    reportSummary: {
      type: String,
      default: "",
    },
    showTable: {
      type: Boolean,
      default: false,
    },
    currentYear: {
      type: Number,
      required: true,
    },
    currentWeekNumber: {
      type: Number,
      required: true,
    },
    weekDateStr: {
      type: String,
      required: true,
    },
    list: {
      type: Array,
      required: true,
    },
    skillList: {
      type: Array,
      required: true,
    },
    actualList: {
      type: Array,
      required: true,
    },
    trendTableData: {
      type: Array,
      required: true,
    },
    alarmTypeRank: {
      type: Array,
      required: true,
    },
    cameraAlarmRank: {
      type: Array,
      required: true,
    },
    alarmLevelRank: {
      type: Array,
      required: true,
    },
    getText: {
      type: String,
      default: "",
    },
    showAdvert: {
      type: Boolean,
      default: true,
    },
    headerLogo: {
      type: String,
      default: "",
    },
    headerText: {
      type: String,
      default: "",
    },
    chartData: {
      type: Object,
      required: true,
    },
    wechat: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    timeTitle: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      filePrefix: "",
      showAlarmTypeAxisLabels: this.host.showAlarmTypeAxisLabels,
    };
  },
  computed: {
    trendColumns() {
      return [
        { key: "date", title: "日期", width: "33%" },
        { key: "week", title: "星期", width: "33%" },
        { key: "count", title: "预警数量（个）", width: "33%" },
      ];
    },
    typeRankColumns() {
      return [
        { key: "rank", title: "名次", width: "33%" },
        { key: "type", title: "预警类型", width: "33%" },
        { key: "count", title: "预警数量（个）", width: "33%" },
      ];
    },
    deviceRankColumns() {
      return [
        { key: "rank", title: "名次", width: "33%" },
        { key: "deviceName", title: "设备名称", width: "33%" },
        { key: "count", title: "预警数量（个）", width: "33%" },
      ];
    },
    levelRankColumns() {
      return [
        { key: "rank", title: "名次", width: "20%" },
        { key: "level", title: "预警等级", width: "20%" },
        { key: "count", title: "预警数量（个）", width: "30%" },
        { key: "percent", title: "预警等级占比", width: "30%" },
      ];
    },
  },
  watch: {
    chartData: {
      handler(newVal) {
        this.$nextTick(() => {
          this.initAlarmTrend(newVal.alarmTrend);
          this.initAlarmTypeRank(newVal.alarmTypeRank);
          this.initCameraAlarmRank(newVal.cameraAlarmRank);
          this.initAlarmLevelRank(newVal.alarmLevelLive, newVal.total);
        });
      },
      deep: true,
      immediate: true,
    },
  },
  created() {
    this.filePrefix = this.host.getFilePrefix();
  },
};
</script>

<template>
  <div
    class="box-border overflow-hidden flex-col justify-center mx-6 rounded-md border border-gray-200"
    style="width: 812px"
  >
    <div
      style="
        height: calc(100% - 1px);
        overflow-y: auto;
        scrollbar-width: thin;
        padding: 0 20px;
      "
    >
      <div v-if="headerLogo || headerText" ref="reportHeader" class="report-header">
        <div class="header-text">
          {{ headerLogo || " " }}
        </div>
        <div>
          <div class="header-text">
            {{ headerText || " " }}
          </div>
        </div>
      </div>
      <div id="printBox" ref="printBox" class="pdf-export-content">
        <!-- 报告标题 -->
        <div class="flex flex-col items-center mb-4">
          <h1
            class="mb-1 text-2xl font-bold tracking-widest text-gray-800"
            style="
              letter-spacing: 0.15em;
              color: #1d376a;
              font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
            "
          >
            {{ reportTitle || defaultReportTitle }}
          </h1>
          <div
            class="mb-2 text-base text-black"
            style="font-family: 'Microsoft YaHei', '微软雅黑', Arial, sans-serif"
          >
            {{ weekDateStr }}
          </div>
        </div>

        <!-- 报告主体内容 -->
        <div class="p-2 px-4 mb-4 mx-4 bg-white rounded-lg border border-gray-200">
          <div class="text-lg font-semibold">{{ timeTitle }}小结：</div>
          <div class="text-base leading-relaxed pb-1" style="text-indent: 2em">
            {{ reportSummary || " " }}
          </div>
        </div>

        <!-- 表格部分 -->
        <div class="mb-8 mx-4">
          <h3 class="mb-4 text-xl font-semibold">一、预警报警统计情况</h3>
          <div class="table-container box-border">
            <ul class="flex justify-between items-center">
              <li v-for="item in list" :key="item.name" class="text-base">
                <span class="mr-2 text-base font-semibold">•</span>
                {{ item.name }}
              </li>
            </ul>
            <SkillTable :skill-list="skillList" />
          </div>
        </div>

        <div class="mb-8 mx-4">
          <h3 class="mb-4 text-xl font-semibold">二、{{ timeTitle }}预警智能运营报告</h3>
          <StatGrid
            :actual-list="actualList"
            :time-title="timeTitle"
            :use-fixed-week-title="host.useFixedWeekTitle"
          />

          <!-- 预警趋势 -->
          <div class="table-container">
            <div class="mb-4 py-2 box-border text-lg font-semibold">
              {{ timeTitle }}预警趋势
            </div>
            <div
              class="py-2 flex flex-col items-center justify-center w-full bg-white rounded-md"
            >
              <div
                class="p-2 rounded-md border w-full h-full border-gray-200 flex justify-center items-center box-border"
                style="width: 620px; height: 300px"
              >
                <div id="trend" class="w-full h-full" />
              </div>

              <ReportTable
                :show-table="showTable"
                :title="`视频智能运营平台管理-${timeTitle}预警趋势`"
                :subtitle="weekDateStr"
                width="620px"
                :columns="trendColumns"
                :table-data="trendTableData"
              />
            </div>
          </div>

          <!-- 预警类型排名 -->
          <div class="table-container">
            <div class="mb-4 py-2 box-border text-lg font-semibold">
              {{ timeTitle }}预警类型排名TOP10
            </div>

            <div
              class="py-2 flex flex-col items-center justify-center w-full bg-white rounded-md"
            >
              <div
                class="p-2 rounded-md border w-full h-full border-gray-200 flex justify-center items-center box-border"
                style="width: 620px; height: 300px"
              >
                <div id="TypeChart" class="w-full h-full" />
              </div>

              <ReportTable
                :show-table="showTable"
                :title="`视频智能运营平台管理-${timeTitle}预警类型排名TOP10`"
                :subtitle="weekDateStr"
                width="620px"
                :columns="typeRankColumns"
                :table-data="alarmTypeRank"
              />
            </div>
          </div>

          <!-- 设备预警排名 -->
          <div class="table-container">
            <div class="mb-4 py-2 box-border text-lg font-semibold">
              {{ timeTitle }}设备预警排名TOP10
            </div>
            <div
              class="py-2 flex flex-col items-center justify-center w-full bg-white rounded-md"
            >
              <div
                class="p-2 rounded-md border w-full h-full border-gray-200 flex justify-center items-center box-border"
                style="width: 620px; height: 300px"
              >
                <div id="cameraAlarmRankChart" class="w-full h-full" />
              </div>

              <ReportTable
                :show-table="showTable"
                :title="`视频智能运营平台管理-${timeTitle}设备预警排名TOP10`"
                :subtitle="weekDateStr"
                width="620px"
                :columns="deviceRankColumns"
                :table-data="cameraAlarmRank"
                header-bg-color="#2176c7"
              />
            </div>
          </div>

          <!-- 预警等级占比 -->
          <div class="table-container">
            <div class="mb-4 py-2 box-border text-lg font-semibold">
              {{ timeTitle }}预警等级占比
            </div>
            <div
              class="py-2 flex flex-col items-center justify-center w-full bg-white rounded-md"
            >
              <div
                class="p-2 rounded-md border w-full h-full border-gray-200 flex justify-center items-center box-border"
                style="width: 620px; height: 300px"
              >
                <div id="TypeRankChart" class="w-full h-full" />
              </div>

              <ReportTable
                :show-table="showTable"
                :title="`视频智能运营平台管理-${timeTitle}预警等级占比`"
                width="620px"
                :subtitle="weekDateStr"
                :columns="levelRankColumns"
                :table-data="alarmLevelRank"
              />
            </div>
          </div>

          <div v-if="showAdvert" class="table-container">
            <div
              class="py-2 text-lg font-semibold"
              style="text-indent: 2em; color: #1d376a"
            >
              {{ getText }}
            </div>
          </div>

          <div class="flex flex-col justify-end items-end mt-4 w-full">
            <div v-if="wechat" class="flex items-end">
              <span class="ml-2">企业微信：</span>
              <img :src="filePrefix + wechat" alt="Logo" class="w-10 h-10" />
            </div>
            <div v-if="phone" class="flex items-end">
              <span class="ml-2">联系电话：</span>
              <span class="ml-2">{{ phone }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
// 全局字体统一为微软雅黑
.pdf-export-content,
.report-container {
  font-family: "Microsoft YaHei", "微软雅黑", Arial, sans-serif !important;
}

// 保证所有子元素继承微软雅黑字体
.pdf-export-content *,
.report-container * {
  font-family: inherit !important;
}

.pdf-export-content {
  background: #fff;
  font-size: 14px;
  box-sizing: border-box;
}

.report-container {
  background-color: #fff;
  font-family: "SimSun", serif;
  width: 100%;
  min-height: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 0 20px 0;
  padding: 10px 0;
}

.header-text {
  font-size: 16px;
  font-weight: bold;
  color: #1d376a;
}

.logo {
  height: 30px;
  width: 130px;
  object-fit: contain;
}

.right-logo {
  height: 30px;
  width: 130px;
  object-fit: contain;
}

.header-link {
  margin-left: 15px;
  font-size: 14px;
  color: #333;
}

.report-title {
  text-align: center;
  margin: 20px 0;
  color: #1d376a;
}

.report-title h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.report-title h2 {
  font-size: 20px;
  margin-bottom: 10px;
}

.report-date {
  font-size: 14px;
  color: #666;
}

.report-content {
  margin-top: 20px;
}

.summary-box {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
}

.table-container {
  margin: 20px 0 50px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
}

.report-table th,
.report-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.report-table th {
  background-color: #f2f2f2;
}

.stats-table {
  margin-top: 15px;
}

.stats-cell {
  width: 25%;
  padding: 15px !important;
  vertical-align: middle;
}

.stats-value {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stats-label {
  font-size: 14px;
  color: #666;
}
</style>
