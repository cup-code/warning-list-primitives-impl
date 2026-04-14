<script>
export default {
  props: {
    resultData: {
      type: Object,
      default() {
        return {}
      },
    },
    showList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      searchData: {
        pageNum: 1,
        pageSize: 20,
      },
    }
  },
  methods: {
    searchClick() {},
  },
}
</script>

<template>
  <div class="step3-box">
    <div class="step3-tip">
      提示：读取数据 {{ resultData.total }} 条，合格数据 {{ resultData.correct }} 条，异常数据
      <span style="color: var(--ky-danger)">{{ resultData.wrong }}</span>
      条，导入将跳过异常数据，并生成错误数据Excel，供您下载并修改重新导入
    </div>
    <el-table
      height="100%"
      :data="resultData.datalist"
      border
      :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
      align="center"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      />
      <el-table-column
        label="数据检测结果"
        align="center"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.errorMsg">{{ scope.row.errorMsg }}</span>
          <span
            v-else
            style="color: #67c23a"
          >合格</span>
        </template>
      </el-table-column>
      <el-table-column
        v-for="item in showList"
        :key="item.prop"
        :label="item.label"
        :prop="item.prop"
        align="center"
      >
        <!-- true:是 false:否 -->
        <template slot-scope="scope">
          <span v-if="typeof scope.row[item.prop] === 'boolean'">{{
            scope.row[item.prop] ? '是' : '否'
          }}</span>
          <span v-else>{{ scope.row[item.prop] }}</span>
        </template>
      </el-table-column>
      <!-- <el-table-column label="公司" align="center" prop="companyName" />
      <el-table-column label="部门" align="center" prop="departmentName" />
      <el-table-column label="姓名" align="center" prop="fullName" />
      <el-table-column label="证照类型" align="center" prop="licenceType" />
      <el-table-column label="证照名称" align="center" prop="licenceName" />
      <el-table-column label="证件号" align="center" prop="licenceNumber" />
      <el-table-column label="有效开始时间" align="center" prop="startTime" />
      <el-table-column label="有效结束时间" align="center" prop="endTime" />
      <el-table-column label="下次审核时间" align="center" prop="nextReview" />
      <el-table-column label="颁发机构" align="center" prop="mechanism" /> -->
    </el-table>
    <div class="step3-page">
      <span>共 {{ resultData.total || 0 }} 条</span>
      <!-- <el-pagination
        @current-change="searchClick"
        @size-change="searchClick"
        :current-page.sync="searchData.pageNum"
        :page-size.sync="searchData.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        layout="total, prev, pager, next, jumper"
        :total="resultData.total"
      /> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.step3-box {
  .step3-tip {
    border: 1px solid #409eff;
    color: #409eff;
    font-size: 12px;
    padding: 5px;
    margin: 0 0 10px 0;
    background: rgba(64, 158, 255, 0.15);
    border-radius: 5px;
  }
  .step3-page {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
