/* * @Author: yangjie 演练计划审核页面 * @Date: 2023-03-14 14:55:13 */
<script>
import { getDictList } from '@/http/anji-report/dict-data' // 获取数据字典
import { deleteDrillPlan, queryDrillPlan } from '@/http/contingency/drillPlan.js' // 演练计划接口路径
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import ContingencyPlanRecord from './dialog/contingencyPlanRecord'
import DrillPlanDetail from './dialog/drillPlanDetail'

export default {
  components: {
    OwnDeparmentTree,
    DrillPlanDetail,
    ContingencyPlanRecord,
  },
  data: () => ({
    loading: false,
    tableData: [],
    total: 0,
    sForm: {
      pageNum: 1,
      pageSize: 10,
      departmentId: '',
      planType: '', // 预案类型
      drillName: '', // 计划名称
    },
    planTypeOptions: [], // 预案类型数据
  }),
  created() {
    this.getDataList()
    this.getSystem()
  },
  methods: {
    // 获取数据字典
    async getSystem() {
      const { code, data } = await getDictList('planType')
      this.planTypeOptions = data
    },
    // 点击部门树的item
    treeNodeTap(v) {
      // 记录部门id
      if (v.onlyTreeUse)
        return
      this.sForm.pageNum = 1
      this.sForm.departmentId = v.id
      this.getDataList()
    },
    getDataList() {
      // 查询记录
      this.loading = true
      queryDrillPlan(this.sForm)
        .then((data) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total
          }
          else {
            this.$message.warning(data.message || '查询失败')
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 弹框回调
    searchFn() {
      this.sForm.pageNum = 1
      this.getDataList()
    },
    // 复核、查看、修改
    toDetailClick(row, method) {
      if (method == 'record') {
        this.$refs.ContingencyPlanRecord.init(row, method)
      }
      else {
        this.$refs.DrillPlanDetail.init(row, method)
      }
    },

    // 重置表单数据
    resetEvent() {
      Object.assign(this.sForm, {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        planType: '', // 预案类型
        drillName: '', // 计划名称
      })
      this.getDataList()
    },
    // 删除数据
    delFn(row) {
      this.$confirm('您确认要删除数据么', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          return deleteDrillPlan(row.id)
        })
        .then((res) => {
          if (res.code == 200) {
            this.getDataList()
            this.$message.success(res.message || '删除成功')
          }
          else {
            this.$message.error(res.message || '删除失败!')
          }
        })
        .catch(() => {})
    },
  },
}
</script>

<template>
  <KyTreeTable ref="treeTable">
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />

    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <!-- 表单 -->
      <el-form
        ref="sForm"
        :inline="true"
        :model="sForm"
        size="mini"
        class="sForm"
        @submit.native.prevent
      >
        <el-form-item
          prop="planType"
          label="预案类型"
        >
          <el-select
            v-model="sForm.planType"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in planTypeOptions"
              :key="item.id"
              :label="item.text"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          prop="drillName"
          label="计划名称"
        >
          <el-input
            v-model="sForm.drillName"
            placeholder="计划名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            :loading="loading"
            @click="searchFn"
          >
            查询
          </el-button>
          <el-button
            class="reset"
            icon="el-icon-refresh-left"
            :loading="loading"
            @click="resetEvent"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard slot="table">
      <div class="card-cell">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          plain
          @click="toDetailClick(null, 'add')"
        >
          新增
        </el-button>
      </div>
      <!-- 表格 -->
      <el-table
        ref="table"
        v-loading="loading"
        :data="tableData"
        size="mini"
        height="90%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          label="所属公司"
          prop="companyName"
          align="center"
        />
        <el-table-column
          label="计划名称"
          prop="drillName"
          align="center"
        />
        <el-table-column
          label="参演对象"
          prop="drillObject"
          align="center"
        />
        <el-table-column
          label="演练时间"
          prop="drillTime"
          align="center"
        />
        <el-table-column
          label="预案类型"
          prop="planType"
          align="center"
        />
        <el-table-column
          label="演练依据"
          prop="drillItem"
          align="center"
        />
        <el-table-column
          label="演练方式"
          prop="drillWay"
          align="center"
        />
        <el-table-column
          label="负责人"
          prop=""
          align="center"
        />
        <el-table-column
          label="负责部门"
          prop="dutyDeptName"
          align="center"
        />
        <el-table-column
          label="附件"
          prop=""
          align="center"
        />
        <el-table-column
          label="审批状态"
          prop=""
          align="center"
        />
        <el-table-column
          label="操作"
          min-width="140"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="toDetailClick(scope.row, 'record')"
            >
              流转记录
            </el-button>
            <el-button
              type="text"
              @click="toDetailClick(scope.row, 'edit')"
            >
              修改
            </el-button>
            <el-button
              type="text"
              style="color: var(--ky-danger)"
              size="mini"
              @click="delFn(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        :current-page.sync="sForm.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getDataList"
        @current-change="getDataList"
      />
    </ECard>

    <!-- 新增、编辑弹框 -->
    <Drill-plan-detail
      slot="dialog"
      ref="DrillPlanDetail"
      @refreshList="searchFn"
    />
    <!-- 流转记录 -->
    <contingency-plan-record
      slot="dialog"
      ref="ContingencyPlanRecord"
      @refreshList="searchFn"
    />
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.sForm ::v-deep {
  .el-form-item--mini {
    margin-bottom: 18px;
  }
}
</style>
