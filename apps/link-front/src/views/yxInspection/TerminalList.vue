<script>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, onMounted, reactive, ref } from "vue";
import { TerminalTableConfig } from "./config";
import TerminalDialog from "./components/TerminalDialog.vue";
import {
  queryTerminal,
  saveOrUpdateTerminal,
  deleteTerminal,
} from "@/http/inspection/yx-inspection-api";

export default {
  name: "TerminalList",
  components: { TerminalDialog },
  setup() {
    const { proxy } = getCurrentInstance();

    const searchForm = reactive({
      serialNumber: "",
      productModel: "",
      pageNum: 1,
      pageSize: 10,
    });

    const tableData = ref([]);
    const loading = ref(false);
    const total = ref(0);
    const tableConfig = ref(TerminalTableConfig);

    const dialogVisible = ref(false);
    const dialogType = ref("add");
    const currentRow = ref({});
    const selectedRows = ref([]);

    const { refetch, isPending } = useQuery({
      queryKey: ["terminalList", searchForm],
      queryFn: () => queryTerminal(searchForm),
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          const list = (result.list || []).map((item, index) => ({
            ...item,
            index: (searchForm.pageNum - 1) * searchForm.pageSize + index + 1,
          }));
          tableData.value = list;
          total.value = result.total || 0;
        }
      },
    });

    loading.value = isPending;

    const { mutate: deleteMutate } = useMutation({
      mutationFn: (id) => deleteTerminal(id),
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

    const { mutate: saveMutate, isLoading: isSaving } = useMutation({
      mutationFn: (data) => saveOrUpdateTerminal(data),
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

    const searchFn = () => {
      searchForm.pageNum = 1;
      refetch();
    };

    const resetFn = () => {
      searchForm.serialNumber = "";
      searchForm.productModel = "";
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      refetch();
    };

    const handleAdd = () => {
      dialogType.value = "add";
      currentRow.value = {};
      dialogVisible.value = true;
    };

    const handleEdit = (row) => {
      dialogType.value = "edit";
      currentRow.value = { ...row };
      dialogVisible.value = true;
    };

    const handleView = (row) => {
      dialogType.value = "view";
      currentRow.value = { ...row };
      dialogVisible.value = true;
    };

    const handleDelete = (row) => {
      proxy
        .$confirm("确定要删除该终端设备吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          deleteMutate(row.id);
        })
        .catch(() => {});
    };

    const handleBatchDelete = () => {
      if (selectedRows.value.length === 0) {
        proxy.$message.warning("请选择要删除的数据");
        return;
      }
      proxy
        .$confirm(`确定要删除选中的 ${selectedRows.value.length} 条数据吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(async () => {
          const promises = selectedRows.value.map((row) => deleteTerminal(row.id));
          try {
            await Promise.all(promises);
            proxy.$message.success("批量删除成功");
            selectedRows.value = [];
            refetch();
          } catch {
            proxy.$message.error("部分删除失败，请重试");
            refetch();
          }
        })
        .catch(() => {});
    };

    const handleDialogClose = () => {
      dialogVisible.value = false;
      currentRow.value = {};
    };

    const handleDialogSubmit = (formData) => {
      saveMutate(formData);
    };

    const pageSizeFn = (size) => {
      searchForm.pageSize = size;
      searchForm.pageNum = 1;
      refetch();
    };

    const pageCurFn = (num) => {
      searchForm.pageNum = num;
      refetch();
    };

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
      selectedRows,
      searchFn,
      resetFn,
      handleAdd,
      handleEdit,
      handleView,
      handleDelete,
      handleBatchDelete,
      handleDialogClose,
      handleDialogSubmit,
      pageSizeFn,
      pageCurFn,
    };
  },
};
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="false" class="h-full">
    <!-- 搜索区域 -->
    <ECard slot="search" type="search" noneBottom>
      <el-form :model="searchForm" size="mini" inline>
        <el-form-item label="序列号">
          <el-input
            v-model="searchForm.serialNumber"
            placeholder="请输入序列号"
            class="w-52"
            clearable
            @keyup.enter.native="searchFn"
          />
        </el-form-item>
        <el-form-item label="产品型号">
          <el-select
            v-model="searchForm.productModel"
            placeholder="请选择产品型号"
            class="w-52"
            clearable
          >
            <el-option
              v-for="item in $dictUtils.getDictList('YIXUN_produType') || []"
              :key="item.dictCode"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="searchFn">
            查询
          </el-button>
          <el-button icon="el-icon-refresh-right" @click="resetFn">重置</el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <!-- 表格区域 -->
    <ECard slot="table">
      <div class="mb-4">
        <EButton type="primary" btnIcon="el-icon-plus" class="mr-2" @click="handleAdd">
          新增
        </EButton>
      </div>

      <CTable :tableData="tableData" :loading="loading" :list="tableConfig" height="92%">
        <template #productModel="{ info }">
          <span>{{
            ($dictUtils &&
              $dictUtils.getDictLabel("YIXUN_produType", info.productModel)) ||
            info.productModel
          }}</span>
        </template>
        <template #operation="{ info }">
          <EButton type="text" @click="handleView(info)">查看</EButton>
          <EButton type="text" @click="handleEdit(info)">编辑</EButton>
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
    <TerminalDialog
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
