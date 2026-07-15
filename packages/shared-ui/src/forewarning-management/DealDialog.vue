<script>
import { useMutation } from '@tanstack/vue-query'
import {
  computed,
  getCurrentInstance,
  ref,
} from 'vue'
import {
  buildBatchDealParams,
  getBatchDealCopy,
  getBatchDealOptions,
  selectBatchDealApi,
} from '@link/warning-feature/batch-deal'

export default {
  name: 'DealDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    userType: {
      type: String,
      default: 'InternalStatus', // 默认为内部审核状态
    },
    selectedWarnings: {
      type: Array,
      default: () => [],
    },
    batchAttentionAlarm: {
      type: Function,
      required: true,
    },
    batchAttentionAlarmInternal: {
      type: Function,
      required: true,
    },
  },
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const formRef = ref(null)
    const isPending = ref(false)
    const formData = ref({
      auditRes: '',
      opinion: '',
    })

    const auditResList = computed(() => getBatchDealOptions(props.userType))
    const dialogTitle = computed(() => getBatchDealCopy(props.userType).title)

    // 对话框可见性控制
    const dialogVisible = computed({
      get: () => props.visible,
      set: val => emit('update:visible', val),
    })

    // 单选按钮变更处理
    const radioChange = (val) => {
      formData.value.auditRes = val
    }

    // 取消操作
    const handleCancel = () => {
      dialogVisible.value = false
      formData.value = {
        auditRes: '',
        opinion: '',
      }
    }

    // 关闭对话框时重置表单
    const handleClose = () => {
      formData.value = {
        auditRes: '',
        opinion: '',
      }
      emit('close')
    }

    const { mutate: batchAttentionAlarmFn } = useMutation({
      mutationFn: params => selectBatchDealApi(props.userType, {
        batchAttentionAlarm: props.batchAttentionAlarm,
        batchAttentionAlarmInternal: props.batchAttentionAlarmInternal,
      })(params),
      onSuccess: ({ data }) => {
        if (data.code === 200) {
          vm.$message.success(getBatchDealCopy(props.userType).success)
          emit('success')
          handleCancel()
        }
        else {
          vm.$message.error(data.message)
        }
      },
      onError: (error) => {
        console.log(error, 'error')
        vm.$message.error(error.response.data.message)
      },
    })

    // 提交处理/审核结果
    const handleSubmit = (submitType) => {
      if (!formData.value.auditRes) {
        vm.$message.error(getBatchDealCopy(props.userType).resultRequired)
        return
      }

      const params = buildBatchDealParams({
        selectedWarnings: props.selectedWarnings,
        auditRes: formData.value.auditRes,
        opinion: formData.value.opinion,
        userType: props.userType,
        submitType,
      })

      console.log(params, 'params')

      batchAttentionAlarmFn(params)
    }

    return {
      formRef,
      formData,
      auditResList,
      dialogTitle,
      dialogVisible,
      isPending,
      radioChange,
      handleCancel,
      handleClose,
      handleSubmit,
    }
  },
}
</script>

<template>
  <el-dialog
    :visible.sync="dialogVisible"
    :title="dialogTitle"
    width="500px"
    :close-on-click-modal="false"
    class="normal-dialog"
    destroy-on-close
    @close="handleCancel"
  >
    <div class="batch-deal-container">
      <div class="warning-count">
        <span>
          已选择 <b>{{ selectedWarnings.length }}</b> 条预警信息
        </span>
      </div>

      <el-form ref="formRef" :model="formData" label-width="66px" size="small">
        <el-form-item :label="userType === 'CustomerStatus' ? '处理结果:' : '审核结果:'">
          <el-radio-group v-model="formData.auditRes" @input="radioChange">
            <el-radio v-for="item in auditResList" :key="item.value" :label="item.value">
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="处理意见:">
          <el-input
            v-model="formData.opinion"
            type="textarea"
            :rows="4"
            placeholder="请输入处理意见"
          />
        </el-form-item>
      </el-form>
    </div>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">
        取消
      </el-button>
      <el-button type="primary" :loading="isPending" @click="handleSubmit('1')">
        {{ userType === "CustomerStatus" ? "确认" : "提交审核" }}
      </el-button>
      <el-button
        v-if="userType !== 'CustomerStatus'"
        type="primary"
        :disabled="formData.auditRes !== '2'"
        @click="handleSubmit('2')"
      >
        加急处理
      </el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.batch-deal-container {
  padding: 0 10px;

  .warning-count {
    margin-bottom: 15px;
    font-size: 14px;

    b {
      color: var(--ky-primary);
      font-weight: bold;
    }
  }
}

::v-deep .el-radio {
  margin-right: 15px !important;

  &:last-child {
    margin-right: 0 !important;
  }
}

::v-deep .el-form-item {
  margin-bottom: 20px;
}
</style>
