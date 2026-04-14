<!-- zbs: 风险辨识, 抄自风险事件管理 -->
<script>
import {
  getAnalyseUnitAll,
  getEventCountByUnitTypeFn,
  getRiskEventByPage,
} from "@/http/defense/shandong/riskControl-api.js";
import { RiskLevel } from "@/views/doubleDefense/shandong/config/constant.js";

export default {
  props: {
    uId: "",
  },
  data() {
    return {
      isLoading: false,
      unitList: [], // 所有分析单元
      RiskLevel, // 风险等级下拉列表
      searchData: {
        pageNum: 1,
        pageSize: 10,
        analysisUnitId: "", // 分析单元id
        analysisUnitType: "", // 单元类型
        departmentId: "",
        fuzzyName: "",
        riskLevel: "",
      },
      allDic: {}, // 字典数据
      tableData: [], // 表格数据
      total: 0, // 表格数据总数
      unitTypeOptions: [], // 单元类型；各个类型集合
      currentUnitTypeLabel: "", // 保存当前单元类型name，用于判断表格中文字描述
    };
  },
  computed: {
    // 设置风险等级文字及颜色
    setRiskLevel() {
      return function (riskLv) {
        const riskLvInt = Number.parseInt(riskLv);
        let param = {};
        for (const item of this.RiskLevel) {
          if (item.value == riskLvInt) {
            param = item;
            break;
          }
        }
        return param;
      };
    },
    // 设置所属分析单元文字
    setUnitDes() {
      return function (unitId) {
        let des = "";
        for (const item of this.unitList) {
          if (item.id == unitId) {
            des = item.name;
            break;
          }
        }
        return des;
      };
    },
  },
  created() {
    this.searchData.analysisUnitId = this.uId;
    this.allDic = JSON.parse(sessionStorage.getItem("dictList"));
    // 获取单元类型，各个类型的集合数据
    this.getEventCountByUnitType(true);
  },
  methods: {
    searchClick(isReqParams) {
      this.isLoading = true;
      getRiskEventByPage(this.searchData)
        .then((res) => {
          if (res.data.success) {
            res.data.result.list.forEach((item) => {
              item.analysisUnitType = this.searchData.analysisUnitType;
              item.evaluationDetail = item.evaluationDetail
                ? JSON.parse(item.evaluationDetail)
                : {};
            });
            this.total = res.data.result.total;
            this.tableData = res.data.result.list;
            this.$nextTick(() => {
              this.$refs.table.doLayout();
            });
          } else {
            this.$message.warning(res.data.message || "请求表格数据失败");
          }
        })
        .catch((err) => {
          this.$message.error("请求表格数据出错：", err);
        })
        .finally(() => {
          if (isReqParams === true) {
            this.getParamsData();
          } else {
            this.isLoading = false;
          }
        });
    },
    // 获取其他参数
    async getParamsData() {
      this.isLoading = true;
      const unitRes = await getAnalyseUnitAll();
      this.unitList = unitRes.data.result;
      this.isLoading = false;
    },
    // 获取单元类型，各个类型的集合数据
    getEventCountByUnitType(isReqParams) {
      getEventCountByUnitTypeFn(this.searchData).then(({ data }) => {
        this.unitTypeOptions = data.result || [];
        if (!data.result.length) {
          this.analysisTypelist = this.$dictUtils.getDictList("analysis_type");
          this.unitTypeOptions = this.analysisTypelist.map((item) => {
            return {
              groupBy: item.id,
              count: 0,
            };
          });
        }
        this.searchData.analysisUnitType =
          this.searchData.analysisUnitType || this.unitTypeOptions[0].groupBy;
        this.currentUnitTypeLabel = this.$dictUtils.getDictLabelById(
          "analysis_type",
          this.searchData.analysisUnitType
        );
        this.searchClick(isReqParams);
      });
    },
    typeChange(type) {
      this.searchData.analysisUnitType = type;
      this.currentUnitTypeLabel = this.$dictUtils.getDictLabelById(
        "analysis_type",
        this.searchData.analysisUnitType
      );
      this.searchClick();
    },
  },
};
</script>

<template>
  <div class="h-full fxbs-table">
    <div class="mb-4">
      <el-button
        v-for="(item, index) in unitTypeOptions"
        :key="index"
        plain
        :type="searchData.analysisUnitType === item.groupBy ? 'primary' : ''"
        @click="typeChange(item.groupBy)"
      >
        {{ $dictUtils.getDictLabelById("analysis_type", item.groupBy) }}
        {{ item.count }}
      </el-button>
    </div>

    <el-table
      slot="table"
      ref="table"
      v-loading="isLoading"
      height="82%"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      align="center"
      highlight-current-row
      :border="true"
      :cell-style="{ color: '#000' }"
      size="mini"
    >
      <el-table-column label="序号" type="index" align="center" width="50" />
      <el-table-column
        label="责任组织"
        prop="responsibilityDeptName"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="所属分析单元"
        prop="analysisUnitId"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          {{ setUnitDes(scope.row.analysisUnitId) }}
        </template>
      </el-table-column>
      <el-table-column label="单元类型" prop="analysisUnitType" align="center">
        <template slot-scope="scope">
          {{ $dictUtils.getDictLabelById("analysis_type", scope.row.analysisUnitType) }}
        </template>
      </el-table-column>
      <el-table-column
        v-if="currentUnitTypeLabel === '作业活动'"
        label="作业步骤"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <RichText :des="scope.row.eventName" />
        </template>
      </el-table-column>
      <el-table-column
        v-if="currentUnitTypeLabel === '设备设施'"
        label="检查项目"
        align="center"
        min-width="100px"
      >
        <template slot-scope="scope">
          <RichText :des="scope.row.eventName" />
        </template>
      </el-table-column>
      <el-table-column label="风险等级" align="center" min-width="100px">
        <template slot-scope="scope">
          <span
            class="risk-des"
            :style="`background:${setRiskLevel(scope.row.riskLevel).color};`"
            >{{ setRiskLevel(scope.row.riskLevel).label }}</span
          >
        </template>
      </el-table-column>
      <el-table-column
        v-if="currentUnitTypeLabel === '作业活动'"
        label="危险源或潜在事件"
        align="center"
        min-width="130px"
      >
        <template slot-scope="scope">
          <RichText :des="scope.row.eventDesc" />
        </template>
      </el-table-column>
      <el-table-column
        v-if="currentUnitTypeLabel === '设备设施'"
        label="标准"
        align="center"
        min-width="130px"
      >
        <template slot-scope="scope">
          <RichText :des="scope.row.eventDesc" />
        </template>
      </el-table-column>
      <el-table-column label="L" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.evaluationDetail.lec_l || "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="E" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.evaluationDetail.lec_e || "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="C" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.evaluationDetail.lec_c || "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column label="风险值" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.evaluationDetail.risk_val || "-" }}</span>
        </template>
      </el-table-column>
      <el-table-column
        min-width="130px"
        label="可能导致的事故"
        prop="accidentType"
        align="center"
      />
    </el-table>

    <!-- 分页器 -->
    <el-pagination
      :current-page.sync="searchData.pageNum"
      :page-size.sync="searchData.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      @current-change="searchClick"
      @size-change="searchClick"
    />
  </div>
</template>

<style lang="scss" scoped>
.fxbs-table {
  // 限制深度选择器的作用范围，只影响当前组件内的 el-table
  ::v-deep .el-table {
    .cell {
      color: #333333 !important;
    }
  }
}
.risk-des {
  padding: 4px 6px;
  border-radius: 2px;
  background: #67c23a;
}
</style>
