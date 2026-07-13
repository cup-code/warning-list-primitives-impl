<script>
import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper'
import { getBusinessObject, is } from 'kaka-bpmn/lib/util/ModelUtil'
import { pick } from 'lodash'

import ListenerSelect from './ListenerSelect'

export default {
  components: {
    ListenerSelect,
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
      visible: false,
      tableData: [],
      impl: '',
      oldRow: null,
      category: {
        JavaClass: '类',
        Expression: '表达式',
        DelegateExpression: '委托表达式',
      },
      inputForm: {
        type: 'JavaClass',
        class: '',
        delegateExpression: '',
        event: 'start',
        expression: '',
      },
    }
  },
  computed: {
    enable() {
      return true
    },
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
            if (is(value, 'flowable:ExecutionListener')) {
              value = pick(value, 'class', 'delegateExpression', 'event', 'expression')

              if (value.class) {
                value.type = 'JavaClass'
                value.impl = value.class
              }

              if (value.expression) {
                value.type = 'Expression'
                value.impl = value.expression
              }

              if (value.delegateExpression) {
                value.type = 'DelegateExpression'
                value.impl = value.delegateExpression
              }

              this.tableData.push(JSON.parse(JSON.stringify(value)))
            }
          })
        }
      },
      immediate: false,
      deep: false,
    },
  },
  methods: {
    add() {
      this.visible = true
      this.oldRow = null
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
      })
    },
    edit(row) {
      this.visible = true
      this.oldRow = row
      this.inputForm = JSON.parse(JSON.stringify(row))
    },
    save() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          if (this.inputForm.type === 'JavaClass') {
            this.inputForm.expression = ''
            this.inputForm.delegateExpression = ''
          }

          if (this.inputForm.type === 'Expression') {
            this.inputForm.class = ''
            this.inputForm.delegateExpression = ''
          }

          if (this.inputForm.type === 'DelegateExpression') {
            this.inputForm.class = ''
            this.inputForm.expression = ''
          }

          if (this.oldRow === null) {
            this.tableData.push(JSON.parse(JSON.stringify(this.inputForm)))
          }
          else {
            this.tableData.forEach((item, index) => {
              if (item === this.oldRow) {
                this.tableData.splice(index, 1, this.inputForm)
              }
            })
          }

          this.visible = false
        }
      })
    },
    del(row) {
      this.tableData.forEach((item, index) => {
        if (item === row) {
          this.tableData.splice(index, 1)
        }
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
        let obj = {}

        if (row.class) {
          obj = pick(row, 'event', 'class')
        }
        else if (row.delegateExpression) {
          obj = pick(row, 'event', 'delegateExpression')
        }
        else if (row.expression) {
          obj = pick(row, 'event', 'expression')
        }

        const listener = elementHelper.createElement(
          'flowable:ExecutionListener',
          obj,
          parent,
          this.bpmnModeler.get('bpmnFactory'),
        )
        objList.push(listener)
      })
      const old = []

      if (this.element.businessObject.extensionElements) {
        this.element.businessObject.extensionElements.values.forEach((value) => {
          if (is(value, 'flowable:ExecutionListener')) {
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
    showListenerSelectDialog() {
      this.$refs.listenerSelect.init('1')
    },
    selectListener(list) {
      list.forEach((listener) => {
        if (listener.valueType === '1') {
          listener.type = 'JavaClass'
          listener.class = listener.value
        }

        if (listener.valueType === '2') {
          listener.type = 'Expression'
          listener.expression = listener.value
        }

        if (listener.valueType === '3') {
          listener.type = 'DelegateExpression'
          listener.delegateExpression = listener.value
        }

        this.tableData.push(JSON.parse(JSON.stringify(listener)))
      })
    },
  },
}
</script>

<template>
  <div
    v-if="enable"
    style="padding: 5px"
  >
    <el-button
      style="margin: 5px"
      type="primary"
      size="mini"
      @click="add"
    >
      添加
    </el-button>
    <el-button
      style="margin: 5px"
      type="primary"
      size="mini"
      @click="showListenerSelectDialog"
    >
      选择
    </el-button>

    <el-dialog

      title="添加执行监听器"
      :visible.sync="visible"
      append-to-body
      class="dialog-selfBpmn"
    >
      <el-form
        ref="inputForm"
        size="mini"
        label-width="120px"
        :model="inputForm"
      >
        <el-form-item
          label="事件类型"
          prop="event"
        >
          <el-select
            v-model="inputForm.event"
            placeholder="请选择"
          >
            <el-option
              v-for="item in [
                { value: 'start', label: 'start' },
                { value: 'take', label: 'take' },
                { value: 'end', label: 'end' },
              ]"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          label="监听类型"
          prop="type"
        >
          <el-select
            v-model="inputForm.type"
            placeholder="请选择"
          >
            <el-option
              v-for="item in [
                { value: 'JavaClass', label: '类' },
                { value: 'Expression', label: '表达式' },
                { value: 'DelegateExpression', label: '委托表达式' },
              ]"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          v-if="inputForm.type === 'JavaClass'"
          label="类"
          prop="class"
          :rules="[{ required: true, message: '类不能为空', trigger: 'blur' }]"
        >
          <el-input v-model="inputForm.class" />
        </el-form-item>

        <el-form-item
          v-if="inputForm.type === 'Expression'"
          label="表达式"
          prop="expression"
          :rules="[{ required: true, message: '表达式不能为空', trigger: 'blur' }]"
        >
          <el-input v-model="inputForm.expression" />
        </el-form-item>

        <el-form-item
          v-if="inputForm.type === 'DelegateExpression'"
          label="委托表达式"
          prop="delegateExpression"
          :rules="[{ required: true, message: '委托表达式不能为空', trigger: 'blur' }]"
        >
          <el-input v-model="inputForm.delegateExpression" />
        </el-form-item>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="mini"
          @click="visible = false"
        >
          取 消
        </el-button>
        <el-button
          size="mini"
          type="primary"
          @click="save"
        >
          确定
        </el-button>
      </div>
    </el-dialog>

    <el-table
      :data="tableData"
      size="mini"
      border
    >
      <el-table-column
        prop="event"
        label="事件"
      />

      <el-table-column
        prop="type"
        label="类型"
      >
        <template slot-scope="scope">
          {{ category[scope.row.type] }}
        </template>
      </el-table-column>

      <el-table-column
        prop="impl"
        label="实现"
        show-overflow-tooltip
      >
        <template slot-scope="scope">
          {{ scope.row.class || scope.row.expression || scope.row.delegateExpression }}
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

    <ListenerSelect
      ref="listenerSelect"
      @selectListener="selectListener"
    />
  </div>
</template>
