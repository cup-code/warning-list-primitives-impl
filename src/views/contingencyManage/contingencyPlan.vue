/* * @Author: yangjie 应急预案页面 * @Date: 2023-03-14 14:55:13 */
<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { deletePlan, queryPlan } from '@/http/contingency/contingencyPlan.js' // 应急预案接口路径
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { showFileWindow } from '@/utils/checkFile.js'
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
  data() {
    return {
      cannot: false,
      loading: false,
      tableData: [],
      total: 0,
      sForm: {
        pageNum: 1,
        pageSize: 10,
        depId: '', // 部门id
        planType: '', // 预案类型
        flowCore: '', // 审核状态
        planName: '', // 预案名称
        showMore: false,
      },
      dataRule: {},
      departList: [], // 部门列表
      planTypeOptions: [], // 预案类型数据
      auditStatusOptions: [], // 审核状态数据
    }
  },
  created() {
    // canAddOrUpdate().then(data => {
    //     if(data.result) {
    //         this.cannot = false;
    //     }
    // })
    Promise.all([getDepartListSimple()])
      .then((res) => {
        this.departList = res[0].data.result || []
        this.$nextTick(() => {
          this.getDataList()
        })
      })
      .catch((err) => {
        this.$message.error('获取列表失败')
      })
  },
  methods: {
    showFileWindow,
    // 点击部门树的item
    treeNodeTap(v) {
      // 记录部门id
      if (v.onlyTreeUse)
        return
      this.sForm.pageNum = 1
      this.sForm.depId = v.id
      this.getDataList()
    },
    getDataList() {
      // 查询记录
      this.loading = true
      queryPlan(this.sForm)
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
        this.$refs.ContingencyPlanDetail.init(row, method)
      }
    },

    // 重置表单数据
    resetEvent() {
      Object.assign(this.sForm, {
        pageNum: 1,
        pageSize: 10,
        depId: '', // 部门id
        planType: '', // 预案类型
        flowCore: '', // 审核状态
        planName: '', // 预案名称
        showMore: false,
      })
      this.getDataList()
      this.$refs.depTree.refreshTree()
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
    toggleMore() {
      this.sForm.showMore = !this.sForm.showMore
    },
  },
}
</script>

<template>
  <TreeTable ref="treeTable">
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      ref="depTree"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 表单 -->
    <ECard
      slot="search"
      type="search"
      style="margin-bottom: 0"
    >
      <el-form
        ref="sForm"
        :rules="dataRule"
        :inline="true"
        :model="sForm"
        label-width="62px"
        @submit.native.prevent
      >
        <el-form-item label="预案名称">
          <el-input v-model="sForm.planName" placeholder="预案名称" />
        </el-form-item>
        <el-form-item label="预案类型">
          <el-select
            v-model="sForm.planType"
            clearable
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('planType')"
              :key="item.id"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="sForm.showMore" label="审核状态">
          <el-select
            v-model="sForm.flowCore"
            clearable
            placeholder="请选择"
            style="width: 100%"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('auditStatus')"
              :key="item.id"
              :label="item.dictName"
              :value="item.dictName"
            />
          </el-select>
        </el-form-item>
        <EButton
          type="primary"
          btnIcon="el-icon-search"
          :loading="loading"
          @click="searchFn"
        >
          查询
        </EButton>
        <EButton
          class="reset"
          btnIcon="el-icon-refresh-left"
          :loading="loading"
          @click="resetEvent"
        >
          重置
        </EButton>
        <EButton
          type="text"
          style="margin-left: 8px"
          @click="toggleMore"
        >
          {{ sForm.showMore == true ? "收起" : "高级筛选" }}
          <i :class="sForm.showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
        </EButton>
      </el-form>
    </ECard>

    <!-- 表格 -->
    <ECard slot="table">
      <div class="card-cell">
        <EButton
          v-if="hasBtnPermission('contingency_plan_add')"
          type="primary"
          size="mini"
          btnIcon="el-icon-plus"
          plain
          :disabled="cannot"
          @click="toDetailClick(null, 'add')"
        >
          新增
        </EButton>
      </div>
      <el-table
        ref="table"
        v-loading="loading"
        :data="tableData"
        size="mini"
        height="92%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        class="customer-table"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          label="所属部门"
          prop="depName"
          align="center"
        />
        <el-table-column
          label="预案类型"
          prop="planType"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel("planType", scope.row.planType) }}
          </template>
        </el-table-column>
        <el-table-column
          label="预案名称"
          prop="planName"
          align="center"
        />
        <el-table-column
          label="事故类型"
          prop="accidentType"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel("reasonType", scope.row.accidentType) }}
          </template>
        </el-table-column>
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
          align="center"
          prop="docPath"
          min-width="100"
        >
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.docPath"
              type="text"
              @click="showFileWindow(scope.row.docPath)"
            >
              查看
            </el-button>
            <el-tag v-else>
              无
            </el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column label="审批状态" prop="flowCore" align="center"></el-table-column> -->
        <el-table-column
          label="操作"
          min-width="150"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="hasBtnPermission('contingency_plan_turn')"
              type="text"
              @click="toDetailClick(scope.row, 'record')"
            >
              流转记录
            </el-button>
            <el-button
              v-if="hasBtnPermission('contingency_plan_view')"
              type="text"
              @click="toDetailClick(scope.row, 'view')"
            >
              查看
            </el-button>
            <el-button
              v-if="
                hasBtnPermission('contingency_plan_modify')
                  && !scope.row.isShow
                  && scope.row.flowCore !== '审核通过'
              "
              type="text"
              :disabled="cannot"
              @click="toDetailClick(scope.row, 'edit')"
            >
              修改
            </el-button>
            <!-- <el-button v-if="hasBtnPermission('contingency_plan_audit') && scope.row.isShow" @click="toDetailClick(scope.row, 'check')" type="text">审核</el-button> -->
            <el-button
              v-if="hasBtnPermission('contingency_plan_delete') && !scope.row.isShow"
              type="text"
              style="color: var(--ky-danger)"
              size="mini"
              :disabled="cannot"
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
    <div slot="dialog">
      <!-- 新增、编辑弹框 -->
      <contingency-plan-detail
        ref="ContingencyPlanDetail"
        @refreshList="searchFn"
      />
      <!-- 流转记录 -->
      <contingency-plan-record
        ref="ContingencyPlanRecord"
        @refreshList="searchFn"
      />
    </div>
  </TreeTable>
</template>

<style lang="scss" scoped>
.sForm ::v-deep {
  .el-form-item--mini {
    margin-bottom: 18px;
  }
}
</style>
