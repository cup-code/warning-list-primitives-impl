<script>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, reactive, ref } from "vue";
import { InspectionRouteTableConfig } from "./config";
import InspectionRouteDialog from "./components/InspectionRouteDialog.vue";
import SelectInspectionPointDialog from "./components/SelectInspectionPointDialog.vue";
import { queryLine, deleteLine, getLineById } from "@/http/inspection/yx-inspection-api";

export default {
  name: "InspectionRoute",
  components: {
    InspectionRouteDialog,
    SelectInspectionPointDialog,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单（与原型图一致：路线名称、创建人）
    const searchForm = reactive({
      lineName: "",
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

    // 巡检点选择弹窗
    const selectPointVisible = ref(false);

    // 弹窗组件引用
    const routeDialogRef = ref(null);

    // 表格配置
    const tableConfig = ref(InspectionRouteTableConfig);

    // 查询列表数据
    const { refetch, isPending } = useQuery({
      queryKey: ["inspectionRouteList", searchForm],
      queryFn: () => queryLine(searchForm),
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          const list = (result.list || []).map((item, index) => ({
            ...item,
            index: (searchForm.pageNum - 1) * searchForm.pageSize + index + 1,
            routeName: item.lineName,
            contactPhone: item.contactPhone,
            createTime: item.createdTime,
            personInCharge: item.directorName,
          }));
          tableData.value = list;
          total.value = result.total || 0;
        }
      },
    });

    // 监听 loading 状态
    loading.value = isPending;

    // 删除巡检路线
    const { mutate: deleteMutate } = useMutation({
      mutationFn: (id) => deleteLine(id),
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
      searchForm.lineName = "";
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      refetch();
    };

    // 新增
    const handleAdd = () => {
      dialogType.value = "add";
      currentRow.value = {};
      dialogVisible.value = true;
    };

    // 编辑
    const handleEdit = async (row) => {
      dialogType.value = "edit";
      try {
        const res = await getLineById(row.id);
        if (res.data?.success) {
          currentRow.value = res.data.result || {};
          dialogVisible.value = true;
        } else {
          proxy.$message.error(res.data?.message || "获取路线详情失败");
        }
      } catch (error) {
        console.error("获取路线详情失败:", error);
        proxy.$message.error("获取路线详情失败");
      }
    };

    // 查看
    const handleView = async (row) => {
      dialogType.value = "view";
      try {
        const res = await getLineById(row.id);
        if (res.data?.success) {
          currentRow.value = res.data.result || {};
          dialogVisible.value = true;
        } else {
          proxy.$message.error(res.data?.message || "获取路线详情失败");
        }
      } catch (error) {
        console.error("获取路线详情失败:", error);
        proxy.$message.error("获取路线详情失败");
      }
    };

    // 删除
    const handleDelete = (row) => {
      proxy
        .$confirm(`确定要删除巡检路线"${row.routeName}"吗？`, "提示", {
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

    // 新增巡检点（打开选择弹窗）
    const handleAddPoint = () => {
      selectPointVisible.value = true;
    };

    // 获取已选巡检点ID列表
    const getSelectedPointIds = () => {
      if (routeDialogRef.value && routeDialogRef.value.form) {
        return routeDialogRef.value.form.points.map((p) => p.placeId);
      }
      return [];
    };

    // 选择巡检点确认（替换列表）
    const handleSelectPointConfirm = (points) => {
      if (routeDialogRef.value && routeDialogRef.value.setPoints) {
        routeDialogRef.value.setPoints(points);
      }
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
      selectPointVisible,
      routeDialogRef,
      searchFn,
      resetFn,
      handleAdd,
      handleEdit,
      handleView,
      handleDelete,
      handleDialogClose,
      handleDialogSubmit,
      handleAddPoint,
      getSelectedPointIds,
      handleSelectPointConfirm,
      pageSizeFn,
      pageCurFn,
    };
  },
};
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="false" class="h-full">
    <!-- 搜索区域：路线名称、查询（与原型图一致） -->
    <ECard slot="search" type="search" noneBottom>
      <el-form :model="searchForm" size="mini" inline>
        <el-form-item label="路线名称">
          <el-input
            v-model="searchForm.lineName"
            placeholder="请输入路线名称"
            class="w-52"
            clearable
            @keyup.enter.native="searchFn"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchFn">查询</el-button>
          <el-button @click="resetFn">重置</el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <!-- 表格区域：新增按钮 + 表格（序号、路线名称、联系电话、创建时间、负责人、操作） -->
    <ECard slot="table">
      <div class="mb-4">
        <EButton type="primary" btnIcon="el-icon-plus" @click="handleAdd">新增</EButton>
      </div>

      <CTable
        :tableData="tableData"
        :loading="loading"
        :list="tableConfig"
        height="92%"
      >
        <!-- 操作列：查看、修改、删除（与原型图一致，删除为红色） -->
        <template #operation="{ info }">
          <EButton type="text" @click="handleView(info)">查看</EButton>
          <EButton type="text" @click="handleEdit(info)">修改</EButton>
          <EButton type="text" class="text-red-500" @click="handleDelete(info)">删除</EButton>
        </template>
      </CTable>
    </ECard>

    <!-- 分页区域：共x条、每页x条、页码、前往x页（与原型图一致） -->
    <ECard slot="page" type="footer">
      <el-pagination
        class="text-right"
        :current-page.sync="searchForm.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size.sync="searchForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>

    <!-- 新增/编辑/查看弹窗 -->
    <InspectionRouteDialog
      ref="routeDialogRef"
      slot="dialog"
      :visible.sync="dialogVisible"
      :info="currentRow"
      :dialogType="dialogType"
      @close="handleDialogClose"
      @submit="handleDialogSubmit"
      @add-point="handleAddPoint"
    />

    <!-- 选择巡检点弹窗 -->
    <SelectInspectionPointDialog
      slot="dialog"
      :visible.sync="selectPointVisible"
      :selectedIds="getSelectedPointIds()"
      @confirm="handleSelectPointConfirm"
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
