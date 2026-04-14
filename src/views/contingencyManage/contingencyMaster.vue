/* * @Author: yangjie 应急专家页面 * @Date: 2023-03-15 10:32:13 */
<script>
import { deleteMaster, queryMaster } from '@/http/contingency/contingencyMaster.js' // 应急专家接口路径
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import contingencyMasterDetail from './dialog/contingencyMasterDetail'

export default {
  components: {
    OwnDeparmentTree,
    ContingencyMasterDetail: contingencyMasterDetail,
  },
  data: () => ({
    loading: false,
    tableData: [],
    total: 0,
    sForm: {
      pageNum: 1,
      pageSize: 10,
      departmentId: '',
      fullName: '', // 专家姓名
      professionTerritory: '', // 专业领域
    },
  }),
  created() {
    this.getDataList()
  },
  methods: {
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
      queryMaster(this.sForm)
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
      this.$refs.contingencyMasterDetail.init(row, method)
    },

    // 重置表单数据
    resetEvent() {
      Object.assign(this.sForm, {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        fullName: '', // 专家姓名
        professionTerritory: '', // 专业领域
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
          return deleteMaster(row.id)
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
    <!-- 表单 -->

    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        ref="sForm"
        :inline="true"
        :model="sForm"
        size="mini"
        class="sForm"
        @submit.native.prevent
      >
        <el-form-item
          prop="fullName"
          label="专家姓名"
        >
          <el-input
            v-model="sForm.fullName"
            placeholder="专家姓名"
            clearable
          />
        </el-form-item>
        <el-form-item
          prop="professionTerritory"
          label="专业领域"
        >
          <el-input
            v-model="sForm.professionTerritory"
            placeholder="专业领域"
            clearable
          />
        </el-form-item>
        <el-form-item>
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
        </el-form-item>
      </el-form>
    </ECard>

    <ECard slot="table">
      <div class="card-cell">
        <EButton
          v-if="hasBtnPermission('contingency_master_add')"
          type="primary"
          size="mini"
          btnIcon="el-icon-plus"
          plain
          @click="toDetailClick(null, 'add')"
        >
          新增
        </EButton>
      </div>
      <!-- 表格 -->
      <el-table
        ref="table"
        v-loading="loading"
        :data="tableData"
        size="mini"
        height="90%"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        :border="false"
        class="customer-table"
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
          label="专家姓名"
          prop="fullName"
          align="center"
        />
        <el-table-column
          label="专家电话"
          prop="phone"
          align="center"
        />
        <el-table-column
          label="专业领域"
          prop="professionTerritory"
          align="center"
        />
        <el-table-column
          label="学历"
          prop="education"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('qualificationType', scope.row.education) }}
          </template>
        </el-table-column>
        <el-table-column
          label="专业"
          prop="profession"
          align="center"
        />
        <el-table-column
          label="备注"
          prop="remark"
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
              v-if="hasBtnPermission('contingency_master_view')"
              type="text"
              @click="toDetailClick(scope.row, 'view')"
            >
              查看
            </el-button>
            <el-button
              v-if="hasBtnPermission('contingency_master_modify')"
              type="text"
              @click="toDetailClick(scope.row, 'edit')"
            >
              修改
            </el-button>
            <el-button
              v-if="hasBtnPermission('contingency_master_delete')"
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

    <!-- 新增、编辑、查看弹框 -->
    <contingency-master-detail
      slot="dialog"
      ref="contingencyMasterDetail"
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
