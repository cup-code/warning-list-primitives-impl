<script type="text/ecmascript-6">
export default {
  data() {
    return {
      allCharts: {
        chart_real: null, // 实时用电监控
        chart_item: null, // 分项用电统计
        chart_save: null, // 月度节能统计
        chart_emergency: null, // 告警统计 - 紧急
        chart_normal: null, // 告警统计 - 一般
        chart_f15: null, // 上月需量偏差率 - f15
        chart_f18: null, // 上月需量偏差率 - f18
        chart_agree_cur: null, // 需量符合度 - 本月
        chart_agree_last: null, // 需量符合度 - 上月
        chart_future: null, // 需量预测
      },
      alarmTotal: 100, // 告警总数
      emergencyNum: 20, // 紧急告警数
      normalNum: 60, // 一般告警数
      fTotal: 100, // 需量总数
      f15Num: 20, // f15数量
      f18Num: 60, // f18数量
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
      // 实时用电监控
      this.initChart('chart_real', {
        color: ['#1abc69', '#1ac4c4'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985',
            },
          },
        },
        legend: {
          data: ['实际值', '均值'],
          x: 'right',
          itemWidth: 15, // 图例颜色块的 宽度
          itemHeight: 9,
          itemGap: 5, // 图例 之间的 间隔
          inactiveColor: '#666', // 图例未选中时 的 颜色值 (对 图例的 颜色块和文字 都有 作用)
          textStyle: {
            fontSize: 8,
            color: '#fff', // 图例选中时的 文字颜色
          },
        },
        grid: {
          height: '80%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
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
          data: ['06-06', '06-07', '06-08', '06-09', '06-10'],
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
        series: [
          {
            name: '实际值',
            type: 'line',
            smooth: true,
            data: [5.6, 12.9, 5.6, 12.9, 5.6],
          },
          {
            name: '均值',
            type: 'line',
            smooth: true,
            data: [10.9, 5.9, 10.9, 5.9, 10.9],
          },
        ],
      })
      // 分项用电统计
      this.initChart('chart_item', {
        color: ['#53f1f2', '#4ebefd', '#30ed9d', '#e6c47d'],
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        legend: {
          show: true,
          orient: 'vertical',
          right: '10%',
          top: 'middle',
          textStyle: {
            color: '#fff',
            fontSize: 14,
          },
          itemWidth: 14,
          itemHeight: 10,
          data: ['公共设备', '冷冻站', '用户设备', '照明设备'],
        },
        series: [
          {
            name: '能耗',
            type: 'pie',
            radius: [15, 50],
            center: ['30%', '50%'],
            roseType: 'radius',
            label: {
              show: false,
            },
            data: [
              { value: 10, name: '公共设备' },
              { value: 9, name: '冷冻站' },
              { value: 15, name: '用户设备' },
              { value: 16, name: '照明设备' },
            ],
          },
        ],
      })
      // 月度节能统计
      this.initChart('chart_save', {
        color: ['#22ff70', '#1fe8f9', '#15a5fb'], // 图例 和 柱状图 的 颜色
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        legend: {
          x: 'right',
          itemWidth: 15, // 图例颜色块的 宽度
          itemHeight: 9,
          itemGap: 5, // 图例 之间的 间隔
          inactiveColor: '#666', // 图例未选中时 的 颜色值 (对 图例的 颜色块和文字 都有 作用)
          textStyle: {
            fontSize: 8,
            color: '#fff', // 图例选中时的 文字颜色
          },
          data: ['去年', '今年', '同比节能'],
        },
        grid: {
          height: '80%',
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true,
        },
        xAxis: {
          type: 'category',
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
          data: ['7月', '8月', '9月', '10月', '11月', '12月'],
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
            color: '#fff', // 字体颜色
            margin: 4, // y轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
          },
          splitLine: {
            show: true, // 分割线显示与否
            lineStyle: {
              color: '#171d25',
            },
          },
        },
        series: [
          {
            name: '去年',
            type: 'bar',
            barMaxWidth: 10,
            data: [19, 12, 6, 34, 21, 17],
          },
          {
            name: '今年',
            type: 'bar',
            barMaxWidth: 10,
            data: [22, 12, 11, 24, 20, 30],
          },
          {
            name: '同比节能',
            type: 'bar',
            barMaxWidth: 10,
            data: [20, 22, 11, 34, 40, 30],
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
      // 上月需量偏差率 - f15
      this.initChart('chart_f15', {
        color: ['#4ebefd', '#0a2332'],
        title: {
          show: true,
          text: `${Number.parseInt(this.f15Num / this.fTotal * 100)}%`,
          subtext: 'F15',
          x: 'center',
          y: 'center',
          textStyle: {
            fontSize: '14',
            color: '#4ebefd',
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
            { value: this.f15Num },
            { value: this.fTotal - this.f15Num },
          ],
        },

      })
      // 上月需量偏差率 - f18
      this.initChart('chart_f18', {
        color: ['#53f1f2', '#0a2332'],
        title: {
          show: true,
          text: `${Number.parseInt(this.f18Num / this.fTotal * 100)}%`,
          subtext: 'F18',
          x: 'center',
          y: 'center',
          textStyle: {
            fontSize: '14',
            color: '#53f1f2',
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
            { value: this.f18Num },
            { value: this.fTotal - this.f18Num },
          ],
        },
      })
      // 需量符合度 - 本月
      this.initChart('chart_agree_cur', {
        title: {
          text: '本月达标值',
          left: 'center',
          bottom: '10%',
          textStyle: {
            color: '#fff',
            fontSize: 13,
          },
        },
        series: {
          type: 'gauge',
          // 大小
          radius: '80%',
          // 指针
          pointer: {
            width: 3,
            length: '60%',
          },
          // 中间值显示
          detail: {
            color: '#56e1fc',
            formatter: '{value}%',
            fontSize: 14,
            fontWeight: 'bold',
          },
          // 表盘
          axisLine: {
            lineStyle: {
              width: 25,
              color: [
                [1, new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  {
                    offset: 0.1,
                    color: '#1898e8',
                  },
                  {
                    offset: 1,
                    color: '#1acdf7',
                  },
                ])],
              ],
            },
          },
          // 表盘小刻度
          axisTick: {
            show: false,
          },
          // 表盘刻度数字
          axisLabel: {
            show: false,
          },
          // 表盘大刻度
          splitLine: {
            show: false,
          },
          data: [30],
        },
      })
      // 需量符合度 - 上月
      this.initChart('chart_agree_last', {
        title: {
          text: '上月达标值',
          left: 'center',
          bottom: '10%',
          textStyle: {
            color: '#fff',
            fontSize: 13,
          },
        },
        series: {
          type: 'gauge',
          // 大小
          radius: '80%',
          // 指针
          pointer: {
            width: 3,
            length: '60%',
          },
          // 中间值显示
          detail: {
            color: '#4dadf7',
            formatter: '{value}%',
            fontSize: 14,
            fontWeight: 'bold',
          },
          // 表盘
          axisLine: {
            lineStyle: {
              width: 25,
              color: [
                [1, new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  {
                    offset: 0.1,
                    color: '#1693f3',
                  },
                  {
                    offset: 1,
                    color: '#156fbd',
                  },
                ])],
              ],
            },
          },
          // 表盘小刻度
          axisTick: {
            show: false,
          },
          // 表盘刻度数字
          axisLabel: {
            show: false,
          },
          // 表盘大刻度
          splitLine: {
            show: false,
          },
          data: [75],
        },
      })
      // 需量预测
      this.initChart('chart_future', {
        color: ['#1fe8f9'],
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
          data: [12, 33, 30, 53, 42],
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
          <span>实时用电监控</span>
        </div>
        <div
          id="chart_real"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>分项用电统计</span>
        </div>
        <div
          id="chart_item"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>月度节能统计</span>
        </div>
        <div
          id="chart_save"
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
    </div>
    <!-- 右边 -->
    <div class="side right-con">
      <div class="side-item bd1 h30">
        <div class="head-title">
          <span class="title-arrow" />
          <span>上月需量偏差率</span>
        </div>
        <div class="f1 dfr">
          <div
            id="chart_f15"
            class="f1"
          />
          <div
            id="chart_f18"
            class="f1"
          />
        </div>
      </div>
      <div class="side-item bd1 h30">
        <div class="head-title">
          <span class="title-arrow" />
          <span>需量符合度</span>
        </div>
        <div class="f1 dfr">
          <div
            id="chart_agree_cur"
            class="f1"
          />
          <div
            id="chart_agree_last"
            class="f1"
          />
        </div>
      </div>
      <div class="side-item bd1 h30">
        <div class="head-title">
          <span class="title-arrow" />
          <span>需量预测</span>
        </div>
        <div
          id="chart_future"
          class="f1"
        />
      </div>
    </div>
  </div>
</template>
