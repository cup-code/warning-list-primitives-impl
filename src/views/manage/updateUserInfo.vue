/* * @Author: xiaorui 用户同步管理页面 * @Date: 2023-09-27 17:58:48 * @Last Modified by: xiaorui *
@Last Modified time: 2023-12-22 15:59:38 */
<script>
import {
  getUserUpdateListFn,
  updateAllUserInfoFn,
  updateUserInfoFn,
} from '@/http/safe-production/user-manage-api'
import GlobalDepartmentTree from '@/views/common-ui/GlobalDepartmentTree'

export default {
  components: {
    GlobalDepartmentTree,
  },
  data() {
    return {
      isLoading: false, // 加载
      companyId: '',
      sForm: {
        // 传递的页码数
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
        fullName: '',
        syncStatus: '',
      },
      statusList: [
        {
          label: '待同步',
          value: 0,
        },
        {
          label: '已同步',
          value: 1,
        },
      ],
      tableData: [], // 表格数据
      total: 0, // 表格数据总数
    }
  },
  created() {
    this.companyId = this.$store.state.user.user.companyId
    this.getDataList()
  },

  methods: {
    /* 点击搜索 */
    getDataList() {
      this.isLoading = true
      getUserUpdateListFn(this.sForm)
        .then((res) => {
          if (res.data.success) {
            this.tableData = res.data.result.list
            this.total = res.data.result.total
          }
          else {
            this.$message.warning(res.data.message || '获取列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    searchFn() {
      this.sForm.pageNum = 1
      this.getDataList()
    },
    /* 点击部门树的item */
    treeNodeTap(data) {
      if (data) {
        this.sForm.departmentId = data.id
      }
      else {
        delete this.sForm.departmentId
      }
      this.searchFn()
    },
    resetEvent() {
      this.$refs.sForm.resetFields()
      this.searchFn()
    },
    // 同步取消
    updateCancel(id) {
      this.$refs[`node-${id}`].doClose()
    },
    updateClick(id) {
      updateUserInfoFn(id).then(({ data }) => {
        if (data.success) {
          this.$message.success('同步成功')
          this.$refs[`node-${id}`].doClose()
          this.getDataList()
        }
        else {
          this.$message.warning(data.message || '同步失败')
        }
      })
    },
    // 一键同步
    updateAll() {
      if (!this.sForm.departmentId) {
        this.$message.warning('请先点击左侧树选择部门！')
        return
      }
      this.$confirm('确定同步吗？一旦同步无法撤回！', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.updateAllUserInfo()
        })
        .catch(() => {})
    },
    updateAllUserInfo() {
      updateAllUserInfoFn(this.sForm.departmentId).then(({ data }) => {
        if (data.success) {
          this.$message.success('同步成功')
          this.getDataList()
        }
        else {
          this.$message.warning(data.message || '同步失败')
        }
      })
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
      size="mini"
      class="sForm"
      @submit.native.prevent
    >
      <el-form-item
        prop="fullName"
        label="关键字"
      >
        <el-input
          v-model="sForm.fullName"
          placeholder="请输入用户名、姓名检索"
          clearable
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item
        prop="syncStatus"
        label="状态"
      >
        <el-select
          v-model="sForm.syncStatus"
          placeholder="请选择"
          filterable
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="item in statusList"
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
          :loading="isLoading"
          @click="searchFn"
        >
          查询
        </el-button>
        <el-button
          class="reset"
          icon="el-icon-refresh-left"
          :loading="isLoading"
          @click="resetEvent"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <div slot="auxiliary">
      <el-button
        type="primary"
        plain
        size="small"
        @click="updateAll"
      >
        一键同步
      </el-button>
    </div>
    <!-- 表格 -->
    <el-table
      slot="table"
      v-loading="isLoading"
      height="100%"
      :data="tableData"
      :header-cell-style="{ borderLeft: 'none', borderRight: 'none' }"
      align="center"
    >
      <el-table-column
        label="编号"
        align="center"
        prop="dataCode"
      />
      <el-table-column
        label="所属公司"
        align="center"
        prop="companyName"
      />
      <el-table-column
        label="组织架构"
        align="center"
        prop="departmentChain"
      />
      <el-table-column
        label="姓名"
        align="center"
        prop="fullName"
      />
      <el-table-column
        label="更新内容说明"
        prop="updateInfoStr"
      >
        <template slot-scope="props">
          <RichText :des="props.row.updateInfoStr" />
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        prop="syncStatus"
      >
        <template slot-scope="props">
          <el-tag v-if="props.row.syncStatus === 0">
            待同步
          </el-tag>
          <el-tag
            v-if="props.row.syncStatus === 1"
            type="success"
          >
            已同步
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="150"
        fixed="right"
      >
        <template slot-scope="props">
          <el-popover
            v-if="props.row.syncStatus === 0 && hasBtnPermission('manage_user_update')"
            :ref="`node-${props.row.id}`"
            placement="bottom-end"
            width="180"
          >
            <p>确定同步吗？一旦同步无法撤回！</p>
            <div style="text-align: right; margin: 0">
              <el-button
                type="text"
                style="margin-right: 10px"
                @click="updateCancel(props.row.id)"
              >
                取消
              </el-button>
              <el-button
                type="primary"
                @click="updateClick(props.row.id)"
              >
                确定
              </el-button>
            </div>
            <el-button
              v-if="props.row.syncStatus === 0 && hasBtnPermission('manage_user_update')"
              slot="reference"
              type="text"
            >
              同步更新
            </el-button>
          </el-popover>
          <!-- <el-popconfirm title="确定同步吗？一旦同步无法撤回！" @confirm="updateClick(props.row.id)">
            <el-button slot="reference" type="text" v-if="props.row.syncStatus === 0 && hasBtnPermission('manage_user_update')">同步更新</el-button>
          </el-popconfirm> -->
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      slot="page"
      :disabled="isLoading"
      style="margin: 0 20px 0 0"
      :current-page.sync="sForm.pageNum"
      :page-size.sync="sForm.pageSize"
      :page-sizes="[10, 50, 100, 500]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      @current-change="getDataList"
      @size-change="getDataList"
    />
  </TreeTable>
</template>
