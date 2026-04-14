<script>
import AiHelper from '@/components/AIHelper/aiHelper.vue'
import { addNeWWork } from '@/http/workmanage/work-api'
import FileUpload from '@/views/common-ui/FileUpload'
import TurnTo from './turnTo.vue'

export default {
  name: 'DealDialog',
  components: { FileUpload, AiHelper, TurnTo },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    dialogInfos: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      formInfo: {},
      fileProp: {},
      editable: true,
      temporaryFiles: [],
      rules: {
        workOrderType: [{ required: true, message: '请选择工单类型', trigger: 'change' }],
        dealMeasure: [{ required: true, message: '请描述处置措施', trigger: 'blur' }],
      },
    }
  },
  watch: {
    visible: {
      handler(e) {
        this.formInfo = e ? { ...this.dialogInfos } : {}
      },
      deep: true,
    },
  },
  methods: {
    onConfirm() {
      this.$refs.faultForm.validate((valid) => {
        if (valid) {
          const params = { ...this.formInfo }
          addNeWWork(params)
            .then((res) => {
              const { data } = res
              if (data.success) {
                this.$message.success(`处理成功`)
                this.$emit('confirm')
                this.onClose()
              }
              else {
                this.$message.warning(`处理警告，${data.message}`)
              }
            })
            .catch((err) => {
              this.$message.error(`处理失败，${err.message}`)
            })
        }
      })
    },
    onClose() {
      this.$emit('update:visible', false)
      this.$refs.faultForm.resetFields()
      this.$emit('close')
    },

    //   // 文件回调
    //   uploadEvt(fileList, fileType) {
    //     this.temporaryFiles[fileType] = fileList
    //   }
  },
}
</script>

<template>
  <el-dialog
    :visible="visible"
    width="70%"
    destroy-on-close
    :close-on-click-modal="false"
    show-close
    @close="onClose"
  >
    <div
      slot="title"
      class="text-lg font-semibold"
    >
      工单处理
    </div>
    <el-form
      ref="faultForm"
      :rules="rules"
      :model="formInfo"
      label-width="100px"
      label-positin="left"
      class="fault-message"
    >
      <el-form-item
        prop="workOrderNum"
        class="fault-item"
        label="工单编号"
      >
        <el-input
          v-model="formInfo.workOrderNum"
          disabled
          placeholder=""
        />
      </el-form-item>
      <el-form-item
        prop="createdTime"
        class="fault-item"
        label="创建时间"
      >
        <el-input
          v-model="formInfo.createdTime"
          disabled
          placeholder="请输入报修名称"
        />
      </el-form-item>
      <el-form-item
        prop="dealUserName"
        class="fault-item"
        label="处理人员"
      >
        <el-input
          v-model="formInfo.dealUserName"
          disabled
          placeholder="请选择处理人员"
          readonly
        />
      </el-form-item>
      <el-form-item
        prop="faultDesc"
        class="fault-item"
        style="width: 100%; padding: 6px 24px 6px 6px"
        label="故障描述"
      >
        <el-input
          v-model="formInfo.faultDesc"
          type="textarea"
          disabled
          :autosize="{ minRows: 6, maxRows: 6 }"
          placeholder="请描述故障信息"
        />
      </el-form-item>
      <el-form-item
        label="工单类型"
        prop="workOrderType"
      >
        <el-radio-group v-model="formInfo.workOrderType">
          <el-radio
            v-for="item in $dictUtils.getDictList('back_type')"
            :key="item.dictCode"
            :label="item.dictName"
          />
        </el-radio-group>
      </el-form-item>
      <el-form-item
        prop="dealMeasure"
        class="fault-item"
        style="width: 100%; padding: 6px 24px 6px 6px"
        label="处置措施"
      >
        <el-input
          v-model="formInfo.dealMeasure"
          class="relative"
          type="textarea"
          :autosize="{ minRows: 6, maxRows: 6 }"
          placeholder="请描述处置措施"
        />
        <div class="flex-center absolute left-full top-0 pl-2 text-left">
          <AiHelper :info="formInfo.faultDesc" />
        </div>
      </el-form-item>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <EButton
        type="primary"
        @click="onConfirm"
      >
        处理
      </EButton>
      <TurnTo :info="dialogInfos" />
      <EButton
        plain
        @click="onClose"
      >
        取消
      </EButton>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
h2 {
  margin: 0;
}

.fault-message {
  width: 600px;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.selected {
  padding: 0 0 18px;
  color: var(--ky-primary);
}
</style>
