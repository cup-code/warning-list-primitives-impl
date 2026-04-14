<script>
import AuditTabGroups from './groups/AuditTabGroups'
import ButtonsTabGroups from './groups/ButtonsTabGroups'
import ConditionTabGroups from './groups/ConditionTabGroups'
import EventTabGroups from './groups/EventTabGroups'
import ExecutionListenersTabGroups from './groups/ExecutionListenersTabGroups'
import FormsTabGroups from './groups/FormsTabGroups'
import GeneralTabGroups from './groups/GeneralTabGroups'
import MultiInstanceLoopGroups from './groups/MultiInstanceLoopGroups'
import StartableTabGroups from './groups/StartableTabGroups'
import TaskListenersTabGroups from './groups/TaskListenersTabGroups'

export default {
  components: {
    ButtonsTabGroups,
    GeneralTabGroups,
    AuditTabGroups,
    EventTabGroups,
    FormsTabGroups,
    ExecutionListenersTabGroups,
    TaskListenersTabGroups,
    ConditionTabGroups,
    StartableTabGroups,
    MultiInstanceLoopGroups,
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
  },
  data() {
    return {
      activeNames: ['1'],
    }
  },
}
</script>

<template>
  <div class="paneRight-selfBpmn">
    <el-collapse v-model="activeNames" accordion>
      <GeneralTabGroups
        name="1"
        :bpmnModeler="bpmnModeler"
        :element="element"
      />
      <AuditTabGroups
        name="2"
        :bpmnModeler="bpmnModeler"
        :element="element"
      />
      <FormsTabGroups
        name="3"
        :bpmnModeler="bpmnModeler"
        :element="element"
      />
      <EventTabGroups
        name="4"
        :bpmnModeler="bpmnModeler"
        :element="element"
      />
      <ButtonsTabGroups
        name="5"
        :bpmnModeler="bpmnModeler"
        :element="element"
      />
      <ConditionTabGroups
        name="6"
        :bpmnModeler="bpmnModeler"
        :element="element"
      />
      <ExecutionListenersTabGroups
        name="7"
        :bpmnModeler="bpmnModeler"
        :element="element"
      />
      <TaskListenersTabGroups
        name="8"
        :bpmnModeler="bpmnModeler"
        :element="element"
      />
      <StartableTabGroups
        name="9"
        :bpmnModeler="bpmnModeler"
        :element="element"
      />
      <MultiInstanceLoopGroups
        name="10"
        :bpmnModeler="bpmnModeler"
        :element="element"
      />
    </el-collapse>
  </div>
</template>

<style lang="scss" scoped>
.paneRight-selfBpmn {
  padding: 10px;
  box-sizing: border-box;
  .el-collapse-item__header {
    .title {
      padding-left: 20px;
    }
  }
  .el-collapse-item__content {
    padding-left: 10px;
    padding-right: 10px;
  }
}
</style>
