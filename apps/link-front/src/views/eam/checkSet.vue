<script>
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import {
  addMaintenancePlan,
  deleteMaintenancePlan,
  editMaintenancePlan,
  exportMainPlan,
  getAllAsset,
  getExecuteUsers,
  getMaintenancePlanList,
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
      state: '',
    },
    total: 0,
    drawer: false,
    drawerType: 0,
    drawerTitle: '',
    form: {},
    rules: {},
    submitLoading: false,
    sDate: [],
    assetList: [],
    userList: [],

    drawer_ex: false, // 后台导出
    exForm: {}, // 后台导出 筛选表单
    stateList: [
      {
        label: '等待下期任务',
        value: 'WAITING_NEXT',
      },
      {
        label: '本期任务未执行',
        value: 'CURRENT_UNEXECUTED',
      },
      {
        label: '本期任务执行中',
        value: 'CURRENT_EXECUTING',
      },
      {
        label: '所有周期执行完成',
        value: 'ALL_END',
      },
    ],
  }),
  created() {
    this.getDataList()
    this.getAllAssetList()
    this.getAllUsers()
  },
  methods: {
    formatDate,
    getDataList() {
      this.loading = true
      getMaintenancePlanList(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message

          if (resD.success === true) {
            this.tableData = resD.result.list || []
            this.fixDataFn(resD.result.list || [])
            this.total = resD.result.total
          }
          else {
            this.$message.error(msg || '查询巡检失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询巡检失败')
        })
    },
    // 查询所有资产列表
    getAllAssetList() {
      getAllAsset().then((res) => {
        const resD = res.data
        if (resD.success === true) {
          this.assetList = resD.result || []
        }
      })
    },
    // 查询所有执行人
    getAllUsers() {
      // 参数为 角色code: ROLE_INSPECTION(巡检角色)、 ROLE_MAINTENANCE(保养角色)
      getExecuteUsers('ROLE_INSPECTION').then((res) => {
        const resD = res.data
        if (resD.success === true) {
          this.userList = resD.result || []
        }
      })
    },
    // 处理数据
    fixDataFn(dt) {
      dt.forEach((item) => {
        item.startDate = new Date(item.startDate).getTime()
        item.endDate = new Date(item.endDate).getTime()
        item.firstDate = new Date(item.firstDate).getTime()
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
    // 新增 巡检
    addFn() {
      // 清空起始时间
      this.sDate = []

      this.form = {}
      this.drawerTitle = '新增巡检'
      this.drawerType = 0
      this.drawer = true
    },
    // 编辑 巡检
    editFn(v) {
      // 组装 起始时间
      this.sDate = []
      if (v.startDate) {
        this.sDate[0] = v.startDate
      }
      if (v.endDate) {
        this.sDate[1] = v.endDate
      }

      this.form = JSON.parse(JSON.stringify(v))
      this.drawerTitle = '编辑巡检'
      this.drawerType = 1
      this.drawer = true
    },
    // 删除 巡检
    delFn(v) {
      this.$confirm(`您确认要删除 ${v.name}`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.loading = true
          deleteMaintenancePlan(v.id)
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

        // 添加
        if (this.drawerType === 0) {
          addMaintenancePlan(this.form)
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
            assetsIdList,
            cycle,
            cycleUnit,
            endDate,
            executor,
            firstDate,
            maintenanceType,
            name,
            remarks,
            startDate,
            id,
          } = this.form
          const params = {
            assetsIdList,
            cycle,
            cycleUnit,
            endDate,
            executor,
            firstDate,
            maintenanceType,
            name,
            remarks,
            startDate,
            id,
          }

          editMaintenancePlan(params)
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
    // 日期选择器
    dateChange(v) {
      const form = this.form
      if (v) {
        form.startDate = v[0]
        form.endDate = v[1]
      }
      else {
        delete form.startDate
        delete form.endDate
      }
    },

    // 配置项目按钮
    toDetail(v) {
      this.$router.push({
        name: 'checkProjectDetail',
        query: {
          planInfo: encodeURIComponent(JSON.stringify(v)),
        },
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
      const fileName = '巡检计划'

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
      exportMainPlan(this.exForm).then((res) => {
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
    searchFn() {
      this.sForm.page = 1
      this.getDataList()
    },
  },
}
</script>

<template>
  <div class="checkSet-eam">
    <!-- 按钮 -->
    <el-row>
      <el-col :span="8">
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
      <el-col
        :span="16"
        style="text-align: right"
      >
        <el-form
          ref="sForm"
          class="sForm"
          :model="sForm"
          label-width="80px"
          size="mini"
          inline
        >
          <el-form-item label="计划状态">
            <el-select
              v-model="sForm.state"
              placeholder="请选择状态"
              clearable
            >
              <el-option
                v-for="item in stateList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item style="margin-right: 0">
            <el-button
              icon="el-icon-search"
              size="mini"
              type="primary"
              @click="searchFn"
            >
              查询
            </el-button>
          </el-form-item>
        </el-form>
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
          <!-- <el-table-column label="资产" prop="assetNames" align='center' width="150">
                        <template slot-scope="props">
                            <div>{{props.row.assetNames}}</div>
                        </template>
                    </el-table-column> -->
          <el-table-column
            label="计划名称"
            prop="name"
            align="center"
          />
          <el-table-column
            label="周期"
            prop="cycle"
            align="center"
            width="50"
          />
          <el-table-column
            label="单位"
            prop="cycleUnit"
            align="center"
            width="50"
          >
            <template slot-scope="props">
              <el-tag
                v-if="props.row.cycleUnit === 'HOUR'"
                size="mini"
                type="primary"
              >
                时
              </el-tag>
              <el-tag
                v-if="props.row.cycleUnit === 'DAY'"
                size="mini"
                type="warning"
              >
                天
              </el-tag>
              <el-tag
                v-if="props.row.cycleUnit === 'MONTH'"
                size="mini"
                type="success"
              >
                月
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="开始日期"
            prop="startDate"
            align="center"
          >
            <template slot-scope="props">
              {{ formatDate(props.row.startDate) }}
            </template>
          </el-table-column>
          <el-table-column
            label="结束日期"
            prop="endDate"
            align="center"
          >
            <template slot-scope="props">
              {{ formatDate(props.row.endDate) }}
            </template>
          </el-table-column>
          <el-table-column
            label="首次巡检"
            prop="firstDate"
            align="center"
          >
            <template slot-scope="props">
              {{ formatDate(props.row.firstDate) }}
            </template>
          </el-table-column>
          <el-table-column
            label="状态"
            prop="state"
            align="center"
          >
            <template slot-scope="props">
              <el-tag
                v-if="props.row.state === 'WAITING_NEXT'"
                size="mini"
                type="warning"
              >
                等待下期任务
              </el-tag>
              <el-tag
                v-if="props.row.state === 'CURRENT_UNEXECUTED'"
                size="mini"
                type="danger"
              >
                本期任务未执行
              </el-tag>
              <el-tag
                v-if="props.row.state === 'CURRENT_EXECUTING'"
                size="mini"
                type="primary"
              >
                本期任务执行中
              </el-tag>
              <el-tag
                v-if="props.row.state === 'ALL_END'"
                size="mini"
                type="success"
              >
                所有周期执行完成
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="200"
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
                @click="toDetail(scope.row)"
              >
                配置项目
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
            label="巡检名称"
            prop="name"
          >
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item
            label="资产"
            prop="assetsIdList"
          >
            <el-select
              v-model="form.assetsIdList"
              multiple
              filterable
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in assetList"
                :key="item.id"
                :label="`${item.name} - ${item.code}`"
                :value="item.id"
              >
                <!-- <span>{{ item.name }}</span> -->
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="执行人">
            <el-select
              v-model="form.executor"
              placeholder="请选择执行人"
              style="width: 100%"
            >
              <el-option
                v-for="item in userList"
                :key="item.id"
                :label="item.username"
                :value="item.id"
              >
                <span>{{ item.username }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            label="周期"
            prop="cycle"
          >
            <el-input-number
              v-model="form.cycle"
              controls-position="right"
              :min="0"
              :max="1000"
            />
          </el-form-item>
          <el-form-item
            label="周期单位"
            prop="cycleUnit"
          >
            <el-radio-group v-model="form.cycleUnit">
              <el-radio label="HOUR">
                时
              </el-radio>
              <el-radio label="DAY">
                天
              </el-radio>
              <el-radio label="MONTH">
                月
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="sDate"
              style="width: 100%"
              size="mini"
              value-format="timestamp"
              type="datetimerange"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              @change="dateChange"
            />
          </el-form-item>
          <el-form-item label="首次巡检">
            <el-date-picker
              v-model="form.firstDate"
              style="width: 100%"
              size="mini"
              value-format="timestamp"
              type="datetime"
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
          <el-form-item label="计划名称">
            <el-input v-model="exForm.name" />
          </el-form-item>
          <el-form-item label="资产">
            <el-select
              v-model="exForm.assetsId"
              placeholder="请选择"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="item in assetList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span>{{ item.name }}</span>
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
.checkSet-eam {
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
  .el-radio-group {
    .el-radio {
      margin-right: 16px;
      .el-radio__label {
        padding-left: 6px;
      }
    }
  }
}
</style>
