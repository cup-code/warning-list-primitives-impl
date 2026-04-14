<script>
import { is } from 'kaka-bpmn/lib/util/ModelUtil'

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
  },
  data() {
    return {
      label: '流程发起人',
      initiator: 'applyUserId',
    }
  },
  computed: {
    enable() {
      if (is(this.element, 'flowable:Initiator') && !is(this.element.parent, 'bpmn:SubProcess')) {
        return true
      }
      else {
        return false
      }
    },
  },
  watch: {
    element: {
      handler(val) {
        if (is(this.element, 'flowable:Initiator') && !is(this.element.parent, 'bpmn:SubProcess')) {
          if (this.element.businessObject.initiator) {
            this.initiator = this.element.businessObject.initiator
          }
          else {
            this.initiator = 'applyUserId'
          }
        }
      },
      immediate: false,
      deep: false,
    },
  },
  methods: {
    initiatorInput(newVal) {
      if (this.element) {
        this.bpmnModeler.get('modeling').updateProperties(this.element, {
          initiator: newVal,
        })
      }
    },
  },
}
</script>

<template>
  <el-form
    v-if="enable"
    ref="form"
    size="small"
    label-width="100px"
    @submit.native.prevent
  >
    <el-form-item :label="label">
      <el-input
        v-model="initiator"
        disabled
        @input="initiatorInput"
      />
    </el-form-item>
  </el-form>
</template>
