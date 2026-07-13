<script>
import eventDefinitionHelper from 'bpmn-js-properties-panel/lib/helper/EventDefinitionHelper'
import { is } from 'kaka-bpmn/lib/util/ModelUtil'

import CompensateEventDefinition from './parts/CompensateEventDefinition'
import ErrorEventDefinition from './parts/ErrorEventDefinition'
import EscalationEventDefinition from './parts/EscalationEventDefinition'
import MessageEventDefinition from './parts/MessageEventDefinition'
import SignalEventDefinition from './parts/SignalEventDefinition'
import TimerEventDefinition from './parts/TimerEventDefinition'

export default {
  components: {
    Message: MessageEventDefinition,
    Signal: SignalEventDefinition,
    Error: ErrorEventDefinition,
    Escalation: EscalationEventDefinition,
    Timer: TimerEventDefinition,
    Compensation: CompensateEventDefinition,
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
      title: '',
      timerEventDefinition: null,
    }
  },
  computed: {
    enableMessage() {
      const events = [
        'bpmn:StartEvent',
        'bpmn:EndEvent',
        'bpmn:IntermediateThrowEvent',
        'bpmn:BoundaryEvent',
        'bpmn:IntermediateCatchEvent',
      ]
      let enable = false
      events.forEach((item) => {
        if (is(this.element, item)) {
          const messageEventDefinition = eventDefinitionHelper.getMessageEventDefinition(this.element)

          if (messageEventDefinition) {
            enable = true
          }
        }
      })
      return enable
    },
    enableSignal() {
      const events = [
        'bpmn:StartEvent',
        'bpmn:EndEvent',
        'bpmn:IntermediateThrowEvent',
        'bpmn:BoundaryEvent',
        'bpmn:IntermediateCatchEvent',
      ]
      let enable = false
      events.forEach((item) => {
        if (is(this.element, item)) {
          const signalEventDefinition = eventDefinitionHelper.getSignalEventDefinition(this.element)

          if (signalEventDefinition) {
            enable = true
          }
        }
      })
      return enable
    },
    enableReciveTask() {
      let enable = false

      if (is(this.element, 'bpmn:ReceiveTask')) {
        enable = true
      }

      return enable
    },
    enableError() {
      const errorEvents = ['bpmn:StartEvent', 'bpmn:BoundaryEvent', 'bpmn:EndEvent']
      let enable = false
      errorEvents.forEach((item) => {
        if (is(this.element, item)) {
          this.errorEventDefinition = eventDefinitionHelper.getErrorEventDefinition(this.element)

          if (this.errorEventDefinition) {
            enable = true
          }
        }
      })
      return enable
    },
    enableEscalation() {
      const escalationEvents = [
        'bpmn:StartEvent',
        'bpmn:BoundaryEvent',
        'bpmn:IntermediateThrowEvent',
        'bpmn:EndEvent',
      ]
      let enable = false
      escalationEvents.forEach((item) => {
        if (is(this.element, item)) {
          // var showEscalationCodeVariable = is(this.element, 'bpmn:StartEvent') || is(this.element, 'bpmn:BoundaryEvent')
          // get business object
          const escalationEventDefinition = eventDefinitionHelper.getEscalationEventDefinition(
            this.element,
          )

          if (escalationEventDefinition) {
            enable = true
          }
        }
      })
      return enable
    },
    enableTime() {
      let enable = false
      const timerEvents = ['bpmn:StartEvent', 'bpmn:BoundaryEvent', 'bpmn:IntermediateCatchEvent']
      timerEvents.forEach((item) => {
        if (is(this.element, item)) {
          this.timerEventDefinition = eventDefinitionHelper.getTimerEventDefinition(this.element)

          if (this.timerEventDefinition) {
            this.title = '边界时间属性设置'
            enable = true
          }
        }
      })
      return enable
    },
    enableCompensationEvents() {
      const compensationEvents = ['bpmn:EndEvent', 'bpmn:IntermediateThrowEvent']
      let enable = false
      compensationEvents.forEach((item) => {
        if (is(this.element, item)) {
          const compensateEventDefinition = eventDefinitionHelper.getCompensateEventDefinition(
            this.element,
          )

          if (compensateEventDefinition) {
            enable = true
          }
        }
      })
      return enable
    },
    enable() {
      return (
        this.enableMessage
        || this.enableSignal
        || this.enableReciveTask
        || this.enableError
        || this.enableEscalation
        || this.enableTime
        || this.enableCompensationEvents
      )
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
      <span class="title"> {{ title }}<i class="header-icon el-icon-info" /> </span>
    </template>

    <Message
      v-if="enableMessage"
      :element="element"
      :bpmnModeler="bpmnModeler"
      :timerEventDefinition="timerEventDefinition"
    />

    <Signal
      v-if="enableSignal"
      :element="element"
      :bpmnModeler="bpmnModeler"
      :timerEventDefinition="timerEventDefinition"
    />

    <Message
      v-if="enableReciveTask"
      :element="element"
      :bpmnModeler="bpmnModeler"
      :timerEventDefinition="timerEventDefinition"
    />

    <Error
      v-if="enableError"
      :element="element"
      :bpmnModeler="bpmnModeler"
      :errorEventDefinition="errorEventDefinition"
    />

    <Escalation
      v-if="enableEscalation"
      :element="element"
      :bpmnModeler="bpmnModeler"
      :timerEventDefinition="timerEventDefinition"
    />

    <Timer
      v-if="enableTime"
      :element="element"
      :bpmnModeler="bpmnModeler"
      :timerEventDefinition="timerEventDefinition"
    />

    <Compensation
      v-if="enableCompensationEvents"
      :element="element"
      :bpmnModeler="bpmnModeler"
      :timerEventDefinition="timerEventDefinition"
    />
  </el-collapse-item>
</template>
