<script>
import eventDefinitionHelper from 'bpmn-js-properties-panel/lib/helper/EventDefinitionHelper'
import { isAny } from 'kaka-bpmn/lib/features/modeling/util/ModelingUtil'
import { getBusinessObject, is } from 'kaka-bpmn/lib/util/ModelUtil'

import Conditional from './parts/Conditional'

export default {
  components: {
    Conditional,
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
      if (this.element && getBusinessObject(this.element)) {
        const conditionalEventDefinition = eventDefinitionHelper.getConditionalEventDefinition(
          this.element,
        )

        if (
          !(
            is(this.element, 'bpmn:SequenceFlow') && this.isConditionalSource(this.element.source)
          )
          && !conditionalEventDefinition
        ) {
          return false
        }
        else {
          return true
        }
      }
      else {
        return false
      }
    },
  },
  methods: {
    isConditionalSource(element) {
      const CONDITIONAL_SOURCES = [
        'bpmn:Activity',
        'bpmn:StartEvent',
        'bpmn:ExclusiveGateway',
        'bpmn:InclusiveGateway',
        'bpmn:ComplexGateway',
      ]
      return isAny(element, CONDITIONAL_SOURCES)
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
      <span class="title"> 流转条件<i class="header-icon el-icon-info" /> </span>
    </template>

    <Conditional
      :element="element"
      :bpmnModeler="bpmnModeler"
    />
  </el-collapse-item>
</template>
