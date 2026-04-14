<script>
import {
  addCommand,
  addCommandParams,
  deleteCommand,
  deleteCommandParams,
  editCommand,
  editCommandParams,
  getCommandById,
} from '@/http/dev/product-api'

export default {
  props: ['pid'],
  data: () => ({
    allDic: {}, // 字典信息
    loadingTable: false, // 表格loading
    tableData: [], // 表格数据
    drawerCommand: false, // 添加命令抽屉开关
    drawerTitle: '', // 添加命令标题
    commandForm: {}, // 添加命令数据
    submitLoading: false, // 提交loading
    drawerItemCommand: false, // 添加命令参数抽屉开关
    drawerTitleItem: '', // 添加命令参数标题
    paramForm: {}, // 添加命令参数数据
  }),
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.getDataList()
  },
  methods: {
    /* 请求表格数据 */
    getDataList() {
      this.loadingTable = true
      getCommandById(this.pid)
        .then((res) => {
          if (res.data.success)
            this.tableData = res.data.result || []
          else this.$message.error(res.data.message || '获取 命令属性 失败')
        })
        .catch((err) => {
          this.$message.error('获取 命令属性 出错', err)
        })
        .finally(() => {
          this.loadingTable = false
        })
    },
    /* 打开添加命令抽屉 */
    addCommandClick() {
      this.commandForm = {}
      this.drawerTitle = '添加'
      this.drawerCommand = true
    },
    /* 编辑命令 */
    editCommandClick(item) {
      this.commandForm = JSON.parse(JSON.stringify(item))
      this.drawerTitle = '编辑'
      this.drawerCommand = true
    },
    /* 删除命令 */
    delCommandClick(item) {
      this.$confirm(`您确认要删除 ${item.name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteCommand(item.id)
            .then((res) => {
              if (res.data.success === true) {
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
    /* 提交命令 */
    submitCommandClick() {
      this.$refs.commandForm.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true
        this.commandForm.productId = this.pid
        let submitFunc = editCommand
        if (this.drawerTitle === '添加')
          submitFunc = addCommand
        submitFunc(this.commandForm)
          .then((res) => {
            if (res.data.success) {
              this.$message.success('提交成功')
              this.drawerCommand = false
              this.getDataList()
            }
            else {
              this.$message.error('提交失败')
            }
          })
          .catch((err) => {
            this.$message.error('提交出错！', err)
          })
          .finally(() => {
            this.submitLoading = false
          })
      })
    },
    /* 添加命令参数 */
    addParamClick(id) {
      this.paramForm = {
        code: '',
        commandId: id,
        name: '',
        required: false,
        type: '',
      }
      this.drawerTitleItem = '添加命令参数'
      this.drawerItemCommand = true
    },
    /* 编辑命令参数 */
    editParamClick(item, father) {
      this.paramForm = {
        id: item.id, // 参数id
        code: item.code,
        commandId: father.id, // 命令id
        name: item.name,
        required: item.required,
        type: item.type,
      }
      this.drawerTitleItem = '编辑命令参数'
      this.drawerItemCommand = true
    },
    /* 删除命令参数 */
    delParamClick(item) {
      this.$confirm(`您确认要删除 ${item.name} ?`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          // 找到这行数据的 父数据

          // 调用接口
          deleteCommandParams(item.id)
            .then((res) => {
              const resD = res.data
              const msg = resD.message
              if (resD.success === true) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(msg || '删除失败')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败')
            })
        })
        .catch(() => {})
    },
    /* 提交命令参数 */
    submitParamClick() {
      this.$refs.paramForm.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true
        let submitFunc = editCommandParams
        if (this.drawerTitleItem === '添加命令参数')
          submitFunc = addCommandParams
        submitFunc(this.paramForm)
          .then((res) => {
            if (res.data.success) {
              this.$message.success('提交命令参数成功')
              this.drawerItemCommand = false
              this.getDataList()
            }
            else {
              this.$message.error('提交命令参数失败')
            }
          })
          .catch((err) => {
            this.$message.error('提交命令参数出错', err)
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
  <div class="command-template">
    <!-- 按钮 -->
    <el-row>
      <el-col :span="24">
        <el-button
          type="primary"
          size="mini"
          @click="addCommandClick"
        >
          添加命令
        </el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          ref="dataTable"
          v-loading="loadingTable"
          class="command-table"
          :data="tableData"
          size="mini"
          row-key="id"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f5f5' }"
        >
          <el-table-column type="expand">
            <template slot-scope="props">
              <el-table
                :data="props.row.cmdParamList"
                size="mini"
                border
                :header-cell-style="{ background: '#f5f5f5' }"
              >
                <el-table-column
                  label="参数编码"
                  prop="code"
                  align="center"
                />
                <el-table-column
                  label="参数名"
                  prop="name"
                  align="center"
                />
                <el-table-column
                  label="参数类型"
                  align="center"
                >
                  <template slot-scope="scope">
                    <span>{{ $dictUtils.getDictLabel('value_type', scope.row.type) }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="是否必填"
                  align="center"
                >
                  <template slot-scope="scope">
                    <span>{{ scope.row.required ? '必填' : '非必填' }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  label="操作"
                  width="150"
                  align="center"
                >
                  <template slot-scope="scope">
                    <el-button
                      size="mini"
                      type="primary"
                      @click="editParamClick(scope.row, props.row)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      size="mini"
                      type="danger"
                      @click="delParamClick(scope.row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <el-table-column
            label="命令名称"
            prop="name"
            align="center"
          />
          <el-table-column
            label="命令key"
            prop="code"
            align="center"
          />
          <el-table-column
            label="命令描述"
            prop="remarks"
            align="center"
          />
          <el-table-column
            label="操作"
            width="200"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="warning"
                @click="addParamClick(scope.row.id)"
              >
                添加参数
              </el-button>
              <el-button
                size="mini"
                type="primary"
                @click="editCommandClick(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="delCommandClick(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 添加/编辑 命令 抽屉 -->
    <el-drawer
      :visible.sync="drawerCommand"
      :with-header="false"
    >
      <div class="drawer-title">
        {{ drawerTitle }}
      </div>
      <el-divider />
      <div class="drawer-con">
        <el-form
          ref="commandForm"
          :model="commandForm"
          label-width="85px"
          size="mini"
        >
          <el-form-item
            label="命令名称"
            prop="name"
            :rules="{
              required: true,
              message: '请填写命令名称',
              trigger: 'blur',
            }"
          >
            <el-input v-model="commandForm.name" />
          </el-form-item>
          <el-form-item
            label="命令编码"
            prop="code"
            :rules="{
              required: true,
              message: '请填写命令编码',
              trigger: 'blur',
            }"
          >
            <el-input v-model="commandForm.code" />
          </el-form-item>
          <el-form-item
            label="命令描述"
            prop="remarks"
          >
            <el-input v-model="commandForm.remarks" />
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="submitCommandClick"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 添加/编辑 命令参数 抽屉 -->
    <el-drawer
      :visible.sync="drawerItemCommand"
      :with-header="false"
    >
      <div class="drawer-title">
        {{ drawerTitleItem }}
      </div>
      <el-divider />
      <div class="drawer-con">
        <el-form
          ref="paramForm"
          :model="paramForm"
          label-width="85px"
          size="mini"
        >
          <el-form-item
            label="参数编码"
            prop="code"
            :rules="{
              required: true,
              message: '请填写参数编码',
              trigger: 'blur',
            }"
          >
            <el-input v-model="paramForm.code" />
          </el-form-item>
          <el-form-item
            label="参数名称"
            prop="name"
            :rules="{
              required: true,
              message: '请填写参数名称',
              trigger: 'blur',
            }"
          >
            <el-input v-model="paramForm.name" />
          </el-form-item>
          <el-form-item
            label="参数类型"
            prop="type"
            :rules="{
              required: true,
              message: '请选择参数类型',
              trigger: 'change',
            }"
          >
            <el-select
              v-model="paramForm.type"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in allDic.value_type"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label="是否必填"
            prop="required"
          >
            <el-checkbox v-model="paramForm.required" />
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="submitParamClick"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.command-template {
  .mid-con {
    padding: 15px 0;
    .command-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
