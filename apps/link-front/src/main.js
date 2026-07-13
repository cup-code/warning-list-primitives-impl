import '@/utils/storage-namespace'
import Avue from '@smallwei/avue'
import { VueQueryPlugin } from '@tanstack/vue-query'
import request from 'axios'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { init } from 'echarts'
import ElementUI from 'element-ui'
import { Loading } from 'element-ui'
import locale from 'element-ui/lib/locale/lang/zh-CN'
import LinkUi from 'link-ui/lib/index'
import Vue from 'vue'
import VueEditor from 'vue2-editor'
import VueClipboards from 'vue-clipboards'
import VChart from 'vue-echarts' // 引入 vue-echarts 组件
import Print from 'vue-print-nb'
// 引入table，菜单管理中用
import VXETable from 'vxe-table'
import CollapsePanel from '@/components/CollapsePanel/collapsePanel.vue'
import elMaxDialog from '@/directive/maxDialog'
import mixins from '@/mixins'
import utils from '@/utils/fmUtils'
import onlyForm from '@/utils/httpRequest'
import {
  formatDate,
  hasBtnPermission,
  recover,
  removeEmptyField,
  setTreeData,
} from '@/utils/index.js'
import validator from '@/utils/validator'
import App from './App.vue'
import i18n from './lang' // 国际化

import router from './router'
import store from './store'
import 'normalize.css/normalize.css' // 常规样式
import 'vxe-table/lib/style.css'

import 'element-ui/lib/theme-chalk/index.css' // 完整引入
import '@/permission' // 路由拦截器
// 新样式改版公共组件 ——jxz
import '@/icons' // 自定义图标
import '@/assets/theme/index.scss' // 引入默认主题色，可配置
import '@/styles/index.scss' // 全局样式
import 'link-ui/lib/index.css'
import '@/assets/iconfont.css'
// 引入mapbox画矩形依赖
import '@/assets/maps/js/DrawAssistedRectangle.min.js'
import 'animate.css'
import '@/utils/linkSdk'
import '@/utils/filter'
import '@/directive/index' // 自定义指令集合
import '@/components/EComponents/index'
import '@smallwei/avue/lib/index.css'
import 'echarts/map/js/china.js'
import '@/styles/tailwind.css'
// 导入 PDF 插件
// import * as pdfjsLib from 'pdfjs-dist'
// import 'pdfjs-dist/build/pdf.worker.entry'

import 'kaka-form/dist/JpFormMaking.css'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn') // 中文 locale 将一周的第一天设置为周一

// 配置 PDF.js worker
// worker 文件会通过 worker-rspack-loader 处理并输出到 js/ 目录
// 由于 worker 文件名可能包含 hash，我们需要动态获取路径
// 但为了简化，先使用固定路径，如果构建后文件名不同，再调整
// if (typeof window !== 'undefined') {
//   // 设置 worker 路径
//   // worker-rspack-loader 会将 worker 文件输出到 js/ 目录
//   // 文件名格式为: pdf.worker.[hash:8].worker.js
//   // 注意：如果实际构建后的文件名不同，需要根据实际情况调整
//   pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.worker.js'
// }

// 定义PDF插件
// const PDFPlugin = {
//   install(Vue) {
//     // 将 pdfjsLib 挂载到 Vue 原型上
//     Vue.prototype.$pdfjsLib = pdfjsLib
//   },
// }

Vue.use(VXETable)
Vue.use(VueClipboards)
Vue.use(LinkUi)
Vue.use(VueEditor)

Vue.use(Print) // 引入iconfont字体
Vue.use(Avue)
// Vue.use(PDFPlugin) // 使用自定义PDF插件
// 修复 VueQueryPlugin 配置 - 使用v4版本API
Vue.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
        staleTime: 0,
      },
    },
  },
})
Vue.use(ElementUI, {
  locale,
  size: 'mini',
})

// 全局 Loading 统一封装（供 composition API 的 setup 里通过 proxy 调用）
// 解决：proxy.$openLoading is not a function
Vue.prototype.$openLoading = function (options = {}) {
  const {
    lock = true,
    text = '加载中...',
    background = 'rgba(0, 0, 0, 0.1)',
    spinner = 'el-icon-loading',
  } = options

  // 同一组件内避免重复打开
  if (this.__elinkLoadingInstance && typeof this.__elinkLoadingInstance.close === 'function')
    return this.__elinkLoadingInstance

  // Vue/ElementUI 注入了 this.$loading，但这里兜底使用 Loading.service
  const inst = this.$loading
    ? this.$loading({
        lock,
        text,
        spinner,
        background,
      })
    : Loading.service({
        lock,
        text,
        spinner,
        background,
      })

  this.__elinkLoadingInstance = inst
  return inst
}

Vue.prototype.$closeLoading = function () {
  const inst = this.__elinkLoadingInstance
  if (inst && typeof inst.close === 'function')
    inst.close()
  this.__elinkLoadingInstance = null
}

Vue.prototype.$http = onlyForm
Vue.prototype.$utils = utils
Vue.prototype.moment = dayjs
Vue.prototype.$echarts = echarts
Vue.prototype.$request = request // 组态中用到的
Vue.prototype.$editorEcharts = init
Vue.prototype.recover = recover
Vue.prototype.removeEmptyField = removeEmptyField
Vue.prototype.$formatDate = formatDate
Vue.prototype.setTreeData = setTreeData
Vue.prototype.hasBtnPermission = hasBtnPermission // 按钮权限方法
Vue.prototype.validator = validator // 表单验证方法
Vue.prototype.$pageSizeAll = [10, 50, 100, 200, 500]
Vue.config.productionTip = false
Vue.prototype.bus = new Vue()

Vue.mixin(mixins)
Vue.directive('max-dialog', elMaxDialog)

Vue.component('CollapsePanel', CollapsePanel)
Vue.component('v-chart', VChart) // 引入世界地图
// 分页的全局size配置;

new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app')
