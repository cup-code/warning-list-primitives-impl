<script>
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import {
  addAssetType,
  addAssetTypeDoc,
  deleteAssetType,
  editAssetType,
  getAssetTypeDoc,
  getAssetTypeList,
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

    loading_doc: false,
    drawer_doc: false, // 电子文档 抽屉
    tableData_doc: [],
  }),
  created() {
    this.getDataList()
  },
  methods: {
    formatDate,
    getDataList() {
      this.loading = true
      getAssetTypeList(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message

          if (resD.success === true) {
            this.tableData = resD.result.list
            this.total = resD.result.total
          }
          else {
            this.$message.error(msg || '查询分类失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询分类失败')
        })
    },
    // 获取指定资产类别的 电子文档数据
    getDocData(id) {
      this.tableData_doc = []
      this.loading_doc = true
      getAssetTypeDoc(id)
        .then((res) => {
          this.loading_doc = false
          const resD = res.data
          if (resD.success === true) {
            this.tableData_doc = (resD.result || []).map(item => ({
              file: item,
            }))
          }
        })
        .catch((err) => {
          this.loading_doc = false
        })
    },
    pageCurFn(v) {
      this.sForm.page = v
      this.getDataList()
    },
    // 新增 分类
    addFn() {
      this.form = {}
      this.drawerTitle = '新增分类'
      this.drawerType = 0
      this.drawer = true
    },
    // 编辑 分类
    editFn(v) {
      this.form = JSON.parse(JSON.stringify(v))
      this.drawerTitle = '编辑分类'
      this.drawerType = 1
      this.drawer = true
    },
    // 删除 分类
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteAssetType(v.id)
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
          addAssetType(this.form)
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
            code,
            name,
            remarks,
            id,
          } = this.form
          const params = { code, name, remarks, id }

          editAssetType(params)
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
      const fileName = '资产分类'

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
    // 电子文档按钮
    docFn(v) {
      this.getDocData(v.id) // 查询指定资产类型下的 电子文档数据
      this.form = JSON.parse(JSON.stringify(v))
      this.drawer_doc = true
    },
    // 电子文档 上传按钮
    upBeforeFn(file) {
      this.loading_doc = true

      const params = {
        id: this.form.id,
        files: [file],
      }

      addAssetTypeDoc(params)
        .then((res) => {
          this.loading_doc = false
          const resD = res.data
          const msg = resD.message
          if (resD.success) {
            this.getDocData(this.form.id)
          }
          else {
            this.$message.error(msg || '上传失败')
          }
        })
        .catch((err) => {
          this.loading_doc = false
          this.$message.error('上传失败')
        })

      return false
    },
  },
}
</script>

<template>
  <div class="assetCategory-eam">
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
            label="编码"
            prop="code"
            align="center"
          />
          <el-table-column
            label="名称"
            prop="name"
            align="center"
          />
          <el-table-column
            label="描述"
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
                type="success"
                @click="docFn(scope.row)"
              >
                电子文档
              </el-button>
              <el-button
                size="mini"
                type="primary"
                @click="editFn(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="delFn(scope.row)"
              >
                删除
              </el-button>
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
        :page-size="sForm.pageSize"
        layout="total, prev, pager, next, jumper"
        :total="total"
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
            label="编码"
            prop="code"
          >
            <el-input v-model="form.code" />
          </el-form-item>
          <el-form-item
            label="名称"
            prop="name"
          >
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item
            label="描述"
            prop="remarks"
          >
            <el-input
              v-model="form.remarks"
              type="textarea"
              rows="6"
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

    <!-- 电子文档 抽屉 -->
    <el-drawer
      :visible.sync="drawer_doc"
      :with-header="false"
    >
      <div
        v-loading="loading_doc"
        style="display: flex; flex-direction: column; overflow: hidden"
      >
        <!-- 标题 -->
        <div class="drawer-title">
          电子文档
        </div>

        <!-- 分割线 -->
        <el-divider />

        <!-- 内容 -->
        <div class="drawer-con">
          <div style="margin-bottom: 2vh">
            <el-upload
              action=""
              :before-upload="upBeforeFn"
            >
              <el-button
                type="primary"
                icon="el-icon-upload2"
                size="mini"
              >
                上传
              </el-button>
            </el-upload>
          </div>

          <el-table
            :data="tableData_doc"
            border
            size="mini"
            style="width: 100%"
            :header-cell-style="{ background: '#f5f5f5' }"
          >
            <el-table-column
              label="文件"
              prop="file"
              align="center"
            >
              <template slot-scope="props">
                <a :href="props.row.file">{{ props.row.file }}</a>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.assetCategory-eam {
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
