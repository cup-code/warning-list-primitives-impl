<script>
import { ref, reactive, watch, computed, getCurrentInstance } from "vue";

export default {
  name: "TerminalDialog",
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
    loading: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:visible", "close", "submit"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const dialogVisible = ref(false);
    const formRef = ref(null);

    const form = reactive({
      id: "",
      serialNumber: "",
      imei: "",
      simNumber: "",
      productModel: "",
      productionDate: "",
    });

    const dialogTitle = computed(() => {
      const titles = {
        add: "新增终端",
        edit: "编辑终端",
        view: "查看终端",
      };
      return titles[props.dialogType] || "终端";
    });

    const isReadonly = computed(() => props.dialogType === "view");

    const rules = {
      serialNumber: [{ required: true, message: "请输入序列号", trigger: "blur" }],
      productModel: [{ required: true, message: "请输入产品型号", trigger: "blur" }],
      productionDate: [{ required: true, message: "请选择生产日期", trigger: "change" }],
    };

    watch(
      () => props.visible,
      (val) => {
        dialogVisible.value = val;
        if (val) initForm();
      },
      { immediate: true }
    );

    function initForm() {
      if (props.dialogType === "add") {
        Object.assign(form, {
          id: "",
          serialNumber: "",
          imei: "",
          simNumber: "",
          productModel: "",
          productionDate: "",
        });
      } else {
        Object.assign(form, {
          id: props.info.id || "",
          serialNumber: props.info.serialNumber ?? "",
          imei: props.info.imei ?? "",
          simNumber: props.info.simNumber ?? "",
          productModel: props.info.productModel ?? "",
          productionDate: props.info.productionDate ?? "",
        });
      }
    }

    function handleClose() {
      emit("update:visible", false);
      emit("close");
    }

    function handleConfirm() {
      if (isReadonly.value) {
        handleClose();
        return;
      }
      formRef.value?.validate((valid) => {
        if (!valid) return;
        emit("submit", { ...form });
      });
    }

    return {
      dialogVisible,
      formRef,
      form,
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
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" size="small">
      <el-form-item label="序列号" prop="serialNumber">
        <el-input
          v-model="form.serialNumber"
          placeholder="请输入序列号"
          clearable
          :disabled="isReadonly"
        />
      </el-form-item>
      <el-form-item label="产品型号" prop="productModel">
        <el-select
          v-model="form.productModel"
          placeholder="请选择产品型号"
          clearable
          :disabled="isReadonly"
          style="width: 100%"
        >
          <el-option
            v-for="item in $dictUtils.getDictList('YIXUN_produType') || []"
            :key="item.dictCode"
            :label="item.dictName"
            :value="item.dictCode"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="IMEI" prop="imei">
        <el-input
          v-model="form.imei"
          placeholder="请输入IMEI"
          clearable
          :disabled="isReadonly"
        />
      </el-form-item>
      <el-form-item label="SIM卡号" prop="simNumber">
        <el-input
          v-model="form.simNumber"
          placeholder="请输入SIM卡号"
          clearable
          :disabled="isReadonly"
        />
      </el-form-item>

      <el-form-item label="生产日期" prop="productionDate">
        <el-date-picker
          v-model="form.productionDate"
          type="date"
          placeholder="请选择生产日期"
          value-format="yyyy-MM-dd HH:mm:ss"
          style="width: 100%"
          :disabled="isReadonly"
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
