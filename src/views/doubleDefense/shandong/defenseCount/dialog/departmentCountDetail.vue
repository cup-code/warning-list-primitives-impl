/* * @Author: xiaorui 部门运行情况，点击比例查看详情的弹框 * @Date: 2024-01-11 11:30:11 * @Last
Modified by: xiaorui * @Last Modified time: 2024-01-11 17:08:09 */
<script>
import { hiddenDangerCheckRecordByPage } from '@/http/defense/shandong/hidden-api'
import { getAnalyseUnitAll } from '@/http/defense/shandong/riskControl-api'
import {
  getFastReportListByPage,
  getSafeCheckAccountByPage,
  getSafeCheckTaskByPage,
} from '@/http/defense/shandong/safeCheck-api'
import {
  CtrlCycleArr,
  HiddenCheckType,
  SafeTaskStatus,
  TroubleResult,
} from '@/views/doubleDefense/shandong/config/constant'

export default {
  data() {
    return {
      visible: false,
      isLoading: false,
      tableData: [],
      total: 0,
      sForm: {
        pageNum: 1,
        pageSize: 10,
      },
      title: '',
      type: 1, // 判断是查看哪种类型的列表。1为隐患整改率， 2为风险巡查执行率，3为安全检查完成率，4为随手拍整改率
    }
  },
  computed: {
    /* 设置所属分析单元文字 */
    setUnitDes() {
      return function (unitId) {
        let des = ''
        for (const item of this.unitList) {
          if (item.id == unitId) {
            des = item.name
            break
          }
        }
        return des
      }
    },
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
    /* 翻译排查结果 */
    setResult() {
      return function (result) {
        const resInt = Number.parseInt(result)
        let des = '-'
        for (const item of TroubleResult) {
          if (item.value == resInt) {
            des = item.label
            break
          }
        }
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
  async created() {
    const unitRes = await getAnalyseUnitAll()
    this.unitList = unitRes.data.result
  },
  methods: {
    init(departId, startDate, endDate, type) {
      this.type = type
      this.visible = true
      this.func = null
      switch (type) {
        case 1:
          this.sForm = {
            pageNum: 1,
            pageSize: 10,
            deptId: departId,
            troubleFindTimeStart: startDate,
            troubleFindTimeEnd: endDate,
          }
          this.title = '隐患情况详情'
          this.func = getSafeCheckAccountByPage
          break
        case 2:
          this.sForm = {
            pageNum: 1,
            pageSize: 10,
            departmentId: departId,
            startDate,
            endDate,
          }
          this.title = '风险巡查情况详情'
          this.func = hiddenDangerCheckRecordByPage
          break
        case 3:
          this.sForm = {
            pageNum: 1,
            pageSize: 10,
            departmentId: departId,
            startDate,
            endDate,
          }
          this.title = '安全检查情况详情'
          this.func = getSafeCheckTaskByPage
          break
        case 4:
          this.sForm = {
            pageNum: 1,
            pageSize: 10,
            deptId: departId,
            troubleFindTimeStart: startDate,
            troubleFindTimeEnd: endDate,
            businessType: '1',
            troubleSource: 3,
            troubleState: [0, 1, 2, 3, 4, 5, 6],
          }
          this.title = '安全类随手拍情况详情'
          this.func = getFastReportListByPage
          break
      }
      this.getDataList()
    },
    getDataList() {
      this.isLoading = true
      this.func(this.sForm)
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
  },
}
</script>

<template>
  <el-dialog
    class="large-dialog"
    :close-on-click-modal="false"
    :visible.sync="visible"

    :title="title"
    append-to-body
  >
    <el-table
      v-if="type === 1"
      v-loading="isLoading"
      height="80%"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
      :border="true"
      class="customer-table"
    >
      <el-table-column
        label="序号"
        align="center"
        type="index"
        width="50"
      />
      <el-table-column
        label="公司"
        align="center"
        prop="troubleCompanyName"
      />
      <el-table-column
        label="所属部门"
        align="center"
        prop="troubleDeptName"
      />
      <el-table-column
        label="检查级别"
        align="center"
        prop="controlHierarchy"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabel('control_level', scope.row.controlHierarchy, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="检查项目"
        align="center"
        prop="checkItem"
      />
      <el-table-column
        label="检查人"
        align="center"
        prop="checkUserFullName"
      />
      <el-table-column
        label="所属编号"
        align="center"
        prop="businessCode"
      />
      <el-table-column
        label="业务类型"
        align="center"
        prop="businessType"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabel('trouble_business_type', scope.row.businessType, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="隐患类型"
        align="center"
        prop="troubleType"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabelById('troubleType_yhlx', scope.row.troubleType, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="上报时间"
        align="center"
        prop="troubleFindTime"
        min-width="130"
      />
      <el-table-column
        label="整改进度"
        align="center"
      >
        <template slot-scope="props">
          <el-tag
            v-if="props.row.troubleState === -1"
            type="success"
          >
            审核非隐患
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 0"
            type="warning"
          >
            待审核
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 1"
            type="warning"
          >
            待派发
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 2"
            type="warning"
          >
            待整改
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 3"
            type="warning"
          >
            待验收
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 4"
            type="warning"
          >
            待复查
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 5"
            type="success"
          >
            已复查
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 6"
            type="danger"
          >
            逾期未整改
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="隐患部位"
        align="center"
        prop="troublePartName"
      />
      <el-table-column
        label="隐患位置"
        align="center"
        prop="troubleLocation"
      />
      <el-table-column
        label="隐患现状描述"
        align="center"
        prop="troubleDesc"
        min-width="130"
      />
      <el-table-column
        label="整改措施"
        align="center"
        prop="rectificationOpinions"
      />
      <el-table-column
        label="是否重复"
        align="center"
      >
        <template slot-scope="props">
          <el-tag
            v-if="props.row.isRepeat"
            type="danger"
          >
            是
          </el-tag>
          <el-tag
            v-if="!props.row.isRepeat"
            type="success"
          >
            否
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="隐患等级"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabel('hiddenDangerLevel', scope.row.troubleLevel, '')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="整改期限"
        align="center"
        prop="rectificationTerm"
        min-width="130"
      />
      <el-table-column
        label="来源"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabel('sourceOfHiddenDanger', scope.row.troubleSource, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="整改时间"
        align="center"
        prop="rectificationTime"
        min-width="130"
      />
      <el-table-column
        label="整改情况描述"
        align="center"
        prop="rectificationSituation"
        min-width="130"
      />
      <el-table-column
        label="责任人"
        align="center"
        prop="rectificationUserFullName"
        min-width="130"
      />
      <el-table-column
        label="整改费用"
        align="center"
        prop="rectificationCost"
      />
    </el-table>
    <el-table
      v-if="type === 2"
      v-loading="isLoading"
      height="80%"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
      :border="true"
      class="customer-table"
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
      >
        <template slot-scope="scope">
          {{ setUnitDes(scope.row.analysisUnitId) }}
        </template>
      </el-table-column>
      <el-table-column
        label="作业步骤"
        align="center"
      >
        <template slot-scope="scope">
          <RichText :des="scope.row.eventName" />
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
        label="计划排查人"
        prop="plannedCheckUserNameList"
        align="center"
      >
        <template slot-scope="scope">
          {{ (scope.row.plannedCheckUserNameList || []).join('、') }}
        </template>
      </el-table-column>
      <el-table-column
        label="任务下发时间"
        prop="taskStartDateTime"
        align="center"
        min-width="130"
      />
      <el-table-column
        label="实际排查人"
        prop="actualCheckUseNameList"
        align="center"
      >
        <template slot-scope="scope">
          {{ (scope.row.actualCheckUseNameList || []).join('、') }}
        </template>
      </el-table-column>
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
        label="状态"
        align="center"
        width="80"
      >
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.taskStatus == 1"
            type="success"
          >
            已排查
          </el-tag>
          <el-tag
            v-else-if="
              scope.row.taskStatus == 0
                && new Date(scope.row.taskEndDateTime).getTime() > new Date().getTime()
            "
            type="warning"
          >
            未排查
          </el-tag>
          <el-tag
            v-else
            type="danger"
          >
            已过期
          </el-tag>
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
      v-if="type === 3"
      v-loading="isLoading"
      height="80%"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
      :border="true"
      class="customer-table"
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
    </el-table>
    <el-table
      v-if="type === 4"
      v-loading="isLoading"
      height="80%"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
      :border="true"
      class="customer-table"
    >
      <el-table-column
        label="序号"
        align="center"
        type="index"
        width="50"
      />
      <el-table-column
        label="公司"
        align="center"
        prop="troubleCompanyName"
      />
      <el-table-column
        label="所属部门"
        align="center"
        prop="troubleDeptName"
      />
      <el-table-column
        label="检查人"
        align="center"
        prop="checkUserFullName"
      />
      <el-table-column
        label="业务类型"
        align="center"
        prop="businessType"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabel('trouble_business_type', scope.row.businessType, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="隐患类型"
        align="center"
        prop="troubleType"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabelById('troubleType_yhlx', scope.row.troubleType, '--')
          }}</span>
        </template>
      </el-table-column>
      <el-table-column
        label="上报时间"
        align="center"
        prop="troubleFindTime"
        min-width="130"
      />
      <el-table-column
        label="整改进度"
        align="center"
      >
        <template slot-scope="props">
          <el-tag
            v-if="props.row.troubleState === -1"
            type="success"
          >
            审核非隐患
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 0"
            type="warning"
          >
            待审核
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 1"
            type="warning"
          >
            待派发
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 2"
            type="warning"
          >
            待整改
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 3"
            type="warning"
          >
            待验收
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 4"
            type="warning"
          >
            待复查
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 5"
            type="success"
          >
            已复查
          </el-tag>
          <el-tag
            v-if="props.row.troubleState === 6"
            type="danger"
          >
            逾期未整改
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="隐患现状描述"
        align="center"
        prop="troubleDesc"
        min-width="130"
      />
      <el-table-column
        label="整改措施"
        align="center"
        prop="rectificationOpinions"
      />
      <el-table-column
        label="隐患等级"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{
            $dictUtils.getDictLabel('hiddenDangerLevel', scope.row.troubleLevel, '')
          }}</span>
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
  </el-dialog>
</template>
