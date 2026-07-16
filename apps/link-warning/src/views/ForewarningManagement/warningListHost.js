import Vue from 'vue'
import router from '@/router'

const warningListHost = {
  detailPayloadMode: 'id',
  getDictList(type) {
    return Vue.prototype.$dictUtils.getDictList(type)
  },
  getFilePrefix() {
    const globalData = JSON.parse(localStorage.getItem('globalData'))
    return globalData?.minioFilePrefix || ''
  },
  pushWarningDetail(data) {
    return router.push({
      path: '/detail/warningDetail',
      query: { data: JSON.stringify(data) },
    })
  },
}

export default warningListHost
