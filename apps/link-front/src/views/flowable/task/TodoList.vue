<script>
import { pick } from 'lodash'
import FlowChart from '@/components/SelfFlowChart/FlowChart'
import UserSelect from '@/components/userSelect/UserSelectDialog'

import {
  flowableTaskClaim,
  flowableTaskDelegate,
  flowableTaskUnclaim,
  getFlowableTaskDef,
  getFlowableTaskTodo,
} from '@/http/safe-production/flowable-api'

export default {
  components: {
    UserSelect,
    FlowChart,
  },
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
      currentTask: null,
      dataListSelections: [],
      processInstanceId: '',
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
      getFlowableTaskTodo({
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
    claim(row) {
      flowableTaskClaim({
        taskId: row.task.id,
      }).then(({ data }) => {
        if (data.success) {
          this.$message.success(data.msg)
          this.refreshList()
        }
      })
    },
    unclaim(row) {
      flowableTaskUnclaim({
        taskId: row.task.id,
      }).then(({ data }) => {
        if (data.success) {
          this.$message.success(data.msg)
          this.refreshList()
        }
      })
    },
    todo(row) {
      getFlowableTaskDef({
        taskId: row.task.id,
        taskName: row.task.name,
        taskDefKey: row.task.taskDefinitionKey,
        procInsId: row.task.processInstanceId,
        procDefId: row.task.processDefinitionId,
        procDefKey: row.task.processDefKey,
        status: row.status,
      }).then(({ data }) => {
        if (data.success) {
          this.$router.push({
            path: '/flowable/task/TaskForm',
            query: {
              formTitle: `${row.vars.title}`,
              title: `审批【${row.task.name || ''}】`,
              ...pick(
                data.flow,
                'formType',
                'formReadOnly',
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
    trace(row) {
      this.processInstanceId = row.task.processInstanceId
      this.visible = true
      this.$nextTick(() => {
        this.$refs.preview.init()
      })
    },
    transferTask(row) {
      this.currentTask = row.task
      this.$refs.userSelect.init()
    },
    selectUsersToTransferTask(user) {
      flowableTaskDelegate({
        taskId: this.currentTask.id,
        userId: user[0].id,
      }).then(({ data }) => {
        this.$message.success(data.msg)
        this.refreshList()
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
  <KyTreeTable ref="treeTable" :isShowLeft="false">
    <ECard slot="search" type="search" noneBottom>
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
          label="创建时间"
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

    <ECard slot="table">
      <div class="card-cell">
        <el-button-group class="pull-right">
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
        height="90%"
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
          prop="vars.title"
          min-width="180px"
          show-overflow-tooltip
          label="实例标题"
        >
          <template slot-scope="scope">
            <el-link
              v-if="scope.row.status === 'todo'"
              style="font-size: 12px"
              type="primary"
              :underline="false"
              @click="todo(scope.row)"
            >
              {{ scope.row.vars.title }}
            </el-link>
            <span v-else>{{ scope.row.vars.title }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="processDefinitionName"
          label="流程名称"
        />

        <el-table-column
          prop="task.name"
          label="当前环节"
        >
          <template slot-scope="scope">
            <el-tag>{{ scope.row.task.name }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="vars.userName"
          label="流程发起人"
        />

        <el-table-column
          prop="task.createTime"
          show-overflow-tooltip
          label="创建时间"
        >
          <template slot-scope="scope">
            {{ scope.row.task.createTime | formatDate }}
          </template>
        </el-table-column>

        <el-table-column
          :key="Math.random()"
          fixed="right"
          header-align="center"
          align="center"
          width="200"
          label="操作"
        >
          <template slot-scope="scope">
            <!-- <el-button v-if="scope.row.status === 'claim'" type="text" size="mini" @click="claim(scope.row)">签收任务</el-button> -->
            <el-button
              type="text"
              size="mini"
              @click="todo(scope.row)"
            >
              办理
            </el-button>
            <!-- <el-button v-if="scope.row.status === 'todo'" type="text" size="mini" @click="transferTask(scope.row)">委派</el-button> -->
            <!-- <el-button v-if="scope.row.claimTime" type="text" size="mini" @click="unclaim(scope.row)">取消签收</el-button> -->
            <el-button
              type="text"
              size="mini"
              @click="trace(scope.row)"
            >
              进度
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <ECard slot="page" type="footer">
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

    <el-dialog slot="dialog"
      class="dialog-todoList-task-flowable"
      title="查看进度"
      :close-on-click-modal="true"
      :visible.sync="visible"

      width="70%"
      height="600px"
    >
      <flow-chart
        ref="preview"
        :processInstanceId="processInstanceId"
      />
    </el-dialog>

    <user-select slot="dialog"
      ref="userSelect"
      :limit="1"
      @doSubmit="selectUsersToTransferTask"
    />
  </KyTreeTable>
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
      float: right;
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
.dialog-todoList-task-flowable {
  .el-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: calc(100% - 30px);
    max-width: calc(100% - 30px);
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    .el-dialog__header {
      border-bottom: 1px solid #e8e8e8;
    }
    .el-dialog__body {
      overflow: auto;
    }
    .el-dialog__footer {
      border-top: 1px solid #e8e8e8;
      border-radius: 0 0 4px 4px;
    }
  }
}
</style>
