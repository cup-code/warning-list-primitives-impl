<script>
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
      documentation: '',
    }
  },
  computed: {
    enable() {
      return true
    },
  },
  watch: {
    documentation: {
      handler(newVal) {
        if (this.element) {
          const newObjectList = []

          if (typeof newVal !== 'undefined' && newVal !== '') {
            newObjectList.push(
              this.bpmnModeler.get('bpmnFactory').create('bpmn:Documentation', {
                text: newVal,
              }),
            )
          }

          this.bpmnModeler.get('modeling').updateProperties(this.element, {
            documentation: newObjectList,
          })
        }
      },
      deep: false,
    },
    element: {
      handler(val) {
        if (this.element && this.element.businessObject) {
          const newVal = this.element.businessObject.documentation
          this.documentation = newVal && newVal.length > 0 ? newVal[0].text : ''
        }
      },
      immediate: true,
      deep: true,
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
    <el-form-item label="描述信息">
      <el-input
        v-model="documentation"
        type="textarea"
      />
    </el-form-item>
  </el-form>
</template>
