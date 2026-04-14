<script type="text/ecmascript-6">
export default {
  data() {
    return {
      allCharts: {
        chart_day: null, // 今日各工单维护统计
        chart_month: null, // 本月各工单维护统计
        chart_order0: null, // 年度各月各优先级工单趋势
        chart_order1: null, // 各月工单总数及环比趋势
        chart_order2: null, // 各月定期维修工单及环比趋势
        chart_order3: null, // 各月应需维护工单及环比趋势
      },
      tableData: [
        { name: '张三', num: 100 },
        { name: '李四', num: 90 },
        { name: '王五', num: 80 },
        { name: '赵六', num: 70 },
        { name: '戚七', num: 60 },
      ],
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
      // 今日各工单维护统计
      this.initChart('chart_day', {
        color: ['#22ff70', '#1fe8f9', '#15a5fb'],
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
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
          pageIconColor: '#53f1f2', // legend区域  滚动条控制按钮 的颜色(type为scroll时 有效)
          pageIconInactiveColor: '#666', // legend区域 滚动条控制按钮 不可点击的时候 的 颜色(type为scroll时 有效)
          pageTextStyle: {
            color: '#53f1f2', // legend区域 滚动条页数的 字体颜色
          },
          data: ['设备维护', '应需维护', '其他'],
        },
        series: [
          {
            type: 'pie',
            radius: ['50%', '70%'],
            avoidLabelOverlap: false,
            label: {
              normal: {
                show: false,
                position: 'center',
              },
              emphasis: {
                show: true,
                textStyle: {
                  fontSize: '12',
                },
              },
            },
            labelLine: {
              normal: {
                show: false,
              },
            },
            data: [
              { value: 10, name: '设备维护' },
              { value: 32, name: '应需维护' },
              { value: 40, name: '其他' },
            ],
            center: ['50%', '40%'], // 控制 饼图的位置
            hoverOffset: 5, // 控制 hover时 变大的距离
          },
        ],
      })
      // 本月各工单维护统计
      this.initChart('chart_month', {
        color: ['#22ff70', '#1fe8f9', '#15a5fb'],
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c} ({d}%)',
        },
        legend: {
          orient: 'vertical',
          right: '15%',
          top: 'middle',
          itemWidth: 14, // 图例颜色块的 宽度
          itemHeight: 10,
          textStyle: {
            color: '#fff', // 图例选中时的 文字颜色
            fontSize: 14,
          },
          inactiveColor: '#666', // 图例未选中时 的 颜色值 (对 图例的 颜色块和文字 都有 作用)
          data: ['Ⅰ级', 'Ⅱ级', 'Ⅲ级'],
        },
        series: [
          {
            type: 'pie',
            center: ['30%', '50%'],
            hoverOffset: 5, // 控制 hover时 变大的距离
            label: {
              normal: {
                show: false,
              },
            },
            data: [
              { value: 20, name: 'Ⅰ级' },
              { value: 26, name: 'Ⅱ级' },
              { value: 20, name: 'Ⅲ级' },
            ],
          },
        ],
      })
      // 年度各月各优先级工单趋势
      this.initChart('chart_order0', {
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
      // 各月工单总数及环比趋势
      this.initChart('chart_order1', {
        color: ['#1fe8f9', '#22ff70'],
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
            crossStyle: {
              color: '#999',
            },
          },
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
          data: ['06-06', '06-07', '06-08', '06-09', '06-06', '06-10'],
        },
        yAxis: [
          {
            type: 'value',
            axisLabel: {
              formatter: '{value}',
              margin: 4, // y轴 与 刻度值 的 间距
              fontSize: 8, // 刻度字体大小
              color: '#fff', // 字体颜色
            },
            axisLine: {
              lineStyle: {
                color: '#474d55', // 控制 y轴的 颜色
              },
            },
            axisTick: {
              show: false, // 控制 y轴 是否显示刻度
            },
            splitLine: {
              show: true, // 分割线显示与否
              lineStyle: {
                color: '#171d25',
              },
            },
          },
          {
            type: 'value',
            axisLabel: {
              formatter: '{value} %',
              margin: 4, // y轴 与 刻度值 的 间距
              fontSize: 8, // 刻度字体大小
              color: '#fff', // 字体颜色
            },
            axisLine: {
              lineStyle: {
                color: '#474d55', // 控制 y轴的 颜色
              },
            },
            axisTick: {
              show: false, // 控制 y轴 是否显示刻度
            },
            splitLine: {
              show: false, // 分割线显示与否
            },
          },
        ],
        series: [
          {
            name: '数量',
            type: 'bar',
            barMaxWidth: 20,
            data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7],
          },
          {
            name: '环比',
            type: 'line',
            yAxisIndex: 1,
            data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2],
          },
        ],
      })
      // 各月定期维修工单及环比趋势
      this.initChart('chart_order2', {
        color: ['#22ff70', '#1fe8f9'],
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
            crossStyle: {
              color: '#999',
            },
          },
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
          data: ['06-06', '06-07', '06-08', '06-09', '06-06', '06-10'],
        },
        yAxis: [
          {
            type: 'value',
            axisLabel: {
              formatter: '{value}',
              margin: 4, // y轴 与 刻度值 的 间距
              fontSize: 8, // 刻度字体大小
              color: '#fff', // 字体颜色
            },
            axisLine: {
              lineStyle: {
                color: '#474d55', // 控制 y轴的 颜色
              },
            },
            axisTick: {
              show: false, // 控制 y轴 是否显示刻度
            },
            splitLine: {
              show: true, // 分割线显示与否
              lineStyle: {
                color: '#171d25',
              },
            },
          },
          {
            type: 'value',
            axisLabel: {
              formatter: '{value} %',
              margin: 4, // y轴 与 刻度值 的 间距
              fontSize: 8, // 刻度字体大小
              color: '#fff', // 字体颜色
            },
            axisLine: {
              lineStyle: {
                color: '#474d55', // 控制 y轴的 颜色
              },
            },
            axisTick: {
              show: false, // 控制 y轴 是否显示刻度
            },
            splitLine: {
              show: false, // 分割线显示与否
            },
          },
        ],
        series: [
          {
            name: '数量',
            type: 'bar',
            barMaxWidth: 20,
            data: [20, 49, 70, 23, 25, 7],
          },
          {
            name: '环比',
            type: 'line',
            yAxisIndex: 1,
            data: [2, 3, 3.3, 5.4, 3.6, 2.1],
          },
        ],
      })
      // 各月应需维护工单及环比趋势
      this.initChart('chart_order3', {
        color: ['#1fe8f9', '#22ff70'],
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
            crossStyle: {
              color: '#999',
            },
          },
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
          data: ['06-06', '06-07', '06-08', '06-09', '06-06', '06-10'],
        },
        yAxis: [
          {
            type: 'value',
            axisLabel: {
              formatter: '{value}',
              margin: 4, // y轴 与 刻度值 的 间距
              fontSize: 8, // 刻度字体大小
              color: '#fff', // 字体颜色
            },
            axisLine: {
              lineStyle: {
                color: '#474d55', // 控制 y轴的 颜色
              },
            },
            axisTick: {
              show: false, // 控制 y轴 是否显示刻度
            },
            splitLine: {
              show: true, // 分割线显示与否
              lineStyle: {
                color: '#171d25',
              },
            },
          },
          {
            type: 'value',
            axisLabel: {
              formatter: '{value} %',
              margin: 4, // y轴 与 刻度值 的 间距
              fontSize: 8, // 刻度字体大小
              color: '#fff', // 字体颜色
            },
            axisLine: {
              lineStyle: {
                color: '#474d55', // 控制 y轴的 颜色
              },
            },
            axisTick: {
              show: false, // 控制 y轴 是否显示刻度
            },
            splitLine: {
              show: false, // 分割线显示与否
            },
          },
        ],
        series: [
          {
            name: '数量',
            type: 'bar',
            barMaxWidth: 20,
            data: [10, 29, 40, 53, 33, 17],
          },
          {
            name: '环比',
            type: 'line',
            yAxisIndex: 1,
            data: [2.1, 3.6, 3, 4, 6, 2.1],
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
      <div class="side-item bd1 h30">
        <div class="head-title">
          <span class="title-arrow" />
          <span>今日各工单维护统计</span>
        </div>
        <div
          id="chart_day"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h30">
        <div class="head-title">
          <span class="title-arrow" />
          <span>本月各工单维护统计</span>
        </div>
        <div
          id="chart_month"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h30">
        <div class="head-title">
          <span class="title-arrow" />
          <span>本月完成工单前五的维修人员</span>
        </div>
        <div class="f1 table-box">
          <el-table
            id="alert_table"
            :data="tableData"
            style="width: 100%"
            height="100%"
            empty-text="暂无数据..."
          >
            <el-table-column
              prop="name"
              label="姓名"
            />
            <el-table-column
              prop="num"
              label="工单数"
            />
          </el-table>
        </div>
      </div>
    </div>
    <!-- 右边 -->
    <div class="side right-con">
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>年度各月各优先级工单趋势</span>
        </div>
        <div
          id="chart_order0"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>各月工单总数及环比趋势</span>
        </div>
        <div
          id="chart_order1"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>各月定期维修工单及环比趋势</span>
        </div>
        <div
          id="chart_order2"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>各月应需维护工单及环比趋势</span>
        </div>
        <div
          id="chart_order3"
          class="f1"
        />
      </div>
    </div>
  </div>
</template>
