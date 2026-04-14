<script>
import lib from 'bpmn-js-cli'
import propertiesPanelModule from 'bpmn-js-properties-panel' // 官方自带右侧属性板
import propertiesProviderModule from 'kaka-bpmn-js-properties-panel/lib/provider/flowable' // 自己写的flowable
import Modeler from 'kaka-bpmn/lib/Modeler' // 自己拷贝的jeeplus-bpmn模型,然后发布的自己的包

import { getBusinessObject, is } from 'kaka-bpmn/lib/util/ModelUtil'
import {
  appRestModels,
  appRestModelsEditorJson,
  extensionNodeSettingSave,
  extensionTaskDefExtensionSave,
  flowableModelDeploy,
  flowableModelSaveModel,
  flowableProcessExist,
  getBpmnXmlById,
} from '@/http/safe-production/flowable-api'
import customTranslate from './customTranslate/customTranslate'

import flowable from './flowable-bpmn-moddle/resources/flowable.json' // flowable描述json

import PaneRight from './right/PaneRight'
// 反编译的jeeplus的右侧属性板UI
export default {
  components: {
    PaneRight,
  },
  data() {
    return {
      loading: false,
      xmlData: '',
      zoomScale: 1, // 默认的缩放比例

      // bpmn建模器
      bpmnModeler: null,

      canvas: null,
      xmlStr: null,
      eventBus: null,
      processName: '',
      commandStack: null,
      modeling: null,
      modelId: '',
      category: '',
      currentConfig: undefined,
      activities: [],
      currentNode: undefined,
      element: null,
      key_in_database: null,
    }
  },
  computed: {
    canUndo() {
      return this.commandStack ? this.commandStack.canUndo() : false
    },
    canRedo() {
      return this.commandStack ? this.commandStack.canRedo() : false
    },
    cli() {
      return window.cli
    },
  },
  methods: {
    init(id, category) {
      this.element = null
      this.key_in_database = null

      if (category) {
        this.category = category
      }
      else {
        this.category = '未设置'
      }

      // 使用 $nextTick 确保 DOM 已经渲染完成
      this.$nextTick(() => {
        this.createModel()

        if (id) {
          this.modelId = id
          getBpmnXmlById(id).then(({ data }) => {
            this.createNewDiagram(data)
          })
        }
        else {
          this.modelId = null
          this.createNew()
        }
      })
    },
    updateProperty() {
      const obj = this.cli.element(this.currentNode.id)
      this.modeling.updateProperties(obj, {
        name: this.currentNode.name,
      })
    },
    createModel() {
      const canvas = this.$refs.canvas
      console.log(canvas)

      // 检查 canvas 元素是否存在
      if (!canvas) {
        console.error('Canvas element not found')
        this.$message.error('画布元素未找到，请检查组件是否正确渲染')
        return
      }

      const customTranslateModule = {
        translate: ['value', customTranslate],
      }

      try {
        // 建模，官方文档这里讲的很详细
        this.bpmnModeler = new Modeler({
          container: canvas,
          keyboard: {
            bindTo: window,
          },
          additionalModules: [
            propertiesPanelModule,
            propertiesProviderModule,
            customTranslateModule,
            lib,
          ],
          cli: {
            bindTo: 'cli',
          },
          moddleExtensions: {
            flowable,
          },
        })

        this.modeling = this.bpmnModeler.get('modeling')
        this.bpmnFactory = this.bpmnModeler.get('bpmnFactory')
        this.elementRegistry = this.bpmnModeler.get('elementRegistry')
        this.commandStack = this.bpmnModeler.get('commandStack')
        this.canvas = this.bpmnModeler.get('canvas')
        this.overlays = this.bpmnModeler.get('overlays')
        this.eventBus = this.bpmnModeler.get('eventBus')

        this.eventBus.on('element.click', 0, (event) => {
          const el = event.element
          const node = el.businessObject
          this.currentNode = node
          this.element = el

          return true
        })

        console.log('BPMN Modeler initialized successfully')
      }
      catch (error) {
        console.error('Failed to initialize BPMN Modeler:', error)
        this.$message.error(`初始化 BPMN 建模器失败: ${error.message}`)
      }
    },
    createNewDiagram(bpmnXmlStr) {
      // 检查 bpmnModeler 是否已初始化
      if (!this.bpmnModeler) {
        console.error('BPMN Modeler is not initialized yet')
        this.$message.error('BPMN 建模器尚未初始化，请稍后重试')
        return
      }

      // 将字符串转换成图显示出来
      this.bpmnModeler.importXML(bpmnXmlStr, (err) => {
        if (err) {
          console.error(err)
          this.$message.error(`导入 BPMN 图表失败: ${err.message}`)
          return
        }

        if (this.element === null) {
          // use RootElement of BPMN diagram to generate properties panel if no element is selected
          this.element = this.bpmnModeler.get('canvas').getRootElement()
          this.key_in_database = this.element.id
        }
      })
    },
    openLocal() {
      document.getElementById('btn_file').click()
    },
    createNew() {
      this.openDiagram('')
    },
    showBPMN() {
      const file = document.getElementById('btn_file').files[0]
      const URL = window.URL || window.webkitURL
      const imgURL = URL.createObjectURL(file)
      const request = new XMLHttpRequest()
      request.open('GET', imgURL, true)

      request.onload = () => {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          this.openDiagram(request.responseText)
        }
        else {
          // We reached our target server, but it returned an error
        }
      }

      request.onerror = function () {
        // There was a connection error of some sort
      }

      request.send()
    },
    openDiagram(bpmnXML) {
      if (bpmnXML === '' || bpmnXML === null) {
        const index = new Date().getTime()
        const index2 = new Date().getTime() + 56823
        bpmnXML
          = `<?xml version="1.0" encoding="UTF-8"?>`
            + `<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:flowable="http://flowable.org/bpmn" id="sample-diagram" targetNamespace="http://www.flowable.org/processdef" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd">`
            + `<bpmn2:process id="Process_${index}" name="流程_${index}">`
            + `<bpmn2:startEvent id="StartEvent_${index2}" name="开始" flowable:initiator="applyUserId" />`
            + `</bpmn2:process>`
            + `<bpmndi:BPMNDiagram id="BPMNDiagram_1">`
            + `<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${index}">`
            + `<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_${index2}">`
            + `<dc:Bounds x="209" y="283" width="36" height="36" />`
            + `<bpmndi:BPMNLabel>`
            + `<dc:Bounds x="217" y="326" width="22" height="14" />`
            + `</bpmndi:BPMNLabel>`
            + `</bpmndi:BPMNShape>`
            + `</bpmndi:BPMNPlane>`
            + `</bpmndi:BPMNDiagram>`
            + `</bpmn2:definitions>`
      }

      // 检查 bpmnModeler 是否已初始化
      if (!this.bpmnModeler) {
        console.error('BPMN Modeler is not initialized yet')
        this.$message.error('BPMN 建模器尚未初始化，请稍后重试')
        return
      }

      // import diagram
      this.bpmnModeler.importXML(bpmnXML, (err) => {
        if (err) {
          console.error('could not import BPMN 2.0 diagram', err)
          this.$message.error(`导入 BPMN 图表失败: ${err.message}`)
          return
        }

        // use RootElement of BPMN diagram to generate properties panel if no element is selected
        this.element = this.bpmnModeler.get('canvas').getRootElement()
      })
    },
    save(deployFn) {
      const root = this.bpmnModeler.get('canvas').getRootElement().businessObject

      if (!this.modelId) {
        appRestModels({
          modelType: 0,
          key: root.id,
          name: root.name,
          description:
            root.documentation && root.documentation[0] && root.documentation[0].text
              ? root.documentation[0].text
              : '',
        }).then(({ data }) => {
          this.modelId = data.id

          this.saveXML(deployFn)
        })
      }
      else {
        if (this.modelId && root.id !== this.key_in_database) {
          flowableProcessExist(this.key_in_database).then(({ data }) => {
            if (data.exist === '1') {
              this.$confirm(
                '该流程已经发布, 你修改了流程id，将创建一个新流程, 是否继续?',
                '提示',
                {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning',
                },
              )
                .then(() => {
                  appRestModels({
                    modelType: 0,
                    key: root.id,
                    name: root.name,
                    description:
                      root.documentation
                      && root.documentation[0]
                      && root.documentation[0].text
                        ? root.documentation[0].text
                        : '',
                  }).then(({ data }) => {
                    this.modelId = data.id

                    this.saveXML(deployFn)
                  })
                })
                .catch(() => {
                  this.$message({
                    type: 'info',
                    message: '已取消',
                  })
                })
            }
            else {
              this.saveXML(deployFn)
            }
          })
        }
        else {
          this.saveXML(deployFn)
        }
      }
    },
    saveXML(deployFn) {
      this.bpmnModeler.saveXML({ format: true }, (err, xml) => {
        const loading = this.$loading({
          lock: true,
          text: 'Loading',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)',
        })
        appRestModelsEditorJson(this.modelId, new Date().getTime()).then(({ data }) => {
          const root = this.bpmnModeler.get('canvas').getRootElement().businessObject

          flowableModelSaveModel(this.modelId, {
            modeltype: 'model',
            json_xml: xml,
            name: root.name,
            key: root.id,
            description:
              root.documentation && root.documentation[0] && root.documentation[0].text
                ? root.documentation[0].text
                : '',
            newversion: false,
            comment: '',
            lastUpdated: data.lastUpdated,
          }).then(({ data }) => {
            if (data.id) {
              this.key_in_database = root.id

              this.saveExtension()

              if (typeof deployFn === 'function') {
                setTimeout(() => {
                  deployFn(this.modelId)
                }, 2000)
              }
              else {
                this.$message.success('保存成功!')

                loading.close()
              }

              this.$emit('refreshList')
            }
            else {
              loading.close()
            }
          })
        })
      })
    },
    saveExtension() {
      const root = this.bpmnModeler.get('canvas').getRootElement().businessObject
      const processDefId = root.id
      const nodeSettingList = []
      const taskDefExtensionList = []
      const errorMsg = []
      root.flowElements.forEach((flowElement) => {
        if (is(flowElement, 'bpmn:UserTask') || is(flowElement, 'bpmn:SequenceFlow')) {
          const taskDefId = flowElement.id // 处理button

          const flowButtonList = [] // 处理assginee

          const flowAssigneeList = [] // 处理condition

          const flowConditionList = []

          if (flowElement.extensionElements) {
            flowElement.extensionElements.values.forEach((element) => {
              if (is(element, 'flowable:Button')) {
                const obj = {
                  'code': element.code,
                  'isHide': element.isHide,
                  'id': '',
                  'taskDef.id': '',
                  'name': element.name,
                  'sort': element.sort,
                  'next': element.next,
                }
                flowButtonList.push(obj)
              }

              if (is(element, 'flowable:Assignee')) {
                const _obj = {
                  'type': element.type,
                  'value': element.value,
                  'id': '',
                  'taskDef.id': '',
                  'condition': element.condition,
                  'sort': element.sort,
                  'operationType': element.operationType,
                }
                flowAssigneeList.push(_obj)
              }

              if (is(element, 'flowable:Condition')) {
                const _obj2 = {
                  'field': element.field,
                  'compare': element.compare,
                  'id': '',
                  'taskDef.id': '',
                  'value': element.value,
                  'sort': element.sort,
                  'logic': element.logic,
                }
                flowConditionList.push(_obj2)
              }
            })

            if (is(flowElement, 'bpmn:UserTask')) {
              if (flowAssigneeList.length === 0) {
                errorMsg.push(
                  '\u8282\u70B9\u3010'.concat(
                    flowElement.name || flowElement.id,
                    '\u3011\u6CA1\u6709\u6307\u5B9A\u529E\u7406\u4EBA\u3002<br/>',
                  ),
                )
              }

              if (flowButtonList.length === 0) {
                errorMsg.push(
                  '\u8282\u70B9\u3010'.concat(
                    flowElement.name || flowElement.id,
                    '\u3011\u6CA1\u6709\u914D\u7F6E\u6309\u94AE\u3002<br/>',
                  ),
                )
              }
            }

            if (
              (flowAssigneeList.length > 0
                || flowConditionList.length > 0
                || flowButtonList.length > 0)
              && taskDefId
            ) {
              taskDefExtensionList.push({
                processDefId,
                taskDefId,
                flowButtonList,
                flowConditionList,
                flowAssigneeList,
              })
            }
          }
          else {
            if (is(flowElement, 'bpmn:UserTask')) {
              errorMsg.push(
                '\u8282\u70B9\u3010'.concat(
                  flowElement.name || flowElement.id,
                  '\u3011\u6CA1\u6709\u6307\u5B9A\u529E\u7406\u4EBA\u3002<br/>',
                ),
              )
              errorMsg.push(
                '\u8282\u70B9\u3010'.concat(
                  flowElement.name || flowElement.id,
                  '\u3011\u6CA1\u6709\u914D\u7F6E\u6309\u94AE\u3002<br/>',
                ),
              )
            }
          }
        }

        if (
          (is(flowElement, 'bpmn:StartEvent')
            && !is(flowElement.parent, 'bpmn:SubProcess'))
          || is(flowElement, 'bpmn:UserTask')
        ) {
          const _taskDefId = flowElement.id
          var bo = getBusinessObject(flowElement)
          const formReadOnly = bo.get('flowable:formReadOnly')
          const formType = bo.get('flowable:formType')

          if (!bo.get('flowable:formKey')) {
            errorMsg.push(
              '\u8282\u70B9\u3010'.concat(
                flowElement.name || flowElement.id,
                '\u3011\u6CA1\u6709\u914D\u7F6E\u8868\u5355\u3002<br/>',
              ),
            )
          }

          if (_taskDefId) {
            nodeSettingList.push({
              processDefId,
              taskDefId: _taskDefId,
              key: 'formReadOnly',
              value: formReadOnly,
            })
            nodeSettingList.push({
              processDefId,
              taskDefId: _taskDefId,
              key: 'formType',
              value: formType,
            })
          }
        }

        if (is(flowElement, 'bpmn:SequenceFlow')) {
          const _taskDefId2 = flowElement.id
          var bo = getBusinessObject(flowElement)
          const conditionType = bo.get('flowable:conditionType')

          if (conditionType) {
            nodeSettingList.push({
              processDefId,
              taskDefId: _taskDefId2,
              key: 'conditionType',
              value: conditionType,
            })
          }
        }
      })
      extensionTaskDefExtensionSave(JSON.stringify(taskDefExtensionList)).then(() => {})
      extensionNodeSettingSave(JSON.stringify(nodeSettingList)).then(() => {})

      if (errorMsg.length > 0) {
        this.$notify({
          title: '提示',
          type: 'warning',
          dangerouslyUseHTMLString: true,
          message: errorMsg.join(''),
          duration: 20000,
        })
      }
    },
    saveAndDeploy() {
      this.$confirm(
        '\u786E\u8BA4\u8981\u4FDD\u5B58\u5E76\u53D1\u5E03\u6D41\u7A0B\u5417?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        },
      ).then(() => {
        this.save(this.deploy)
      })
    },
    // 部署
    deploy(id) {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)',
      })
      flowableModelDeploy({
        id,
        category: this.category,
      })
        .then(({ data }) => {
          if (data && data.success) {
            this.$message.success({
              dangerouslyUseHTMLString: true,
              message: data.msg,
            })

            this.$emit('refreshList')
          }

          loading.close()
        })
        .catch(() => {
          loading.close()
        })
    },

    // ************************************  撤销、恢复、 缩放、重置相关 begin  ************************************
    // 放大、缩小、重置
    zoomFn(v) {
      if (v === 1) {
        this.zoomScale = 1
      }
      else if (
        (this.zoomScale > 0.2 && v === -0.1)
        || (this.zoomScale < 2 && v === 0.1)
      ) {
        this.zoomScale += v
      }

      this.bpmnModeler.get('canvas').zoom(this.zoomScale)
    },
    // 撤销
    processUndo() {
      this.bpmnModeler.get('commandStack').undo()
    },
    // 恢复
    processRedo() {
      this.bpmnModeler.get('commandStack').redo()
    },
    // ************************************  撤销、恢复、 缩放、重置相关 end  ************************************

    // ************************************  下载相关 begin  ************************************
    // 下载流程图
    saveSvg() {
      this.downloadProcess('svg')
    },
    // 下载流程文件
    saveDiagram() {
      this.downloadProcess('bpmn')
    },
    // 下载的 公共函数
    async downloadProcess(type, name) {
      try {
        // 按需要类型创建文件并下载
        if (type === 'xml' || type === 'bpmn') {
          const { err, xml } = await this.bpmnModeler.saveXML()
          // 读取异常时抛出异常
          if (err) {
            console.error(`[Process Designer Warn ]: ${err.message || err}`)
          }
          const { href, filename } = this.setEncoded(type, name, xml)
          this.downloadFunc(href, filename)
        }
        else {
          const { err, svg } = await this.bpmnModeler.saveSVG()
          // 读取异常时抛出异常
          if (err) {
            return console.error(err)
          }
          const { href, filename } = this.setEncoded('svg', name, svg)
          this.downloadFunc(href, filename)
        }
      }
      catch (e) {
        console.error(`[Process Designer Warn ]: ${e.message || e}`)
      }
    },
    setEncoded(type, filename = 'diagram', data) {
      const encodedData = encodeURIComponent(data)
      return {
        filename: `${filename}.${type}`,
        href: `data:application/${
          type === 'svg' ? 'text/xml' : 'bpmn20-xml'
        };charset=UTF-8,${encodedData}`,
        data,
      }
    },
    downloadFunc(href, filename) {
      if (href && filename) {
        const a = document.createElement('a')
        a.download = filename // 指定下载的文件名
        a.href = href //  URL对象
        a.click() // 模拟点击
        URL.revokeObjectURL(a.href) // 释放URL 对象
      }
    },
    // ************************************  下载相关 end  ************************************
  },
}
</script>

