<script>
import cmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper'
import elementHelper from 'bpmn-js-properties-panel/lib/helper/ElementHelper'
import eventDefinitionHelper from 'bpmn-js-properties-panel/lib/helper/EventDefinitionHelper'
import { isAny } from 'kaka-bpmn/lib/features/modeling/util/ModelingUtil'
import { getBusinessObject, is } from 'kaka-bpmn/lib/util/ModelUtil'
import { pick } from 'lodash'
import { find } from 'min-dash'

import ConditionalDialog from './ConditionalDialog'

export default {
  components: {
    ConditionalDialog,
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
      label: '流程表达式',
      condition: '',
      conditionType: '1',
      visible: false,
      fieldOption: [],
      tableData: [],
    }
  },
  computed: {
    enable() {
      if (this.element && getBusinessObject(this.element)) {
        const conditionalEventDefinition = eventDefinitionHelper.getConditionalEventDefinition(
          this.element,
        )

        if (
          !(
            is(this.element, 'bpmn:SequenceFlow') && this.isConditionalSource(this.element.source)
          )
          && !conditionalEventDefinition
        ) {
          return false
        }
        else {
          return true
        }
      }
      else {
        return false
      }
    },
  },
  watch: {
    tableData: {
      handler(newVal) {
        if (this.element && this.conditionType === '1') {
          this.updateElements(newVal)
        }
      },
      deep: true,
      immediate: false,
    },
    condition: {
      handler(newVal) {
        this.updateProperty(newVal)
      },
      deep: false,
    },
    conditionType(val) {
      this.bpmnModeler.get('modeling').updateProperties(this.element, {
        'flowable:conditionType': val,
      })

      if (this.conditionType === '1') {
        this.updateElements(this.tableData)
      }
    },
    element: {
      handler(newVal) {
        let conditionalEventDefinition, bo, conditionExpression, root, startEvents, startEvent
        if (this.element) {
          conditionalEventDefinition = eventDefinitionHelper.getConditionalEventDefinition(
            this.element,
          )
          bo = getBusinessObject(this.element)
          conditionExpression = conditionalEventDefinition
            ? conditionalEventDefinition.condition
            : bo.conditionExpression
          root = this.bpmnModeler.get('canvas').getRootElement().businessObject
          startEvents = root.flowElements.filter((flowElement) => {
            return is(flowElement, 'bpmn:StartEvent')
          })

          if (bo.$attrs && bo.$attrs['flowable:conditionType']) {
            this.conditionType = bo.$attrs['flowable:conditionType']
            // 存疑: 这个return应不应该有？源代码没看明白这里
            // return;
          }

          this.$http
            .get('/extension/nodeSetting/queryValueByKey', {
              params: {
                processDefId: root.id,
                taskDefId: this.element.id,
                key: 'conditionType',
              },
            })
            .then(({ data }) => {
              if (data.success) {
                this.conditionType = data.value
              }

              if (conditionExpression) {
                this.condition = conditionExpression.get('body')
              }
              else {
                this.condition = ''
              }

              this.fieldOption = []

              if (startEvents.length > 0) {
                startEvent = startEvents[0]

                if (startEvent.extensionElements) {
                  startEvent.extensionElements.values.forEach((value) => {
                    if (is(value, 'flowable:FormProperty')) {
                      value = pick(value, 'id', 'name')
                      value.readable = value.readable === undefined ? true : value.readable
                      value.writable = value.writable === undefined ? true : value.writable

                      this.fieldOption.push(JSON.parse(JSON.stringify(value)))
                    }
                  })
                }

                this.tableData = []

                if (this.element.businessObject.extensionElements) {
                  this.element.businessObject.extensionElements.values.forEach((value) => {
                    if (is(value, 'flowable:Condition')) {
                      value = pick(value, 'field', 'compare', 'value', 'logic', 'sort')

                      this.tableData.push(JSON.parse(JSON.stringify(value)))
                    }
                  })
                }
              }
            })
        }

        /*
                // 这里是源代码
                var _this3 = this;
                return _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
                    var conditionalEventDefinition, bo, conditionExpression, root, startEvents, _yield$_this3$$http$g, data, startEvent;

                    return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    if (!_this3.element) {
                                        _context.next = 18;
                                        break;
                                    }

                                    conditionalEventDefinition = eventDefinitionHelper.getConditionalEventDefinition(_this3.element);
                                    bo = getBusinessObject(_this3.element);
                                    conditionExpression = conditionalEventDefinition ? conditionalEventDefinition.condition : bo.conditionExpression;
                                    root = _this3.bpmnModeler.get('canvas').getRootElement().businessObject;
                                    startEvents = root.flowElements.filter(function (flowElement) {
                                        return is(flowElement, 'bpmn:StartEvent');
                                    });

                                    if (bo.$attrs && bo.$attrs['flowable:conditionType']) {
                                        _context.next = 14;
                                        break;
                                    }

                                    _context.next = 9;
                                    return _this3.$http.get('/extension/nodeSetting/queryValueByKey', {
                                        params: {
                                        processDefId: root.id,
                                        taskDefId: _this3.element.id,
                                        key: 'conditionType'
                                        }
                                    });

                                case 9:
                                    _yield$_this3$$http$g = _context.sent;
                                    data = _yield$_this3$$http$g.data;

                                    if (data.success) {
                                        _this3.conditionType = data.value;
                                    }

                                    _context.next = 15;
                                    break;

                                case 14:
                                    _this3.conditionType = bo.$attrs['flowable:conditionType'];

                                case 15:
                                    if (conditionExpression) {
                                        _this3.condition = conditionExpression.get('body');
                                    } else {
                                        _this3.condition = '';
                                    }

                                    _this3.fieldOption = [];

                                    if (startEvents.length > 0) {
                                        startEvent = startEvents[0];

                                        if (startEvent.extensionElements) {
                                        startEvent.extensionElements.values.forEach(function (value) {
                                            if (is(value, 'flowable:FormProperty')) {
                                            value = _lodash_pick_4_4_0_lodash_pick_default()(value, 'id', 'name');
                                            value.readable = value.readable === undefined ? true : value.readable;
                                            value.writable = value.writable === undefined ? true : value.writable;

                                            _this3.fieldOption.push(JSON.parse(JSON.stringify(value)));
                                            }
                                        });
                                        }

                                        _this3.tableData = [];

                                        if (_this3.element.businessObject.extensionElements) {
                                        _this3.element.businessObject.extensionElements.values.forEach(function (value) {
                                            if (is(value, 'flowable:Condition')) {
                                            value = _lodash_pick_4_4_0_lodash_pick_default()(value, 'field', 'compare', 'value', 'logic', 'sort');

                                            _this3.tableData.push(JSON.parse(JSON.stringify(value)));
                                            }
                                        });
                                        }
                                    }

                                case 18:
                                case "end":
                                    return _context.stop();
                            }
                        }
                    }, _callee);
                }))();
                */
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    showSelectConditionDialog() {
      this.$refs.conditionDialog.show()
    },
    setCondition(val) {
      this.condition = val
    },
    isConditionalSource(element) {
      const CONDITIONAL_SOURCES = [
        'bpmn:Activity',
        'bpmn:StartEvent',
        'bpmn:ExclusiveGateway',
        'bpmn:InclusiveGateway',
        'bpmn:ComplexGateway',
      ]
      return isAny(element, CONDITIONAL_SOURCES)
    },
    addCondition() {
      this.tableData.push({
        field: '',
        compare: '<',
        value: '',
        logic: 'and',
        sort: 1,
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
        return is(elem, 'flowable:Condition')
      })
    },
    updateElements(tableDatas) {
      const andConditionArra = []
      const orConditionArra = []
      tableDatas.forEach((val, index) => {
        val.sort = index

        if (val.logic === 'and') {
          andConditionArra.push(val)
        }
        else {
          orConditionArra.push(val)
        }
      })
      const andConditionValue = andConditionArra
        .map((condition) => {
          return ''.concat(condition.field).concat(condition.compare).concat(condition.value)
        })
        .join('||')
      const orConditionValue = orConditionArra
        .map((condition) => {
          return ''.concat(condition.field).concat(condition.compare).concat(condition.value)
        })
        .join('&&')
      let conditionValue = ''

      if (andConditionValue === '') {
        conditionValue = orConditionValue
      }
      else if (orConditionValue === '') {
        conditionValue = andConditionValue
      }
      else {
        conditionValue = '('.concat(orConditionValue, ')&&').concat(andConditionValue)
      }

      if (conditionValue !== '') {
        conditionValue = `\${${conditionValue}}`
      }

      this.condition = conditionValue
      const element = this.element
      const bo = getBusinessObject(element)
      let parent = this.getExtensionElements(element)

      if (!parent && typeof this.createExtensionElements === 'function') {
        parent = this.createExtensionElements(element, bo)
      }

      const objList = []
      tableDatas.forEach((row) => {
        const condition = elementHelper.createElement(
          'flowable:Condition',
          row,
          parent,
          this.bpmnModeler.get('bpmnFactory'),
        )
        objList.push(condition)
      })
      const old = []

      if (this.element.businessObject.extensionElements) {
        this.element.businessObject.extensionElements.values.forEach((value) => {
          if (is(value, 'flowable:Condition')) {
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
    updateProperty(conditionValue) {
      if (this.element) {
        const values = {
          condition: conditionValue,
          conditionType: 'expression',
        }
        const conditionType = values.conditionType
        const commands = []
        const bo = getBusinessObject(this.element)
        const conditionalEventDefinition = eventDefinitionHelper.getConditionalEventDefinition(
          this.element,
        )

        if (!bo) {
          return
        }

        const conditionProps = {
          body: undefined,
        }
        const condition = values.condition
        conditionProps.body = condition
        let conditionOrConditionExpression

        if (conditionType) {
          conditionOrConditionExpression = elementHelper.createElement(
            'bpmn:FormalExpression',
            conditionProps,
            conditionalEventDefinition || bo,
            this.bpmnModeler.get('bpmnFactory'),
          )
          const source = this.element.source // if default-flow, remove default-property from source

          if (source && source.businessObject.default === bo) {
            commands.push(
              cmdHelper.updateProperties(source, {
                default: undefined,
              }),
            )
          }
        }

        const update = conditionalEventDefinition
          ? {
              condition: conditionOrConditionExpression,
            }
          : {
              conditionExpression: conditionOrConditionExpression,
            }
        this.bpmnModeler.get('modeling').updateProperties(this.element, update) //  commands.push(cmdHelper.updateBusinessObject(this.element, conditionalEventDefinition || bo, update))
      }
    },
  },
}
</script>

<template>
  <div v-if="enable">
    <el-radio-group
      v-model="conditionType"
      style="padding-left: 20px"
      size="mini"
    >
      <el-radio label="1">
        表单字段
      </el-radio>
      <el-radio label="2">
        流程表达式
      </el-radio>
    </el-radio-group>

    <el-divider />

    <el-form
      v-if="conditionType === '2'"
      ref="form"
      class="act-form"
      size="mini"
      label-width="100px"
    >
      <el-form-item :label="label">
        <el-input
          v-model="condition"
          class="input-with-select"
          placeholder="请输入流程表达式"
        >
          <el-button
            slot="append"
            icon="el-icon-search"
            @click="showSelectConditionDialog"
          />
        </el-input>
      </el-form-item>
    </el-form>

    <ConditionalDialog
      ref="conditionDialog"
      @setCondition="setCondition"
    />

    <div v-if="conditionType === '1'">
      <el-button
        style="margin-bottom: 5px; margin-left: 5px"
        type="primary"
        size="mini"
        @click="addCondition"
      >
        添加
      </el-button>

      <el-table
        :data="tableData"
        size="mini"
      >
        <el-table-column
          prop="field"
          label="字段"
          width="120"
        >
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.field"
              size="mini"
              placeholder="请选择"
            >
              <el-option
                v-for="(item, index) in fieldOption"
                :key="index"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column
          prop="compare"
          label="条件"
          width="120"
        >
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.compare"
              size="mini"
              placeholder="请选择"
            >
              <el-option
                value="<"
                label="小于"
              />
              <el-option
                value=">"
                label="大于"
              />
              <el-option
                value="<="
                label="小于等于"
              />
              <el-option
                value="="
                label="等于"
              />
              <el-option
                value=">="
                label="大于等于"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column
          prop="value"
          label="值"
        >
          <template slot-scope="scope">
            <el-input
              v-model="scope.row.value"
              size="mini"
              placeholder="请输入内容"
            />
          </template>
        </el-table-column>

        <el-table-column
          prop="logic"
          label="逻辑"
          width="80"
        >
          <template slot-scope="scope">
            <el-select
              v-model="scope.row.logic"
              size="mini"
              placeholder="请选择"
            >
              <el-option
                v-for="(item, index) in [
                  { label: '且', value: 'and' },
                  { label: '或', value: 'or' },
                ]"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </template>
        </el-table-column>

        <el-table-column
          :key="Math.random()"
          fixed="right"
          header-align="center"
          align="center"
          width="50"
          label="操作"
        >
          <template slot-scope="scope">
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
    </div>
  </div>
</template>
