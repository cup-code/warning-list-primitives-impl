<script>
import { computed, getCurrentInstance, reactive, ref, watch } from "vue";
import { saveOrUpdateSummaryData } from "@/http/inspection/yj-inspection-api";

export default {
  name: "TrainingSetDataDialog",
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
      factoryCode: "",
      pointCode: "",
      sampleTime: "",
      source: "",
      sac: "",
      sac1: "",
      sac2: "",
      sac3: "",
      sac4: "",
      cod: "",
      nh3n: "",
      no3n: "",
      tp: "",
      tn: "",
      ph: "",
      dissolvedOxygen: "",
      cond: "",
      bod5: "",
      ss: "",
      mlss: "",
      temp: "",
      toc: "",
      aiCod: "",
      aiNh3n: "",
      aiNo3n: "",
      aiTp: "",
      aiTn: "",
      aiPh: "",
      aiDo: "",
      aiCond: "",
      aiBod5: "",
      aiSs: "",
      aiMlss: "",
      aiTemp: "",
      aiToc: "",
    });

    const dialogTitle = computed(() => {
      const titles = {
        add: "新增训练集数据",
        edit: "修改训练集数据",
        view: "查看训练集数据",
      };
      return titles[props.dialogType] || "训练集数据";
    });

    const isReadonly = computed(() => props.dialogType === "view");

    const rules = {
      factoryCode: [{ required: true, message: "请输入厂区编码", trigger: "blur" }],
      pointCode: [{ required: true, message: "请输入点位编码", trigger: "blur" }],
      sampleTime: [{ required: true, message: "请输入采样时间", trigger: "blur" }],
      source: [{ required: true, message: "请输入来源", trigger: "blur" }],
    };

    // 表单字段分组配置
    const fieldGroups = [
      {
        title: "基础信息",
        fields: [
          { label: "厂区编码", prop: "factoryCode", required: true },
          { label: "点位编码", prop: "pointCode", required: true },
          { label: "采样时间", prop: "sampleTime", type: "datetime", required: true },
          { label: "来源", prop: "source", required: true },
        ],
      },
      {
        title: "检测指标",
        fields: [
          { label: "吸光度SAC1", prop: "sac" },
          { label: "吸光度SAC2", prop: "sac1" },
          { label: "吸光度SAC3", prop: "sac2" },
          { label: "吸光度SAC4", prop: "sac3" },
          { label: "吸光度SAC5", prop: "sac4" },
          { label: "化学需氧量COD", prop: "cod" },
          { label: "氨氮NH3N", prop: "nh3n" },
          { label: "硝氮NO3N", prop: "no3n" },
          { label: "总磷TP", prop: "tp" },
          { label: "总氮TN", prop: "tn" },
          { label: "酸碱度PH", prop: "ph" },
          { label: "溶解氧DO", prop: "dissolvedOxygen" },
          { label: "电导率COND", prop: "cond" },
          { label: "五日生化需氧量BOD5", prop: "bod5" },
          { label: "浊度SS", prop: "ss" },
          { label: "污泥浓度MLSS", prop: "mlss" },
          { label: "温度TEMP", prop: "temp" },
          { label: "总有机碳TOC", prop: "toc" },
        ],
      },
      {
        title: "AI预测指标",
        fields: [
          { label: "AI-COD", prop: "aiCod" },
          { label: "AI-NH3N", prop: "aiNh3n" },
          { label: "AI-NO3N", prop: "aiNo3n" },
          { label: "AI-TP", prop: "aiTp" },
          { label: "AI-TN", prop: "aiTn" },
          { label: "AI-PH", prop: "aiPh" },
          { label: "AI-DO", prop: "aiDo" },
          { label: "AI-COND", prop: "aiCond" },
          { label: "AI-BOD5", prop: "aiBod5" },
          { label: "AI-SS", prop: "aiSs" },
          { label: "AI-MLSS", prop: "aiMlss" },
          { label: "AI-TEMP", prop: "aiTemp" },
          { label: "AI-TOC", prop: "aiToc" },
        ],
      },
    ];

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
        factoryCode: "",
        pointCode: "",
        sampleTime: "",
        source: "",
        sac: "",
        sac1: "",
        sac2: "",
        sac3: "",
        sac4: "",
        cod: "",
        nh3n: "",
        no3n: "",
        tp: "",
        tn: "",
        ph: "",
        dissolvedOxygen: "",
        cond: "",
        bod5: "",
        ss: "",
        mlss: "",
        temp: "",
        toc: "",
        aiCod: "",
        aiNh3n: "",
        aiNo3n: "",
        aiTp: "",
        aiTn: "",
        aiPh: "",
        aiDo: "",
        aiCond: "",
        aiBod5: "",
        aiSs: "",
        aiMlss: "",
        aiTemp: "",
        aiToc: "",
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

          const res = await saveOrUpdateSummaryData(payload);

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
      fieldGroups,
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
    width="880px"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="dialog-body">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :disabled="isReadonly"
        label-width="160px"
        size="small"
      >
        <template v-for="group in fieldGroups">
          <div class="field-group">
            <div class="group-title">
              {{ group.title }}
            </div>
            <el-row :gutter="16">
              <el-col v-for="field in group.fields" :key="field.prop" :span="12">
                <el-form-item
                  :label="field.label"
                  :prop="field.prop"
                  :required="field.required"
                >
                  <el-date-picker
                    v-if="field.type === 'datetime'"
                    v-model="form[field.prop]"
                    type="datetime"
                    placeholder="请选择时间"
                    value-format="yyyy-MM-dd HH:mm:ss"
                    style="width: 100%"
                  />
                  <el-input
                    v-else
                    v-model="form[field.prop]"
                    :placeholder="`请输入${field.label}`"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-form>
    </div>

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
.dialog-body {
  max-height: 65vh;
  overflow-y: auto;
  padding-right: 10px;
  scrollbar-width: none;
}

.field-group {
  margin-bottom: 12px;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  padding: 8px 0;
  margin-bottom: 4px;
  border-bottom: 1px solid #ebeef5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
