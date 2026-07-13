<script>
import { ref, reactive, watch, computed, getCurrentInstance } from "vue";
import { useMutation } from "@tanstack/vue-query";
import { auditSafeRecord } from "@/http/inspection/yx-inspection-api";

export default {
  name: "SafetyHandleDialog",
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

    // 表单数据：类型（安全/误操作）、处理意见
    const form = reactive({
      handleResult: "安全",
      handleOpinion: "",
    });

    // 弹窗标题
    const dialogTitle = computed(() => {
      return props.info.dialogType === "handle" ? "审核巡检安全记录" : "安全记录详情";
    });

    // 是否只读（详情查看）
    const isReadonly = computed(() => props.info.dialogType === "view");

    // 表单校验规则
    const rules = {
      handleResult: [{ required: true, message: "请选择类型", trigger: "change" }],
    };

    // 审核API调用
    const { mutate: auditMutate } = useMutation({
      mutationFn: (data) => auditSafeRecord(data),
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

    // 监听 visible 变化
    watch(
      () => props.visible,
      (val) => {
        dialogVisible.value = val;
        if (val) {
          initForm();
        }
      },
      { immediate: true }
    );

    // 初始化表单
    const initForm = () => {
      if (props.info.dialogType === "handle") {
        form.handleResult = "安全";
        form.handleOpinion =
          props.info.handleOpinion && props.info.handleOpinion !== "-"
            ? props.info.handleOpinion
            : "";
      } else {
        form.handleResult = props.info.result || "安全";
        form.handleOpinion = props.info.handleOpinion || "";
      }
    };

    // 关闭弹窗
    const handleClose = () => {
      emit("update:visible", false);
      emit("close");
    };

    // 确认保存
    const handleConfirm = () => {
      if (props.info.dialogType === "view") {
        handleClose();
        return;
      }

      formRef.value?.validate((valid) => {
        if (valid) {
          loading.value = true;
          // 调用审核API
          auditMutate({
            id: props.info.id,
            auditResult: form.handleResult === "安全" ? "0" : "1",
            auditOpinion: form.handleOpinion,
          });
        }
      });
    };

    return {
      dialogVisible,
      formRef,
      form,
      loading,
      dialogTitle,
      isReadonly,
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
    <!-- 只读信息：巡检计划、巡检岗位、人员、时间 -->
    <el-form label-width="90px" size="small" class="readonly-form">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="巡检计划">
            <el-input :value="info.planName" disabled class="readonly-input" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="巡检岗位">
            <el-input :value="info.post" disabled class="readonly-input" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="人员">
            <el-input :value="info.person" disabled class="readonly-input" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="时间">
            <el-input :value="info.recordTime" disabled class="readonly-input" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <!-- 可编辑：类型、处理意见 -->
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="90px"
      size="small"
      class="edit-form"
      :disabled="isReadonly"
    >
      <el-form-item label="类型" prop="handleResult" required>
        <el-radio-group v-model="form.handleResult">
          <el-radio label="安全">安全</el-radio>
          <el-radio label="误操作">误操作</el-radio>
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
    </el-form>

    <!-- 提示：审核后无法修改 -->
    <el-alert
      v-if="!isReadonly"
      type="warning"
      :closable="false"
      show-icon
      title="提示：审核后，将无法进行修改，请确认后再保存"
      class="audit-tip"
    />

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
.readonly-form {
  margin-bottom: 16px;
}

.readonly-input {
  ::v-deep .el-input__inner {
    background-color: #f5f5f5;
    color: #606266;
  }
}

.edit-form {
  margin-bottom: 16px;
}

.audit-tip {
  margin-bottom: 8px;
  background-color: #fdf6ec;
  border: 1px solid #f5d8a8;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
