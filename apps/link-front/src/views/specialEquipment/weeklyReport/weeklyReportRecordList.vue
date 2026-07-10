<!-- 特种设备周报台账列表页面 -->
<script>
import { getAuthToken } from '@/utils/tab-session'
import moment from 'moment'

import {
  deleteWeeklyReportRecord,
  getAvailableWeeklyReportTemplateList,
  getThisWeekWeeklyReportRecordList,
  getWeeklyReportRecordPaging,
  importWeeklyReportRecord,
} from '@/http/specialEquipment/weeklyReport-api'
import OwnDepartmentTree from '@/views/common-ui/OwnDeparmentTree.vue'
import AvailableWeeklyReportTemplateList from '@/views/specialEquipment/weeklyReport/components/availableWeeklyReportTemplateList.vue'
import ViewWeekReportList from '@/views/specialEquipment/weeklyReport/components/viewWeekReportList'
import WeeklyReportRecordForm from '@/views/specialEquipment/weeklyReport/components/weeklyReportRecordForm.vue'

export default {
  name: 'weeklyReportRecordList',
  components: {
    OwnDepartmentTree,
    WeeklyReportRecordForm,
    AvailableWeeklyReportTemplateList,
    ViewWeekReportList,
  },
  data() {
    return {
      isLoading: false,
      isListDialogVisible: false,
      isFormDialogVisible: false,
      queryForm: {
        pageNum: 1,
        pageSize: 10,
        companyId: '',
        departmentId: '',
        reportTitle: '',
        reportWriterName: '',
      },
      rowData: {},
      tableData: [],
      total: 0,
      listDialogTitle: '可使用的周报模板清单',
      formDialogTitle: '',
      thisWeekDateRange: {
        startDate: '',
        endDate: '',
      },
      opType: '',
      availableTemplateList: [],
      selectedTemplateData: {},
      dataUploadParams: {
        header: {
          Authorization: getAuthToken(),
          clientChannel: 'WEB',
        },
        accept: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
      },
    }
  },
  created() {
    this.searchClick()
  },
  methods: {
    /**
     * 树节点点击
     * @param data
     */
    treeNodeTap(data) {
      if (data.onlyTreeUse)
        return
      const me = this
      if (data) {
        me.queryForm.companyId = data.companyId
        me.queryForm.departmentId = data.id
      }
      else {
        me.queryForm.companyId = ''
        me.queryForm.departmentId = ''
      }
      me.searchClick()
    },
    /**
     * 获取分页表格数据
     */
    getTableData() {
      const me = this
      me.isLoading = true
      getWeeklyReportRecordPaging(me.queryForm)
        .then((r) => {
          const res = r.data
          if (res.success) {
            me.tableData = res.result.list
            me.total = res.result.total
            return
          }
          me.$message.warning(res.message || '获取列表数据失败')
        })
        .catch((e) => {
          me.$message.error(`数据查询异常：${e}`)
        })
        .finally(() => {
          me.isLoading = false
        })
    },
    /**
     * 查询按钮点击
     */
    searchClick() {
      this.queryForm.pageNum = 1
      this.getTableData()
    },
    /**
     * 重置按钮单击
     */
    searchReset() {
      const me = this
      me.$refs.queryForm.resetFields()
      me.$refs.departmentTree.refreshTree()
    },
    /**
     * 编辑按钮单击（含新增、修改、查看）
     * @param rowData 行数据对象
     * @param opType 操作类别
     */
    editClick(rowData, opType) {
      const me = this
      me.opType = opType
      switch (opType) {
        case 'add':
          me.formDialogTitle = '新增特种设备周报表'
          me.getAvailableTemplateData((data) => {
            const that = this
            switch (data.length) {
              case 0:
                that.$message.warning('当前登录账号没有可使用的模板')
                break
              case 1:
                // 如果有模版，需要判断是否已经有人填写
                getThisWeekWeeklyReportRecordList().then((res) => {
                  if (res.data.success) {
                    // 已经填写，进入编辑弹框
                    me.rowData = res.data.result[0]
                  }
                  else {
                    // 没人填写进入填写填空
                    me.rowData = {}
                    me.selectedTemplateData = data[0]
                  }
                  me.isFormDialogVisible = true
                  this.$nextTick(() => {
                    me.$refs.weeklyReportRecordForm.init()
                  })
                })
                break
              default:
                me.isListDialogVisible = true
                break
            }
          })
          return
        case 'edit':
          me.formDialogTitle = '修改特种设备周报表'
          break
        default:
          me.formDialogTitle = '查看特种设备周报表'
          break
      }
      me.rowData = JSON.parse(JSON.stringify(rowData))
      me.isFormDialogVisible = true
      this.$nextTick(() => {
        me.$refs.weeklyReportRecordForm.init()
      })
    },
    /**
     * 可用模板列表弹窗保存按钮单击
     * @param event 事件对象
     * @param data 选中的数据
     */
    dialogListSaveClick(event, data) {
      const me = this
      me.selectedTemplateData = data || me.$refs.availableWeeklyReportTemplateList.selectedRowData
      if (me.selectedTemplateData.id) {
        me.rowData = {}
        me.isListDialogVisible = false
        me.isFormDialogVisible = true
        this.$nextTick(() => {
          me.$refs.weeklyReportRecordForm.init()
        })
        return
      }
      me.$message.warning('请先选择要使用的模板')
    },
    /**
     * 周报填报表单弹窗保存按钮单击
     */
    dialogFormSaveClick() {
      const me = this
      me.$refs.weeklyReportRecordForm.save(() => {
        me.searchClick()
        // me.isFormDialogVisible = false
        this.dialogClose('weeklyReportRecordForm')
      })
    },
    /**
     * 弹窗关闭
     * @param ref 弹窗内组件的ref
     */
    dialogClose(ref) {
      const me = this
      switch (ref) {
        case 'availableWeeklyReportTemplateList':
          me.isListDialogVisible = false
          break
        case 'weeklyReportRecordForm':
          me.isFormDialogVisible = false
          break
        default:
          return
      }
      me.$nextTick(() => {
        me.selectedTemplateData = {}
        this.$refs[ref].resetFields()
      })
    },
    /**
     * 数据导入模板下载按钮单击
     */
    downloadDataImportTemplateClick() {
      // 导出前先判断当前登录用户有没有可用的模板
      getAvailableWeeklyReportTemplateList().then(({ data }) => {
        if (data.success && data.result.length) {
          this.$utils.download(
            '/specialEquipment/weeklyReport/records/templateExport',
            null,
            'post',
          )
        }
        else {
          this.$message.warning('当前登录账号没有可使用的模板')
        }
      })
    },
    /**
     * 数据导入模板上传按钮单击
     */
    uploadDataImportTemplateClick(param) {
      const me = this
      me.isLoading = true
      importWeeklyReportRecord({
        file: param.file,
      })
        .then((r) => {
          const res = r.data
          if (res.success) {
            me.$message.success(res.message || '数据导入成功')
            me.searchClick()
            return
          }
          me.$message.warning(res.message || '数据导入失败')
        })
        .catch((e) => {
          me.$message.error(`数据导入异常：${e}`)
        })
        .finally(() => {
          me.isLoading = false
          me.$refs.fileUpload.clearFiles()
        })
    },
    /**
     * 上传前验证
     */
    onBeforeUpload(file) {
      const me = this
      const isValid = me.dataUploadParams.accept.includes(file.type)
      if (!isValid) {
        this.$message.error('选择的模板文件类型不正确')
      }
      return isValid
    },
    /**
     * 计算本周日期范围
     */
    calcThisWeekDateRange() {
      let nowDate, dayOfWeek, startDate, endDate
      nowDate = moment()
      dayOfWeek = nowDate.isoWeekday()
      this.thisWeekDateRange.startDate = moment(nowDate)
        .subtract(dayOfWeek - 1, 'd')
        .format('YYYY-MM-DD')
      this.thisWeekDateRange.endDate = moment(nowDate)
        .add(7 - dayOfWeek, 'd')
        .format('YYYY-MM-DD')
    },
    /**
     * 查看本周周报情况按钮单击
     */
    viewThisWeekClick() {
      this.$refs.viewWeekReportList.init()
    },
    /**
     * 删除按钮单击
     * @param id 主键
     */
    deleteClick(id) {
      const me = this
      me.$confirm(`您确定要删除本条数据？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          me.isLoading = true
          deleteWeeklyReportRecord(id)
            .then((r) => {
              const res = r.data
              if (res.success) {
                me.$message.success(res.message)
                me.getTableData()
                return
              }
              me.$message.warning(res.message)
            })
            .catch((e) => {
              me.$message.error(`数据删除异常：${e}`)
            })
            .finally(() => {
              me.isLoading = false
            })
        })
        .catch(e => me.$message.info('已取消'))
    },
    /**
     * 查询可用的周报模板数据
     * @param successCallback 查询成功后回调函数
     */
    getAvailableTemplateData(successCallback) {
      const me = this
      me.isLoading = true
      getAvailableWeeklyReportTemplateList()
        .then((r) => {
          const res = r.data
          if (res.success) {
            me.availableTemplateList = res.result
            if (typeof successCallback === 'function') {
              successCallback.call(me, me.availableTemplateList)
            }
            return
          }
          me.$message.warning('当前登录账号没有可使用的模板')
        })
        .catch((e) => {
          me.$message.error(`数据查询异常：${e}`)
        })
        .finally(() => {
          me.isLoading = false
        })
    },
  },
}
</script>

<template>
  <TreeTable class="specialEquipmentContainer">
    <OwnDepartmentTree
      slot="tree"
      ref="departmentTree"
      title="责任部门"
      @treeNodeTap="treeNodeTap"
    />
    <!-- 搜索栏 -->
    <el-form
      slot="search"
      ref="queryForm"
      label-width="70px"
      :inline="true"
      :model="queryForm"
    >
      <el-form-item
        prop="reportTitle"
        label="周报标题"
      >
        <el-input
          v-model="queryForm.reportTitle"
          placeholder="周报标题"
          clearable
        />
      </el-form-item>

      <el-form-item
        prop="reportWriterName"
        label="填报人"
      >
        <el-input
          v-model="queryForm.reportWriterName"
          placeholder="填报人"
          clearable
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          :loading="isLoading"
          @click="searchClick"
        >
          查询
        </el-button>
        <el-button
          class="reset"
          icon="el-icon-refresh-right"
          @click="searchReset"
        >
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <div slot="auxiliary">
      <el-button
        v-if="hasBtnPermission('weekly_report_record_add')"
        icon="el-icon-plus"
        type="primary"
        plain
        @click="editClick(null, 'add')"
      >
        新增
      </el-button>

      <el-dropdown
        v-if="hasBtnPermission('weekly_report_record_import')"
        style="margin: 0 10px"
      >
        <el-button
          type="primary"
          icon="el-icon-upload2"
          plain
        >
          数据导入
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <el-button
              type="success"
              icon="el-icon-download"
              plain
              @click="downloadDataImportTemplateClick"
            >
              下载数据模板
            </el-button>
          </el-dropdown-item>

          <el-dropdown-item>
            <el-upload
              ref="fileUpload"
              action="#"
              name="file"
              :headers="dataUploadParams.header"
              :limit="1"
              :accept="dataUploadParams.accept.toString()"
              :http-request="uploadDataImportTemplateClick"
              :before-upload="onBeforeUpload"
              :show-file-list="false"
              :auto-upload="true"
            >
              <el-button
                type="success"
                icon="el-icon-upload2"
                plain
              >
                导入模板数据
              </el-button>
            </el-upload>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <el-button
        v-if="hasBtnPermission('weekly_report_record_view')"
        icon="el-icon-search"
        type="primary"
        plain
        @click="viewThisWeekClick"
      >
        查看本周填报情况
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table
      slot="table"
      ref="weeklyReportRecordTable"
      :data="tableData"
      :header-cell-style="{ background: '#f5f5f5' }"
      height="100%"
      row-key="id"
      highlight-current-row
      :border="true"
      class="customer-table"
    >
      <el-table-column
        align="center"
        label="序号"
        min-width="50"
        type="index"
      />
      <el-table-column
        label="所属部门"
        align="center"
        prop="departmentName"
      />
      <el-table-column
        label="标题"
        align="center"
        prop="reportTitle"
      />
      <el-table-column
        label="填报人"
        align="center"
        prop="reportWriterName"
      />
      <el-table-column
        label="填报时间"
        align="center"
        prop="createdTime"
      />
      <el-table-column
        label="有无新增特种、计量设备"
        align="center"
        prop="isEquipmentAdd"
        min-width="100"
      />
      <el-table-column
        label="本周有无重要设备检维修"
        align="center"
        prop="isEquipmentMaintenance"
        min-width="100"
      />
      <el-table-column
        label="设备有无故障状态、带病运行"
        align="center"
        prop="isEquipmentProblem"
        min-width="140"
      />
      <el-table-column
        label="下周有无检维修计划"
        align="center"
        prop="isNextWeekMaintenance"
        min-width="100"
      />
      <el-table-column
        label="其他问题"
        align="center"
        prop="otherQuestions"
      />
      <el-table-column
        label="操作"
        align="center"
        width="180"
        fixed="right"
      >
        <template #default="scope">
          <el-button
            v-if="hasBtnPermission('weekly_report_record_view')"
            type="text"
            @click="editClick(scope.row, 'look')"
          >
            查看
          </el-button>
          <el-button
            v-if="hasBtnPermission('weekly_report_record_modify')"
            type="text"
            style="color: var(--ky-warning)"
            @click="editClick(scope.row, 'edit')"
          >
            编辑
          </el-button>
          <el-button
            v-if="hasBtnPermission('weekly_report_record_delete')"
            type="text"
            style="color: var(--ky-danger)"
            @click="deleteClick(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      slot="page"
      :current-page.sync="queryForm.pageNum"
      :page-sizes="[10, 20, 50]"
      background
      :page-size.sync="queryForm.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getTableData"
      @current-change="getTableData"
    />

    <el-dialog
      slot="dialog"
      :title="formDialogTitle"
      class="normal-dialog"
      :visible.sync="isFormDialogVisible"
      width="90%"
      append-to-body
      :close-on-click-modal="false"
      top="5vh"
    >
      <WeeklyReportRecordForm
        ref="weeklyReportRecordForm"
        :data-record="rowData"
        :template-record="selectedTemplateData"
        :op-type="opType"
        :is-load="isFormDialogVisible"
      />

      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          style="margin: 0 10px 0 0"
          @click="dialogClose('weeklyReportRecordForm')"
        >关 闭</el-button>
        <el-button
          v-if="opType !== 'look'"
          type="primary"
          @click="dialogFormSaveClick"
        >保 存</el-button>
      </span>
    </el-dialog>

    <el-dialog
      slot="dialog"
      :title="listDialogTitle"
      class="normal-dialog"
      :visible.sync="isListDialogVisible"
      width="90%"
      append-to-body
      :close-on-click-modal="false"
      top="5vh"
    >
      <AvailableWeeklyReportTemplateList
        ref="availableWeeklyReportTemplateList"
        :data-records="availableTemplateList"
        @saveClick="dialogListSaveClick"
      />

      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogClose('availableWeeklyReportTemplateList')">关 闭</el-button>
        <el-button
          type="primary"
          @click="dialogListSaveClick"
        >确定选择</el-button>
      </span>
    </el-dialog>
    <view-week-report-list
      slot="dialog"
      ref="viewWeekReportList"
    />
  </TreeTable>
</template>
