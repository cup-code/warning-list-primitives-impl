import Vue from 'vue'
import CTable from './CTable/CTable.vue'
import EButton from './EButton/index.vue'
import ECard from './ECard/index.vue'
import EImportFile from './EImportFile/index.vue'
import EMoreButton from './EMoreButton/index.vue'
import ESelect from './ESelect/index.vue'
import ETabs from './ETabs/index.vue'
import ETitle from './ETitle/index.vue'
import VIconMenu from './VIconMenu/index.vue'
// 设置成全局组件
Vue.component('EButton', EButton)
Vue.component('EMoreButton', EMoreButton)
Vue.component('ECard', ECard)
Vue.component('ETabs', ETabs)
Vue.component('CTable', CTable)
Vue.component('ESelect', ESelect)
Vue.component('EImportFile', EImportFile)
Vue.component('ETitle', ETitle)
Vue.component('VIconMenu', VIconMenu)
