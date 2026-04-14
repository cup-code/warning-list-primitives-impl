<script>
import { getAuthToken } from '@/utils/tab-session'
import { deletePostFn, getPostByCompanyFn } from '@/http/safe-production/post-manage-api'
import PostForm from './form/PostForm'

export default {
  components: {
    PostForm,
  },
  data() {
    return {
      searchForm: {
        pageNum: 1,
        pageSize: 10,
        companyId: '',
        remarks: '',
        postName: '',
      },
      tableData: [],
      total: 0,
      loading: false,
      uploadLimit: {
        header: {
          Authorization: getAuthToken(),
          clientChannel: 'WEB',
        },
        accept: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
      },
    }
  },
  mounted() {
    this.searchForm.companyId = this.$store.state.user.user.companyId
    this.refreshList()
  },
  methods: {
    // 获取数据列表
    refreshList() {
      this.loading = true
      getPostByCompanyFn(this.searchForm).then(({ data }) => {
        this.loading = false
        if (data.success) {
          this.tableData = data.result.list || []
          this.total = data.result.total
        }
        else {
          this.$message.error(data.message || '查询岗位失败')
        }
      })
    },
    // 每页数
    sizeChangeHandle(val) {
      this.searchForm.pageSize = val
      this.searchForm.pageNum = 1
      this.refreshList()
    },
    // 当前页
    currentChangeHandle(val) {
      this.searchForm.pageNum = val
      this.refreshList()
    },
    // 删除
    del(id) {
      this.$confirm(`确定删除?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        deletePostFn(id).then(({ data }) => {
          this.loading = false
          if (data && data.success) {
            this.$message.success({
              dangerouslyUseHTMLString: true,
              message: data.message,
            })
            this.refreshList()
          }
          else {
            this.$message.error(data.message)
          }
        })
      })
    },
    search() {
      this.searchForm.pageNum = 1
      this.refreshList()
    },
    // 下载模板
    downloadTpl() {
      this.$utils.download('/excel/getImportTemplate/postUserImport', '', 'get')
    },
    // 导入成功
    uploadSuccess(res, file, fileList) {
      if (res.success) {
        this.$message.success({
          dangerouslyUseHTMLString: true,
          message: res.message,
        })
      }
      else {
        this.$message.error(res.message)
      }
    },
    // 新增
    add() {
      this.$refs.postForm.init('add', '')
    },
    showView(row) {
      this.$refs.postForm.init('view', row.id, row)
    },
    showEdit(row) {
      this.$refs.postForm.init('edit', row.id, row)
    },
    resetButton() {
      this.searchForm.postName = ''
      this.searchForm.remarks = ''
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
        @submit.native.prevent
      >
        <el-form-item
          prop="postName"
          label="岗位名称"
        >
          <el-input
            v-model="searchForm.postName"
            size="mini"
            placeholder="岗位名称"
            clearable
          />
        </el-form-item>
        <el-form-item
          prop="remarks"
          label="岗位描述"
        >
          <el-input
            v-model="searchForm.remarks"
            size="mini"
            placeholder="岗位描述"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-search"
            @click="search"
          >
            查询
          </el-button>
          <el-button
            class="reset"
            size="mini"
            icon="el-icon-refresh-right"
            @click="resetButton"
          >
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>
    <ECard>
      <div class="auxiliary-button">
        <EButton
          v-if="hasBtnPermission('manage_post_add')"
          plain
          btnIcon="el-icon-plus"
          type="primary"
          @click="add"
        >
          新增
        </EButton>
        <EButton
          type="success"
          plain
          icon="download"
          @click="downloadTpl()"
        >
          下载岗位绑定用户模板
        </EButton>
        <el-upload
          style="display: inline-flex; margin-left: 10px"
          :action="`${$http.BASE_URL}/sysPost/extend/uploadPostUser`"
          :headers="uploadLimit.header"
          :limit="1"
          :accept="uploadLimit.accept.toString()"
          :on-success="(res, file, fileList) => uploadSuccess(res, file, fileList)"
          :show-file-list="false"
        >
          <EButton
            type="warning"
            btnIcon="el-icon-upload"
          >
            上传岗位绑定用户文件
          </EButton>
          <div
            slot="tip"
            class="el-upload__tip"
          >
            只允许导入“xls”或“xlsx”格式文件！
          </div>
        </el-upload>
      </div>
      <el-table
        v-loading="loading"
        :data="tableData"
        highlight-current-row
        size="small"
        height="69vh"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        class="table"
      >
        <el-table-column
          align="center"
          type="index"
          label="序号"
          width="50"
        />
        <el-table-column
          align="center"
          prop="companyName"
          min-width="100px"
          label="所属公司"
        />
        <el-table-column
          prop="departmentName"
          min-width="100px"
          label="组织架构"
        />
        <el-table-column
          align="center"
          prop="postName"
          min-width="100px"
          label="岗位名称"
        >
          <template slot-scope="scope">
            <el-tag
              class="check"
              type="primary"
              @click="showView(scope.row)"
            >
              {{ scope.row.postName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="sortOrder"
          min-width="100px"
          label="排序"
        />
        <el-table-column
          align="left"
          prop="remarks"
          min-width="120px"
          label="岗位描述"
        >
          <template slot-scope="scope">
            <rich-text :des="scope.row.remarks" />
          </template>
        </el-table-column>
        <el-table-column
          fixed="right"
          header-align="right"
          align="right"
          width="270"
          label="操作"
        >
          <template slot-scope="scope">
            <EButton
              icon="check"
              type="text"
              @click="showView(scope.row)"
            >
              查看
            </EButton>
            <EButton
              v-if="hasBtnPermission('manage_post_modify')"
              icon="edit"
              type="text"
              @click="showEdit(scope.row)"
            >
              修改
            </EButton>
            <EButton
              v-if="hasBtnPermission('manage_post_delete')"
              icon="delete"
              type="text"
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
        :current-page="searchForm.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        background
        :page-size="searchForm.pageSize"
        :total="total"
        style="margin-top: 10px; text-align: right"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
      />
    </ECard>
    <post-form
      ref="postForm"
      @refreshDataList="refreshList"
    />
  </div>
</template>

<style lang="scss" scoped>
.app-main {
  padding: 0;
}
.contentArea {
  margin-bottom: 0;
  background: #f3f7f9;
}
.bg-white {
  background: #ffffff;
  padding: 0 10px;
}
.query-form {
  ::v-deep .el-form-item {
    margin: 0 10px 0 0;
  }
}
.head-search {
  width: 100%;
  padding: 5px 0 5px 10px;
  box-sizing: border-box;
  background: #ffffff;
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}
.auxiliary-button {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  margin-bottom: 14px;
}
.el-upload__tip {
  margin-left: 8px;
}
</style>
