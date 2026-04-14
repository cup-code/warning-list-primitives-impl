<script type="text/ecmascript-6">
export default {
  data() {
    return {
      allCharts: {
        chart_use: null, // 资产使用率
        chart_monitor: null, // 资产监控率
        chart_sec: null, // 资产图栏统计
        chart_alarm: null, // 紧急告警趋势
        chart_label: null, // 标签资产统计
        chart_sleep: null, // 沉睡资产统计
        chart_type: null, // 资产分类统计
      },
      assetTotal: 100, // 资产总数
      useNum: 20, // 资产使用数
      monitorNum: 60, // 资产监控数
      labelNum: 40, // 标签资产数
      sleepNum: 19, // 沉睡资产数
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
      // 资产使用率
      this.initChart('chart_use', {
        color: ['#48a5ee', '#0a2332'],
        title: {
          show: true,
          text: `${Number.parseInt(this.useNum / this.assetTotal * 100)}%`,
          subtext: '资产使用率',
          x: 'center',
          y: 'center',
          textStyle: {
            fontSize: '14',
            color: '#48a5ee',
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
            { value: this.useNum },
            { value: this.assetTotal - this.useNum },
          ],
        },
      })
      // 资产监控率
      this.initChart('chart_monitor', {
        color: ['#1fe8f9', '#0a2332'],
        title: {
          show: true,
          text: `${Number.parseInt(this.monitorNum / this.assetTotal * 100)}%`,
          subtext: '资产监控率',
          x: 'center',
          y: 'center',
          textStyle: {
            fontSize: '14',
            color: '#1fe8f9',
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
            { value: this.monitorNum },
            { value: this.assetTotal - this.monitorNum },
          ],
        },
      })
      // 资产图栏统计
      this.initChart('chart_sec', {
        color: ['#1fe8f9'], // 柱状图 的 颜色
        tooltip: {
          trigger: 'axis',
          axisPointer: { // 坐标轴指示器，坐标轴触发有效
            type: 'shadow', // 默认为直线，可选为：'line' | 'shadow'
          },
        },
        grid: {
          height: '90%',
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
          data: ['D1', 'D2', 'D3', 'D4'],
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
            type: 'bar',
            barMaxWidth: 20,
            data: [10, 7, 15, 2],
          },
        ],
      })
      // 紧急告警趋势
      this.initChart('chart_alarm', {
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
          data: ['待处理', '处理中', '已完成'],
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
          data: ['07/01', '07/02', '07/03', '07/04', '07/05', '07/06'],
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
            name: '待处理',
            type: 'bar',
            barMaxWidth: 10,
            data: [19, 12, 6, 34, 21, 17],
          },
          {
            name: '处理中',
            type: 'bar',
            barMaxWidth: 10,
            data: [22, 12, 11, 24, 20, 30],
          },
          {
            name: '已完成',
            type: 'bar',
            barMaxWidth: 10,
            data: [20, 22, 11, 34, 40, 30],
          },
        ],
      })

      // 标签资产统计
      this.initChart('chart_label', {
        color: ['#7fceea', '#0a2332'],
        title: {
          show: true,
          text: `${Number.parseInt(this.labelNum / this.assetTotal * 100)}%`,
          subtext: '标签资产',
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
            { value: this.labelNum },
            { value: this.assetTotal - this.labelNum },
          ],
        },
      })
      // 沉睡资产统计
      this.initChart('chart_sleep', {
        color: ['#7c82d9', '#0a2332'],
        title: {
          show: true,
          text: `${Number.parseInt(this.sleepNum / this.assetTotal * 100)}%`,
          subtext: '沉睡资产',
          x: 'center',
          y: 'center',
          textStyle: {
            fontSize: '14',
            color: '#7c82d9',
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
            { value: this.sleepNum },
            { value: this.assetTotal - this.sleepNum },
          ],
        },
      })
      // 资产分类统计
      this.initChart('chart_type', {
        color: ['#12233d', '#348f82', '#1d4e72', '#514e39', '#3d4a6a'],
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}',
        },
        legend: {
          y: 'bottom',
          top: '80%',
          type: 'scroll',
          itemWidth: 15, // 图例颜色块的 宽度
          itemGap: 5, // 图例 之间的 间隔
          inactiveColor: '#666', // 图例未选中时 的 颜色值 (对 图例的 颜色块和文字 都有 作用)
          textStyle: {
            color: '#ccc', // 图例选中时的 文字颜色
          },
          pageIconColor: '#1fe8f9', // legend区域  滚动条控制按钮 的颜色(type为scroll时 有效)
          pageIconInactiveColor: '#666', // legend区域 滚动条控制按钮 不可点击的时候 的 颜色(type为scroll时 有效)
          pageTextStyle: {
            color: '#1fe8f9', // legend区域 滚动条页数的 字体颜色
          },
          data: ['机械设备', '电子设备', '装修改良', '无形资产', '房屋建筑物'],
        },
        series: [
          {
            type: 'pie',
            avoidLabelOverlap: false,
            // hover时, 控制 中间标签 显示与否 以及 显示的样式
            label: {
              normal: {
                show: false,
                position: 'center',
              },
              emphasis: {
                show: false,
                textStyle: {
                  fontSize: '12',
                  color: '#fff',
                },
              },
            },
            labelLine: {
              normal: {
                show: false,
              },
            },
            data: [
              { value: 23, name: '机械设备' },
              { value: 68, name: '电子设备' },
              { value: 10, name: '装修改良' },
              { value: 127, name: '无形资产' },
              { value: 50, name: '房屋建筑物' },
            ],
            center: ['50%', '40%'], // 控制 饼图的位置
            hoverOffset: 5, // 控制 hover时 变大的距离
          },
        ],
      })
    },
  },

}
</script>

