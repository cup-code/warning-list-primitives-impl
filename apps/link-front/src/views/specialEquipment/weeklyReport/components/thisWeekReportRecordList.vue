<script>
import WeeklyReportRecordForm from '@/views/specialEquipment/weeklyReport/components/weeklyReportRecordForm.vue'

export default {
  name: 'thisWeekReportRecordList',
  components: {
    WeeklyReportRecordForm,
  },
  data() {
    return {
      thisWeekDateRange: {
        startDate: '',
        endDate: '',
      },
      dataRecords: [],
      viewRecord: {},
      templateRecord: {},
      formDialogTitle: '',
      isFormDialogVisible: false,
      opType: 'look',
    }
  },
  created() {
    this.init()
  },
  methods: {
    /**
     * 初始化
     */
    init() {
      const me = this
      const params = me.$route.params
      if (params.dataRecords) {
        me.dataRecords = params.dataRecords
      }
      if (params.thisWeekDateRange) {
        me.thisWeekDateRange = params.thisWeekDateRange
      }
    },
    /**
     * 返回按钮单击
     */
    backClick() {
      this.$router.go(-1)
    },
    /**
     * 查看按钮单击
     * @param rowData 行数据
     */
    viewClick(rowData) {
      const me = this
      me.viewRecord = rowData
      me.formDialogTitle
        = `查看本周（${
          me.thisWeekDateRange.startDate
        } 至 ${
          me.thisWeekDateRange.endDate
        }）特种设备周报表`
      me.isFormDialogVisible = true
      this.$nextTick(() => {
        me.$refs.weeklyReportRecordForm.init()
      })
    },
    /**
     * 弹窗关闭
     */
    dialogClose() {
      const me = this
      me.isFormDialogVisible = false
      me.$nextTick(() => (me.viewRecord = {}))
    },
  },
}
</script>

<template>
  <div class="contentArea">
    <el-card class="box-card">
      <div
        slot="header"
        class="clearfix"
      >
        <span style="font-size: medium; font-weight: bold">特种设备本周（{{ thisWeekDateRange.startDate }} 至
          {{ thisWeekDateRange.endDate }}）已填报周报清单</span>
        <el-button
          style="float: right; margin-left: 10px"
          @click="backClick"
        >
          返回
        </el-button>
      </div>

      <div class="wrapper">
        <el-table
          ref="weeklyReportRecordTable"
          :data="dataRecords"
          :header-cell-style="{ background: '#f5f5f5' }"
          height="100%"
          row-key="id"
          highlight-current-row
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
            label="人员变动情况"
            align="center"
            prop="personChange"
          />
          <el-table-column
            label="设备变动情况"
            align="center"
            prop="equipmentChange"
          />
          <el-table-column
            label="其他问题"
            align="center"
            prop="otherQuestions"
          />
          <el-table-column
            label="操作"
            align="center"
            width="80"
            fixed="right"
          >
            <template #default="scope">
              <el-button
                type="text"
                @click="viewClick(scope.row)"
              >
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-dialog
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
        :data-record="viewRecord"
        :template-record="templateRecord"
        :op-type="opType"
        :is-load="isFormDialogVisible"
      />

      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogClose">关 闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style scoped></style>
