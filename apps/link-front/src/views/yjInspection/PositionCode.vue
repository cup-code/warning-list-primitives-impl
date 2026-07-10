<script>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, reactive, ref } from "vue";
import { deleteYjPoint, queryYjPoint } from "@/http/inspection/yj-inspection-api";
import PositionCodeDialog from "./components/PositionCodeDialog.vue";
import { PositionCodeTableConfig } from "./config";

export default {
  name: "PositionCode",
  components: {
    PositionCodeDialog,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单
    const searchForm = reactive({
      pointCode: "",
      pointName: "",
      processSection: "",
      pageNum: 1,
      pageSize: 10,
    });

    // 表格数据
    const tableData = ref([]);
    const tableConfig = ref(PositionCodeTableConfig);
    const total = ref(0);

    // 弹窗相关
    const dialogVisible = ref(false);
    const dialogType = ref("add");
    const currentRow = ref({});

    // 构建查询参数（排除空值）
    const buildQueryParams = () => {
      const params = {
        pageNum: searchForm.pageNum,
        pageSize: searchForm.pageSize,
      };
      if (searchForm.pointCode) params.pointCode = searchForm.pointCode;
      if (searchForm.pointName) params.pointName = searchForm.pointName;
      if (searchForm.processSection) params.processSection = searchForm.processSection;
      return params;
    };

    // 查询列表数据
    const { refetch, isFetching } = useQuery({
      queryKey: ["yjPointList", searchForm],
      queryFn: () => queryYjPoint(buildQueryParams()),
      onSuccess: ({ data }) => {
        if (data?.success) {
          const { result } = data || {};
          const list = (result?.list || []).map((item, index) => ({
            ...item,
            index: (searchForm.pageNum - 1) * searchForm.pageSize + index + 1,
          }));
          tableData.value = list;
          total.value = result?.total || 0;
        } else {
          tableData.value = [];
          total.value = 0;
          proxy.$message.error(data?.message || "查询失败");
        }
      },
      onError: () => {
        tableData.value = [];
        total.value = 0;
        proxy.$message.error("查询失败");
      },
    });

    // 删除
    const { mutate: deleteMutate } = useMutation({
      mutationFn: (id) => deleteYjPoint(id),
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
      searchForm.pointCode = "";
      searchForm.pointName = "";
      searchForm.processSection = "";
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

    // 查看
    const handleView = (row) => {
      dialogType.value = "view";
      currentRow.value = row;
      dialogVisible.value = true;
    };

    // 修改
    const handleEdit = (row) => {
      dialogType.value = "edit";
      currentRow.value = row;
      dialogVisible.value = true;
    };

    // 删除
    const handleDelete = (row) => {
      proxy
        .$confirm("确定要删除该点位编码吗？", "提示", {
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
      loading: isFetching,
      total,
      tableConfig,
      dialogVisible,
      dialogType,
      currentRow,
      searchFn,
      resetFn,
      handleAdd,
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
  <div class="position-code-page">
    <KyTreeTable ref="treeTable" :isShowLeft="false" class="h-full">
      <!-- 搜索区域 -->
      <ECard slot="search" type="search" noneBottom>
        <el-form :model="searchForm" size="mini" inline>
          <el-form-item label="点位编码">
            <el-input
              v-model="searchForm.pointCode"
              placeholder="请输入点位编码"
              class="w-52"
              clearable
              @keyup.enter.native="searchFn"
            />
          </el-form-item>
          <el-form-item label="点位名称">
            <el-input
              v-model="searchForm.pointName"
              placeholder="请输入点位名称"
              class="w-52"
              clearable
              @keyup.enter.native="searchFn"
            />
          </el-form-item>
          <el-form-item label="所属工艺段">
            <el-input
              v-model="searchForm.processSection"
              placeholder="请输入所属工艺段"
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

      <!-- 新增/修改/查看弹窗 -->
      <PositionCodeDialog
        slot="dialog"
        :visible.sync="dialogVisible"
        :info="currentRow"
        :dialogType="dialogType"
        @close="handleDialogClose"
        @submit="handleDialogSubmit"
      />
    </KyTreeTable>
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
