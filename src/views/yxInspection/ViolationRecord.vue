<script>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, onMounted, reactive, ref } from "vue";
import { ViolationRecordTableConfig } from "./config";
import ViolationHandleDialog from "./components/ViolationHandleDialog.vue";
import {
  queryViolationPage,
  countViolationByAuditResult,
  auditViolation,
} from "@/http/inspection/yx-inspection-api";

export default {
  name: "ViolationRecord",
  components: {
    ViolationHandleDialog,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单
    const searchForm = reactive({
      planName: "",
      postId: "",
      startDate: "",
      endDate: "",
      violationType: "",
      auditResult: "",
      pageNum: 1,
      pageSize: 10,
    });

    // 当前Tab key（用于高亮显示）
    const activeTabKey = ref("all");

    // Tab key到auditResult的映射
    const tabToAuditResult = {
      all: "",
      pending: "1",
      confirmed: "3",
      falseAlarm: "2",
    };

    // 表格数据
    const tableData = ref([]);
    const total = ref(0);

    // 弹窗相关
    const dialogVisible = ref(false);
    const currentRow = ref({});

    // 表格配置
    const tableConfig = ref(ViolationRecordTableConfig);

    // Tab统计
    const tabCounts = reactive({
      all: 0,
      pending: 0,
      confirmed: 0,
      falseAlarm: 0,
    });

    // 类型选项
    const violationTypeOptions = [
      { label: "漏检", value: "NOT_DONE" },
      { label: "超时", value: "NOT_ON_TIME" },
    ];

    // 岗位选项
    const postOptions = [
      { label: "巡检岗", value: "巡检岗" },
      { label: "维修岗", value: "维修岗" },
      { label: "操作岗", value: "操作岗" },
    ];

    // 查询列表数据
    const { refetch, isPending } = useQuery({
      queryKey: ["violationRecordList", searchForm, activeTabKey],
      queryFn: () => {
        const params = { ...searchForm };
        // Tab筛选映射：all不传auditResult，pending传'1'，confirmed传'3'，falseAlarm传'2'
        const auditResult = tabToAuditResult[activeTabKey.value];
        if (auditResult) {
          params.auditResult = auditResult;
        }
        return queryViolationPage(params);
      },
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          const list = (result.list || []).map((item) => ({
            ...item,
            id: item.violationId,
            planName: item.planName,
            department: item.departmentName,
            post: item.postName,
            person: item.violationUserName,
            violationTime: item.violationTime,
            inspectionShift: item.taskName,
            reason: item.violationReasons,
            violationType: item.violationType === "NOT_DONE" ? "漏检" : "超时",
            // 审核结果：待审核-1；误报-2；确认违规-3
            result:
              item.auditResult === "1"
                ? "待审核"
                : item.auditResult === "2"
                ? "误报"
                : item.auditResult === "3"
                ? "确认违规"
                : "-",
            handleOpinion: item.handlingOpinions || "-",
          }));
          tableData.value = list;
          total.value = result.total || 0;
        }
      },
    });

    // 查询状态统计
    const fetchStateCount = async () => {
      try {
        const res = await countViolationByAuditResult(searchForm);
        if (res.data?.success) {
          const result = res.data.result || [];
          // 初始化计数
          let pending = 0, confirmed = 0, falseAlarm = 0;
          // 解析数组格式响应
          result.forEach(item => {
            if (item.auditResult === "1") pending = item.count || 0;
            else if (item.auditResult === "2") falseAlarm = item.count || 0;
            else if (item.auditResult === "3") confirmed = item.count || 0;
          });
          tabCounts.all = pending + confirmed + falseAlarm;
          tabCounts.pending = pending;
          tabCounts.confirmed = confirmed;
          tabCounts.falseAlarm = falseAlarm;
        }
      } catch (e) {
        console.error("获取状态统计失败", e);
      }
    };

    // Tab切换
    const handleTabChange = (tab) => {
      activeTabKey.value = tab;
      searchForm.pageNum = 1;
      refetch();
    };

    // 搜索
    const searchFn = () => {
      searchForm.pageNum = 1;
      refetch();
      fetchStateCount();
    };

    // 重置
    const resetFn = () => {
      searchForm.planName = "";
      searchForm.postId = "";
      searchForm.startDate = "";
      searchForm.endDate = "";
      searchForm.violationType = "";
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      activeTabKey.value = "all";
      refetch();
      fetchStateCount();
    };

    // 导出
    const handleExport = () => {
      proxy.$message.success("正在导出...");
      // 实际项目中调用导出API
    };

    // 查看详情
    const handleView = (row) => {
      currentRow.value = { ...row, dialogType: "view" };
      dialogVisible.value = true;
    };

    // 处理
    const handleProcess = (row) => {
      currentRow.value = { ...row, dialogType: "handle" };
      dialogVisible.value = true;
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
      fetchStateCount();
    });

    return {
      searchForm,
      activeTab: activeTabKey,
      tableData,
      loading: isPending,
      total,
      tableConfig,
      tabCounts,
      violationTypeOptions,
      postOptions,
      dialogVisible,
      currentRow,
      handleTabChange,
      searchFn,
      resetFn,
      handleExport,
      handleView,
      handleProcess,
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
    <!-- 搜索区域：巡检计划、岗位、巡检日期、类型、查询（与原型图一致） -->
    <ECard slot="search" type="search" noneBottom>
      <el-form :model="searchForm" size="mini" inline>
        <el-form-item label="巡检计划">
          <el-input
            v-model="searchForm.planName"
            placeholder="计划名称"
            class="w-40"
            clearable
            @keyup.enter.native="searchFn"
          />
        </el-form-item>
        <el-form-item label="岗位">
          <el-input
            v-model="searchForm.postId"
            placeholder="岗位"
            class="w-40"
            clearable
            @keyup.enter.native="searchFn"
          />
        </el-form-item>
        <el-form-item label="巡检日期">
          <el-date-picker
            v-model="searchForm.startDate"
            type="date"
            placeholder="开始时间"
            size="mini"
            value-format="yyyy-MM-dd"
            class="w-36"
            clearable
          />
          <span class="mx-1">-</span>
          <el-date-picker
            v-model="searchForm.endDate"
            type="date"
            placeholder="结束时间"
            size="mini"
            value-format="yyyy-MM-dd"
            class="w-36"
            clearable
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="searchForm.violationType"
            placeholder="全部"
            class="w-32"
            clearable
          >
            <el-option
              v-for="item in violationTypeOptions"
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
          <el-button icon="el-icon-refresh-right" @click="resetFn">重置</el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <!-- 表格区域 -->
    <ECard slot="table">
      <div class="mb-4 flex justify-between items-center">
        <EButton type="success" icon="el-icon-download" @click="handleExport">
          Excel导出
        </EButton>
        <div class="violation-record-status-tabs">
          <span
            v-for="(count, key) in tabCounts"
            :key="key"
            :class="['tab-item', { active: activeTab === key }]"
            @click="handleTabChange(key)"
          >
            {{
              key === "all"
                ? "全部"
                : key === "pending"
                ? "待审核"
                : key === "confirmed"
                ? "确认"
                : "误报"
            }}（{{ count }}）
          </span>
        </div>
      </div>
      <CTable
        :tableData="tableData"
        :loading="loading"
        :list="tableConfig"
        type="index"
        height="92%"
      >
        <template #violationType="{ info }">
          <el-tag
            size="small"
            :type="info.violationType === '漏检' ? 'danger' : 'warning'"
          >
            {{ info.violationType }}
          </el-tag>
        </template>

        <template #result="{ info }">
          <el-tag
            size="small"
            :type="
              info.result === '确认'
                ? 'success'
                : info.result === '待审核'
                ? 'warning'
                : 'info'
            "
          >
            {{ info.result }}
          </el-tag>
        </template>

        <template #operation="{ info }">
          <EButton type="text" @click="handleView(info)">查看</EButton>
          <EButton
            v-if="info.result === '待审核'"
            type="text"
            @click="handleProcess(info)"
          >
            审核
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

    <!-- 查看/审核弹窗 -->
    <ViolationHandleDialog
      slot="dialog"
      :visible.sync="dialogVisible"
      :info="currentRow"
      @close="handleDialogClose"
      @submit="handleDialogSubmit"
    />
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.violation-record-status-tabs {
  display: flex;
  gap: 0;

  .tab-item {
    padding: 8px 16px;
    cursor: pointer;
    font-size: 14px;
    color: #606266;
    border: 1px solid #dcdfe6;
    margin-left: -1px;
    background: #fff;
    transition: all 0.2s;

    &:first-child {
      margin-left: 0;
      border-radius: 4px 0 0 4px;
    }

    &:last-child {
      border-radius: 0 4px 4px 0;
    }

    &:hover {
      color: #409eff;
    }

    &.active {
      color: #409eff;
      background: #ecf5ff;
      border-color: #409eff;
      z-index: 1;
    }
  }
}

::v-deep .el-pagination {
  text-align: right;
}
</style>
