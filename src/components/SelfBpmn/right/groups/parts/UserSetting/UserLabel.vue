<script>
import {
  getSysOfficeById,
  getSysRoleById,
  getSysUserById,
} from '@/http/safe-production/flowable-api'

export default {
  props: {
    value: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      label: '',
    }
  },
  watch: {
    type: {
      handler(newVal) {
        this.show()
      },
      immediate: true,
      deep: false,
    },
    value: {
      handler(newVal) {
        this.show()
      },
      immediate: true,
      deep: false,
    },
  },
  methods: {
    show() {
      const pArr = []
      let p
      switch (this.type) {
        case 'user':
          // 后台接口，先注释掉
          // getUserLabel(this.$http, this.value).then(data => {
          //     this.label = data;
          // });

          this.value.split(',').forEach((item) => {
            p = new Promise((resolve, reject) => {
              getSysUserById(item).then(({ data }) => {
                resolve(data.user.fullName)
              })
            })
            pArr.push(p)
          })
          Promise.all(pArr).then((res) => {
            this.label = (res || []).join(',')
          })

          break

        case 'role':
          // 后台接口，先注释掉
          // getRoleLabel(this.$http, this.value).then(data => {
          //     this.label = data;
          // });

          this.value.split(',').forEach((item) => {
            p = new Promise((resolve, reject) => {
              getSysRoleById(item).then(({ data }) => {
                resolve(data.role.roleName)
              })
            })
            pArr.push(p)
          })
          Promise.all(pArr).then((res) => {
            this.label = (res || []).join(',')
          })

          break

        case 'company':
          // 后台接口，先注释掉
          // getDepartLabel(this.$http, this.value).then(data => {
          //     this.label = data;
          // });
          break

        case 'depart':
          // 后台接口，先注释掉
          // getDepartLabel(this.$http, this.value).then(data => {
          //     this.label = data;
          // });
          this.value.split(',').forEach((item) => {
            p = new Promise((resolve, reject) => {
              getSysOfficeById(item).then(({ data }) => {
                resolve(data.office.departmentName)
              })
            })
            pArr.push(p)
          })
          Promise.all(pArr).then((res) => {
            this.label = (res || []).join(',')
          })

          break

        case 'post':
          // 后台接口，先注释掉
          // getPostLabel(this.$http, this.value).then(data => {
          //     this.label = data;
          // });
          break
      }
    },
  },
}
</script>

<template>
  <div>
    <label
      v-if="
        type === 'user'
          || type === 'role'
          || type === 'post'
          || type === 'company'
          || type === 'depart'
      "
    >
      {{ ` ${label} ` }}
    </label>

    <label v-if="type === 'applyUserId'">发起人</label>
    <label v-if="type === 'previousExecutor'">上一步执行人 </label>
    <label v-if="type === 'currentUserId'">当前登录用户 </label>
    <label v-if="type === 'sql' || type === 'custom'">
      {{ `${value} ` }}
    </label>
  </div>
</template>
