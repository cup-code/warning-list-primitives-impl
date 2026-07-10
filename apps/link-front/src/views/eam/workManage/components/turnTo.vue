<script>
import { getUsersByDepartIdFn } from '@/http/safe-production/user-manage-api'
import { transferWork } from '@/http/workmanage/work-api'

export default {
  name: 'TrunTo',
  props: {
    info: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      turnForm: {},
      dialog_turn: false,
      turnRules: {
        transferToUserId: [{ required: true, message: '请选择转办人员', trigger: 'change' }],
      },
      userList: [],
    }
  },
  methods: {
    getTurnToList() {
      getUsersByDepartIdFn(this.info.departmentId).then(({ data }) => {
        this.userList = data.result || []
      })
    },

    onClose() {
      this.dialog_turn = false
      this.$refs.turnForm.resetFields()
    },
    onClick() {
      this.dialog_turn = true

      this.getTurnToList()
    },
    // 确认转办
    turnDone() {
      this.turnForm.businessId = this.info.id

      transferWork(this.turnForm).then(({ data }) => {
        console.log(data, 8877)
        if (data.code === 200) {
          this.$message.success(data.message || '转办成功')
          this.dialog_turn = false
          this.dialog = false
          this.getDataList()
        }
        else {
          this.$message.error(data.message || '转办失败')
        }
      })
    },

    // 选择人员
    userFn(v) {
      this.turnForm.transferToUserFullName = this.userList.find(item => item.id === v).fullName
    },
  },
}
</script>

<template>
  <div class="turn-block">
    <EButton
      type="success"
      @click="onClick"
    >
      转办
    </EButton>

    <!-- 转办弹窗 -->
    <el-dialog
      class="dialog"
      show-close
      :close-on-click-modal="false"
      append-to-body
      destroy-on-close
      title="工单转办"
      :visible="dialog_turn"
      width="40%"
      @close="dialog_turn = false"
    >
      <el-form
        ref="turnForm"
        :model="turnForm"
        :rules="turnRules"
        label-width="100px"
        size="mini"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="转办人员"
              prop="transferToUserId"
            >
              <el-select
                v-model="turnForm.transferToUserId"
                placeholder="请指定转办人员"
                style="width: 100%"
                filterable
                @change="userFn"
              >
                <el-option
                  v-for="item in userList"
                  :key="item.id"
                  :label="item.fullName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="转办理由"
              prop="transferReason"
            >
              <el-input
                v-model="turnForm.transferReason"
                type="textarea"
                :rows="6"
                placeholder="请描述转办理由"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="onClose">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="turnDone"
        >
          确认转办
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.turn-block {
  margin: 0 10px;
}

.dialog {
  z-index: 99;
}
</style>
