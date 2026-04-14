<script>
import { useMutation } from "@tanstack/vue-query";
import { computed, getCurrentInstance, ref, watch } from "vue";
import SelectTree from "@/components/treeSelect/treeSelect.vue";
import SetPlanPoint from "./setPlanPoint.vue";
import {
  addInspectionPlan,
  getInspectionPlanDetail,
} from "@/http/inspection/inspection-items-api";
import { getInspectionPointList } from "@/http/inspection/inspection-point-api";
import { getCompanyList } from "@/http/safe-production/company-manage-api";

export default {
  name: "InspectionPlanDialog",
  components: {
    SelectTree,
    SetPlanPoint,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    dialogType: {
      type: String,
      default: "add", // add/edit/view
    },
    info: {
      type: Object,
      default: () => ({}),
    },
    companyId: {
      type: String,
      default: "",
    },
  },
  emits: ["update:visible", "close", "submit"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const formRef = ref(null);
    const setPlanPointRef = ref(null);
    const submitLoading = ref(false);
    const dialogKey = ref(0);

    // ==================== 常量定义 ====================
    // 表单初始值
    const getInitialForm = (companyId = "") => ({
      planName: "",
      planCode: "",
      companyId,
      remarks: "",
      sortOrder: 1,
      inspectPlaces: [],
    });

    // 弹窗标题映射
    const DIALOG_TITLE_MAP = {
      add: "新增巡检计划",
      edit: "编辑巡检计划",
      view: "查看巡检计划",
    };

    // 表单验证规则
    const rules = {
      planName: [
        { required: true, message: "请输入计划名称", trigger: "blur" },
        { max: 100, message: "计划名称不能超过100个字符", trigger: "blur" },
      ],
      planCode: [
        { required: true, message: "请输入计划编码", trigger: "blur" },
        { max: 50, message: "计划编码不能超过50个字符", trigger: "blur" },
      ],
      companyId: [{ required: true, message: "请选择所属公司", trigger: "change" }],
      sortOrder: [{ required: true, message: "请输入排序号", trigger: "blur" }],
      inspectPlaces: [
        { required: true, message: "请至少选择一个巡检地点", trigger: "change" },
      ],
    };

    // ==================== 计算属性 ====================
    const dialogVisible = computed({
      get: () => props.visible,
      set: (val) => emit("update:visible", val),
    });

    const dialogTitle = computed(
      () => DIALOG_TITLE_MAP[props.dialogType] || DIALOG_TITLE_MAP.add
    );

    const isView = computed(() => props.dialogType === "view");

    // ==================== 响应式数据 ====================
    const form = ref(getInitialForm());
    const companyList = ref([]);
    const placeList = ref([]);
    const selectedPlaceIds = ref([]);

    // ==================== 数据重置 ====================
    const resetForm = () => {
      form.value = getInitialForm();
      selectedPlaceIds.value = [];
      placeList.value = [];
      if (formRef.value) {
        formRef.value.resetFields();
      }
      if (setPlanPointRef.value) {
        setPlanPointRef.value.tableData = [];
      }
    };

    // ==================== 数据获取 ====================
    // 获取公司列表
    const fetchCompanyList = async () => {
      try {
        const res = await getCompanyList();
        companyList.value = res.data?.success ? res.data.result || [] : [];
      } catch (error) {
        console.error("获取公司列表失败", error);
        companyList.value = [];
      }
    };

    // 获取巡检地点列表
    const fetchPlaceList = async (companyId) => {
      if (!companyId) {
        placeList.value = [];
        return;
      }
      try {
        const res = await getInspectionPointList({
          companyId,
          pageNum: 1,
          pageSize: 1000,
        });
        placeList.value = res.data?.success ? res.data.result?.list || [] : [];
      } catch (error) {
        console.error("获取巡检地点列表失败", error);
        placeList.value = [];
      }
    };

    // 获取计划详情
    const fetchPlanDetail = async () => {
      if (!props.info?.id) return;
      try {
        const res = await getInspectionPlanDetail(props.info.id);
        if (!res.data?.success) return;

        const result = res.data.result || {};
        form.value = {
          planName: result.planName || "",
          planCode: result.planCode || "",
          companyId: result.companyId || "",
          remarks: result.remarks || "",
          sortOrder: result.sortOrder || 1,
          inspectPlaces: result.inspectPlaces || [],
        };

        // 加载地点列表并设置选中项
        if (form.value.companyId) {
          await fetchPlaceList(form.value.companyId);
        }
        selectedPlaceIds.value = result.inspectPlaces || [];
      } catch (error) {
        console.error("获取计划详情失败", error);
        proxy.$message.error("获取计划详情失败");
      }
    };

    // ==================== 事件处理 ====================
    // 公司选择变化
    const handleCompanyChange = (companyId) => {
      form.value.companyId = companyId;
      selectedPlaceIds.value = [];
      form.value.inspectPlaces = [];
      fetchPlaceList(companyId);
    };

    // 巡检地点变化
    const handlePointChange = (placeIds) => {
      selectedPlaceIds.value = placeIds;
    };

    // 关闭弹窗
    const handleClose = () => {
      emit("close");
      emit("update:visible", false);
    };

    // 提交表单
    const { mutate: submitMutate } = useMutation({
      mutationFn: (data) => addInspectionPlan(data),
      onSuccess: (res) => {
        submitLoading.value = false;
        if (res.data?.success) {
          const message = props.dialogType === "add" ? "新增成功" : "编辑成功";
          proxy.$message.success(message);
          emit("submit");
          handleClose();
        } else {
          const message =
            res.data?.message || (props.dialogType === "add" ? "新增失败" : "编辑失败");
          proxy.$message.error(message);
        }
      },
      onError: () => {
        submitLoading.value = false;
        const message = props.dialogType === "add" ? "新增失败" : "编辑失败";
        proxy.$message.error(message);
      },
    });

    const handleSubmit = () => {
      formRef.value.validate((valid) => {
        if (!valid) return false;

        if (!selectedPlaceIds.value?.length) {
          proxy.$message.warning("请至少选择一个巡检地点");
          return false;
        }

        submitLoading.value = true;
        const submitData = {
          ...form.value,
          ...(props.dialogType === "edit" ? { id: props.info?.id } : {}),
        };
        submitMutate(submitData);
      });
    };

    // ==================== 监听器 ====================
    // 监听选中地点变化，同步到表单
    watch(
      () => selectedPlaceIds.value,
      (newVal) => {
        form.value.inspectPlaces = newVal;
      },
      { deep: true }
    );

    // 监听弹窗显示状态
    watch(
      () => props.visible,
      (visible) => {
        if (visible) {
          dialogKey.value += 1;
          fetchCompanyList();

          if (props.dialogType === "add") {
            form.value = getInitialForm(props.companyId || "");
            selectedPlaceIds.value = [];
            placeList.value = [];
            if (form.value.companyId) {
              fetchPlaceList(form.value.companyId);
            }
          } else {
            fetchPlanDetail();
          }
        } else {
          resetForm();
        }
      }
    );

    // ==================== 返回值 ====================
    return {
      // 计算属性
      dialogVisible,
      dialogTitle,
      isView,
      // 响应式数据
      formRef,
      form,
      rules,
      companyList,
      placeList,
      selectedPlaceIds,
      setPlanPointRef,
      submitLoading,
      dialogKey,
      // 方法
      handleClose,
      handleSubmit,
      handleCompanyChange,
      handlePointChange,
    };
  },
};
</script>

