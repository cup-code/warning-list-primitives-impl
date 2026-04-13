import moment from 'moment'
import Vue from 'vue'

Vue.filter('formatDate', (value, formatString) => {
  formatString = formatString || 'YYYY-MM-DD HH:mm:ss'
  if (value) {
    return moment(value).format(formatString)
  }
  else {
    return '--'
  }
})
