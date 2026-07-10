<script>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, onMounted, reactive, ref } from "vue";
import {
  deleteInspectionPoint,
  exportInspectionPointList,
  getInspectionPointList,
} from "@/http/inspection/inspection-point-api";
import CompanyTree from "@/views/common-ui/CompanyTree.vue";
import InspectionPointDialog from "./components/InspectionPointDialog.vue";
import { InspectionPointTableConfig } from "./config";

export default {
  name: "InspectionPoint",
  components: {
    CompanyTree,
    InspectionPointDialog,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单
    const searchForm = reactive({
      placeName: "",
      companyId: "",
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
    const tableConfig = ref(InspectionPointTableConfig);

    // 查询列表数据
    const { refetch, isPending } = useQuery({
      queryKey: ["inspectionPointList", searchForm],
      queryFn: () => getInspectionPointList(searchForm),
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          // 添加序号
          const list = (result.list || []).map((item, index) => ({
            ...item,
            index: (searchForm.pageNum - 1) * searchForm.pageSize + index + 1,
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
      mutationFn: (id) => deleteInspectionPoint(id),
      onSuccess: (res) => {
        if (res.data.success) {
          proxy.$message.success("删除成功");
          refetch();
        } else {
          proxy.$message.error(res.data.message || "删除失败");
        }
      },
      onError: () => {
        proxy.$message.error("删除失败");
      },
    });

    // 搜索
    const searchFn = () => {
      searchForm.pageNum = 1;
      refetch();
    };

    // 重置
    const resetFn = () => {
      searchForm.placeName = "";
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      refetch();
    };

    // 左侧树节点点击
    const treeNodeTap = (data) => {
      if (data) {
        searchForm.companyId = data.id;
      } else {
        searchForm.companyId = "";
      }
      searchFn();
    };

    // 新增
    const handleAdd = () => {
      dialogType.value = "add";
      currentRow.value = {};
      dialogVisible.value = true;
    };

    // 导出
    const handleExport = () => {
      proxy.$message.info("正在导出...");
      exportInspectionPointList(searchForm)
        .then((res) => {
          const blob = new Blob([res.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `巡检点列表_${new Date().getTime()}.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
          proxy.$message.success("导出成功");
        })
        .catch(() => {
          proxy.$message.error("导出失败");
        });
    };

    // 查看
    const handleView = (row) => {
      dialogType.value = "view";
      currentRow.value = { ...row };
      dialogVisible.value = true;
    };

    // 编辑
    const handleEdit = (row) => {
      dialogType.value = "edit";
      currentRow.value = { ...row };
      dialogVisible.value = true;
    };

    // 删除
    const handleDelete = (row) => {
      proxy
        .$confirm(`确定要删除巡检点"${row.placeName}"吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          deleteMutate(row.id);
        })
        .catch(() => {
          // 取消删除
        });
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

    // 生命周期
    onMounted(() => {
      // refetch()
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
      treeNodeTap,
      searchFn,
      resetFn,
      handleAdd,
      handleExport,
      handleView,
      handleEdit,
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
  <KyTreeTable ref="treeTable" :isShowLeft="true">
    <!-- 左侧组织机构树 -->
    <CompanyTree slot="tree" title="组织机构" @treeNodeTap="treeNodeTap" />

    <!-- 搜索区域 -->
    <ECard slot="search" type="search" noneBottom>
      <el-form :model="searchForm" size="mini" inline>
        <el-form-item label="巡检点名称">
          <el-input
            v-model="searchForm.placeName"
            placeholder="请输入巡检点名称查询"
            style="width: 200px"
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
        <EButton plain btnIcon="el-icon-download" @click="handleExport"> 导出 </EButton>
      </div>

      <CTable :tableData="tableData" :loading="loading" :list="tableConfig" height="92%">
        <template #inspectItems="{ info }">
          <div>
            {{
              info.inspectItems && info.inspectItems.length
                ? info.inspectItems.map((s) => s.itemName).join("，")
                : "-"
            }}
          </div>
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
        style="text-align: right"
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
</template>

<style lang="scss" scoped>
.text-red-500 {
  color: #f56c6c !important;
}
</style>
