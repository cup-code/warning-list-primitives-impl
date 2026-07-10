<script type="text/ecmascript-6">
export default {
  data() {
    return {
      allCharts: {
        chart_status: null, // 告警处理状态统计
        chart_emergency: null, // 告警统计 - 紧急
        chart_normal: null, // 告警统计 - 一般
        chart_trend: null, // 告警趋势
        chart_eTrend: null, // 紧急告警趋势
        chart_video: null, // 视频巡更统计
        chart_el: null, // 电子巡更统计
        chart_safe: null, // 安保统计
        chart_app: null, // APP关闭率统计
      },
      alarmTotal: 100, // 告警总数
      emergencyNum: 20, // 紧急告警数
      normalNum: 60, // 一般告警数
      videoTotal: 96, // 视频巡更总次数
      videoNum: 30, // 视频巡更执行次数
      eleTotal: 269, // 电子巡更总次数
      eleNum: 18, // 电子巡更执行次数
      perTotal: 325, // 总人数
      perNum: 121, // 在岗人数
      placeHolderStyle: {
        normal: {
          color: '#0a2332',
          borderColor: '#0a2332',
          borderWidth: 10,
        },
      },

    }
  },
  mounted() {
    this.initAll() // 初始化所有图表
  },
  beforeDestroy() {
    for (const key in this.allCharts) {
      this.allCharts[key].clear()
    }
  },
  methods: {
    // 初始化图表
    initChart(name, options) {
      this.allCharts[name] = this.$echarts.init(document.getElementById(name))
      this.allCharts[name].setOption(options)
    },
    initAll() {
      // 告警处理状态统计
      this.initChart('chart_status', {
        color: ['#53f1f2', '#4ebefd', '#30ed9d'],
        tooltip: {
          trigger: 'item',
          formatter: '{a}: {c}',
        },
        legend: {
          show: true,
          orient: 'vertical',
          right: '10%',
          top: 'middle',
          data: ['待处理', '处理中', '已完成'],
          textStyle: {
            color: '#fff',
            fontSize: 14,
          },
          itemWidth: 14,
          itemHeight: 10,
        },
        series: [
          {
            center: ['30%', '50%'],
            name: '待处理',
            type: 'pie',
            clockWise: true, // 顺时加载
            hoverAnimation: false, // 鼠标移入变大
            radius: [50, 50],
            itemStyle: {
              normal: {
                label: {
                  show: false,
                  position: 'outside',
                },
                labelLine: {
                  show: false,
                  length: 100,
                  smooth: 0.5,
                },
                borderWidth: 10,
                borderColor: '#53f1f2',
              },
            },
            data: [
              {
                value: 7,
                name: '',
              },
              {
                value: 3,
                name: '',
                itemStyle: this.placeHolderStyle,
              },
            ],
          },
          {
            center: ['30%', '50%'],
            name: '处理中',
            type: 'pie',
            clockWise: true,
            hoverAnimation: false,
            radius: [30, 30],
            itemStyle: {
              normal: {
                label: {
                  show: false,
                },
                labelLine: {
                  show: false,
                  length: 100,
                  smooth: 0.5,
                },
                borderWidth: 10,
                borderColor: '#4ebefd',
              },
            },
            data: [
              {
                value: 6,
                name: '',
              },
              {
                value: 4,
                name: '',
                itemStyle: this.placeHolderStyle,
              },
            ],
          },
          {
            center: ['30%', '50%'],
            name: '已完成',
            type: 'pie',
            clockWise: true,
            hoverAnimation: false,
            radius: [10, 10],
            itemStyle: {
              normal: {
                label: {
                  show: false,
                },
                labelLine: {
                  show: false,
                  length: 100,
                  smooth: 0.5,
                },
                borderWidth: 10,
                borderColor: '#30ed9d',
              },
            },
            data: [
              {
                value: 2,
                name: '',
              },
              {
                value: 7,
                name: '',
                itemStyle: this.placeHolderStyle,
              },
            ],
          },
        ],
      })
      // 告警统计 - 紧急
      this.initChart('chart_emergency', {
        color: ['#e6c47d', '#0a2332'],
        title: {
          show: true,
          text: `${Number.parseInt(this.emergencyNum / this.alarmTotal * 100)}%`,
          subtext: '紧急',
          x: 'center',
          y: 'center',
          textStyle: {
            fontSize: '14',
            color: '#e6c47d',
            fontWeight: 'bold',
          },
          subtextStyle: {
            fontSize: '10',
            color: '#fff',
            fontWeight: 'normal',
          },
          itemGap: 2, // 控制主副标题的间距
        },
        series: {
          name: '',
          type: 'pie',
          radius: ['65%', '85%'],
          avoidLabelOverlap: true,
          hoverAnimation: false,
          label: {
            normal: {
              show: false,
              position: 'center',
            },
            emphasis: {
              show: false,
            },
          },
          labelLine: {
            normal: {
              show: false,
            },
          },
          data: [
            { value: this.emergencyNum },
            { value: this.alarmTotal - this.emergencyNum },
          ],
        },
      })
      // 告警统计 - 一般
      this.initChart('chart_normal', {
        color: ['#7fceea', '#0a2332'],
        title: {
          show: true,
          text: `${Number.parseInt(this.normalNum / this.alarmTotal * 100)}%`,
          subtext: '一般',
          x: 'center',
          y: 'center',
          textStyle: {
            fontSize: '14',
            color: '#7fceea',
            fontWeight: 'bold',
          },
          subtextStyle: {
            fontSize: '10',
            color: '#fff',
            fontWeight: 'normal',
          },
          itemGap: 2, // 控制主副标题的间距
        },
        series: {
          name: '',
          type: 'pie',
          radius: ['65%', '85%'],
          avoidLabelOverlap: true,
          hoverAnimation: false,
          label: {
            normal: {
              show: false,
              position: 'center',
            },
            emphasis: {
              show: false,
            },
          },
          labelLine: {
            normal: {
              show: false,
            },
          },
          data: [
            { value: this.normalNum },
            { value: this.alarmTotal - this.normalNum },
          ],
        },
      })
      // 告警趋势
      this.initChart('chart_trend', {
        color: ['#3da6f9'],
        grid: {
          height: '90%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#474d55', // 控制 x轴的 颜色
            },
          },
          axisTick: {
            show: false, // 控制 x轴 是否显示刻度
          },
          axisLabel: {
            color: '#fff', // 字体颜色
            margin: 4, // x轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
          },
          data: ['06-06', '07-07', '08-08', '09-09', '10-10'],
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#474d55', // 控制 y轴的 颜色
            },
          },
          axisTick: {
            show: false, // 控制 y轴 是否显示刻度
          },
          axisLabel: {
            margin: 4, // y轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
            color: '#fff', // 字体颜色
          },
          splitLine: {
            show: true, // 分割线显示与否
            lineStyle: {
              color: '#171d25',
            },
          },
        },
        series: [{
          name: '告警',
          data: [12, 33, 30, 53, 42],
          type: 'line',
          smooth: true,
          areaStyle: {},
        }],
      })
      // 紧急告警趋势
      this.initChart('chart_eTrend', {
        color: ['#a24e27'],
        grid: {
          height: '90%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#474d55', // 控制 x轴的 颜色
            },
          },
          axisTick: {
            show: false, // 控制 x轴 是否显示刻度
          },
          axisLabel: {
            color: '#fff', // 字体颜色
            margin: 4, // x轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
          },
          data: ['06-06', '07-07', '08-08', '09-09', '10-10'],
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#474d55', // 控制 y轴的 颜色
            },
          },
          axisTick: {
            show: false, // 控制 y轴 是否显示刻度
          },
          axisLabel: {
            margin: 4, // y轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
            color: '#fff', // 字体颜色
          },
          splitLine: {
            show: true, // 分割线显示与否
            lineStyle: {
              color: '#171d25',
            },
          },
        },
        series: [{
          name: '紧急告警',
          data: [22, 3, 10, 12, 11],
          type: 'line',
          smooth: true,
          areaStyle: {},
        }],
      })
      // 视频巡更统计
      this.initChart('chart_video', {
        color: ['#67b9f6', '#0a2332'],
        title: {
          show: true,
          text: `${Number.parseInt(this.videoNum / this.videoTotal * 100)}%`,
          subtext: '已执行',
          x: 'center',
          y: 'center',
          textStyle: {
            fontSize: '14',
            color: '#67b9f6',
            fontWeight: 'bold',
          },
          subtextStyle: {
            fontSize: '10',
            color: '#fff',
            fontWeight: 'normal',
          },
          itemGap: 2, // 控制主副标题的间距
        },
        series: {
          name: '',
          type: 'pie',
          radius: ['65%', '85%'],
          avoidLabelOverlap: true,
          hoverAnimation: false,
          label: {
            normal: {
              show: false,
              position: 'center',
            },
            emphasis: {
              show: false,
            },
          },
          labelLine: {
            normal: {
              show: false,
            },
          },
          data: [
            { value: this.videoNum },
            { value: this.videoTotal - this.videoNum },
          ],
        },
      })
      // 电子巡更统计
      this.initChart('chart_el', {
        color: ['#14948f', '#0a2332'],
        title: {
          show: true,
          text: `${Number.parseInt(this.eleNum / this.eleTotal * 100)}%`,
          subtext: '已执行',
          x: 'center',
          y: 'center',
          textStyle: {
            fontSize: '14',
            color: '#14948f',
            fontWeight: 'bold',
          },
          subtextStyle: {
            fontSize: '10',
            color: '#fff',
            fontWeight: 'normal',
          },
          itemGap: 2, // 控制主副标题的间距
        },
        series: {
          name: '',
          type: 'pie',
          radius: ['65%', '85%'],
          avoidLabelOverlap: true,
          hoverAnimation: false,
          label: {
            normal: {
              show: false,
              position: 'center',
            },
            emphasis: {
              show: false,
            },
          },
          labelLine: {
            normal: {
              show: false,
            },
          },
          data: [
            { value: this.eleNum },
            { value: this.eleTotal - this.eleNum },
          ],
        },
      })
      // 安保统计
      this.initChart('chart_safe', {
        color: ['#e6c47d', '#0a2332'],
        title: {
          show: true,
          text: `${Number.parseInt(this.perNum / this.perTotal * 100)}%`,
          subtext: '在岗率',
          x: 'center',
          y: 'center',
          textStyle: {
            fontSize: '14',
            color: '#e6c47d',
            fontWeight: 'bold',
          },
          subtextStyle: {
            fontSize: '10',
            color: '#fff',
            fontWeight: 'normal',
          },
          itemGap: 2, // 控制主副标题的间距
        },
        series: {
          name: '',
          type: 'pie',
          radius: ['65%', '85%'],
          avoidLabelOverlap: true,
          hoverAnimation: false,
          label: {
            normal: {
              show: false,
              position: 'center',
            },
            emphasis: {
              show: false,
            },
          },
          labelLine: {
            normal: {
              show: false,
            },
          },
          data: [
            { value: this.perNum },
            { value: this.perTotal - this.perNum },
          ],
        },
      })
      // APP关闭率统计
      this.initChart('chart_app', {
        color: ['#3da6f9'],
        grid: {
          height: '90%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLine: {
            lineStyle: {
              color: '#474d55', // 控制 x轴的 颜色
            },
          },
          axisTick: {
            show: false, // 控制 x轴 是否显示刻度
          },
          axisLabel: {
            color: '#fff', // 字体颜色
            margin: 4, // x轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
          },
          data: ['06-06', '07-07', '08-08', '09-09', '10-10'],
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#474d55', // 控制 y轴的 颜色
            },
          },
          axisTick: {
            show: false, // 控制 y轴 是否显示刻度
          },
          axisLabel: {
            margin: 4, // y轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
            color: '#fff', // 字体颜色
          },
          splitLine: {
            show: true, // 分割线显示与否
            lineStyle: {
              color: '#171d25',
            },
          },
        },
        series: [{
          name: '关闭率',
          data: [8, 20, 13, 15, 10],
          type: 'line',
          smooth: true,
          areaStyle: {},
        }],
      })
    },
  },

}
</script>

