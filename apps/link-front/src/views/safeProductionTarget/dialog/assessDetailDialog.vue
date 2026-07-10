/* * @Author: xiaorui 目标责任制考核弹框 * @Date: 2023-05-11 11:56:53 * @Last Modified by: xiaorui *
@Last Modified time: 2023-05-22 10:36:23 */
<script>
import {
  getAssessDetailByIdFn,
  getFinishAssessDetailByIdFn,
  saveAssessDetailFn,
} from '@/http/safeProductionTarget/safe-production-target-api'

export default {
  data() {
    return {
      visible: false,
      loading: false,
      method: '',
      title: '新增',
      sForm: {
        id: '',
        startDate: '',
        endDate: '',
      },
      inputForm: {
        id: '',
        companyId: '', // 公司id
        companyName: '',
        deptId: '', // 部门id
        deptName: '',
        postId: '', // 岗位id
        postName: '',
        jobNumber: '',
        userId: '',
        fullName: '',
        realExtract: '', // 实际提取金额
        realCash: '', // 实际兑现金额
        summaryTotal: '', // 汇总考核金额
        startDate: '',
        endDate: '',
        selectedExamItemList: [],
      },
      dataRule: {
        startDate: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
        endDate: [{ required: true, message: '结束时间不能为空', trigger: 'change' }],
      },
    }
  },
  methods: {
    init(method, id) {
      this.visible = true
      this.method = method
      let func, params
      if (method === 'assess') {
        this.title = '安全目标责任考核'
        func = getAssessDetailByIdFn
        params = { id }
      }
      else if (method === 'view') {
        this.title = '安全目标责任考核台账详情'
        func = getFinishAssessDetailByIdFn
        params = id
      }
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (id) {
          this.loading = true
          func(params)
            .then(({ data }) => {
              if (data && data.success) {
                this.inputForm = this.recover(this.inputForm, data.result)
                // 计算汇总考核金额
                this.getSummaryTotal()
              }
              else {
                this.$message.warning(data.message || '获取详情失败')
              }
            })
            .catch(() => {
              this.$message.error('获取详情失败')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
    // 时间范围变化时，重新获取考核详情
    getAssessDetail() {
      if (this.inputForm.startDate && this.inputForm.endDate) {
        const startDate = this.inputForm.startDate
        const endDate = this.inputForm.endDate
        const params = {
          id: this.inputForm.id,
          startDate,
          endDate,
        }
        getAssessDetailByIdFn(params)
          .then(({ data }) => {
            if (data && data.success) {
              this.inputForm = this.recover(this.inputForm, data.result)
              // 计算汇总考核金额
              this.getSummaryTotal()
            }
            else {
              this.$message.warning(data.message || '获取详情失败')
            }
          })
          .catch(() => {
            this.$message.error('获取详情失败')
          })
          .finally(() => {
            this.loading = false
          })
      }
    },
    // 考核标准变化时，重新计算考核金额
    getSummaryTotal() {
      this.inputForm.summaryTotal = 0
      this.inputForm.selectedExamItemList.forEach((item) => {
        this.inputForm.summaryTotal += item.frequency * item.examStandard
      })
      this.inputForm.realCash = this.inputForm.realExtract - this.inputForm.summaryTotal
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          saveAssessDetailFn(this.inputForm)
            .then(({ data }) => {
              if (data && data.success) {
                this.$message.success(data.message)
                this.visible = false
                this.$emit('refreshDataList')
              }
              else {
                this.$message.warning(data.message || '保存失败！')
              }
            })
            .catch(() => {
              this.$message.error('保存失败！')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"

    :visible.sync="visible"
    class="normal-dialog"
    :append-to-body="true"
    width="900px"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      :model="inputForm"
      :disabled="method === 'view'"
      :rules="dataRule"
      label-width="100px"
      @submit.native.prevent
    >
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="公司"
            prop="companyName"
          >
            <el-input
              v-model="inputForm.companyName"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="部门"
            prop="deptName	"
          >
            <el-input
              v-model="inputForm.deptName"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="岗位"
            prop="postName"
          >
            <el-input
              v-model="inputForm.postName"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="姓名"
            prop="fullName"
          >
            <el-input
              v-model="inputForm.fullName"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="实际兑现金额"
            prop="realCash"
          >
            <el-input
              v-model="inputForm.realCash"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="汇总考核金额"
            prop="summaryTotal"
          >
            <el-input
              v-model="inputForm.summaryTotal"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="开始时间"
            prop="startDate"
          >
            <el-date-picker
              v-model="inputForm.startDate"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择"
              style="width: 100%"
              @change="getAssessDetail"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="结束时间"
            prop="endDate"
          >
            <el-date-picker
              v-model="inputForm.endDate"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择"
              style="width: 100%"
              @change="getAssessDetail"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-table
        :data="inputForm.selectedExamItemList"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        highlight-current-row
        :height="250"
      >
        <el-table-column
          label="序号"
          type="index"
          width="50"
        />
        <el-table-column
          align="center"
          label="考核目标"
          prop="name"
          min-width="180"
        />
        <el-table-column
          align="center"
          label="接受考核频次"
          prop="frequency"
          min-width="130"
        />
        <el-table-column
          align="center"
          label="考核标准(元)"
          min-width="130"
        >
          <template slot-scope="scope">
            <el-input-number
              v-model="scope.row.examStandard"
              controls-position="right"
              :min="0"
              style="width: 120px"
              @change="getSummaryTotal"
            />
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="考核金额"
          min-width="130"
        >
          <template slot-scope="scope">
            {{ scope.row.frequency * scope.row.examStandard }}
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          label="不符合事实"
          min-width="130"
        >
          <template slot-scope="scope">
            <el-input v-model="scope.row.noFact" />
          </template>
        </el-table-column>
      </el-table>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        style="margin: 0 10px 0 0"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-if="method != 'view'"
        size="small"
        type="primary"
        :loading="loading"
        @click="doSubmit()"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
