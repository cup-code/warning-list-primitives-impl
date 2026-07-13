<script>
import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper'

export default {
  props: {
    element: {
      type: Object,
      default: undefined,
    },
    bpmnModeler: {
      type: Object,
      default: undefined,
    },
    timerEventDefinition: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {
      type: '',
      value: '',
      options: [
        {
          value: 'timeDate',
          label: 'Date(采用ISO-8601日期时间)',
        },
        {
          value: 'timeDuration',
          label: 'Duration(持续时间)',
        },
        {
          value: 'timeCycle',
          label: 'Cycle(时间周期)',
        },
      ],
    }
  },
  computed: {
    enable() {
      return true
    },
  },
  watch: {
    type: {
      handler(newType, oldType) {
        if (this.element) {
          const props = {
            timeDuration: undefined,
            timeDate: undefined,
            timeCycle: undefined,
          }

          if (newType) {
            let value

            if (oldType) {
              const definition = this.timerEventDefinition.get(oldType)
              value = definition.get('body')
            }

            props[newType] = this.createFormalExpression(
              this.timerEventDefinition,
              value,
              this.bpmnModeler.get('bpmnFactory'),
            )
            this.bpmnModeler.get('commandStack').execute('properties-panel.update-businessobject', {
              element: this.element,
              businessObject: this.timerEventDefinition,
              properties: props,
            })
          }
        }
      },
      deep: false,
    },
    value(newVal) {
      if (this.element) {
        if (this.timerEventDefinition) {
          const type = this.getTimerDefinitionType(this.timerEventDefinition)
          const definition = type && this.timerEventDefinition.get(type)

          if (definition) {
            this.bpmnModeler.get('commandStack').execute('properties-panel.update-businessobject', {
              element: this.element,
              businessObject: definition,
              properties: {
                body: newVal || undefined,
              },
            })
          }
        }
      }
    },
    timerEventDefinition: {
      handler(timerEventDefinition) {
        if (timerEventDefinition) {
          this.type = this.getTimerDefinitionType(timerEventDefinition)
          const definition = this.type && timerEventDefinition.get(this.type)
          this.value = definition && definition.get('body')
        }
        else {
          this.type = ''
          this.value = ''
        }
      },
      immediate: true,
      deep: false,
    },
  },
  methods: {
    getTimerDefinitionType(timer) {
      const timeDate = timer.get('timeDate')

      if (typeof timeDate !== 'undefined') {
        return 'timeDate'
      }

      const timeCycle = timer.get('timeCycle')

      if (typeof timeCycle !== 'undefined') {
        return 'timeCycle'
      }

      const timeDuration = timer.get('timeDuration')

      if (typeof timeDuration !== 'undefined') {
        return 'timeDuration'
      }
    },
    createFormalExpression(parent, body, bpmnFactory) {
      body = body || undefined
      return elementHelper.createElement(
        'bpmn:FormalExpression',
        {
          body,
        },
        parent,
        bpmnFactory,
      )
    },
  },
}
</script>

<template>
  <el-form
    ref="form"
    class="act-form"
    size="mini"
    label-width="100px"
  >
    <el-form-item label="定时类型">
      <el-select
        v-model="type"
        clearable
        placeholder="请选择"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="值">
      <el-input v-model="value" />
    </el-form-item>
  </el-form>
</template>