<template>
  <div>
    <!-- 左边 -->
    <div class="side left-con">
      <div class="side-item bd1 h15 l1">
        <div class="dfr l1-item">
          <div class="f1 l1-vol" />
          <div class="f1 l1-title">
            <div class="l1-num">
              6963
            </div>
            <div class="l1-text">
              资产总数
            </div>
          </div>
        </div>
        <div class="dfr l1-item">
          <div class="f1 l1-vol" />
          <div class="f1 l1-title">
            <div class="l1-num">
              28
            </div>
            <div class="l1-text">
              告警总数
            </div>
          </div>
        </div>
      </div>
      <div class="side-item bd1 h25">
        <div class="head-title">
          <span class="title-arrow" />
          <span>资产使用监控率</span>
        </div>
        <div class="f1 dfr">
          <div
            id="chart_use"
            class="f1"
          />
          <div
            id="chart_monitor"
            class="f1"
          />
        </div>
      </div>
      <div class="side-item bd1 h25">
        <div class="head-title">
          <span class="title-arrow" />
          <span>资产图栏统计</span>
        </div>
        <div
          id="chart_sec"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h25">
        <div class="head-title">
          <span class="title-arrow" />
          <span>紧急告警趋势</span>
        </div>
        <div
          id="chart_alarm"
          class="f1"
        />
      </div>
    </div>
    <!-- 右边 -->
    <div class="side right-con">
      <div class="side-item bd1 h15 l1">
        <div class="dfr l1-item">
          <div class="f1 l1-vol" />
          <div class="f1 l1-title">
            <div class="l1-num">
              163
            </div>
            <div class="l1-text">
              沉睡数
            </div>
          </div>
        </div>
        <div class="dfr l1-item">
          <div class="f1 l1-vol" />
          <div class="f1 l1-title">
            <div class="l1-num">
              782
            </div>
            <div class="l1-text">
              安装标签数
            </div>
          </div>
        </div>
      </div>
      <div class="side-item bd1 h25">
        <div class="head-title">
          <span class="title-arrow" />
          <span>安装标签资产统计</span>
        </div>
        <div class="f1 dfr">
          <div
            id="chart_label"
            class="f1"
          />
          <div class="f1 dfcc">
            <div style="margin-bottom: 10px">
              <div class="r2-num">
                782
              </div>
              <div>标签资产总数</div>
            </div>
            <div>
              <div class="r2-num">
                36%
              </div>
              <div>标签资产占比</div>
            </div>
          </div>
        </div>
      </div>
      <div class="side-item bd1 h25">
        <div class="head-title">
          <span class="title-arrow" />
          <span>沉睡资产统计</span>
        </div>
        <div class="f1 dfr">
          <div
            id="chart_sleep"
            class="f1"
          />
          <div class="f1 dfcc">
            <div style="margin-bottom: 10px">
              <div class="r3-num">
                782
              </div>
              <div>标签资产总数</div>
            </div>
            <div>
              <div class="r3-num">
                36%
              </div>
              <div>沉睡资产占比</div>
            </div>
          </div>
        </div>
      </div>
      <div class="side-item bd1 h25">
        <div class="head-title">
          <span class="title-arrow" />
          <span>资产分类统计</span>
        </div>
        <div
          id="chart_type"
          class="f1"
        />
      </div>
    </div>
  </div>
</template>
