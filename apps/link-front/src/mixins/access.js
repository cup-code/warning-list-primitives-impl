import {
  getAccessUser,
  getToken,
  hasPermission,
} from '@/utils/auth'

export default {
  data() {
    return {}
  },
  computed: {
    operator() {
      return this.getUser.loginName
    },
    operatorText() {
      return `${this.getUser.realName}[${this.getUser.loginName}]`
    },
    operatorToken() {
      return getToken()
    },
    getUser() {
      const user = getAccessUser()
      if (user != null) {
        return user
      }
      else {
        return {}
      }
    },
    opAuthorities() {
      return this.getUser == null ? [] : this.getUser.authorities
    },
  },
  created() {},
  mounted() {},
  destroyed() {},
  methods: {
    hasPermission(permissionStr) {
      return hasPermission(permissionStr)
    },
  },
}
