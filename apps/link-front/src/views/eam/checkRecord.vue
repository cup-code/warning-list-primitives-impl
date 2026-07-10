<script>
import FileSaver from 'file-saver'
import XLSX from 'xlsx'
import {
  exportPlanExecuteRecord,
  getExecuteUsers,
  getPlanExecuteRecord,
  getPlanItemExecuteRecord,
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
      maintenanceType: 'INSPECTION', // MAINTENANCE(保养)、 INSPECTION(巡检)
    },
    total: 0,
    userList: [],

    drawer_detail: false, // 记录详情抽屉
    table_detail: [], // 记录详情数据
    loading_detail: false,

    drawer_ex: false, // 后台导出
    exForm: {}, // 后台导出 筛选表单
  }),
  created() {
    this.getDataList()
    this.getAllUsers()
  },
  methods: {
    formatDate,
    getDataList() {
      this.loading = true
      getPlanExecuteRecord(this.sForm)
        .then((res) => {
          this.loading = false
          const resD = res.data
          const msg = resD.message

          if (resD.success === true) {
            resD.result.list.forEach((item) => {
              item.isSubmit = item.isSubmit ? '已提交' : '未提交'
            })
            this.tableData = resD.result.list || []
            this.total = resD.result.total
          }
          else {
            this.$message.error(msg || '查询记录失败')
          }
        })
        .catch((err) => {
          this.loading = false
          this.$message.error('查询记录失败')
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
    // 查询指定记录的 详情
    getRecordDetail(id) {
      this.table_detail = [] // 先清空

      // 请求接口
      this.loading_detail = true
      getPlanItemExecuteRecord(id)
        .then((res) => {
          this.loading_detail = false
          const resD = res.data
          const msg = resD.message

          if (resD.success === true) {
            this.table_detail = resD.result || []
          }
          else {
            this.$message.error(msg || '查询记录详情失败')
          }
        })
        .catch((err) => {
          this.loading_detail = false
          this.$message.error('查询记录详情失败')
        })
    },
    searchFn() {
      // if(!this.sForm.userId) {
      //     this.$message.error('请先选择执行人！');
      //     return;
      // }
      // 请求接口
      this.getDataList()
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
    // 查看 记录
    seeFn(v) {
      this.drawer_detail = true
      // 查询记录详情
      this.getRecordDetail(v.id)
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
      const fileName = '巡检记录'

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
      exportPlanExecuteRecord(this.exForm).then((res) => {
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
  <div class="checkRecord-eam">
    <!-- 按钮 -->
    <el-row>
      <el-col :span="4">
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
        :span="20"
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
          <el-form-item label="计划执行人">
            <el-select
              v-model="sForm.userId"
              placeholder="请选择执行人"
              clearable
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
          <el-form-item label="计划名称">
            <el-input v-model="sForm.name" />
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
          <el-table-column
            label="计划名称"
            prop="name"
            align="center"
          />
          <el-table-column
            label="执行状态"
            prop="isSubmit"
            align="center"
          />
          <el-table-column
            label="执行人"
            prop="executorName"
            align="center"
          />
          <el-table-column
            label="执行日期"
            prop="executDate"
            align="center"
            width="150"
          >
            <template slot-scope="props">
              {{ formatDate(props.row.executDate) }}
            </template>
          </el-table-column>
          <el-table-column
            label="备注"
            prop="remarks"
            align="center"
          />
          <el-table-column
            label="操作"
            width="100"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="seeFn(scope.row)"
              >
                查看
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

    <!-- 查看记录详情 抽屉 -->
    <el-drawer
      :visible.sync="drawer_detail"
      :with-header="false"
      size="45%"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        巡检记录详情
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-table
          v-loading="loading_detail"
          :data="table_detail"
          border
          size="mini"
          style="width: 100%"
          :header-cell-style="{ background: '#f5f5f5' }"
        >
          <el-table-column
            label="资产"
            prop="assetsName"
            align="center"
          />
          <el-table-column
            label="内容"
            prop="itemContent"
            align="center"
          />
          <el-table-column
            label="结果"
            prop="operationResult"
            align="center"
          />
          <el-table-column
            label="执行日期"
            prop="operationResult"
            align="center"
          >
            <template slot-scope="props">
              {{ formatDate(props.row.executDate) }}
            </template>
          </el-table-column>
        </el-table>
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
          <el-form-item label="执行用户">
            <el-select
              v-model="exForm.userId"
              placeholder="请选择"
              clearable
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
.checkRecord-eam {
  position: relative;
  padding: 10px;
  .sForm {
    .el-form-item {
      margin-bottom: 0;
    }
  }

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
