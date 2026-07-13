<script>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { computed, getCurrentInstance, ref, watch } from "vue";
import {
  addInspectionItems,
  // editInspectionItems,
} from "@/http/inspection/inspection-items-api";
import { cameraList } from "@/http/videoWarning/warning-api";

export default {
  name: "InspectionItemsDialog",
  props: {
    visible: { type: Boolean, default: false },
    dialogType: { type: String, default: "add" }, // add/edit/view
    info: { type: Object, default: () => ({}) },
    companyId: { type: String, default: "" },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();

    const dialogVisible = computed({
      get: () => props.visible,
      set: (val) => emit("update:visible", val),
    });

    const dialogTitle = computed(() => {
      const map = { add: "绑定算法", edit: "编辑巡检项", view: "查看巡检项" };
      return map[props.dialogType] || "绑定算法";
    });

    const isView = computed(() => props.dialogType === "view");

    const cameraLists = ref([]);
    const algorithmList = ref([]);
    const submitLoading = ref(false);

    const selectedAlgorithmIds = ref([]); // 选中的算法id数组
    const selectedCameraId = ref(""); // 当前选中的摄像头id

    /**
     * 获取摄像头列表
     */
    const form = ref({
      cameraName: "",
    });
    const { refetch: refetchCameraList } = useQuery({
      queryKey: ["dialogCameraList"],
      queryFn: () => cameraList({ isPage: false, cameraName: form.value.cameraName }),
      enabled: false,
      onSuccess: ({ data }) => {
        if (data?.success) {
          cameraLists.value = data.result.list || [];
          if (!selectedCameraId.value && cameraLists.value.length) {
            selectedCameraId.value = cameraLists.value[0].id;
          }
        }
      },
      onError: () => {
        cameraLists.value = [];
      },
    });

    /**
     * 已选算法名称
     */
    const displaySelectedAlgorithms = computed(() => {
      return selectedAlgorithmIds.value
        .map((id) => algorithmList.value.find((a) => a.id === id)?.name)
        .filter(Boolean);
    });

    /**
     * 解析摄像头的 aiSkills 字段为算法列表
     * @param {string} aiSkills - 逗号分隔的算法名称字符串
     */
    const parseAiSkills = (aiSkills, type = "、") => {
      if (!aiSkills) return [];
      return aiSkills
        .split(type)
        .filter(Boolean)
        .map((name) => ({
          id: name.trim(),
          name: name.trim(),
        }));
    };

    // 初始化选择项
    const initSelection = () => {
      selectedAlgorithmIds.value = [];
      selectedCameraId.value = "";
      algorithmList.value = [];

      if (!cameraLists.value.length) return;

      // 编辑/查看模式：根据 info 复现选中状态
      const isEditOrView = props.dialogType === "edit" || props.dialogType === "view";
      console.log(props.info);
      const targetCameraId = isEditOrView
        ? props.info?.cameraId
        : cameraLists.value[0].id;
      const camera =
        cameraLists.value.find((c) => c.id === targetCameraId) || cameraLists.value[0];

      selectedCameraId.value = camera.id;
      algorithmList.value = parseAiSkills(camera.aiSkills);
      selectedAlgorithmIds.value =
        isEditOrView && Array.isArray(parseAiSkills(props.info?.skills, ","))
          ? [...parseAiSkills(props.info?.skills, ",").map((item) => item.id)]
          : [];

      console.log(selectedAlgorithmIds.value);
    };

    // 监听弹框开关，初始化
    watch(
      () => props.visible,
      (v) => {
        if (v) {
          Promise.all([refetchCameraList()]).then(() => {
            initSelection();
          });
        }
      }
    );

    // 切换摄像头
    const cameraName = ref("");
    const onCameraChange = (camera) => {
      if (isView.value) return;
      selectedCameraId.value = camera.id;
      cameraName.value = camera.cameraName;
      console.log(cameraName.value);
      algorithmList.value = parseAiSkills(camera.aiSkills);
      selectedAlgorithmIds.value = [];
    };

    // 关闭弹窗
    const handleClose = () => {
      emit("close");
      emit("update:visible", false);
      selectedAlgorithmIds.value = [];
      selectedCameraId.value = "";
    };

    // 新增
    const { mutate: addMutate } = useMutation({
      mutationFn: addInspectionItems,
      onSuccess: (res) => {
        submitLoading.value = false;
        if (res.data.success) {
          proxy.$message.success("绑定成功");
          emit("submit");
          handleClose();
        } else {
          proxy.$message.error(res.data.message || "绑定失败");
        }
      },
    });

    // // 编辑
    // const { mutate: editMutate } = useMutation({
    //   mutationFn: getInspectionPointDetail,
    //   onSuccess: (res) => {
    //     submitLoading.value = false
    //     if (res.data?.success) {
    //       proxy.$message.success('编辑成功')
    //       emit('submit')
    //       handleClose()
    //     }
    //     else {
    //       proxy.$message.error(res.data?.message || '编辑失败')
    //     }
    //   },
    //   onError: () => {
    //     submitLoading.value = false
    //     proxy.$message.error('编辑失败')
    //   },
    // })

    // 提交
    const handleSubmit = () => {
      if (!selectedCameraId.value || !selectedAlgorithmIds.value.length) {
        proxy.$message.warning("请完整选择摄像头和算法");
        return;
      }
      submitLoading.value = true;
      const data = {
        cameraName: cameraName.value,
        cameraId: selectedCameraId.value,
        skills: selectedAlgorithmIds.value.join(","),
        ...(props.dialogType !== "add" ? { id: props.info?.id } : {}),
      };

      // if (props.dialogType === 'edit') {
      //   editMutate(data)
      // }

      addMutate(data);
    };

    return {
      dialogVisible,
      dialogTitle,
      isView,
      cameraLists,
      algorithmList,
      selectedCameraId,
      selectedAlgorithmIds,
      displaySelectedAlgorithms,
      submitLoading,
      form,
      refetchCameraList,
      handleClose,
      handleSubmit,
      onCameraChange,
    };
  },
};
</script>

