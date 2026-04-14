<script>
import {
  addDeviceGroup,
  deleteDeviceGroup,
  editDeviceGroup,
  getDeviceByGroup,
  getDeviceGroup,
  saveDeviceToGroup,
} from '@/http/dev/group-api'
import { getAllDevice } from '@/http/dev/manage-api'

export default {
  data: () => ({
    loading: false,
    tableData: [],
    drawer: false,
    drawerType: 0,
    drawerTitle: '',
    form: {},
    rules: {},
    submitLoading: false,
    treeLoading: false,
    treeData: [],
    drawer_dev: false, // 菜单权限 抽屉
    drawerDevTitle: '',
    defaultProps: {
      label: 'name',
    },
    defaultChecks: [],
  }),
  created() {
    this.getDataList()
    this.getAllDev()
  },
  methods: {
    getDataList() {
      this.loading = true
      getDeviceGroup()
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message

          if (resD.success === true) {
            this.tableData = resD.result
          }
          else {
            this.$message.error(msg || '查询分组失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询分组失败')
        })
    },
    getAllDev() {
      // getDeviceList({page: 1, pageSize: 1000}).then(res => {
      getAllDevice().then((res) => {
        const resD = res.data
        if (resD.success === true) {
          this.treeData = resD.result || []
        }
      })
    },
    // 新建 设备分组
    addFn() {
      this.form = {
        sortOrder: 0,
      }
      this.drawerTitle = '新建设备分组'
      this.drawerType = 0
      this.drawer = true
    },
    // 编辑 设备分组
    editFn(v) {
      this.form = JSON.parse(JSON.stringify(v))
      this.drawerTitle = '编辑设备分组'
      this.drawerType = 1
      this.drawer = true
    },
    // 删除 设备分组
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.groupName}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteDeviceGroup(v.id)
            .then((res) => {
              this.loading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success === true) {
                this.$message.success(msg || '删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(msg || '删除失败!')
              }
            })
            .catch((err) => {
              this.loading = false
              this.$message.error('删除失败!')
            })
        })
        .catch(() => {})
    },
    // 管理设备
    manageFn(v) {
      this.form = JSON.parse(JSON.stringify(v))
      this.drawer_dev = true
      this.drawerDevTitle = `${v.groupName} - 设备管理`
      this.treeLoading = true

      getDeviceByGroup(v.id)
        .then((res) => {
          // 清空上次勾选
          this.defaultChecks = []
          this.$refs.tree.setCheckedKeys([])
          this.treeLoading = false

          const resD = res.data
          if (resD.success) {
            // 重新勾选
            this.checkPermTree(this.treeData, resD.result || [])
          }
        })
        .catch((err) => {
          // 清空上次勾选
          this.defaultChecks = []
          this.$refs.tree.setCheckedKeys([])
          this.treeLoading = false
        })
    },
    // 所有设备 和 分组设备 对比， 标记分组所有的设备， 并记录在 this.defaultChecks 中
    checkPermTree(treeData, groupDevs) {
      treeData.forEach((item) => {
        groupDevs.forEach((d) => {
          if (item.id === d.id) {
            this.defaultChecks.push(item.id)
          }
        })
      })
    },

    submitFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        const {
          groupName,
          remarks,
          sortOrder,
        } = this.form
        const params = { groupName, remarks, sortOrder }

        // 添加
        if (this.drawerType === 0) {
          addDeviceGroup(params)
            .then((res) => {
              this.submitLoading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success) {
                this.$message.success(msg || '添加成功')
                this.getDataList()
                this.drawer = false
              }
              else {
                this.$message.error(msg || '添加失败')
              }
            })
            .catch((err) => {
              this.submitLoading = false
              this.$message.error('添加失败')
            })
        }
        // 编辑
        else {
          params.id = this.form.id
          editDeviceGroup(params)
            .then((res) => {
              this.submitLoading = false
              const resD = res.data
              const msg = resD.message
              if (resD.success) {
                this.$message.success(msg || '编辑成功')
                this.getDataList()
                this.drawer = false
              }
              else {
                this.$message.error(msg || '编辑失败')
              }
            })
            .catch((err) => {
              this.submitLoading = false
              this.$message.error('编辑失败')
            })
        }
      })
    },
    submitTreeFn() {
      this.submitLoading = true
      // 获取所选节点
      const tars = this.$refs.tree.getCheckedNodes()
      const temp = {}
      tars.forEach((item) => {
        temp[item.id] = item.productId
      })

      // 生成参数
      const params = {
        groupId: this.form.id,
        map: temp,
      }

      // 调用接口
      saveDeviceToGroup(params)
        .then((res) => {
          this.submitLoading = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.$message.success(msg || '修改成功')
            this.getDataList()
            this.drawer_dev = false
          }
          else {
            this.$message.error(msg || '修改失败')
          }
        })
        .catch((err) => {
          this.submitLoading = false
          this.$message.error('修改失败')
        })
    },
  },
}
</script>

