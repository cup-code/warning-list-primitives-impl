<script>
import { cloneDeep } from 'lodash'
import XEUtils from 'xe-utils'
import { deleteCompany, getCompanyList } from '@/http/safe-production/company-manage-api'
import CompanyForm from './form/CompanyForm'

export default {
  components: {
    CompanyForm,
  },
  data() {
    return {
      loading: false,
      searchForm: {
        fuzzyQuery: '',
      },
      dataList: [],
      dialogTitle: '',
      dialogMethod: '',
      dialogObj: {},
      dialogData: {},
      visibleFrom: false,
    }
  },
  mounted() {
    this.refreshList()
  },
  methods: {
    // 获取数据列表
    refreshList() {
      this.loading = true
      getCompanyList().then(({ data }) => {
        this.loading = false
        if (data.success) {
          this.dataList = this.setTreeData(data.result || [])
          this.cloneDataList = cloneDeep(this.dataList)
        }
        else {
          this.$message.error(data.message || '查询失败')
        }
      })
    },
    handleSearch() {
      const filterName = XEUtils.toValueString(this.searchForm.fuzzyQuery).trim()
      if (filterName) {
        const options = { children: 'children' }
        const searchProps = ['companyName']
        this.dataList = XEUtils.searchTree(
          this.cloneDataList,
          item =>
            searchProps.some(
              key => XEUtils.toValueString(item[key]).includes(filterName),
            ),
          options,
        )
        this.$nextTick(() => {
          this.$refs.xTree.setAllTreeExpand(true)
        })
      }
      else {
        this.dataList = this.cloneDataList
      }
    },
    // 打开弹窗
    openDialog(title, method, row) {
      console.log('title', method, row, title)
      this.visibleFrom = true
      this.dialogTitle = title
      this.dialogMethod = method
      if (title == '新增子公司') {
        this.dialogObj = { id: '', parent: { id: row.id } }
        this.dialogData = {}
      }
      else if (title == '新增公司') {
        this.dialogObj = { id: '', parent: { id: '' } }
        this.dialogData = {}
      }
      else {
        this.dialogObj = { id: row.id, parent: { id: row.parentId } }
        this.dialogData = JSON.parse(JSON.stringify(row))
      }
    },
    // 删除
    del(id) {
      this.$confirm(`确定删除?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        deleteCompany(id).then(({ data }) => {
          if (data.success) {
            this.$message({
              message: data.message,
              type: 'success',
              duration: 1500,
            })
            this.refreshList()
          }
          else {
            this.$message.error(data.message || '删除失败')
            this.loading = false
          }
        })
      })
    },
    /* 保存表单弹窗关闭成功回调 */
    infoSuccEvt(isRefresh) {
      this.visibleFrom = false
      if (isRefresh) {
        console.log('表单弹窗关闭')
        this.refreshList()
      }
    },
    // 重置
    resetButton() {
      this.searchForm.fuzzyQuery = ''
      this.refreshList()
    },
  },
}
</script>

<template>
  <TreeTable :isShowLeft="false">
    <ECard slot="search" noneBottom type="search">
      <el-form
        ref="searchForm"
        size="mini"
        :inline="true"
        :model="searchForm"
        @keyup.enter.native="handleSearch()"
        @submit.native.prevent
      >
        <el-form-item prop="name" label="公司名称">
          <el-input
            v-model="searchForm.fuzzyQuery"
            size="small"
            placeholder="名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <EButton
            type="primary"
            size="small"
            btnIcon="el-icon-search"
            @click="handleSearch"
          >
            查询
          </EButton>
          <EButton
            class="reset"
            size="small"
            btnIcon="el-icon-refresh-right"
            @click="resetButton"
          >
            重置
          </EButton>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard slot="table">
      <div class="card-cell">
        <EButton
          v-if="hasBtnPermission('manage_company_add_first')"
          type="primary"
          plain
          @click="openDialog('新增公司', 'add')"
        >
          新增企业
        </EButton>
      </div>
      <vxe-table
        ref="xTree"
        resizable
        auto-resize
        border="inner"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        row-id="id"
        size="small"
        height="90%"
        show-header-overflow
        show-overflow
        highlight-hover-row
        highlight-current-row
        :print-config="{}"
        :export-config="{}"
        :tree-config="{
          children: 'children',
        }"
        :loading="loading"
        :data="dataList"
      >
        <vxe-table-column
          title="名称"
          field="companyName"
          align="left"
          tree-node
          width="200px"
        />
        <vxe-table-column
          title="公司代码"
          field="companyNo"
          align="center"
        />
        <vxe-table-column
          title="联系人"
          field="contacts"
          align="center"
        />
        <vxe-table-column
          title="联系电话"
          field="contactsPhone"
          align="center"
        />
        <vxe-table-column title="所属区域" field="area" align="center" />
        <vxe-table-column title="行业" field="trade" align="center">
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel("industry_type", scope.row.trade) }}
          </template>
        </vxe-table-column>
        <vxe-table-column title="专业" field="major" align="center">
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel("major_type", scope.row.major) }}
          </template>
        </vxe-table-column>
        <vxe-table-column title="操作" width="200px" fixed="right" align="right">
          <template slot-scope="scope">
            <el-button
              type="text"
              size="small"
              @click="openDialog('查看公司信息', 'view', scope.row)"
            >
              查看
            </el-button>
            <el-button
              v-if="hasBtnPermission('manage_company_add_child')"
              type="text"
              size="small"
              @click="openDialog('新增子公司', 'addChild', scope.row)"
            >
              新增子公司
            </el-button>
            <el-button
              v-if="hasBtnPermission('manage_company_modify')"
              type="text"
              size="small"
              style="color: var(--ky-warning)"
              @click="openDialog('修改公司信息', 'edit', scope.row)"
            >
              修改
            </el-button>
            <el-button
              v-if="hasBtnPermission('manage_company_delete')"
              type="text"
              size="small"
              style="color: #ff4949"
              @click="del(scope.row.id)"
            >
              删除
            </el-button>
          </template>
        </vxe-table-column>
      </vxe-table>
    </ECard>
    <!-- 弹窗, 新增 / 修改 -->
    <template slot="dialog">
      <el-dialog
        :title="dialogTitle"
        :close-on-click-modal="false"
        width="65%"
        :visible.sync="visibleFrom"
        class="company-form fixed-dialog"
      >
        <company-form
          v-if="visibleFrom"
          :method="dialogMethod"
          :obj="dialogObj"
          :row="dialogData"
          @succ="infoSuccEvt"
        />
      </el-dialog>
    </template>
  </TreeTable>
</template>

<style lang="scss" scoped>
.page {
  padding: 10px;
  background: #f3f7f9;
}
.query-form {
  ::v-deep .el-form-item {
    margin: 0 10px 0 0;
  }
}
::v-deep .vxe-table {
  background: #ffffff;
  padding-left: 10px;
}
.head-search {
  width: 100%;
  padding: 5px 0 5px 10px;
  box-sizing: border-box;
  background: #ffffff;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.auxiliary-button {
  width: 100%;
  background: #ffffff;
  box-sizing: border-box;
  padding: 10px;
}
::v-deep .vxe-tree-cell {
  color: #11c8e5;
}
</style>
