<script>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, reactive, ref } from "vue";
import {
  deleteSummaryData,
  getSummaryDataTemplate,
  importSummaryData,
  querySummaryData,
} from "@/http/inspection/yj-inspection-api";
import TrainingSetDataDialog from "./components/TrainingSetDataDialog.vue";
import { TrainingSetDataTableConfig } from "./config";

export default {
  name: "TrainingSetData",
  components: {
    TrainingSetDataDialog,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单
    const searchForm = reactive({
      factoryCode: "",
      pointCode: "",
      sampleTimeStart: "",
      sampleTimeEnd: "",
      source: "",
      pageNum: 1,
      pageSize: 10,
    });

    // 时间范围
    const dateRange = ref([]);

    // 表格数据
    const tableData = ref([]);
    const tableConfig = ref(TrainingSetDataTableConfig);
    const total = ref(0);

    // 弹窗相关
    const dialogVisible = ref(false);
    const dialogType = ref("add");
    const currentRow = ref({});

    // 导入相关
    const importLoading = ref(false);

    // 处理时间范围变化
    const handleDateChange = (val) => {
      if (val && val.length === 2) {
        searchForm.sampleTimeStart = val[0];
        searchForm.sampleTimeEnd = val[1];
      } else {
        searchForm.sampleTimeStart = "";
        searchForm.sampleTimeEnd = "";
      }
    };

    // 构建查询参数（排除空值）
    const buildQueryParams = () => {
      const params = {
        pageNum: searchForm.pageNum,
        pageSize: searchForm.pageSize,
      };
      if (searchForm.factoryCode) params.factoryCode = searchForm.factoryCode;
      if (searchForm.pointCode) params.pointCode = searchForm.pointCode;
      if (searchForm.sampleTimeStart) params.sampleTimeStart = searchForm.sampleTimeStart;
      if (searchForm.sampleTimeEnd) params.sampleTimeEnd = searchForm.sampleTimeEnd;
      if (searchForm.source) params.source = searchForm.source;
      return params;
    };

    // 查询列表数据
    const { refetch, isFetching } = useQuery({
      queryKey: ["summaryDataList", searchForm],
      queryFn: () => querySummaryData(buildQueryParams()),
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
      mutationFn: (id) => deleteSummaryData(id),
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
      searchForm.factoryCode = "";
      searchForm.pointCode = "";
      searchForm.sampleTimeStart = "";
      searchForm.sampleTimeEnd = "";
      searchForm.source = "";
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      dateRange.value = [];
      refetch();
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
        .$confirm("确定要删除该条数据吗？", "提示", {
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

    // 新增
    const handleAdd = () => {
      dialogType.value = "add";
      currentRow.value = {};
      dialogVisible.value = true;
    };

    // 模板下载
    const handleDownloadTemplate = async () => {
      try {
        const res = await getSummaryDataTemplate();
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `训练集数据模板_${Date.now()}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);
        proxy.$message.success("模板下载成功");
      } catch (error) {
        proxy.$message.error("模板下载失败");
      }
    };

    // 数据导入
    const handleImport = (row) => {
      importLoading.value = true;
      importSummaryData(row.file)
        .then((res) => {
          if (res.data?.success) {
            proxy.$message.success("导入成功");
            refetch();
          } else {
            proxy.$message.error(res.data?.message || "导入失败");
          }
        })
        .catch(() => {
          proxy.$message.error("导入失败");
        })
        .finally(() => {
          importLoading.value = false;
        });
      return false;
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
      dateRange,
      tableData,
      loading: isFetching,
      total,
      tableConfig,
      dialogVisible,
      dialogType,
      currentRow,
      handleDateChange,
      searchFn,
      resetFn,
      handleView,
      handleEdit,
      handleDelete,
      handleDialogClose,
      handleDialogSubmit,
      importLoading,
      handleAdd,
      handleDownloadTemplate,
      handleImport,
      pageSizeFn,
      pageCurFn,
    };
  },
};
</script>

<template>
  <div class="training-set-data-page">
    <KyTreeTable ref="treeTable" :isShowLeft="false" class="h-full">
      <!-- 搜索区域 -->
      <ECard slot="search" type="search" noneBottom>
        <el-form :model="searchForm" size="mini" inline>
          <el-form-item label="厂区编码">
            <el-input
              v-model="searchForm.factoryCode"
              placeholder="请输入厂区编码"
              class="w-52"
              clearable
              @keyup.enter.native="searchFn"
            />
          </el-form-item>
          <el-form-item label="点位编码">
            <el-input
              v-model="searchForm.pointCode"
              placeholder="请输入点位编码"
              class="w-52"
              clearable
              @keyup.enter.native="searchFn"
            />
          </el-form-item>
          <el-form-item label="采样时间">
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              class="w-80"
              @change="handleDateChange"
            />
          </el-form-item>
          <el-form-item label="来源">
            <el-input
              v-model="searchForm.source"
              placeholder="请输入来源"
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
            @click="handleDownloadTemplate"
          >
            模板下载
          </EButton>
          <EImportFile @excelImport="handleImport">
            <EButton plain btnIcon="el-icon-upload2" :loading="importLoading">
              批量导入
            </EButton>
          </EImportFile>
        </div>
        <CTable
          :tableData="tableData"
          :loading="loading"
          :list="tableConfig"
          height="92%"
        >
          <!-- 吸光度SAC 列：超长省略，鼠标悬浮显示全部 -->
          <template #sac="{ info }">
            <el-tooltip
              v-if="info.sac !== undefined && info.sac !== null && info.sac !== ''"
              effect="dark"
              :content="String(info.sac)"
              placement="top"
            >
              <span class="sac-ellipsis">{{ info.sac }}</span>
            </el-tooltip>
            <span v-else>{{ info.sac }}</span>
          </template>
          <!-- 吸光度SAC 列：超长省略，鼠标悬浮显示全部 -->
          <template #sac1="{ info }">
            <el-tooltip
              v-if="info.sac1 !== undefined && info.sac1 !== null && info.sac1 !== ''"
              effect="dark"
              :content="String(info.sac1)"
              placement="top"
            >
              <span class="sac-ellipsis">{{ info.sac1 }}</span>
            </el-tooltip>
            <span v-else>{{ info.sac1 }}</span>
          </template>
          <!-- 吸光度SAC 列：超长省略，鼠标悬浮显示全部 -->
          <template #sac2="{ info }">
            <el-tooltip
              v-if="info.sac2 !== undefined && info.sac2 !== null && info.sac2 !== ''"
              effect="dark"
              :content="String(info.sac2)"
              placement="top"
            >
              <span class="sac-ellipsis">{{ info.sac2 }}</span>
            </el-tooltip>
            <span v-else>{{ info.sac2 }}</span>
          </template>
          <!-- 吸光度SAC 列：超长省略，鼠标悬浮显示全部 -->
          <template #sac3="{ info }">
            <el-tooltip
              v-if="info.sac3 !== undefined && info.sac3 !== null && info.sac3 !== ''"
              effect="dark"
              :content="String(info.sac3)"
              placement="top"
            >
              <span class="sac-ellipsis">{{ info.sac3 }}</span>
            </el-tooltip>
            <span v-else>{{ info.sac3 }}</span>
          </template>
          <!-- 吸光度SAC 列：超长省略，鼠标悬浮显示全部 -->
          <template #sac4="{ info }">
            <el-tooltip
              v-if="info.sac4 !== undefined && info.sac4 !== null && info.sac4 !== ''"
              effect="dark"
              :content="String(info.sac4)"
              placement="top"
            >
              <span class="sac-ellipsis">{{ info.sac4 }}</span>
            </el-tooltip>
            <span v-else>{{ info.sac4 }}</span>
          </template>

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

      <!-- 查看/修改弹窗 -->
      <TrainingSetDataDialog
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

// 吸光度SAC 单元格：单行超出省略号
.sac-ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

::v-deep .el-pagination {
  text-align: right;
}
</style>
