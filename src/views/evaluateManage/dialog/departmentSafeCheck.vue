/* * @Author: xiaorui 部门负责人隐患排查详情弹框 * @Date: 2023-11-01 15:07:40 * @Last Modified by:
xiaorui * @Last Modified time: 2023-11-09 16:13:39 */
<script>
import { getDepartDangerCheckRecordByPage } from '@/http/defense/shandong/hidden-api'
import { getSafeCheckTaskByPage } from '@/http/defense/shandong/safeCheck-api'
import {
  CtrlCycleArr,
  HiddenCheckType,
  SafeTaskStatus,
} from '@/views/doubleDefense/shandong/config/constant'
import SafeTaskInfo from '@/views/doubleDefense/shandong/safeCheck/components/SafeTaskInfo'

export default {
  components: {
    SafeTaskInfo,
  },
  data() {
    return {
      visible: false,
      isLoading: false,
      tableData: [],
      total: 0,
      activeName: 'first',
      sForm: {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
      },
      showInfoDialog: false, // 安全检查任务详情弹框
      propData: {}, // 传递给弹窗的数据
    }
  },
  computed: {
    /* 翻译管控周期 */
    setCycleDes() {
      return function (controlCycle, controlCycleUnit, controlFrequency) {
        let des = '-'
        const cycleType = Number.parseInt(controlCycleUnit)
        let cycleTypeDes = ''
        for (const item of CtrlCycleArr) {
          if (item.value == cycleType) {
            cycleTypeDes = item.label
            break
          }
        }
        des = `${controlCycle + cycleTypeDes + controlFrequency}次`
        return des
      }
    },
    /* 翻译排查类型 */
    setCheckType() {
      return function (type) {
        let des = '-'
        const typeInt = Number.parseInt(type)
        for (const item of HiddenCheckType) {
          if (item.value == typeInt) {
            des = item.label
            break
          }
        }
        return des
      }
    },
    /* 翻译安全检查周期类型 */
    setDateType() {
      return function (type) {
        let des = '--'
        switch (Number.parseInt(type)) {
          case 1:
            des = '临时'
            break
          case 2:
            des = '周期'
            break
          default:
        }
        return des
      }
    },
    /* 翻译安全检查状态 */
    setStatus() {
      return function (status) {
        const statusInt = Number.parseInt(status)
        let des = '--'
        for (const item of SafeTaskStatus) {
          if (statusInt == item.value) {
            des = item.label
            break
          }
        }
        return des
      }
    },
  },
  methods: {
    init(row) {
      this.visible = true
      this.sForm.pageNum = 1
      this.sForm.departmentId = row.departmentId
      this.sForm.completedStartDate = this.moment(row.evaluationStart).format('YYYY-MM-DD')
      this.sForm.completedEndDate = this.moment(row.evaluationEnd).format('YYYY-MM-DD')
      this.activeName = 'first'
      this.getDataList()
    },
    getDataList() {
      this.isLoading = true
      let func
      if (this.activeName === 'first') {
        func = getDepartDangerCheckRecordByPage
        delete this.sForm.checkTaskStatus
        delete this.sForm.checkPlanCategory
        this.sForm.important = 2 // 查询重要分析单元类型的
      }
      else {
        func = getSafeCheckTaskByPage
        delete this.sForm.important
        this.sForm.checkTaskStatus = 1 // 查询状态为已完成的
        this.sForm.checkPlanCategory = 2 // 查询检查专业为'联锁'的
      }
      func(this.sForm)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result.list || []
            this.total = data.result.total || 0
          }
          else {
            this.$message.warning(data.message || '获取表格数据失败')
          }
        })
        .catch(() => {
          this.$message.error('获取表格数据出错')
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    handleClick() {
      this.sForm.pageNum = 1
      this.getDataList()
      this.$nextTick(() => {
        this.activeName === 'first'
          ? this.$refs.recordTable.doLayout()
          : this.$refs.taskTable.doLayout()
      })
    },
    /* 点击查看安全检查详情 */
    checkInfoClick(taskInfo) {
      this.propData = {
        taskInfo,
      }
      this.showInfoDialog = true
    },
  },
}
</script>

