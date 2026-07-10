/* * @Author: yangjie 应急预案审核页面 * @Date: 2023-03-14 14:55:13 */
<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { getDictList } from '@/http/anji-report/dict-data' // 获取数据字典
import {
  deletePlan,
  getFlowRecordById,
  queryPlan,
} from '@/http/contingency/contingencyPlan.js' // 应急预案接口路径
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import ContingencyPlanDetail from './dialog/contingencyPlanDetail'
import ContingencyPlanRecord from './dialog/contingencyPlanRecord'

export default {
  components: {
    TreeSelect,
    OwnDeparmentTree,
    ContingencyPlanDetail,
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
      depId: '', // 部门id
      planType: '', // 预案类型
      flowCore: '', // 审核状态
    },
    dataRule: {
      depId: [
        {
          required: true,
          message: '部门名称不能为空',
          leaderNametrigger: 'blur',
        },
      ],
    },
    departList: [], // 部门列表
    planTypeOptions: [], // 预案类型数据
    auditStatusOptions: [], // 审核状态数据
  }),
  created() {
    Promise.all([getDepartListSimple()])
      .then((res) => {
        this.departList = res[0].data.result || []
        this.$nextTick(() => {
          this.sForm.depId = this.departList[0].id
          this.getDataList()
        })
      })
      .catch((err) => {
        this.$message.error('获取列表失败')
      })

    this.getSystem()
  },
  methods: {
    // 获取数据字典
    async getSystem() {
      const planType = await getDictList('planType') // 预案类型字典
      const auditStatus = await getDictList('auditStatus') // 审核状态字典
      this.planTypeOptions = planType.data
      this.auditStatusOptions = auditStatus.data
    },
    /* 部门下拉列表选择回调 */
    depChangeEvt(id, name) {
      this.sForm.depId = id || ''
      this.$refs.treeSelect.closeSelect()
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
      if (!this.sForm.depId) {
        this.$message.warning('所属部门不能为空')
        return
      }
      // 查询记录
      this.loading = true
      queryPlan(this.sForm)
        .then((data) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total
            this.$message.success(data.message || '查询成功')
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
    // 查看应急记录
    getFlowRecord(id) {
      getFlowRecordById(id)
        .then((data) => {
          if (data.success) {
            console.log(data)
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 复核、查看、修改
    toDetailClick(row, method) {
      if (method == 'record') {
        this.getFlowRecord(row.id)
        // this.$refs.ContingencyPlanRecord.init(row, method)
      }
      else {
        this.$refs.ContingencyPlanDetail.init(row, method)
      }
    },

    // 重置表单数据
    resetEvent() {
      Object.assign(this.sForm, {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        depId: '', // 部门id
        planType: '', // 预案类型
        flowCore: '', // 审核状态
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
          return deletePlan(row.id)
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
    <OwnDeparmentTree slot="tree" @treeNodeTap="treeNodeTap" />

    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <!-- 表单 -->
      <el-form
        ref="sForm"
        :inline="true"
        :rules="dataRule"
        :model="sForm"
        size="mini"
        class="sForm"
        @submit.native.prevent
      >
        <el-form-item prop="planType" label="预案类型">
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
        <el-form-item prop="depId" label="所属部门">
          <TreeSelect
            ref="treeSelect"
            style="width: 100%"
            :list="departList"
            :props="{
              value: 'id',
              label: 'departmentName',
              children: 'children',
            }"
            :value="sForm.depId"
            @getValue="depChangeEvt"
          />
        </el-form-item>
        <el-form-item prop="flowCore" label="审核状态">
          <el-select
            v-model="sForm.flowCore"
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in auditStatusOptions"
              :key="item.id"
              :label="item.text"
              :value="item.id"
            />
          </el-select>
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
          label="所属部门"
          prop="companyName"
          align="center"
        />
        <el-table-column
          label="预案类型"
          prop="planType"
          align="center"
        />
        <el-table-column
          label="预案名称"
          prop="planName"
          align="center"
        />
        <el-table-column
          label="事故类型"
          prop="accidentType"
          align="center"
        />
        <el-table-column
          label="是否备案"
          prop="isFiling"
          align="center"
        >
          <template slot-scope="scope">
            {{ scope.row.isFiling ? "是" : "否" }}
          </template>
        </el-table-column>
        <el-table-column
          label="备案号"
          prop="filingNumber"
          align="center"
        />
        <el-table-column
          label="附件"
          prop="docPath"
          align="center"
        />
        <el-table-column
          label="审批状态"
          prop="flowCore"
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

    <ECard slot="page" type="footer">
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
    <contingency-plan-detail
      slot="dialog"
      ref="ContingencyPlanDetail"
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
