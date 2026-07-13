<script>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, ref } from "vue";
import {
  batchDeleteCamera,
  cameraList,
  deleteCamera,
  downloadCameraTemplate,
  exportCameraList,
  importCameraList,
} from "@/http/videoWarning/warning-api";
import flvjs from "@/utils/flv.min.js";
import { getAuthToken } from "@/utils/tab-session";
import OwnDeparmentTree from "@/views/common-ui/OwnDeparmentTree";

import AddCamera from "./components/addCamera.vue";
import { cameraListConfig } from "./config.js";

export default {
  name: "CameraList",
  components: {
    OwnDeparmentTree,
    AddCamera,
  },
  setup() {
    const vm = getCurrentInstance().proxy;
    const dialogVisible = ref(false);
    const total = ref(0);
    const form = ref({
      pageNum: 1,
      pageSize: 12,
    });
    const tableData = ref([]);
    const treeTable = ref(null);
    const addCameraRef = ref(null);
    const selectedList = ref([]);
    const editInfo = ref({});
    const isView = ref(false);
    const videoShow = ref(false);

    // 摄像头列表
    const { refetch, isLoading } = useQuery({
      queryKey: ["cameraList", form.value],
      queryFn: () => cameraList(form.value),
      keepPreviousData: true,
      onSuccess: ({ data }) => {
        const { result } = data;
        if (data.success) {
          tableData.value = result.list;
          total.value = result.total;
        }
      },
    });

    // 删除摄像头
    const { mutate: deleteCameraMutate } = useMutation({
      mutationFn: (id) => deleteCamera(id),
      onSuccess: ({ data }) => {
        if (data.success) {
          vm.$message.success("删除成功");
          refetch();
        }
      },
    });
    // 批量删除摄像头
    const { mutate: batchDeleteCameraMutate } = useMutation({
      mutationFn: (id) => batchDeleteCamera(id),
      onSuccess: ({ data }) => {
        if (data.success) {
          vm.$message.success("批量删除成功");
          refetch();
        }
      },
    });

    const onChange = (key, value) => {
      form.value[key] = value;
      refetch();
    };

    const onAddCamera = () => {
      addCameraRef.value.onOpen();
    };

    const treeNodeTap = (info) => {
      console.log(info, "info");
      form.value.departmentId = info.id;
      refetch();
    };
    const onEdit = (info) => {
      addCameraRef.value.onOpen(info);
      editInfo.value = info;
      isView.value = false;
    };

    const onView = (info) => {
      addCameraRef.value.onOpen(info);
      editInfo.value = info;
      isView.value = true;
    };

    const destroyFlvPlayer = () => {
      if (vm.flvPlay) {
        try {
          vm.flvPlay.pause();
          vm.flvPlay.unload();
          vm.flvPlay.detachMediaElement();
          vm.flvPlay.destroy();
        } catch (error) {
          console.error("销毁播放器时出错:", error);
        } finally {
          vm.flvPlay = null;
        }
      }
    };

    const openVideo = (info) => {
      if (!info.streamUrl) {
        vm.$message.warning("摄像头流地址为空");
        return;
      }

      videoShow.value = true;

      // 设置一个延时，等待DOM渲染
      setTimeout(() => {
        if (!flvjs.isSupported()) {
          console.error("FLV.js is not supported in this browser.");
          vm.$message.error("当前浏览器不支持视频播放");
          return;
        }

        try {
          // 销毁旧的播放器实例
          destroyFlvPlayer();

          vm.flvPlay = flvjs.createPlayer({
            url: info.streamUrl,
            type: "flv",
            autoPlay: true,
            isLive: true,
            bufferLength: 3,
            hasAudio: false, // 禁用音频解码，解决不支持的音频编解码器问题
          });

          vm.flvPlay.attachMediaElement(vm.$refs.videoElement);

          // 添加错误事件监听器 - 关键修复！
          vm.flvPlay.on(flvjs.Events.ERROR, (errorType, errorDetail) => {
            console.error("FLV播放器错误:", errorType, errorDetail);

            let errorMessage = "视频加载失败";

            if (errorType === flvjs.ErrorTypes.NETWORK_ERROR) {
              errorMessage = "网络错误：无法连接视频流";
            } else if (errorType === flvjs.ErrorTypes.MEDIA_ERROR) {
              errorMessage = "媒体错误：视频格式不支持或损坏";
            } else if (errorType === flvjs.ErrorTypes.OTHER_ERROR) {
              errorMessage = `播放错误：${errorDetail || "未知错误"}`;
            }

            vm.$message.error(errorMessage);
          });

          // 添加加载完成事件
          vm.flvPlay.on(flvjs.Events.LOADING_COMPLETE, () => {
            console.log("视频流加载完成");
          });

          vm.flvPlay.load();
          vm.flvPlay.play();
        } catch (error) {
          console.error("创建FLV播放器失败:", error);
          vm.$message.error(`视频播放器初始化失败：${error.message}`);
        }
      }, 200);
    };

    const closeVideo = () => {
      videoShow.value = false;
      destroyFlvPlayer();
    };

    const onDelete = (info) => {
      vm.$confirm("确定删除该摄像头吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        deleteCameraMutate({
          id: info.id,
        });
      });
    };

    const onSelect = (selection) => {
      selectedList.value = selection.map((item) => item.id);
    };

    const onBatchDelete = () => {
      vm.$confirm("确定删除所选摄像头吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        batchDeleteCameraMutate(selectedList.value);
      });
    };

    const depTree = ref(null);
    const onClear = () => {
      form.value.departmentId = "";
      form.value.cameraName = "";
      refetch();
      depTree.value.refreshTree();
    };

    const onSearch = () => {
      refetch();
    };

    const uploadLimit = {
      header: {
        Authorization: getAuthToken(),
        clientChannel: "WEB",
      },
      accept: [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ],
    };

    const onHandle = (type) => {
      if (type === "exportCameraList") {
        exportCameraList({ ...form.value, isPage: false });
      } else if (type === "downloadTemplate") {
        downloadCameraTemplate();
      }
    };

    const excelImport = (data) => {
      console.log(data);
      importCameraList(data.file).then((res) => {
        console.log("object", res);
        if (res.data.code === 200) {
          vm.$message.success("导入成功");
          refetch();
        } else {
          vm.$message.warning(res.data.message || "导入失败");
        }
      });
    };

    return {
      onView,
      openVideo,
      closeVideo,
      onChange,
      onHandle,
      excelImport,
      uploadLimit,
      dialogVisible,
      cameraListConfig,
      form,
      addCameraRef,
      total,
      tableData,
      isLoading,
      onClear,
      depTree,
      isView,
      videoShow,
      treeTable,
      editInfo,
      treeNodeTap,
      onEdit,
      onBatchDelete,
      onSelect,
      onAddCamera,
      onDelete,
      onSearch,
    };
  },
};
</script>

