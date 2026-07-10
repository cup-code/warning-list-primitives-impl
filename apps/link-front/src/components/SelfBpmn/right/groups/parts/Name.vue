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
      name: '',
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
        this.name = this.element.businessObject.name
      },
      immediate: false,
      deep: false,
    },
  },
  methods: {
    nameInput(newVal) {
      if (this.element) {
        this.bpmnModeler.get('modeling').updateProperties(this.element, {
          name: newVal,
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
    <el-form-item label="名称">
      <el-input
        v-model="name"
        @input="nameInput"
      />
    </el-form-item>
  </el-form>
</template>
