<script>
import { getPlanRemindById, setPlanRemind } from '@/http/inspection/yx-inspection-api'

export default {
  name: 'YxInspectionPlanMessageSet',
  props: {
    id: String,
    method: String,
  },
  data: () => ({
    loading: false,
    inputForm: {
      remindAfterEnd: true, // 结束后提醒
      remindAfterStart: true, // 开始后提醒
      remindBeforeEnd: true, // 结束前提醒
      remindBeforeStart: true, // 开始前提醒
      sendPlatformMessage: true, // 站内消息
      sendTextMessage: false, // 短信提醒
    },
  }),
  watch: {
    id: {
      immediate: true,
      handler(val) {
        if (val && val !== 'null') {
          this.getMessageSet()
        }
      },
    },
  },
  methods: {
    // 获取提醒设置
    async getMessageSet() {
      if (!this.id || this.id === 'null') return
      this.loading = true
      try {
        const { data } = await getPlanRemindById(this.id)
        this.loading = false
        if (data.success && data.result) {
          this.inputForm = {
            ...this.inputForm,
            remindAfterEnd: data.result.remindAfterEnd ?? true,
            remindAfterStart: data.result.remindAfterStart ?? true,
            remindBeforeEnd: data.result.remindBeforeEnd ?? true,
            remindBeforeStart: data.result.remindBeforeStart ?? true,
            sendPlatformMessage: data.result.sendPlatformMessage ?? true,
            sendTextMessage: data.result.sendTextMessage ?? false,
          }
        }
      } catch (error) {
        this.loading = false
      }
    },
    // 保存消息设置
    async saveMessageSet() {
      if (!this.id || this.id === 'null') {
        this.$message.warning('请先保存计划基础信息')
        return
      }
      this.loading = true
      try {
        const { data } = await setPlanRemind(this.id, this.inputForm)
        this.loading = false
        if (data.success) {
          this.$message.success(data.message || '保存成功')
        } else {
          this.$message.error(data.message || '保存失败')
        }
      } catch (error) {
        this.loading = false
        this.$message.error('保存失败')
      }
    },
    backFn() {
      this.$router.back(-1)
    },
  },
}
</script>

<template>
  <div v-loading="loading" class="message-set">
    <div class="btnArea">
      <el-button
        type="primary"
        :disabled="method === 'view'"
        @click="saveMessageSet"
      >
        保存
      </el-button>
      <el-button @click="backFn">
        返回
      </el-button>
    </div>

    <el-form
      :model="inputForm"
      label-width="100px"
      inline
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <el-row class="title">
        提醒方式
      </el-row>

      <el-row>
        <el-form-item label="站内消息" prop="sendPlatformMessage">
          <el-radio-group v-model="inputForm.sendPlatformMessage">
            <el-radio-button :label="true">是</el-radio-button>
            <el-radio-button :label="false">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="短信提醒" prop="sendTextMessage">
          <el-radio-group v-model="inputForm.sendTextMessage">
            <el-radio-button :label="true">是</el-radio-button>
            <el-radio-button :label="false">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-row>

      <el-row class="title">
        提醒时机
      </el-row>

      <el-row>
        <el-form-item label="开始前提醒" prop="remindBeforeStart">
          <el-radio-group v-model="inputForm.remindBeforeStart">
            <el-radio-button :label="true">是</el-radio-button>
            <el-radio-button :label="false">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="开始后提醒" prop="remindAfterStart">
          <el-radio-group v-model="inputForm.remindAfterStart">
            <el-radio-button :label="true">是</el-radio-button>
            <el-radio-button :label="false">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-row>

      <el-row>
        <el-form-item label="结束前提醒" prop="remindBeforeEnd">
          <el-radio-group v-model="inputForm.remindBeforeEnd">
            <el-radio-button :label="true">是</el-radio-button>
            <el-radio-button :label="false">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="结束后提醒" prop="remindAfterEnd">
          <el-radio-group v-model="inputForm.remindAfterEnd">
            <el-radio-button :label="true">是</el-radio-button>
            <el-radio-button :label="false">否</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-row>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.message-set {
  height: 80vh;
  overflow: auto;
  padding: 0 20px;
}
.btnArea {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}
.title {
  font-weight: bold;
  font-size: 16px;
  line-height: 30px;
  padding-left: 12px;
  text-align: left;
  margin: 10px 0;
}
.ml-2 {
  margin-left: 8px;
}
</style>