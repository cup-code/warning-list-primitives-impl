<script>
import {
  deleteRole,
  getAllRoles,
  getChangeRole,
} from '@/http/safe-production/role-manage-api'
import AllDepartmentTree from '@/views/common-ui/AllDepartmentTree.vue'
import GlobalDepartmentTree from '@/views/common-ui/GlobalDepartmentTree'
import AuthForm from './form/role/AuthForm'
import RoleUserList from './form/role/RoleUserList'

export default {
  components: {
    AllDepartmentTree,
    AuthForm,
    RoleUserList,
    GlobalDepartmentTree,
  },
  data() {
    return {
      companyId: '',
      searchForm: {
        pageNum: 1,
        pageSize: 10,
        companyId: '',
        fuzzyQuery: '',
        departmentId: '',
      },
      moreEButton: [
        {
          type: 'text',
          icon: 'check',
          size: 'mini',
          props: 'check',
          text: '查看',
          disabled: false,
        },
        {
          type: 'text',
          icon: 'check',
          size: 'mini',
          props: 'checkRole',
          text: '查看人员',
          disabled: false,
        },
        {
          type: 'text',
          icon: 'setting',
          size: 'mini',
          props: 'setRole',
          text: '设为默认角色',
          disabled: false,
        },
      ],
      tableData: [],
      total: 0,
      rightVisible: false,
      roleUserTitle: '',
      loading: false,
    }
  },
  created() {
    this.companyId = this.$store.state.user.user.companyId
  },
  mounted() {
    this.refreshList()
  },
  methods: {
    // 获取数据列表
    refreshList() {
      this.loading = true
      getAllRoles(this.searchForm).then((res) => {
        // console.log(res)
        const resD = res.data
        const msg = resD.message
        this.loading = false
        if (resD.success) {
          this.tableData = resD.result.list
          this.total = resD.result.total
        }
        else {
          this.$message.error(msg || '查询角色失败')
        }
      })
    },
    // 点击部门树的item
    treeNodeTap(v) {
      // 记录部门id
      if (v.onlyTreeUse)
        return
      this.searchForm.pageNum = 1
      this.searchForm.departmentId = v.id
      this.refreshList()
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
        deleteRole(id).then(({ data }) => {
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
    // 更改默认角色
    changeRole(id) {
      this.$confirm(`确定设为默认角色?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        getChangeRole(id).then(({ data }) => {
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
    showUserWithRole(row) {
      this.rightVisible = true
      this.roleUserTitle = row.roleName
      this.$nextTick(() => {
        this.$refs.roleUserList.refreshList(row.id)
      })
    },
    closeRight() {
      this.rightVisible = false
    },
    // 新增
    add() {
      this.$refs.authForm.init('add', '')
    },
    showAuthView(row) {
      this.$refs.authForm.init('view', row.id, row)
      this.roleUserTitle = row.roleName
    },
    showAuthEdit(row) {
      this.$refs.authForm.init('edit', row.id, row)
      this.roleUserTitle = row.roleName
    },
    // 重置
    resetButton() {
      this.searchForm.companyId = ''
      this.searchForm.departmentId = ''
      this.searchForm.fuzzyQuery = ''
      this.search()
    },
  },
}
</script>

<template>
  <KyTreeTable
    ref="treeTable"
    treeWidth="200"
    tableHeight="270"
  >
    <!-- 左侧树 -->
    <!--    <GlobalDepartmentTree slot="tree" @treeNodeTap="treeNodeTap" :companyId="companyId" /> -->
    <AllDepartmentTree
      slot="tree"
      ref="companyTree"
      :hasResponsible="false"
      @treeNodeTap="treeNodeTap"
    />
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        ref="searchForm"
        size="mini"
        :inline="true"
        :model="searchForm"
        @submit.native.prevent
      >
        <el-form-item
          prop="fuzzyQuery"
          label="角色名"
        >
          <el-input
            v-model="searchForm.fuzzyQuery"
            size="mini"
            placeholder="角色名"
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
    <ECard slot="table">
      <div class="card-cell">
        <el-button
          v-if="hasBtnPermission('manage_role_addRole')"
          type="primary"
          plain
          size="mini"
          icon="el-icon-plus"
          @click="add()"
        >
          新增
        </el-button>
      </div>
      <el-table
        v-loading="loading"
        height="93%"
        :data="tableData"
        highlight-current-row
        size="small"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          type="index"
          label="序号"
          width="50"
        />
        <el-table-column
          align="center"
          prop="roleName"
          min-width="100px"
          label="角色名称"
        >
          <template slot-scope="scope">
            <span
              class="check"
              @click="showAuthView(scope.row)"
            >{{ scope.row.roleName }}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="companyName"
          sortable
          sort-by="companyName"
          min-width="120px"
          label="所属企业"
        />
        <el-table-column
          align="center"
          prop="departmentName"
          min-width="120px"
          label="责任组织"
        />
        <el-table-column
          align="center"
          prop="enable"
          min-width="100px"
          label="状态"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.enable ? 'success' : 'danger'">
              {{ scope.row.enable ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          prop="defaultFlag"
          min-width="100px"
          label="是否默认角色"
        >
          <template slot-scope="scope">
            <el-tag :type="scope.row.defaultFlag ? 'success' : 'danger'">
              {{ scope.row.defaultFlag ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          :key="Math.random()"
          fixed="right"
          header-align="right"
          align="right"
          width="200"
          label="操作"
        >
          <template slot-scope="scope">
            <!-- <EButton></EButton>
          <el-button type="text" @click="showUserWithRole(scope.row)">查看人员</el-button>
          <EButton icon="check" type="text" @click="showAuthView(scope.row)">查看</EButton>
          <el-button type="text" style="color: var(--ky-warning)" @click="changeRole(scope.row.id)">设为默认角色</el-button> -->
            <EButton
              v-if="hasBtnPermission('manage_role_delete')"
              icon="delete"
              type="text"
              @click="del(scope.row.id)"
            >
              删除
            </EButton>
            <EButton
              v-if="hasBtnPermission('manage_role_modify')"
              icon="edit"
              type="text"
              @click="showAuthEdit(scope.row)"
            >
              修改
            </EButton>
            <EMoreButton
              icon="more"
              text="更多"
              :list="moreEButton"
              @check="showAuthView(scope.row)"
              @checkRole="showUserWithRole(scope.row)"
              @setRole="changeRole(scope.row.id)"
            />
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        :current-page="searchForm.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        background
        :page-size="searchForm.pageSize"
        :total="total"
        style="background: #ffffff; width: 100%; text-align: right"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
      />
    </ECard>

    <el-dialog
      slot="dialog"
      size="700px"
      :title="`人员列表，所属角色: ${roleUserTitle}`"
      :visible.sync="rightVisible"
      direction="rtl"
    >
      <role-user-list
        ref="roleUserList"
        @closeRight="closeRight"
      />
    </el-dialog>
    <AuthForm
      slot="dialog"
      ref="authForm"
      :auth-form-title="roleUserTitle"
      @refreshDataList="refreshList"
    />
  </KyTreeTable>
</template>
