<script>
import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper'
import { getBusinessObject, is } from 'kaka-bpmn/lib/util/ModelUtil'
import { pick } from 'lodash'
import { find } from 'min-dash'

import ButtonsAdd from './ButtonsAdd'
import ButtonsSelect from './ButtonsSelect'

export default {
  components: {
    ButtonsAdd,
    ButtonsSelect,
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
        name: '',
        code: '',
        isHide: '0',
        next: '0',
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
            if (is(value, 'flowable:Button')) {
              value = pick(value, 'id', 'name', 'sort', 'isHide', 'code', 'next')

              this.tableData.push(JSON.parse(JSON.stringify(value)))

              this.sortTableData()
            }
          })
        }
      },
      immediate: true,
      deep: false,
    },
  },
  methods: {
    edit(row) {
      this.oldRow = row
      this.$refs.buttonAdd.edit(JSON.parse(JSON.stringify(row)))
    },
    openSelectButton() {
      this.$refs.buttonSelect.init(JSON.parse(JSON.stringify(this.tableData)))
    },
    openAddButton() {
      this.oldRow = null
      this.$refs.buttonAdd.add()
    },
    selectButton(dataListSelections) {
      dataListSelections.forEach((button) => {
        button.isHide = '0'
        button.next = '0'
      })
      this.tableData = dataListSelections
      this.sort()
    },
    inputButton(form) {
      if (this.oldRow === null) {
        this.tableData.push(JSON.parse(JSON.stringify(form)))
      }
      else {
        this.tableData.forEach((item, index) => {
          if (item === this.oldRow) {
            this.tableData.splice(index, 1, form)
          }
        })
      }

      this.sort()
    },
    sortTableData() {
      return this.sortByKey(this.tableData, 'sort')
    },
    sort() {
      const tableData = this.sortTableData()
      this.tableData = JSON.parse(JSON.stringify(tableData))
    },
    // 数组对象排序
    sortByKey(array, key) {
      return array.sort((a, b) => {
        const x = Number.parseInt(a[key])
        const y = Number.parseInt(b[key])
        return x < y ? -1 : x > y ? 1 : 0
      })
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
        return is(elem, 'flowable:Button')
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
        const button = elementHelper.createElement(
          'flowable:Button',
          row,
          parent,
          this.bpmnModeler.get('bpmnFactory'),
        )
        objList.push(button)
      })
      const old = []

      if (this.element.businessObject.extensionElements) {
        this.element.businessObject.extensionElements.values.forEach((value) => {
          if (is(value, 'flowable:Button')) {
            old.push(value)
          }
        })
      }

      this.bpmnModeler
        .get('commandStack')
        .execute('properties-panel.update-businessobject-list', {
          element,
          currentObject: parent,
          propertyName: 'values',
          objectsToRemove: old,
        })
      this.bpmnModeler
        .get('commandStack')
        .execute('properties-panel.update-businessobject-list', {
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
      style="margin: 5px"
      type="primary"
      size="mini"
      @click="openSelectButton"
    >
      选择按钮
    </el-button>

    <el-button
      style="margin: 5px"
      type="primary"
      size="mini"
      @click="openAddButton"
    >
      添加按钮
    </el-button>

    <el-table :data="tableData" size="mini">
      <el-table-column prop="name" label="名称" />
      <el-table-column
        prop="code"
        label="编码"
        show-overflow-tooltip
      />
      <el-table-column
        prop="sort"
        label="排序"
        width="50"
      />
      <el-table-column
        prop="isHide"
        label="是否隐藏"
        width="70"
      >
        <template slot-scope="scope">
          {{ ` ${scope.row.isHide === "0" ? "否" : "是"} ` }}
        </template>
      </el-table-column>
      <el-table-column
        :key="Math.random()"
        fixed="right"
        header-align="center"
        align="center"
        width="100"
        label="操作"
      >
        <template slot-scope="scope">
          <el-button
            type="text"
            size="mini"
            @click="edit(scope.row)"
          >
            修改
          </el-button>
          <el-button
            type="text"
            size="mini"
            @click="del(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <buttons-select ref="buttonSelect" @selectButton="selectButton" />

    <buttons-add ref="buttonAdd" @inputButton="inputButton" />
  </div>
</template>
