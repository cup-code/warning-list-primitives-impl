<script>
import { getBusinessObject, is } from 'kaka-bpmn/lib/util/ModelUtil'

import MultiInstanceLoopCharacteristics from './parts/MultiInstanceLoopCharacteristics'

export default {
  components: {
    MultiInstanceLoopCharacteristics,
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
      loopCharacteristics: undefined,
    }
  },
  computed: {
    enable() {
      if (this.element && is(this.element, 'bpmn:UserTask')) {
        const bo = getBusinessObject(this.element)
        this.loopCharacteristics = bo.loopCharacteristics
        return true // return !!this.loopCharacteristics && is(this.loopCharacteristics, 'flowable:Collectable');
      }
      else {
        return false
      } //   if (this.element && is(this.element, 'bpmn:UserTask')) {
      //     var bo = getBusinessObject(this.element);
      //     this.loopCharacteristics = bo.loopCharacteristics;
      //     return true
      //   } else {
      //     return false
      //   }
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
      <span class="title"> 会签设置<i class="header-icon el-icon-info" /> </span>
    </template>

    <MultiInstanceLoopCharacteristics
      :element="element"
      :loopCharacteristics="loopCharacteristics"
      :bpmnModeler="bpmnModeler"
    />
  </el-collapse-item>
</template>
