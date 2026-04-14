<script>
import FileSaver from 'file-saver'
import { cloneDeep } from 'lodash'
import XLSX from 'xlsx'
import {
  addMainItem,
  deleteMainItem,
  editMainItem,
  exportMainItems,
  getAllAssetType,
  getMainItemList,
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
      maintenanceType: 'INSPECTION', // 巡检
    },
    total: 0,
    drawer: false,
    drawerType: 0,
    drawerTitle: '',
    form: {},
    rules: {},
    submitLoading: false,
    typeList: [],
    optionList: [
      { name: '单选', value: 'RADIO' },
      { name: '多选', value: 'MULTI_CHOICE' },
    ],
    radioList: [], // 动态添加的选项列表 （操作类型为 单选、多选时 用到）

    drawer_ex: false, // 后台导出
    exForm: {}, // 后台导出 筛选表单
    hasCopyData: false, // 判断是否有复制的巡检标准内容，点击复制按钮后为true；点击新增之后设置为false，避免重复复制
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
      getMainItemList(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message

          if (resD.success === true) {
            this.fixDataFn(resD.result.list || [])
            this.total = resD.result.total
          }
          else {
            this.$message.error(msg || '查询项目失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询项目失败')
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
      this.tableData = dt.map((item) => {
        this.typeList.forEach((t) => {
          if (item.assetsTypeId == t.id) {
            item.assetsTypeName = t.name
          }
        })
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
    // 新增 项目
    addFn() {
      // 新增巡检项目时如果有复制的巡检标准，则显示复制的标准；如果没有，则清空
      if (this.hasCopyData) {
        this.genTypeOpts(this.form)
      }
      else {
        this.radioList = []
        this.form = {
          sort: 0,
        }
      }
      this.drawerTitle = '新增项目'
      this.drawerType = 0
      this.drawer = true
      this.hasCopyData = false
    },
    // 编辑 项目
    editFn(v) {
      this.genTypeOpts(v) // 根据操作类型，生成不同的表单数据

      this.form = JSON.parse(JSON.stringify(v))
      if (!this.form.sort) {
        this.form.sort = 0
      }
      this.drawerTitle = '编辑项目'
      this.drawerType = 1
      this.drawer = true
      this.hasCopyData = false // 防止先点击复制，再点击编辑，然后点击新增时，表单内容全部显示的问题
    },
    // 复制巡检标准按钮
    copyFn(v) {
      this.hasCopyData = true
      this.form = Object.assign(
        {},
        {
          operationType: v.operationType,
          operationResultList: cloneDeep(v.operationResultList),
          sort: v.sort,
        },
      )
    },
    // 删除 项目
    delFn(v) {
      this.$confirm('您确认要删除数据么', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteMainItem(v.id)
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

        this.form.maintenanceType = 'INSPECTION' // 维保类型为 巡检
        this.genBackOpts() // 根据操作类型，组装对应的选项数据

        // 添加
        if (this.drawerType === 0) {
          addMainItem(this.form)
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
          editMainItem(this.form)
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

    // 根据后台数据， 生成操作类型的选项
    genTypeOpts(v) {
      switch (v.operationType) {
        // 单选、多选
        case 'RADIO':
        case 'MULTI_CHOICE':
          this.radioList = (v.operationResultList || []).map((item) => {
            return {
              value: item.operationResult,
            }
          })
          break
        default:
          this.radioList = [] // 清空 单选多选操作类型的 选项数据
          break
      }
    },
    // 根据操作类型， 生成对应的回传数据
    genBackOpts() {
      const type = this.form.operationType
      this.form.operationResultList = []

      if (type === 'RADIO' || type === 'MULTI_CHOICE') {
        // 单选、多选
        const opts = []
        let opt
        this.radioList.forEach((item) => {
          opt = item.value.trim()
          if (!opt)
            return
          opts.push(opt)
        })

        this.form.operationResultList = opts
      }
    },
    // 添加选项 （操作类型为 单选、多选时）
    addRadioFn() {
      const temp = {}
      this.radioList.push(temp)
    },
    // 删除选项
    delRadioFn(key) {
      this.radioList.splice(key, 1)
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
      const fileName = '巡检项目'

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
      this.exForm.maintenanceType = 'INSPECTION' // 巡检
      exportMainItems(this.exForm).then((res) => {
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
  <div class="checkList-eam">
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
            label="资产类型"
            prop="assetsTypeName"
            align="center"
          />
          <el-table-column
            label="巡检内容"
            prop="itemContent"
            align="center"
          />
          <el-table-column
            label="操作类型"
            prop="operationType"
            align="center"
          >
            <template slot-scope="props">
              <el-tag
                v-if="props.row.operationType === 'TIPS'"
                size="mini"
                type="warning"
              >
                提示
              </el-tag>
              <el-tag
                v-if="props.row.operationType === 'INPUT_BOX'"
                size="mini"
                type="primary"
              >
                输入框
              </el-tag>
              <el-tag
                v-if="props.row.operationType === 'RADIO'"
                size="mini"
                type="success"
              >
                单选
              </el-tag>
              <el-tag
                v-if="props.row.operationType === 'MULTI_CHOICE'"
                size="mini"
                type="success"
              >
                多选
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="选项"
            prop="operationResultList"
            align="center"
          >
            <template slot-scope="props">
              {{
                (props.row.operationResultList || [])
                  .map((item) => item.operationResult)
                  .join(" | ")
              }}
            </template>
          </el-table-column>
          <!-- <el-table-column label="排序" prop="sort" align='center'></el-table-column> -->
          <el-table-column
            label="备注"
            prop="remarks"
            align="center"
          />
          <el-table-column
            label="操作"
            width="250"
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
                type="warning"
                @click="copyFn(scope.row)"
              >
                复制巡检标准
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
    <el-drawer :visible.sync="drawer" :with-header="false">
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
          <el-form-item label="资产类型" prop="assetsTypeId">
            <el-select
              v-model="form.assetsTypeId"
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
          <el-form-item label="巡检内容" prop="itemContent">
            <el-input v-model="form.itemContent" />
          </el-form-item>
          <el-form-item label="操作类型" prop="operationType">
            <el-select
              v-model="form.operationType"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in optionList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <!-- 操作类型为 单选、多选时 显示 -->
          <el-form-item
            v-if="form.operationType === 'RADIO' || form.operationType === 'MULTI_CHOICE'"
            class="option-item"
            label="选项"
          >
            <div>
              <el-button
                type="primary"
                icon="el-icon-plus"
                circle
                @click="addRadioFn"
              />
            </div>
            <div class="input-con">
              <el-row v-for="(item, key) in radioList" :key="key">
                <el-col :span="19">
                  <el-input v-model="item.value" placeholder="请输入选项" />
                </el-col>
                <el-col :offset="1" :span="4">
                  <el-button
                    type="danger"
                    icon="el-icon-minus"
                    circle
                    @click="delRadioFn(key)"
                  />
                </el-col>
              </el-row>
            </div>
          </el-form-item>

          <el-form-item label="备注" prop="remarks">
            <el-input v-model="form.remarks" />
          </el-form-item>
          <el-form-item label="排序值" prop="sort">
            <el-input-number
              v-model="form.sort"
              controls-position="right"
              :min="0"
              :max="1000"
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

    <!-- 后台导出 抽屉 -->
    <el-drawer :visible.sync="drawer_ex" :with-header="false">
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
          <el-form-item label="巡检内容">
            <el-input v-model="exForm.itemContent" />
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
.checkList-eam {
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
  .option-item {
    .el-form-item__content {
      .input-con {
        margin-top: 6px;
        & > .el-row:not(:last-child) {
          margin-bottom: 6px;
        }
      }
    }
  }
}
</style>