<template>
  <div>
    <!-- 左边 -->
    <div class="side left-con">
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>告警处理状态统计</span>
        </div>
        <div
          id="chart_status"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>告警统计</span>
        </div>
        <div class="f1 dfr">
          <div
            id="chart_emergency"
            class="f1"
          />
          <div
            id="chart_normal"
            class="f1"
          />
        </div>
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>告警趋势</span>
        </div>
        <div
          id="chart_trend"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>紧急告警趋势</span>
        </div>
        <div
          id="chart_eTrend"
          class="f1"
        />
      </div>
    </div>
    <!-- 右边 -->
    <div class="side right-con">
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>视频巡更统计</span>
        </div>
        <div class="f1 dfr">
          <div
            id="chart_video"
            class="f1"
          />
          <div
            class="f1 dfr"
            style="align-items: center; text-align: center"
          >
            <div style="margin-right: 16px">
              <div
                class="fsw"
                style="color: #4c68a6"
              >
                {{ videoTotal }}
              </div>
              <div>总次数</div>
            </div>
            <div>
              <div
                class="fsw"
                style="color: #67b9f6"
              >
                {{ videoNum }}
              </div>
              <div>已执行</div>
            </div>
          </div>
        </div>
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>电子巡更统计</span>
        </div>
        <div class="f1 dfr">
          <div
            id="chart_el"
            class="f1"
          />
          <div
            class="f1 dfr"
            style="align-items: center; text-align: center"
          >
            <div style="margin-right: 16px">
              <div
                class="fsw"
                style="color: #4c68a6"
              >
                {{ eleTotal }}
              </div>
              <div>总次数</div>
            </div>
            <div>
              <div
                class="fsw"
                style="color: #14948f"
              >
                {{ eleNum }}
              </div>
              <div>已执行</div>
            </div>
          </div>
        </div>
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>安保统计</span>
        </div>
        <div class="f1 dfr">
          <div
            id="chart_safe"
            class="f1"
          />
          <div
            class="f1 dfr"
            style="align-items: center; text-align: center"
          >
            <div style="margin-right: 16px">
              <div
                class="fsw"
                style="color: #4c68a6"
              >
                {{ perTotal }}
              </div>
              <div>总人数</div>
            </div>
            <div>
              <div
                class="fsw"
                style="color: #e6c47d"
              >
                {{ perNum }}
              </div>
              <div>在岗</div>
            </div>
          </div>
        </div>
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>APP关闭率统计</span>
        </div>
        <div
          id="chart_app"
          class="f1"
        />
      </div>
    </div>
  </div>
</template>
