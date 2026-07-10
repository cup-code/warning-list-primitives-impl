<script>
import { pick } from 'lodash'

import {
  flowableTaskCallback,
  getFlowableTaskDef,
  getFlowableTaskHistoric,
} from '@/http/safe-production/flowable-api'

export default {
  data() {
    return {
      searchForm: {
        beginDate: '',
        endDate: '',
      },
      searchDates: '',
      dataList: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      loading: false,
      visible: false,
      dataListSelections: [],
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            },
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            },
          },
        ],
      },
    }
  },
  watch: {
    searchDates() {
      if (this.searchDates) {
        this.searchForm.beginDate = this.searchDates[0]
        this.searchForm.endDate = this.searchDates[1]
      }
      else {
        this.searchForm.beginDate = ''
        this.searchForm.endDate = ''
      }
    },
  },
  mounted() {
    this.refreshList()
  },
  methods: {
    // 获取数据列表
    refreshList() {
      this.loading = true
      getFlowableTaskHistoric({
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        ...this.searchForm,
      })
        .then(({ data }) => {
          if (data && data.success) {
            this.dataList = data.page.list
            this.total = data.page.count
          }
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val
      this.pageNo = 1
      this.refreshList()
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageNo = val
      this.refreshList()
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val
    },
    detail(row) {
      getFlowableTaskDef({
        taskDefKey: row.taskDefinitionKey,
        procInsId: row.processInstanceId,
        procDefId: row.processDefinitionId,
      }).then(({ data }) => {
        if (data.success) {
          this.$router.push({
            path: '/flowable/task/TaskFormDetail',
            query: {
              readOnly: true,
              taskId: row.executionId,
              title: `${row.processDefinitionName}【${row.name}】`,
              formTitle: `${row.processDefinitionName}`,
              ...pick(
                data.flow,
                'formType',
                'formUrl',
                'procDefKey',
                'taskDefKey',
                'procInsId',
                'procDefId',
                'taskId',
                'status',
                'title',
                'businessId',
              ),
            },
          })
        }
      })
    },
    // 取回
    callback(row) {
      console.log(row)
      this.$confirm(`确定撤销该已办任务吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        flowableTaskCallback({
          processInstanceId: row.processInstanceId,
          preTaskDefKey: row.taskDefinitionKey,
          preTaskId: row.id,
          currentTaskId: row.currentTask.id,
          currentTaskDefKey: row.currentTask.taskDefinitionKey,
        })
          .then(({ data }) => {
            if (data && data.success) {
              this.$message.success(data.msg)
              this.refreshList()
            }
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
    resetSearch() {
      this.searchDates = ''
      this.$refs.searchForm.resetFields()
      this.$nextTick(() => {
        this.refreshList()
      })
    },
  },
}
</script>

<template>
  <div class="page-container">
    <ECard type="search">
      <el-form
        ref="searchForm"
        size="small"
        :inline="true"
        class="query-form"
        :model="searchForm"
        @keyup.enter.native="refreshList()"
        @submit.native.prevent
      >
        <el-form-item
          label="完成时间"
          prop="searchDates"
        >
          <el-date-picker
            v-model="searchDates"
            type="daterange"
            size="mini"
            align="right"
            value-format="yyyy-MM-dd hh:mm:ss"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-search"
            @click="refreshList()"
          >
            查询
          </el-button>
          <el-button
            size="mini"
            icon="el-icon-refresh-right"
            @click="resetSearch()"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>
    <ECard>
      <div class="card-cell">
        <el-button-group>
          <el-tooltip
            class="item"
            effect="dark"
            content="刷新"
            placement="top"
          >
            <el-button
              type="default"
              size="mini"
              icon="el-icon-refresh"
              @click="refreshList"
            />
          </el-tooltip>
        </el-button-group>
      </div>

      <el-table
        v-loading="loading"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        :data="dataList"
        size="mini"
        height="calc(100vh - 300px)"
        class="table"
        @selection-change="selectionChangeHandle"
      >
        <el-table-column
          type="selection"
          header-align="center"
          align="center"
          width="50"
        />

        <el-table-column
          prop="name"
          show-overflow-tooltip=""
          label="任务"
        >
          <template slot-scope="scope">
            {{ scope.row.name }}
            <el-button
              v-if="scope.row.back"
              type="warning"
              size="mini"
              @click="callback(scope.row)"
            >
              撤销
            </el-button>
          </template>
        </el-table-column>

        <el-table-column
          prop="vars.title"
          show-overflow-tooltip
          min-width="180px"
          label="实例标题"
        />

        <el-table-column
          prop="processDefinitionName"
          label="流程名称"
        />

        <el-table-column
          prop="status"
          show-overflow-tooltip
          label="办理状态"
        >
          <template slot-scope="scope">
            <el-tag
              :type="scope.row.level"
              effect="dark"
              size="small"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="vars.userName"
          label="流程发起人"
        />

        <el-table-column
          prop="endTime"
          show-overflow-tooltip
          label="完成时间"
        >
          <template slot-scope="scope">
            {{ scope.row.endTime | formatDate }}
          </template>
        </el-table-column>

        <el-table-column
          :key="Math.random()"
          fixed="right"
          header-align="center"
          align="center"
          width="100"
          label="操作"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              @click="detail(scope.row)"
            >
              历史
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <ECard type="footer">
      <el-pagination
        style="text-align: right"
        :current-page="pageNo"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
      />
    </ECard>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  //   padding: 10px;
  //   height: calc(100vh - 50px);
  //   box-sizing: border-box;
  //   display: flex;
  //   flex-direction: column;
  .query-form {
    // box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.1);
    // padding-left: 12px;
    // padding-top: 12px;
    // margin-bottom: 10px;
    .el-form-item {
      margin-bottom: 12px;
    }
    .el-form-item__label {
      font-size: 14px !important;
    }
  }
  .main-con {
    box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.1);
    flex: 1;
    padding: 10px;
    .pull-right {
      //   float: right;
    }
    .el-table {
      margin-top: 10px;
      margin-bottom: 10px;
      border-top: 1px solid #ebeef5;
      .el-table__header {
        thead tr {
          background-color: #f6f7fa;
          font-weight: 400;
          th {
            background-color: #f6f7fa;
            font-weight: 400;
          }
        }
      }
    }
    .el-pagination {
      text-align: right;
    }
  }
}
</style>
