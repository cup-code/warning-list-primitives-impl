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
    loopCharacteristics: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    return {
      collection: '',
      completionCondition: '',
      elementVariable: '',
      newLoopCharacteristics: this.loopCharacteristics,
      rd: 'None',
      rate: '1',
      num: 100,
      options: [
        {
          value: 'None',
          label: '非会签',
        },
        {
          value: 'Parallel',
          label: '并行会签',
        },
        {
          value: 'Sequential',
          label: '串行会签',
        },
      ],
      isSequential: false,
    }
  },
  computed: {
    enable() {
      return true
    },
  },
  watch: {
    'element.businessObject.loopCharacteristics': {
      handler(newVal) {
        if (newVal) {
          this.collection = newVal.collection
          this.completionCondition = newVal.completionCondition && newVal.completionCondition.body
          const begin = '${nrOfCompletedInstances/nrOfInstances >= '.length
          const end = this.completionCondition.indexOf(' }')
          this.num = this.completionCondition.substring(begin, end) * 100

          if (this.num === 100) {
            this.rate = '1'
          }
          else {
            this.rate = '2'
          }

          this.elementVariable = newVal.elementVariable

          if (newVal.isSequential) {
            this.rd = 'Sequential'
          }
          else {
            this.rd = 'Parallel'
          }
        }
        else {
          this.rd = 'None'
        }
      },
      immediate: true,
      deep: false,
    },
  },
  methods: {
    setRate(newVal) {
      if (newVal === '1') {
        this.num = 100
        this.completionConditionInput(this.num)
      }
    },
    change(newVal) {
      if (newVal === 'None') {
        this.bpmnModeler.get('modeling').updateProperties(this.element, {
          loopCharacteristics: undefined,
        })
        this.bpmnModeler.get('modeling').updateProperties(this.element, {
          assignee: undefined,
        })
      }
      else {
        if (!this.newLoopCharacteristics) {
          this.newLoopCharacteristics = this.bpmnModeler._moddle.create(
            'bpmn:MultiInstanceLoopCharacteristics',
          )
        }

        this.newLoopCharacteristics.isSequential = this.rd === 'Sequential'
        this.bpmnModeler.get('modeling').updateProperties(this.element, {
          loopCharacteristics: this.newLoopCharacteristics,
        })
        this.collectionInput('${mutiInstanceHandler.getList(execution)}')
        this.elementVariableInput('assignee') // this.completionConditionInput('${mutiInstanceHandler.getComplete(execution)}')

        this.bpmnModeler.get('modeling').updateProperties(this.element, {
          assignee: '${assignee}',
        })
        this.completionConditionInput(this.num)
      }
    },
    collectionInput(newVal) {
      this.bpmnModeler.get('commandStack').execute('properties-panel.update-businessobject', {
        element: this.element,
        businessObject: this.newLoopCharacteristics,
        properties: {
          collection: newVal,
        },
      })
    },
    elementVariableInput(newVal) {
      this.bpmnModeler.get('commandStack').execute('properties-panel.update-businessobject', {
        element: this.element,
        businessObject: this.newLoopCharacteristics,
        properties: {
          elementVariable: newVal,
        },
      })
      this.bpmnModeler.get('commandStack').execute('properties-panel.update-businessobject', {
        element: this.element,
        businessObject: this.newLoopCharacteristics,
        properties: {
          rate: 50,
        },
      })
    },
    completionConditionInput(newVal) {
      const rate = newVal / 100
      const expression = `\${nrOfCompletedInstances/nrOfInstances >= ${rate} }`
      this.updateFormalExpression(
        this.element,
        'completionCondition',
        expression,
        this.bpmnModeler.get('bpmnFactory'),
      )
    },
    updateFormalExpression(element, propertyName, newValue, bpmnFactory) {
      const expressionProps = {}

      if (!newValue) {
        // remove formal expression
        expressionProps[propertyName] = undefined
        this.bpmnModeler.get('commandStack').execute('properties-panel.update-businessobject', {
          element: this.element,
          businessObject: this.newLoopCharacteristics,
          properties: expressionProps,
        })
        return
      }

      const existingExpression = this.newLoopCharacteristics.get(propertyName)

      if (!existingExpression) {
        // add formal expression
        expressionProps[propertyName] = this.createFormalExpression(
          this.newLoopCharacteristics,
          newValue,
          bpmnFactory,
        ) // return this.bpmnModeler.get('modeling').updateProperties(this.element, expressionProps)

        this.bpmnModeler.get('commandStack').execute('properties-panel.update-businessobject', {
          element: this.element,
          businessObject: this.newLoopCharacteristics,
          properties: expressionProps,
        })
        return
      } // edit existing formal expression
      // this.bpmnModeler.get('modeling').updateProperties(this.element, expressionProps)

      this.bpmnModeler.get('commandStack').execute('properties-panel.update-businessobject', {
        element: this.element,
        businessObject: existingExpression,
        properties: {
          body: newValue,
        },
      })
    },
    createFormalExpression(parent, body, bpmnFactory) {
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
    v-if="enable"
    ref="form"
    class="act-form"
    size="mini"
    label-width="150px"
  >
    <el-form-item label="多实例类型">
      <el-select
        v-model="rd"
        placeholder="请选择"
        @change="change"
      >
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item
      v-if="rd !== 'None'"
      label="完成条件"
    >
      <el-radio-group
        v-model="rate"
        @change="setRate"
      >
        <el-radio label="1">
          全部通过
        </el-radio>
        <el-radio label="2">
          按比例通过
        </el-radio>
      </el-radio-group>
    </el-form-item>

    <el-form-item v-if="rd !== 'None'">
      <el-input-number
        v-model="num"
        :disabled="rate === '1'"
        :min="1"
        :max="100"
        label="百分比"
        @change="completionConditionInput"
      />
      %
    </el-form-item>
  </el-form>
</template>
