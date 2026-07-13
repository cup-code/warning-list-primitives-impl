<script>
import { pick } from 'lodash'

import {
  extensionFlowCopyDelete,
  getExtensionFlowCopyList,
  getFlowableTaskDef,
} from '@/http/safe-production/flowable-api'

export default {
  data() {
    return {
      searchForm: {
        userId: '',
        procDefId: '',
        procInsId: '',
      },
      dataList: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      orderBy: '',
      dataListSelections: [],
      isSearchCollapse: false,
      isImportCollapse: false,
      loading: false,
    }
  },
  mounted() {
    this.refreshList()
  },

  methods: {
    // 获取数据列表
    refreshList() {
      this.loading = true
      getExtensionFlowCopyList({
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        orderBy: this.orderBy,
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
    detail(row) {
      getFlowableTaskDef({
        procInsId: row.procInsId,
        procDefId: row.procDefId,
      }).then(({ data }) => {
        if (data.success) {
          this.$router.push({
            path: '/flowable/task/TaskFormDetail',
            query: {
              readOnly: true,
              title: row.procInsName,
              formTitle: row.procInsName,
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
    // 删除
    del(id) {
      const ids
        = id
          || this.dataListSelections
            .map((item) => {
              return item.id
            })
            .join(',')
      this.$confirm(`确定删除所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        extensionFlowCopyDelete(ids)
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
      this.$refs.searchForm.resetFields()
      this.refreshList()
    },
  },
}
</script>

<template>
  <div class="page-container">
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
        :data="dataList"
        size="mini"
        height="calc(100vh - 220px)"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        class="table"
        @selection-change="selectionChangeHandle"
        @sort-change="sortChangeHandle"
      >
        <el-table-column
          type="selection"
          header-align="center"
          align="center"
          width="50"
        />

        <el-table-column
          prop="procInsName"
          sortable="custom"
          label="实例标题"
        />

        <el-table-column
          prop="createDate"
          sortable="custom"
          label="抄送日期"
        />

        <el-table-column
          prop="createBy.fullName"
          sortable="custom"
          label="抄送发起人"
        />

        <el-table-column
          header-align="right"
          align="right"
          width="150"
          label="操作"
        >
          <template slot-scope="scope">
            <!-- <el-button v-if="hasPermission('extension:flowCopy:view')" type="text" icon="el-icon-view" size="mini" @click="detail(scope.row)">查阅审批</el-button>
                        <el-button v-if="hasPermission('extension:flowCopy:del')" type="text" size="mini" icon="el-icon-delete" @click="del(scope.row.id)">删除</el-button> -->

            <el-button
              type="text"
              icon="el-icon-view"
              size="mini"
              @click="detail(scope.row)"
            >
              查阅审批
            </el-button>
            <el-button
              type="text"
              size="mini"
              icon="el-icon-delete"
              @click="del(scope.row.id)"
            >
              删除
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

    <!-- <div class="main-con">
      <el-row> -->
    <!-- <el-button
                    v-if="hasPermission('extension:flowCopy:del')"
                    type="danger"
                    size="mini"
                    icon="el-icon-delete"
                    @click="del()"
                    :disabled="dataListSelections.length <= 0"
                >
                    删除
                </el-button> -->

    <!-- </el-row> -->

    <!-- </div> -->
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  .main-con {
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
