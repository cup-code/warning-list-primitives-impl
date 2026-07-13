<script>
import { InspectionReportTimeOptions } from "../../config";
import { getAiAgentAnswer } from "@/http/inspection/yx-inspection-api";

export default {
  name: "ReportFilterPanel",
  props: {
    formData: {
      type: Object,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    archiveLoading: {
      type: Boolean,
      default: false,
    },
    reportData: {
      type: Object,
      default: () => ({}),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update-field", "search", "archive", "reset"],
  data() {
    return {
      timeOptions: InspectionReportTimeOptions,
      aiLoading: false,
      abortController: null,
    };
  },
  computed: {
    detailModel: {
      get() {
        return this.formData.includeDetail ? "yes" : "no";
      },
      set(val) {
        this.updateField("includeDetail", val === "yes");
      },
    },
    chartModel: {
      get() {
        return this.formData.includeChart ? "yes" : "no";
      },
      set(val) {
        this.updateField("includeChart", val === "yes");
      },
    },
    timeTypeModel: {
      get() {
        return this.formData.timeType;
      },
      set(val) {
        this.updateField("timeType", val);
        if (val !== "custom") {
          this.updateField("dateRange", []);
        }
      },
    },
    dateRangeModel: {
      get() {
        return this.formData.dateRange?.length ? this.formData.dateRange : null;
      },
      set(val) {
        this.updateField("dateRange", Array.isArray(val) && val.length ? val : []);
      },
    },
  },
  methods: {
    updateField(field, value) {
      this.$emit("update-field", { field, value });
    },
    handleSearch() {
      this.$emit("search");
    },
    handleReset() {
      this.$emit("reset");
    },
    formatSummaryText() {
      const scheduleList = this.reportData?.executeScheduleList || [];
      if (!scheduleList.length) return "";
      const lines = [];
      scheduleList.forEach((schedule) => {
        (schedule.executePlaceInfoList || []).forEach((place) => {
          (place.executeContentInfoList || []).forEach((content) => {
            lines.push(
              `巡检点：${place.placeName || ""}`,
              `巡检内容：${content.contentName || ""}`,
              `巡检标准：${content.inspectionBenchmark || ""}`,
              `现场结果：${content.abnormal ? "异常" : "正常"}`
            );
          });
        });
      });
      return lines.join("\n");
    },
    async handleGenerateAiSummary() {
      // 取消上次请求
      if (this.abortController) {
        this.abortController.abort();
      }
      // 检查数据
      const summaryText = this.formatSummaryText();
      if (!summaryText) {
        this.$message.warning("无数据可生成总结");
        return;
      }
      // 创建取消控制器
      this.abortController = new AbortController();
      this.aiLoading = true;
      try {
        const { data } = await getAiAgentAnswer(
          { q: summaryText },
          { signal: this.abortController.signal }
        );
        if (data?.success && data.result?.answer) {
          this.updateField("reportSummary", data.result.answer);
          this.$message.success("AI总结生成成功");
        } else {
          this.$message.error("生成失败，请重试");
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          this.$message.error("生成失败，请重试");
        }
      } finally {
        this.aiLoading = false;
        this.abortController = null;
      }
    },
  },
};
</script>

<template>
  <div
    class="w-full shrink-0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 lg:h-full lg:w-96 xl:w-[28rem]"
  >
    <el-form label-position="left" label-width="72px" size="mini">
      <el-form-item label="报告标题：">
        <el-input
          :value="formData.reportTitle"
          :disabled="disabled"
          placeholder="请输入报告标题"
          @input="updateField('reportTitle', $event)"
        />
      </el-form-item>

      <el-form-item label="时间范围：">
        <el-radio-group v-model="timeTypeModel" :disabled="disabled">
          <el-radio-button
            v-for="item in timeOptions"
            :key="item.value"
            :label="item.value"
          >
            {{ item.label }}
          </el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item
        v-if="formData.timeType === 'custom'"
        class="custom-range-form-item"
        label="起止时间："
      >
        <el-date-picker
          v-model="dateRangeModel"
          :disabled="disabled"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
          class="w-full max-w-full"
        />
      </el-form-item>

      <el-form-item label="包含图表：">
        <el-radio-group v-model="chartModel" :disabled="disabled">
          <el-radio-button label="yes">是</el-radio-button>
          <el-radio-button label="no">否</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="包含明细：">
        <el-radio-group v-model="detailModel" :disabled="disabled">
          <el-radio-button label="yes">是</el-radio-button>
          <el-radio-button label="no">否</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="总结：">
        <div class="flex flex-col gap-2">
          <el-button
            type="primary"
            plain
            size="mini"
            :loading="aiLoading"
            :disabled="disabled"
            @click="handleGenerateAiSummary"
            class="h-[28px] w-[130px]"
          >
            <i v-if="!aiLoading" class="el-icon-magic-stick"></i>
            AI总结
          </el-button>
          <el-input
            :value="formData.reportSummary"
            type="textarea"
            :rows="30"
            :placeholder="aiLoading ? 'AI总结生成中...' : '请输入任务总结'"
            :disabled="aiLoading || disabled"
            @input="updateField('reportSummary', $event)"
          />
        </div>
      </el-form-item>

      <el-form-item>
        <div class="flex items-center gap-2 pt-2">
          <el-button :loading="loading" type="primary" @click="handleSearch">
            生成报告
          </el-button>
          <el-button
            :loading="archiveLoading"
            :disabled="loading || disabled"
            type="success"
            @click="$emit('archive')"
          >
            存档
          </el-button>
          <el-button
            :disabled="loading || archiveLoading || disabled"
            @click="handleReset"
          >
            重置
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
.custom-range-form-item {
  ::v-deep .el-form-item__content {
    min-width: 0;
  }

  ::v-deep .el-date-editor.el-range-editor.el-input__inner {
    width: 100% !important;
    max-width: 100%;
    box-sizing: border-box;
  }

  ::v-deep .el-range-input {
    flex: 1;
    min-width: 0;
  }

  ::v-deep .el-range-separator {
    flex-shrink: 0;
    padding: 0 2px;
  }
}
</style>
