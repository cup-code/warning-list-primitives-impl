<script>
import { is } from 'kaka-bpmn/lib/util/ModelUtil'

import gridSelect from '../../../components/gridSelect'
import userSelect from '../../../components/userSelect'

export default {
  components: {
    UserSelect: userSelect,
    GridSelect: gridSelect,
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
      radio: '1',
      candidateStarterUsers: '',
      candidateStarterGroups: '',
    }
  },
  computed: {
    enable() {
      if (this.element && is(this.element, 'bpmn:Process')) {
        return true
      }
      else {
        return false
      }
    },
  },
  watch: {
    'radio': {
      handler(newVal) {
        if (newVal === '1') {
          this.candidateStarterGroups = ''
          this.candidateStarterUsers = ''
        }
      },
      immediate: false,
      deep: false,
    },
    'candidateStarterUsers': {
      handler(newVal) {
        if (this.element) {
          this.bpmnModeler.get('modeling').updateProperties(this.element, {
            candidateStarterUsers: newVal,
          })
        }
      },
      deep: false,
    },
    'element.businessObject.candidateStarterUsers': {
      handler(newVal) {
        this.candidateStarterUsers = newVal

        if (this.candidateStarterUsers) {
          this.radio = '2'
        }
      },
      immediate: true,
      deep: false,
    },
    'candidateStarterGroups': {
      handler(newVal) {
        if (this.element) {
          this.bpmnModeler.get('modeling').updateProperties(this.element, {
            candidateStarterGroups: newVal,
          })
        }
      },
      deep: false,
    },
    'element.businessObject.candidateStarterGroups': {
      handler(newVal) {
        this.candidateStarterGroups = newVal

        if (this.candidateStarterGroups) {
          this.radio = '2'
        }
      },
      immediate: true,
      deep: false,
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
    label-width="100px"
  >
    <el-form-item label="允许启动:">
      <el-radio
        v-model="radio"
        label="1"
      >
        所有成员
      </el-radio>
      <el-radio
        v-model="radio"
        label="2"
      >
        指定成员
      </el-radio>
    </el-form-item>

    <el-form-item
      v-if="radio === '2'"
      label="添加用户:"
    >
      <user-select
        :value="candidateStarterUsers"
        @getValue="
          value => {
            candidateStarterUsers = value
          }
        "
      />
    </el-form-item>

    <el-form-item
      v-if="radio === '2'"
      label="添加角色:"
    >
      <grid-select
        title="选择角色"
        labelName="roleName"
        labelValue="id"
        :value="candidateStarterGroups"
        :columns="[
          { prop: 'roleName', label: '名字' },
          { prop: 'roleCode', label: '编码' },
        ]"
        :searchs="[
          { prop: 'roleName', label: '名字' },
          { prop: 'roleCode', label: '编码' },
        ]"
        dataListUrl="/sys/role/list"
        entityBeanName="role"
        queryEntityUrl="/sys/role/queryById"
        @getValue="
          value => {
            candidateStarterGroups = value
          }
        "
      />
    </el-form-item>
  </el-form>
</template>
