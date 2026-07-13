<script>
import { getAiHelper } from '@/http/hkAi-api'

export default {
  name: 'Conversation',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      message: '',
      nowMessage: '',
      time: '',
      conversationId: '',
      loading: false,
      list: [{ text: '您好！我是智能助手，会尽力为您提供帮助。', figure: 'AI' }],
    }
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.getAiInfo()
        }
        else {
          this.conversationId = ''
          this.list = [
            { text: '您好！我是智能助手，会尽力为您提供帮助。', figure: 'AI' },
          ]
          clearTimeout(this.time)
        }
      },
    },
    list: {
      handler() {
        this.$nextTick(() => {
          this.getBottom()
        })
      },
    },
  },
  methods: {
    onClose() {
      this.$emit('close')
    },
    getAiInfo() {
      this.time = setTimeout(() => {
        this.list.push({ text: '请问您还有什么需要编写吗？', figure: 'AI' })
        this.getAiInfo()
      }, 60000)
    },

    async getMessage() {
      const params = {
        input: { prompt: this.nowMessage },
      }
      this.loading = true
      await getAiHelper(params)
        .then((res) => {
          console.log(res, 999)
          const { output } = res.data
          const text = `${output.text}`

          this.list.push({ text, figure: 'AI' })
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
      this.nowMessage = ''
      await this.getAiInfo()
    },

    getBottom() {
      const container = document.getElementById('content')

      container.scrollTop = container.scrollHeight
    },

    sendMessage() {
      clearTimeout(this.time)
      this.list.push({ text: this.message, figure: 'customer' })

      this.nowMessage = this.message
      this.message = ''
      setTimeout(() => {
        this.getMessage()
      }, 500)
    },
  },
}
</script>

<template>
  <div style="height: 600px" class="overflow-hidden relative w-full rounded-lg">
    <div class="absolute top-0 right-0 z-10 w-4 h-4" @click="onClose">
      <i class="el-icon-close" />
    </div>
    <div id="content" class="overflow-y-scroll pt-24 pb-10 h-full scroll-smooth ai-block">
      <div
        class="absolute top-0 right-0 left-0 flex-col items-center py-2 pb-4 w-full text-center bg-white"
      >
        <el-image
          fit="contain"
          style="width: 30px; height: 30px"
          src="https://ls.e20.com.cn/minio/e20project-v2//work-order/e20project_v2/workOrder/2024/08/06/icn_AI_assistant_bar.png"
        />
        <div>智能问答助手</div>
      </div>

      <div
        v-for="(item, index) in list"
        :key="index"
        :class="item.figure === 'AI' ? ['ml-1 mr-7 text-left'] : ['ml-7 text-right']"
      >
        <div
          class="mb-3 inline-block rounded-lg px-3 py-2"
          :class="[
            item.figure === 'AI'
              ? 'blockShadow rounded-tl-none bg-white text-black'
              : 'rounded-tr-none bg-blue-500 text-white',
          ]"
        >
          <div style="white-space: pre-wrap">
            {{ item.text }}
          </div>
        </div>
      </div>

      <div v-if="loading" class="mr-6 text-left">
        <div
          class="inline-block px-3 py-2 mr-6 mb-3 ml-1 bg-white rounded-lg rounded-tl-none blockShadow"
        >
          <div class="flex items-center text-black">
            <div class="loading-img">
              <el-image
                fit="contain"
                style="width: 26px; height: 26px"
                src="https://ls.e20.com.cn/minio/e20project-v2//work-order/e20project_v2/workOrder/2024/08/07/loading.png"
              />
            </div>
            正在思考中...
          </div>
        </div>
      </div>
    </div>

    <div class="flex absolute right-0 bottom-0 left-0 items-center pt-3 pb-1 bg-white">
      <div class="flex flex-1 items-center p-1 px-2 mr-2 rounded">
        <el-input
          v-model="message"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 3 }"
          placeholder="请用一句话描述您的问题"
          @keyup.enter="sendMessage"
        />
      </div>
      <EButton
        size="mini"
        :disabled="!message"
        type="primary"
        @click="sendMessage"
      >
        发送
      </EButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ai-block {
  scrollbar-width: none;
  -webkit-scrollbar: none;
}
.blockShadow {
  box-shadow: 0 0 10px rgba($color: #cdcdcd, $alpha: 0.4);
}
.loading-img {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  margin-right: 6px;

  animation: loading 3s linear infinite;
  -webkit-animation: loading 3s linear infinite;
}

@keyframes loading {
  0% {
    transform: scale(1) rotate(0turn);
  }
  25% {
    transform: scale(0.75) rotate(0.25turn);
  }
  50% {
    transform: scale(0.9) rotate(0.5turn);
  }
  75% {
    transform: scale(0.75) rotate(0.75turn);
  }
  100% {
    transform: scale(1) rotate(1turn);
  }
}
</style>