<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="780px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="min-h-[410px] mb-3">
      <el-form label-position="left" :model="form" inline>
        <el-form-item label="摄像头名称" prop="cameraName">
          <el-input v-model="form.cameraName" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="refetchCameraList">搜索</el-button>
        </el-form-item>
      </el-form>
      <div class="flex mt-3">
        <!-- 左侧摄像头列表 -->
        <div class="w-[260px] border-r border-[#eee] pr-3">
          <div class="font-bold text-[#333] mb-3">摄像头列表</div>
          <div class="max-h-[330px] overflow-y-auto scrollbar-hide">
            <div
              v-for="camera in cameraLists"
              :key="camera.id"
              class="h-8 leading-8 px-2 cursor-pointer rounded transition-colors truncate"
              :class="[
                selectedCameraId === camera.id
                  ? 'text-[#409EFF] bg-[#ECF5FF]'
                  : 'text-[#333] hover:bg-[#f5f7fa]',
                camera.disabled && 'opacity-50 cursor-not-allowed',
              ]"
              :title="camera.cameraName"
              @click="onCameraChange(camera)"
            >
              {{ camera.cameraName }}
            </div>
          </div>
        </div>
        <!-- 右侧算法多选 -->
        <div class="flex-1 pl-8">
          <div class="font-bold text-[#333] mb-3">算法列表</div>
          <el-checkbox-group v-model="selectedAlgorithmIds" :disabled="isView">
            <el-checkbox
              v-for="alg in algorithmList"
              :key="alg.id"
              :label="alg.id"
              :disabled="isView || alg.disabled"
              class="block mb-2.5"
            >
              {{ alg.name }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
    </div>

    <!-- 已选择项 -->
    <div class="flex items-center pl-4">
      <div class="font-bold text-[#333]">已选择：</div>
      <div class="text-[#666] text-sm">
        <template v-if="displaySelectedAlgorithms.length">
          {{ displaySelectedAlgorithms.join("，") }}
        </template>
        <template v-else> 暂无 </template>
      </div>
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
::v-deep .el-dialog__body {
  padding-top: 10px;
}
</style>
