/* eslint-disable perfectionist/sort-imports */
import '@/utils/storage-namespace'
import router from '@router'
/* eslint-enable perfectionist/sort-imports */
import { VueQueryPlugin } from '@tanstack/vue-query'

// 引入animate.css样式库
import request from 'axios'
import dayjs from 'dayjs'
import * as echarts from 'echarts'
import { init } from 'echarts'
// element-ui 相关 begin
import ElementUI from 'element-ui'

import locale from 'element-ui/lib/locale/lang/zh-CN'
//  ******************************** 表单设计器相关  begin ********************************
// 组件库应用
import LinkUi from 'link-ui/lib/index'
import Vue from 'vue'
import VueClipboards from 'vue-clipboards'
import VChart from 'vue-echarts' // 引入 vue-echarts 组件
// import Print from "vue-print-nb";
// 引入table，菜单管理中用
import VXETable from 'vxe-table'
import elMaxDialog from '@/directive/maxDialog'

// ***************************************************** anji的报表设计 相关 begin *****************************************************
import mixins from '@/mixins'

import store from '@/store'
import utils from '@/utils/fmUtils'
// 单独处理表单设计的请求
import onlyForm from '@/utils/httpRequest'

import {
  formatDate,
  hasBtnPermission,
  recover,
  removeEmptyField,
  setTreeData,
} from '@/utils/index.js'
import validator from '@/utils/validator.js'
import { closeLoading, openLoading } from '@/utils/loading'
import App from './App.vue'
import i18n from './lang' // 国际化
import 'dayjs/locale/zh-cn'
import '@/components/EComponents/index'
import '@/directive/index' // 自定义指令集合
import '@/utils/linkSdk.js'
import '@/utils/filter.js'
import '@/styles/tailwind.css'
import 'normalize.css/normalize.css' // 常规样式
import 'vxe-table/lib/style.css'
// element-ui 相关 end
import '@/assets/theme/index.scss' // 引入默认主题色，可配置
import '@/styles/index.scss' // 全局样式
import 'element-ui/lib/theme-chalk/index.css' // 必须放在element相关样式最后
// 引入mapbox画矩形依赖
import '@/permission' // 路由拦截器
// 新样式改版公共组件 ——jxz
import '@/icons' // 自定义图标
import 'echarts/map/js/china.js'
import 'link-ui/lib/index.css'
import '@/assets/iconfont.css'

dayjs.locale('zh-cn')

Vue.use(VXETable)
Vue.use(VueClipboards)
Vue.use(LinkUi)
// Vue.use(FormMaking);
// Vue.use(Print); // 引入iconfont字体
Vue.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: false,
      },
    },
  },
})
Vue.use(ElementUI, {
  locale,
  size: 'mini',
})

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
Vue.prototype.$openLoading = openLoading
Vue.prototype.$closeLoading = closeLoading
Vue.prototype.$pageSizeAll = [10, 50, 100, 200, 500]
Vue.config.productionTip = false
Vue.prototype.bus = new Vue()

Vue.mixin(mixins)
Vue.directive('max-dialog', elMaxDialog)

Vue.component('v-chart', VChart) // 引入世界地图

// 分页的全局size配置;
new Vue({
  el: '#app',
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app')
