/* * @Author: xiaorui 安全风险金考评列表页面 * @Date: 2023-03-09 14:17:20 * @Last Modified by:
xiaorui * @Last Modified time: 2023-11-23 17:02:46 */
<script>
import { getSafetyRiskFundListByPageFn } from '@/http/evaluate-manage/evaluate-api'
import { SAFETYRISK_EVALUATE_LIST } from '@/http/excel-api'
import OwnDeparmentTree from '@/views/common-ui/OwnDeparmentTree'
import { GridmanTypeList } from '@/views/evaluateManage/config/constant'
import SafetyRiskFundDetail from './dialog/safetyRiskFundDetail'

let beforePageNum = 1
export default {
  components: {
    OwnDeparmentTree,
    SafetyRiskFundDetail,
  },
  beforeRouteEnter(to, from, next) {
    beforePageNum = from.params.pageNum || 1
    next()
  },
  data: () => ({
    loading: false,
    GridmanTypeList,
    sexList: ['男', '女'],
    statusList: [
      {
        label: '禁用',
        value: '0',
      },
      {
        label: '在职',
        value: '1',
      },
      {
        label: '借调',
        value: '2',
      },
      {
        label: '离职',
        value: '3',
      },
      {
        label: '退休',
        value: '4',
      },
    ],
    tableData: [],
    total: 0,
    sForm: {
      pageNum: 1,
      pageSize: 10,
      departmentId: '',
      gridmanType: '', // 网格管理属性
      userName: '', // 姓名
      userStatus: '', // 人员状态
      startDate: '', // 开始时间
      endDate: '', // 结束时间
      sex: '', // 性别
    },
    timeValue: '', // 搜索条件中的起止时间
    isShow: false,
    showExportDialog: false, // excel导出弹窗开关
    exportProp: {}, // excel导出弹窗参数
  }),
  created() {
    this.sForm.pageNum = beforePageNum || 1
    this.getDataList()
  },
  methods: {
    // 点击部门树的item
    treeNodeTap(v) {
      // 记录部门id
      if (v.onlyTreeUse)
        return
      this.sForm.pageNum = 1
      this.sForm.departmentId = v.id
      this.getDataList()
    },
    getDataList() {
      // 查询记录
      this.loading = true
      getSafetyRiskFundListByPageFn(this.sForm)
        .then(({ data }) => {
          if (data.success) {
            this.tableData = data.result ? data.result.list : []
            this.total = data.result ? data.result.total : 0
          }
          else {
            this.$message.warning(data.message || '查询失败')
          }
        })
        .catch(() => {
          this.$message.error('查询失败')
        })
        .finally(() => {
          this.loading = false
        })
    },
    searchFn() {
      this.sForm.pageNum = 1
      this.getDataList()
    },
    // 获取起止时间
    getTimeValue(v) {
      if (v && v.length) {
        this.sForm.startDate = v[0]
        this.sForm.endDate = v[1]
      }
      else {
        this.sForm.startDate = ''
        this.sForm.endDate = ''
      }
    },
    getLabel(val, list) {
      return (
        this[list].find((item) => {
          return item.value === val
        }) || {}
      ).label
    },
    // 复核、查看
    toDetailClick(row, method) {
      this.$refs.safetyRiskFundDetail.init(row, method)
    },
    openUp() {
      this.isShow = true
      setTimeout(() => {
        this.$refs.treeTable.setTableHeight()
      }, 200)
    },
    putAway() {
      this.isShow = false
      setTimeout(() => {
        this.$refs.treeTable.setTableHeight()
      }, 200)
    },
    resetEvent() {
      this.sForm.gridmanType = ''
      this.sForm.userName = ''
      this.sForm.userStatus = ''
      this.sForm.sex = ''
      this.sForm.startDate = ''
      this.sForm.endDate = ''
      this.sForm.pageNum = 1
      this.getDataList()
    },
    /* 点击导出 */
    exportClick() {
      const params = {}
      for (const key in this.sForm) {
        if ((this.sForm[key] || this.sForm[key] === 0) && !['pageNum', 'pageSize'].includes(key)) {
          params[key] = this.sForm[key]
        }
      }
      this.exportProp = {
        businessData: SAFETYRISK_EVALUATE_LIST,
        reqData: params,
      }
      this.showExportDialog = true
    },
    // 跳转至其他业务统计页面
    toOtherBook(row, routerName) {
      let startDate, endDate
      const arr01 = ['threeViolationList']
      const arr02 = ['machineAccount']
      if (arr01.includes(routerName)) {
        startDate = this.moment(row.evaluationStart).format('YYYY-MM-DD')
        endDate = this.moment(row.evaluationEnd).format('YYYY-MM-DD')
      }
      else if (arr02.includes(routerName)) {
        startDate = row.evaluationStart
        endDate = row.evaluationEnd
      }
      this.$router.push({
        name: routerName,
        params: {
          fromEvaluate: true,
          userId: row.userId, // 被考核人id
          startDate, // 考核起始时间
          endDate, // 考核截止时间
          pageNum: this.sForm.pageNum,
        },
      })
    },
  },
}
</script>

