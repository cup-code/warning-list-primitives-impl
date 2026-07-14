<script>
import { useQuery } from '@tanstack/vue-query'
import { ref, watch } from 'vue'
import {
  createMachineListQuery,
  extractMachineList,
  findMachine,
  findMachineName,
} from './selectMachineLogic.js'

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
    allMachineListApi: {
      type: Function,
      required: true,
    },
    machineListApi: {
      type: Function,
      required: true,
    },
  },
  setup(props, { emit }) {
    const machineLists = ref([])
    const machineName = ref('')
    const isAll = props.type === 'all'

    useQuery({
      queryKey: ['machineList', props.type],
      queryFn: createMachineListQuery(
        props.type,
        props.allMachineListApi,
        props.machineListApi,
      ),
      onSuccess: (response) => {
        const machines = extractMachineList(response, isAll)
        if (machines !== undefined) {
          machineLists.value = machines
        }
      },
    })

    watch(
      () => props.value,
      (newValue) => {
        machineName.value = newValue
      },
      { immediate: true },
    )

    watch(
      machineLists,
      (newValue) => {
        if (newValue.length > 0) {
          machineName.value = findMachineName(newValue, props.value)
        }
      },
      { immediate: true },
    )

    const onChangeMachine = (value) => {
      const machine = findMachine(machineLists.value, value)
      machineName.value = value
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
