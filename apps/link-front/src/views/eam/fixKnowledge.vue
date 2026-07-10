<script>
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import {
  addFaultKnowledge,
  deleteFaultKnowledge,
  editFaultKnowledge,
  exportFaultKnowledge,
  getAllAssetType,
  getAllFaultType,
  getFaultKnowledgeList,
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
    typeList: [], // 所有资产类别 列表
    faultList: [],
    fTypeList: [], // 所选故障类型的 资产类别列表

    drawer_ex: false, // 后台导出
    exForm: {}, // 后台导出 筛选表单
  }),
  created() {
    this.getDataList()
    this.getAllTypeList()
    this.getAllFaultList()
  },
  methods: {
    formatDate,
    getDataList() {
      this.loading = true
      getFaultKnowledgeList(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message

          if (resD.success === true) {
            this.tableData = resD.result.list || []
            this.total = resD.result.total
          }
          else {
            this.$message.error(msg || '查询故障知识失败')
          }
        })
        .catch((err) => {
          console.log('err: ', err)
          this.loading = false
          this.$message.error('查询故障知识失败')
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
    // 查询所有故障类型列表
    getAllFaultList() {
      getAllFaultType().then((res) => {
        const resD = res.data
        if (resD.success === true) {
          this.faultList = resD.result
        }
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
    // 新增 知识
    addFn() {
      this.form = {}
      this.drawerTitle = '新增知识'
      this.drawerType = 0
      this.drawer = true
    },
    // 编辑 知识
    editFn(v) {
      // 根据所选故障类型， 生成对应的资产类别列表
      this.faultList.forEach((t) => {
        if (t.id == v.faultTypeId) {
          // 生成 所选故障类型 的 资产类别列表
          this.genFTypeList(t.assetsTypeIdList || [])
        }
      })

      this.form = JSON.parse(JSON.stringify(v))
      this.drawerTitle = '编辑知识'
      this.drawerType = 1
      this.drawer = true
    },
    // 删除 知识
    delFn(v) {
      this.$confirm('您确认要删除数据', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteFaultKnowledge(v.id)
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
          addFaultKnowledge(this.form)
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
            assetsType,
            assetsTypeId,
            faultType,
            faultTypeId,
            reason,
            remarks,
            repairContent,
            trouble,
            id,
          } = this.form
          const params = {
            assetsType,
            assetsTypeId,
            faultType,
            faultTypeId,
            reason,
            remarks,
            repairContent,
            trouble,
            id,
          }

          editFaultKnowledge(params)
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

    // 资产类型change
    typeFn(v) {
      // 使用try方式， 可以实现 找到目标后终止遍历
      try {
        this.fTypeList.forEach((t) => {
          if (t.id == v) {
            this.form.assetsType = t.name
            throw '找到目标，终止遍历'
          }
        })
      }
      catch (e) {}
    },
    // 故障类型change
    faultFn(v) {
      // 清空上次所选资产类型
      this.$set(this.form, 'assetsTypeId', '')

      // 使用try方式， 可以实现 找到目标后终止遍历
      try {
        this.faultList.forEach((t) => {
          if (t.id == v) {
            this.form.faultType = t.name

            // 生成 所选故障类型 的 资产类别列表
            this.genFTypeList(t.assetsTypeIdList || [])

            throw '找到目标，终止遍历'
          }
        })
      }
      catch (e) {}
    },
    // 根据所选的故障类型 生成 资产类别列表
    genFTypeList(dt) {
      this.fTypeList = []

      this.typeList.forEach((item) => {
        dt.forEach((d) => {
          if (d == item.id) {
            this.fTypeList.push(item)
          }
        })
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
      const fileName = '维修知识'

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

    // 后台导出 按钮
    backExportFn() {
      this.drawer_ex = true
      this.exForm = Object.assign({}, this.sForm)
    },
    // 后台导出 确定
    backExportDoFn() {
      exportFaultKnowledge(this.exForm).then((res) => {
        const resD = res.data
        const msg = resD.message
        if (resD.success) {
          window.open(resD.result, '_self')
        }
        else {
          this.$message.error(msg || '导出失败')
        }
      })
    },
  },
}
</script>

<template>
  <div class="fixKnowledge-eam">
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
        <!-- <el-button type="success" icon="el-icon-download" size="mini" @click="exportFn">导出</el-button> -->
        <el-button
          type="success"
          icon="el-icon-download"
          size="mini"
          @click="backExportFn"
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
            prop="assetsType"
            align="center"
          />
          <el-table-column
            label="故障类型"
            prop="faultType"
            align="center"
          />
          <el-table-column
            label="问题描述"
            prop="trouble"
            align="center"
          />
          <el-table-column
            label="维修内容"
            prop="repairContent"
            align="center"
          />
          <el-table-column
            label="问题原因"
            prop="reason"
            align="center"
          />
          <el-table-column
            label="备注"
            prop="remarks"
            align="center"
          />
          <el-table-column
            label="操作"
            width="120"
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
            label="故障类型"
            prop="faultTypeId"
          >
            <el-select
              v-model="form.faultTypeId"
              placeholder="请选择"
              style="width: 100%"
              @change="faultFn"
            >
              <el-option
                v-for="item in faultList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="资产类别"
            prop="assetsTypeId"
          >
            <el-select
              v-model="form.assetsTypeId"
              placeholder="请选择"
              style="width: 100%"
              @change="typeFn"
            >
              <el-option
                v-for="item in fTypeList"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              >
                <span>{{ item.fullName }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="问题描述"
            prop="trouble"
          >
            <el-input
              v-model="form.trouble"
              type="textarea"
              :rows="6"
            />
          </el-form-item>
          <el-form-item
            label="维修内容"
            prop="repairContent"
          >
            <el-input
              v-model="form.repairContent"
              type="textarea"
              :rows="6"
            />
          </el-form-item>
          <el-form-item
            label="问题原因"
            prop="reason"
          >
            <el-input
              v-model="form.reason"
              type="textarea"
              :rows="6"
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

    <!-- 后台导出 抽屉 -->
    <el-drawer
      :visible.sync="drawer_ex"
      :with-header="false"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        筛选条件
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="exForm"
          :model="exForm"
          label-width="65px"
          size="mini"
        >
          <el-form-item label="问题描述">
            <el-input v-model="exForm.name" />
          </el-form-item>
          <el-form-item label="故障类型">
            <el-select
              v-model="exForm.faultTypeId"
              placeholder="请选择"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in faultList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="资产类型">
            <el-select
              v-model="exForm.assetsTypeId"
              placeholder="请选择"
              clearable
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
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="success"
            @click="backExportDoFn"
          >
            导出
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss" scoped>
.fixKnowledge-eam {
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
