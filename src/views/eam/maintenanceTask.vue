/* * @Author: xiaorui * @Date: 2022-07-29 16:19:54 维保任务页面 * @Last Modified by: xiaorui * @Last
Modified time: 2022-10-28 14:58:27 */
<script>
import { getTaskListByPageFn } from '@/http/dev_new/maintenance-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'

export default {
  components: {
    OwnDeparmentTree,
  },
  data() {
    return {
      isLoading: false,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        planName: '',
      },
      tableData: [],
      total: 0,
      cycleOptions: [
        {
          label: '时',
          value: 'HOUR',
        },
        {
          label: '天',
          value: 'DAY',
        },
        {
          label: '周',
          value: 'WEEK',
        },
        {
          label: '月',
          value: 'MONTH',
        },
        {
          label: '年',
          value: 'YEAR',
        },
      ],
    }
  },
  created() {
    this.getTableData()
  },
  methods: {
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getTaskListByPageFn(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total || 0
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      this.searchData.departmentId = data.id
      this.getTableData()
    },
    // 点击查询按钮
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 查看维保计划
    viewPlan(v) {
      this.$router.push({
        name: 'maintenancePlanDetail',
        params: {
          id: v.id,
          method: 'view',
        },
      })
    },
    getLabel(val, list) {
      return this[list].find((item) => {
        return item.value === val
      }).label
    },
    resetSearch() {
      this.searchData.planName = ''
      this.getTableData()
    },
  },
}
</script>

<template>
  <TreeTable v-loading="isLoading">
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />

    <ECard
      slot="search"
      customStyle="margin:0px"
      type="search"
    >
      <el-form
        inline
        label-width="100"
        :model="searchData"
        @submit.native.prevent
      >
        <el-form-item
          prop="assetDeviceName"
          label="任务名称"
        >
          <el-input
            v-model="searchData.planName"
            placeholder="任务名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            :loading="isLoading"
            @click="searchFn"
          >
            查询
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button
            class="reset"
            icon="el-icon-refresh-right"
            @click="resetSearch()"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard slot="table">
      <el-table
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        height="100%"
      >
        <el-table-column
          label="任务名称"
          align="center"
          prop="planName"
          min-width="180"
        >
          <template slot-scope="scope">
            <span
              class="check"
              @click="viewPlan(scope.row)"
            >{{ scope.row.planName + getLabel(scope.row.cycleFiled, 'cycleOptions') }}保养</span>
          </template>
        </el-table-column>
        <el-table-column
          label="部门车间"
          align="center"
          prop="departmentName"
        />
        <el-table-column
          label="设备"
          align="center"
          prop="deviceNameList"
          min-width="180"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.deviceNameList.join('、') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="执行人"
          align="center"
          prop="executeUsernameList"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.executeUsernameList.join('、') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="周期"
          align="center"
          prop="cycleValue"
        />
        <el-table-column
          label="单位"
          align="center"
          prop="cycleFiled"
        >
          <template slot-scope="scope">
            <span>{{ getLabel(scope.row.cycleFiled, 'cycleOptions') }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="维保时间" align="center" prop="planStartDate" min-width="150"/> -->
        <el-table-column
          label="任务开始时间"
          align="center"
          prop="nextExecuteTime"
          min-width="150"
        />
        <el-table-column
          label="操作"
          align="center"
          width="120"
          fixed="right"
        >
          <template slot-scope="scope">
            <EButton
              icon="check"
              type="text"
              @click="viewPlan(scope.row)"
            >
              查看
            </EButton>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        style="text-align: right"
        :current-page.sync="searchData.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getTableData"
        @current-change="getTableData"
      />
    </ECard>
    <!-- 搜索栏 -->

    <!-- 表格 -->
  </TreeTable>
</template>
