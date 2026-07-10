<script>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, reactive, ref } from "vue";
import { InspectionPlanTableConfig } from "./config";
import {
  queryInspectionPlanByPage,
  deleteInspectionPlan,
  changeInspectionPlanState,
} from "@/http/inspection/yx-inspection-api";

export default {
  name: "InspectionPlan",
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单（与原型图一致：检索名称、类型、状态）
    const searchForm = reactive({
      planName: "",
      inspectionType: "",
      planState: "",
      pageNum: 1,
      pageSize: 10,
    });

    // 表格数据
    const tableData = ref([]);
    const loading = ref(false);
    const total = ref(0);

    // 表格配置
    const tableConfig = ref(InspectionPlanTableConfig);

    // 类型选项（排班方式）
    const typeOptions = [
      { label: "周期排班", value: "CYCLE" },
      { label: "滚动排班", value: "ROLL" },
    ];

    // 状态选项
    const statusOptions = [
      { label: "待提交", value: "1" },
      { label: "发布", value: "2" },
      { label: "停用", value: "3" },
    ];

    // 查询列表数据
    const { refetch, isPending } = useQuery({
      queryKey: ["inspectionPlanList", searchForm],
      queryFn: () => queryInspectionPlanByPage(searchForm),
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          const list = (result.list || []).map((item) => ({
            ...item,
            planCode: item.planCode,
            companyName: item.departmentName,
            planName: item.planName,
            scheduleType: item.inspectionType === "CYCLE" ? "周期" : "滚动",
            executor: item.executorNames,
            frequency: item.frequency
              ? `每${
                  item.cycleFiled === "DAY"
                    ? "日"
                    : item.cycleFiled === "WEEK"
                    ? "周"
                    : item.cycleFiled === "MONTH"
                    ? "月"
                    : "年"
                }巡检${item.frequency}次`
              : "-",
            cycleType:
              item.cycleFiled === "DAY"
                ? "日"
                : item.cycleFiled === "WEEK"
                ? "周"
                : item.cycleFiled === "MONTH"
                ? "月"
                : "年",
            status:
              item.planState === "1"
                ? "待提交"
                : item.planState === "2"
                ? "发布"
                : "停用",
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
      searchForm.inspectionType = "";
      searchForm.planState = "";
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      refetch();
    };

    // 启用
    const handleEnable = (row) => {
      changeInspectionPlanState({ planId: row.id, planState: "2" }).then((res) => {
        if (res.data?.success) {
          proxy.$message.success("已启用");
          refetch();
        } else {
          proxy.$message.error(res.data?.message || "启用失败");
        }
      });
    };

    // 停用
    const handleDisable = (row) => {
      changeInspectionPlanState({ planId: row.id, planState: "3" }).then((res) => {
        if (res.data?.success) {
          proxy.$message.success("已停用");
          refetch();
        } else {
          proxy.$message.error(res.data?.message || "停用失败");
        }
      });
    };

    // 新增 - 跳转详情页
    const handleAdd = () => {
      proxy.$router.push({
        path: `/detail/yxInspectionPlanDetail/null/add`,
      });
    };

    // 编辑 - 跳转详情页
    const handleEdit = (row) => {
      proxy.$router.push({
        path: `/detail/yxInspectionPlanDetail/${row.id}/edit`,
      });
    };

    // 查看 - 跳转详情页
    const handleView = (row) => {
      proxy.$router.push({
        path: `/detail/yxInspectionPlanDetail/${row.id}/view`,
      });
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
        .catch(() => {});
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
      typeOptions,
      statusOptions,
      searchFn,
      resetFn,
      handleAdd,
      handleEdit,
      handleView,
      handleDelete,
      handleEnable,
      handleDisable,
      pageSizeFn,
      pageCurFn,
    };
  },
};
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="false" class="h-full">
    <!-- 搜索区域（与原型图一致：检索名称、类型、状态、查询、重置） -->
    <ECard slot="search" type="search" noneBottom>
      <el-form :model="searchForm" size="mini" inline>
        <el-form-item label="计划名称">
          <el-input
            v-model="searchForm.planName"
            placeholder="请输入计划名称"
            class="w-52"
            clearable
            @keyup.enter.native="searchFn"
          />
        </el-form-item>
        <el-form-item label="排班方式">
          <el-select
            v-model="searchForm.scheduleMode"
            placeholder="请选择排班方式"
            class="w-40"
            clearable
          >
            <el-option
              v-for="item in typeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.planState"
            placeholder="全部"
            class="w-40"
            clearable
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
        <el-button type="primary" plain icon="el-icon-plus" @click="handleAdd">
          新增
        </el-button>
      </div>

      <CTable :tableData="tableData" :loading="loading" :list="tableConfig" height="92%">
        <!-- 排班方式列 -->
        <template #scheduleMode="{ info }">
          {{ info.scheduleMode === "CYCLE" ? "周期" : "滚动" }}排班
        </template>
        <!-- 巡检人列 -->
        <template #executeUserList="{ info }">
          {{ info.executeUserList.join("、") }}
        </template>

        <!-- 巡检周期列 -->
        <template #frequency="{ info }">
          {{ info.scheduleMode === "CYCLE" ? info.frequency : "--" }}
        </template>

        <!-- 状态列 -->
        <template #status="{ info }">
          <el-tag size="small" :type="info.planState === '启用' ? 'success' : 'info'">
            {{
              info.planState === "1" ? "待提交" : info.planState === "2" ? "发布" : "停用"
            }}
          </el-tag>
        </template>

        <!-- 操作列（启用：查看、停用；停用：查看、启用、修改、删除） -->
        <template #operation="{ info }">
          <EButton type="text" @click="handleView(info)"> 查看 </EButton>
          <template v-if="info.planState === '2'">
            <EButton type="text" @click="handleDisable(info)"> 停用 </EButton>
          </template>
          <template v-else>
            <EButton type="text" @click="handleEnable(info)"> 启用 </EButton>
            <EButton type="text" @click="handleEdit(info)"> 修改 </EButton>
            <EButton type="text" class="text-red-500" @click="handleDelete(info)">
              删除
            </EButton>
          </template>
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
