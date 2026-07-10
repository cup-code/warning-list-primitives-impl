<script>
import { pick } from 'lodash'
import FlowChart from '@/components/SelfFlowChart/FlowChart'

import {
  flowableProcessHistoryDeleteAllProcIns,
  getFlowableProcessHistoryListData,
  getFlowableTaskDef,
} from '@/http/safe-production/flowable-api'

export default {
  components: {
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
      isSearchCollapse: false,
      loading: false,
      visible: false,
      dataListSelections: [],
      processInstanceId: '',
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
      getFlowableProcessHistoryListData({
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
    trace(row) {
      this.processInstanceId = row.processInstanceId
      this.visible = true
      this.$nextTick(() => {
        this.$refs.preview.init()
      })
    },
    detail(row) {
      getFlowableTaskDef({
        procInsId: row.processInstanceId,
        procDefId: row.processDefinitionId,
      }).then(({ data }) => {
        if (data.success) {
          this.$router.push({
            path: '/flowable/task/TaskFormDetail',
            query: {
              readOnly: true,
              title: row.vars.title,
              formTitle: row.vars.title,
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
    // 撤销申请
    del(id) {
      const ids
        = id
          || this.dataListSelections
            .map((item) => {
              return item.id
            })
            .join(',')
      this.$confirm(`确定要删除历史流程吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        flowableProcessHistoryDeleteAllProcIns(ids)
          .then(({ data }) => {
            if (data && data.success) {
              this.$message.success({
                dangerouslyUseHTMLString: true,
                message: data.msg,
              })
              this.refreshList()
            }
          })
          .finally(() => {
            this.loading = false
          })
      })
    },
  },
}
</script>

<template>
  <div class="historyList-process-flowable">
    <ECard>
      <div class="card-cell">
        <EButton
          plain
          type="danger"
          size="mini"
          icon="delete"
          :disabled="dataListSelections.length <= 0"
          @click="del()"
        >
          删除
        </EButton>
      </div>

      <el-table
        v-loading="loading"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        :data="dataList"
        size="small"
        height="calc(100vh - 220px)"
        class="table"
        @selection-change="selectionChangeHandle"
      >
        :data="dataList" size="small" height="calc(100vh - 220px)" v-loading="loading"
        @selection-change="selectionChangeHandle" class="table">
        <el-table-column
          type="selection"
          header-align="center"
          align="center"
          width="50"
        />

        <el-table-column
          prop="vars.title"
          show-overflow-tooltip
          min-width="180px"
          label="实例名称"
        />

        <el-table-column
          prop="processDefinitionName"
          label="流程名称"
        />

        <el-table-column
          prop="vars.userName"
          label="流程发起人"
        />

        <el-table-column
          prop="deleteReason"
          width="150"
          show-overflow-tooltip
          label="流程状态"
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
          prop="startTime"
          show-overflow-tooltip
          label="发起时间 / 结束时间"
        >
          <template slot-scope="scope">
            <p>{{ scope.row.startTime | formatDate }}</p>
            <p class="text-grey">
              {{ scope.row.endTime | formatDate }}
            </p>
          </template>
        </el-table-column>

        <el-table-column
          header-align="right"
          align="right"
          width="150"
          label="操作"
        >
          <template slot-scope="scope">
            <EButton
              type="text"
              size="mini"
              @click="trace(scope.row)"
            >
              流程图
            </EButton>
            <EButton
              type="text"
              size="mini"
              @click="detail(scope.row)"
            >
              历史
            </EButton>
            <EButton
              type="text"
              size="mini"
              @click="del(scope.row.id)"
            >
              删除
            </EButton>
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

    <el-dialog
      class="dialog-historyList-process-flowable"
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
  </div>
</template>

<style lang="scss" scoped>
.historyList-process-flowable {
  padding: 10px;
  height: calc(100vh - 50px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
.dialog-historyList-process-flowable {
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
