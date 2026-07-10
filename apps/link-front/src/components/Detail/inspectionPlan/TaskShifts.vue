/* * @Author: xiaorui 巡检计划详情页的任务班次 * @Date: 2022-05-11 15:20:39 * @Last Modified by:
xiaorui * @Last Modified time: 2023-02-06 15:54:40 */
<script>
import { getPlanInfoByIdFn, getTaskScheduleFn } from '@/http/dev_new/inspection-api'
import TemporaryScheduleForm from './dialog/temporaryScheduleForm'

export default {
  components: {
    TemporaryScheduleForm,
  },
  props: {
    id: String,
    method: String,
  },
  data() {
    const currentYear = new Date().getFullYear()
    return {
      searchForm: {
        pageNum: 1,
        pageSize: 10,
        year: currentYear,
        isExecute: false, // 为true返回执行纪录,为false返回排班记录
      },
      yearOption: [
        {
          value: currentYear - 1,
          label: currentYear - 1,
        },
        {
          value: currentYear,
          label: currentYear,
        },
        {
          value: currentYear + 1,
          label: currentYear + 1,
        },
      ],
      tableData: [],
      total: 0,
      loading: false,
      planBaseInfo: {},
    }
  },
  mounted() {
    if (this.id === 'null') {
      return
    }
    getPlanInfoByIdFn(this.id).then(({ data }) => {
      this.planBaseInfo = data.result || {}
    })
    this.searchForm.planId = this.id
    this.getTableData()
  },
  methods: {
    // 获取数据列表
    getTableData() {
      this.loading = true
      getTaskScheduleFn(this.searchForm).then(({ data }) => {
        this.loading = false
        if (data.success) {
          this.tableData = data.result.list || []
          this.total = data.result.total
        }
        else {
          this.$message.error(data.message || '查询列表失败')
        }
      })
    },
    // 每页数
    sizeChangeHandle(val) {
      this.searchForm.pageSize = val
      this.searchForm.pageNum = 1
      this.getTableData()
    },
    // 当前页
    currentChangeHandle(val) {
      this.searchForm.pageNum = val
      this.getTableData()
    },
    searchFn() {
      if (this.id === 'null') {
        this.$message.error('请先保存巡检计划基础信息')
        return
      }
      this.searchForm.pageNum = 1
      this.getTableData()
    },
    // 添加临时排班
    addTemporarySchedule() {
      if (this.id === 'null') {
        this.$message.error('请先保存巡检计划基础信息')
        return
      }
      this.$refs.temporaryScheduleForm.init(this.id)
    },
    backFn() {
      this.$router.back(-1)
    },
  },
}
</script>

<template>
  <div class="contentArea">
    <el-row calss="mb-3">
      <el-col :span="14">
        <el-form
          ref="searchForm"
          :inline="true"
          :model="searchForm"
          @submit.native.prevent
        >
          <el-form-item
            prop="postName"
            label="任务年份"
          >
            <el-select v-model="searchForm.year">
              <el-option
                v-for="item in yearOption"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="searchFn"
            >
              查询
            </el-button>
            <el-button
              type="primary"
              :disabled="method === 'view'"
              @click="addTemporarySchedule"
            >
              添加临时班次
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>
      <el-col
        :span="10"
        class="btnArea"
      >
        <el-button
          style="margin-left: 10px"
          @click="backFn"
        >
          返回
        </el-button>
      </el-col>
    </el-row>
    <el-table
      v-loading="loading"
      :data="tableData"
      highlight-current-row
      height="71vh"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      class="table"
    >
      <el-table-column
        type="index"
        label="序号"
        width="50"
      />
      <el-table-column
        align="center"
        prop="taskName"
        label="任务名称"
      />
      <el-table-column
        align="center"
        prop="type"
        label="类型"
      >
        <template slot-scope="scope">
          {{ scope.row.type === '0' ? '计划班次' : '临时班次' }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        min-width="120px"
        label="排班时间"
      >
        <template slot-scope="scope">
          {{ `${scope.row.scheduleStartTime}至${scope.row.scheduleEndTime}` }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="expireTime"
        min-width="120px"
        label="任务失效时间"
      />
      <el-table-column
        align="center"
        prop="postName"
        label="岗位角色"
      />
      <el-table-column
        align="center"
        prop="executeUsersName"
        label="巡检人"
      >
        <template slot-scope="scope">
          {{ scope.row.executeUsersName.join(',') }}
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        prop="remarks"
        label="备注"
      />
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
    <temporary-schedule-form
      ref="temporaryScheduleForm"
      :planBaseInfo="planBaseInfo"
      @refreshDataList="getTableData"
    />
  </div>
</template>

<style lang="scss" scoped>
.btnArea {
  display: flex;
  justify-content: flex-end;
}
</style>
