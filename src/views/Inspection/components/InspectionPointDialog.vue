<script>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { computed, getCurrentInstance, ref, watch, nextTick } from "vue";
import SelectTree from "@/components/treeSelect/treeSelect.vue";
import {
  addInspectionPoint,
  getInspectionPointDetail,
} from "@/http/inspection/inspection-point-api";
import { getCompanyList } from "@/http/safe-production/company-manage-api";
import ItemsDialog from "./itemsDialog.vue";
import SetItems from "./setItems.vue";
import SetPoint from "./setPoint.vue";
// import PointSelect from "@/components/PointSelect/index";

export default {
  name: "InspectionPointDialog",
  components: {
    SelectTree,
    SetPoint,
    SetItems,
    ItemsDialog,
    // PointSelect,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    info: {
      type: Object,
      default: () => ({}),
    },
    dialogType: {
      type: String,
      default: "add",
    },
  },
  emits: ["update:visible", "close", "submit"],
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();
    const formRef = ref(null);
    // const pointSelect = ref(null);
    const submitLoading = ref(false);

    // ==================== 常量定义 ====================
    // 表单初始值
    const getInitialForm = () => ({
      placeName: "",
      placeCode: "",
      placePosition: "",
      sortOrder: 0,
      remarks: "",
      companyId: "",
      geoInfo: "",
      inspectItems: [],
    });

    // 弹窗标题映射
    const DIALOG_TITLE_MAP = {
      add: "新增巡检点",
      edit: "编辑巡检点",
      view: "查看巡检点",
    };

    // 表单验证规则
    const rules = {
      placeName: [
        { required: true, message: "请输入巡检点名称", trigger: "blur" },
        { max: 50, message: "巡检点名称不能超过50个字符", trigger: "blur" },
      ],
      placeCode: [
        { required: true, message: "请输入巡检点编号", trigger: "blur" },
        { max: 30, message: "巡检点编号不能超过30个字符", trigger: "blur" },
      ],
      placePosition: [{ required: true, message: "请输入位置", trigger: "blur" }],
      sortOrder: [{ required: true, message: "请输入排序号", trigger: "blur" }],
      inspectItems: [{ required: true, message: "请选择巡检项", trigger: "blur" }],
    };

    // ==================== 计算属性 ====================
    const dialogTitle = computed(
      () => DIALOG_TITLE_MAP[props.dialogType] || DIALOG_TITLE_MAP.add
    );

    const isView = computed(() => props.dialogType === "view");

    // ==================== 响应式数据 ====================
    const form = ref(getInitialForm());
    const companyList = ref([]);
    const inspectionItemsTableData = ref([]);
    const itemsDialogVisible = ref(false);
    const itemsDialogType = ref("");
    const currentItemIndex = ref(-1);
    const openType = ref("");

    // ==================== 数据获取 ====================
    // 获取公司列表
    const { refetch: refetchCompanyList } = useQuery({
      queryKey: ["companyList"],
      queryFn: () => getCompanyList(),
      onSuccess: ({ data }) => {
        companyList.value = data?.success ? data.result || [] : [];
      },
    });
    refetchCompanyList();

    // 获取巡检点详情
    const { refetch: refetchInspectionPointDetail } = useQuery({
      queryKey: ["inspectionPointDetail"],
      queryFn: () => getInspectionPointDetail(props.info?.id),
      enabled: false,
      onSuccess: ({ data }) => {
        if (!data?.success) return;

        form.value = { ...data.result };
        inspectionItemsTableData.value =
          data.result.inspectItems?.map((item, index) => ({
            id: item.id || index + 1,
            itemId: item.itemId,
            itemName: item.itemName,
            sortOrder: item.sortOrder,
            typeCode: item.typeCode,
            typeName: item.typeName,
          })) || [];
      },
    });

    // ==================== 数据重置 ====================
    // 重置表单数据
    const resetForm = () => {
      form.value = getInitialForm();
      inspectionItemsTableData.value = [];
      itemsDialogVisible.value = false;
      itemsDialogType.value = "";
      currentItemIndex.value = -1;
      openType.value = "";
      nextTick(() => {
        formRef.value?.clearValidate?.();
      });
    };

    // ==================== 事件处理 ====================
    // 关闭弹窗
    const handleClose = () => {
      emit("update:visible", false);
      emit("close");
    };

    // 公司选择变化
    const handleCompanyChange = (companyId) => {
      if (companyId) {
        form.value.companyId = companyId;
      }
    };

    // 设置点位信息
    const handleSetPointInfo = (info) => {
      form.value.geoInfo = JSON.stringify(info);
    };

    // ==================== 巡检项操作 ====================
    // 获取默认巡检项数据
    const getDefaultItem = () => {
      const length = inspectionItemsTableData.value.length;
      return {
        id: length + 1,
        itemId: "",
        itemName: "",
        sortOrder: length + 1,
        typeCode: "",
        typeName: "",
      };
    };

    // 添加巡检项
    const handleItemsAdd = () => {
      inspectionItemsTableData.value.push(getDefaultItem());
    };

    // 删除巡检项
    const handleItemsDelete = (item) => {
      const index = inspectionItemsTableData.value.findIndex((i) => i.id === item.id);
      if (index > -1) {
        inspectionItemsTableData.value.splice(index, 1);
        // 重新设置序列号
        inspectionItemsTableData.value.forEach((i, idx) => {
          i.id = idx + 1;
        });
      }
    };

    // 更新巡检项
    const handleItemsUpdate = (item) => {
      const index = inspectionItemsTableData.value.findIndex((i) => i.id === item.id);
      if (index > -1) {
        Object.assign(inspectionItemsTableData.value[index], item);
      }
    };

    // 选择巡检项
    const handleItemsSelect = (item) => {
      if (!item.typeCode) {
        proxy.$message.warning("请先选择巡检类型");
        return;
      }

      // if (item.typeCode === "nonProcess") {
      //   pointSelect.value?.init();
      //   return;
      // }

      const index = inspectionItemsTableData.value.findIndex((i) => i.id === item.id);
      if (index > -1) {
        currentItemIndex.value = index;
        itemsDialogType.value = item.typeCode;
        openType.value = item.type || "";
        itemsDialogVisible.value = true;
      }
    };

    // 提交巡检项选择
    const handleItemsSubmit = (selectedItem) => {
      if (currentItemIndex.value > -1) {
        const target = inspectionItemsTableData.value[currentItemIndex.value];
        proxy.$set(target, "itemId", selectedItem?.id || "");
        proxy.$set(target, "itemName", selectedItem?.name || "");
        currentItemIndex.value = -1;
      }
    };

    // 无工艺点提交
    const handleNoProcessSubmit = (selectedPoints) => {
      // TODO: 处理无工艺点选择
    };

    // 计算当前选中项的巡检项值
    const currentInspectionItem = computed(() => {
      const item = inspectionItemsTableData.value[currentItemIndex.value];
      return item?.itemName || "";
    });

    // ==================== 表单提交 ====================
    // 新增巡检点
    const { mutate: addMutate } = useMutation({
      mutationFn: (data) => addInspectionPoint(data),
      onSuccess: (res) => {
        submitLoading.value = false;
        if (res.data?.success) {
          proxy.$message.success("新增成功");
          emit("submit");
          handleClose();
        } else {
          proxy.$message.error(res.data?.message || "新增失败");
        }
      },
      onError: () => {
        submitLoading.value = false;
        proxy.$message.error("新增失败");
      },
    });

    // 提交表单
    const handleSubmit = () => {
      if (!formRef.value) return;

      formRef.value.validate((valid) => {
        if (!valid) return;

        submitLoading.value = true;
        const formData = {
          ...form.value,
          inspectItems: inspectionItemsTableData.value.map((item) => ({
            itemId: item.itemId,
            itemName: item.itemName,
            sortOrder: item.sortOrder,
            typeCode: item.typeCode,
            typeName: item.typeName,
          })),
        };
        addMutate(formData);
      });
    };

    // ==================== 监听器 ====================
    // 监听弹窗显示状态
    watch(
      () => props.visible,
      (visible) => {
        if (visible) {
          if (props.dialogType === "add") {
            resetForm();
          } else {
            refetchInspectionPointDetail();
          }
        } else {
          resetForm();
        }
      }
    );

    // ==================== 返回值 ====================
    return {
      // 计算属性
      dialogTitle,
      isView,
      currentInspectionItem,
      // 响应式数据
      form,
      formRef,
      rules,
      companyList,
      inspectionItemsTableData,
      submitLoading,
      // pointSelect,
      itemsDialogVisible,
      itemsDialogType,
      openType,
      currentItemIndex,
      // 方法
      handleClose,
      handleSubmit,
      handleCompanyChange,
      handleSetPointInfo,
      handleItemsAdd,
      handleItemsDelete,
      handleItemsUpdate,
      handleItemsSelect,
      handleItemsSubmit,
      handleNoProcessSubmit,
    };
  },
};
</script>

