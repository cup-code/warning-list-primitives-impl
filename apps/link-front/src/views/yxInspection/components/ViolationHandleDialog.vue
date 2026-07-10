<script>
import { ref, reactive, watch, computed, getCurrentInstance } from "vue";
import { useMutation, useQuery } from "@tanstack/vue-query";
import { auditViolation, getViolationById } from "@/http/inspection/yx-inspection-api";

export default {
  name: "ViolationHandleDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    info: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const dialogVisible = ref(false);
    const formRef = ref(null);
    const loading = ref(false);

    // 详情数据
    const detailData = ref({});

    // 表单数据
    const form = reactive({
      handleResult: "",
      handleOpinion: "",
      handleTime: "",
      handler: "",
    });

    // 违规类型映射
    const violationTypeText = computed(() => {
      const type = detailData.value.violationType;
      if (type === "NOT_DONE") return "漏检";
      if (type === "NOT_ON_TIME") return "超时";
      return type || "-";
    });

    // 时间范围格式化函数
    const formatTimeRange = (startTime, endTime) => {
      if (!startTime && !endTime) return "-";
      const format = (time) => {
        if (!time) return "-";
        const str = String(time).trim().replace(/-/g, "/");
        const match = str.match(/^(\d{4}\/\d{1,2}\/\d{1,2})\s*(\d{1,2}:\d{2})/);
        return match ? `${match[1]} ${match[2]}` : time;
      };
      return `${format(startTime)} - ${format(endTime)}`;
    };

    // 排班时间范围
    const scheduleTimeRange = computed(() => {
      return formatTimeRange(
        detailData.value.scheduleStartTime,
        detailData.value.scheduleEndTime
      );
    });

    // 执行时间范围
    const executeTimeRange = computed(() => {
      return formatTimeRange(
        detailData.value.executeStartTime,
        detailData.value.executeEndTime
      );
    });

    // 弹窗标题
    const dialogTitle = computed(() => {
      return props.info.dialogType === "handle" ? "审核巡检违规审核" : "违规记录详情";
    });

    // 是否只读
    const isReadonly = computed(() => props.info.dialogType === "view");

    // 表单校验规则
    const rules = {
      handleResult: [{ required: true, message: "请选择审核结果", trigger: "change" }],
    };

    // 审核API调用
    const { mutate: auditMutate } = useMutation({
      mutationFn: (data) => auditViolation(data),
      onSuccess: ({ data }) => {
        loading.value = false;
        if (data?.success) {
          proxy.$message.success("审核成功");
          emit("submit");
          handleClose();
        } else {
          proxy.$message.error(data?.message || "审核失败");
        }
      },
      onError: (error) => {
        loading.value = false;
        proxy.$message.error(error?.message || "审核失败");
      },
    });

    // 控制是否查询详情
    const shouldFetchDetail = ref(false);

    // 查询违规详情
    const { refetch: fetchDetail, isFetching: detailLoading } = useQuery({
      queryKey: ["violationDetail", () => props.info.violationId || props.info.id],
      queryFn: () => getViolationById(props.info.violationId || props.info.id),
      enabled: shouldFetchDetail,
      onSuccess: ({ data }) => {
        if (data?.success) {
          detailData.value = data.result || {};
          initForm();
        }
      },
    });

    // 监听visible变化
    watch(
      () => props.visible,
      (val) => {
        dialogVisible.value = val;
        if (val && (props.info.violationId || props.info.id)) {
          shouldFetchDetail.value = true;
          fetchDetail();
        }
      },
      { immediate: true }
    );

    // 初始化表单
    const initForm = () => {
      // 审核结果映射：1-待审核，2-误报，3-确认违规
      const mapAuditResult = (auditResult) => {
        if (auditResult === "3") return "确认";
        if (auditResult === "2") return "误报";
        return "";
      };

      if (props.info.dialogType === "handle") {
        Object.assign(form, {
          handleResult: "",
          handleOpinion: "",
        });
      } else {
        Object.assign(form, {
          handleResult: mapAuditResult(detailData.value.auditResult) || "",
          handleOpinion: detailData.value.handlingOpinions || "",
        });
      }
    };

    // 关闭弹窗
    const handleClose = () => {
      emit("update:visible", false);
      emit("close");
    };

    // 确认提交
    const handleConfirm = () => {
      if (props.info.dialogType === "view") {
        handleClose();
        return;
      }

      formRef.value?.validate((valid) => {
        if (valid) {
          loading.value = true;
          // 调用审核API：auditResult: 2-误报, 3-确认违规
          auditMutate({
            violationId: detailData.value.violationId,
            auditResult: form.handleResult === "确认" ? "3" : "2",
            handlingOpinions: form.handleOpinion,
          });
        }
      });
    };

    return {
      dialogVisible,
      formRef,
      form,
      loading,
      detailData,
      detailLoading,
      dialogTitle,
      isReadonly,
      violationTypeText,
      scheduleTimeRange,
      executeTimeRange,
      rules,
      handleClose,
      handleConfirm,
    };
  },
};
</script>

<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="detailLoading" class="info-block">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="info-item">
            <span class="info-label">巡检计划：</span>
            <span class="info-value">{{ detailData.planName || "-" }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <span class="info-label">巡检岗位：</span>
            <span class="info-value">{{ detailData.postName || "-" }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="info-item">
            <span class="info-label">人员：</span>
            <span class="info-value">{{ detailData.violationUserName || "-" }}</span>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="info-item">
            <span class="info-label">违规类型：</span>
            <span class="info-value">{{ violationTypeText }}</span>
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <div class="info-item">
            <span class="info-label">违规时间：</span>
            <span class="info-value">{{ detailData.violationTime || "-" }}</span>
          </div>
        </el-col>
      </el-row>
      <!-- <el-row :gutter="20">
        <el-col :span="24">
          <div class="info-item">
            <span class="info-label">违规原因</span>
            <span class="info-value">{{ detailData.violationReasons || "-" }}</span>
          </div>
        </el-col>
      </el-row> -->
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="info-item">
            <span class="info-label">排班时间：</span>
            <span class="info-value">{{ scheduleTimeRange }}</span>
          </div>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="24">
          <div class="info-item">
            <span class="info-label">执行时间：</span>
            <span class="info-value">{{ executeTimeRange }}</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      size="small"
      class="mt-4 violation-handle-form"
      :disabled="isReadonly"
    >
      <el-form-item label="审核结果" prop="handleResult" required>
        <el-radio-group v-model="form.handleResult">
          <el-radio label="确认">确认</el-radio>
          <el-radio label="误报">误报</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="处理意见">
        <el-input
          v-model="form.handleOpinion"
          type="textarea"
          :rows="3"
          placeholder="请输入处理意见"
        />
      </el-form-item>

      <el-alert
        v-if="!isReadonly"
        title="提示：审核后，将无法进行修改，请确认后再保存"
        type="warning"
        :closable="false"
        show-icon
        class="mb-4"
      />
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose" size="small">取 消</el-button>
      <el-button
        v-if="!isReadonly"
        type="primary"
        :loading="loading"
        @click="handleConfirm"
        size="small"
      >
        确认保存
      </el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.info-block {
  padding: 16px 20px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.info-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 32px;

  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  flex-shrink: 0;
  width: 70px;
  color: #606266;
  font-weight: bold;
}

.info-value {
  color: #303133;
}

.mt-4 {
  margin-top: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

/* 标签与表单项内容顶部对齐（避免多行输入时标签垂直居中） */
.violation-handle-form {
  ::v-deep .el-form-item {
    align-items: flex-start;
  }
}
</style>
