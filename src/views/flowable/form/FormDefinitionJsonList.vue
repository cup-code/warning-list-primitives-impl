<script>
import FormDefinitionJsonForm from './FormDefinitionJsonForm'

export default {
  components: {
    FormDefinitionJsonForm,
  },
  data() {
    return {
      searchForm: {
        formDefinitionId: this.$route.query.id,
        version: '',
        status: '',
        isPrimary: '',
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
      this.$http({
        url: '/extension/formDefinitionJson/list',
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
    // 查看
    view(id) {
      this.$refs.formDefinitionJsonForm.init(id)
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
      this.$confirm(
        `确定删除该版本吗? 删除之后，已发起的流程如果使用了该版本，将无法查看表单内容!`,
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        },
      ).then(() => {
        this.loading = true
        this.$http({
          url: '/extension/formDefinitionJson/delete',
          method: 'delete',
          params: { ids },
        }).then(({ data }) => {
          this.loading = false
          if (data && data.success) {
            this.$message.success(data.msg)
            this.refreshList()
          }
        })
      })
    },
    // 设置为主版本
    updatePrimary(id) {
      this.$confirm(`确定设置该版本为主版本吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        this.$http({
          url: '/extension/formDefinitionJson/updatePrimary',
          method: 'post',
          data: { id },
        }).then(({ data }) => {
          this.loading = false
          if (data && data.success) {
            this.$message.success(data.msg)
            this.refreshList()
          }
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
  <div class="formDefinitionJsonList-form-flowable">
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
      <el-form-item prop="version">
        <el-input
          v-model="searchForm.version"
          size="mini"
          placeholder="版本号"
          clearable
        />
      </el-form-item>
      <el-form-item prop="status">
        <el-input
          v-model="searchForm.status"
          size="mini"
          placeholder="状态"
          clearable
        />
      </el-form-item>
      <el-form-item prop="isPrimary">
        <el-input
          v-model="searchForm.isPrimary"
          size="mini"
          placeholder="是否主版本"
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
    <div class="main-con">
      <el-row>
        <el-button-group class="pull-right">
          <el-button
            type="default"
            size="mini"
            icon="el-icon-search"
            @click=";(isSearchCollapse = !isSearchCollapse), (isImportCollapse = false)"
          />

          <el-button
            type="default"
            size="mini"
            icon="el-icon-refresh"
            @click="refreshList"
          />
        </el-button-group>
      </el-row>

      <el-table
        v-loading="loading"
        :data="dataList"
        border
        size="mini"
        height="calc(100% - 84px)"
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
          prop="formDefinitionId"
          show-overflow-tooltip
          sortable="custom"
          width="280"
          label="表单定义id"
        >
          <template slot-scope="scope">
            <el-link
              type="primary"
              :underline="false"
              @click="view(scope.row.id)"
            >
              {{ scope.row.formDefinitionId }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column
          prop="json"
          show-overflow-tooltip
          sortable="custom"
          label="流程表单结构体"
        />

        <el-table-column
          prop="version"
          show-overflow-tooltip
          sortable="custom"
          label="版本号"
        />

        <el-table-column
          prop="status"
          show-overflow-tooltip
          sortable="custom"
          label="状态"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.status === '1'"
              size="small"
              type="success"
            >
              已发布
            </el-tag>
            <el-tag
              v-else
              size="small"
              type="danger"
            >
              未发布
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="isPrimary"
          show-overflow-tooltip
          sortable="custom"
          label="是否主版本"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.isPrimary === '1'"
              size="small"
              type="success"
            >
              主版本
            </el-tag>
            <el-tag
              v-else
              size="small"
              type="danger"
            >
              非主版本
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :key="Math.random()"
          header-align="center"
          fixed="right"
          width="250"
          label="操作"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              icon="el-icon-view"
              size="mini"
              @click="view(scope.row.id)"
            >
              预览
            </el-button>
            <el-button
              v-if="scope.row.isPrimary === '0'"
              type="text"
              icon="el-icon-edit"
              size="mini"
              @click="updatePrimary(scope.row.id)"
            >
              设置为主版本
            </el-button>
            <el-button
              v-if="scope.row.isPrimary === '0'"
              type="text"
              icon="el-icon-delete"
              size="mini"
              @click="del(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        :current-page="pageNo"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
      />

      <!-- 弹窗, 新增 / 修改 -->
      <FormDefinitionJsonForm
        ref="formDefinitionJsonForm"
        @refreshDataList="refreshList"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.formDefinitionJsonList-form-flowable {
  padding: 10px;
  height: calc(100vh - 50px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .query-form {
    box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.1);
    padding-left: 12px;
    padding-top: 12px;
    margin-bottom: 10px;
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