<template>
  <div>
    <ItemsDialog
      :itemsDialogVisible.sync="itemsDialogVisible"
      :dialogType="itemsDialogType"
      :openType="openType"
      :inspectionItems="currentInspectionItem"
      @submit="handleItemsSubmit"
    />
    <!-- <PointSelect ref="pointSelect" :selectData="[]" @doSubmit="handleNoProcessSubmit" /> -->
    <!-- <NoProcessDialog
      :visible.sync="noProcessDialogVisible"
      @submit="handleNoProcessSubmit"
    /> -->
    <el-dialog
      :title="dialogTitle"
      :visible="visible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      width="800px"
      @close="handleClose"
    >
      <div
        class="overflow-y-auto h-[450px] scroll-pl-2 px-2"
        style="scrollbar-width: none"
      >
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          :disabled="isView"
          label-width="60px"
          size="small"
        >
          <el-row>
            <div class="text-sm font-bold mb-5 text-black">基本信息</div>
            <el-col :span="12">
              <el-form-item label="名称" prop="placeName">
                <el-input
                  v-model="form.placeName"
                  placeholder="请输入巡检点名称"
                  clearable
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="编号" prop="placeCode">
                <el-input
                  v-model="form.placeCode"
                  placeholder="请输入巡检点编号"
                  clearable
                  maxlength="30"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="16">
              <el-form-item label="公司" prop="companyId">
                <SelectTree
                  :props="{
                    value: 'id', // ID字段名
                    label: 'companyName', // 显示名称
                    children: 'children', // 子级字段名
                  }"
                  :list="companyList"
                  :value="form.companyId"
                  :clearable="true"
                  :accordion="true"
                  @getValue="handleCompanyChange"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="16">
              <el-form-item label="位置" prop="placePosition">
                <el-input
                  v-model="form.placePosition"
                  placeholder="请输入位置"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="标注" prop="geoInfo">
                <!-- 用 v-if 精确控制 SetPoint 的生命周期，弹窗关闭时立即销毁 -->
                <SetPoint
                  v-if="visible"
                  :geoInfo="form.geoInfo"
                  :dialogType="dialogType"
                  :disabled="isView"
                  @setPointInfo="handleSetPointInfo"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="排序" prop="sortOrder">
                <el-input-number
                  v-model="form.sortOrder"
                  :min="0"
                  :max="9999"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="16">
              <el-form-item label="备注" prop="remarks">
                <el-input
                  v-model="form.remarks"
                  type="textarea"
                  placeholder="请输入备注"
                  :rows="3"
                  maxlength="200"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <div class="text-sm font-bold m-2 text-black">巡检项</div>
            <SetItems
              :tableData="inspectionItemsTableData"
              :disabled="isView"
              @add="handleItemsAdd"
              @delete="handleItemsDelete"
              @update="handleItemsUpdate"
              @select="handleItemsSelect"
            />
          </el-row>
        </el-form>
      </div>
      <div slot="footer" class="dialog-footer">
        <EButton @click="handleClose"> 取消 </EButton>
        <EButton
          v-if="!isView"
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          确定
        </EButton>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
::v-deep .el-dialog__body {
  padding: 20px;
}
</style>
