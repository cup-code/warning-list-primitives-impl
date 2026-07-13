<script>
import {
  extensionListenerDelete,
  getExtensionListenerList,
} from '@/http/safe-production/flowable-api'
import ListenerForm from './ListenerForm'

export default {
  components: {
    ListenerForm,
  },
  data() {
    return {
      searchForm: {
        name: '',
        listenerType: '',
      },
      dataList: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      orderBy: '',
      dataListSelections: [],
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
      getExtensionListenerList({
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
    // 新增
    add() {
      this.$refs.listenerForm.init('add', '')
    },
    // 修改
    edit(id) {
      id
        = id
          || this.dataListSelections.map((item) => {
            return item.id
          })[0]
      this.$refs.listenerForm.init('edit', id)
    },
    // 查看
    view(id) {
      this.$refs.listenerForm.init('view', id)
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
        extensionListenerDelete(ids)
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
    // 导入成功
    uploadSuccess(res, file) {
      if (res.success) {
        this.$message.success({
          dangerouslyUseHTMLString: true,
          message: res.msg,
        })
      }
      else {
        this.$message.error(res.msg)
      }
    },
    // 下载模板
    downloadTpl() {
      this.$utils.download('/extension/listener/import/template')
    },
    exportExcel() {
      this.$utils.download('/extension/listener/export')
    },
    resetSearch() {
      this.$refs.searchForm.resetFields()
      this.refreshList()
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
        <!-- 搜索框 -->
        <el-form-item prop="name">
          <el-input
            v-model="searchForm.name"
            size="small"
            placeholder="名称"
            clearable
          />
        </el-form-item>

        <el-form-item prop="listenerType">
          <el-radio-group v-model="searchForm.listenerType">
            <el-radio
              v-for="item in $dictUtils.getDictList('')"
              :key="item.id"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
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
        <!-- <el-button v-if="hasPermission('extension:listener:add')" type="primary" size="mini" icon="el-icon-plus" @click="add()">新建</el-button>
                <el-button v-if="hasPermission('extension:listener:edit')" type="warning" size="mini" icon="el-icon-edit-outline" @click="edit()" :disabled="dataListSelections.length != 1">修改</el-button>
                <el-button v-if="hasPermission('extension:listener:del')" type="danger" size="small" icon="el-icon-delete" @click="del()" :disabled="dataListSelections.length <= 0">删除</el-button> -->

        <EButton
          type="primary"
          size="mini"
          btnIcon="el-icon-plus"
          @click="add()"
        >
          新建
        </EButton>
        <EButton
          plain
          type="success"
          size="mini"
          icon="edit"
          :disabled="dataListSelections.length != 1"
          @click="edit()"
        >
          修改
        </EButton>
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
          prop="name"
          sortable="custom"
          width="150"
          show-overflow-tooltip
          label="名称"
        >
          <template slot-scope="scope">
            <!-- <el-link  type="primary" :underline="false" v-if="hasPermission('extension:listener:edit')" @click="edit(scope.row.id)">{{scope.row.name}}</el-link>
                        <el-link  type="primary" :underline="false" v-else-if="hasPermission('extension:listener:view')"  @click="view(scope.row.id)">{{scope.row.name}}</el-link>
                        <span v-else>{{scope.row.name}}</span> -->

            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column
          prop="listenerType"
          width="150"
          sortable="custom"
          label="监听器类型"
        >
          <template slot-scope="scope">
            {{ scope.row.listenerType === '1' ? '执行监听器' : '任务监听器' }}
          </template>
        </el-table-column>

        <el-table-column
          prop="event"
          sortable="custom"
          width="150"
          label="事件"
        />

        <el-table-column
          prop="valueType"
          sortable="custom"
          width="150"
          label="值类型"
        >
          <template slot-scope="scope">
            {{ { 1: '类', 2: '表达式', 3: '委托表达式' }[scope.row.valueType] }}
          </template>
        </el-table-column>

        <el-table-column
          prop="value"
          sortable="custom"
          show-overflow-tooltip
          label="值"
        />

        <el-table-column
          header-align="center"
          align="center"
          width="200"
          label="操作"
        >
          <template slot-scope="scope">
            <!-- <el-button v-if="hasPermission('extension:listener:view')" type="text" icon="el-icon-view" size="mini" @click="view(scope.row.id)">查看</el-button>
                        <el-button v-if="hasPermission('extension:listener:edit')" type="text" icon="el-icon-edit" size="mini" @click="edit(scope.row.id)">修改</el-button>
                        <el-button v-if="hasPermission('extension:listener:del')" type="text" size="mini" icon="el-icon-delete"  @click="del(scope.row.id)">删除</el-button> -->

            <el-button
              type="text"
              icon="el-icon-view"
              size="mini"
              @click="view(scope.row.id)"
            >
              查看
            </el-button>
            <el-button
              type="text"
              icon="el-icon-edit"
              size="mini"
              @click="edit(scope.row.id)"
            >
              修改
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

    <!-- 弹窗, 新增 / 修改 -->
    <ListenerForm slot="dialog"
      ref="listenerForm"
      @refreshDataList="refreshList"
    />
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.page-container {
  .query-form {
    // box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.1);
    // padding-left: 12px;
    // padding-top: 12px;
    // margin-bottom: 10px;ß
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
