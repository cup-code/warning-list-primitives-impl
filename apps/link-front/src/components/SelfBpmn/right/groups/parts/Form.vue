<script>
import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper'
import { getBusinessObject, is } from 'kaka-bpmn/lib/util/ModelUtil'
import { pick } from 'lodash'
import { find } from 'min-dash'

import { getExtensionFormDefinitionByJsonId } from '@/http/safe-production/flowable-api'

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
    formOptions: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      formReadOnly: false,
      dialogVisible: false,
      formKey: '',
      outFormKey: '',
      formType: '1',
      inputForm: {
        selectedDyFormKey: '',
      },
      title: '',
      name: '',
      type: '',
      address: '',
      dataList: [],
      options: [
        {
          value: '1',
          label: '动态表单',
        },
        {
          value: '2',
          label: '外置表单',
        },
      ],
    }
  },
  computed: {
    isDisable() {
      return is(this.element, 'bpmn:StartEvent')
    },
    enable() {
      if (!this.ensureFormKeyAndDataSupported(this.element)) {
        return false
      }
      else {
        return true
      }
    },
  },
  watch: {
    formReadOnly: {
      handler(newVal, oldVal) {
        if (this.element) {
          this.bpmnModeler.get('modeling').updateProperties(this.element, {
            'flowable:formReadOnly': newVal,
          })
        }
      },
      deep: true,
    },
    formKey: {
      handler(newVal, oldVal) {
        if (this.element) {
          this.bpmnModeler.get('modeling').updateProperties(this.element, {
            'flowable:formKey': newVal,
          })
        }
      },
      deep: true,
    },
    outFormKey: {
      handler(newVal, oldVal) {
        if (this.element) {
          this.formKey = newVal
          localStorage.setItem(`${this.element.id}outFormKey`, newVal)
          this.bpmnModeler.get('modeling').updateProperties(this.element, {
            'flowable:outFormKey': newVal,
          })
        }
      },
      deep: true,
    },
    // 'inputForm.selectedDyFormKey': {
    //   handler (newVal, oldVal) {
    //     if (this.element) {
    //       this.formKey = newVal
    //       localStorage.setItem(this.element.id + 'dyFormKey', newVal)
    //       // this.bpmnModeler.get('modeling').updateProperties(this.element, { 'flowable:dyFormKey': newVal })
    //     }
    //   },
    //   deep: false
    // },
    formType: {
      handler(newVal, oldVal) {
        if (this.element) {
          this.bpmnModeler.get('modeling').updateProperties(this.element, {
            'flowable:formType': newVal,
          })

          if (this.formType === '1') {
            this.inputForm.selectedDyFormKey = localStorage.getItem(`${this.element.id}dyFormKey`)
              ? localStorage.getItem(`${this.element.id}dyFormKey`)
              : ''
            this.formKey = this.inputForm.selectedDyFormKey
            const dataBindFields = []

            if (this.element.businessObject.extensionElements) {
              this.element.businessObject.extensionElements.values.forEach((value) => {
                if (is(value, 'flowable:FormProperty')) {
                  value = pick(value, 'id', 'name', 'readable', 'writable', 'required')
                  value.readable = value.readable === undefined ? true : value.readable
                  value.writable = value.writable === undefined ? true : value.writable
                  dataBindFields.push(JSON.parse(JSON.stringify(value)))
                }
              })
            }

            this.dataList = []

            if (this.formKey) {
              const node = this.formOptions.filter((item) => {
                return item.jsonId === this.formKey
              })
              let formName = ''
              let version = ''

              if (node.length > 0) {
                formName = node[0].name
                version = node[0].version
              }

              this.dataList.push({
                id: this.formKey,
                version,
                name: formName,
                dataBindFields,
              })
            }
          }
          else {
            this.outFormKey = localStorage.getItem(`${this.element.id}outFormKey`)
              ? localStorage.getItem(`${this.element.id}outFormKey`)
              : ''
            this.formKey = this.outFormKey
          }
        }
      },
      deep: false,
    },
    element: {
      handler(newVal) {
        const bo = getBusinessObject(this.element)
        const formKey = bo.get('flowable:formKey') ? bo.get('flowable:formKey') : ''
        this.formReadOnly = bo.get('flowable:formReadOnly')

        if (bo.get('flowable:formType')) {
          this.formType = bo.get('flowable:formType')
        }
        else if ((formKey && formKey.includes('/')) || (formKey && formKey.length !== 32)) {
          this.formType = '2'
          this.bpmnModeler.get('modeling').updateProperties(this.element, {
            'flowable:formType': '2',
          })
        }
        else {
          this.formType = '1'
          this.bpmnModeler.get('modeling').updateProperties(this.element, {
            'flowable:formType': '1',
          })
        }

        if (this.formType === '1') {
          const dataBindFields = []

          if (this.element.businessObject.extensionElements) {
            this.element.businessObject.extensionElements.values.forEach((value) => {
              if (is(value, 'flowable:FormProperty')) {
                value = pick(value, 'id', 'name', 'readable', 'writable', 'required')
                value.readable = value.readable === undefined ? true : value.readable
                value.writable = value.writable === undefined ? true : value.writable
                dataBindFields.push(JSON.parse(JSON.stringify(value)))
              }
            })
          }

          this.dataList = []

          if (formKey) {
            const node = this.formOptions.filter((item) => {
              return item.jsonId === formKey
            })

            if (node.length === 0) {
              getExtensionFormDefinitionByJsonId(formKey).then(({ data }) => {
                if (data.success) {
                  const formDefinition = data.formDefinition // this.inputForm.selectedDyFormKey = formKey

                  this.inputForm.selectedDyFormKey = ''

                  this.dataList.push({
                    id: formKey,
                    name: formDefinition.name,
                    version: formDefinition.formDefinitionJson.version,
                    dataBindFields,
                  })
                }
                else {
                  this.inputForm.selectedDyFormKey = ''
                  this.dataList = []
                }
              })
            }
            else {
              this.inputForm.selectedDyFormKey = formKey
              this.dataList.push({
                id: formKey,
                name: node[0].name,
                version: node[0].version,
                dataBindFields,
              })
            }
          }
          else {
            this.inputForm.selectedDyFormKey = ''
            this.dataList = []
          }
        }
        else {
          this.outFormKey = formKey
        }
      },
      immediate: true,
      deep: false,
    },
    dataList: {
      handler(newVal) {
        if (this.element) {
          this.updateElements(newVal)
        }
      },
      deep: true,
    },
  },
  methods: {
    ensureFormKeyAndDataSupported(element) {
      return (
        (is(element, 'bpmn:StartEvent') && !is(element.parent, 'bpmn:SubProcess'))
        || is(element, 'bpmn:UserTask')
      )
    },
    add() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const form = this.formOptions.filter((item) => {
            return this.inputForm.selectedDyFormKey === item.jsonId
          })[0]

          if (!form) {
            return
          }

          const dataBindFields = []

          this.generateModel(JSON.parse(form.json).list, dataBindFields)

          this.dataList = []
          this.formKey = form.jsonId //  this.formKey = newVal

          this.bpmnModeler.get('modeling').updateProperties(this.element, {
            'flowable:formKey': this.formKey,
          })

          localStorage.setItem(`${this.element.id}dyFormKey`, this.formKey)

          this.dataList.push({
            name: form.name,
            version: form.version,
            id: this.inputForm.selectedDyFormKey,
            dataBindFields,
          })

          this.dialogVisible = false
        }
      })
    },
    edit() {
      this.dialogVisible = true
    },
    del() {
      this.$confirm('\u786E\u5B9A\u5220\u9664\u52A8\u6001\u8868\u5355\u5417?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        this.dataList = []
        this.inputForm.selectedDyFormKey = ''
        this.formKey = ''

        this.bpmnModeler.get('modeling').updateProperties(this.element, {
          'flowable:formKey': this.formKey,
        })

        localStorage.setItem(`${this.element.id}dyFormKey`, this.formKey)
      })
    },
    generateModel(genList, dataBindFields) {
      for (let i = 0; i < genList.length; i++) {
        if (genList[i].type === 'grid') {
          genList[i].columns.forEach((item) => {
            this.generateModel(item.list, dataBindFields)
          })
        }
        else if (genList[i].type === 'tabs') {
          genList[i].tabs.forEach((item) => {
            this.generateModel(item.list, dataBindFields)
          })
        }
        else if (genList[i].type === 'report') {
          genList[i].rows.forEach((row) => {
            row.columns.forEach((column) => {
              this.generateModel(column.list, dataBindFields)
            })
          })
        }
        else {
          // 处理老版本没有dataBind值的情况，默认绑定数据
          if (genList[i].options.dataBind) {
            dataBindFields.push({
              id: genList[i].model,
              name: genList[i].name,
              readable: true,
              writable: true,
            })
          }
        }
      }

      return dataBindFields
    },
    detail() {},
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
      let dataBindFields = []

      if (tableDatas.length === 1 && tableDatas[0].dataBindFields) {
        dataBindFields = tableDatas[0].dataBindFields
      }

      const element = this.element
      const bo = getBusinessObject(element)
      let parent = this.getExtensionElements(element)

      if (!parent && typeof this.createExtensionElements === 'function') {
        parent = this.createExtensionElements(element, bo)
      }

      const objList = []
      dataBindFields.forEach((row) => {
        const formProperty = elementHelper.createElement(
          'flowable:FormProperty',
          row,
          parent,
          this.bpmnModeler.get('bpmnFactory'),
        )
        objList.push(formProperty)
      })
      const old = []

      if (this.element.businessObject.extensionElements) {
        this.element.businessObject.extensionElements.values.forEach((value) => {
          if (is(value, 'flowable:FormProperty')) {
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
  <div
    v-if="enable"
    style="padding: 5px"
  >
    <el-radio-group
      v-model="formType"
      style="padding-left: 20px"
      size="mini"
    >
      <el-radio label="1">
        动态表单
      </el-radio>
      <el-radio label="2">
        外置表单
      </el-radio>
    </el-radio-group>

    <el-divider />

    <div v-if="formType === '1'">
      <el-row style="padding-bottom: 5px">
        <el-button
          type="primary"
          size="mini"
          :disabled="dataList.length === 1"
          icon="el-icon-plus"
          @click="dialogVisible = true"
        >
          添加
        </el-button>
        <el-button
          type="primary"
          size="mini"
          :disabled="dataList.length === 0"
          icon="el-icon-edit-outline"
          @click="edit"
        >
          修改
        </el-button>
        <el-button
          type="primary"
          size="mini"
          :disabled="dataList.length === 0"
          icon="el-icon-delete"
          @click="del"
        >
          删除
        </el-button>
      </el-row>

      <el-table
        class="design-right"
        :data="dataList"
        border
        size="mini"
        @expand-change="detail"
      >
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-table
              style="width: 100%"
              border
              :data="scope.row.dataBindFields"
            >
              <el-table-column
                type="index"
                width="50"
              />
              <el-table-column
                prop="name"
                label="字段名称"
              />
              <el-table-column
                prop="id"
                label="字段ID"
                show-overflow-tooltip
              />
              <el-table-column
                prop="readable"
                align="center"
                width="50"
                label="可读"
              >
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.readable" />
                </template>
              </el-table-column>
              <el-table-column
                prop="writable"
                align="center"
                width="50"
                label="可写"
              >
                <template slot-scope="scope">
                  <el-checkbox v-model="scope.row.writable" />
                </template>
              </el-table-column>
            </el-table>
          </template>
        </el-table-column>

        <el-table-column
          prop="name"
          label="表单名称"
        />

        <el-table-column
          prop="version"
          label="版本"
        />

        <el-table-column
          prop="id"
          label="表单key"
        />
      </el-table>
    </div>

    <div v-if="formType === '2'">
      <el-form
        v-if="enable"
        class="act-form"
        size="mini"
        label-width="100px"
      >
        <el-form-item label="表单地址">
          <el-input
            v-model="outFormKey"
            size="mini"
          />
        </el-form-item>
        <el-form-item label="表单只读">
          <el-checkbox
            v-model="formReadOnly"
            :disabled="isDisable"
          />
          勾选执行此审批节点时表单不可以修改。
        </el-form-item>
      </el-form>
    </div>

    <el-dialog

      title="选择动态表单"
      :visible.sync="dialogVisible"
      append-to-body
      width="500px"
      class="dialog-form-part-group-selfBpmn dialog-selfBpmn"
    >
      <el-form
        ref="form"
        size="small"
        :model="inputForm"
        label-width="80px"
      >
        <el-form-item
          label="表单选择"
          prop="selectedDyFormKey"
          :rules="[{ required: true, message: '动态表单不能为空', trigger: 'blur' }]"
        >
          <el-select
            v-model="inputForm.selectedDyFormKey"
            style="width: 100%"
            filterable
            clearable
            placeholder="请选择"
          >
            <el-option
              v-for="item in formOptions"
              :key="item.id"
              :label="`${item.name}: v${item.version}`"
              :value="item.jsonId"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="mini"
          @click="dialogVisible = false"
        >取 消</el-button>
        <el-button
          size="mini"
          type="primary"
          @click="add"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.dialog-form-part-group-selfBpmn {
  .el-dialog {
    .el-dialog__body {
      .el-form {
        .el-form-item__label {
          font-size: 14px !important;
        }
      }
    }
  }
}
</style>
