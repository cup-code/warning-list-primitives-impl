<script>
import { getAuthToken } from '@/utils/tab-session'
import TestDataMainFormForm from './TestDataMainFormForm'

export default {
  components: {
    TestDataMainFormForm,
  },
  data() {
    return {
      window,
      searchForm: {
        name: '',
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
      this.$http({
        url: '/test/onetomany/testDataMainForm/list',
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
    // 新增
    add() {
      this.$refs.testDataMainFormForm.init('add', '')
    },
    // 修改
    edit(id) {
      id
        = id
          || this.dataListSelections.map((item) => {
            return item.id
          })[0]
      this.$refs.testDataMainFormForm.init('edit', id)
    },
    // 查看
    view(id) {
      this.$refs.testDataMainFormForm.init('view', id)
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
        this.$http({
          url: '/test/onetomany/testDataMainForm/delete',
          method: 'delete',
          params: { ids },
        }).then(({ data }) => {
          if (data && data.success) {
            this.$message.success(data.msg)
            this.refreshList()
          }
          this.loading = false
        })
      })
    },
    // 查看详情
    detail(row) {
      this.$http.get(`/test/onetomany/testDataMainForm/queryById?id=${row.id}`).then(({ data }) => {
        this.dataList.forEach((item, index) => {
          if (item.id === row.id) {
            item.testDataChild1List = data.testDataMainForm.testDataChild1List
            item.testDataChild2List = data.testDataMainForm.testDataChild2List
          }
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
      this.$utils.download('/test/onetomany/testDataMainForm/import/template')
    },
    exportExcel() {
      const params = {
        ...this.searchForm,
      }
      this.$utils.download('/test/onetomany/testDataMainForm/export', params)
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
        size="mini"
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
            size="mini"
            placeholder="名称"
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
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          @click="add()"
        >
          新建
        </el-button>
        <el-button
          type="success"
          size="mini"
          icon="el-icon-edit-outline"
          :disabled="dataListSelections.length != 1"
          plain
          @click="edit()"
        >
          修改
        </el-button>
        <el-button
          type="danger"
          size="mini"
          icon="el-icon-delete"
          :disabled="dataListSelections.length <= 0"
          plain
          @click="del()"
        >
          删除
        </el-button>
        <el-button-group class="pull-right">
          <el-button
            type="default"
            size="mini"
            icon="el-icon-upload2"
            title="导入"
            @click=";(isImportCollapse = !isImportCollapse), (isSearchCollapse = false)"
          />
          <el-button
            type="default"
            size="mini"
            icon="el-icon-download"
            title="导出"
            @click="exportExcel()"
          />
          <el-button
            type="default"
            size="mini"
            icon="el-icon-refresh"
            @click="refreshList"
          />
        </el-button-group>
      </div>
      <el-table
        v-loading="loading"
        :data="dataList"
        size="mini"
        height="calc(100vh - 270px)"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        class="table"
        @selection-change="selectionChangeHandle"
        @sort-change="sortChangeHandle"
        @expand-change="detail"
      >
        <el-table-column
          type="selection"
          header-align="center"
          align="center"
          width="50"
        />
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-tabs>
              <el-tab-pane label="火车票">
                <el-table
                  size="mini"
                  :data="scope.row.testDataChild1List"
                  style="width: 100%"
                >
                  <el-table-column
                    prop="srartarea"
                    show-overflow-tooltip
                    label="出发地"
                  />
                  <el-table-column
                    prop="endarea"
                    show-overflow-tooltip
                    label="目的地"
                  />
                  <el-table-column
                    prop="remarks"
                    show-overflow-tooltip
                    label="备注信息"
                  />
                </el-table>
              </el-tab-pane>
              <el-tab-pane label="飞机票">
                <el-table
                  size="mini"
                  :data="scope.row.testDataChild2List"
                  style="width: 100%"
                >
                  <el-table-column
                    prop="startarea"
                    show-overflow-tooltip
                    label="出发地"
                  />
                  <el-table-column
                    prop="endarea"
                    show-overflow-tooltip
                    label="目的地"
                  />
                  <el-table-column
                    prop="remarks"
                    show-overflow-tooltip
                    label="备注信息"
                  />
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </template>
        </el-table-column>
        <el-table-column
          prop="name"
          show-overflow-tooltip
          sortable="custom"
          label="名称"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="sex"
          show-overflow-tooltip
          sortable="custom"
          label="性别"
        />
        <el-table-column
          prop="address"
          show-overflow-tooltip
          sortable="custom"
          label="地址"
        />
        <el-table-column
          prop="remarks"
          show-overflow-tooltip
          sortable="custom"
          label="备注信息"
        />
        <el-table-column
          :key="Math.random()"
          align="right"
          fixed="right"
          width="200"
          label="操作"
        >
          <template slot-scope="scope">
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
              icon="el-icon-delete"
              size="mini"
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

    <!-- 导入导出 -->
    <el-dialog
      title="导入Excel"
      :visible.sync="isImportCollapse"
    >
      <el-form
        v-show="isImportCollapse"
        ref="importForm"
        :inline="true"
        class="query-form"
      >
        <el-form-item>
          <el-button
            type="default"
            size="mini"
            @click="downloadTpl()"
          >
            下载模板
          </el-button>
        </el-form-item>
        <el-form-item prop="loginName">
          <el-upload
            class="upload-demo"
            :headers="{ Authorization: getAuthToken() }"
            :action="`${$http.BASE_URL}/test/onetomany/testDataMainForm/import`"
            :on-success="uploadSuccess"
            :show-file-list="true"
          >
            <el-button
              size="mini"
              type="primary"
            >
              点击上传
            </el-button>
            <div
              slot="tip"
              class="el-upload__tip"
            >
              只允许导入“xls”或“xlsx”格式文件！
            </div>
          </el-upload>
        </el-form-item>
      </el-form>
    </el-dialog>
    <!-- 弹窗, 新增 / 修改 -->
    <TestDataMainFormForm
      ref="testDataMainFormForm"
      @refreshDataList="refreshList"
    />
  </div>
</template>

<style lang="css" scoped>
::v-deep.table {
  display: block;
}
</style>
