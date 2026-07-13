<script>
import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper'
import { getBusinessObject, is } from 'kaka-bpmn/lib/util/ModelUtil'
import { pick } from 'lodash'
import { find } from 'min-dash'
import UserLabel from './UserSetting/UserLabel'

import UserSetting from './UserSetting/UserSetting'
import { getUserTypeLabel } from './UserSetting/UserUtils'

export default {
  components: {
    UserSetting,
    UserLabel,
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
      outerVisible: false,
      oldRow: null,
      form: {
        type: 'user',
        value: '发起人',
        condition: '',
        operationType: 'and',
        sort: 0,
      },
      tableData: [],
    }
  },
  watch: {
    tableData: {
      handler(newVal) {
        if (this.element) {
          this.updateElements(newVal)
        }
      },
      deep: true,
    },
    element: {
      handler(newVal) {
        this.tableData = []
        if (this.element.businessObject.extensionElements) {
          this.element.businessObject.extensionElements.values.forEach((value) => {
            if (is(value, 'flowable:Assignee')) {
              value = pick(value, 'id', 'type', 'value', 'condition', 'operationType', 'sort')
              this.tableData.push(JSON.parse(JSON.stringify(value)))
            }
          })
        }
      },
      immediate: true,
      deep: false,
    },
  },
  methods: {
    add() {
      this.oldRow = null
      this.tableData.push({
        type: '',
        value: '',
        condition: '0',
        operationType: '0',
        sort: 0,
      })
    },
    showUserTypeLabel(value) {
      return getUserTypeLabel(value)
    },
    edit(row) {
      this.outerVisible = true
      this.oldRow = row
      this.form = JSON.parse(JSON.stringify(row))
    },
    openUserSettingDialog() {
      this.$refs.userSetting.init(JSON.stringify(this.tableData))
    },
    selectUsers(tableData) {
      this.tableData = JSON.parse(tableData)
    },
    del(row) {
      this.tableData.forEach((item, index) => {
        if (item === row) {
          this.tableData.splice(index, 1)
        }
      })
    },
    getExtensionElements(element) {
      const bo = getBusinessObject(element)
      return bo.extensionElements
    },
    createExtensionElements(element, bo) {
      const extensionElements = elementHelper.createElement(
        'bpmn:ExtensionElements',
        {
          values: [],
        },
        bo,
        this.bpmnModeler.get('bpmnFactory'),
      )
      bo.extensionElements = extensionElements
      return extensionElements
    },
    isExtensionElements(element) {
      return is(element, 'bpmn:ExtensionElements')
    },
    getButtonsElement(element) {
      if (!this.isExtensionElements(element)) {
        return element.buttons
      }
      else {
        return this.getButtonsElementInsideExtensionElements(element)
      }
    },
    getButtonsElementInsideExtensionElements(extensionElements) {
      return find(extensionElements.values, (elem) => {
        return is(elem, 'flowable:Assignee')
      })
    },
    updateElements(tableDatas) {
      const element = this.element
      const bo = getBusinessObject(element)
      let parent = this.getExtensionElements(element)

      if (!parent && typeof this.createExtensionElements === 'function') {
        parent = this.createExtensionElements(element, bo)
      }

      const objList = []
      tableDatas.forEach((row) => {
        const user = elementHelper.createElement(
          'flowable:Assignee',
          row,
          parent,
          this.bpmnModeler.get('bpmnFactory'),
        )
        objList.push(user)
      })

      const old = []
      if (this.element.businessObject.extensionElements) {
        this.element.businessObject.extensionElements.values.forEach((value) => {
          if (is(value, 'flowable:Assignee')) {
            old.push(value)
          }
        })
      }

      this.bpmnModeler.get('commandStack').execute('properties-panel.update-businessobject-list', {
        element,
        currentObject: parent,
        propertyName: 'values',
        objectsToRemove: old,
      })
      this.bpmnModeler.get('commandStack').execute('properties-panel.update-businessobject-list', {
        element,
        currentObject: parent,
        propertyName: 'values',
        objectsToAdd: objList,
      })
    },
  },
}
</script>

<template>
  <div style="padding: 5px">
    <el-button
      type="primary"
      size="mini"
      style="margin: 5px"
      @click="openUserSettingDialog"
    >
      分配人员
    </el-button>
    <el-table
      :data="tableData"
      size="mini"
    >
      <el-table-column
        prop="type"
        label="用户类型"
      >
        <template slot-scope="scope">
          {{ ` ${showUserTypeLabel(scope.row.type)} ` }}
        </template>
      </el-table-column>
      <el-table-column
        prop="value"
        label="用户来自"
      >
        <template slot-scope="scope">
          <UserLabel
            :type="scope.row.type"
            :value="scope.row.value"
          />
        </template>
      </el-table-column>
    </el-table>

    <UserSetting
      ref="userSetting"
      @selectUsers="selectUsers"
    />
  </div>
</template>
