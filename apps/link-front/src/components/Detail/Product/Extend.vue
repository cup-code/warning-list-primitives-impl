<script>
import {
  addExtend,
  deleteExtend,
  editExtend,
  getExtendById,
} from '@/http/dev/product-api'

export default {
  props: ['pid'],
  data: () => ({
    loadingTable: false, // 表格loading
    tableData: [], // 表格数据
    drawerForm: false, // 添加/编辑抽屉开关
    drawerTitle: '', // 抽屉标题
    editForm: {}, // 添加/编辑数据
    submitLoading: false, // 提交loading
  }),
  created() {
    this.getDataList()
  },
  methods: {
    /* 获取表格数据 */
    getDataList() {
      this.loadingTable = true
      getExtendById(this.pid)
        .then((res) => {
          if (res.data.success)
            this.tableData = res.data.result || []
          else this.$message.error(res.data.message || '获取 扩展属性 失败')
        })
        .catch((err) => {
          this.$message.error('获取 扩展属性 出错', err)
        })
        .finally(() => {
          this.loadingTable = false
        })
    },
    /* 添加扩展 */
    addClick() {
      this.editForm = {}
      this.drawerTitle = '添加扩展'
      this.drawerForm = true
    },
    /* 编辑扩展 */
    editClick(item) {
      this.editForm = JSON.parse(JSON.stringify(item))
      this.drawerTitle = '编辑扩展'
      this.drawerForm = true
    },
    /* 删除扩展 */
    delClick(item) {
      this.$confirm(`您确认要删除 ${item.name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteExtend(item.id)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(res.data.message || '删除失败!')
              }
            })
            .catch((err) => {
              this.$message.error('删除出错!', err)
            })
        })
        .catch(() => {})
    },
    /* 提交添加/编辑 */
    submitClick() {
      this.$refs.ruleForm.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true
        this.editForm.productId = this.pid
        let submitFunc = editExtend
        if (this.drawerTitle == '添加扩展')
          submitFunc = addExtend
        submitFunc(this.editForm)
          .then((res) => {
            if (res.data.success) {
              this.$message.success('提交成功')
              this.drawerForm = false
              this.getDataList()
            }
            else {
              this.$message.error('提交失败')
            }
          })
          .catch((err) => {
            this.$message.error('提交出错', err)
          })
          .finally(() => {
            this.submitLoading = false
          })
      })
    },
  },
}
</script>

<template>
  <div class="extend-template">
    <!-- 按钮 -->
    <el-row>
      <el-col :span="24">
        <el-button
          type="primary"
          size="mini"
          @click="addClick"
        >
          添加扩展
        </el-button>
      </el-col>
    </el-row>
    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          v-loading="loadingTable"
          class="extend-table"
          :data="tableData"
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: 'var(--ky-head-color)' }"
        >
          <el-table-column
            label="扩展属性编码"
            prop="code"
            align="center"
          />
          <el-table-column
            label="扩展属性名"
            prop="name"
            align="center"
          />
          <el-table-column
            label="扩展属性值"
            prop="value"
            align="center"
          />
          <el-table-column
            label="操作"
            width="200"
            align="center"
          >
            <template slot-scope="scope">
              <EButton
                plain
                size="mini"
                type="primary"
                @click="editClick(scope.row)"
              >
                编辑
              </EButton>
              <EButton
                plain
                size="mini"
                type="danger"
                @click="delClick(scope.row)"
              >
                删除
              </EButton>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 添加/编辑 抽屉 -->
    <el-drawer
      :visible.sync="drawerForm"
      :with-header="false"
    >
      <div class="drawer-title">
        {{ drawerTitle }}
      </div>
      <el-divider />
      <div class="drawer-con">
        <el-form
          ref="ruleForm"
          :model="editForm"
          label-width="85px"
          size="mini"
        >
          <el-form-item
            label="属性编码"
            prop="code"
            :rules="{
              required: true,
              message: '请填写属性编码',
              trigger: 'blur',
            }"
          >
            <el-input v-model="editForm.code" />
          </el-form-item>
          <el-form-item
            label="属性名称"
            prop="name"
            :rules="{
              required: true,
              message: '请填写属性名称',
              trigger: 'blur',
            }"
          >
            <el-input v-model="editForm.name" />
          </el-form-item>
          <el-form-item
            label="属性值"
            prop="value"
            :rules="{
              required: true,
              message: '请填写属性值',
              trigger: 'blur',
            }"
          >
            <el-input v-model="editForm.value" />
          </el-form-item>
        </el-form>
        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="submitClick"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.extend-template {
  .mid-con {
    padding: 15px 0;
    .extend-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
