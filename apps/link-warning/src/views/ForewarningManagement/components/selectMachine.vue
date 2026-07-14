<script>
import SharedSelectMachine from '@link/shared-ui/forewarning-management/select-machine'
import { allMachineList, machineList } from '@/http/videoWarning/warning-api'

export default {
  name: 'SelectMachine',
  components: { SharedSelectMachine },
  inheritAttrs: false,
  props: {
    value: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    return {
      allMachineListApi: allMachineList,
      machineListApi: machineList,
    }
  },
}
</script>

<template>
  <SharedSelectMachine
    v-bind="$attrs"
    :value="value"
    :type="type"
    :disabled="disabled"
    :all-machine-list-api="allMachineListApi"
    :machine-list-api="machineListApi"
    v-on="$listeners"
  />
</template>
