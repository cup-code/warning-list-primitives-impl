<script>
import { getPlanMessageSetFn, saveMessageSetFn } from '@/http/dev_new/inspection-api'

export default {
  props: {
    id: String,
    method: String,
  },
  data() {
    return {
      inputForm: {
        remindAfterEnd: true, // 是否结束后提醒
        remindAfterStart: true, // 是否开始后提醒
        remindBeforeEnd: true, // 是否结束前提醒
        remindBeforeStart: true, // 是否开始前提醒
        sendPlatformMessage: true, // 是否消息提醒
        sendTextMessage: true, // 是否短信提醒
      },
    }
  },
  mounted() {
    // 获取计划的路线信息
    // 获取计划的基础信息
    if (this.id !== 'null') {
      this.getPlanMessageSet()
    }
  },
  methods: {
    // 获取数据列表
    getPlanMessageSet() {
      getPlanMessageSetFn(this.id).then(({ data }) => {
        if (data.success) {
          this.inputForm = this.recover(this.inputForm, data.result)
        }
        else {
          this.$message.error(data.message || '获取消息设置失败')
        }
      })
    },
    // 保存消息设置
    saveMessageSet() {
      if (this.id === 'null') {
        this.$message.error('请先保存计划基础信息')
        return
      }
      saveMessageSetFn(this.id, this.inputForm).then(({ data }) => {
        if (data.success) {
          this.$message.success(data.message || '保存成功')
        }
      })
    },
    backFn() {
      this.$router.back(-1)
    },
  },
}
</script>

<template>
  <div class="contentArea">
    <el-row>
      <el-col
        :span="24"
        class="btnArea"
      >
        <el-button
          type="primary"
          :disabled="method === 'view'"
          @click="saveMessageSet"
        >
          保存
        </el-button>
        <el-button
          style="margin-left: 10px"
          @click="backFn"
        >
          返回
        </el-button>
      </el-col>
    </el-row>
    <el-form
      :model="inputForm"
      label-width="80px"
      inline
      @submit.native.prevent
    >
      <el-form-item
        label="消息提醒"
        prop="sendPlatformMessage"
      >
        <el-radio-group v-model="inputForm.sendPlatformMessage">
          <el-radio-button :label="true">
            是
          </el-radio-button>
          <el-radio-button :label="false">
            否
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="短信提醒"
        prop="sendTextMessage"
      >
        <el-radio-group v-model="inputForm.sendTextMessage">
          <el-radio-button :label="true">
            是
          </el-radio-button>
          <el-radio-button :label="false">
            否
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="开始前提醒"
        prop="remindBeforeStart"
      >
        <el-radio-group v-model="inputForm.remindBeforeStart">
          <el-radio-button :label="true">
            是
          </el-radio-button>
          <el-radio-button :label="false">
            否
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <br>
      <el-form-item
        label="开始后提醒"
        prop="remindAfterStart"
      >
        <el-radio-group v-model="inputForm.remindAfterStart">
          <el-radio-button :label="true">
            是
          </el-radio-button>
          <el-radio-button :label="false">
            否
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="结束前提醒"
        prop="remindBeforeEnd"
      >
        <el-radio-group v-model="inputForm.remindBeforeEnd">
          <el-radio-button :label="true">
            是
          </el-radio-button>
          <el-radio-button :label="false">
            否
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="结束后提醒"
        prop="remindAfterEnd"
      >
        <el-radio-group v-model="inputForm.remindAfterEnd">
          <el-radio-button :label="true">
            是
          </el-radio-button>
          <el-radio-button :label="false">
            否
          </el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.btnArea {
  display: flex;
  justify-content: flex-end;
}
</style>
