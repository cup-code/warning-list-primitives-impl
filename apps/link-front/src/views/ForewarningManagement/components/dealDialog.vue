<template>
  <SharedDealDialog
    v-bind="$attrs"
    v-on="$listeners"
    :batch-attention-alarm="batchAttentionAlarm"
    :batch-attention-alarm-internal="batchAttentionAlarmInternal"
  />
</template>

<script>
import SharedDealDialog from '@link/shared-ui/forewarning-management/deal-dialog'
import {
  batchAttentionAlarm,
  batchAttentionAlarmInternal,
} from '@/http/videoWarning/warning-api'

export default {
  name: 'DealDialogAdapter',
  components: { SharedDealDialog },
  inheritAttrs: false,
  methods: {
    batchAttentionAlarm,
    batchAttentionAlarmInternal,
  },
}
</script>
