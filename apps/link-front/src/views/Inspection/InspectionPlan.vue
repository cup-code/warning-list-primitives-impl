<script>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, onMounted, reactive, ref } from "vue";
import {
  getInspectionPlanList,
  addInspectionPlan,
  getInspectionPlanDetail,
  deleteInspectionPlan,
} from "@/http/inspection/inspection-items-api";
import InspectionPlanDialog from "./components/InspectionPlanDialog.vue";
import { InspectionPlanTableConfig } from "./config";
import CompanyTree from "@/views/common-ui/CompanyTree.vue";

export default {
  name: "InspectionPlan",
  components: {
    CompanyTree,
    InspectionPlanDialog,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单
    const searchForm = reactive({
      planName: "",
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
    const tableConfig = ref(InspectionPlanTableConfig);

    // 查询列表数据
    const { refetch, isPending } = useQuery({
      queryKey: ["inspectionPlanList", searchForm],
      queryFn: () => getInspectionPlanList(searchForm),
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

    // 删除巡检计划
    const { mutate: deleteMutate } = useMutation({
      mutationFn: (id) => deleteInspectionPlan(id),
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

    // 搜索
    const searchFn = () => {
      searchForm.pageNum = 1;
      refetch();
    };

    // 重置
    const resetFn = () => {
      searchForm.planName = "";
      searchForm.companyId = "";
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
        .$confirm(`确定要删除巡检计划"${row.planName}"吗？`, "提示", {
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
      treeNodeTap,
      searchFn,
      resetFn,
      handleAdd,
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
  <KyTreeTable ref="treeTable" :isShowLeft="true">
    <!-- 左侧树 -->
    <CompanyTree slot="tree" ref="companyTree" @treeNodeTap="treeNodeTap" />

    <!-- 搜索区域 -->
    <ECard slot="search" type="search" noneBottom>
      <el-form :model="searchForm" size="mini" inline>
        <el-form-item label="计划名称">
          <el-input
            v-model="searchForm.planName"
            placeholder="请输入计划名称查询"
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
      </div>

      <CTable :tableData="tableData" :loading="loading" :list="tableConfig" height="92%">
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
    <InspectionPlanDialog
      slot="dialog"
      :visible.sync="dialogVisible"
      :info="currentRow"
      :dialogType="dialogType"
      :companyId="searchForm.companyId"
      @close="handleDialogClose"
      @submit="handleDialogSubmit"
    />
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.text-red-500 {
  color: #f56c6c !important;
}

::v-deep .el-pagination {
  text-align: right;
}
</style>
