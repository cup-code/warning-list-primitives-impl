<script>
import ReportForm from "./ReportForm.vue";
import ReportPreview from "./ReportPreview.vue";

export default {
  name: "ReportExport",
  components: {
    ReportForm,
    ReportPreview,
  },
  props: {
    host: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      screenData: {},
      formData: {
        reportTitle: "",
        reportSummary: "",
        showTable: false,
        wechat: "",
        phone: "",
      },
      searchForm: {
        ...this.host.reportDate.getWeekRange(1),
      },
      list: [],
      skillList: [],
      actualList: [],
      trendTableData: [],
      alarmTypeRank: [],
      cameraAlarmRank: [],
      alarmLevelRank: [],
      cameraNumber: 0,
      cameraSkillNumber: 0,
      machineNumber: 0,
      reportConfig: {
        headerLogo: "",
        headerText: "",
        advertText: null,
      },
      timeTitle: "",
      defaultReportTitle: "视频智能运营平台管理周报",
    };
  },
  computed: {
    currentWeekNumber() {
      return this.host.reportDate.getCurrentWeekNumber();
    },
    currentYear() {
      return this.host.reportDate.getCurrentYear();
    },
    weekDateStr() {
      return this.host.reportDate.getWeekDateStr(this.searchForm);
    },
    getText() {
      if (this.reportConfig.advertText === null) {
        return this.host.reportData.generateReportText(this.cameraNumber, this.cameraSkillNumber);
      }
      return this.reportConfig.advertText
        .replace("cameraNumber", this.cameraNumber)
        .replace("cameraSkillNumber", this.cameraSkillNumber);
    },
    showAdvert() {
      return this.reportConfig.advertText === null || this.reportConfig.advertText !== "";
    },
  },
  watch: {
    "formData.machineCount": {
      handler(newVal) {
        this.list = this.host.reportData.generateStatsList(
          newVal || this.machineNumber,
          this.cameraNumber,
          this.cameraSkillNumber
        );
      },
    },
  },
  mounted() {
    this.getReportConfig();
    this.getCameraNumber();
    this.getSkillList();
    this.getScreenData();
  },
  methods: {
    async getReportConfig() {
      const companyId = this.host.getCurrentCompanyId();
      const res = await this.host.getSpecifiedModule(companyId, "VideoManagement");
      if (res.data.success) {
        res.data.result.forEach((item) => {
          if (item.item in this.reportConfig) {
            this.reportConfig[item.item] = item.value;
          }
        });
      }
    },
    // 表单字段更新
    updateFormField({ field, value }) {
      this.formData[field] = value;
    },

    async getSkillList() {
      const res = await this.host.getWarningTypeList();
      this.skillList = res.data.result;
    },

    async getCameraNumber() {
      const res = await this.host.machineList({
        pageNum: 1,
        pageSize: 1000,
        isPage: false,
      });
      this.machineNumber = res.data.result.total;
    },

    async getScreenData() {
      console.log(this.searchForm);
      this.timeTitle = this.host.reportDate.getCurrentTitle(this.searchForm.timeType);
      this.defaultReportTitle = this.host.reportDate.getDefaultReportTitle(this.searchForm.timeType);
      const res = await this.host.getScreenData(this.searchForm);
      this.screenData = res.data.result;

      // 使用工具函数处理数据
      this.actualList = this.host.reportData.generateActualList(this.screenData, this.machineNumber);
      this.trendTableData = this.host.reportData.processTrendTableData(
        this.searchForm,
        this.screenData.alarmTrend || {}
      );
      this.alarmTypeRank = this.host.reportData.processAlarmTypeRank(this.screenData.alarmTypeRank);
      this.cameraAlarmRank = this.host.reportData.processCameraAlarmRank(this.screenData.cameraAlarmRank);
      this.alarmLevelRank = this.host.reportData.processAlarmLevelRank(
        this.screenData.alarmLevelLive || {},
        this.screenData.total || 0
      );

      // 更新基础统计
      this.cameraNumber = this.screenData.alarmLive?.cameraNormal || 0;
      this.cameraSkillNumber = this.screenData.alarmLive?.cameraSkillNumber || 0;
      this.list = this.host.reportData.generateStatsList(
        this.formData.machineCount || this.machineNumber,
        this.cameraNumber,
        this.cameraSkillNumber
      );
    },

    onSearch(searchForm) {
      this.searchForm = searchForm;
      this.getScreenData();
    },

    // 重置表单
    resetForm() {
      this.formData = {
        reportTitle: "",
        reportSummary: "",
        showTable: false,
        wechat: "",
        phone: "",
      };
      this.searchForm = {
        ...this.host.reportDate.getWeekRange(1),
      };
      // 重新获取数据
      this.getScreenData();
    },

    async exportPDF() {
      try {
        this.$message({ message: "正在生成PDF，请稍候...", type: "info" });
        const element = this.$refs.reportPreview.$refs.printBox;
        const headerElement = this.$refs.reportPreview.$refs.reportHeader;

        const result = await this.host.exportToPDF(
          element,
          headerElement,
          `预警报告_${new Date().toLocaleDateString()}.pdf`
        );

        if (result.success) {
          this.$message({ message: result.message, type: "success" });
        } else {
          this.$message.error(result.message);
        }
      } catch (error) {
        console.error("PDF导出失败:", error);
        this.$message.error("PDF导出失败，请重试！");
      }
    },
  },
};
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="false">
    <ECard slot="table">
      <ETitle title="预警报告导出" />

      <div class="flex justify-between" style="height: 92%">
        <!-- 表单组件 -->
        <ReportForm
          :host="host"
          :form-data="formData"
          @update-field="updateFormField"
          @reset="resetForm"
          @export-pdf="exportPDF"
          @search="onSearch"
        />

        <!-- 预览组件 -->
        <ReportPreview
          ref="reportPreview"
          :host="host"
          :report-title="formData.reportTitle"
          :default-report-title="defaultReportTitle"
          :report-summary="formData.reportSummary"
          :show-table="formData.showTable"
          :current-year="currentYear"
          :current-week-number="currentWeekNumber"
          :week-date-str="weekDateStr"
          :wechat="formData.wechat"
          :phone="formData.phone"
          :list="list"
          :skill-list="skillList"
          :actual-list="actualList"
          :trend-table-data="trendTableData"
          :alarm-type-rank="alarmTypeRank"
          :camera-alarm-rank="cameraAlarmRank"
          :alarm-level-rank="alarmLevelRank"
          :get-text="getText"
          :show-advert="showAdvert"
          :header-logo="reportConfig.headerLogo"
          :header-text="reportConfig.headerText"
          :chart-data="screenData"
          :time-title="timeTitle"
        />
      </div>
    </ECard>
  </KyTreeTable>
</template>

<style scoped lang="scss">
// 主页面样式保持原有布局
</style>
