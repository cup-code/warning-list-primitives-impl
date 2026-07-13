<script>
import { useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, onMounted, reactive, ref } from "vue";
import { ExceptionRecordTableConfig } from "./config";
import ExceptionHandleDialog from "./components/ExceptionHandleDialog.vue";
import ExceptionRecordPrint from "./components/ExceptionRecordPrint.vue";
import {
  queryInspectionAbnormalPage,
  countAbnormalByState,
} from "@/http/inspection/yx-inspection-api";

export default {
  name: "ExceptionRecord",
  components: {
    ExceptionHandleDialog,
    ExceptionRecordPrint,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单（与原型图一致：计划名称、审核结果、巡检日期起止、异常级别、查询）
    const searchForm = reactive({
      planName: "",
      auditResult: "",
      startDate: "",
      endDate: "",
      abnormalLevel: "",
      auditState: "",
      pageNum: 1,
      pageSize: 10,
    });

    // 状态筛选 Tab：全部、待审核、处理中、已处理
    const statusFilter = ref("");
    const statusCounts = ref({
      all: 0,
      pending: 0,
      processing: 0,
      processed: 0,
    });
    const statusTabs = [
      { label: "全部", value: "" },
      { label: "待审核", value: "0" },
      { label: "处理中", value: "1" },
      { label: "已处理", value: "2" },
    ];

    // 表格数据
    const tableData = ref([]);
    const loading = ref(false);
    const total = ref(0);

    // 弹窗
    const dialogVisible = ref(false);
    const dialogType = ref("view");
    const currentRow = ref({});

    // 打印弹窗
    const printDialogVisible = ref(false);
    const currentPrintRow = ref({});

    const tableConfig = ref(ExceptionRecordTableConfig);

    // 审核结果选项
    const reviewResultOptions = [
      { label: "误报", value: "0" },
      { label: "问题", value: "1" },
      { label: "安全隐患", value: "2" },
    ];

    // 异常级别选项
    const exceptionLevelOptions = [
      { label: "一般", value: "1" },
      { label: "紧急", value: "3" },
    ];

    // 查询列表（statusFilter 作为筛选参数）
    const { refetch, isPending } = useQuery({
      queryKey: ["exceptionRecordList", searchForm, statusFilter],
      queryFn: () =>
        queryInspectionAbnormalPage({ ...searchForm, auditState: statusFilter.value }),
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          const list = (result.list || []).map((item, index) => ({
            ...item,
            id: item.executeRecordId,
            index: (searchForm.pageNum - 1) * searchForm.pageSize + index + 1,
            inspectionContent: item.contentName,
            inspectionStandard: item.inspectionBenchmark,
            planName: item.planName,
            inspectionShift: item.taskName,
            department: item.departmentName,
            inspectionPost: item.postName,
            inspector: item.executeUsername,
            exceptionTime: item.executeDate,
            abnormalLevel: item.abnormalLevel || "",
            status:
              item.auditState === "0"
                ? "待审核"
                : item.auditState === "1"
                ? "处理中"
                : "已处理",
            reviewResult:
              item.auditResult === "0"
                ? "误报"
                : item.auditResult === "1"
                ? "问题"
                : item.auditResult === "2"
                ? "安全隐患"
                : "",
          }));
          tableData.value = list;
          total.value = result.total || 0;
        }
      },
    });

    // 查询状态统计
    const fetchStateCount = async () => {
      try {
        const res = await countAbnormalByState(searchForm);
        if (res.data?.success) {
          const result = res.data.result || [];
          // 初始化计数
          let pending = 0,
            processing = 0,
            processed = 0;
          // 解析数组格式响应
          result.forEach((item) => {
            if (item.auditState === "0") pending = item.count || 0;
            else if (item.auditState === "1") processing = item.count || 0;
            else if (item.auditState === "2") processed = item.count || 0;
          });
          statusCounts.value = {
            all: pending + processing + processed,
            pending,
            processing,
            processed,
          };
        }
      } catch (e) {
        console.error("获取状态统计失败", e);
      }
    };

    loading.value = isPending;

    const searchFn = () => {
      searchForm.pageNum = 1;
      refetch();
      fetchStateCount();
    };

    const resetFn = () => {
      searchForm.planName = "";
      searchForm.auditResult = "";
      searchForm.startDate = "";
      searchForm.endDate = "";
      searchForm.abnormalLevel = "";
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      statusFilter.value = "";
      refetch();
      fetchStateCount();
    };

    // 异常时间显示格式：YYYY/MM/DD HH:mm（与原型一致）
    const formatExceptionTime = (val) => {
      if (!val) return "-";
      const str = String(val).trim().replace(/-/g, "/");
      const match = str.match(/^(\d{4}\/\d{1,2}\/\d{1,2})\s*(\d{1,2}:\d{2})/);
      return match ? `${match[1]} ${match[2]}` : val;
    };

    // 点击状态按钮筛选（v-model 已更新 statusFilter，此处重置页码并请求）
    const handleStatusChange = () => {
      searchForm.pageNum = 1;
      refetch();
    };

    const handleProcess = (row) => {
      dialogType.value = "audit";
      currentRow.value = { ...row };
      dialogVisible.value = true;
    };

    const handleView = (row) => {
      dialogType.value = "view";
      currentRow.value = { ...row };
      dialogVisible.value = true;
    };

    const handlePrint = (row) => {
      currentPrintRow.value = { ...row };
      printDialogVisible.value = true;
    };

    const handleDialogClose = () => {
      dialogVisible.value = false;
      currentRow.value = {};
    };

    const handleDialogSubmit = () => {
      refetch();
      fetchStateCount();
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
      fetchStateCount();
    });

    return {
      searchForm,
      statusFilter,
      statusCounts,
      tableData,
      loading,
      total,
      tableConfig,
      dialogVisible,
      dialogType,
      currentRow,
      printDialogVisible,
      currentPrintRow,
      reviewResultOptions,
      exceptionLevelOptions,
      searchFn,
      resetFn,
      handleStatusChange,
      handleProcess,
      handleView,
      handlePrint,
      handleDialogClose,
      handleDialogSubmit,
      pageSizeFn,
      pageCurFn,
      formatExceptionTime,
      statusTabs,
    };
  },
};
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="false" class="h-full">
    <!-- 搜索区域：计划名称、审核结果、巡检日期、异常级别、查询 -->
    <ECard slot="search" type="search" noneBottom>
      <el-form :model="searchForm" size="mini" inline>
        <el-form-item label="计划名称">
          <el-input
            v-model="searchForm.planName"
            placeholder="计划名称"
            class="w-40"
            clearable
            @keyup.enter.native="searchFn"
          />
        </el-form-item>
        <el-form-item label="审核结果">
          <el-select
            v-model="searchForm.auditResult"
            placeholder="全部"
            class="w-32"
            clearable
          >
            <el-option
              v-for="item in reviewResultOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="巡检日期">
          <el-date-picker
            v-model="searchForm.startDate"
            type="datetime"
            placeholder="选择开始时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            class="w-44"
            clearable
          />
          <span class="mx-1">-</span>
          <el-date-picker
            v-model="searchForm.endDate"
            type="datetime"
            placeholder="选择结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            class="w-44"
            clearable
          />
        </el-form-item>
        <el-form-item label="异常级别">
          <el-select
            v-model="searchForm.abnormalLevel"
            placeholder="全部"
            class="w-32"
            clearable
          >
            <el-option
              v-for="item in exceptionLevelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchFn">查询</el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <!-- 表格区域 -->
    <ECard slot="table">
      <!-- 状态筛选 Tab：全部、待审核、处理中、已处理（与原型一致圆角矩形、选中浅灰底） -->
      <div class="exception-record-status-tabs">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          type="button"
          class="status-tab"
          :class="{ 'is-active': statusFilter === tab.value }"
          @click="
            statusFilter = tab.value;
            handleStatusChange();
          "
        >
          {{ tab.label }} ({{
            tab.value === ""
              ? statusCounts.all
              : tab.value === "0"
              ? statusCounts.pending
              : tab.value === "1"
              ? statusCounts.processing
              : statusCounts.processed
          }})
        </button>
      </div>
      <CTable :tableData="tableData" :loading="loading" :list="tableConfig" height="92%">
        <template #exceptionTime="{ info }">
          {{ formatExceptionTime(info.exceptionTime) }}
        </template>

        <template #abnormalLevel="{ info }">
          <el-tag
            v-if="info.abnormalLevel"
            size="small"
            :type="info.abnormalLevel === '3' ? 'danger' : 'info'"
          >
            {{
              exceptionLevelOptions.find((item) => item.value === info.abnormalLevel)
                ?.label || ""
            }}
          </el-tag>
          <template v-else>
            <span class="text-gray-500">--</span>
          </template>
        </template>

        <!-- auditState	审核状态.待审核:0;处理中:1;已处理:2 -->
        <template #status="{ info }">
          <el-tag
            size="small"
            :type="
              info.auditState === '2'
                ? 'success'
                : info.auditState === '0'
                ? 'warning'
                : 'primary'
            "
          >
            {{
              info.auditState === "0"
                ? "待审核"
                : info.auditState === "1"
                ? "处理中"
                : "已处理"
            }}
          </el-tag>
        </template>

        <template #reviewResult="{ info }">
          {{ info.reviewResult || "-" }}
        </template>

        <template #operation="{ info }">
          <EButton type="text" @click="handleView(info)">查看</EButton>
          <template v-if="info.auditState === '0'">
            <EButton type="text" @click="handleProcess(info)">审核</EButton>
          </template>
          <template v-else>
            <EButton type="text" @click="handlePrint(info)">打印</EButton>
          </template>
        </template>
      </CTable>
    </ECard>

    <!-- 分页：共 x 条、每页 x 条、页码、前往 x 页 -->
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

    <ExceptionHandleDialog
      slot="dialog"
      :visible.sync="dialogVisible"
      :info="currentRow"
      :dialogType="dialogType"
      @close="handleDialogClose"
      @submit="handleDialogSubmit"
    />
    <ExceptionRecordPrint
      slot="dialog"
      :visible.sync="printDialogVisible"
      :info="currentPrintRow"
      @close="printDialogVisible = false"
    />
  </KyTreeTable>
</template>

<style lang="scss" scoped>
/* 状态 Tab：每个为独立圆角矩形，选中为浅灰背景+边框，与原型一致 */
.exception-record-status-tabs {
  display: flex;
  gap: 8px;
  padding-bottom: 12px;
  flex-wrap: wrap;
  .status-tab {
    padding: 6px 16px;
    font-size: 14px;
    color: #606266;
    background: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    cursor: pointer;
    outline: none;
    transition: background 0.2s, border-color 0.2s;
    &.is-active {
      background: #f5f7fa;
      border-color: #c0c4cc;
      color: #303133;
    }
    &:hover:not(.is-active) {
      color: #409eff;
      border-color: #c6e2ff;
    }
  }
}
::v-deep .el-pagination {
  text-align: right;
}
</style>
