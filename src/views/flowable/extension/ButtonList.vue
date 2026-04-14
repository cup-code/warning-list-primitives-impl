<script>
import {
  extensionButtonDelete,
  getExtensionButtonList,
} from '@/http/safe-production/flowable-api'
import ButtonForm from './ButtonForm'

export default {
  components: {
    ButtonForm,
  },
  data() {
    return {
      searchForm: {
        name: '',
        code: '',
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
      getExtensionButtonList({
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
      this.$refs.buttonForm.init('add', '')
    },
    // 修改
    edit(id) {
      id
        = id
          || this.dataListSelections.map((item) => {
            return item.id
          })[0]
      this.$refs.buttonForm.init('edit', id)
    },
    // 查看
    view(id) {
      this.$refs.buttonForm.init('view', id)
    },
    isDefaultButton(code) {
      const defaultButtons = [
        '_flow_save',
        '_flow_agree',
        '_flow_reject',
        '_flow_back',
        '_flow_add_multi_instance',
        '_flow_del_multi_instance',
        '_flow_transfer',
        '_flow_delegate',
        '_flow_stop',
        '_flow_print',
      ]
      return (
        defaultButtons.filter((val) => {
          return code === val
        }).length > 0
      )
    },
    // 删除
    del(row) {
      if (this.isDefaultButton(row.code)) {
        this.$message.error(`不能删除预设按钮【${row.name}】`)
        return
      }
      this.$confirm(`确定删除所选项吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        extensionButtonDelete(row.id)
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
        <!-- 搜索框 -->
        <el-form-item prop="name">
          <el-input
            v-model="searchForm.name"
            size="small"
            placeholder="名称"
            clearable
          />
        </el-form-item>
        <el-form-item prop="code">
          <el-input
            v-model="searchForm.code"
            size="small"
            placeholder="编码"
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
    </ECard>
    <ECard>
      <div class="card-cell">
        <!-- <el-button v-if="hasPermission('extension:button:add')" type="primary" size="mini" icon="el-icon-plus" @click="add()">新建</el-button>
                <el-button v-if="hasPermission('extension:button:edit')" type="warning" size="mini" icon="el-icon-edit-outline" @click="edit()" :disabled="dataListSelections.length != 1">修改</el-button> -->
        <EButton
          type="primary"
          size="mini"
          btnIcon="el-icon-plus"
          @click="add()"
        >
          新建
        </EButton>
        <EButton
          type="success"
          size="mini"
          plain
          icon="edit"
          :disabled="dataListSelections.length != 1"
          @click="edit()"
        >
          修改
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
          label="名称"
        >
          <template slot-scope="scope">
            <!-- <el-link type="primary" :underline="false" v-if="hasPermission('extension:button:edit')" @click="edit(scope.row.id)">{{scope.row.name}}</el-link>
                        <el-link type="primary" :underline="false" v-else-if="hasPermission('extension:button:view')"  @click="view(scope.row.id)">{{scope.row.name}}</el-link>
                        <span v-else>{{scope.row.name}}</span> -->

            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="code"
          sortable="custom"
          label="编码"
        />
        <el-table-column
          prop="sort"
          sortable="custom"
          label="排序"
        />
        <el-table-column
          header-align="center"
          align="center"
          width="200"
          label="操作"
        >
          <template slot-scope="scope">
            <!-- <el-button v-if="hasPermission('extension:button:view')" type="text" icon="el-icon-view" size="mini" @click="view(scope.row.id)">查看</el-button>
                        <el-button v-if="hasPermission('extension:button:edit')" type="text" icon="el-icon-edit" size="mini" @click="edit(scope.row.id)">修改</el-button>
                        <el-button v-if="hasPermission('extension:button:del')" type="text" size="mini" icon="el-icon-delete" @click="del(scope.row)">删除</el-button> -->

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
              @click="del(scope.row)"
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

    <!-- 弹窗, 新增 / 修改 -->
    <ButtonForm ref="buttonForm" @refreshDataList="refreshList" />
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  .query-form {
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