<template>
  <KyTreeTable ref="treeTable">
    <OwnDeparmentTree slot="tree" ref="depTree" @treeNodeTap="treeNodeTap" />

    <ECard slot="search" type="search">
      <div class="flex">
        <div class="mr-3 w-60">
          <el-input
            v-model="form.cameraName"
            placeholder="请输入摄像头名称"
            class="mr-2"
            clearable
            @change="onChange('cameraName', $event)"
          />
        </div>
        <EButton type="primary" size="mini" btnIcon="el-icon-search" @click="onSearch">
          搜索
        </EButton>
        <EButton
          type="default"
          size="mini"
          btnIcon="el-icon-refresh-right"
          @click="onClear"
        >
          重置
        </EButton>
      </div>
    </ECard>

    <ECard slot="table">
      <div class="flex card-cell">
        <EButton type="primary" btnIcon="el-icon-plus" plain @click="onAddCamera">
          新增摄像头
        </EButton>
        <EButton type="danger" plain btnIcon="el-icon-delete" @click="onBatchDelete">
          批量删除
        </EButton>
        <EButton
          type="primary"
          btnIcon="el-icon-download"
          @click="onHandle('exportCameraList')"
        >
          Excel导出
        </EButton>
        <EButton
          type="default"
          btnIcon="el-icon-document-add"
          plain
          @click="onHandle('downloadTemplate')"
        >
          下载模板
        </EButton>
        <el-upload
          ref="fileUpload"
          style="display: inline-flex; margin-left: 10px"
          action="#"
          :headers="uploadLimit.header"
          :limit="9999"
          :accept="uploadLimit.accept.toString()"
          :http-request="excelImport"
          :show-file-list="false"
        >
          <EButton type="success" btnIcon="el-icon-upload"> Excel导入 </EButton>
          <div slot="tip" class="ml-3 text-sm text-gray-400 el-upload__tip">
            只允许导入“xls”或“xlsx”格式文件！
          </div>
        </el-upload>
      </div>

      <CTable
        :list="cameraListConfig"
        selection
        :loading="isLoading"
        height="92%"
        :tableData="tableData"
        @select="onSelect"
      >
        <template #name="{ info }">
          <span class="text-primary">{{ info.cameraName }}</span>
        </template>

        <template #status="{ info }">
          <el-tag :type="info.cameraStatus === 'online' ? 'success' : 'danger'">
            {{ info.cameraStatus === "online" ? "在线" : "离线" }}
          </el-tag>
        </template>

        <template #operation="{ info }">
          <EButton type="text" icon="link" @click="openVideo(info)"> 预览 </EButton>
          <EButton type="text" icon="check" @click="onView(info)"> 查看 </EButton>
          <EButton type="text" icon="edit" @click="onEdit(info)"> 修改 </EButton>
          <EButton type="text" icon="delete" @click="onDelete(info)"> 删除 </EButton>
        </template>
      </CTable>
    </ECard>
    <!-- 分页 -->
    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
        :current-page.sync="form.pageNum"
        :page-sizes="[12, 24, 48]"
        :page-size.sync="form.pageSize"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        :background="true"
        @size-change="onChange('pageSize', $event)"
        @current-change="onChange('pageNum', $event)"
      />
    </ECard>

    <template #dialog>
      <AddCamera ref="addCameraRef" :info.sync="editInfo" :check.sync="isView" />

      <el-dialog
        class="normal-dialog"
        title="视频预览"
        :visible="videoShow"
        width="1200px"
        append-to-body
        :close-on-click-modal="false"
        @close="closeVideo"
      >
        <video
          ref="videoElement"
          controls
          crossorigin="anonymous"
          width="100%"
          height="100%"
        />
        <div style="height: 30px" />
      </el-dialog>
    </template>
  </KyTreeTable>
</template>
