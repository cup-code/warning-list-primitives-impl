<!--
 * @Author: lide1202@hotmail.com
 * @Date: 2021-3-13 11:04:24
 * @Last Modified by:   lide1202@hotmail.com
 * @Last Modified time: 2021-3-13 11:04:24
 ! -->
<script>
import widgetBarchart from './bar/widgetBarchart.vue'
import widgetBarCompareChart from './bar/widgetBarCompareChart'
import widgetBarlinechart from './bar/widgetBarlinechart'
import widgetBarStackChart from './bar/widgetBarStackChart'
import widgetGradientColorBarchart from './bar/widgetGradientColorBarchart.vue'
import widgetDecoratePieChart from './decorate/widgetDecoratePieChart'
import widgetLinechart from './line/widgetLinechart.vue'
import widgetLineCompareChart from './line/widgetLineCompareChart'
import widgetLineStackChart from './line/widgetLineStackChart'
import widgetAirBubbleMap from './map/widgetAirBubbleMap'
import WidgetGauge from './percent/widgetGauge.vue'
import widgetPiePercentageChart from './percent/widgetPiePercentageChart'
import WidgetPiechart from './pie/widgetPiechart.vue'
import WidgetPieNightingaleRoseArea from './pie/widgetPieNightingaleRose'
import WidgetFunnel from './widgetFunnel.vue'
import widgetHref from './widgetHref.vue'
import WidgetIframe from './widgetIframe.vue'
import widgetImage from './widgetImage.vue'
import widgetMap from './widgetMap.vue'
import WidgetMarquee from './widgetMarquee.vue'
import widgetSlider from './widgetSlider.vue'
import widgetTable from './widgetTable.vue'
import widgetText from './widgetText.vue'
import widgetTime from './widgetTime.vue'
import widgetVideo from './widgetVideo.vue'

export default {
  name: 'Widget',
  components: {
    WidgetHref: widgetHref,
    WidgetText: widgetText,
    WidgetMarquee,
    WidgetTime: widgetTime,
    WidgetImage: widgetImage,
    WidgetSlider: widgetSlider,
    WidgetVideo: widgetVideo,
    WidgetIframe,
    WidgetBarchart: widgetBarchart,
    WidgetGradientColorBarchart: widgetGradientColorBarchart,
    WidgetLinechart: widgetLinechart,
    WidgetBarlinechart: widgetBarlinechart,
    WidgetPiechart,
    WidgetFunnel,
    WidgetGauge,
    WidgetPieNightingaleRoseArea,
    WidgetTable: widgetTable,
    WidgetMap: widgetMap,
    WidgetPiePercentageChart: widgetPiePercentageChart,
    WidgetAirBubbleMap: widgetAirBubbleMap,
    WidgetBarStackChart: widgetBarStackChart,
    WidgetLineStackChart: widgetLineStackChart,
    WidgetBarCompareChart: widgetBarCompareChart,
    WidgetLineCompareChart: widgetLineCompareChart,
    WidgetDecoratePieChart: widgetDecoratePieChart,
  },
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    /*
    widget-text widget-marquee widget-href widget-time widget-image widget-slider widget-video widget-table widget-iframe widget-universal
    widget-linechart widget-barlinechart widget-piechart widget-hollow-piechart widget-funnel widget-gauge widget-china-map
    */
    index: Number, // 当前组件，在工作区变量widgetInWorkbench中的索引
    type: String,
    bigscreen: Object,
    value: {
      type: [Object],
      default: () => {},
    },
    step: Number,
  },
  data() {
    return {
      data: {
        setup: {},
        data: {},
        position: {},
      },
    }
  },
  computed: {
    widgetsWidth() {
      return this.value.position.width
    },
    widgetsHeight() {
      return this.value.position.height
    },
    widgetsLeft() {
      return this.value.position.left
    },
    widgetsTop() {
      return this.value.position.top
    },
    widgetsZIndex() {
      return this.value.position.zIndex || 1
    },
  },
  mounted() {},
  methods: {
    handleFocus({
      index,
      left,
      top,
      width,
      height,
    }) {},
    handleBlur({
      index,
      left,
      top,
      width,
      height,
    }) {
      this.$emit('onActivated', { index, left, top, width, height })
      this.$refs.draggable.setActive(true)
    },
  },
}
</script>

<template>
  <avue-draggable
    ref="draggable"
    :step="step"
    :width="widgetsWidth"
    :height="widgetsHeight"
    :left="widgetsLeft"
    :top="widgetsTop"
    :index="index"
    :z-index="-1"
    @focus="handleFocus"
    @blur="handleBlur"
  >
    <component :is="type" :value="value" />
  </avue-draggable>
</template>

<style scoped lang="scss">
.vue-draggalbe {
  position: absolute;
}

.widget-active {
  cursor: move;
  border: 1px dashed #09f;
  background-color: rgba(115, 170, 229, 0.5);
}

.avue-draggable {
  padding: 0 !important;
}
</style>
