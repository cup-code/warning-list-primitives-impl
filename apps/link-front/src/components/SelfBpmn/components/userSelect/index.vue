<script>
import { getSysUserById } from '@/http/safe-production/flowable-api'

import UserSelectDialog from './UserSelectDialog.vue'

export default {
  components: {
    UserSelect: UserSelectDialog,
  },
  props: {
    limit: Number,
    value: String,
    size: {
      type: String,
      default() {
        return 'mini'
      },
    },
    readonly: {
      type: Boolean,
      default() {
        return true
      },
    },
    disabled: {
      type: Boolean,
      default() {
        return false
      },
    },
  },
  data() {
    return {
      name: '',
      labelValue: this.value,
      selectData: [],
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.selectData = []
        if (newVal) {
          newVal.split(',').forEach((id) => {
            getSysUserById(id).then(({ data }) => {
              if (data.user && data.user.id !== '') {
                this.selectData.push(data.user)
              }
            })
          })
        }
      },
      immediate: true,
      deep: false,
    },
    selectData: {
      handler(newVal) {
        this.name = newVal
          .map((user) => {
            return user.fullName
          })
          .join(',')
      },
      immediate: false,
      deep: false,
    },
  },
  methods: {
    selectUsersToInput(users) {
      this.selectData = users
      this.labelValue = users
        .map((user) => {
          return user.id
        })
        .join(',')
      this.name = users
        .map((user) => {
          return user.fullName
        })
        .join(',')
      this.$emit('getValue', this.labelValue, this.name)
    },
    showUserSelect() {
      this.$refs.userSelect.init()
    },
  },
}
</script>

<template>
  <div>
    <el-input
      v-model="name"
      class="input-with-select"
      style="line-hight: 40px"
      placeholder="请选择"
      :size="size"
      :disabled="disabled"
      :readonly="readonly"
    >
      <el-button
        slot="append"
        :disabled="disabled"
        :readonly="readonly"
        icon="el-icon-search"
        @click="showUserSelect"
      />
    </el-input>

    <userSelect
      ref="userSelect"
      :limit="limit"
      :selectData="selectData"
      @doSubmit="selectUsersToInput"
    />
  </div>
</template>
