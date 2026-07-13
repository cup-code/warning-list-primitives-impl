/* * @Author: xiaorui 租户下所有组织架构树的用户 * @Date: 2023-03-10 16:49:58 * @Last Modified by:
xiaorui * @Last Modified time: 2024-01-10 11:52:33 */
<script>
import { getAuthToken } from '@/utils/tab-session'
import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
import {
  deleteUser,
  getChangeAccount,
  getUserList,
  resetPasswordFn,
} from '@/http/safe-production/user-manage-api'
import GlobalDepartmentTree from '@/views/common-ui/GlobalDepartmentTree.vue'
import UserForm from './form/UserForm'

let beforePageNum = 1
export default {
  components: {
    UserForm,
    GlobalDepartmentTree,
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
          Authorization: getAuthToken(),
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
      companyId: '',
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
    }
  },
  computed: {
    sentenceState() {
      return ` 您确定将${this.accountState}此账号?`
    },
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val)
    },
  },
  created() {
    this.sForm.pageNum = beforePageNum || 1
    this.companyId = this.$store.state.user.user.companyId
  },
  mounted() {
    // 初始化的时候，需要找到最上级公司，对应的departmentId
    getAllDepartByCompanyFn(this.companyId).then(({ data }) => {
      const departList = data.result || []
      const curentDepart = departList.find((item) => {
        return !item.parentId
      })
      this.sForm.departmentId = curentDepart.id
      this.getDataList()
    })
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
      // if (!this.newPassword) {
      //   this.$message.error('请输入新密码')
      //   return
      // }
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
    <GlobalDepartmentTree
      slot="tree"
      :companyId="companyId"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
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
    <div
      slot="auxiliary"
      class="auxiliary-button"
    >
      <el-button
        v-if="hasBtnPermission('manage_user_global_add')"
        type="primary"
        plain
        icon="el-icon-plus"
        @click="addOrEditUserInFo('add')"
      >
        新增
      </el-button>
      <el-button
        type="primary"
        plain
        icon="el-icon-download"
        @click="downloadTpl('userPostImport')"
      >
        下载用户岗位信息模板
      </el-button>
      <el-upload
        style="display: inline-flex; margin-left: 10px"
        :action="`${$http.BASE_URL}/sysUser/extend/uploadUserPost`"
        :headers="uploadLimit.header"
        :limit="1"
        :accept="uploadLimit.accept.toString()"
        :on-success="(res, file, fileList) => uploadSuccess(res, file, fileList)"
        :show-file-list="false"
      >
        <el-button
          size="mini"
          type="primary"
          icon="el-icon-upload"
        >
          上传用户岗位信息文件
        </el-button>
        <div
          slot="tip"
          class="el-upload__tip"
        >
          只允许导入“xls”或“xlsx”格式文件！
        </div>
      </el-upload>

      <el-button
        type="primary"
        plain
        icon="el-icon-download"
        @click="downloadTpl('userSafetyRiskFundImport')"
      >
        下载用户风险金数据导入模板
      </el-button>
      <el-upload
        style="display: inline-flex; margin-left: 10px"
        :action="`${$http.BASE_URL}/sysUser/extend/userSafetyRiskFundImport`"
        :headers="uploadLimit.header"
        :limit="1"
        :accept="uploadLimit.accept.toString()"
        :on-success="(res, file, fileList) => uploadSuccess(res, file, fileList)"
        :show-file-list="false"
      >
        <el-button
          size="mini"
          type="primary"
          icon="el-icon-upload"
        >
          上传用户风险金数据文件
        </el-button>
      </el-upload>
    </div>
    <!-- table区域 -->
    <el-table
      slot="table"
      ref="table"
      v-loading="loadingTable"
      height="100%"
      :data="tableData"
      size="mini"
      style="width: 100%"
      highlight-current-row
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      :border="true"
      class="customer-table"
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
        min-width="120"
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
        min-width="240"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('manage_user_global_modify')"
            style="color: var(--ky-warning)"
            type="text"
            @click="addOrEditUserInFo('edit', scope.row.id, scope.row.fullName)"
          >
            编辑
          </el-button>
          <el-button
            type="text"
            @click="addOrEditUserInFo('view', scope.row.id, scope.row.fullName)"
          >
            查看
          </el-button>
          <el-button
            style="color: var(--ky-warning)"
            type="text"
            @click="resetPassword(scope.row)"
          >
            重置密码
          </el-button>
          <el-button
            v-if="scope.row.status === '0' || scope.row.status === '3'"
            type="text"
            @click="openAccount(true, scope.row)"
          >
            解冻
          </el-button>
          <el-button
            v-if="
              scope.row.status === '1' || scope.row.status === '2' || scope.row.status === undefined
            "
            type="text"
            @click="openAccount(false, scope.row)"
          >
            禁用
          </el-button>
          <el-button
            v-if="hasBtnPermission('manage_user_global_delete')"
            style="color: var(--ky-danger)"
            type="text"
            @click="delFn(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      v-if="pageFlag"
      slot="page"
      style="text-align: right; padding: 10px 10px 0 0"
      :total="total"
      :current-page.sync="sForm.pageNum"
      :page-size.sync="sForm.pageSize"
      :page-sizes="[10, 20, 50]"
      background
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="getDataList"
      @current-change="getDataList"
    />
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
