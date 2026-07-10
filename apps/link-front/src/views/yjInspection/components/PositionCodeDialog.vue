<script>
import { ref, reactive, watch, computed, getCurrentInstance } from "vue";
import { saveOrUpdateYjPoint } from "@/http/inspection/yj-inspection-api";

export default {
  name: "PositionCodeDialog",
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
      pointName: "",
      processSection: "",
    });

    const dialogTitle = computed(() => {
      const titles = {
        add: "新增点位编码",
        edit: "修改点位编码",
        view: "查看点位编码",
      };
      return titles[props.dialogType] || "点位编码";
    });

    const isReadonly = computed(() => props.dialogType === "view");

    const rules = {
      pointCode: [{ required: true, message: "请输入点位编码", trigger: "blur" }],
      pointName: [{ required: true, message: "请输入点位名称", trigger: "blur" }],
      processSection: [{ required: true, message: "请输入所属工艺段", trigger: "blur" }],
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
        pointName: "",
        processSection: "",
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

          const res = await saveOrUpdateYjPoint(payload);

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
      <el-form-item label="点位名称" prop="pointName">
        <el-input v-model="form.pointName" placeholder="请输入点位名称" clearable />
      </el-form-item>
      <el-form-item label="所属工艺段" prop="processSection">
        <el-input
          v-model="form.processSection"
          placeholder="请输入所属工艺段"
          clearable
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
</style>
