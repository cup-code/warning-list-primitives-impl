<script>
import { getInspectionItemsList } from "@/http/inspection/inspection-items-api";
import { machineList, robotDevicePageList } from "@/http/machineManage/index";
import { getGroupByPage } from "@/http/dev/pointGroup-api.js";

import { computed, getCurrentInstance, ref, watch } from "vue";
import { useQuery } from "@tanstack/vue-query";

export default {
  name: "ItemsDialog",
  props: {
    itemsDialogVisible: { type: Boolean, default: false },
    dialogType: { type: String, default: "" }, // 1/2/3/4
    openType: { type: String, default: "" },
    inspectionItems: { type: String, default: "" },
  },
  setup(props, { emit }) {
    const { proxy } = getCurrentInstance();

    const radio = ref("");
    const list = ref([]);
    const dialogTitle = computed(() => {
      return `绑定${
        proxy.$dictUtils
          .getDictList("videoInspectType")
          .find((item) => item.dictCode === props.dialogType)?.dictName || ""
      }`;
    });

    const listLabel = computed(() => {
      return `${
        proxy.$dictUtils
          .getDictList("videoInspectType")
          .find((item) => item.dictCode === props.dialogType)?.dictName || ""
      }列表`;
    });

    const comStatus = computed(() => props.openType !== "view");

    // 合并监听：当弹窗打开或 inspectionItems 变化时，同步 radio 值
    watch(
      [() => props.itemsDialogVisible, () => props.inspectionItems],
      ([isVisible, inspectionItems]) => {
        if (isVisible && inspectionItems) {
          radio.value = inspectionItems;
        }
      },
      { immediate: true }
    );

    const { refetch: refetchMachineList } = useQuery({
      queryKey: ["machineList"],
      queryFn: () => machineList({ pageNum: 1, pageSize: 10, isPage: false }),
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          list.value = result.list.map((item) => ({
            id: item.deviceCode,
            name: item.deviceName,
          }));
        }
      },
    });

    const { refetch: refetchRobotDeviceList } = useQuery({
      queryKey: ["robotDeviceList"],
      queryFn: () => robotDevicePageList({ pageNum: 1, pageSize: 10, isPage: false }),
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          list.value = result.list.map((item) => ({
            id: item.robotCode,
            name: item.robotName,
          }));
        }
      },
    });

    // 查询列表数据
    const { refetch } = useQuery({
      queryKey: ["inspectionItemsList"],
      queryFn: () => getInspectionItemsList({ pageNum: 1, pageSize: 10, isPage: false }),
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          list.value = result.list.map((item) => ({
            id: item.id,
            name: item.cameraName,
          }));
        }
      },
    });

    const { refetch: refetchGroupList } = useQuery({
      queryKey: ["groupList"],
      queryFn: () => getGroupByPage({ pageNum: 1, pageSize: 10, isPage: false }),
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          list.value = result.list.map((item) => ({
            id: item.id,
            name: item.groupName,
          }));
        }
      },
    });

    watch(
      () => props.dialogType,
      (newVal) => {
        if (newVal === "rondsDevice") {
          refetchMachineList();
        } else if (newVal === "robotDevice") {
          refetchRobotDeviceList();
        } else if (newVal === "videoCamera") {
          refetch();
        } else if (newVal === "nonProcess") {
          refetchGroupList();
        }
      },
      { immediate: true }
    );

    const handleClose = () => {
      if (document.activeElement) {
        document.activeElement.blur();
      }
      emit("update:itemsDialogVisible", false);
    };
    const handleSubmit = () => {
      const selectedItem = list.value.find((item) => item.name === radio.value);
      emit("submit", selectedItem);
      handleClose();
    };

    return {
      dialogTitle,
      listLabel,
      list,
      radio,
      handleClose,
      comStatus,
      handleSubmit,
    };
  },
};
</script>

<template>
  <el-dialog
    :title="dialogTitle"
    :visible="itemsDialogVisible"
    width="700px"
    :close-on-click-modal="false"
    destroy-on-close
    append-to-body
    @close="handleClose"
  >
    <div class="flex items-start ml-40 pt-5">
      <div class="text-sm font-bold mb-5 text-black">{{ listLabel }}:</div>

      <div class="h-[200px] overflow-y-auto scrollbar-hide">
        <el-radio-group v-model="radio" :disabled="!comStatus">
          <el-radio
            v-for="item in list"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          >
            {{ item.name }}
          </el-radio>
        </el-radio-group>
      </div>
    </div>

    <div slot="footer" class="flex w-full items-center justify-end">
      <EButton @click="handleClose"> 取消 </EButton>
      <EButton type="primary" @click="handleSubmit"> 确定 </EButton>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
::v-deep .el-radio-group {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 20px;
  .el-radio {
    height: 20px;
    line-height: 20px;
    margin-right: 0 !important;
    margin-bottom: 10px !important;
  }
}
</style>
