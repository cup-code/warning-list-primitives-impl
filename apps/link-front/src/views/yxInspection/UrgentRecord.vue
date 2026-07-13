<script>
import { useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, onMounted, reactive, ref } from "vue";
import { UrgentRecordTableConfig } from "./config";
import UrgentDetailDialog from "./components/UrgentDetailDialog.vue";
import ExceptionRecordPrint from "./components/ExceptionRecordPrint.vue";
import { queryInspectionAbnormalPage } from "@/http/inspection/yx-inspection-api";

export default {
  name: "UrgentRecord",
  components: {
    UrgentDetailDialog,
    ExceptionRecordPrint,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单（计划名称、巡检日期起止）
    // abnormalLevel 固定为 "2"（紧急）
    const searchForm = reactive({
      planName: "",
      startDate: "",
      endDate: "",
      abnormalLevel: "3",
      pageNum: 1,
      pageSize: 10,
    });

    // 表格数据
    const tableData = ref([]);
    const loading = ref(false);
    const total = ref(0);

    // 弹窗
    const dialogVisible = ref(false);
    const currentRow = ref({});

    // 打印弹窗
    const printDialogVisible = ref(false);
    const currentPrintRow = ref({});

    const tableConfig = ref(UrgentRecordTableConfig);

    // 查询列表
    const { refetch, isPending } = useQuery({
      queryKey: ["urgentRecordList", searchForm],
      queryFn: () => queryInspectionAbnormalPage(searchForm),
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
            abnormalLevel: item.abnormalLevel || "2",
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

    loading.value = isPending;

    const searchFn = () => {
      searchForm.pageNum = 1;
      refetch();
    };

    const resetFn = () => {
      searchForm.planName = "";
      searchForm.startDate = "";
      searchForm.endDate = "";
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      refetch();
    };

    // 异常时间显示格式：YYYY/MM/DD HH:mm
    const formatExceptionTime = (val) => {
      if (!val) return "-";
      const str = String(val).trim().replace(/-/g, "/");
      const match = str.match(/^(\d{4}\/\d{1,2}\/\d{1,2})\s*(\d{1,2}:\d{2})/);
      return match ? `${match[1]} ${match[2]}` : val;
    };

    const handleView = (row) => {
      currentRow.value = { ...row };
      dialogVisible.value = true;
    };

    const handleDialogClose = () => {
      dialogVisible.value = false;
      currentRow.value = {};
    };

    const handlePrint = (row) => {
      currentPrintRow.value = { ...row };
      printDialogVisible.value = true;
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
      dialogVisible,
      currentRow,
      printDialogVisible,
      currentPrintRow,
      searchFn,
      resetFn,
      handleView,
      handleDialogClose,
      handlePrint,
      pageSizeFn,
      pageCurFn,
      formatExceptionTime,
    };
  },
};
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="false" class="h-full">
    <!-- 搜索区域：计划名称、巡检日期 -->
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
        <el-form-item>
          <el-button type="primary" @click="searchFn">查询</el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <!-- 表格区域 -->
    <ECard slot="table">
      <CTable :tableData="tableData" :loading="loading" :list="tableConfig" height="92%">
        <template #exceptionTime="{ info }">
          {{ formatExceptionTime(info.exceptionTime) }}
        </template>

        <!-- 异常级别：固定显示"紧急" -->
        <template #abnormalLevel="{ info }">
          <el-tag type="danger" size="small">紧急</el-tag>
        </template>

        <!-- 状态标签 -->
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

        <!-- 操作：查看 + 打印（已处理状态） -->
        <template #operation="{ info }">
          <EButton type="text" @click="handleView(info)">查看</EButton>
          <template v-if="info.auditState === '2'">
            <EButton type="text" @click="handlePrint(info)">打印</EButton>
          </template>
        </template>
      </CTable>
    </ECard>

    <!-- 分页 -->
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

    <UrgentDetailDialog
      slot="dialog"
      :visible.sync="dialogVisible"
      :info="currentRow"
      @close="handleDialogClose"
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
::v-deep .el-pagination {
  text-align: right;
}
</style>
