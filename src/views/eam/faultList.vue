<script>
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import {
  addFaultType,
  deleteFaultType,
  editFaultType,
  getAllAssetType,
  getFaultTypeList,
} from '@/http/eam-api'
import { formatDate } from '@/utils'

export default {
  data: () => ({
    loading: false,
    tableData: [],
    pageFlag: true,
    sForm: {
      page: 1,
      pageSize: 10,
    },
    total: 0,
    drawer: false,
    drawerType: 0,
    drawerTitle: '',
    form: {},
    rules: {},
    submitLoading: false,
    typeList: [],
  }),
  watch: {
    typeList(v) {
      const dt = this.tableData
      if (dt.length !== 0) {
        this.fixDataFn(dt)
      }
    },
  },
  created() {
    this.getDataList()
    this.getAllTypeList()
  },
  methods: {
    formatDate,
    getDataList() {
      this.loading = true
      getFaultTypeList(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message

          if (resD.success === true) {
            this.fixDataFn(resD.result.list || [])
            this.total = resD.result.total
          }
          else {
            this.$message.error(msg || '查询故障类型失败')
          }
        })
        .catch((err) => {
          console.log('err: ', err)
          this.loading = false
          this.$message.error('查询故障类型失败')
        })
    },
    // 查询所有资产类型列表
    getAllTypeList() {
      getAllAssetType().then((res) => {
        const resD = res.data
        if (resD.success === true) {
          this.typeList = resD.result
        }
      })
    },
    // 处理数据
    fixDataFn(dt) {
      let temp
      this.tableData = dt.map((item) => {
        temp = []
        const ids = item.assetsTypeIdList || []
        ids.forEach((id) => {
          this.typeList.forEach((t) => {
            if (id == t.id) {
              temp.push(t.name)
            }
          })
        })
        item.assetsTypeNames = temp.join(' | ')

        return item
      })
    },
    pageSizeFn(v) {
      this.sForm.page = 1
      this.sForm.pageSize = v
      this.getDataList()
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    // 新增 故障类型
    addFn() {
      this.form = {}
      this.drawerTitle = '新增故障类型'
      this.drawerType = 0
      this.drawer = true
    },
    // 编辑 故障类型
    editFn(v) {
      this.form = JSON.parse(JSON.stringify(v))
      this.drawerTitle = '编辑故障类型'
      this.drawerType = 1
      this.drawer = true
    },
    // 删除 故障类型
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteFaultType(v.id)
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
    submitFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true

        // 添加
        if (this.drawerType === 0) {
          addFaultType(this.form)
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
          const {
            assetsTypeIdList,
            code,
            name,
            remarks,
            sort,
            id,
          } = this.form
          const params = { assetsTypeIdList, code, name, remarks, sort, id }

          editFaultType(params)
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

    // 导出
    exportFn() {
      const param = {
        raw: true, // 表示导出的数据 是否是未加工的
      }
      // 从表生成工作簿对象
      const wb = XLSX.utils.table_to_book(document.getElementById('down_table'), param)

      // 获取二进制字符串作为输出
      const wbout = XLSX.write(wb, {
        bookType: 'xlsx',
        bookSST: true,
        type: 'array',
      })

      // 生成文件名
      const fileName = '故障类型'

      try {
        FileSaver.saveAs(
          // Blob 对象表示一个不可变、原始数据的类文件对象。
          // Blob 表示的不一定是JavaScript原生格式的数据。//File 接口基于Blob，继承了 blob 的功能并将其扩展使其支持用户系统上的文件。
          // 返回一个新创建的 Blob 对象，其内容由参数中给定的数组串联组成。
          new Blob([wbout], { type: 'application/octet-stream' }),
          // 设置导出文件名称
          `${fileName}.xlsx`,
        )
      }
      catch (e) {
        if (typeof console !== 'undefined')
          console.log(e, wbout)
      }
      return wbout
    },
  },
}
</script>

<template>
  <div class="faultList-eam">
    <!-- 按钮 -->
    <el-row>
      <el-col :span="24">
        <el-button
          type="primary"
          icon="el-icon-plus"
          size="mini"
          @click="addFn"
        >
          新增
        </el-button>
        <el-button
          type="success"
          icon="el-icon-download"
          size="mini"
          @click="exportFn"
        >
          导出
        </el-button>
      </el-col>
    </el-row>

    <!-- 内容 -->
    <el-row class="mid-con">
      <el-col :span="24">
        <el-table
          id="down_table"
          v-loading="loading"
          class="group-table"
          :data="tableData"
          border
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f5f5' }"
        >
          <el-table-column
            label="资产类别"
            prop="assetsTypeNames"
            align="center"
          />
          <el-table-column
            label="故障类型编号"
            prop="code"
            align="center"
          />
          <el-table-column
            label="故障类型名称"
            prop="name"
            align="center"
          />
          <el-table-column
            label="排序"
            prop="sort"
            align="center"
          />
          <el-table-column
            label="备注"
            prop="remarks"
            align="center"
          />
          <el-table-column
            label="操作"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="editFn(scope.row)"
              >
                编辑
              </el-button>
              <!-- 不允许删除 -->
              <!-- <el-button @click="delFn(scope.row)" size="mini" type="danger">删除</el-button> -->
            </template>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <!-- 页码 -->
    <el-row>
      <el-pagination
        v-if="pageFlag"
        style="text-align: right"
        :current-page="sForm.page"
        :page-sizes="[10, 20, 50]"
        :page-size="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </el-row>

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
          label-width="65px"
          :rules="rules"
          size="mini"
        >
          <el-form-item
            label="资产类别"
            prop="assetsTypeIdList"
          >
            <el-select
              v-model="form.assetsTypeIdList"
              multiple
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in typeList"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              >
                <span>{{ item.fullName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="类型编号"
            prop="code"
          >
            <el-input v-model="form.code" />
          </el-form-item>
          <el-form-item
            label="类型名称"
            prop="name"
          >
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item
            label="排序值"
            prop="sort"
          >
            <el-input-number
              v-model="form.sort"
              controls-position="right"
              :min="0"
              :max="1000"
            />
          </el-form-item>
          <el-form-item
            label="备注"
            prop="remarks"
          >
            <el-input v-model="form.remarks" />
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
  </div>
</template>

<style lang="scss" scoped>
.faultList-eam {
  position: relative;
  padding: 10px;
  .mid-con {
    padding: 2vh 0;
    .group-table {
      .el-button {
        padding: 5px 7px;
      }
    }
  }
}
</style>
