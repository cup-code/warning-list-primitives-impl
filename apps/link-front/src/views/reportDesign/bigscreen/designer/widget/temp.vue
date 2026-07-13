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
  name: 'WidgetTemp',
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
    type: String,
    value: {
      type: [Object],
      default: () => {},
    },
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {},
}
</script>

<template>
  <div>
    <component
      :is="type"
      :value="value"
      :ispreview="true"
    />
  </div>
</template>

<style scoped lang="scss"></style>
