<script>
import { is } from 'kaka-bpmn/lib/util/ModelUtil'

import TaskListener from './parts/TaskListener'

export default {
  components: {
    TaskListener,
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
      <span class="title"> 任务监听器<i class="header-icon el-icon-info" /> </span>
    </template>

    <TaskListener
      :element="element"
      :bpmnModeler="bpmnModeler"
    />
  </el-collapse-item>
</template>
