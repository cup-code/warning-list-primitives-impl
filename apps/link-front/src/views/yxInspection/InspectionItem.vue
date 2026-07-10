<script>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, onMounted, reactive, ref } from "vue";
import { InspectionItemTableConfig } from "./config";
import InspectionItemDialog from "./components/InspectionItemDialog.vue";
import CategoryTree from "./components/CategoryTree.vue";
import EImportFile from "@/components/EComponents/EImportFile/index.vue";
import {
  getPageContent,
  deleteYxInspectionContent,
  saveYxInspectionContent,
  getContentTemplate,
  importContent,
} from "@/http/inspection/yx-inspection-api";

export default {
  name: "InspectionItem",
  components: {
    CategoryTree,
    InspectionItemDialog,
    EImportFile,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单
    const searchForm = reactive({
      contentName: "",
      inspectionBenchmark: "",
      contentCategory: "",
      pageNum: 1,
      pageSize: 10,
    });

    // 表格数据
    const tableData = ref([]);
    const loading = ref(false);
    const total = ref(0);

    // 弹窗相关
    const dialogVisible = ref(false);
    const dialogType = ref("add"); // add-新增, edit-编辑, view-查看
    const currentRow = ref({});

    // 表格配置
    const tableConfig = ref(InspectionItemTableConfig);

    // 查询列表数据
    const { refetch, isPending } = useQuery({
      queryKey: ["inspectionItemList", searchForm],
      queryFn: () => getPageContent(searchForm),
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          const list = (result.list || []).map((item, index) => ({
            ...item,
            index: (searchForm.pageNum - 1) * searchForm.pageSize + index + 1,
            itemName: item.contentName,
            standard: item.inspectionBenchmark,
            category: item.contentCategory,
          }));
          tableData.value = list;
          total.value = result.total || 0;
        }
      },
    });

    // 监听 loading 状态
    loading.value = isPending;

    // 删除巡检项
    const { mutate: deleteMutate } = useMutation({
      mutationFn: (id) => deleteYxInspectionContent(id),
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

    // 保存巡检项
    const { mutate: saveMutate, isLoading: isSaving } = useMutation({
      mutationFn: (data) => saveYxInspectionContent(data),
      onSuccess: (res) => {
        if (res.data?.success) {
          proxy.$message.success(dialogType.value === "add" ? "新增成功" : "编辑成功");
          handleDialogClose();
          refetch();
        } else {
          proxy.$message.error(res.data?.message || "保存失败");
        }
      },
      onError: () => {
        proxy.$message.error("保存失败");
      },
    });

    // 搜索
    const searchFn = () => {
      searchForm.pageNum = 1;
      refetch();
    };

    // 重置
    const resetFn = () => {
      searchForm.contentName = "";
      searchForm.inspectionBenchmark = "";
      searchForm.contentCategory = "";
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      refetch();
    };

    // 左侧分类树节点点击
    const treeNodeTap = (data) => {
      console.log(data, "data");
      if (data) {
        searchForm.contentCategory = data.id;
      } else {
        searchForm.contentCategory = "";
      }
      searchFn();
    };

    // 新增
    const handleAdd = () => {
      dialogType.value = "add";
      currentRow.value = {};
      dialogVisible.value = true;
    };

    // 下载模板
    const downloading = ref(false);
    const handleDownloadTemplate = () => {
      downloading.value = true;
      getContentTemplate()
        .then((res) => {
          const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `巡检项导入模板_${new Date().getTime()}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
          proxy.$message.success("下载成功");
        })
        .catch(() => {
          proxy.$message.error("下载失败，请重试");
        })
        .finally(() => {
          downloading.value = false;
        });
    };

    // 批量导入
    const importing = ref(false);
    const handleImportContent = (uploadObj) => {
      importing.value = true;
      importContent(uploadObj.file)
        .then((res) => {
          if (res.data.success) {
            proxy.$message.success("导入成功");
            refetch();
          } else {
            proxy.$message.error(res.data.message || "导入失败");
          }
        })
        .catch(() => {
          proxy.$message.error("导入失败，请重试");
        })
        .finally(() => {
          importing.value = false;
        });
    };

    // 编辑
    const handleEdit = (row) => {
      dialogType.value = "edit";
      currentRow.value = { ...row };
      dialogVisible.value = true;
    };

    // 查看
    const handleView = (row) => {
      dialogType.value = "view";
      currentRow.value = { ...row };
      dialogVisible.value = true;
    };

    // 删除
    const handleDelete = (row) => {
      proxy
        .$confirm(`确定要删除巡检项"${row.itemName}"吗？`, "提示", {
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
    const handleDialogSubmit = (formData) => {
      // 弹窗已完成数据转换，直接使用
      saveMutate(formData);
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

    // 初始化加载
    onMounted(() => {
      refetch();
    });

    return {
      searchForm,
      tableData,
      loading,
      total,
      tableConfig,
      dialogVisible,
      dialogType,
      currentRow,
      isSaving,
      downloading,
      importing,
      treeNodeTap,
      searchFn,
      resetFn,
      handleAdd,
      handleDownloadTemplate,
      handleImportContent,
      handleEdit,
      handleView,
      handleDelete,
      handleDialogClose,
      handleDialogSubmit,
      pageSizeFn,
      pageCurFn,
    };
  },
};
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="true" class="h-full">
    <!-- 左侧分类树 -->
    <CategoryTree slot="tree" ref="categoryTree" @treeNodeTap="treeNodeTap" />

    <!-- 搜索区域 -->
    <ECard slot="search" type="search" noneBottom>
      <el-form :model="searchForm" size="mini" inline>
        <el-form-item label="巡检项">
          <el-input
            v-model="searchForm.contentName"
            placeholder="请输入巡检项名称"
            class="w-52"
            clearable
            @keyup.enter.native="searchFn"
          />
        </el-form-item>
        <el-form-item label="巡检标准">
          <el-input
            v-model="searchForm.inspectionBenchmark"
            placeholder="请输入巡检标准"
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
      <div class="mb-4">
        <EButton type="primary" btnIcon="el-icon-plus" class="mr-2" @click="handleAdd">
          新增
        </EButton>
        <EButton
          plain
          btnIcon="el-icon-download"
          class="mr-2"
          :loading="downloading"
          @click="handleDownloadTemplate"
        >
          下载模板
        </EButton>
        <EImportFile @excelImport="handleImportContent">
          <EButton plain btnIcon="el-icon-upload2" :loading="importing">
            批量导入
          </EButton>
        </EImportFile>
      </div>

      <CTable :tableData="tableData" :loading="loading" :list="tableConfig" height="92%">
        <!-- 类别列 -->
        <template #contentCategory="{ info }">
          <span>{{
            $dictUtils.getDictLabel("inspectionCategory", info.contentCategory)
          }}</span>
        </template>
        <!-- 操作列 -->
        <template #operation="{ info }">
          <EButton type="text" @click="handleView(info)"> 查看 </EButton>
          <EButton type="text" @click="handleEdit(info)"> 编辑 </EButton>
          <EButton type="text" class="text-red-500" @click="handleDelete(info)">
            删除
          </EButton>
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
    <InspectionItemDialog
      slot="dialog"
      :visible.sync="dialogVisible"
      :info="currentRow"
      :dialogType="dialogType"
      :loading="isSaving"
      @close="handleDialogClose"
      @submit="handleDialogSubmit"
    />
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.text-red-500 {
  color: #f56c6c !important;
}
::v-deep .el-card__header {
  background: #ffffff !important;
}
::v-deep .el-pagination {
  text-align: right;
}
</style>
