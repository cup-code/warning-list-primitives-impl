<script>
import IViewer_Modeler from 'kaka-bpmn/lib/IViewer'
import {
  getFlowableProcessFlowChart,
  getFlowableTaskFlowChart,
} from '@/http/safe-production/flowable-api'

export default {
  name: 'flowChart',
  props: {
    processInstanceId: String,
    processDefId: String,
  },
  data() {
    return {
      // bpmn建模器
      viewer: null,
      bpmnModeler: null,
      container: null,
      canvas: null,
      xmlStr: null,
      eventBus: null,
      processName: '',
      commandStack: null,
      modeling: null,
      elementRegistry: null,
      currentConfig: undefined,
      activities: [],
      currentNode: undefined,
      element: null,
    }
  },
  mounted() {
    this.createModel()
  },
  methods: {
    init() {
      this.$nextTick(() => {
        if (this.processInstanceId) {
          getFlowableTaskFlowChart(this.processInstanceId).then(({ data }) => {
            this.createNewDiagram(data)
          })
        }

        if (this.processDefId) {
          getFlowableProcessFlowChart(this.processDefId).then(({ data }) => {
            this.createNewDiagram(data)
          })
        }
      })
    },
    createModel() {
      // 获取到属性ref为“canvas”的dom节点
      const canvas = this.$refs.canvas
      this.viewer = new IViewer_Modeler({
        container: canvas,
        additionalModules: [],
      })
      this.elementRegistry = this.viewer.get('elementRegistry')
      this.modeling = this.viewer.get('modeling')
    },
    createNewDiagram(data) {
      this.viewer.importXML(data.bpmnXml, (err) => {
        if (err) {
          console.error(err)
        }
        else {
          this.viewer.get('canvas').zoom('fit-viewport') // Option 2: Color via BPMN 2.0 Extension

          if (data.activityIds) {
            const last = data.activityIds.pop()

            const elementToColor = this.elementRegistry.get(last)

            if (!last.startsWith('EndEvent')) {
              this.modeling.setColor([elementToColor], {
                'stroke': 'red',
                'stroke-width': '0.8px',
                'fill': 'white',
                'fill-opacity': '0.95',
              })
            }
            else {
              this.modeling.setColor([elementToColor], {
                'stroke': 'rgb(64, 158, 255)',
                'stroke-width': '0.8px',
                'fill': 'white',
                'fill-opacity': '0.95',
              })
            }

            data.activityIds.forEach((activity) => {
              const elementToColor = this.elementRegistry.get(activity)

              this.modeling.setColor([elementToColor], {
                'stroke': 'rgb(64, 158, 255)',
                'stroke-width': '0.8px',
                'fill': 'white',
                'fill-opacity': '0.95',
              })
            })
          }

          if (data.flows) {
            data.flows.forEach((activity) => {
              const elementToColor = this.elementRegistry.get(activity)

              this.modeling.setColor([elementToColor], {
                'stroke': 'rgb(64, 158, 255)',
                'stroke-width': '0.9px',
                'fill': 'white',
                'fill-opacity': '0.95',
              })
            })
          }
        }
      })
    },
  },
}
</script>

<template>
  <div
    ref="canvas"
    class="canvas"
  />
</template>

<style lang="scss" scoped>
.canvas {
  width: 100%;
  height: 700px;
}
</style>
