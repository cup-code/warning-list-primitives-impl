<script>
import { getUnhandledAlert } from '@/http/manage-api'

export default {
  name: 'MessageTip',
  props: ['user'],
  data: () => ({
    val: null,
  }),
  mounted() {
    // 如果不是租户管理员
    if (this.user.tenantId !== 1) {
      // this.initInter();
    }
  },
  methods: {
    initInter() {
      this.getAlertNum()
      setInterval(() => {
        this.getAlertNum()
      }, 1000 * 60)
    },
    getAlertNum() {
      getUnhandledAlert().then((res) => {
        const resD = res.data
        if (resD.success) {
          this.val = resD.result || null
        }
      })
    },
  },
}
</script>

<template>
  <div>
    <el-badge
      :value="val"
      class="message-tip"
    >
      <i class="el-icon-chat-round" />
    </el-badge>
  </div>
</template>

<style lang="scss" scoped>
.message-tip {
  vertical-align: unset !important;
  .el-badge__content {
    top: 10% !important;
    right: 60% !important;
    transform: none !important;
    height: auto;
  }
}
</style>
