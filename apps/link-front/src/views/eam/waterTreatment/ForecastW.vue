<script>
export default {
  name: 'ForecastW',
  props: {
    index: {
      type: Number,
      default: 0,
    },
    form: {
      type: Object,
      default: () => ({
        day: 1,
        percent: 64,
      }),
    },
    textColor: {
      type: String,
      default: '',
    },
  },
  setup() {
    return {}
  },
  data() {
    return {
      waterChart: null,
    }
  },
  mounted() {
    // this.initWaterChart()
  },
  methods: {},
}
</script>

<template>
  <div class="flex flex-row justify-between items-center p-4 my-1 w-full rounded-md">
    <div
      class="flex items-center h-12 text-xl font-bold text-white whitespace-nowrap"
    >
      未来第
      <span
        class="flex justify-center items-center px-2 py-1 mx-1 w-10 h-8 text-white bg-blue-300 rounded transform -skew-y-6"
      >
        <span class="text-2xl">{{ form.day }}</span>
      </span>
      天
    </div>
    <div class="flex items-center">
      <div class="flex flex-col items-center mr-5">
        <div class="flex items-end">
          <div class="mr-3 text-3xl text-blue-400">
            {{ form.inflow }}%
          </div>
        </div>
        <div class="mt-2 text-base text-white">
          预测来水百分比
        </div>
      </div>

      <svg-icon icon-class="waterLevel" style="width: 4vw; height: 4vw; margin: 5px" />
    </div>
  </div>
</template>

<style scoped>
.wave-container {
  position: relative;
  display: inline-block;
}

.wave {
  position: absolute;
  width: 100%;
  height: 10px;
  bottom: 0;
  left: 0;
  background: linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.5), transparent);
  animation: wave 2s infinite linear;
  transform-origin: center bottom;
}

.wave::before {
  content: "";
  position: absolute;
  width: 200%;
  height: 100%;
  top: 0;
  left: -50%;
  background: inherit;
  transform: translateX(0);
}

@keyframes wave {
  0% {
    transform: translateX(-50%) scaleX(1);
  }
  50% {
    transform: translateX(0%) scaleX(0.8);
  }
  100% {
    transform: translateX(50%) scaleX(1);
  }
}
</style>
