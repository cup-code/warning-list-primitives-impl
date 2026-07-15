<template>
  <SharedBatchDeal
    v-bind="$attrs"
    v-on="$listeners"
    :batch-attention-alarm="batchAttentionAlarm"
    :batch-attention-alarm-internal="batchAttentionAlarmInternal"
  />
</template>

<script>
import SharedBatchDeal from '@link/shared-ui/forewarning-management/batch-deal'
import {
  batchAttentionAlarm,
  batchAttentionAlarmInternal,
} from '@/http/videoWarning/warning-api'

export default {
  name: 'BatchDealAdapter',
  components: { SharedBatchDeal },
  inheritAttrs: false,
  methods: {
    batchAttentionAlarm,
    batchAttentionAlarmInternal,
  },
}
</script>
