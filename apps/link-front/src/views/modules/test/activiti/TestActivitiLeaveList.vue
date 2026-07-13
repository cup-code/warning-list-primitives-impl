<script>
import { pick } from 'lodash'
import moment from 'moment'
import FlowChart from '@/components/SelfFlowChart/FlowChart'
import { getFlowableTaskDef } from '@/http/safe-production/flowable-api'
import TestActivitiLeaveForm from './TestActivitiLeaveForm'

export default {

  components: {
    TestActivitiLeaveForm,
    FlowChart,
  },
  data() {
    return {
      window,
      searchForm: {
        leaveType: '',
        startTime: '',
        endTime: '',
        reason: '',
      },
      dataList: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      orderBy: '',
      loading: false,
      visible: false,
      processInstanceId: '',
      hasAddBtn: false,
      addInfo: {},
    }
  },

  computed: {
    userName() {
      return JSON.parse(sessionStorage.getItem('user')).username
    },
  },
  created() {
    this.getAddParam()
  },
  mounted() {
    this.refreshList()
  },

  methods: {
    // 获取数据列表
    refreshList() {
      this.loading = true
      this.$http({
        url: '/test/activiti/testActivitiLeave/list',
        method: 'get',
        params: {
          pageNo: this.pageNo,
          pageSize: this.pageSize,
          orderBy: this.orderBy,
          ...this.searchForm,
        },
      }).then(({ data }) => {
        if (data && data.success) {
          this.dataList = data.page.list
          this.total = data.page.count
          this.loading = false
        }
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

    // 排序
    sortChangeHandle(obj) {
      if (obj.order === 'ascending') {
        this.orderBy = `${obj.prop} asc`
      }
      else if (obj.order === 'descending') {
        this.orderBy = `${obj.prop} desc`
      }
      else {
        this.orderBy = ''
      }
      this.refreshList()
    },

    // 查看
    view(id) {
      this.$refs.testActivitiLeaveForm.init('view', id)
    },

    // 办理
    todo(row) {
      getFlowableTaskDef({
        taskId: row.taskId,
        taskName: row.curLink,
        taskDefKey: row.taskDefKey,
        procInsId: row.procInsId,
        procDefId: row.procDefId,
        procDefKey: row.processDefKey,
        status: 'todo',
      }).then(({ data }) => {
        if (data.success) {
          this.$router.push({
            path: '/flowable/task/TaskForm',
            query: {
              formTitle: row.title,
              title: `审批【${row.curLink || ''}】`,
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

    // 进度
    trace(row) {
      this.processInstanceId = row.procInsId
      this.visible = true
      this.$nextTick(() => {
        this.$refs.preview.init()
      })
    },

    // 历史
    detail(row) {
      getFlowableTaskDef({
        taskDefKey: row.taskDefKey,
        procInsId: row.procInsId,
        procDefId: row.procDefId,
      }).then(({ data }) => {
        if (data.success) {
          this.$router.push({
            path: '/flowable/task/TaskFormDetail',
            query: {
              readOnly: true,
              taskId: row.taskId,
              title: `${row.procDefName} 【${row.curLink}】`,
              formTitle: row.procDefName,
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
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.refreshList()
    },
    // 请求 新建功能需要的参数 的接口
    getAddParam() {
      this.$http.get('/test/activiti/testActivitiLeave/queryProcDefId').then(({ data }) => {
        if (data.code === 200) {
          this.hasAddBtn = data.isAuth
          this.addInfo = data
        }
      })
    },
    // 新建
    start(row) {
      // 读取流程表单
      const tabTitle = `发起流程【${row.procName}】`
      const processTitle
        = `${this.userName
        } 在 ${
          moment(new Date()).format('YYYY-MM-DD HH:mm')
        } 发起了 [${
          row.procName
        }]`

      getFlowableTaskDef({
        procDefId: row.procDefId,
        status: 'start',
      }).then(({ data }) => {
        if (data.success) {
          this.$router.push({
            path: '/flowable/task/TaskForm',
            query: {
              procDefId: row.procDefId,
              procDefKey: data.flow.procDefKey,
              status: 'start',
              title: tabTitle,
              formType: data.flow.formType,
              formUrl: data.flow.formUrl,
              formTitle: processTitle,
            },
          })
        }
      })
    },
  },
}
</script>

<template>
  <div class="jp-page">
    <el-form
      ref="searchForm"
      size="mini"
      :inline="true"
      class="query-form"
      :model="searchForm"
      @keyup.enter.native="refreshList()"
      @submit.native.prevent
    >
      <!-- 搜索框 -->
      <el-form-item prop="leaveType">
        <el-input
          v-model="searchForm.leaveType"
          size="mini"
          placeholder="请假类型"
          clearable
        />
      </el-form-item>
      <el-form-item prop="startTime">
        <el-date-picker
          v-model="searchForm.startTime"
          type="datetime"
          size="mini"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="请选择请假开始时间"
        />
      </el-form-item>
      <el-form-item prop="endTime">
        <el-date-picker
          v-model="searchForm.endTime"
          type="datetime"
          size="mini"
          value-format="yyyy-MM-dd HH:mm:ss"
          placeholder="请选择请假结束时间"
        />
      </el-form-item>
      <el-form-item prop="reason">
        <el-input
          v-model="searchForm.reason"
          size="mini"
          placeholder="请假事由"
          clearable
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

    <div class="top bg-white">
      <el-row v-if="hasAddBtn">
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          @click="start(addInfo)"
        >
          新建
        </el-button>
      </el-row>
      <el-table
        v-loading="loading"
        :data="dataList"
        size="mini"
        height="70vh"
        class="table"
        @sort-change="sortChangeHandle"
      >
        <el-table-column
          prop="leaveType"
          show-overflow-tooltip
          sortable="custom"
          label="请假类型"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.leaveType }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="startTime"
          show-overflow-tooltip
          sortable="custom"
          label="请假开始时间"
        />
        <el-table-column
          prop="endTime"
          show-overflow-tooltip
          sortable="custom"
          label="请假结束时间"
        />
        <el-table-column
          prop="reason"
          show-overflow-tooltip
          sortable="custom"
          label="请假事由"
        />
        <el-table-column
          prop="remarks"
          show-overflow-tooltip
          sortable="custom"
          label="备注信息"
        />

        <el-table-column
          label="当前环节"
          prop="flowableInfo.curLink"
          align="center"
        >
          <template slot-scope="scope">
            <el-tag>{{ scope.row.flowableInfo.curLink }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :key="Math.random()"
          header-align="center"
          align="center"
          fixed="right"
          width="200"
          label="操作"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              @click="view(scope.row.id)"
            >
              查看
            </el-button>
            <el-button
              type="text"
              size="mini"
              @click="trace(scope.row.flowableInfo)"
            >
              进度
            </el-button>

            <template v-if="!scope.row.flowableInfo.canDeal">
              <el-button
                type="text"
                size="mini"
                style="color: #e6a23c"
                @click="detail(scope.row.flowableInfo)"
              >
                历史
              </el-button>
            </template>

            <template v-else>
              <el-button
                v-if="!scope.row.flowableInfo.endFlag"
                type="text"
                size="mini"
                style="color: #67c23a"
                @click="todo(scope.row.flowableInfo)"
              >
                办理
              </el-button>
              <el-button
                v-else
                type="text"
                size="mini"
                style="color: #e6a23c"
                @click="detail(scope.row.flowableInfo)"
              >
                历史
              </el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        style="text-align: right; padding: 10px 10px 0 0"
        :current-page="pageNo"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
      />
    </div>

    <!-- 弹窗, 新增 / 修改 -->
    <TestActivitiLeaveForm
      ref="testActivitiLeaveForm"
      @refreshDataList="refreshList"
    />

    <el-dialog
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
  </div>
</template>
