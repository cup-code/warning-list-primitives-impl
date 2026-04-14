<script>
import Documention from './parts/Documention'
import Id from './parts/Id'
import Initiator from './parts/Initiator'
import Name from './parts/Name'

export default {
  components: {
    Name,
    Id,
    Documention,
    Initiator,
    // UserTasks: UserTasks,
    // Conditional: Conditional
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
}
</script>

<template>
  <el-collapse-item :name="name">
    <template slot="title">
      <span class="title">基本设置</span>
      <i class="header-icon el-icon-info" />
    </template>

    <Id
      :element="element"
      :bpmnModeler="bpmnModeler"
    />
    <Name
      :element="element"
      :bpmnModeler="bpmnModeler"
    />
    <Documention
      :element="element"
      :bpmnModeler="bpmnModeler"
    />
    <Initiator
      :element="element"
      :bpmnModeler="bpmnModeler"
    />
  </el-collapse-item>
</template>