<template>
  <div class="page-container">
    <ECard>
      <!-- 按钮 -->
      <!-- <el-row class="header">
        <el-col :span="24"> </el-col>
      </el-row> -->

      <div class="card-cell">
        <EButton
          type="primary"
          plain
          btnIcon="el-icon-plus"
          size="mini"
          @click="addFn"
        >
          新建分组
        </EButton>
      </div>

      <!-- 内容 -->
      <el-row class="mid-con">
        <el-col :span="24">
          <el-table
            v-loading="loading"
            class="group-table"
            :data="tableData"
            size="mini"
            style="width: 100%"
            height="80vh"
            :header-cell-style="{ background: 'var(--ky-head-color)' }"
          >
            <!-- <el-table class="group-table" :data="tableData" border size="mini" style="width: 100%" height="80vh" v-loading="loading"> -->
            <el-table-column
              label="组名"
              prop="groupName"
              align="center"
            />
            <!-- <el-table-column label="ID" prop="id" align='center'></el-table-column> -->
            <el-table-column
              label="设备数量"
              prop="deviceCount"
              align="center"
            />
            <el-table-column
              label="描述"
              prop="remarks"
              align="center"
            />
            <el-table-column
              label="操作"
              width="230"
              align="right"
            >
              <template slot-scope="scope">
                <EButton
                  size="mini"
                  icon="setting"
                  type="text"
                  @click="manageFn(scope.row)"
                >
                  管理设备
                </EButton>
                <EButton
                  size="mini"
                  icon="edit"
                  type="text"
                  @click="editFn(scope.row)"
                >
                  编辑
                </EButton>
                <EButton
                  size="mini"
                  icon="delete"
                  type="text"
                  @click="delFn(scope.row)"
                >
                  删除
                </EButton>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
    </ECard>

    <!-- 添加/编辑 抽屉 -->
    <el-drawer
      :visible.sync="drawer"
      :with-header="false"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        {{ drawerTitle }}
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="form"
          :model="form"
          label-width="85px"
          :rules="rules"
          size="mini"
        >
          <el-form-item
            label="分组名称"
            prop="groupName"
          >
            <el-input v-model="form.groupName" />
          </el-form-item>
          <el-form-item
            label="分组描述"
            prop="remarks"
          >
            <el-input v-model="form.remarks" />
          </el-form-item>
          <el-form-item
            label="排序号"
            prop="sortOrder"
          >
            <el-input-number
              v-model="form.sortOrder"
              :step="1"
              controls-position="right"
              :min="0"
              label="排序号"
            />
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="submitFn"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 管理设备 抽屉 -->
    <el-drawer
      :visible.sync="drawer_dev"
      :with-header="false"
      class="role-perm-drawer"
    >
      <div v-loading="treeLoading">
        <!-- 标题 -->
        <div class="drawer-title">
          {{ drawerDevTitle }}
        </div>

        <!-- 分割线 -->
        <el-divider />

        <!-- 内容 -->
        <div class="drawer-con drawer-scroll">
          <el-tree
            ref="tree"
            :data="treeData"
            :props="defaultProps"
            node-key="id"
            show-checkbox
            check-strictly
            :default-checked-keys="defaultChecks"
          />
          <div class="drawer-con-btns">
            <el-button
              size="mini"
              type="primary"
              :loading="submitLoading"
              @click="submitTreeFn"
            >
              提交
            </el-button>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.group-dev {
  position: relative;
  padding: 10px;
  background: #f3f7f9;
  .header {
    background: #ffffff;
    padding: 10px;
  }
  .mid-con {
    background: #ffffff;
    padding: 1vh 10px;
    .group-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }

  .drawer-scroll {
    overflow-y: auto;
    height: calc(100vh - 40px);
  }
}
</style>
