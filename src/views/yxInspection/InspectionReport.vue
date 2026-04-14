<script>
import { computed, getCurrentInstance, onMounted, reactive, ref } from "vue";
import { queryDateRangeReport } from "@/http/inspection/yx-inspection-api";
import ReportFilterPanel from "./components/inspectionReport/ReportFilterPanel.vue";
import ReportPreviewPanel from "./components/inspectionReport/ReportPreviewPanel.vue";
import { InspectionReportDefaultForm, InspectionReportStatConfig } from "./config";

const pad2 = (num) => String(num).padStart(2, "0");

const formatDateTime = (date) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hour = pad2(date.getHours());
  const minute = pad2(date.getMinutes());
  const second = pad2(date.getSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
};

const getDayRange = (baseDate = new Date()) => {
  const start = new Date(baseDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(baseDate);
  end.setHours(23, 59, 59, 999);
  return [formatDateTime(start), formatDateTime(end)];
};

const getWeekRange = () => {
  const now = new Date();
  const weekDay = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - weekDay + 1);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return [formatDateTime(monday), formatDateTime(sunday)];
};

const getMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  return [formatDateTime(start), formatDateTime(end)];
};

const formatDisplayValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return 0;
  }
  if (typeof value === "string" && value.endsWith("%")) {
    return value.replace("%", "");
  }
  return value;
};

export default {
  name: "InspectionReport",
  components: {
    ReportFilterPanel,
    ReportPreviewPanel,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const loading = ref(false);
    const reportData = ref({});
    const formData = reactive({
      ...InspectionReportDefaultForm,
    });

    const buildRange = () => {
      if (formData.timeType === "custom" && formData.dateRange.length === 2) {
        return [formData.dateRange[0], formData.dateRange[1]];
      }
      if (formData.timeType === "day") return getDayRange();
      if (formData.timeType === "month") return getMonthRange();
      return getWeekRange();
    };

    const printTriggerRef = ref(null);
    const printConfig = {
      id: "inspection-report-print",
      popTitle: "两山巡检报告",
    };

    const fetchReportData = async () => {
      if (formData.timeType === "custom" && formData.dateRange.length !== 2) {
        proxy.$message.warning("请选择完整的自定义时间范围");
        return false;
      }
      loading.value = true;
      try {
        const [startDate, endDate] = buildRange();
        const { data } = await queryDateRangeReport({ startDate, endDate });
        if (data?.success) {
          reportData.value = data.result || {};
          return true;
        }
        proxy.$message.error(data?.message || "获取巡检报告失败");
        return false;
      } catch (error) {
        console.error("获取巡检报告失败", error);
        proxy.$message.error("获取巡检报告失败");
        return false;
      } finally {
        loading.value = false;
      }
    };

    /** 生成报告并打开系统打印（与详情中报告打印一致，使用 vue-print-nb） */
    const handleGenerateReport = async () => {
      const ok = await fetchReportData();
      if (!ok) return;
      await proxy.$nextTick();
      const el = printTriggerRef.value;
      if (el) el.click();
    };

    const statCards = computed(() => {
      return InspectionReportStatConfig.map((item) => ({
        ...item,
        value: formatDisplayValue(reportData.value[item.key]),
      }));
    });

    const reportPeriodDisplay = computed(() => {
      if (formData.timeType === "custom") {
        if (formData.dateRange?.length === 2) {
          return `${formData.dateRange[0]} 至 ${formData.dateRange[1]}`;
        }
        return "请选择起止时间";
      }
      const [start, end] = buildRange();
      return `${start} 至 ${end}`;
    });

    const handleUpdateField = ({ field, value }) => {
      formData[field] = value;
      if (field === "timeType") {
        if (value !== "custom") {
          fetchReportData();
        } else if (formData.dateRange?.length === 2) {
          fetchReportData();
        }
      } else if (
        field === "dateRange" &&
        formData.timeType === "custom" &&
        Array.isArray(value) &&
        value.length === 2
      ) {
        fetchReportData();
      }
    };

    const handleReset = () => {
      Object.assign(formData, InspectionReportDefaultForm);
      fetchReportData();
    };

    onMounted(() => {
      fetchReportData();
    });

    return {
      formData,
      loading,
      reportData,
      statCards,
      reportPeriodDisplay,
      printTriggerRef,
      printConfig,
      fetchReportData,
      handleGenerateReport,
      handleUpdateField,
      handleReset,
    };
  },
};
</script>

<template>
  <div class="relative h-full">
    <button
      ref="printTriggerRef"
      type="button"
      v-print="printConfig"
      class="fixed left-0 top-0 -z-10 h-px w-px overflow-hidden opacity-0"
      tabindex="-1"
      aria-hidden="true"
    />
    <KyTreeTable ref="treeTable" :isShowLeft="false" class="h-full">
      <ECard slot="table" class="h-full">
        <ETitle title="巡检报告" />
        <div class="mt-3 flex h-[calc(100%-40px)] min-h-0 flex-col gap-3 lg:flex-row">
          <ReportFilterPanel
            :form-data="formData"
            :loading="loading"
            @update-field="handleUpdateField"
            @search="handleGenerateReport"
            @reset="handleReset"
          />
          <ReportPreviewPanel
            :form-data="formData"
            :loading="loading"
            :period-display="reportPeriodDisplay"
            :report-data="reportData"
            :stat-cards="statCards"
          />
        </div>
      </ECard>
    </KyTreeTable>
  </div>
</template>
