<!-- @description： investigationReport 工伤管理 -->
<script>
import { deleteInjuryonTheJob, workInjuryManagement } from '@/http/accidentManage/investigation'
import { getAllUsersByTenant } from '@/http/safe-production/depart-manage-api'
import addWorkInjury from './components/addWorkInjury.vue'

export default {
  name: 'workInjuryManage',
  components: {
    AddWorkInjury: addWorkInjury,
  },
  data() {
    return {
      isLoading: false,
      companyList: [],
      dateRange: [],
      tableData: [],
      departList: [],
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        startDate: '',
        endDate: '',
        accidentDescription: '',
        party: '',
      },
      total: 0,
    }
  },
  watch: {
    dateRange(val, oldVal) {
      this.queryParams.startDate = val?.[0] || null
      this.queryParams.endDate = val?.[1] || null
    },
  },
  created() {
    this.getList()
    this.getUsetList()
  },
  methods: {
    delHtmlTag(str) {
      return str.replace(/<[^>]+>/g, '').replace(/&nbsp;/gi, '')
    },
    // 获取当事人数据
    async getUsetList() {
      const userData = JSON.parse(sessionStorage.getItem('user'))
      const res = await getAllUsersByTenant(userData.tenantId)
      if (res.data.success) {
        this.departList = res.data.result || []
      }
    },
    handleQuery() {
      this.queryParams.pageNum = 1
      this.getList()
    },
    resetQuery() {
      this.dateRange = []
      Object.assign(this.queryParams, this.$options.data().queryParams)
      this.handleQuery()
    },
    async getList() {
      this.isLoading = true
      const res = await workInjuryManagement(this.queryParams)
      this.isLoading = false
      if (res.success) {
        this.tableData = res.result.list || []
        this.total = res.result.total
      }
      else {
        this.$message.warning(res.message || '查询失败')
      }
    },
    // 顶部按钮
    operateBtn(flag) {
      if (flag == 'add') {
        // 新增调查报告
        this.$refs.addWorkInjuryDialog.visible = true
        this.$refs.addWorkInjuryDialog.page_type = 'add'
      }
    },
    // 列表栏按钮
    operateFn(data, flag) {
      if (flag == 'look') {
        // 查看
        this.$refs.addWorkInjuryDialog.visible = true
        this.$refs.addWorkInjuryDialog.init(data, flag)
      }
      else if (flag == 'edit') {
        // 编辑
        this.$refs.addWorkInjuryDialog.visible = true
        this.$refs.addWorkInjuryDialog.init(data, flag)
      }
      else if (flag == 'del') {
        // 删除
        this.$confirm('是否确认删除当前数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(async () => {
          this.isLoading = true
          const res = await deleteInjuryonTheJob({ id: data.id })
          this.isLoading = false
          if (res.success) {
            this.handleQuery()
            this.$message.success(res.message || '删除成功')
          }
          else {
            this.$message.warning(res.message || '删除失败')
          }
        })
      }
    },
  },
}
</script>

<template>
  <SearchTable v-loading="isLoading">
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      inline
    >
      <el-form-item label="事故简述">
        <el-input
          v-model="queryParams.accidentDescription"
          placeholder="事故简述"
          clearable
        />
      </el-form-item>
      <el-form-item label="当事人">
        <el-select
          v-model="queryParams.party"
          placeholder="请选择"
          style="width: 100%"
          filterable
        >
          <el-option
            v-for="item in departList"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="事故发生时间">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd HH:mm:ss"
          unlink-panels
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-search"
          @click="handleQuery"
        >
          查询
        </el-button>
        <el-button
          size="mini"
          icon="el-icon-refresh-right"
          @click="resetQuery"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <div slot="auxiliary">
      <el-button
        v-if="hasBtnPermission('work_injury_add')"
        type="primary"
        size="mini"
        icon="el-icon-plus"
        plain
        @click="operateBtn('add')"
      >
        新增
      </el-button>
    </div>
    <!-- 表格 -->
    <el-table
      slot="table"
      height="100%"
      :data="tableData"
      :header-cell-style="{
        borderLeft: 'none',
        borderRight: 'none',
        background: '#F6F7FA',
      }"
      align="center"
    >
      <el-table-column
        fixed
        label="序号"
        align="center"
        min-width="50"
      >
        <template slot-scope="scope">
          {{ queryParams.pageSize * (queryParams.pageNum - 1) + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column
        label="事故编号"
        prop="accidentNumber"
        align="center"
      />

      <el-table-column
        :show-overflow-tooltip="true"
        label="事故发生时间"
        prop="timeOfAccident"
        align="center"
        min-width="100px"
      />
      <el-table-column
        label="事故名称"
        prop="accidentName"
        align="center"
      />
      <el-table-column
        :show-overflow-tooltip="true"
        label="事故简述"
        prop="remarks"
        align="center"
      >
        <template slot-scope="scope">
          {{ delHtmlTag(scope.row.remarks) }}
        </template>
      </el-table-column>
      <el-table-column
        label="事故类型"
        prop="accidentType"
        align="center"
      />
      <el-table-column
        label="事故性质"
        prop="accidentNature"
        align="center"
      >
        <template slot-scope="scope">
          {{ $dictUtils.getDictLabel('character_accident', scope.row.accidentNature) }}
        </template>
      </el-table-column>
      <el-table-column
        label="当事人"
        prop="party"
        align="center"
      />
      <el-table-column
        label="负责人"
        prop="personInCharge"
        align="center"
      />
      <el-table-column
        label="工伤认定"
        prop="identificationStatus"
        align="center"
      />
      <el-table-column
        label="伤残鉴定"
        prop="appraisalStatus"
        align="center"
      />
      <el-table-column
        label="停工留薪期(天)"
        prop="daysOfWorkStoppageAndSalaryRetention"
        width="110"
        align="center"
      />
      <el-table-column
        label="费用合计(元)"
        prop="totalExpenses"
        align="center"
        width="110"
      />
      <el-table-column
        label="操作"
        width="120"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('work_injury_view')"
            type="text"
            @click="operateFn(scope.row, 'look')"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('work_injury_modify')"
            type="text"
            style="color: var(--ky-warning)"
            @click="operateFn(scope.row, 'edit')"
          >
            修改
          </el-button>
          <!-- <el-button type="text" style="color: var(--ky-danger)" @click="operateFn(scope.row, 'del')">删除</el-button> -->
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
      style="margin: 0 20px 0 0"
      :current-page.sync="queryParams.pageNum"
      :page-size.sync="queryParams.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      @current-change="getList"
      @size-change="getList"
    />
    <add-work-injury
      slot="dialog"
      ref="addWorkInjuryDialog"
      @getList="getList"
    />
  </SearchTable>
</template>

<style scoped lang="scss"></style>
