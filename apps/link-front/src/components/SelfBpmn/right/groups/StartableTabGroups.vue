<script>
import { is } from 'kaka-bpmn/lib/util/ModelUtil'

import StartableUsers from './parts/StartableUsers'

export default {
  components: {
    StartableUsers,
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
      if (this.element && is(this.element, 'bpmn:Process')) {
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
      <span class="title"> 权限设置<i class="header-icon el-icon-info" /> </span>
    </template>

    <StartableUsers
      :element="element"
      :bpmnModeler="bpmnModeler"
    />
  </el-collapse-item>
</template>
