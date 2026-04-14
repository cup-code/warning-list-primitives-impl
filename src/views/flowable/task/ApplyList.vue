<script>
import { pick } from 'lodash'
import {
  flowableProcessRevokeProcIns,
  getFlowableTaskDef,
  getFlowableTaskMyApplyed,
} from '@/http/safe-production/flowable-api'

import UrgeForm from './UrgeForm'

export default {
  components: {
    UrgeForm,
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
      dataListSelections: [],
      processPhotoUrl: '',
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

      getFlowableTaskMyApplyed({
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
      this.processPhotoUrl = `${this.$http.BASE_URL}/flowable/task/trace/photo/${row.processInstanceId}`
      this.visible = true
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
    // 重新填写
    restart(row) {
      // 读取流程表单
      getFlowableTaskDef({
        procInsId: row.processInstanceId,
        procDefId: row.processDefinitionId,
      }).then(({ data }) => {
        if (data.success) {
          this.$router.push({
            path: '/flowable/task/TaskFormEdit',
            query: {
              status: 'start',
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
    revoke(row) {
      this.$confirm(`确定要撤销该流程吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        flowableProcessRevokeProcIns({
          id: row.processInstanceId,
        }).then(({ data }) => {
          if (data && data.success) {
            this.$message.success(data.msg)
            this.refreshList()
          }
        })
      })
    },
    urge(row) {
      this.$refs.urgeForm.init()
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
          prop="searchDates"
          label="创建时间"
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
        height="calc(100% - 84px)"
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
          show-overflow-tooltip
          min-width="180px"
          label="流程标题"
        />

        <el-table-column
          prop="processDefinitionName"
          show-overflow-tooltip
          label="流程名称"
        />

        <el-table-column
          prop="taskName"
          show-overflow-tooltip
          label="当前节点"
        />

        <el-table-column
          prop="status"
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
            <p style="margin: 0; padding: 0">
              {{ scope.row.startTime | formatDate }}
            </p>
            <p style="margin: 0; padding: 0; color: #999">
              {{ scope.row.endTime | formatDate }}
            </p>
          </template>
        </el-table-column>

        <el-table-column
          width="150"
          header-align="center"
          align="center"
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

            <el-dropdown
              size="small"
              style="margin-left: 10px"
            >
              <el-button
                type="text"
                size="mini"
              >
                更多<i class="el-icon-arrow-down el-icon--right" />
              </el-button>

              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="scope.row.code === 1">
                  <el-button
                    type="text"
                    size="mini"
                    @click="urge(scope.row)"
                  >
                    催办
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item v-if="scope.row.code === 1">
                  <el-button
                    type="text"
                    size="mini"
                    @click="revoke(scope.row)"
                  >
                    撤销
                  </el-button>
                </el-dropdown-item>
                <el-dropdown-item v-if="scope.row.code === 3 || scope.row.code === 4">
                  <el-button
                    type="text"
                    color="red"
                    size="mini"
                    @click="restart(scope.row)"
                  >
                    编辑
                  </el-button>
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
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
      title="查看流程历史"
      :close-on-click-modal="true"
      :visible.sync="visible"

      height="600px"
    >
      <iframe
        :src="processPhotoUrl"
        frameborder="0"
        scrolling="auto"
        width="100%"
        height="600px"
      />
    </el-dialog>

    <urge-form ref="urgeForm" />
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
</style>
