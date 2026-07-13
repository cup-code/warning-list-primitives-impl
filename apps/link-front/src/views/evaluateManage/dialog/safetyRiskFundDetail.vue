/* * @Author: xiaorui 安全风险金复核弹框 * @Date: 2023-03-09 14:28:34 * @Last Modified by: xiaorui *
@Last Modified time: 2023-03-10 14:16:36 */
<script>
import { reviewSafetyRiskFundDetailFn } from '@/http/evaluate-manage/evaluate-api'
import { GridmanTypeList } from '@/views/evaluateManage/config/constant'

export default {
  data() {
    return {
      visible: false,
      loading: false,
      colWidth: 12,
      GridmanTypeList,
      dataRule: {
        reviewComments: [{ required: true, message: '复核意见不能为空', trigger: 'blur' }],
      },
      userStatusList: [
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
      method: '',
      inputForm: {
        id: '',
        companyName: '',
        departmentName: '',
        userFullName: '',
        sex: '',
        postName: '',
        jobNumber: '',
        evaluationStart: '',
        userStatus: '',
        gridmanType: '',
        safetyRiskFund: '',
        accidentCount: '',
        threeViolationsAmount: '',
        cashAmount: 0,
        reviewComments: '', // 复核意见
      },
    }
  },
  methods: {
    init(row, method) {
      this.visible = true
      this.method = method
      row.evaluationStart = row.evaluationStart
        ? row.evaluationStart.slice(0, row.evaluationStart.lastIndexOf('-'))
        : ''
      this.inputForm = this.recover(this.inputForm, row)
    },
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          const params = {
            id: this.inputForm.id,
            reviewComments: this.inputForm.reviewComments,
          }
          reviewSafetyRiskFundDetailFn(params)
            .then(({ data }) => {
              if (data.success) {
                this.visible = false
                this.$message.success(data.message || '提交成功')
                this.$emit('refreshList')
              }
              else {
                this.$message.warning(data.message || '提交失败')
              }
            })
            .catch(() => {
              this.$message.error('提交失败')
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
    title="安全风险金考评结果"
    :close-on-click-modal="false"
    width="800px"

    :visible.sync="visible"
    class="normal-dialog"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      :model="inputForm"
      :rules="dataRule"
      label-width="120px"
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <el-row>
        <el-col :span="colWidth">
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
        <el-col :span="colWidth">
          <el-form-item
            label="部门"
            prop="departmentName"
          >
            <el-input
              v-model="inputForm.departmentName"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="姓名"
            prop="userFullName"
          >
            <el-input
              v-model="inputForm.userFullName"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="性别"
            prop="sex"
          >
            <el-input
              v-model="inputForm.sex"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
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
        <el-col :span="colWidth">
          <el-form-item
            label="工号"
            prop="jobNumber"
          >
            <el-input
              v-model="inputForm.jobNumber"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="日期"
            prop="evaluationStart"
          >
            <el-input
              v-model="inputForm.evaluationStart"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="人员状态"
            prop="userStatus"
          >
            <el-select
              v-model="inputForm.userStatus"
              disabled
              style="width: 100%"
            >
              <el-option
                v-for="item in userStatusList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="网格管理属性"
            prop="gridmanType"
          >
            <el-select
              v-model="inputForm.gridmanType"
              disabled
              style="width: 100%"
            >
              <el-option
                v-for="item in GridmanTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="安全风险金"
            prop="safetyRiskFund"
          >
            <el-input
              v-model="inputForm.safetyRiskFund"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="事故管理"
            prop="accidentCount"
          >
            <el-input
              v-model="inputForm.accidentCount"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="三违考核"
            prop="threeViolationsAmount"
          >
            <el-input
              v-model="inputForm.threeViolationsAmount"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="colWidth">
          <el-form-item
            label="实际兑现风险金"
            prop="cashAmount"
          >
            <el-input
              v-model="inputForm.cashAmount"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        v-if="method === 'review'"
        label="复核意见"
        prop="reviewComments"
      >
        <el-input
          v-model="inputForm.reviewComments"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
        />
      </el-form-item>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-if="method !== 'view'"
        size="small"
        type="primary"
        :loading="loading"
        @click="doSubmit()"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
