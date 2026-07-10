/* * @Author: xiaorui 违规记录审核的弹框 * @Date: 2022-05-20 14:51:34 * @Last Modified by: xiaorui *
@Last Modified time: 2022-09-29 17:19:37 */
<script>
import { submitViolationAuditFn } from '@/http/dev_new/inspection-api'

export default {
  data() {
    return {
      visible: false,
      loading: false,
      baseInfo: {
        planName: '',
        violationUserName: '',
        postName: '',
        violationTime: '',
        violationType: '',
      },
      inputForm: {
        violationId: '',
        auditResult: '', // 审核结果：误报:2;确认违规:3
        handlingOpinions: '', // 处理意见
      },
      dataRule: {
        auditResult: [{ required: true, message: '审核结果不能为空', trigger: 'change' }],
      },
      violationTypeList: [
        {
          label: '未按时做',
          value: 'NOT_ON_TIME',
          id: 1,
        },
        {
          label: '未做',
          value: 'NOT_DONE',
          id: 2,
        },
      ], // 违规类型list
    }
  },
  methods: {
    init(obj) {
      this.visible = true
      this.$nextTick(() => {
        this.$refs.inputForm.clearValidate()
        this.inputForm = {
          violationId: obj.violationId,
          auditResult: '', // 审核结果.待审核:1;误报:2;确认违规:3
          handlingOpinions: '', // 处理意见
        }
        this.baseInfo = this.recover(this.baseInfo, obj)
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          submitViolationAuditFn(this.inputForm).then(({ data }) => {
            this.loading = false
            if (data && data.success) {
              this.$message.success(data.message)
              this.visible = false
              this.$emit('refreshDataList')
            }
            else {
              this.$message.error(data.message || '提交失败')
            }
          })
        }
      })
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      title="审核设备巡检违规记录"
      :close-on-click-modal="false"
      width="600px"

      :visible.sync="visible"
      class="normal-dialog"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        inline
        :model="inputForm"
        :rules="dataRule"
        label-width="80px"
        @submit.native.prevent
      >
        <el-form-item label="违规计划">
          <el-input
            v-model="baseInfo.planName"
            disabled
          />
        </el-form-item>
        <el-form-item label="违规岗位">
          <el-input
            v-model="baseInfo.postName"
            disabled
          />
        </el-form-item>
        <el-form-item label="违规人员">
          <el-input
            v-model="baseInfo.violationUserName"
            disabled
          />
        </el-form-item>
        <el-form-item label="违规时间">
          <el-input
            v-model="baseInfo.violationTime"
            disabled
          />
        </el-form-item>
        <el-form-item label="违规类型">
          <el-select
            v-model="baseInfo.violationType"
            placeholder="请选择"
            disabled
          >
            <el-option
              v-for="item in violationTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <br>
        <el-form-item
          label="审核结果"
          prop="auditResult"
        >
          <el-radio-group v-model="inputForm.auditResult">
            <el-radio label="2">
              误报
            </el-radio>
            <el-radio label="3">
              确认违规
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <br>
        <el-form-item
          label="处理意见"
          prop="handlingOpinions"
        >
          <el-input
            v-model="inputForm.handlingOpinions"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
            style="width: 400px"
          />
        </el-form-item>
      </el-form>
      <el-tag type="warning">
        提示：审核后将无法进行修改，请确认后保存
      </el-tag>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="small"
          @click="visible = false"
        >关闭</el-button>
        <el-button
          size="small"
          type="primary"
          :loading="loading"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
