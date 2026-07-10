/* * @Author: yangjie 应急队伍页面 * @Date: 2023-03-14 14:55:13 */
<script>
import { deleteTeam, queryTeam } from '@/http/contingency/contingencyTeam.js' // 应急队伍接口路径
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import ContingencyTeamDetail from './dialog/contingencyTeamDetail'

export default {
  components: {
    OwnDeparmentTree,
    ContingencyTeamDetail,
  },
  data: () => ({
    loading: false,
    tableData: [],
    total: 0,
    sForm: {
      pageNum: 1,
      pageSize: 10,
      departmentId: '',
      teamType: '', // 队伍类型
      name: '', // 队伍名称
    },
    teamTypeOptions: [], // 队伍类型数据
  }),
  created() {
    this.getDataList()
    // this.getSystem()
  },
  methods: {
    // 获取数据字典
    // async getSystem() {
    //   const { code, data } = await getDictList('teamType')
    //   this.teamTypeOptions = data
    // },
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
      queryTeam(this.sForm)
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
      this.$refs.ContingencyTeamDetail.init(row, method)
    },

    // 重置表单数据
    resetEvent() {
      Object.assign(this.sForm, {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        teamType: '', // 队伍类型
        name: '', // 队伍名称
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
          return deleteTeam(row.id)
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
          prop="name"
          label="队伍名称"
        >
          <el-input
            v-model="sForm.name"
            placeholder="队伍名称"
            clearable
          />
        </el-form-item>
        <el-form-item
          prop="teamType"
          label="队伍类别"
        >
          <el-select
            v-model="sForm.teamType"
            placeholder="请选择"
            clearable
            style="width: 100%"
          >
            <!-- <el-option v-for="item in teamTypeOptions" :key="item.id" :label="item.text" :value="item.id" /> -->
            <el-option
              v-for="item in $dictUtils.getDictList('teamType')"
              :key="item.id"
              :label="item.dictName"
              :value="item.dictCode"
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
          v-if="hasBtnPermission('contingency_team_add')"
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
        :border="false"
        class="customer-table"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          label="队伍类型"
          prop="teamType"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('teamType', scope.row.teamType) }}
          </template>
        </el-table-column>
        <el-table-column
          label="队伍名称"
          prop="name"
          align="center"
        />
        <el-table-column
          label="组长部门"
          prop="department"
          align="center"
        />
        <el-table-column
          label="组长姓名"
          prop="leaderName"
          align="center"
        />
        <el-table-column
          label="组长电话"
          prop="leaderPhone"
          align="center"
        />
        <el-table-column
          label="队员人数"
          prop="teamPersonNum"
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
              v-if="hasBtnPermission('contingency_team_view')"
              type="text"
              @click="toDetailClick(scope.row, 'view')"
            >
              查看
            </el-button>
            <el-button
              v-if="hasBtnPermission('contingency_team_modify')"
              type="text"
              @click="toDetailClick(scope.row, 'edit')"
            >
              修改
            </el-button>
            <el-button
              v-if="hasBtnPermission('contingency_team_delete')"
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
    <contingency-team-detail
      slot="dialog"
      ref="ContingencyTeamDetail"
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
