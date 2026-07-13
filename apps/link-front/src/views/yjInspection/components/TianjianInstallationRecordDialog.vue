<script>
import { computed, getCurrentInstance, reactive, ref, watch } from "vue";
import { saveOrUpdateTianjianRecord } from "@/http/inspection/yj-inspection-api";

export default {
  name: "TianjianInstallationRecordDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    dialogType: {
      type: String,
      default: "add",
    },
    info: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["update:visible", "close", "submit"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const dialogVisible = ref(false);
    const formRef = ref(null);
    const loading = ref(false);

    const form = reactive({
      id: "",
      pointCode: "",
      deviceCode: "",
      installationTime: "",
    });

    const dialogTitle = computed(() => {
      const titles = {
        add: "新增安装记录",
        edit: "修改安装记录",
        view: "查看安装记录",
      };
      return titles[props.dialogType] || "安装记录";
    });

    const isReadonly = computed(() => props.dialogType === "view");

    const rules = {
      pointCode: [{ required: true, message: "请输入点位编码", trigger: "blur" }],
      deviceCode: [{ required: true, message: "请输入设备编码", trigger: "blur" }],
      installationTime: [
        { required: true, message: "请选择安装时间", trigger: "change" },
      ],
    };

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

    function initForm() {
      const defaults = {
        id: "",
        pointCode: "",
        deviceCode: "",
        installationTime: "",
      };
      if (props.dialogType === "add") {
        Object.assign(form, defaults);
      } else {
        Object.keys(defaults).forEach((key) => {
          form[key] = props.info[key] ?? defaults[key];
        });
      }
    }

    function handleClose() {
      emit("update:visible", false);
      emit("close");
    }

    async function handleConfirm() {
      if (isReadonly.value) {
        handleClose();
        return;
      }

      formRef.value?.validate(async (valid) => {
        if (!valid) return;

        loading.value = true;
        try {
          const payload = { ...form };
          if (!payload.id) delete payload.id;

          const res = await saveOrUpdateTianjianRecord(payload);

          if (res.data?.success) {
            proxy.$message.success(form.id ? "修改成功" : "新增成功");
            emit("submit", payload);
            handleClose();
          } else {
            proxy.$message.error(res.data?.message || "保存失败");
          }
        } catch (error) {
          proxy.$message.error("保存失败");
        } finally {
          loading.value = false;
        }
      });
    }

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
    width="520px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      :disabled="isReadonly"
      label-width="100px"
      size="small"
    >
      <el-form-item label="点位编码" prop="pointCode">
        <el-input v-model="form.pointCode" placeholder="请输入点位编码" clearable />
      </el-form-item>
      <el-form-item label="设备编码" prop="deviceCode">
        <el-input v-model="form.deviceCode" placeholder="请输入设备编码" clearable />
      </el-form-item>
      <el-form-item label="安装时间" prop="installationTime">
        <el-date-picker
          v-model="form.installationTime"
          type="datetime"
          placeholder="请选择安装时间"
          value-format="yyyy-MM-dd HH:mm:ss"
          class="w-full"
        />
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="handleClose">取消</el-button>
      <el-button
        v-if="!isReadonly"
        type="primary"
        size="small"
        :loading="loading"
        @click="handleConfirm"
      >
        确认保存
      </el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

::v-deep .el-date-editor.el-input {
  width: 100%;
}
</style>
