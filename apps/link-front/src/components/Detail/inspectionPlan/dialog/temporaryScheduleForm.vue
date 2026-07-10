<script>
import { addTemporaryScheduleFn } from '@/http/dev_new/inspection-api'
import { getAllPostByDepartFn, getUsersByPostFn } from '@/http/safe-production/post-manage-api'

export default {
  props: {
    planBaseInfo: Object,
  },
  data() {
    return {
      visible: false,
      loading: false,
      inputForm: {
        planId: '',
        taskName: '',
        scheduleStartTime: '',
        scheduleEndTime: '',
        expireHours: 0,
        completionCondition: 0,
        executeUserIdList: [],
        postId: '',
        remarks: '',
      },
      dataRule: {
        taskName: [{ required: true, message: '任务名称不能为空', trigger: 'blur' }],
        scheduleStartTime: [{ required: true, message: '开始时间不能为空', trigger: 'change' }],
        scheduleEndTime: [{ required: true, message: '结束时间不能为空', trigger: 'change' }],
        postId: [{ required: true, message: '排班岗位不能为空', trigger: 'change' }],
        executeUserIdList: [{ required: true, message: '巡检人不能为空', trigger: 'change' }],
        expireHours: [{ required: true, message: '过期时间不能为空', trigger: 'blur' }],
      },
      postList: [], // 岗位列表
      users: [], // 用户列表
    }
  },
  methods: {
    init(planId) {
      this.visible = true
      this.inputForm.planId = planId
      // 获取岗位列表
      getAllPostByDepartFn(this.planBaseInfo.departmentId).then(({ data }) => {
        this.postList = data.result || []
      })
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
      })
    },
    // 查询指定岗位id的用户
    getUsersByPost(postId) {
      getUsersByPostFn(postId).then(({ data }) => {
        this.users = data.result || []
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          addTemporaryScheduleFn(this.inputForm).then(({ data }) => {
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
      title="添加临时班次"
      :close-on-click-modal="false"
      width="550px"

      :visible.sync="visible"
      class="normal-dialog"
    >
      <el-form
        ref="inputForm"
        :model="inputForm"
        :rules="dataRule"
        label-width="100px"
        @submit.native.prevent
      >
        <el-form-item
          label="任务名称"
          prop="taskName"
        >
          <el-input v-model="inputForm.taskName" />
        </el-form-item>
        <el-form-item
          label="开始时间"
          prop="scheduleStartTime"
        >
          <el-date-picker
            v-model="inputForm.scheduleStartTime"
            type="datetime"
            placeholder="选择开始时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item
          label="结束时间"
          prop="scheduleEndTime"
        >
          <el-date-picker
            v-model="inputForm.scheduleEndTime"
            type="datetime"
            placeholder="选择结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
        <el-form-item
          label="过期时间"
          prop="expireHours"
        >
          <el-input-number
            v-model="inputForm.expireHours"
            controls-position="right"
            :min="0"
            :max="24"
            style="width: 80px"
          />
          <span>&nbsp;(小时)</span>
        </el-form-item>
        <el-form-item
          label="班次完成条件"
          prop="completionCondition"
        >
          <el-radio-group v-model="inputForm.completionCondition">
            <el-radio :label="0">
              任意执行人巡检完成
            </el-radio>
            <el-radio :label="1">
              所有执行人巡检完成
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          label="排班岗位"
          prop="postId"
        >
          <el-select
            v-model="inputForm.postId"
            placeholder="请选择"
            style="width: 100%"
            filterable
            @change="getUsersByPost"
          >
            <el-option
              v-for="item in postList"
              :key="item.id"
              :label="item.postName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="巡检人"
          prop="executeUserIdList"
        >
          <el-select
            v-model="inputForm.executeUserIdList"
            placeholder="请选择"
            style="width: 100%"
            filterable
            multiple
          >
            <el-option
              v-for="item in users"
              :key="item.id"
              :label="item.fullName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="备注"
          prop="remarks"
        >
          <el-input
            v-model="inputForm.remarks"
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
          size="small"
          type="primary"
          :loading="loading"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
