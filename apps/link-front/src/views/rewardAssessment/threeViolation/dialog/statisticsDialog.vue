/* * @Author: xiaorui 三违考核统计台账，查看详情弹框 * @Date: 2023-03-24 16:12:22 * @Last Modified
by: xiaorui * @Last Modified time: 2023-07-27 16:21:48 */
<script>
import { getExecutedListByDepartFn } from '@/http/rewardAssessment/reward'
import ThreeViolation from './detailForm'

export default {
  components: {
    ThreeViolation,
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
        assessTotalAmount: '',
        illegalCommandCount: '',
        illegalOperationCount: '',
        violationLaborDisciplineCount: '',
        examineCountTotal: '',
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
      getExecutedListByDepartFn(this.sForm)
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
      this.$refs.threeViolation.init(method, id)
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
              label="考核总次数"
              prop="examineCountTotal"
            >
              <el-input v-model="inputForm.examineCountTotal" />
            </el-form-item>
          </el-col>
          <el-col :span="colWidth">
            <el-form-item
              label="考核总金额"
              prop="assessTotalAmount"
            >
              <el-input v-model="inputForm.assessTotalAmount" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="colWidth">
            <el-form-item
              label="违章指挥"
              prop="illegalCommandCount"
            >
              <el-input v-model="inputForm.illegalCommandCount" />
            </el-form-item>
          </el-col>
          <el-col :span="colWidth">
            <el-form-item
              label="违章操作"
              prop="illegalOperationCount"
            >
              <el-input v-model="inputForm.illegalOperationCount" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="colWidth">
            <el-form-item
              label="违反劳动纪律"
              prop="violationLaborDisciplineCount"
            >
              <el-input v-model="inputForm.violationLaborDisciplineCount" />
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
          prop="assessDate"
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
          label="考核类型"
          prop="assessType"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('assess_type', scope.row.assessType) }}
          </template>
        </el-table-column>
        <el-table-column
          label="考核类别"
          prop="assessCategory"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('assess_category', scope.row.assessCategory) }}
          </template>
        </el-table-column>
        <el-table-column
          label="被考核单位"
          prop="examineDepartmentName"
          align="center"
        />
        <el-table-column
          label="被考核人姓名"
          prop="examineUserName"
          align="center"
        />
        <el-table-column
          label="考核级别"
          prop="assessLevel"
          align="center"
        >
          <template slot-scope="scope">
            {{ $dictUtils.getDictLabel('assess_level', scope.row.assessLevel) }}
          </template>
        </el-table-column>
        <el-table-column
          label="考核总金额"
          prop="assessTotalAmount"
          align="center"
        />
        <el-table-column
          label="事实描述"
          prop="factDes"
          align="center"
        />
        <el-table-column
          label="考核执行部门"
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
    <three-violation ref="threeViolation" />
  </el-dialog>
</template>
