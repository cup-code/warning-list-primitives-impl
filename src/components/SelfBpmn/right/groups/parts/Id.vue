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
      label: 'ID',
      id: '',
    }
  },
  computed: {
    enable() {
      return true
    },
  },
  watch: {
    element: {
      handler(newVal) {
        this.id = this.element.businessObject.id
      },
      immediate: false,
      deep: false,
    },
  },
  methods: {
    idInput(newVal) {
      if (this.element) {
        this.bpmnModeler.get('modeling').updateProperties(this.element, {
          id: newVal,
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
        v-model="id"
        @input="idInput"
      />
    </el-form-item>
  </el-form>
</template>
