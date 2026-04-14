<script>
import { useQuery } from '@tanstack/vue-query'
import { ref, watch } from 'vue'
import { allMachineList, machineList } from '@/http/videoWarning/warning-api'

export default {
  name: 'SelectMachine',
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
  setup(props, { emit }) {
    const machineLists = ref([])
    const machineName = ref('')

    const { refetch } = useQuery({
      queryKey: ['machineList'],
      queryFn: () =>
        props.type === 'all'
          ? allMachineList({ isPage: false })
          : machineList({ isPage: false }),
      onSuccess: ({ data }) => {
        if (data.success) {
          machineLists.value = props.type === 'all' ? data.result : data.result.list
        }
      },
    })

    watch(
      () => props.value,
      (newVal) => {
        machineName.value = newVal
      },
      { immediate: true },
    )

    watch(
      machineLists,
      (newVal) => {
        if (newVal.length > 0) {
          machineName.value = newVal.find(
            items => items.id === props.value,
          )?.machineName
        }
      },
      { immediate: true },
    )

    const onChangeMachine = (item) => {
      const machine = machineLists.value.find(items => items.id === item)
      machineName.value = item
      emit('change', machine)
    }

    return {
      machineLists,
      machineName,
      onChangeMachine,
    }
  },
}
</script>

<template>
  <div>
    <el-select
      v-model="machineName"
      clearable
      placeholder="请选择所属一体机"
      :disabled="disabled"
      @change="onChangeMachine"
    >
      <el-option
        v-for="item in machineLists"
        :key="item.id"
        :label="item.machineName"
        :value="item.id"
      />
    </el-select>
  </div>
</template>
