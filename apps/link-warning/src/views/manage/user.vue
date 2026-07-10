<script>
import {
  deleteUser,
  getChangeAccount,
  getUserList,
  resetPasswordFn,
} from '@/http/safe-production/user-manage-api'
import AllDepartmentTree from '@/views/common-ui/AllDepartmentTree.vue'
import UserForm from './form/UserForm'

let beforePageNum = 1
export default {
  components: {
    UserForm,
    AllDepartmentTree,
  },
  beforeRouteEnter(to, from, next) {
    beforePageNum = from.params.pageNum || 1
    next()
  },
  data() {
    return {
      accountState: '禁用',
      loadingTree: false,
      loadingTable: false,
      tableData: [],
      pageFlag: true,
      total: 0,
      uploadLimit: {
        header: {
          Authorization: localStorage.getItem('tk'),
          clientChannel: 'WEB',
        },
        accept: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
      },
      sForm: {
        userId: '',
        status: undefined,
        userStatusList: ['1'],
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        fuzzyQuery: '',
      },
      treeData: [], // 部门数据
      defaultProps: {
        children: 'children',
        label: 'departmentName',
      },
      filterText: '',
      setNewPassword: {
        newPassword: '',
      },
      rules: {
        newPassword: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { validator: this.validator.isNewPwd, trigger: 'blur' },
        ],
      },
      dialogResetVisible: false, // 重置密码弹框
      accountVisible: false, // 账号禁用弹框
      resetLoading: false,
      userStatusList: [
        {
          label: '禁用',
          value: '0',
        },
        {
          label: '在职',
          value: '1',
        },
        {
          label: '借调',
          value: '2',
        },
        {
          label: '离职',
          value: '3',
        },
        {
          label: '退休',
          value: '4',
        },
      ],
      moreButton: [
        {
          type: 'text',
          icon: 'open',
          size: 'mini',
          text: '解冻',
          props: 'open',
          disabled: false,
        },
        {
          type: 'text',
          icon: 'forbidden',
          size: 'mini',
          text: '禁用',
          props: 'forbidden',
          disabled: false,
        },
        {
          type: 'text',
          icon: 'delete',
          size: 'mini',
          text: '删除',
          props: 'delete',
          disabled: false,
        },
        {
          type: 'text',
          icon: 'resetPassward',
          size: 'mini',
          text: '重置密码',
          props: 'reset',
          disabled: false,
        },
      ],
    }
  },
  computed: {
    sentenceState() {
      return ` 您确定将${this.accountState}此账号?`
    },
    getMoreButton() {
      return function (scope) {
        console.log(
          scope.status,
          ['0', '3'].includes(scope.status),
          ['1', '2', 'undefined'].includes(scope.status),
          777,
        )
        return this.moreButton.filter(
          item =>
            (['0', '3'].includes(scope.status) && item.props !== 'forbidden')
            || (['1', '2', 'undefined'].includes(scope.status) && item.props !== 'open'),
        )
      }
    },
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },
  },
  created() {
    this.sForm.pageNum = beforePageNum || 1
    this.getDataList()
  },
  methods: {
    /* 点击公司部门树的item */
    treeNodeTap(data) {
      if (data) {
        this.sForm.departmentId = data.id
      }
      else {
        delete this.sForm.departmentId
      }
      this.searchClick()
    },
    // 查询用户
    getDataList() {
      this.loadingTable = true
      getUserList(this.sForm)
        .then(({ data }) => {
          this.loadingTable = false
          if (data.success === true) {
            this.tableData = data.result.list
            this.total = data.result.total
          }
          else {
            this.$message.error(data.message || '查询用户失败')
          }
        })
        .catch((err) => {
          this.loadingTable = false
          this.$message.error('查询用户失败')
        })
    },
    // 新增、查看、编辑一人一档
    addOrEditUserInFo(method, id, name) {
      this.$router.push({
        name: 'userDetail',
        params: {
          id,
          method,
          name,
          pageNum: this.sForm.pageNum,
        },
      })
    },
    // 删除
    delFn(v) {
      this.$confirm(`您确认要删除用户 ${v.username} ?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteUser(v.id)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(data.message || '删除失败')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败')
            })
        })
        .catch(() => {})
    },
    // 重置密码
    resetPassword(v) {
      this.dialogResetVisible = true
      this.setNewPassword.newPassword = ''
      this.currentUserName = v.username
    },
    submitNewPassword(uForm) {
      this.$refs[uForm].validate((valid) => {
        if (valid) {
          this.resetLoading = true
          resetPasswordFn(this.setNewPassword.newPassword, this.currentUserName).then(
            ({ data }) => {
              this.resetLoading = false
              if (data.success) {
                this.dialogResetVisible = false
                this.$message.success(data.message)
              }
              else {
                this.$message.error(data.message || '重置失败')
              }
            },
          )
        }
        else {
          console.log('error submit!!')
          return false
        }
      })
    },
    // 打开修改用户状态弹窗
    openAccount(i, v) {
      this.sForm.userId = v.id
      if (i == true) {
        this.accountState = '解冻'
        this.sForm.status = 1
      }
      else {
        this.accountState = '禁用'
        this.sForm.status = 0
      }
      this.accountVisible = true
    },
    // 修改用户状态
    changeAccount() {
      this.loadingTable = true
      getChangeAccount(this.sForm.userId, this.sForm.status)
        .then(({ data }) => {
          this.loadingTable = false
          if (data.success === true) {
            this.$message.success('修改用户状态成功')
            this.getDataList()
          }
          else {
            this.$message.error(data.message || '修改用户状态失败')
          }
        })
        .catch((err) => {
          this.loadingTable = false
          this.$message.error('修改用户状态失败')
        })
      this.accountVisible = false
    },
    searchClick() {
      this.sForm.pageNum = 1
      this.getDataList()
    },
    // 重置
    resetButton() {
      this.sForm.fuzzyQuery = ''
      this.sForm.userStatusList = ['1']
      this.searchClick()
    },
    // 下载模板
    downloadTpl(key) {
      this.$utils.download(`/excel/getImportTemplate/${key}`, '', 'get')
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
  },
}
</script>

<template>
  <TreeTable>
    <!-- 左侧树 -->
    <AllDepartmentTree
      slot="tree"
      ref="companyTree"
      :hasResponsible="false"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <ECard
      slot="search"
      customStyle="padding:12px 10px 0;margin-bottom:0;"
      type="search"
    >
      <el-form
        ref="sForm"
        :inline="true"
        :model="sForm"
        @submit.native.prevent
      >
        <el-form-item
          prop="fuzzyQuery"
          label="姓名"
        >
          <el-input
            v-model="sForm.fuzzyQuery"
            placeholder="姓名"
            clearable
          />
        </el-form-item>
        <el-form-item
          label="状态"
          prop="userStatusList"
        >
          <el-select
            v-model="sForm.userStatusList"
            placeholder="请选择"
            multiple
            clearable
          >
            <el-option
              v-for="item in userStatusList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="searchClick"
          >
            查询
          </el-button>
          <el-button
            class="reset"
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
        <EButton
          v-if="hasBtnPermission('manage_user_add')"
          type="primary"
          plain
          btnIcon="el-icon-plus"
          @click="addOrEditUserInFo('add')"
        >
          新增
        </EButton>
        <EButton
          type="success"
          plain
          btnIcon="el-icon-download"
          @click="downloadTpl('userSafetyRiskFundImport')"
        >
          下载用户风险金数据导入模板
        </EButton>
        <el-upload
          style="display: inline-flex; margin: 0 10px"
          :action="`${$http.BASE_URL}/sysUser/extend/userSafetyRiskFundImport`"
          :headers="uploadLimit.header"
          :limit="1"
          :accept="uploadLimit.accept.toString()"
          :on-success="(res, file, fileList) => uploadSuccess(res, file, fileList)"
          :show-file-list="false"
        >
          <EButton
            size="mini"
            type="warning"
            btnIcon="el-icon-upload"
          >
            上传用户风险金数据文件
          </EButton>
        </el-upload>
        <EButton
          type="success"
          plain
          btnIcon="el-icon-download"
          @click="downloadTpl('userPostImport')"
        >
          下载用户岗位信息模板
        </EButton>
        <el-upload
          style="display: inline-flex; margin-left: 10px"
          :action="`${$http.BASE_URL}/sysUser/extend/uploadUserPost`"
          :headers="uploadLimit.header"
          :limit="1"
          :accept="uploadLimit.accept.toString()"
          :on-success="(res, file, fileList) => uploadSuccess(res, file, fileList)"
          :show-file-list="false"
        >
          <EButton
            size="mini"
            type="warning"
            btnIcon="el-icon-upload"
          >
            上传用户岗位信息文件
          </EButton>
          <div
            slot="tip"
            style="margin-left: 8px"
            class="el-upload__tip"
          >
            只允许导入“xls”或“xlsx”格式文件！
          </div>
        </el-upload>
      </div>
      <!-- table区域 -->
      <el-table
        ref="table"
        v-loading="loadingTable"
        :data="tableData"
        size="mini"
        height="90%"
        highlight-current-row
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          label="所属企业"
          prop="companyName"
          align="center"
          min-width="120"
        />
        <el-table-column
          label="组织架构"
          prop="departmentName"
          align="center"
          min-width="120"
        />
        <el-table-column
          label="姓名"
          prop="fullName"
          align="center"
        />
        <el-table-column
          label="账号"
          prop="username"
          align="center"
          min-width="100"
        />
        <el-table-column
          label="岗位"
          prop="postName"
          align="center"
        />
        <el-table-column
          label="角色"
          prop="roleNameList"
          align="center"
          min-width="150"
        >
          <template slot-scope="props">
            <span>{{ (props.row.roleNameList || []).join('，') }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="手机号码"
          prop="mobile"
          align="center"
          min-width="100"
        />
        <el-table-column
          label="状态"
          prop="status"
          align="center"
        >
          <template slot-scope="props">
            <el-tag
              v-if="props.row.status === '0'"
              type="danger"
            >
              禁用
            </el-tag>
            <el-tag
              v-if="props.row.status === '1'"
              type="success"
            >
              在职
            </el-tag>
            <el-tag
              v-if="props.row.status === '2'"
              type="warning"
            >
              借调
            </el-tag>
            <el-tag
              v-if="props.row.status === '3'"
              type="danger"
            >
              离职
            </el-tag>
            <el-tag
              v-if="props.row.status === '4'"
              type="danger"
            >
              退休
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="200"
          align="right"
          fixed="right"
        >
          <template slot-scope="scope">
            <EButton
              v-if="hasBtnPermission('manage_user_modify')"
              type="text"
              icon="edit"
              @click="addOrEditUserInFo('edit', scope.row.id, scope.row.fullName)"
            >
              编辑
            </EButton>
            <EButton
              icon="check"
              type="text"
              @click="addOrEditUserInFo('view', scope.row.id, scope.row.fullName)"
            >
              查看
            </EButton>
            <EMoreButton
              icon="more"
              text="更多"
              :list="getMoreButton(scope.row)"
              @forbidden="openAccount(false, scope.row)"
              @open="openAccount(true, scope.row)"
              @reset="resetPassword(scope.row)"
              @delete="delFn(scope.row)"
            />
            <!-- <EButton @click="resetPassword(scope.row)" style="color: var(--ky-warning)" type="text">重置密码</EButton>
            <EButton v-if="scope.row.status === '0' || scope.row.status === '3'" @click="openAccount(true, scope.row)" type="text">解冻</EButton>
            <EButton
              v-if="scope.row.status === '1' || scope.row.status === '2' || scope.row.status === undefined"
              @click="openAccount(false, scope.row)"
              type="text"
              >禁用</EButton
            >
            <EButton style="color: var(--ky-danger)" @click="delFn(scope.row)" v-if="hasBtnPermission('manage_user_delete')" type="text">删除</EButton> -->
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <!-- 分页器 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        v-if="pageFlag"
        style="text-align: right"
        :total="total"
        :current-page.sync="sForm.pageNum"
        :page-size.sync="sForm.pageSize"
        :page-sizes="[10, 20, 50]"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="getDataList"
        @current-change="getDataList"
      />
    </ECard>

    <!-- 弹窗 -->
    <div slot="dialog">
      <!-- 弹窗, 重置密码 -->
      <el-dialog
        class="normal-dialog"
        title="重置密码"
        :visible.sync="dialogResetVisible"
        width="500px"
      >
        <el-form
          ref="uForm"
          :model="setNewPassword"
          :rules="rules"
        >
          <el-form-item
            prop="newPassword"
            label="新密码"
          >
            <el-input
              v-model="setNewPassword.newPassword"
              placeholder="请输入新密码"
              show-password
            />
          </el-form-item>
          <el-button type="text">
            密码要求：
          </el-button>
          <br>
          <el-button type="text">
            1、必须包含大小写字母
          </el-button>
          <br>
          <el-button type="text">
            2、必须包含数字
          </el-button>
          <br>
          <el-button type="text">
            3、必须包含特殊字符：!、@、$、%、^、&、*
          </el-button>
          <br>
          <el-button type="text">
            4、密码长度不少于8个字符
          </el-button>
        </el-form>
        <div class="dialog-footer">
          <el-button @click="dialogResetVisible = false">
            取 消
          </el-button>
          <el-button
            type="primary"
            :loading="resetLoading"
            @click="submitNewPassword('uForm')"
          >
            确 定
          </el-button>
        </div>
      </el-dialog>
      <!-- 弹窗,修改用户状态 -->
      <el-dialog
        class="normal-dialog"
        :title="`${accountState}账号`"
        :visible.sync="accountVisible"
        width="300px"
      >
        <div>{{ sentenceState }}</div>
        <div class="dialog-footer">
          <el-button @click="accountVisible = false">
            取 消
          </el-button>
          <el-button
            type="primary"
            @click="changeAccount()"
          >
            确 定
          </el-button>
        </div>
      </el-dialog>
    </div>
  </TreeTable>
</template>

<style lang="scss" scoped>
.user-form .el-dialog {
  margin-top: 10px !important;
  display: flex;
  flex-direction: column;
  height: 95%;
}
.user-form .el-dialog__body {
  padding: 5px 10px;
  overflow: auto;
}
.user-form .hide .el-upload--picture-card {
  display: none;
}
</style>
