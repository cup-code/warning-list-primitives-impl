<script>
import { useMutation } from "@tanstack/vue-query";
import { computed, getCurrentInstance, ref, watch } from "vue";
import { addOrUpdateRobotDevice } from "@/http/machineManage/index";

export default {
  name: "RobotDeviceDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    info: {
      type: Object,
      default: () => ({}),
    },
    // 弹窗类型: add-新增, edit-编辑, view-查看
    dialogType: {
      type: String,
      default: "add",
    },
  },
  emits: ["update:visible", "close", "submit"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const formRef = ref(null);
    const submitLoading = ref(false);

    // 表单数据
    const form = ref({
      id: "",
      robotName: "",
      robotCode: "",
      robotId: "",
      remarks: "",
    });

    // 表单验证规则
    const rules = {
      robotName: [
        { required: true, message: "请输入机器人名称", trigger: "blur" },
        { max: 50, message: "机器人名称不能超过50个字符", trigger: "blur" },
      ],
      robotCode: [
        { required: true, message: "请输入机器人编号", trigger: "blur" },
        { max: 50, message: "机器人编号不能超过50个字符", trigger: "blur" },
      ],
      robotId: [
        { required: true, message: "请输入机器人ID", trigger: "blur" },
        { max: 50, message: "机器人ID不能超过50个字符", trigger: "blur" },
      ],
      remarks: [{ max: 200, message: "备注不能超过200个字符", trigger: "blur" }],
    };

    // 弹窗标题
    const dialogTitle = computed(() => {
      if (props.dialogType === "add") {
        return "新增机器人设备";
      } else if (props.dialogType === "edit") {
        return "编辑机器人设备";
      } else if (props.dialogType === "view") {
        return "查看机器人设备";
      }
      return "机器人设备";
    });

    // 是否为查看模式
    const isView = computed(() => props.dialogType === "view");

    // 监听弹窗显示状态
    watch(
      () => props.visible,
      (newVal) => {
        if (newVal) {
          if (props.dialogType === "add") {
            // 重置表单
            form.value = {
              id: "",
              robotName: "",
              robotCode: "",
              robotId: "",
              remarks: "",
            };
            formRef.value?.clearValidate();
          } else if (props.dialogType === "edit" || props.dialogType === "view") {
            // 填充表单数据
            form.value = {
              id: props.info.id || "",
              robotName: props.info.robotName || "",
              robotCode: props.info.robotCode || "",
              robotId: props.info.robotId || "",
              remarks: props.info.remarks || "",
            };
          }
        }
      },
      { immediate: true }
    );

    // 关闭弹窗
    const onClose = () => {
      emit("update:visible", false);
      emit("close");
    };

    // 添加/编辑机器人设备
    const { mutate: saveMutate } = useMutation({
      mutationFn: (data) => addOrUpdateRobotDevice(data),
      onSuccess: (res) => {
        submitLoading.value = false;
        if (res.data?.success) {
          proxy.$message.success(props.dialogType === "add" ? "新增成功" : "编辑成功");
          emit("submit");
          onClose();
        } else {
          proxy.$message.error(
            res.data?.message || (props.dialogType === "add" ? "新增失败" : "编辑失败")
          );
        }
      },
      onError: () => {
        submitLoading.value = false;
        proxy.$message.error(props.dialogType === "add" ? "新增失败" : "编辑失败");
      },
    });

    // 提交表单
    const onSubmit = () => {
      if (!formRef.value) return;

      formRef.value.validate((valid) => {
        if (valid) {
          submitLoading.value = true;
          const formData = { ...form.value };
          saveMutate(formData);
        }
      });
    };

    return {
      form,
      formRef,
      rules,
      dialogTitle,
      isView,
      submitLoading,
      onClose,
      onSubmit,
    };
  },
};
</script>

<template>
  <el-dialog
    :title="dialogTitle"
    :visible="visible"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    width="600px"
    @close="onClose"
  >
    <div class="overflow-y-auto pl-2 pr-16" style="scrollbar-width: none">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :disabled="isView"
        label-width="100px"
        size="small"
      >
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="机器人名称" prop="robotName">
              <el-input
                v-model="form.robotName"
                placeholder="请输入机器人名称"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="机器人编号" prop="robotCode">
              <el-input
                v-model="form.robotCode"
                placeholder="请输入机器人编号"
                clearable
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="机器人ID" prop="robotId">
              <el-input v-model="form.robotId" placeholder="请输入机器人ID" clearable />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item label="备注" prop="remarks">
              <el-input
                v-model="form.remarks"
                type="textarea"
                placeholder="请输入备注"
                :rows="4"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div slot="footer" class="dialog-footer">
      <EButton @click="onClose"> 取消 </EButton>
      <EButton v-if="!isView" type="primary" :loading="submitLoading" @click="onSubmit">
        确定
      </EButton>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
::v-deep .el-dialog__body {
  padding: 20px;
}
</style>
