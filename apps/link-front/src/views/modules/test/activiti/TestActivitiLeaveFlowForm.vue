<script>
export default {
  components: {},
  props: {
    businessId: {
      type: String,
      default: '',
    },
    formReadOnly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      window,
      title: '',
      method: '',
      loading: false,
      inputForm: {
        id: '',
        leaveType: '',
        startTime: '',
        endTime: '',
        reason: '',
        remarks: '',
      },
    }
  },
  watch: {
    businessId: {
      handler(newVal) {
        if (this.businessId) {
          this.init(this.businessId)
        }
        else {
          this.$nextTick(() => {
            this.$refs.inputForm.resetFields()
          })
        }
      },
      immediate: true,
      deep: false,
    },
  },
  methods: {
    init(id) {
      if (id) {
        this.loading = true
        this.inputForm.id = id
        this.$nextTick(() => {
          this.$refs.inputForm.resetFields()
          this.$http({
            url: `/test/activiti/testActivitiLeave/queryById?id=${this.inputForm.id}`,
            method: 'get',
          }).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.testActivitiLeave)
            this.loading = false
          })
        })
      }
    },
    // 表单提交
    saveForm(callback) {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          this.$http({
            url: `/test/activiti/testActivitiLeave/save`,
            method: 'post',
            data: this.inputForm,
          }).then(({ data }) => {
            if (data && data.success) {
              callback(data.businessTable, data.businessId)
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
    <el-form
      ref="inputForm"
      v-loading="loading"
      size="small"
      :model="inputForm"
      :disabled="formReadOnly"
      label-width="120px"
    >
      <el-row :gutter="15">
        <el-col :span="24">
          <el-form-item
            label="请假类型"
            prop="leaveType"
            :rules="[]"
          >
            <el-input
              v-model="inputForm.leaveType"
              placeholder="请填写请假类型"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="请假开始时间"
            prop="startTime"
            :rules="[]"
          >
            <el-date-picker
              v-model="inputForm.startTime"
              type="datetime"
              style="width: 100%"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择日期时间"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="请假结束时间"
            prop="endTime"
            :rules="[]"
          >
            <el-date-picker
              v-model="inputForm.endTime"
              type="datetime"
              style="width: 100%"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="选择日期时间"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="请假事由"
            prop="reason"
            :rules="[]"
          >
            <el-input
              v-model="inputForm.reason"
              placeholder="请填写请假事由"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="备注信息"
            prop="remarks"
            :rules="[]"
          >
            <el-input
              v-model="inputForm.remarks"
              type="textarea"
              placeholder="请填写备注信息"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>
