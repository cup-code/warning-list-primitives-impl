<script>
import Conversation from './conversation.vue'

export default {
  name: 'AiAssistant',
  components: {
    Conversation,
  },
  data() {
    return {
      visible: false,
    }
  },
  methods: {},
}
</script>

<template>
  <el-popover
    v-model="visible"
    width="450"
    :offset="-20"
    placement="top-start"
    trigger="manual"
  >
    <Conversation
      ref="conversation"
      :visible="visible"
      @close="visible = false"
    />
    <div
      slot="reference"
      class="flex fixed right-4 bottom-8 justify-center items-center p-3 w-11 h-11 bg-white rounded-full assiBclock"
      @click="visible = !visible"
    >
      <el-image
        fit="contain"
        style="width: 40px; height: 40px"
        src="https://ls.e20.com.cn/minio/e20project-v2//work-order/e20project_v2/workOrder/2024/08/06/icn_AI_assistant_bar.png"
      />
    </div>
  </el-popover>
</template>

<style lang="scss" scoped>
.assiBclock {
  z-index: 999;
  box-sizing: border-box;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

::v-deep .el-tooltip__popper.is-light {
  border: none !important;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.1) !important;
}
</style>