<template>
  <TreeTable ref="treeTable">
    <!-- 左侧树 -->
    <OwnDeparmentTree
      slot="tree"
      @treeNodeTap="treeNodeTap"
    />
    <el-form
      slot="search"
      ref="sForm"
      :inline="true"
      :model="sForm"
      size="mini"
      class="sForm"
      @submit.native.prevent
    >
      <el-form-item
        prop="gridmanType"
        label="网格管理属性"
      >
        <el-select
          v-model="sForm.gridmanType"
          placeholder="请选择"
          filterable
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="item in GridmanTypeList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        prop="userName"
        label="姓名"
      >
        <el-input
          v-model="sForm.userName"
          placeholder="姓名"
          clearable
          style="width: 120px"
        />
      </el-form-item>
      <el-form-item
        prop="userStatus"
        label="人员状态"
      >
        <el-select
          v-model="sForm.userStatus"
          placeholder="请选择"
          filterable
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="item in statusList"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        prop="sex"
        label="性别"
      >
        <el-select
          v-model="sForm.sex"
          placeholder="请选择"
          filterable
          clearable
          style="width: 120px"
        >
          <el-option
            v-for="(item, index) in sexList"
            :key="index"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="isShow"
        label="日期"
      >
        <el-date-picker
          v-model="timeValue"
          type="monthrange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM"
          @change="getTimeValue"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          icon="el-icon-search"
          :loading="loading"
          @click="searchFn"
        >
          查询
        </el-button>
        <el-button
          class="reset"
          icon="el-icon-refresh-left"
          :loading="loading"
          @click="resetEvent"
        >
          重置
        </el-button>
        <el-button
          v-if="!isShow"
          type="text"
          icon="el-icon-arrow-down"
          @click="openUp"
        >
          高级筛选
        </el-button>
        <el-button
          v-else
          type="text"
          icon="el-icon-arrow-up"
          style="color: black"
          @click="putAway"
        >
          收起
        </el-button>
      </el-form-item>
    </el-form>
    <div slot="auxiliary">
      <el-button
        v-if="hasBtnPermission('safety_risk_fund_export')"
        type="success"
        plain
        icon="el-icon-upload2"
        @click="exportClick"
      >
        导出
      </el-button>
    </div>
    <el-table
      slot="table"
      ref="table"
      v-loading="loading"
      :data="tableData"
      size="mini"
      height="100%"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      highlight-current-row
      :border="true"
      class="customer-table"
    >
      <el-table-column
        label="序号"
        type="index"
        width="50"
      />
      <el-table-column
        label="日期"
        prop="evaluationStart"
        align="center"
      >
        <template slot-scope="scope">
          {{ scope.row.evaluationStart.slice(0, scope.row.evaluationStart.lastIndexOf('-')) }}
        </template>
      </el-table-column>
      <el-table-column
        label="公司"
        prop="companyName"
        align="center"
      />
      <el-table-column
        label="部门"
        prop="departmentName"
        align="center"
      />
      <el-table-column
        label="姓名"
        prop="userFullName"
        align="center"
      />
      <el-table-column
        label="性别"
        prop="sex"
        align="center"
      />
      <el-table-column
        label="岗位"
        prop="postName"
        align="center"
      />
      <el-table-column
        label="工号"
        prop="jobNumber"
        align="center"
      />
      <el-table-column
        label="人员状态"
        prop="userStatus"
        align="center"
      >
        <template slot-scope="scope">
          <el-tag
            v-if="scope.row.userStatus === '0'"
            type="danger"
          >
            禁用
          </el-tag>
          <el-tag
            v-if="scope.row.userStatus === '1'"
            type="success"
          >
            在职
          </el-tag>
          <el-tag
            v-if="scope.row.userStatus === '2'"
            type="warning"
          >
            借调
          </el-tag>
          <el-tag
            v-if="scope.row.userStatus === '3'"
            type="danger"
          >
            离职
          </el-tag>
          <el-tag
            v-if="scope.row.userStatus === '4'"
            type="danger"
          >
            退休
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        label="网格管理属性"
        prop="gridmanType"
        align="center"
        width="80"
      >
        <template slot-scope="scope">
          {{ getLabel(scope.row.gridmanType, 'GridmanTypeList') }}
        </template>
      </el-table-column>
      <el-table-column
        label="安全风险金额"
        prop="safetyRiskFund"
        align="center"
      />
      <el-table-column
        label="事故次数(数量)"
        prop="accidentCount"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="toOtherBook(scope.row, 'machineAccount')"
          >
            {{ scope.row.accidentCount }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="三违考核(金额)"
        prop="threeViolationsAmount"
        align="center"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            @click="toOtherBook(scope.row, 'threeViolationList')"
          >
            {{ scope.row.threeViolationsAmount }}
          </el-button>
        </template>
      </el-table-column>
      <el-table-column
        label="实际兑现风险金"
        prop="cashAmount"
        align="center"
      />
      <el-table-column
        label="操作"
        min-width="140"
        align="center"
        fixed="right"
      >
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.status === 2"
            type="text"
          >
            已复核
          </el-button>
          <el-button
            v-if="scope.row.status !== 2 && hasBtnPermission('safety_risk_fund_review')"
            type="text"
            @click="toDetailClick(scope.row, 'review')"
          >
            复核
          </el-button>
          <el-button
            v-if="hasBtnPermission('safety_risk_fund_view')"
            type="text"
            @click="toDetailClick(scope.row, 'view')"
          >
            查看
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      slot="page"
      :current-page.sync="sForm.pageNum"
      :page-sizes="[10, 20, 50]"
      background
      :page-size.sync="sForm.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="getDataList"
      @current-change="getDataList"
    />
    <!-- 详情弹框 -->
    <safety-risk-fund-detail
      slot="dialog"
      ref="safetyRiskFundDetail"
      @refreshList="searchFn"
    />
    <!-- excel导出 -->
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      title="Excel导出"
      :visible.sync="showExportDialog"
      width="650px"
      append-to-body
      :close-on-click-modal="false"
    >
      <KyExcelExport
        v-if="showExportDialog"
        v-bind="exportProp"
        @close="showExportDialog = false"
      />
    </el-dialog>
  </TreeTable>
</template>

<style lang="scss" scoped>
.sForm ::v-deep {
  .el-form-item--mini {
    margin-bottom: 18px;
  }
}
</style>