<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="overflow-y-auto h-[420px] scroll-pl-2 px-2" style="scrollbar-width: none">
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        :disabled="isView"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="计划名称" prop="planName">
              <el-input
                v-model="form.planName"
                placeholder="请输入计划名称"
                clearable
                maxlength="100"
                show-word-limit
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="计划编码" prop="planCode">
              <el-input
                v-model="form.planCode"
                placeholder="请输入计划编码"
                clearable
                maxlength="50"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属公司" prop="companyId">
              <SelectTree
                :props="{
                  value: 'id',
                  label: 'companyName',
                  children: 'children',
                }"
                :list="companyList"
                :value="form.companyId"
                :clearable="true"
                :accordion="true"
                @getValue="
                  (value) => {
                    handleCompanyChange(value);
                  }
                "
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序号" prop="sortOrder">
              <el-input-number
                v-model="form.sortOrder"
                :min="1"
                :max="9999"
                placeholder="请输入排序号"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="设置巡检地点" prop="inspectPlaces">
              <SetPlanPoint
                :key="dialogKey"
                ref="setPlanPointRef"
                :disabled="isView"
                :companyId="form.companyId"
                :inspectPlaces="form.inspectPlaces"
                @pointChange="handlePointChange"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注" prop="remarks">
              <el-input
                v-model="form.remarks"
                type="textarea"
                :rows="3"
                placeholder="请输入备注"
                maxlength="500"
                show-word-limit
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <template #footer>
      <div class="text-right">
        <el-button size="small" @click="handleClose"> 取 消 </el-button>
        <el-button
          v-if="!isView"
          type="primary"
          size="small"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          确 定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
::v-deep .el-select {
  width: 100%;
}
::v-deep .el-row {
  margin-bottom: 12px;
}
</style>
