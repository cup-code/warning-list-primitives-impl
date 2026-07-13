<script>
import { is } from 'kaka-bpmn/lib/util/ModelUtil'
import UserTasks from './parts/UserTasks'

export default {
  components: {
    UserTasks,
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
      if (this.element && is(this.element, 'flowable:Assignable')) {
        return true
      }
      else {
        return false
      }
      // return true
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
      <span class="title">审核者</span>
      <i class="header-icon el-icon-info" />
    </template>

    <UserTasks
      :element="element"
      :bpmnModeler="bpmnModeler"
    />
  </el-collapse-item>
</template>