<template>
  <el-row class="self-bpmn">
    <!-- 左侧 -->
    <el-col :span="16" class="leftDraw">
      <!-- 头部功能区 -->
      <div class="topFunc">
        <el-button-group>
          <el-button size="mini" type="primary" @click="saveAndDeploy">
            保存并发布
          </el-button>
          <el-button size="mini" type="primary" @click="save">
            保存草稿
          </el-button>

          <input id="btn_file" style="display: none" type="file" @change="showBPMN">
          <el-tooltip content="打开流程文件">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-folder-opened"
              @click="openLocal"
            />
          </el-tooltip>
          <el-tooltip content="创建新的流程图">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-circle-plus"
              @click="createNew"
            />
          </el-tooltip>
          <el-tooltip content="下载流程图">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-picture"
              @click="saveSvg"
            />
          </el-tooltip>
          <el-tooltip content="下载流程文件">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-download"
              @click="saveDiagram"
            />
          </el-tooltip>
        </el-button-group>

        <el-button-group class="secGroup" style="margin-left: 10px">
          <el-tooltip content="撤销">
            <el-button size="mini" icon="el-icon-refresh-left" @click="processUndo" />
          </el-tooltip>
          <el-tooltip content="恢复">
            <el-button size="mini" icon="el-icon-refresh-right" @click="processRedo" />
          </el-tooltip>
          <el-tooltip content="放大">
            <el-button size="mini" icon="el-icon-zoom-in" @click="zoomFn(0.1)" />
          </el-tooltip>
          <el-tooltip content="缩小">
            <el-button size="mini" icon="el-icon-zoom-out" @click="zoomFn(-0.1)" />
          </el-tooltip>
          <el-tooltip content="重置">
            <el-button size="mini" icon="el-icon-rank" @click="zoomFn(1)" />
          </el-tooltip>
        </el-button-group>
      </div>

      <!-- 流程设计区域 -->
      <div ref="canvas" v-loading="loading" class="canvas-con" />
    </el-col>

    <!-- 右侧 -->
    <el-col :span="8" class="rightPanel">
      <PaneRight :bpmnModeler="bpmnModeler" :element="element" />
    </el-col>
  </el-row>