<template>
  <el-dialog
    class="large-dialog"
    :close-on-click-modal="false"
    :visible.sync="visible"

    title="隐患排查详情"
    append-to-body
  >
    <el-tabs
      v-model="activeName"
      class="site-tabs"
      @tab-click="handleClick"
    >
      <el-tab-pane
        label="管控措施巡查记录"
        name="first"
      />
      <el-tab-pane
        label="安全检查任务"
        name="second"
      />
    </el-tabs>
    <el-table
      v-if="activeName === 'first'"
      ref="recordTable"
      v-loading="isLoading"
      height="75%"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
    >
      <el-table-column
        label="序号"
        align="center"
        type="index"
        width="50"
      />
      <el-table-column
        label="责任组织"
        prop="responsibilityDeptName"
        align="center"
      />
      <el-table-column
        label="所属分析单元"
        align="center"
        min-width="150"
        prop="unitName"
      />
      <el-table-column
        label="单元类型"
        prop="unitType"
        align="center"
      >
        <template slot-scope="scope">
           {{ $dictUtils.getDictLabelById('analysis_type', scope.row.unitType) }}
        </template>
      </el-table-column>
      <el-table-column
        label="管控措施"
        align="center"
      >
        <template slot-scope="scope">
          <RichText :des="scope.row.controlMeasuresDesc" />
        </template>
      </el-table-column>
      <el-table-column
        label="隐患排查内容"
        align="center"
        min-width="150"
      >
        <template slot-scope="scope">
          <RichText :des="scope.row.checkContent" />
        </template>
      </el-table-column>
      <el-table-column
        label="排查类型"
        align="center"
        min-width="100"
      >
        <template slot-scope="scope">
          <span>{{ setCheckType(scope.row.checkType) }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="周期"
        align="center"
      >
        <template slot-scope="scope">
          <span>
            {{
              setCycleDes(
                scope.row.controlCycle,
                scope.row.controlCycleUnit,
                scope.row.controlFrequency,
              )
            }}
          </span>
        </template>
      </el-table-column>
      <el-table-column
        label="排查人"
        prop="checkUserFullName"
        align="center"
      />
      <el-table-column
        label="排查时间"
        align="center"
        min-width="130"
      >
        <template slot-scope="scope">
          {{ scope.row.checkTime ? scope.row.checkTime : '-' }}
        </template>
      </el-table-column>
      <el-table-column
        label="排查结果"
        align="center"
        width="100"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.troubleResult == '0'"
            type="success"
          >
            正常
          </el-tag>
          <el-tag
            v-else-if="scope.row.troubleResult == '1'"
            type="danger"
            style="cursor: pointer"
          >
            存在隐患
          </el-tag>
          <el-tag
            v-else
            type="warning"
          >
            未排查
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
    <el-table
      v-if="activeName === 'second'"
      ref="taskTable"
      v-loading="isLoading"
      height="75%"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
    >
      <el-table-column
        label="序号"
        align="center"
        type="index"
        width="50"
      />
      <el-table-column
        label="责任组织"
        align="center"
        prop="departmentName"
        min-width="200"
      />
      <el-table-column
        label="任务名称"
        align="center"
        prop="checkTaskName"
        min-width="200"
      />
      <el-table-column
        label="检查类型"
        align="center"
        min-width="150"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabelById('safeCheck_type', scope.row.checkPlanType, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="检查人员"
        align="center"
        prop="checkUserFullName"
      />
      <el-table-column
        label="开始时间"
        align="center"
        prop="taskStartDateTime"
        min-width="130"
      />
      <el-table-column
        label="结束时间"
        align="center"
        prop="taskEndDateTime"
        min-width="130"
      />
      <el-table-column
        label="周期类型"
        align="center"
        min-width="70"
      >
        <template slot-scope="scope">
          {{ setDateType(scope.row.frequencyType) }}
        </template>
      </el-table-column>
      <el-table-column
        label="状态"
        align="center"
        min-width="70"
      >
        <template slot-scope="scope">
          <el-tag
            :type="
              scope.row.checkTaskStatus === -1
                ? 'warning'
                : scope.row.checkTaskStatus === 0
                  ? 'primary'
                  : scope.row.checkTaskStatus === 1
                    ? 'success'
                    : 'warning'
            "
          >
            {{ setStatus(scope.row.checkTaskStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="操作"
        align="center"
        width="160"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="checkInfoClick(scope.row, false)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      :disabled="isLoading"
      style="text-align: right"
      :current-page.sync="sForm.pageNum"
      :page-size.sync="sForm.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, prev, pager, next, jumper, sizes"
      :total="total"
      @current-change="getDataList"
      @size-change="getDataList"
    />
    <el-dialog
      title="安全检查任务详情"
      class="large-dialog"
      :visible.sync="showInfoDialog"
      :close-on-click-modal="false"
      append-to-body
    >
      <SafeTaskInfo
        v-if="showInfoDialog"
        v-bind="propData"
        @close="showInfoDialog = false"
      />
    </el-dialog>
  </el-dialog>
</template>
