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
      visible: false,
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
    init(method, id) {
      this.method = method
      if (method === 'add') {
        this.title = `新建请假申请`
      }
      else if (method === 'edit') {
        this.title = '修改请假申请'
      }
      else if (method === 'view') {
        this.title = '查看请假申请'
      }
      this.visible = true
      this.loading = false
      this.inputForm.id = id
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.loading = true
          this.$http({
            url: `/test/activiti/testActivitiLeave/queryById?id=${this.inputForm.id}`,
            method: 'get',
          }).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.testActivitiLeave)
            this.loading = false
          })
        }
      })
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
            this.loading = false
            if (data && data.success) {
              // callback(data.businessTable, data.businessId)
              this.visible = false
              this.$message.success(data.msg)
              this.$emit('refreshDataList')
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
      :title="title"
      :close-on-click-modal="false"

      :visible.sync="visible"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        size="small"
        :model="inputForm"
        :class="method === 'view' ? 'readonly' : ''"
        :disabled="method === 'view'"
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

      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="small"
          @click="visible = false"
        >关闭</el-button>
        <el-button
          v-if="method != 'view'"
          v-noMoreClick
          size="small"
          type="primary"
          @click="saveForm()"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