</template>

<style lang="css">
@import "lib/kaka-flowable.css";
@import "kaka-bpmn/dist/assets/diagram-js.css";
</style>

<style lang="scss" scoped>
.self-bpmn {
  height: 100%;
  padding: 10px;
  box-sizing: border-box;

  .leftDraw {
    display: flex;
    flex-direction: column;
    height: 100%;
    .topFunc {
      padding: 1.5vh;
      .secGroup {
        i {
          font-weight: bold;
        }
      }
    }
    .canvas-con {
      flex: 1;
      border-right: 1px solid #e8e8e8;
      margin-right: 10px;
      // 隐藏右下角logo
      .bjs-powered-by {
        display: none;
      }
    }
  }

  .el-table {
    border-top: 1px solid #ebeef5;
    .el-table__header {
      thead tr {
        background-color: #f6f7fa;
        font-weight: 400;
        th {
          background-color: #f6f7fa;
          font-weight: 400;
        }
      }
    }
  }
}
.dialog-selfBpmn {
  .el-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: calc(100% - 30px);
    max-width: calc(100% - 30px);
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    .el-dialog__header {
      border-bottom: 1px solid #e8e8e8;
    }
    .el-dialog__body {
      overflow: auto;
    }
    .el-dialog__footer {
      border-top: 1px solid #e8e8e8;
      border-radius: 0 0 4px 4px;
    }

    .el-table {
      border-top: 1px solid #ebeef5;
      .el-table__header {
        thead tr {
          background-color: #f6f7fa;
          font-weight: 400;
          th {
            background-color: #f6f7fa;
            font-weight: 400;
          }
        }
      }
    }
  }
}
</style>
