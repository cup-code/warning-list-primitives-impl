<script>
import {
  getMonitorReport,
  getThirdBookArrList,
  importFileByID,
  removeMonitorReport,
} from '@/http/occupationalHealth/sanitation-api'
import { showFileWindow } from '@/utils/checkFile.js'
import MonitorReportDia from './components/monitorReportDia'

export default {
  name: 'monitoringReport',
  components: { MonitorReportDia },
  data() {
    return {
      isLoading: false,
      total: 0,
      searchData: {
        pageNum: 1,
        pageSize: 10,
        monitorDate: '',
      },
      tableData: [],
      visibleForm: false,
      dialogTitle: '',
      dialogMethod: '',
      thirdBookArrList: [],
      formData: {},
      newArr: [],
    }
  },
  created() {
    getThirdBookArrList()
      .then(({ data }) => {
        if (data.success) {
          this.thirdBookArrList = data.result
          this.getTableData()
        }
        else {
          this.$message.warning(data.message || '查询下拉列表失败')
        }
      })
      .catch((err) => {
        this.$message.error('查询下拉列表出错', err)
      })
  },
  methods: {
    showFileWindow,
    searchFn() {
      this.searchData.pageNum = 1
      this.getTableData()
    },
    // 获取表格数据
    getTableData() {
      this.isLoading = true
      getMonitorReport(this.searchData)
        .then(({ data }) => {
          if (data.success) {
            this.total = data.result.total
            this.tableData = data.result.list || []
            this.tableData.forEach((data) => {
              if (data.monitorBeginDate != undefined) {
                data.monitorDate = `${data.monitorBeginDate}至${data.monitorEndDate}`
              }
              this.$dictUtils.getDictList('Monitor_category').forEach((item) => {
                if (item.id == data.monitorType) {
                  data.monitorTypeName = item.dictName
                }
              })
              this.thirdBookArrList.forEach((item) => {
                if (item.id == data.monitorMechanism) {
                  data.monitorMechanismName = item.name
                }
              })
              importFileByID(data.id).then((res) => {
                if (res.data.success) {
                  this.$set(data, 'fileList', res.data.result)
                }
              })
            })
          }
          else {
            this.$message.warning(data.message || '获取列表数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    // getFileList(entityId){
    //   importFileByID(entityId).then(({data})=>{
    //     console.log(data)
    //   })
    // },
    // 打开表单弹窗(添加、查看、修改)
    changeFn(type, infoData) {
      this.visibleForm = true
      this.dialogMethod = type
      switch (type) {
        case 'add':
          this.dialogTitle = '新增职业危害外部监测报告'
          this.formData = {}
          break
        case 'edit':
          this.dialogTitle = '编辑职业危害外部监测报告'
          this.formData = infoData
          break
        case 'view':
          this.dialogTitle = '查看职业危害外部监测报告'
          this.formData = infoData
          break
      }
    },
    /* 保存表单弹窗关闭成功回调 */
    infoSuccEvt(isRefresh) {
      this.visibleForm = false
      if (isRefresh) {
        this.getTableData()
      }
    },
    // 删除弹窗
    delFn(v) {
      this.$confirm('您确认要删除此职业危害外部监测报告' + ' ?', '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.isLoading = true
        removeMonitorReport(v.id)
          .then(({ data }) => {
            this.isLoading = false
            if (data.success) {
              this.$message.success('删除成功')
              this.getTableData()
            }
            else {
              this.$message.error(data.message || '删除失败')
            }
          })
          .catch((err) => {
            this.isLoading = false
            this.$message.error('删除失败')
          })
      })
    },
    resetSearch() {
      this.searchData.monitorDate = ''
      this.getTableData()
    },
  },
}
</script>

<template>
  <TreeTable
    v-loading="isLoading"
    :isShowLeft="false"
  >
    <!-- 搜索栏 -->
    <ECard
      slot="search"
      noneBottom
      type="search"
    >
      <el-form
        inline
        size="mini"
        label-width="100"
      >
        <el-row>
          <el-form-item
            label="监测时间"
            prop="declareDate"
          >
            <el-date-picker
              v-model="searchData.monitorDate"
              class="small-row"
              type="date"
              value-format="yyyy-MM-dd"
              placeholder="选择日期"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-search"
              @click="searchFn"
            >
              查询
            </el-button>
            <el-button
              class="reset"
              icon="el-icon-refresh-right"
              @click="resetSearch()"
            >
              重置
            </el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </ECard>

    <!-- 表格 -->
    <ECard slot="table">
      <div class="card-cell">
        <el-button
          v-if="hasBtnPermission('monitoring_report_add')"
          type="primary"
          size="mini"
          plain
          icon="el-icon-plus"
          @click="changeFn('add')"
        >
          新增
        </el-button>
      </div>
      <el-table
        :data="tableData"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        align="center"
        height="92%"
        :border="true"
        class="customer-table"
      >
        <el-table-column
          type="index"
          width="50"
          align="center"
          label="序号"
        />0
        <el-table-column
          label="报告名称"
          align="center"
          prop="reportName"
        />
        <el-table-column
          label="监测日期"
          align="center"
          prop="monitorDate"
          min-width="150"
        />
        <el-table-column
          label="监测类别"
          align="center"
          prop="monitorTypeName"
        />
        <el-table-column
          label="监测机构"
          align="center"
          prop="monitorMechanismName"
        />
        <el-table-column
          label="监测报告"
          align="center"
        >
          <template slot-scope="scope">
            <div
              v-for="item in scope.row.fileList"
              :key="item.id"
            >
              <span
                style="color: #11c8e5; cursor: pointer"
                @click="showFileWindow(item.urlPath)"
              >{{ item.originalName }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column
          label="备注"
          align="center"
          prop="remark"
        />
        <el-table-column
          label="操作"
          min-width="160"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              v-if="hasBtnPermission('monitoring_report_view')"
              type="text"
              @click="changeFn('view', scope.row)"
            >
              查看
            </el-button>
            <el-button
              v-if="hasBtnPermission('monitoring_report_edit')"
              style="color: var(--ky-warning)"
              type="text"
              @click="changeFn('edit', scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-if="hasBtnPermission('monitoring_report_delete')"
              type="text"
              style="color: var(--ky-danger)"
              @click="delFn(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </ECard>

    <!-- 分页器 -->
    <ECard
      slot="page"
      type="footer"
    >
      <el-pagination
        :current-page.sync="searchData.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="searchData.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="getTableData"
        @current-change="getTableData"
      />
    </ECard>

    <!-- 表单弹窗 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      :title="dialogTitle"
      :close-on-click-modal="false"

      width="900px"
      :visible.sync="visibleForm"
    >
      <MonitorReportDia
        v-if="visibleForm"
        :Method="dialogMethod"
        :FromData="formData"
        :thirdBookArrList="thirdBookArrList"
        @DialogClose="infoSuccEvt"
      />
    </el-dialog>
  </TreeTable>
</template>

<style scoped>
.auxiliary-button {
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
