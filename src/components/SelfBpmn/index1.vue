<script>
import lib from 'bpmn-js-cli'
import propertiesPanelModule from 'bpmn-js-properties-panel' // 官方自带右侧属性板
import propertiesProviderModule from 'kaka-bpmn-js-properties-panel/lib/provider/flowable' // 自己写的flowable
import Modeler from 'kaka-bpmn/lib/Modeler' // 自己拷贝的jeeplus-bpmn模型,然后发布的自己的包

import customTranslate from './customTranslate/customTranslate'
import flowable from './flowable-bpmn-moddle/resources/flowable.json' // flowable描述json
import PaneRight from './right/PaneRight' // 反编译的jeeplus的右侧属性板UI

export default {
  components: {
    PaneRight,
  },
  data() {
    return {
      bpmnModeler: null,
      element: null,
      loading: false,
      xmlData: '',
      zoomScale: 1, // 默认的缩放比例

      currentNode: undefined,

      modeling: null,
      bpmnFactory: null,
      elementRegistry: null,
      commandStack: null,
      canvas: null,
      overlays: null,
      eventBus: null,
    }
  },
  methods: {
    // 获取xml数据
    getXmlData() {
      return new Promise((resolve) => {
        setTimeout(() => {
          const url = ''
          resolve(url)
        }, 1000)
      })
    },
    async init(id, category) {
      this.element = null

      // 请求 后台的 流程图数据
      this.loading = true
      this.xmlData = await this.getXmlData()
      this.loading = false

      // 初始化流程图
      this.initBpmn()
    },
    // 初始化流程图
    initBpmn() {
      const customTranslateModule = {
        translate: ['value', customTranslate],
      }
      this.bpmnModeler = new Modeler({
        container: this.$refs.canvas_design,
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

      // 根据数据 生成 流程图内容
      this.genDiagram()
    },
    // 根据数据 生成 流程图
    genDiagram() {
      let dt = this.xmlData
      if (!this.xmlData) {
        const index = new Date().getTime()
        const index2 = new Date().getTime() + 56823
        dt
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

      this.bpmnModeler.importXML(dt, (err) => {
        if (err) {
          console.error(err)
        }
        else {
          this.successFn()
        }
      })
    },
    successFn() {
      // 让图能自适应屏幕
      this.canvas.zoom('fit-viewport')
      this.element = this.canvas.getRootElement()
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
          <el-button size="mini" type="primary">
            保存并发布
          </el-button>
          <el-button size="mini" type="primary">
            保存草稿
          </el-button>
          <el-tooltip content="打开流程文件">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-folder-opened"
            />
          </el-tooltip>
          <el-tooltip content="创建新的流程图">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-circle-plus"
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
            <el-button
              size="mini"
              icon="el-icon-refresh-left"
              @click="processUndo"
            />
          </el-tooltip>
          <el-tooltip content="恢复">
            <el-button
              size="mini"
              icon="el-icon-refresh-right"
              @click="processRedo"
            />
          </el-tooltip>
          <el-tooltip content="放大">
            <el-button
              size="mini"
              icon="el-icon-zoom-in"
              @click="zoomFn(0.1)"
            />
          </el-tooltip>
          <el-tooltip content="缩小">
            <el-button
              size="mini"
              icon="el-icon-zoom-out"
              @click="zoomFn(-0.1)"
            />
          </el-tooltip>
          <el-tooltip content="重置">
            <el-button
              size="mini"
              icon="el-icon-rank"
              @click="zoomFn(1)"
            />
          </el-tooltip>
        </el-button-group>
      </div>

      <!-- 流程设计区域 -->
      <div
        ref="canvas_design"
        v-loading="loading"
        class="canvas-con"
      />
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

  .leftDraw {
    border-right: 1px solid #e8e8e8;
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
      // padding: 10px 0 0 10px;
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
