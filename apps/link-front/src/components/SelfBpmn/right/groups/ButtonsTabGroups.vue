<script>
import { is } from 'kaka-bpmn/lib/util/ModelUtil'
import ButtonsTable from './parts/ButtonsTable'

export default {
  components: {
    ButtonsTable,
  },
  props: {
    element: {
      type: Object,
      default: undefined,
    },
    bpmnModeler: {
      type: Object,
      default: undefined,
    },
    name: '',
  },
  computed: {
    enable() {
      if (this.element && is(this.element, 'bpmn:UserTask')) {
        return true
      }
      else {
        return false
      }
    },
  },
}
</script>

<template>
  <el-collapse-item
    v-if="enable"
    :name="name"
  >
    <template slot="title">
      <span class="title"> 按钮配置<i class="header-icon el-icon-info" /> </span>
    </template>

    <ButtonsTable
      :element="element"
      :bpmnModeler="bpmnModeler"
    />
  </el-collapse-item>
</template>
