<script>
import { useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, reactive, ref } from "vue";
import { ReportArchiveTableConfig } from "./config";
import { deleteReportArchive, queryPageReportArchive } from "@/http/inspection/yx-inspection-api";

export default {
  name: "ReportArchive",
  setup() {
    const { proxy } = getCurrentInstance();

    const searchForm = reactive({
      title: "",
      dateRange: [],
      pageNum: 1,
      pageSize: 10,
    });

    const tableData = ref([]);
    const loading = ref(false);
    const total = ref(0);
    const tableConfig = ref(ReportArchiveTableConfig);

    const buildParams = () => {
      const params = {
        pageNum: searchForm.pageNum,
        pageSize: searchForm.pageSize,
      };
      if (searchForm.title) {
        params.title = searchForm.title;
      }
      if (searchForm.dateRange?.length === 2) {
        params.reportTimeStart = searchForm.dateRange[0];
        params.reportTimeEnd = searchForm.dateRange[1];
      }
      return params;
    };

    const { refetch, isPending } = useQuery({
      queryKey: ["reportArchiveList", searchForm],
      queryFn: () => queryPageReportArchive(buildParams()),
      onSuccess: ({ data }) => {
        if (data?.success) {
          const result = data.result || {};
          const list = (result.list || []).map((item, index) => ({
            ...item,
            index: (searchForm.pageNum - 1) * searchForm.pageSize + index + 1,
          }));
          tableData.value = list;
          total.value = result.total || 0;
        } else {
          proxy.$message.error(data?.message || "获取归档列表失败");
        }
      },
      onError: () => {
        proxy.$message.error("获取归档列表失败");
      },
    });

    loading.value = isPending;

    const searchFn = () => {
      searchForm.pageNum = 1;
      refetch();
    };

    const resetFn = () => {
      searchForm.title = "";
      searchForm.dateRange = [];
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      refetch();
    };

    const handleDelete = (row) => {
      proxy.$confirm("确定要删除该报告归档吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(async () => {
        try {
          const { data } = await deleteReportArchive(row.id);
          if (data?.success) {
            proxy.$message.success("删除成功");
            refetch();
          } else {
            proxy.$message.error(data?.message || "删除失败");
          }
        } catch {
          proxy.$message.error("删除失败");
        }
      }).catch(() => {});
    };

    const handleView = (row) => {
      proxy.$router.push({
        path: "/yxInspection/inspectionReport",
        query: {
          id: row.id,
          title: row.title || "",
          summary: row.summary || "",
          type: row.type || "",
          startDate: row.startDate || "",
          endDate: row.endDate || "",
          containChart: row.containChart ? "1" : "0",
          containDetail: row.containDetail ? "1" : "0",
          createdTime: row.createdTime || "",
        },
      });
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

    return {
      searchForm,
      tableData,
      loading,
      total,
      tableConfig,
      searchFn,
      resetFn,
      handleDelete,
      handleView,
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
        <el-form-item label="报告标题">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入报告标题"
            class="w-52"
            clearable
            @keyup.enter.native="searchFn"
          />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            :default-time="['00:00:00', '23:59:59']"
            class="w-80"
          />
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
      <CTable :tableData="tableData" :loading="loading" :list="tableConfig" height="92%">
        <template #summary="{ info }">
          <EButton type="text" @click="handleView(info)">详情</EButton>
        </template>
        <template #type="{ info }">
          <span>{{ { day: '日', week: '周', month: '月', custom: '自定义' }[info.type] || info.type }}</span>
        </template>
        <template #dateRange="{ info }">
          <span>{{ info.startDate }} 至 {{ info.endDate }}</span>
        </template>
        <template #containChart="{ info }">
          <span>{{ info.containChart ? '是' : '否' }}</span>
        </template>
        <template #containDetail="{ info }">
          <span>{{ info.containDetail ? '是' : '否' }}</span>
        </template>
        <template #operation="{ info }">
          <EButton type="text" @click="handleView(info)">查看</EButton>
          <EButton type="text" @click="handleDelete(info)">删除</EButton>
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
::v-deep .el-card__header {
  background: #ffffff !important;
}
::v-deep .el-pagination {
  text-align: right;
}
</style>
