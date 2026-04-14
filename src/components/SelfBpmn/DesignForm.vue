<script>
import Modeler from 'kaka-bpmn/lib/Modeler'
import { getBusinessObject, is } from 'kaka-bpmn/lib/util/ModelUtil'

export default {
  name: 'designForm',
  components: {
    PaneRight,
  },
  props: {
    title: {
      type: String,
      default: 'JEEPLUS 流程设计器',
    },
  },
  data() {
    return {
      // bpmn建模器
      bpmnModeler: null,
      container: null,
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
      visible: false,
      key_in_database: null,
      state: {
        scale: 1, // 流程图比例
      },
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
  // watch: {
  //   'currentNode.name' (value) {
  //     console.log(value)
  //     this.$refs.right.init(this.currentNode)
  //   }
  // },
  methods: {
    init(id, category) {
      this.element = null
      this.visible = true
      this.key_in_database = null

      if (category) {
        this.category = category
      }
      else {
        this.category = '未设置'
      }

      this.$nextTick(() => {
        this.createModel()

        if (id) {
          this.modelId = id
          this.$http.get('/flowable/model/getBpmnXml?id='.concat(id)).then((_ref) => {
            const data = _ref.data
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
      // 获取到属性ref为“content”的dom节点
      this.container = this.$refs.content

      // 获取到属性ref为“canvas”的dom节点
      const canvas = this.$refs.canvas

      const customTranslateModule = {
        translate: ['value', customTranslate],
      }

      // 建模，官方文档这里讲的很详细
      this.bpmnModeler = new Modeler({
        container: canvas,
        keyboard: {
          bindTo: window,
        },
        additionalModules: [
          flowable_default.a,
          _jp_bpmn_js_properties_panel_5_2_8_jp_bpmn_js_properties_panel_default.a,
          customTranslateModule,
          lib,
        ],
        cli: {
          bindTo: 'cli',
        },
        moddleExtensions: {
          flowable: resources_flowable,
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
        // return false // will cancel event
        const el = event.element
        const node = el.businessObject
        this.currentNode = node
        this.element = el

        // if (is(el, 'bpmn:Process')) {
        //   let operator = operatorList.find(item => item.id === 9)
        //   if (operator) {
        //     this.currentConfig = operator
        //   } else {
        //     this.currentConfig = undefined
        //   }
        // }

        return true
      })

      // 下载画图
      // 获取a标签dom节点
      const downloadLink = this.$refs.saveDiagram
      const downloadSvgLink = this.$refs.saveSvg
      this.commandStack = this.bpmnModeler.get('commandStack')

      // 给图绑定事件，当图有发生改变就会触发这个事件
      this.bpmnModeler.on('commandStack.changed', () => {
        this.saveSVG((err, svg) => {
          this.setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg)
        })

        this.saveDiagram((err, xml) => {
          this.setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml)
        })
      })
    },
    createNewDiagram(bpmnXmlStr) {
      // 获取a标签dom节点
      const downloadLink = this.$refs.saveDiagram
      const downloadSvgLink = this.$refs.saveSvg

      // 将字符串转换成图显示出来
      this.bpmnModeler.importXML(bpmnXmlStr, (err) => {
        this.saveSVG((err, svg) => {
          this.setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg)
        })

        this.saveDiagram((err, xml) => {
          this.setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml)
        })

        if (err) {
          console.error(err)
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
            + `<bpmn2:process id="Process_${
              index
            }" name="流程_${
              index
            }">`
            + `<bpmn2:startEvent id="StartEvent_${
              index2
            }" name="开始" flowable:initiator="applyUserId" />`
            + `</bpmn2:process>`
            + `<bpmndi:BPMNDiagram id="BPMNDiagram_1">`
            + `<bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_${
              index
            }">`
            + `<bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_${
              index2
            }">`
            + `<dc:Bounds x="209" y="283" width="36" height="36" />`
            + `<bpmndi:BPMNLabel>`
            + `<dc:Bounds x="217" y="326" width="22" height="14" />`
            + `</bpmndi:BPMNLabel>`
            + `</bpmndi:BPMNShape>`
            + `</bpmndi:BPMNPlane>`
            + `</bpmndi:BPMNDiagram>`
            + `</bpmn2:definitions>`
      }

      // import diagram
      this.bpmnModeler.importXML(bpmnXML, (err) => {
        if (err) {
          console.error('could not import BPMN 2.0 diagram', err)
        }

        // use RootElement of BPMN diagram to generate properties panel if no element is selected
        this.element = this.bpmnModeler.get('canvas').getRootElement()
      })
    },
    save(deployFn) {
      const root = this.bpmnModeler.get('canvas').getRootElement().businessObject

      if (!this.modelId) {
        this.$http({
          url: '/app/rest/models',
          method: 'post',
          // 发送格式为json
          data: {
            modelType: 0,
            key: root.id,
            name: root.name,
            description:
              root.documentation && root.documentation[0] && root.documentation[0].text
                ? root.documentation[0].text
                : '',
          },
          headers: {
            'Content-Type': 'application/json',
          },
        }).then((_ref2) => {
          const data = _ref2.data
          this.modelId = data.id

          this.saveXML(deployFn)
        })
      }
      else {
        if (this.modelId && root.id !== this.key_in_database) {
          this.$http
            .get('/flowable/process/exist', {
              params: {
                key: this.key_in_database,
              },
            })
            .then((_ref3) => {
              const data = _ref3.data

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
                    this.$http({
                      url: '/app/rest/models',
                      method: 'post',
                      // 发送格式为json
                      data: {
                        modelType: 0,
                        key: root.id,
                        name: root.name,
                        description:
                          root.documentation
                          && root.documentation[0]
                          && root.documentation[0].text
                            ? root.documentation[0].text
                            : '',
                      },
                      headers: {
                        'Content-Type': 'application/json',
                      },
                    }).then((_ref4) => {
                      const data = _ref4.data
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

        this.$http
          .get(
            '/app/rest/models/'
              .concat(this.modelId, '/editor/json?version=')
              .concat(new Date().getTime()),
          )
          .then((_ref5) => {
            const data = _ref5.data

            const root = this.bpmnModeler.get('canvas').getRootElement().businessObject

            this.$http
              .post('/flowable/model/saveModel/'.concat(this.modelId), {
                modeltype: 'model',
                json_xml: xml,
                name: root.name,
                key: root.id,
                description:
                  root.documentation
                  && root.documentation[0]
                  && root.documentation[0].text
                    ? root.documentation[0].text
                    : '',
                newversion: false,
                comment: '',
                lastUpdated: data.lastUpdated,
              })
              .then((_ref6) => {
                const data = _ref6.data

                if (data.id) {
                  this.key_in_database = root.id

                  this.saveExtension()

                  if (deployFn) {
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
      this.$http({
        url: '/extension/taskDefExtension/save',
        method: 'post',
        // 发送格式为json
        data: JSON.stringify(taskDefExtensionList),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((_ref7) => {
        const data = _ref7.data
      })

      this.$http({
        url: '/extension/nodeSetting/save',
        method: 'post',
        // 发送格式为json
        data: JSON.stringify(nodeSettingList),
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((_ref8) => {
        const data = _ref8.data
      })

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
      this.$http
        .post('/flowable/model/deploy', {
          id,
          category: this.category,
        })
        .then((_ref9) => {
          const data = _ref9.data

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
    // 下载为SVG格式,done是个函数，调用的时候传入的
    saveSVG(done) {
      // 把传入的done再传给bpmn原型的saveSVG函数调用
      this.bpmnModeler.saveSVG(done)
    },
    // 下载为SVG格式,done是个函数，调用的时候传入的
    saveDiagram(done) {
      // 把传入的done再传给bpmn原型的saveXML函数调用
      this.bpmnModeler.saveXML({ format: true }, (err, xml) => {
        done(err, xml)
      })
    },
    // 当图发生改变的时候会调用这个函数，这个data就是图的xml
    setEncoded(link, name, data) {
      // 把xml转换为URI，下载要用到的
      const encodedData = encodeURIComponent(data) // 获取到图的xml，保存就是把这个xml提交给后台

      this.xmlStr = data // 下载图的具体操作,改变a的属性，className令a标签可点击，href令能下载，download是下载的文件的名字

      if (data) {
        // link.className = 'active'
        link.href = `data:application/bpmn20-xml;charset=UTF-8,${encodedData}`
        link.download = name
      }
    },
    undo() {
      window.cli.undo()
    },
    redo() {
      window.cli.redo()
    },
    // 流程图放大缩小
    handleZoom(radio) {
      // const newScale = !radio
      //       ? 1.0 // 不输入radio则还原
      //       : this.state.scale + radio <= 0.2 // 最小缩小倍数
      //       ? 0.2
      //       : this.state.scale + radio
      if (radio === 1) {
        this.state.scale = 1
      }
      else if (
        (this.state.scale > 0.2 && radio === -0.1)
        || (this.state.scale < 2 && radio === 0.1)
      ) {
        this.state.scale = this.state.scale + radio
      }

      this.bpmnModeler.get('canvas').zoom(this.state.scale)
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      class="design"
      width="100%"
      height="100%"
      :title="title"
      :close-on-click-modal="false"
      :visible.sync="visible"
    >
      <el-container>
        <el-container>
          <el-header class="dmHeader">
            <el-button-group>
              <el-tooltip
                class="item"
                effect="dark"
                content="保存并发布"
                placement="bottom"
              >
                <el-button
                  type="primary"
                  size="mini"
                  @click="saveAndDeploy"
                >
                  <span class="fa fa-save">保存并发布</span>
                </el-button>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="保存草稿"
                placement="bottom"
              >
                <el-button
                  type="primary"
                  size="mini"
                  @click="save"
                >
                  <span class="fa fa-save">保存草稿</span>
                </el-button>
              </el-tooltip>

              <input
                id="btn_file"
                style="display: none"
                type="file"
                @change="showBPMN"
              >

              <el-tooltip
                class="item"
                effect="dark"
                content="打开流程文件"
                placement="bottom"
              >
                <el-button
                  type="primary"
                  size="mini"
                  @click="openLocal"
                >
                  <span class="fa fa-folder-open" />
                </el-button>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="创建新的流程图"
                placement="bottom"
              >
                <el-button
                  type="primary"
                  size="mini"
                  @click="createNew"
                >
                  <i class="fa fa-plus-circle" />
                </el-button>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="下载流程图"
                placement="bottom"
              >
                <a
                  ref="saveSvg"
                  class="el-button el-button--primary el-button--small"
                  href="javascript:"
                >
                  <i class="fa fa-picture-o" />
                </a>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="下载流程文件"
                placement="bottom"
              >
                <a
                  ref="saveDiagram"
                  class="el-button el-button--primary el-button--small"
                  href="javascript:"
                >
                  <i class="fa fa-download" />
                </a>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="撤销"
                placement="bottom"
              >
                <el-button
                  size="mini"
                  :disabled="!canUndo"
                  @click="undo"
                >
                  <span class="fa fa-rotate-left" />
                </el-button>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="恢复"
                placement="bottom"
              >
                <el-button
                  size="mini"
                  :disabled="!canRedo"
                  @click="redo"
                >
                  <span class="fa fa-rotate-right" />
                </el-button>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="放大"
                placement="bottom"
              >
                <el-button size="mini" @click="handleZoom(0.1)">
                  <span class="fa fa-search-plus" />
                </el-button>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="缩小"
                placement="bottom"
              >
                <el-button
                  size="mini"
                  plain
                  @click="handleZoom(-0.1)"
                >
                  <span class="fa fa-search-minus" />
                </el-button>
              </el-tooltip>

              <el-tooltip
                class="item"
                effect="dark"
                content="重置"
                placement="bottom"
              >
                <el-button
                  size="mini"
                  plain
                  @click="handleZoom(1)"
                >
                  <span class="fa fa-arrows" />
                </el-button>
              </el-tooltip>
            </el-button-group>
          </el-header>

          <el-main class="dmMain">
            <div ref="canvas" class="canvas" />
          </el-main>
        </el-container>

        <el-aside class="dmAside">
          <PaneRight
            ref="right"
            :element="element"
            :bpmnModeler="bpmnModeler"
          />
        </el-aside>
      </el-container>
    </el-dialog>
  </div>
</template>
