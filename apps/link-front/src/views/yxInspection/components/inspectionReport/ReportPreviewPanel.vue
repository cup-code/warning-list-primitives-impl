<script>
import { computed } from "vue";
import { resolveMediaUrl } from "@/utils/media";
import { InspectionReportResultColorMap } from "../../config";
import StatCharts from "./StatCharts.vue";

export default {
  name: "ReportPreviewPanel",
  components: {
    StatCharts,
  },
  props: {
    formData: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    reportData: {
      type: Object,
      default: () => ({}),
    },
    statCards: {
      type: Array,
      default: () => [],
    },
    periodDisplay: {
      type: String,
      default: "",
    },
  },
  setup(props) {
    const scheduleList = computed(() => {
      return props.reportData.executeScheduleList || [];
    });

    const getResultClass = (item) => {
      const key = item.abnormal ? "abnormal" : "normal";
      return InspectionReportResultColorMap[key] || "text-gray-600";
    };

    const getResultText = (item) =>
      item.executeResult || (item.abnormal ? "异常" : "正常");

    const parseImageList = (images) => {
      if (!images) return [];
      return images
        .split(",")
        .filter(Boolean)
        .map((item) => resolveMediaUrl(item.trim()));
    };

    const defaultTitle = computed(() => {
      const map = {
        day: "巡检日报告",
        week: "巡检周报告",
        month: "巡检月报告",
        custom: "巡检周期报告",
      };
      return map[props.formData.timeType] || "巡检周报告";
    });

    /** 排班/执行时间区间展示，与报告预览一致：开始~结束 */
    const formatTimeRange = (start, end) => {
      if (!start && !end) return "-";
      return `${start || "-"}~${end || "-"}`;
    };

    return {
      scheduleList,
      defaultTitle,
      getResultClass,
      getResultText,
      parseImageList,
      formatTimeRange,
    };
  },
};
</script>

