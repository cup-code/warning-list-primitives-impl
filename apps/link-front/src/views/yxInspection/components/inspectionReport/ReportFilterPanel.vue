<script>
import { InspectionReportTimeOptions } from "../../config";

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
  },
  emits: ["update-field", "search", "reset"],
  data() {
    return {
      timeOptions: InspectionReportTimeOptions,
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
  },
};
</script>

<template>
  <div
    class="w-full shrink-0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 lg:h-full lg:w-96 xl:w-[28rem]"
  >
    <el-form label-position="left" label-width="72px" size="mini">
      <el-form-item label="报告标题">
        <el-input
          :value="formData.reportTitle"
          placeholder="请输入报告标题"
          @input="updateField('reportTitle', $event)"
        />
      </el-form-item>

      <el-form-item label="总结">
        <el-input
          :value="formData.reportSummary"
          type="textarea"
          :rows="3"
          placeholder="请输入任务总结"
          @input="updateField('reportSummary', $event)"
        />
      </el-form-item>

      <el-form-item label="时间范围">
        <el-radio-group v-model="timeTypeModel">
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
        label="起止时间"
      >
        <el-date-picker
          v-model="dateRangeModel"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
          class="w-full max-w-full"
        />
      </el-form-item>

      <el-form-item label="包含明细">
        <el-radio-group v-model="detailModel">
          <el-radio-button label="yes">是</el-radio-button>
          <el-radio-button label="no">否</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="包含图表">
        <el-radio-group v-model="chartModel">
          <el-radio-button label="yes">是</el-radio-button>
          <el-radio-button label="no">否</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item>
        <div class="flex items-center gap-2 pt-2">
          <el-button :loading="loading" type="primary" @click="handleSearch">
            生成报告
          </el-button>
          <el-button :disabled="loading" @click="handleReset"> 重置 </el-button>
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
