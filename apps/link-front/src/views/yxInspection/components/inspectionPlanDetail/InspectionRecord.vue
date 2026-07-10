<script>
import { queryExecuteRecordByPlan } from "@/http/inspection/yx-inspection-api";

export default {
  name: "YxInspectionPlanInspectionRecord",
  props: {
    id: String,
  },
  data() {
    const currentYear = new Date().getFullYear();
    return {
      loading: false,
      tableData: [],
      total: 0,
      searchForm: {
        pageNum: 1,
        pageSize: 10,
        planId: "",
        year: currentYear,
        isExecute: true, // true返回执行记录
      },
      yearOptions: [
        { value: currentYear - 1, label: currentYear - 1 },
        { value: currentYear, label: currentYear },
        { value: currentYear + 1, label: currentYear + 1 },
      ],
    };
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        if (val && val !== "null") {
          this.searchForm.planId = val;
          this.getTableData();
        }
      },
    },
  },
  methods: {
    async getTableData() {
      this.loading = true;
      try {
        const { data } = await queryExecuteRecordByPlan(this.searchForm);
        this.loading = false;
        if (data.success) {
          this.tableData = data.result?.list || [];
          this.total = data.result?.total || 0;
        } else {
          this.$message.error(data.message || "查询失败");
        }
      } catch (error) {
        this.loading = false;
        this.$message.error("查询失败");
      }
    },
    searchFn() {
      if (!this.id || this.id === "null") {
        this.$message.error("请先保存巡检计划基础信息");
        return;
      }
      this.searchForm.pageNum = 1;
      this.getTableData();
    },
    sizeChangeHandle(val) {
      this.searchForm.pageSize = val;
      this.searchForm.pageNum = 1;
      this.getTableData();
    },
    currentChangeHandle(val) {
      this.searchForm.pageNum = val;
      this.getTableData();
    },
    viewFn(row) {
      // 跳转到巡检记录详情页
      this.$router.push({
        name: "yxInspectionRecordDetail",
        params: {
          id: row.id,
          lineName: row.lineName,
          postName: row.postName,
        },
      });
    },
    backFn() {
      this.$router.back(-1);
    },
  },
};
</script>

<template>
  <div class="inspection-record">
    <el-row>
      <el-col :span="14">
        <el-form :inline="true" :model="searchForm" @submit.native.prevent>
          <el-form-item label="计划年份">
            <el-select v-model="searchForm.year" placeholder="选择年份">
              <el-option
                v-for="item in yearOptions"
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
      </el-col>
      <el-col :span="10" class="btnArea">
        <el-button style="margin-left: 10px" @click="backFn">返回</el-button>
      </el-col>
    </el-row>

    <el-table
      v-loading="loading"
      :data="tableData"
      highlight-current-row
      height="65vh"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      border
      size="small"
    >
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column align="center" prop="taskName" label="任务名称" min-width="120" />
      <el-table-column align="center" min-width="160" label="排班时间">
        <template slot-scope="scope">
          {{
            `${scope.row.scheduleStartTime || ""} 至 ${scope.row.scheduleEndTime || ""}`
          }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="postName" label="岗位角色" min-width="100" />
      <el-table-column
        align="center"
        prop="executeUsersName"
        label="巡检人"
        min-width="120"
      >
        <template slot-scope="scope">
          {{ (scope.row.executeUsersName || []).join("、") }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="executeStartTime"
        min-width="140"
        label="开始时间"
      />
      <el-table-column
        align="center"
        prop="executeEndTime"
        min-width="140"
        label="结束时间"
      />
      <el-table-column label="操作" align="center" width="100" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="viewFn(scope.row)"> 查看详情 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :current-page="searchForm.pageNum"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="searchForm.pageSize"
      :total="total"
      background
      style="margin-top: 10px; text-align: right"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
    />
  </div>
</template>

<style lang="scss" scoped>
.inspection-record {
  height: 80vh;
  overflow: auto;
  padding: 0 20px;
}
.btnArea {
  display: flex;
  justify-content: flex-end;
}
</style>
