<script>
import { useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, onMounted, reactive, ref } from "vue";
import { InspectionRecordTableConfig } from "./config";
import { queryExecuteRecordPage } from "@/http/inspection/yx-inspection-api";
import { getAllPostByDepartFn } from "@/http/safe-production/post-manage-api";
import InspectionReportPrint from "./components/InspectionReportPrint.vue";

export default {
  name: "InspectionRecord",
  components: {
    InspectionReportPrint,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单
    const searchForm = reactive({
      postId: "",
      result: "",
      dateRange: [],
      pageNum: 1,
      pageSize: 10,
    });

    // 表格数据
    const tableData = ref([]);
    const loading = ref(false);
    const total = ref(0);

    // 表格配置
    const tableConfig = ref(InspectionRecordTableConfig);

    // 岗位选项
    const postOptions = ref([]);

    // 结果选项
    const resultOptions = [
      { label: "正常", value: "正常" },
      { label: "异常", value: "异常" },
    ];

    // 获取岗位列表（使用当前用户部门）
    const initPostOptions = async () => {
      const user = proxy.$store.state.user.user || {};
      const departmentId = user.departmentId;
      if (!departmentId) return;

      try {
        const { data } = await getAllPostByDepartFn(departmentId);
        if (data?.success) {
          postOptions.value = (data.result || []).map((item) => ({
            label: item.postName,
            value: item.id,
          }));
        }
      } catch (error) {
        console.error("获取岗位列表失败", error);
      }
    };

    // 构建查询参数
    const buildQueryParams = (form) => {
      const params = {
        pageNum: form.pageNum,
        pageSize: form.pageSize,
      };

      // 结果映射：正常→false，异常→true
      if (form.result) {
        params.abnormal = form.result === "异常";
      }

      // 岗位ID
      if (form.postId) {
        params.postId = form.postId;
      }

      // 日期范围
      if (form.dateRange && form.dateRange.length === 2) {
        params.startDate = form.dateRange[0] + ":00";
        params.endDate = form.dateRange[1] + ":59";
      }

      return params;
    };

    // 查询列表数据
    const { refetch, isPending } = useQuery({
      queryKey: ["inspectionRecordList", searchForm],
      queryFn: () => queryExecuteRecordPage(buildQueryParams(searchForm)),
      onSuccess: ({ data }) => {
        if (data?.success) {
          const result = data.result || {};
          const list = (result.list || []).map((item, index) => ({
            ...item,
            index: (searchForm.pageNum - 1) * searchForm.pageSize + index + 1,
            // 字段映射
            taskName: item.taskName || "",
            scheduledTime: item.scheduledTime || "",
            department: item.departmentName || "",
            inspectionPost: item.postName || "",
            inspector: item.executeUsername || "",
            startTime: item.startTime || "",
            endTime: item.endTime || "",
            result: item.abnormal ? "异常" : "正常",
          }));
          tableData.value = list;
          total.value = result.total || 0;
        }
      },
    });

    // 监听 loading 状态
    loading.value = isPending;

    // 初始化岗位选项
    onMounted(() => {
      initPostOptions();
    });

    // 搜索
    const searchFn = () => {
      searchForm.pageNum = 1;
      refetch();
    };

    // 重置
    const resetFn = () => {
      searchForm.postId = "";
      searchForm.result = "";
      searchForm.dateRange = [];
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      refetch();
    };

    // 打印报告弹窗
    const printDialogVisible = ref(false);
    const currentPrintRow = ref({});

    // 查看详情：跳转详情页
    const handleView = (row) => {
      proxy.$router.push({
        name: "yxInspectionRecordDetail",
        params: {
          id: row.scheduleRecordId,
          lineName: row.lineName,
          postName: row.postName,
        },
      });
    };

    // 打印报告
    const handlePrint = (row) => {
      currentPrintRow.value = row;
      printDialogVisible.value = true;
    };

    // 关闭打印弹窗
    const handlePrintClose = () => {
      printDialogVisible.value = false;
      currentPrintRow.value = {};
    };

    // Excel 导出
    const handleExportExcel = () => {
      proxy.$message.success("Excel导出功能开发中");
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
      postOptions,
      resultOptions,
      searchFn,
      resetFn,
      handleView,
      handlePrint,
      handleExportExcel,
      pageSizeFn,
      pageCurFn,
      // 打印相关
      printDialogVisible,
      currentPrintRow,
      handlePrintClose,
    };
  },
};
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="false" class="h-full">
    <!-- 搜索区域 -->
    <ECard slot="search" type="search" noneBottom>
      <el-form :model="searchForm" size="mini" inline>
        <el-form-item label="巡检岗位">
          <el-select
            v-model="searchForm.postId"
            placeholder="请选择"
            class="w-32"
            clearable
          >
            <el-option
              v-for="item in postOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="巡检日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="选择开始时间"
            end-placeholder="选择结束时间"
            size="mini"
            value-format="yyyy-MM-dd HH:mm"
            :default-time="['00:00:00', '23:59:59']"
          />
        </el-form-item>
        <el-form-item label="结果">
          <el-select
            v-model="searchForm.result"
            placeholder="请选择"
            class="w-32"
            clearable
          >
            <el-option
              v-for="item in resultOptions"
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
        <el-button type="success" icon="el-icon-download" @click="handleExportExcel">
          Excel导出
        </el-button>
      </div>

      <CTable :tableData="tableData" :loading="loading" :list="tableConfig" height="92%">
        <!-- 结果列：正常绿色、异常红色 -->
        <template #result="{ info }">
          <span :class="info.abnormal === true ? 'text-danger' : 'text-success'">
            {{ info.abnormal ? "异常" : "正常" }}
          </span>
        </template>
        <template #scheduledTime="{ info }">
          {{ info.scheduleStartTime + "至" + info.scheduleEndTime }}
        </template>

        <template #executeUsersName="{ info }">
          {{ info.executeUsersName.join(",") }}
        </template>

        <!-- 操作列：查看详情、打印报告 -->
        <template #operation="{ info }">
          <EButton type="text" @click="handleView(info)"> 查看详情 </EButton>
          <EButton type="text" @click="handlePrint(info)"> 打印报告 </EButton>
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

    <!-- 打印报告弹窗 -->
    <InspectionReportPrint
      slot="dialog"
      :visible.sync="printDialogVisible"
      :schedule-record-id="currentPrintRow.scheduleRecordId"
      :line-name="currentPrintRow.lineName"
      :post-name="currentPrintRow.postName"
      @close="handlePrintClose"
    />
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.text-success {
  color: #67c23a;
  font-weight: 500;
}
.text-danger {
  color: #f56c6c;
  font-weight: 500;
}
::v-deep .el-pagination {
  text-align: right;
}
</style>
