<script>
import {
  deleteHKBox,
  getHKBoxList,
  registerDevice,
  unregisterDevice,
} from '@/http/hkAi-api'

import AddBoxDialog from '../components/addBoxDialog.vue'
import SearchItem from '../components/searchItem.vue'

export default {
  components: {
    SearchItem,
    AddBoxDialog,
  },
  data() {
    return {
      buttonList: [
        { text: '查看', id: 'check', type: 'primary' },
        { text: '编辑', id: 'edit', type: 'warning' },
        { text: '删除', id: 'delete', type: 'danger' },
        { text: '注册设备', id: 'register', type: 'primary' },
        { text: '注销设备', id: 'logout', type: 'primary' },
      ],
      dialogForm: {
        name: '',
        ip: '',
        port: '',
        pwd: '',
        user: '',
      },
      searchInfo: {},
      loading: true,
      dataList: [],
      pageNo: 1,
      pageSize: 5,
      total: 0,
      showAddDialog: false,
      isDisabled: false,
    }
  },
  created() {
    this.getDataList()
  },
  methods: {
    onSearch(info) {
      this.searchInfo = info
      this.getDataList(info)
    },

    onAddConfirm() {
      this.getDataList()
    },

    pageSizeFn(v) {
      this.pageNo = 1
      this.pageSize = v
      this.getDataList(this.searchInfo)
    },

    pageCurFn(v) {
      this.pageNo = v
      this.getDataList(this.searchInfo)
    },

    onDelete(info = {}) {
      this.$confirm(`您确认要删除 ${info.name}` || '—— ——', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        deleteHKBox(info.id)
          .then((res) => {
            if (res.data.success) {
              this.$message.success('删除成功！')
              this.getDataList()
            }
          })
          .catch((error) => {
            this.$message.error(error.message)
          })
      })
    },

    onRegister(info) {
      registerDevice(info)
        .then((res) => {
          if (res.data.success) {
            this.$message.success('注册成功！')
          }
          else {
            this.$message.error(res.data.message)
          }
        })
        .catch((err) => {
          this.$message.error(err.message)
        })
    },

    onUnRegister(ip) {
      unregisterDevice(ip)
        .then((res) => {
          if (res.data.success) {
            this.$message.success('注销成功！')
            this.getDataList()
          }
        })
        .catch((err) => {
          this.$message.error(err.message)
        })
    },

    onClick(ids, info) {
      const {
        id,
        ip,
        name,
        pwd,
        port,
        user,
      } = info

      switch (ids) {
        case 'delete':
          this.onDelete(info)
          break
        case 'edit':
          this.showAddDialog = true
          this.dialogForm = { id, ip, port, name, pwd, user }
          break
        case 'check':
          this.isDisabled = true
          this.showAddDialog = true
          this.dialogForm = info
          break
        case 'register':
          this.onRegister(info)
          break
        case 'logout':
          this.onUnRegister(ip)
          break
      }
    },

    addFn() {
      this.showAddDialog = true
    },

    getDataList() {
      const param = {
        pageSize: this.pageSize,
        pageNum: this.pageNo,
      }

      if (this.searchInfo.name) {
        param.name = this.searchInfo.name
      }

      if (this.searchInfo.ip) {
        param.ip = this.searchInfo.ip
      }

      getHKBoxList(param)
        .then((res) => {
          const { data } = res
          if (data.success) {
            this.dataList = data.result.list || []

            const {
              total,
              pageNum,
              pageSize,
            } = data.result
            this.total = total || 0
            this.pageNo = pageNum
            this.pageSzie = pageSize
          }

          this.loading = false
        })
        .catch((error) => {
          this.$message.error(error.message)
          this.loading = false
        })
    },
  },
}
</script>

<template>
  <TreeTable
    ref="treeTable"
    :isShowLeft="false"
  >
    <!-- 查询条件 -->
    <ECard
      slot="search"
      noneBottom
    >
      <SearchItem
        isBoxSearch
        @search="onSearch"
      />
    </ECard>
    <ECard slot="table">
      <div class="card-cell">
        <EButton
          type="primary"
          btnIcon="el-icon-plus"
          plain
          @click="addFn"
        >
          新增
        </EButton>
      </div>

      <el-table
        v-loading="loading"
        :data="dataList"
        style="width: 100%"
        size="mini"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
      >
        <el-table-column
          label="盒子名称"
          prop="name"
          align="left"
        />
        <el-table-column
          label="盒子ip"
          prop="ip"
          align="center"
        />
        <el-table-column
          label="端口"
          prop="port"
          align="center"
        />
        <el-table-column
          label="用户名"
          prop="user"
          align="center"
        />
        <el-table-column
          label="密码"
          prop="pwd"
          align="center"
        />
        <el-table-column
          label="操作"
          align="right"
        >
          <template slot-scope="scope">
            <el-button
              v-for="(item, index) in buttonList"
              :key="index"
              type="text"
              :style="`color:var(--ky-${item.type})`"
              @click="onClick(item.id, scope.row)"
            >
              {{ item.text }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <!-- 分页 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        :current-page.sync="pageNo"
        :page-sizes="[5, 10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>

    <template slot="dialog">
      <AddBoxDialog
        :disabled.sync="isDisabled"
        :forms.sync="dialogForm"
        :dialogVisible.sync="showAddDialog"
        title="新增盒子"
        @confirm="onAddConfirm"
      />
    </template>
  </TreeTable>
</template>

<style lang="scss" scoped>
.page-container {
  padding: 20px;

  .page-cell {
    padding: 14px 10px;
    background-color: #ffffff;
    margin-bottom: 12px;
    width: 100%;
    height: 100%;

    .button--add {
      margin-bottom: 20px;
    }

    &--footer {
      padding: 14px 10px;
      background-color: #ffffff;
      margin-bottom: 20px;
      width: 100%;
      height: 100%;
      text-align: right;
    }
  }
}
</style>
