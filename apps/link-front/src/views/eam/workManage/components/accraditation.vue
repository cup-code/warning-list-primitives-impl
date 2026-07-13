<script>
import FileUpload from '@/views/common-ui/FileUpload'

export default {
  name: 'DealDialog',
  components: { FileUpload },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      formInfo: {},
      rules: {
        repairs: [{ required: true, message: '请选择处理人员', trigger: 'change' }],
        desc: [{ required: true, message: '请输入审批意见', trigger: 'blur' }],
      },
      repairman: [
        { label: '张班长', value: '1' },
        { label: '赵良', value: '2' },
        { label: '蒋湘芝', value: '3' },
      ],
    }
  },
  methods: {
    onConfirm() {
      this.$emit('confirm', this.formInfo)
      this.onClose()
    },
    onClose() {
      this.$emit('update:visible', false)
      this.formInfo = {}
    },
  },
}
</script>

<template>
  <el-dialog
    :visible="visible"
    width="70%"
    :close-on-click-modal="false"
    show-close
    @close="onClose"
  >
    <h2 slot="title">
      工单审批
    </h2>
    <el-form
      ref="faultForm"
      :rules="rules"
      :model="formInfo"
      label-width="70px"
      label-positin="left"
      class="fault-message"
    >
      <el-form-item
        prop="repairs"
        class="fault-item"
        label="处理人员"
      >
        <el-select
          v-model="formInfo.repairs"
          placeholder="请选择处理人员"
        >
          <el-option
            v-for="(item, index) in repairman"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        prop="desc"
        class="fault-item"
        style="width: 100%; padding: 6px 24px 6px 6px"
        label="审批意见"
      >
        <el-input
          v-model="formInfo.desc"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 4 }"
        />
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
        审批通过
      </EButton>
      <EButton
        plain
        @click="onClose"
      >
        驳回
      </EButton>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
h2 {
  margin: 0;
}
.selected {
  padding: 0 0 18px;
  color: var(--ky-primary);
}
</style>
