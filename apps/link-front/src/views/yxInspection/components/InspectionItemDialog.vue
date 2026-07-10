<script>
import { ref, reactive, watch, computed } from "vue";

export default {
  name: "InspectionItemDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    dialogType: {
      type: String,
      default: "add", // add, edit, view
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
  setup(props, { emit }) {
    const dialogVisible = ref(false);
    const formRef = ref(null);

    // 表单数据
    const form = reactive({
      id: "",
      contentName: "",
      contentCategory: "",
      inspectionBenchmark: "",
      sortOrder: 1,
      requirePhoto: "否",
      exceptionVideo: "否",
      exceptionAudio: "否",
    });

    // 弹窗标题
    const dialogTitle = computed(() => {
      const titles = {
        add: "新增巡检项",
        edit: "编辑巡检项",
        view: "查看巡检项",
      };
      return titles[props.dialogType] || "巡检项";
    });

    // 是否只读
    const isReadonly = computed(() => props.dialogType === "view");

    // 表单校验规则
    const rules = {
      contentName: [{ required: true, message: "请输入巡检项", trigger: "blur" }],
      contentCategory: [{ required: true, message: "请选择巡检分类", trigger: "change" }],
      inspectionBenchmark: [
        { required: true, message: "请输入巡检标准", trigger: "blur" },
      ],
    };

    // 监听visible变化
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
      if (props.dialogType === "add") {
        Object.assign(form, {
          id: "",
          contentName: "",
          contentCategory: "",
          inspectionBenchmark: "",
          sortOrder: 1,
          requirePhoto: "否",
          exceptionVideo: "否",
          exceptionAudio: "否",
        });
      } else {
        // 编辑时，从info中获取数据，处理布尔值转换为是/否
        Object.assign(form, {
          id: props.info.id || "",
          contentName: props.info.contentName || props.info.contentName || "",
          contentCategory: props.info.contentCategory || "",
          inspectionBenchmark:
            props.info.inspectionBenchmark || props.info.inspectionBenchmark || "",
          sortOrder: props.info.sortOrder || 1,
          requirePhoto:
            props.info.mustPhotograph === true || props.info.requirePhoto === "是"
              ? "是"
              : "否",
          exceptionVideo:
            props.info.abnormalMustVideo === true || props.info.exceptionVideo === "是"
              ? "是"
              : "否",
          exceptionAudio:
            props.info.abnormalMustAudio === true || props.info.exceptionAudio === "是"
              ? "是"
              : "否",
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
      if (props.dialogType === "view") {
        handleClose();
        return;
      }

      formRef.value?.validate((valid) => {
        if (valid) {
          // 构建提交数据，转换参数名称并添加写死的默认值
          const submitData = {
            id: form.id,
            contentName: form.contentName,
            contentCategory: form.contentCategory,
            inspectionBenchmark: form.inspectionBenchmark,
            sortOrder: form.sortOrder,
            mustPhotograph: form.requirePhoto === "是",
            abnormalMustVideo: form.exceptionVideo === "是",
            abnormalMustAudio: form.exceptionAudio === "是",
            // 写死的默认值
            dataType: "RADIO",
            dataOptionList: ["A、正常", "B、异常"],
            dataVlaueList: ["A、正常"],
          };
          emit("submit", submitData);
        }
      });
    };

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
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
      size="small"
      :disabled="isReadonly"
    >
      <el-form-item label="巡检项" prop="contentName">
        <el-input v-model="form.contentName" placeholder="请输入巡检项名称" />
      </el-form-item>

      <el-form-item label="巡检标准" prop="inspectionBenchmark">
        <el-input
          v-model="form.inspectionBenchmark"
          type="textarea"
          :rows="3"
          placeholder="请输入巡检标准"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="巡检分类" prop="contentCategory">
            <el-select
              v-model="form.contentCategory"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils?.getDictList('inspectionCategory') || []"
                :key="item.id || item.dictCode"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="序号">
            <el-input-number v-model="form.sortOrder" :min="1" style="width: 100%" />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- <div class="form-section">
        <div class="form-section-title">数据设置</div>
        <el-form-item label="数据类别">
          <el-input value="单选" disabled />
        </el-form-item>
      </div> -->

      <el-form-item label="强制拍照">
        <el-radio-group v-model="form.requirePhoto">
          <el-radio label="是">是</el-radio>
          <el-radio label="否">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="异常视频">
        <el-radio-group v-model="form.exceptionVideo">
          <el-radio label="是">是</el-radio>
          <el-radio label="否">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="异常录音">
        <el-radio-group v-model="form.exceptionAudio">
          <el-radio label="是">是</el-radio>
          <el-radio label="否">否</el-radio>
        </el-radio-group>
      </el-form-item>
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
        确 定
      </el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.form-section {
  margin-bottom: 4px;
}
.form-section-title {
  font-weight: bold;
  margin-bottom: 12px;
  font-size: 14px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
