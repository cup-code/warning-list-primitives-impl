<script>
import UserSelect from '@/components/userSelect/UserSelectDialog.vue'
import {
  assignRole,
  getUserWithRole,
  removeRoleForUser,
} from '@/http/safe-production/role-manage-api'

export default {
  components: {
    UserSelect,
  },
  data() {
    return {
      roleId: '',
      tableData: [],
      loading: false,
    }
  },
  methods: {
    elTableHeadFunction(h, l, fontSize) {
      let f = 14
      if (typeof fontSize !== 'undefined' && fontSize != null) {
        f = fontSize
      }
      // 列头的实际宽度
      const width = l.column.realWidth
      // 14：字体大小 32 是el表格的左右 padding 的合
      const maxFontCount = Math.floor((width - 32) / f) - 1
      const chars = l.column.label.split('')
      let label = ''
      if (maxFontCount < chars.length) {
        for (let i = 0; i < maxFontCount; i++) {
          label += chars[i]
        }
        label += '..'
      }
      else {
        label = l.column.label
      }
      return label
    },

    // 获取数据列表
    refreshList(id) {
      this.roleId = id
      this.loading = true
      getUserWithRole(id).then(({ data }) => {
        this.loading = false
        if (data.success) {
          this.tableData = data.result || []
        }
        else {
          this.$message.error(data.message || '查询人员失败')
        }
      })
    },
    // 新增
    add() {
      this.$refs.userSelect.init()
    },
    // 删除
    del(id) {
      this.$confirm(`确认把用户从角色中移除吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.loading = true
        removeRoleForUser(this.roleId, id).then(({ data }) => {
          this.loading = false
          if (data && data.success) {
            this.$message.success({
              dangerouslyUseHTMLString: true,
              message: data.message,
            })
            this.refreshList(this.roleId)
          }
        })
      })
    },
    closeRight() {
      this.$emit('closeRight')
    },
    selectUsersToRole(users) {
      const userIdList = users.map((user) => {
        return user.id
      })
      this.loading = true
      assignRole({
        roleId: this.roleId,
        userIdList,
      }).then(({ data }) => {
        this.loading = false
        if (data && data.success) {
          this.$message.success({
            dangerouslyUseHTMLString: true,
            message: data.message,
          })
          this.refreshList(this.roleId)
        }
      })
    },
  },
}
</script>

<template>
  <div style="padding: 10px">
    <el-row>
      <el-button
        v-if="hasBtnPermission('manage_role_addPerson')"
        type="primary"
        size="small"
        icon="el-icon-plus"
        @click="add()"
      >
        添加人员
      </el-button>
    </el-row>
    <el-table
      v-loading="loading"
      :data="tableData"
      size="small"
      :max-height="300"
      class="table"
      @render-header="elTableHeadFunction"
    >
      <el-table-column
        type="index"
        label="序号"
        width="50"
      />
      <el-table-column
        prop="fullName"
        min-width="100px"
        label="姓名"
      />
      <el-table-column
        prop="companyName"
        min-width="120px"
        label="所属企业"
      />
      <el-table-column
        :key="Math.random()"
        fixed="right"
        header-align="center"
        align="center"
        width="100"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button
            v-if="hasBtnPermission('manage_role_deletePerson')"
            type="text"
            size="small"
            @click="del(scope.row.id)"
          >
            移除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <user-select
      ref="userSelect"
      :selectData="tableData"
      @doSubmit="selectUsersToRole"
    />
  </div>
</template>
