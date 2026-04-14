<script>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, reactive, ref } from "vue";
import { SafetyRecordTableConfig } from "./config";
import SafetyHandleDialog from "./components/SafetyHandleDialog.vue";
import { querySafeRecord, auditSafeRecord } from "@/http/inspection/yx-inspection-api";

export default {
  name: "SafetyRecord",
  components: {
    SafetyHandleDialog,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单（与原型一致：巡检计划、岗位、巡检日期、结果、查询）
    const searchForm = reactive({
      planName: "",
      postId: "",
      reportTimeStart: "",
      reportTimeEnd: "",
      auditResult: "",
      pageNum: 1,
      pageSize: 10,
    });

    // 当前高亮的统计标签（仅展示，不触发筛选）
    const activeTab = ref("all");

    // 表格数据
    const tableData = ref([]);
    const total = ref(0);

    // 弹窗相关
    const dialogVisible = ref(false);
    const currentRow = ref({});

    // 表格配置
    const tableConfig = ref(SafetyRecordTableConfig);

    // Tab统计（与原型一致）
    const tabCounts = reactive({
      all: 0,
      pending: 0,
      confirmed: 0,
      misoperation: 0,
    });

    // 结果选项（搜索栏下拉）
    const resultOptions = [
      { label: "确认安全", value: "0" },
      { label: "误操作", value: "1" },
    ];

    // 岗位选项
    const postOptions = [
      { label: "巡检岗", value: "巡检岗" },
      { label: "维修岗", value: "维修岗" },
      { label: "操作岗", value: "操作岗" },
    ];

    // 查询列表数据
    const { refetch, isPending } = useQuery({
      queryKey: ["safetyRecordList", searchForm],
      queryFn: () => querySafeRecord({ ...searchForm }),
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          const list = (result.list || []).map((item) => ({
            ...item,
            id: item.id,
            planName: item.planName,
            department: item.departmentName,
            post: item.postName,
            person: item.userName,
            recordTime: item.reportTime,
            inspectionShift: item.taskName,
            status: item.auditState === "0" ? "待审核" : "已处理",
            result:
              item.auditResult === "0"
                ? "安全"
                : item.auditResult === "1"
                ? "误操作"
                : "待审核",
            handleOpinion: item.auditOpinion || "-",
          }));
          tableData.value = list;
          total.value = result.total || 0;
        }
      },
    });

    // Tab点击（仅切换高亮状态，不触发筛选）
    const handleTabChange = (tab) => {
      activeTab.value = tab;
    };

    // 搜索
    const searchFn = () => {
      searchForm.pageNum = 1;
      refetch();
    };

    // 重置
    const resetFn = () => {
      searchForm.planName = "";
      searchForm.postId = "";
      searchForm.reportTimeStart = "";
      searchForm.reportTimeEnd = "";
      searchForm.auditResult = "";
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      refetch();
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

    return {
      searchForm,
      activeTab,
      tableData,
      loading: isPending,
      total,
      tableConfig,
      tabCounts,
      resultOptions,
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
    <!-- 搜索区域：巡检计划、岗位、巡检日期、结果、查询（与原型一致） -->
    <ECard slot="search" type="search" noneBottom>
      <div class="p-4">
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
          <el-form-item label="上报时间">
            <el-date-picker
              v-model="searchForm.reportTimeStart"
              type="datetime"
              placeholder="开始时间"
              size="mini"
              value-format="yyyy-MM-dd HH:mm:ss"
              class="w-44"
              clearable
            />
            <span class="mx-1">-</span>
            <el-date-picker
              v-model="searchForm.reportTimeEnd"
              type="datetime"
              placeholder="结束时间"
              size="mini"
              value-format="yyyy-MM-dd HH:mm:ss"
              class="w-44"
              clearable
            />
          </el-form-item>
          <el-form-item label="结果">
            <el-select
              v-model="searchForm.auditResult"
              placeholder="全部"
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
            <el-button icon="el-icon-refresh-right" @click="resetFn">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </ECard>

    <!-- 表格区域 -->
    <ECard slot="table">
      <div class="mb-4 flex justify-between items-center">
        <EButton type="success" icon="el-icon-download" @click="handleExport">
          Excel导出
        </EButton>
        <div class="safety-record-status-tabs">
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
                ? "确认安全"
                : "误操作"
            }}（{{ count }}）
          </span>
        </div>
      </div>
      <CTable
        type="index"
        :tableData="tableData"
        :loading="loading"
        :list="tableConfig"
        height="92%"
      >
        <!-- 状态列 -->
        <template #auditState="{ info }">
          {{ info.auditState === "0" ? "待审核" : "已处理" }}
        </template>

        <!-- 结果列：结果,0:安全|1:误操作 -->
        <template #auditResult="{ info }">
          <el-tag
            size="small"
            :type="
              info.auditResult === '0'
                ? 'success'
                : info.auditResult === '1'
                ? 'info'
                : 'primary'
            "
          >
            {{
              info.auditResult === "0"
                ? "安全"
                : info.auditResult === "1"
                ? "误操作"
                : "待审核"
            }}
          </el-tag>
        </template>

        <!-- 操作列：查看、审核（待审核时显示） -->
        <template #operation="{ info }">
          <EButton type="text" @click="handleView(info)">查看</EButton>
          <EButton
            v-if="info.status === '待审核'"
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
    <SafetyHandleDialog
      slot="dialog"
      :visible.sync="dialogVisible"
      :info="currentRow"
      @close="handleDialogClose"
      @submit="handleDialogSubmit"
    />
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.safety-record-status-tabs {
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
