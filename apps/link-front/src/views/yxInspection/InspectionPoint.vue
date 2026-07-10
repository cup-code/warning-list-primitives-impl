<script>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, reactive, ref } from "vue";
import EImportFile from "@/components/EComponents/EImportFile/index.vue";
import {
  deleteInspectionPlace,
  exportInspectionPlace,
  getInspectionPlaceDetailById,
  getPlaceAndContentTemplate,
  importPlaceAndContent,
  queryInspectionPlaceByPage,
} from "@/http/inspection/yx-inspection-api";
import CompanyTree from "@/views/common-ui/CompanyTree.vue";
import InspectionPointDialog from "./components/InspectionPointDialog.vue";
import QrcodePrintDialog from "./components/QrcodePrintDialog.vue";
import { InspectionPointTableConfig } from "./config";

export default {
  name: "InspectionPoint",
  components: {
    CompanyTree,
    InspectionPointDialog,
    QrcodePrintDialog,
    EImportFile,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单
    const searchForm = reactive({
      fuzzyQuery: "",
      departmentId: "",
      pageNum: 1,
      pageSize: 10,
    });

    // 表格数据
    const tableData = ref([]);
    const loading = ref(false);
    const total = ref(0);

    // 弹窗相关
    const dialogVisible = ref(false);
    const dialogType = ref("add");
    const currentRow = ref({});

    // 表格配置
    const tableConfig = ref(InspectionPointTableConfig);

    // 打印相关
    const printList = ref([]);
    const printDialogVisible = ref(false);

    // 导出相关
    const exportLoading = ref(false);

    // 打印二维码（单条）
    const handlePrintQr = (row) => {
      printList.value = [row];
      printDialogVisible.value = true;
    };

    // 批量打印
    const handleBatchPrint = () => {
      if (!tableData.value?.length) {
        proxy.$message.warning("暂无数据可打印");
        return;
      }
      printList.value = [...tableData.value];
      printDialogVisible.value = true;
    };

    // 关闭打印弹窗
    const handlePrintDialogClose = () => {
      printDialogVisible.value = false;
    };

    // 导出巡检点数据
    const handleExport = async () => {
      // 空数据检查
      if (!tableData.value?.length) {
        proxy.$message.warning("暂无数据可导出");
        return;
      }

      exportLoading.value = true;
      try {
        const res = await exportInspectionPlace({
          pageNum: searchForm.pageNum,
          pageSize: searchForm.pageSize,
          fuzzyQuery: searchForm.fuzzyQuery,
        });

        // 处理 blob 响应并触发下载
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `巡检点数据_${Date.now()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);

        proxy.$message.success("导出成功");
      } catch (error) {
        proxy.$message.error("导出失败");
      } finally {
        exportLoading.value = false;
      }
    };

    // 查询列表数据
    const { refetch, isPending } = useQuery({
      queryKey: ["inspectionPointList", searchForm],
      queryFn: () => queryInspectionPlaceByPage(searchForm),
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          const list = (result.list || []).map((item, index) => ({
            ...item,
            index: (searchForm.pageNum - 1) * searchForm.pageSize + index + 1,
            pointCode: item.placeCode,
            pointName: item.placeName,
            createTime: item.createdTime,
            creator: item.creatorName,
          }));
          tableData.value = list;
          total.value = result.total || 0;
        }
      },
    });

    // 监听 loading 状态
    loading.value = isPending;

    // 删除巡检点
    const { mutate: deleteMutate } = useMutation({
      mutationFn: (id) => deleteInspectionPlace(id),
      onSuccess: (res) => {
        if (res.data?.success) {
          proxy.$message.success("删除成功");
          refetch();
        } else {
          proxy.$message.error(res.data?.message || "删除失败");
        }
      },
      onError: () => {
        proxy.$message.error("删除失败");
      },
    });

    // 下载导入模板
    const downloadingTpl = ref(false);
    const handleDownloadTemplate = async () => {
      downloadingTpl.value = true;
      try {
        const res = await getPlaceAndContentTemplate();
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `巡检点导入模板_${Date.now()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        proxy.$message.success("下载成功");
      } catch (error) {
        proxy.$message.error("下载失败，请重试");
      } finally {
        downloadingTpl.value = false;
      }
    };

    // 批量导入巡检点与巡检项
    const importing = ref(false);
    const handleImportData = async (uploadObj) => {
      importing.value = true;
      try {
        const res = await importPlaceAndContent(uploadObj.file);
        if (res.data?.success) {
          proxy.$message.success("导入成功");
          refetch();
        } else {
          proxy.$message.error(res.data?.message || "导入失败");
        }
      } catch (error) {
        proxy.$message.error("导入失败，请重试");
      } finally {
        importing.value = false;
      }
    };

    // 搜索
    const searchFn = () => {
      searchForm.pageNum = 1;
      refetch();
    };

    // 重置
    const resetFn = () => {
      searchForm.fuzzyQuery = "";
      searchForm.departmentId = "";
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      refetch();
    };

    // 左侧树节点点击
    const treeNodeTap = (data) => {
      if (data) {
        searchForm.departmentId = data.id;
      } else {
        searchForm.departmentId = "";
      }
      searchFn();
    };

    // 新增
    const handleAdd = () => {
      dialogType.value = "add";
      currentRow.value = {};
      dialogVisible.value = true;
    };

    // 转换详情数据格式（API -> 弹窗表单）
    const transformDetailData = (data) => {
      // pointOnMapInfo 接口为数组，元素为 { x, y, z }（与 lng/lat 兼容）
      let geoInfoStr = "";
      let poi = data.pointOnMapInfo;
      if (Array.isArray(poi) && poi.length > 0) {
        poi = poi[0];
      }
      if (poi && typeof poi === "object") {
        const lon = poi.x ?? poi.longitude ?? poi.lng;
        const lat = poi.y ?? poi.latitude ?? poi.lat;
        if (lon != null && lat != null && lon !== "" && lat !== "") {
          geoInfoStr = JSON.stringify({
            longitude: Number(lon),
            latitude: Number(lat),
            cityName: poi.cityName || poi.address || "",
          });
        }
      }
      if (!geoInfoStr && data.geoInfo) {
        if (typeof data.geoInfo === "string" && data.geoInfo.trim()) {
          geoInfoStr = data.geoInfo;
        } else if (typeof data.geoInfo === "object") {
          geoInfoStr = JSON.stringify(data.geoInfo);
        }
      }
      return {
        id: data.id,
        pointName: data.placeName ?? "",
        pointCode: data.placeCode ?? "",
        needCheckIn: data.needMark ? "是" : "否",
        requirePhoto: data.needPhoto ? "是" : "否",
        needAllContentDone: data.needAllContentDone ? "是" : "否",
        contentDefaultNormal: data.contentDefaultNormal ? "是" : "否",
        position: data.placePosition ?? "",
        remarks: data.attention ?? "",
        alarmMinutes: data.alarmMinutes ?? 30,
        geoInfo: geoInfoStr,
        qrcodeImage: data.qrcodeImage ?? "",
        contentList: (data.contentList || []).map((item, idx) => ({
          id: item.id,
          contentId: item.id,
          category: item.contentCategory ?? "",
          itemName: item.contentName ?? "",
          standard: item.inspectionBenchmark ?? "",
          sortOrder: idx + 1,
        })),
      };
    };

    // 编辑
    const handleEdit = async (row) => {
      try {
        const res = await getInspectionPlaceDetailById(row.id);
        if (res.data?.success) {
          dialogType.value = "edit";
          currentRow.value = transformDetailData(res.data.result);
          dialogVisible.value = true;
        } else {
          proxy.$message.error(res.data?.message || "获取巡检点详情失败");
        }
      } catch (error) {
        proxy.$message.error("获取巡检点详情失败");
      }
    };

    // 查看
    const handleView = async (row) => {
      try {
        const res = await getInspectionPlaceDetailById(row.id);
        if (res.data?.success) {
          dialogType.value = "view";
          currentRow.value = transformDetailData(res.data.result);
          dialogVisible.value = true;
        } else {
          proxy.$message.error(res.data?.message || "获取巡检点详情失败");
        }
      } catch (error) {
        proxy.$message.error("获取巡检点详情失败");
      }
    };

    // 删除
    const handleDelete = (row) => {
      proxy
        .$confirm(`确定要删除巡检点"${row.pointName}"吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          deleteMutate(row.id);
        })
        .catch(() => {});
    };

    // 弹窗关闭
    const handleDialogClose = () => {
      dialogVisible.value = false;
      currentRow.value = {};
    };

    // 弹窗提交成功
    const handleDialogSubmit = () => {
      refetch();
    };

    // 分页大小改变
    const pageSizeFn = (size) => {
      searchForm.pageSize = size;
      searchForm.pageNum = 1;
      refetch();
    };

    // 当前页改变
    const pageCurFn = (num) => {
      searchForm.pageNum = num;
      refetch();
    };

    return {
      searchForm,
      tableData,
      loading,
      total,
      tableConfig,
      dialogVisible,
      dialogType,
      currentRow,
      printList,
      printDialogVisible,
      exportLoading,
      treeNodeTap,
      searchFn,
      resetFn,
      handleAdd,
      handleEdit,
      handleView,
      handleDelete,
      handleDialogClose,
      handleDialogSubmit,
      handlePrintQr,
      handleBatchPrint,
      handlePrintDialogClose,
      handleExport,
      downloadingTpl,
      importing,
      handleDownloadTemplate,
      handleImportData,
      pageSizeFn,
      pageCurFn,
    };
  },
};
</script>

<template>
  <div class="inspection-point-page">
    <KyTreeTable ref="treeTable" :isShowLeft="false" class="h-full">
      <!-- 左侧组织架构树
    <CompanyTree slot="tree" ref="companyTree" @treeNodeTap="treeNodeTap" /> -->

      <!-- 搜索区域 -->
      <ECard slot="search" type="search" noneBottom>
        <el-form :model="searchForm" size="mini" inline>
          <el-form-item label="巡检点">
            <el-input
              v-model="searchForm.fuzzyQuery"
              placeholder="请输入巡检点名称/编号"
              class="w-52"
              clearable
              @keyup.enter.native="searchFn"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="searchFn">
              查询
            </el-button>
            <el-button icon="el-icon-refresh-right" @click="resetFn"> 重置 </el-button>
          </el-form-item>
        </el-form>
      </ECard>

      <!-- 表格区域 -->
      <ECard slot="table">
        <!-- 新增、导出、下载导入模版、导入数据、批量打印 -->
        <div class="mb-4">
          <EButton type="primary" btnIcon="el-icon-plus" class="mr-2" @click="handleAdd">
            新增
          </EButton>
          <EButton
            type="primary"
            btnIcon="el-icon-download"
            class="mr-2"
            :loading="exportLoading"
            @click="handleExport"
          >
            导出打印
          </EButton>
          <EButton
            type="default"
            btnIcon="el-icon-download"
            class="mr-2"
            :loading="downloadingTpl"
            @click="handleDownloadTemplate"
          >
            下载导入模版
          </EButton>
          <EImportFile class="mr-2" @excelImport="handleImportData">
            <EButton type="success" btnIcon="el-icon-upload2" :loading="importing">
              导入数据
            </EButton>
          </EImportFile>
          <EButton
            type="primary"
            class="ml-2"
            btnIcon="el-icon-printer"
            @click="handleBatchPrint"
          >
            批量打印
          </EButton>
        </div>

        <CTable
          :tableData="tableData"
          :loading="loading"
          :list="tableConfig"
          height="92%"
        >
          <!-- 操作列 -->
          <template #operation="{ info }">
            <EButton type="text" @click="handleView(info)"> 查看 </EButton>
            <EButton type="text" @click="handleEdit(info)"> 修改 </EButton>
            <EButton type="text" class="text-red-500" @click="handleDelete(info)">
              删除
            </EButton>
            <EButton type="text" @click="handlePrintQr(info)"> 打印二维码 </EButton>
          </template>
        </CTable>
      </ECard>

      <!-- 分页区域 -->
      <ECard slot="page" type="footer">
        <el-pagination
          class="text-right"
          :current-page.sync="searchForm.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size.sync="searchForm.pageSize"
          layout="total, prev, pager, next, jumper, sizes"
          :total="total"
          background
          @size-change="pageSizeFn"
          @current-change="pageCurFn"
        />
      </ECard>

      <!-- 新增/编辑/查看弹窗 -->
      <InspectionPointDialog
        slot="dialog"
        :visible.sync="dialogVisible"
        :info="currentRow"
        :dialogType="dialogType"
        @close="handleDialogClose"
        @submit="handleDialogSubmit"
      />
    </KyTreeTable>

    <!-- 打印预览弹窗 -->
    <QrcodePrintDialog
      :visible.sync="printDialogVisible"
      :printList="printList"
      @close="handlePrintDialogClose"
    />
  </div>
</template>

<style lang="scss" scoped>
.text-red-500 {
  color: #f56c6c !important;
}

::v-deep .el-pagination {
  text-align: right;
}
</style>
