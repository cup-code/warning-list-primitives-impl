<script>
import { emTeamMemberAdd } from '@/http/emergency/emsource-api.js'

export default {
  props: {
    // 是否是新增的队伍
    isNew: {
      type: Boolean,
      default: false,
    },
    teamId: {
      type: [String, Number],
      default: '',
    },
  },
  data() {
    return {
      addData: {},
      loadingDialog: false,
    }
  },
  methods: {
    closeClick() {
      this.$emit('addSucc', undefined)
    },
    saveAddClick() {
      this.$refs.addForm.validate((valid) => {
        if (valid) {
          this.addData.classify = 1
          this.addData.teamId = this.teamId
          // 新队伍加成员
          if (this.isNew) {
            this.$emit('addSucc', this.addData)
          }
          // 老队伍加成员
          else {
            this.loadingDialog = true
            this.addData.teamId = this.teamId
            emTeamMemberAdd(this.addData)
              .then((res) => {
                if (res.data.success) {
                  this.$emit('addSucc', this.addData)
                }
                else {
                  this.$message.warning(res.data.message || '保存失败')
                }
              })
              .catch((err) => {
                this.$message.error('保存出错', err)
              })
              .finally(() => {
                this.loadingDialog = false
              })
          }
        }
      })
    },
  },
}
</script>

<template>
  <div
    v-loading="loadingDialog"
    class="add-info"
  >
    <el-form
      ref="addForm"
      :model="addData"
      label-width="100px"
      style="width: 500px"
    >
      <el-form-item
        label="队员姓名"
        prop="fullName"
        :rules="{ required: true, message: '请输入队员姓名', trigger: 'blur' }"
      >
        <el-input v-model="addData.fullName" />
      </el-form-item>
      <el-form-item
        label="队员电话"
        prop="phone"
        :rules="{ required: true, message: '请输入队员电话', trigger: 'blur' }"
      >
        <el-input v-model="addData.phone" />
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
      >
        <el-input
          v-model="addData.remark"
          type="textarea"
          resize="none"
          :rows="4"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
        type="primary"
        plain
        :disabled="loadingDialog"
        @click="closeClick"
      >
        取消
      </el-button>
      <el-button
        size="medium"
        type="primary"
        :disabled="loadingDialog"
        @click="saveAddClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>
