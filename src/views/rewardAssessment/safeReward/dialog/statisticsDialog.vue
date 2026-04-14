/* * @Author: xiaorui 安全奖励统计台账，查看详情弹框 * @Date: 2023-03-29 15:30:52 * @Last Modified
by: xiaorui * @Last Modified time: 2023-07-27 18:35:44 */
<script>
import { getExecutedRewardListByDepartFn } from '@/http/rewardAssessment/reward'
import SafeRewardDetail from './rewardDetailForm'

export default {
  components: {
    SafeRewardDetail,
  },
  data() {
    return {
      visible: false,
      loading: false,
      colWidth: 12,
      title: '台账详情',
      inputForm: {
        companyName: '',
        departmentName: '',
        rewardCountTotal: '',
        rewardTotalAmount: '',
        rationalizationSuggestionsCount: '',
        reportingThreeViolationsCount: '',
        hiddenDangerReportingCount: '',
        safetyFollowUpCount: '',
        otherCount: '',
      },
      sForm: {
        pageNum: 1,
        pageSize: 10,
        departmentId: '',
      },
      dataList: [],
      total: 0,
    }
  },
  methods: {
    init(row) {
      this.visible = true
      this.$nextTick(() => {
        this.inputForm = this.recover(this.inputForm, row)
        this.sForm.departmentId = row.departmentId
        this.getDataList()
      })
    },
    getDataList() {
      // 查询记录
      this.loading = true
      getExecutedRewardListByDepartFn(this.sForm)
        .then(({ data }) => {
          if (data.success) {
            this.dataList = data.result.list || []
            this.total = data.result.total
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
    clickFn(method, id) {
      this.$refs.safeRewardDetail.init(method, id)
    },
  },
}
</script>

<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    :modal-append-to-body="false"

    :visible.sync="visible"
    class="normal-dialog"
    width="800px"
  >
    <div>
      <el-form
        ref="inputForm"
        v-loading="loading"
        :model="inputForm"
        label-width="120px"
        disabled
        @submit.native.prevent
      >
        <el-row>
          <el-col :span="colWidth">
            <el-form-item
              label="所属公司"
              prop="companyName"
            >
              <el-input v-model="inputForm.companyName" />
            </el-form-item>
          </el-col>
          <el-col :span="colWidth">
            <el-form-item
              label="部门"
              prop="departmentName"
            >
              <el-input v-model="inputForm.departmentName" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="colWidth">
            <el-form-item
              label="奖励总次数"
              prop="rewardCountTotal"
            >
              <el-input v-model="inputForm.rewardCountTotal" />
            </el-form-item>
          </el-col>
          <el-col :span="colWidth">
            <el-form-item
              label="奖励总金额"
              prop="rewardTotalAmount"
            >
              <el-input v-model="inputForm.rewardTotalAmount" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="colWidth">
            <el-form-item
              label="合理化建议"
              prop="rationalizationSuggestionsCount"
            >
              <el-input v-model="inputForm.rationalizationSuggestionsCount" />
            </el-form-item>
          </el-col>
          <el-col :span="colWidth">
            <el-form-item
              label="三违举报"
              prop="reportingThreeViolationsCount"
            >
              <el-input v-model="inputForm.reportingThreeViolationsCount" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="colWidth">
            <el-form-item
              label="隐患举报"
              prop="hiddenDangerReportingCount"
            >
              <el-input v-model="inputForm.hiddenDangerReportingCount" />
            </el-form-item>
          </el-col>
          <el-col :span="colWidth">
            <el-form-item
              label="安全随手拍"
              prop="safetyFollowUpCount"
            >
              <el-input v-model="inputForm.safetyFollowUpCount" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="colWidth">
            <el-form-item
              label="其他"
              prop="otherCount"
            >
              <el-input v-model="inputForm.otherCount" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <el-table
        v-loading="loading"
        :data="dataList"
        size="mini"
        height="200"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        highlight-current-row
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          label="日期"
          prop="rewardDate"
          align="center"
        />
        <el-table-column
          label="发起人"
          prop="initiatorUserName"
          align="center"
        />
        <el-table-column
          label="发起人部门"
          prop="initiatorDepName"
          align="center"
        />
        <el-table-column
          label="奖励类型"
          prop="rewardType"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('assess_type', scope.row.rewardType) }}
          </template>
        </el-table-column>
        <el-table-column
          label="奖励类别"
          prop="rewardCategory"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('reward_category', scope.row.rewardCategory) }}
          </template>
        </el-table-column>
        <el-table-column
          label="被奖励人员单位"
          prop="rewardDepartmentName"
          align="center"
        />
        <el-table-column
          label="被奖励人员姓名"
          prop="rewardUserName"
          align="center"
        />
        <el-table-column
          label="奖励金额(元)"
          prop="rewardTotalAmount"
          align="center"
        />
        <el-table-column
          label="事实描述"
          prop="factDes"
          align="center"
        />
        <el-table-column
          label="处理或整改情况"
          prop="illustrate"
          align="center"
        />
        <el-table-column
          label="奖励执行部门"
          prop="executeDepartmentName"
          align="center"
        />
        <el-table-column
          label="审批状态"
          prop="assessStatus"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{
              scope.row.assessStatus === 1
                ? '待审批'
                : scope.row.assessStatus === 2
                  ? '拒绝'
                  : '同意'
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="执行状态"
          prop="executed"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.executed ? '已执行' : '待执行' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          min-width="140"
          align="center"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              @click="clickFn('view', scope.row.id)"
            >
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        :current-page.sync="sForm.pageNum"
        :page-sizes="[10, 20, 50]"
        background
        :page-size.sync="sForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        style="text-align: right; margin-top: 6px"
        @size-change="getDataList"
        @current-change="getDataList"
      />
    </div>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
    </span>
    <safe-reward-detail ref="safeRewardDetail" />
  </el-dialog>
</template>
