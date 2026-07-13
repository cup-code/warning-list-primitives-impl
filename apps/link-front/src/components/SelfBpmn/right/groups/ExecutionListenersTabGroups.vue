<script>
import { is } from 'kaka-bpmn/lib/util/ModelUtil'

import ExecuteAction from './parts/ExecuteAction'

export default {
  components: {
    ExecuteAction,
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
  data() {
    return {
      allowedIn: [
        'bpmn:Task',
        'bpmn:ServiceTask',
        'bpmn:UserTask',
        'bpmn:BusinessRuleTask',
        'bpmn:ScriptTask',
        'bpmn:ReceiveTask',
        'bpmn:ManualTask', //  'bpmn:ExclusiveGateway',
        'bpmn:SequenceFlow', //  'bpmn:ParallelGateway',
        //  'bpmn:InclusiveGateway',
        //  'bpmn:EventBasedGateway',
        'bpmn:StartEvent',
        'bpmn:IntermediateCatchEvent',
        'bpmn:IntermediateThrowEvent',
        'bpmn:EndEvent',
        'bpmn:BoundaryEvent',
        'bpmn:CallActivity',
        'bpmn:SubProcess',
        'bpmn:Process',
      ],
    }
  },
  computed: {
    enable() {
      let enable = false
      this.allowedIn.forEach((item) => {
        if (is(this.element, item)) {
          enable = true
        }
      })
      return enable
    },
  },
  methods: {},
}
</script>

<template>
  <el-collapse-item
    v-if="enable"
    :name="name"
  >
    <template slot="title">
      <span class="title"> 执行监听器<i class="header-icon el-icon-info" /> </span>
    </template>

    <ExecuteAction
      :element="element"
      :bpmnModeler="bpmnModeler"
    />
  </el-collapse-item>
</template>