<template>
  <div class="flex-1 min-h-0 min-w-0 rounded-lg border border-gray-200 bg-white">
    <div v-loading="loading" class="h-full overflow-y-auto">
      <div
        id="inspection-report-print"
        class="mx-auto max-w-[794px] px-1 py-5 sm:px-2 md:px-4"
      >
        <div class="mb-5 flex items-center justify-between border-b border-gray-200 pb-3">
          <div class="flex items-center gap-2">
            <img src="/blob.png" alt="logo" class="h-7 w-7 object-contain" />
            <span class="text-sm font-medium text-gray-600">两山智联-易巡</span>
          </div>
          <div class="text-center">
            <h2 class="text-xl font-semibold tracking-wide text-gray-900">
              {{ formData.reportTitle || defaultTitle }}
            </h2>
            <p v-if="periodDisplay" class="mt-1 text-xs text-gray-500">
              统计周期：{{ periodDisplay }}
            </p>
          </div>
          <span class="text-xs text-gray-500"></span>
        </div>

        <div class="mb-5">
          <StatCharts
            :stat-cards="statCards"
            :report-data="reportData"
            :show-charts="formData.includeChart"
          />
        </div>

        <div class="mb-6 rounded-md border border-gray-100 bg-gray-50 p-3">
          <div class="mb-1 text-sm font-medium text-gray-700">任务总结</div>
          <div class="text-sm leading-6 text-gray-600 whitespace-pre-line">
            {{
              formData.reportSummary || reportData.remarks || "本周期巡检任务有序完成。"
            }}
          </div>
        </div>

        <div v-if="formData.includeDetail">
          <div
            v-for="(schedule, scheduleIndex) in scheduleList"
            :key="schedule.scheduleRecordId || scheduleIndex"
            class="mb-6"
          >
            <div class="mb-3 flex items-center gap-2 border-b border-gray-200 pb-2">
              <i class="el-icon-s-flag text-sm text-red-500" />
              <span class="text-sm font-medium text-gray-800">
                【{{ schedule.taskName || `班次${scheduleIndex + 1}` }}】
              </span>
            </div>

            <div
              class="report-schedule-meta mb-3 grid grid-cols-1 gap-2 text-xs text-gray-600 md:grid-cols-3 print:grid-cols-3"
            >
              <div>巡检路线：{{ schedule.lineName || "-" }}</div>
              <div>
                排班时间：{{
                  formatTimeRange(schedule.scheduleStartTime, schedule.scheduleEndTime)
                }}
              </div>
              <div>
                执行时间：{{
                  formatTimeRange(schedule.executeStartTime, schedule.executeEndTime)
                }}
              </div>
              <div>所属部门：{{ schedule.departmentName || "-" }}</div>
              <div>巡检岗位：{{ schedule.postName || "-" }}</div>
              <div>巡检人：{{ (schedule.executeUsersName || []).join("、") || "-" }}</div>
            </div>

            <div
              v-for="(place, placeIndex) in schedule.executePlaceInfoList || []"
              :key="`${scheduleIndex}-${place.placeId || placeIndex}`"
              class="mb-4"
            >
              <div class="mb-2 flex items-center gap-2 border-b border-amber-200 pb-2">
                <i class="el-icon-location-outline text-sm text-sky-500" />
                <span class="text-sm font-medium text-gray-700"
                  >【{{ place.placeName || "-" }}】</span
                >
              </div>

              <div
                v-if="place.markInfoList && place.markInfoList.length"
                class="mb-3 rounded-md border border-sky-100 bg-sky-50 px-3 py-2 text-xs"
              >
                <div
                  v-for="(mark, mIndex) in place.markInfoList"
                  :key="mIndex"
                  class="mb-2 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-sky-100/80 pb-2 last:mb-0 last:border-0 last:pb-0"
                >
                  <span class="text-gray-600">
                    打卡人：{{ mark.markUserName || "-" }}
                  </span>
                  <span class="text-gray-600">
                    打卡时间：{{ mark.markTime || "-" }}
                  </span>
                  <div
                    v-if="parseImageList(mark.markPhoto).length"
                    class="flex flex-wrap items-center gap-1.5"
                  >
                    <span class="shrink-0 text-gray-600">现场照片：</span>
                    <div class="flex flex-wrap gap-1">
                      <img
                        v-for="(imgUrl, photoIdx) in parseImageList(mark.markPhoto).slice(
                          0,
                          4
                        )"
                        :key="`${mIndex}-${photoIdx}`"
                        :src="imgUrl"
                        alt="打卡现场"
                        class="h-9 w-9 rounded border border-gray-200 object-cover md:h-10 md:w-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th
                        class="border border-gray-200 bg-gray-50 px-2 py-2 text-center whitespace-nowrap min-w-[3em] w-[3em]"
                      >
                        序号
                      </th>
                      <th
                        class="border border-gray-200 min-w-[7em] bg-gray-50 px-2 py-2 text-left"
                      >
                        内容
                      </th>
                      <th class="border border-gray-200 bg-gray-50 px-2 py-2 text-left">
                        标准
                      </th>
                      <th
                        class="border border-gray-200 w-[5em] bg-gray-50 px-2 py-2 text-center"
                      >
                        巡检人
                      </th>
                      <th
                        class="border border-gray-200 bg-gray-50 px-2 py-2 text-center whitespace-nowrap min-w-[3em] w-[3em]"
                      >
                        结果
                      </th>
                      <th
                        class="border border-gray-200 bg-gray-50 w-[7em] px-2 py-2 text-left max-w-[200px] whitespace-normal break-words"
                      >
                        文字
                      </th>
                      <th
                        class="border border-gray-200 w-[12em] bg-gray-50 px-2 py-2 text-center"
                      >
                        上报时间
                      </th>
                      <th class="border border-gray-200 bg-gray-50 px-2 py-2 text-center">
                        照片
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(content, contentIndex) in place.executeContentInfoList ||
                      []"
                      :key="`${placeIndex}-${contentIndex}`"
                    >
                      <td
                        class="border border-gray-200 px-2 py-2 text-center whitespace-nowrap min-w-[3em] w-[3em]"
                      >
                        {{ contentIndex + 1 }}
                      </td>
                      <td class="border border-gray-200 px-2 py-2">
                        {{ content.contentName || "-" }}
                      </td>
                      <td class="border border-gray-200 px-2 py-2">
                        {{ content.inspectionBenchmark || "-" }}
                      </td>
                      <td class="border border-gray-200 px-2 py-2 text-center">
                        {{ content.executorName || "-" }}
                      </td>
                      <td
                        class="border border-gray-200 px-2 py-2 text-center font-medium whitespace-nowrap min-w-[3em] w-[3em]"
                        :class="getResultClass(content)"
                      >
                        {{ getResultText(content) }}
                      </td>
                      <td
                        class="border border-gray-200 px-2 py-2 max-w-[200px] whitespace-normal break-words"
                      >
                        {{ content.audioText || "-" }}
                      </td>
                      <td class="border border-gray-200 px-2 py-2 text-center">
                        {{ content.reportingTime || "-" }}
                      </td>
                      <td class="border border-gray-200 px-2 py-2 text-center">
                        <div class="flex items-center justify-center gap-1">
                          <img
                            v-for="(imgUrl, imgIndex) in parseImageList(
                              content.photo
                            ).slice(0, 2)"
                            :key="`${contentIndex}-img-${imgIndex}`"
                            :src="imgUrl"
                            alt="巡检图片"
                            class="h-8 w-8 rounded object-cover md:h-10 md:w-10"
                          />
                          <span v-if="!parseImageList(content.photo).length">-</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <el-empty
          v-if="formData.includeDetail && !loading && !scheduleList.length"
          description="当前时间范围暂无巡检报告数据"
          :image-size="90"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@media print {
  .report-schedule-meta {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
    gap: 0.5rem !important;
  }
}
</style>
