<script>
import { mapActions, mapState } from 'vuex'
import AiAnswer from './aiAnswer.vue'

export default {
  name: 'AiHelper',
  components: { AiAnswer },
  props: {
    info: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      visible: false,
    }
  },
  computed: {
    ...mapState('aiInfo', []),
  },
  methods: {
    ...mapActions('aiInfo', ['getQuestion', 'getAiInfo', 'getIsOpen', 'getConversationId']),
    async Search() {
      if (this.info) {
        await this.getQuestion(this.info)
        await this.getAiInfo()
        await this.getIsOpen(true)

        this.visible = true
      }
      else {
        this.$message.error(`请输入问题描述`)
      }
    },

    async onClose() {
      this.visible = false
      this.getConversationId('')
      this.getIsOpen(false)
    },
  },
}
</script>

<template>
  <el-popover
    v-model="visible"
    width="550"
    :visible-arrow="false"
    placement="top-end"
    trigger="manual"
  >
    <div
      slot="reference"
      class="iconBlock cursor-pointer overflow-hidden rounded-full shadow"
      @click="Search"
    >
      <div
        class="box-border flex h-8 items-center justify-between bg-white px-1 py-2"
        style="width: 94px"
      >
        <svg-icon
          icon-class="ai"
          class="text-2xl"
        />
        <div
          class="mr-1 leading-3"
          style="font-size: 12px"
        >
          智能解答
        </div>
      </div>
    </div>
    <i
      class="el-icon-circle-close absolute right-1 top-1 z-50 cursor-pointer text-base"
      @click="onClose"
    />
    <AiAnswer />
  </el-popover>
</template>

<style lang="scss" scoped>
.iconBlock {
  width: 32px;
}

.iconBlock:hover {
  animation: ai 0.2s linear forwards;
  -webkit-animation: ai 0.2s linear forwards;
}

@keyframes ai {
  from {
    width: 32px;
  }
  to {
    width: 94px;
  }
}
</style>
