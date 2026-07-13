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
    this.initWaterChart()
  },
  methods: {
    initWaterChart() {
      const option = {
        tooltip: {
          trigger: 'item',
        },
        color: ['#60a5fa', '#e0f2fe'], // Blue for the variable, light color for the rest
        legendHoverLink: false,
        series: [
          {
            name: 'Access From',
            type: 'pie',
            radius: ['60%', '80%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2,
            },
            label: {
              show: true,
              position: 'center',
              rich: {
                a: {
                  fontSize: 22,
                  fontWeight: 'bold',
                  lineHeight: 30,
                  color: '#60a5fa',
                },
                b: {
                  color: '#fff',
                },
                icon: {
                  height: 20,
                  backgroundColor: {
                    image: require('@/assets/waterScale.png'),
                  },
                },
              },
              formatter: () => {
                return `{a|${this.form.percent}%}{icon|}\n{b|预测来水百分比}`
              },
            },
            emphasis: {
              disabled: true,
              scale: false,
              label: {
                show: true,
                fontSize: 13,
                fontWeight: 'bold',
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              { value: this.form.percent, name: '预测来水百分比' },
              { value: 100 - this.form.percent, name: '剩余百分比' },
            ],
          },
        ],
      }
      if (document.getElementById(`forecast-water-level-${this.index}`)) {
        this.waterChart = this.$echarts.init(
          document.getElementById(`forecast-water-level-${this.index}`),
        )
        this.waterChart.setOption(option)
      }
    },
  },
}
</script>

<template>
  <div class="my-1 flex w-full flex-row items-center justify-between rounded-md p-4">
    <div class="flex h-12 items-center whitespace-nowrap text-xl font-bold text-white">
      未来第
      <span
        class="mx-1 flex h-8 w-10 -skew-y-6 transform items-center justify-center rounded bg-blue-300 px-2 py-1 text-white"
      >
        <span class="text-2xl">{{ form.day }}</span>
      </span>
      天
    </div>
    <div class="flex items-center">
      <div class="mr-5 flex flex-col items-center">
        <div class="flex items-end">
          <div class="mr-3 text-3xl text-blue-400">
            {{ form.percent }}%
          </div>
        </div>
        <div class="mt-2 text-base text-white">
          预测来水百分比
        </div>
      </div>

      <svg-icon
        icon-class="waterLevel"
        style="width: 4vw; height: 4vw; margin: 5px"
      />
    </div>
  </div>
</template>
