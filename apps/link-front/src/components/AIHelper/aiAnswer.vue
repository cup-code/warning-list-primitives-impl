<script>
import { mapState } from 'vuex'

export default {
  name: 'AiAnswer',
  props: {},
  data() {
    return {
      list: [],
    }
  },
  computed: {
    ...mapState('aiInfo', ['question', 'isOpen', 'answer', 'loading']),
  },
  watch: {
    isOpen: {
      handler(v) {
        if (!v) {
          this.list = []
        }
      },
    },
    question: {
      handler(v) {
        this.list.push(v)
      },
      deep: true,
    },
    answer: {
      handler(v) {
        this.list[this.list.length - 1].answer = v.answer
        this.$nextTick(() => {
          this.getBottom()
        })
      },
      deep: true,
    },
    list: {
      handler() {
        setTimeout(() => {
          this.getBottom()
        })
      },
      deep: true,
    },
  },
  methods: {
    getBottom() {
      const container = document.getElementById('contents')
      container.scrollTop = container.scrollHeight
    },
  },
}
</script>

<template>
  <div class="relative h-64 overflow-hidden rounded">
    <div
      id="contents"
      class="scroll-smooth ai-block h-full overflow-y-scroll p-2 pb-2"
    >
      <div
        v-for="(item, index) in list"
        :key="`${item.answer} + ${index}`"
        class="mb-3"
        :index="index"
      >
        <div
          v-if="item.question"
          class="mb-2"
        >
          <div class="flex items-center text-black">
            <svg-icon
              icon-class="question"
              class="text-2xl"
            />
            <div class="ml-1 flex-1">
              提问：{{ item.question }}
            </div>
          </div>
        </div>
        <div class="flex items-center">
          <svg-icon
            icon-class="answer"
            class="text-2xl"
          />
          <div class="ml-1 text-gray-900">
            智能助手
          </div>
        </div>
        <div
          v-if="item.answer"
          class="mb-3 ml-2 mt-2 flex-1 rounded-lg rounded-tl-none bg-blue-100 p-2 text-black shadow"
        >
          {{ item.answer || '--' }}
        </div>
        <div
          v-if="loading && index + 1 === list.length"
          class="mb-3 ml-2 mt-2 flex w-48 items-center rounded-lg rounded-tl-none bg-blue-100 p-2 text-black shadow"
        >
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
</template>

<style lang="scss" scoped>
.ai-block {
  scrollbar-width: none;
  -webkit-scrollbar: none;
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
