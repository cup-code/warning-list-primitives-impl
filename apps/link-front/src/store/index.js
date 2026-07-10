import Vue from 'vue'
import Vuex from 'vuex'
import aiInfo from '@/components/AIHelper/store/aiInfo'
import detailInfo from '@/views/ForewarningManagement/store/detailInfo'
import getters from './getters'
import app from './modules/app'
import cesium3dStore from './modules/cesium3d'
import comInfo from './modules/comInfo'
import company from './modules/company'
import dic from './modules/dic'
import newMaterial from './modules/newMaterial'
import settings from './modules/settings'
import user from './modules/user'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    dic,
    comInfo,
    company,
    newMaterial,
    aiInfo,
    detailInfo,
    cesium3dStore,
  },
  getters,
})

export default store
