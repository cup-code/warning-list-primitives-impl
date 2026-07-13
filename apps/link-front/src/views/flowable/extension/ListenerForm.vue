<script>
import {
  extensionListenerSave,
  getExtensionListenerById,
} from '@/http/safe-production/flowable-api'

export default {
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      loading: false,
      listenerTab: '0',
      valueLabel: '类',
      events: [
        { label: 'start', value: 'start' },
        { label: 'take', value: 'take' },
        { label: 'end', value: 'end' },
      ],
      inputForm: {
        id: '',
        name: '',
        listenerType: '1',
        event: '',
        valueType: '1',
        value: '',
      },
    }
  },
  watch: {
    'inputForm.listenerType': function (val) {
      if (val === '1') {
        this.inputForm.event = ''
        this.events = [
          { label: 'start', value: 'start' },
          { label: 'take', value: 'take' },
          { label: 'end', value: 'end' },
        ]
      }
      else {
        this.inputForm.event = ''
        this.events = [
          { label: 'start', value: 'start' },
          { label: 'assignment', value: 'assignment' },
          { label: 'complete', value: 'complete' },
          { label: 'delete', value: 'delete' },
        ]
      }
    },
    'inputForm.valueType': function (val) {
      if (val === '1') {
        this.valueLabel = '类'
      }
      else if (val === '2') {
        this.valueLabel = '表达式'
      }
      else {
        this.valueLabel = '委托表达式'
      }
    },
  },
  methods: {
    init(method, id) {
      this.method = method
      this.inputForm.id = id
      if (method === 'add') {
        this.title = `新建监听器`
      }
      else if (method === 'edit') {
        this.title = '修改监听器'
      }
      else if (method === 'view') {
        this.title = '查看监听器'
      }
      this.visible = true
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        this.listenerTab = '0'
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          getExtensionListenerById(this.inputForm.id).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.listener)
          })
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          extensionListenerSave(this.inputForm)
            .then(({ data }) => {
              if (data && data.success) {
                this.visible = false
                this.$message.success(data.msg)
                this.$emit('refreshDataList')
              }
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
  <div>
    <el-dialog
      class="dialog-listenerForm-extension-flowable"
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
        @keyup.enter.native="doSubmit()"
        @submit.native.prevent
      >
        <el-row :gutter="15">
          <el-col :span="24">
            <el-form-item
              label="名称"
              prop="name"
              :rules="[{ required: true, message: '名称不能为空', trigger: 'blur' }]"
            >
              <el-input
                v-model="inputForm.name"
                placeholder="请填写名称"
              />
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item
              label="监听器类型"
              prop="listenerType"
              :rules="[
                {
                  required: true,
                  message: '监听器类型不能为空',
                  trigger: 'blur',
                },
              ]"
            >
              <el-radio-group v-model="inputForm.listenerType">
                <el-radio label="1">
                  执行监听器
                </el-radio>
                <el-radio label="2">
                  任务监听器
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item
              label="事件"
              prop="event"
              :rules="[{ required: true, message: '事件不能为空', trigger: 'blur' }]"
            >
              <el-select
                v-model="inputForm.event"
                placeholder="请选择"
                style="width: 100%"
              >
                <el-option
                  v-for="item in events"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item
              label="值类型"
              prop="valueType"
              :rules="[{ required: true, message: '值类型不能为空', trigger: 'blur' }]"
            >
              <el-radio-group v-model="inputForm.valueType">
                <el-radio label="1">
                  类
                </el-radio>
                <el-radio label="2">
                  表达式
                </el-radio>
                <el-radio label="3">
                  委托表达式
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>

          <el-col :span="24">
            <el-form-item
              :label="valueLabel"
              prop="value"
              :rules="[{ required: true, message: '值不能为空', trigger: 'blur' }]"
            >
              <el-input
                v-model="inputForm.value"
                placeholder="请填写值"
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
          size="mini"
          @click="visible = false"
        >关闭</el-button>
        <el-button
          v-if="method != 'view'"
          v-noMoreClick
          size="mini"
          type="primary"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.dialog-listenerForm-extension-flowable {
  .el-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: calc(100% - 30px);
    max-width: calc(100% - 30px);
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    .el-dialog__header {
      border-bottom: 1px solid #e8e8e8;
    }
    .el-dialog__body {
      overflow: auto;
    }
    .el-dialog__footer {
      border-top: 1px solid #e8e8e8;
      border-radius: 0 0 4px 4px;
    }
  }
}
</style>
