<script>
import { saveInspectionPlan } from '@/http/specialEquipment/management-api'
import { recoverNotNull } from '@/utils/fmUtils'

export default {
  props: {
    did: String, // 设备id
  },
  data() {
    return {
      isLoading: false,
      labelPosition: 'right',
      colWidth: 24,
      colItemWidth: 16,
      inputForm: {
        id: '',
        equipmentId: this.did,
        planName: '',
        inspectionDepartment: '',
        inspectionType: 1,
        inspectionNextDate: '',
      },
      inputFormRule: {
        planName: [{ required: true, message: '计划名称不能为空', trigger: 'blur' }],
        inspectionDepartment: [
          { required: true, message: '检验机构/部门不能为空', trigger: 'blur' },
        ],
        inspectionNextDate: [{ required: true, message: '下次检验日期不能为空', trigger: 'blur' }],
      },
      method: '',
    }
  },
  methods: {
    init(obj, method) {
      this.method = method
      if (obj.id) {
        this.$nextTick(() => {
          this.$refs.inputForm.clearValidate()
        })
        recoverNotNull(this.inputForm, obj)
      }
      else {
        this.$nextTick(() => {
          this.$refs.inputForm.resetFields()
          this.inputForm.id = ''
          this.inputForm.equipmentId = this.did
        })
      }
    },
    /**
     * 保存按钮单击
     */
    saveClick() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          saveInspectionPlan(this.inputForm)
            .then((r) => {
              const res = r.data
              if (res.success) {
                this.$message.success(res.message)
                this.$emit('refreshData')
              }
              else {
                this.$message.warning(res.message)
              }
            })
            .catch((e) => {
              this.$message.error(`保存异常：${e}`)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <div class="inputForm">
    <el-form
      ref="inputForm"
      v-loading="isLoading"
      :model="inputForm"
      :label-position="labelPosition"
      label-width="140px"
      :rules="inputFormRule"
      :disabled="method === 'look'"
    >
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="计划名称"
            prop="planName"
          >
            <el-col :span="colItemWidth">
              <el-input v-model="inputForm.planName" />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="检验机构/部门"
            prop="inspectionDepartment"
          >
            <el-col :span="colItemWidth">
              <el-input v-model="inputForm.inspectionDepartment" />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="检验类型"
            prop="inspectionType"
          >
            <el-col :span="colItemWidth">
              <el-radio-group v-model="inputForm.inspectionType">
                <el-radio
                  :label="1"
                  size="small"
                >
                  内检
                </el-radio>
                <el-radio
                  :label="2"
                  size="small"
                >
                  外检
                </el-radio>
              </el-radio-group>
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="colWidth">
          <el-form-item
            label="下次检验日期"
            prop="inspectionNextDate"
          >
            <el-col :span="colItemWidth">
              <el-date-picker
                v-model="inputForm.inspectionNextDate"
                type="date"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-col>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col>
          <div style="text-align: right; margin-bottom: 10px">
            <el-button
              type="primary"
              size="medium"
              @click="saveClick"
            >
              保存
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
