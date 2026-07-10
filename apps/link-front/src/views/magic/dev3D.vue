<script type="text/ecmascript-6">
export default {
  data() {
    return {
      allCharts: {
        chart_status: null, // 告警状态统计
        chart_alarm: null, // 告警分类统计
        chart_able: null, // 重要设备可用率
        chart_emergency: null, // 告警统计 - 紧急
        chart_normal: null, // 告警统计 - 一般
        chart_state: null, // 工单状态统计
        chart_order: null, // 工单统计
        chart_echo: null, // 工单平均响应时长
      },
      alarmTotal: 100, // 告警总数
      emergencyNum: 20, // 紧急告警数
      normalNum: 60, // 一般告警数
      placeHolderStyle: {
        normal: {
          color: '#0a2332',
          borderColor: '#0a2332',
          borderWidth: 10,
        },
      },
      tableData: [
        {
          date: '2020-06-29',
          info: '设备故障',
          name: '张三',
          phone: '13819087612',
        },
        {
          date: '2020-06-30',
          info: '设备维修',
          name: '赵四',
          phone: '13819087612',
        },
        {
          date: '2020-07-01',
          info: '设备保养',
          name: '王五',
          phone: '13819087612',
        },
        {
          date: '2020-07-02',
          info: '设备维修',
          name: '刘柳',
          phone: '13819087612',
        },
        {
          date: '2020-07-03',
          info: '设备故障',
          name: '钱老四',
          phone: '13819087612',
        },
        {
          date: '2020-07-04',
          info: '设备故障',
          name: '王老虎',
          phone: '13819087612',
        },
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
      // 告警状态统计
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
      // 告警分类统计
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
      // 重要设备可用率
      this.initChart('chart_able', {
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

      // 工单状态统计
      this.initChart('chart_state', {
        color: ['#53f1f2', '#4ebefd', '#30ed9d'],
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
          pageIconColor: '#53f1f2', // legend区域  滚动条控制按钮 的颜色(type为scroll时 有效)
          pageIconInactiveColor: '#666', // legend区域 滚动条控制按钮 不可点击的时候 的 颜色(type为scroll时 有效)
          pageTextStyle: {
            color: '#53f1f2', // legend区域 滚动条页数的 字体颜色
          },
          data: ['待处理', '处理中', '已完成'],
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
              { value: 0, name: '待处理' },
              { value: 0, name: '处理中' },
              { value: 0, name: '已完成' },
            ],
            center: ['50%', '40%'], // 控制 饼图的位置
            hoverOffset: 5, // 控制 hover时 变大的距离
          },
        ],
      })
      // 工单统计
      this.initChart('chart_order', {
        color: ['#4ebefd'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
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
          type: 'value',
          boundaryGap: [0, 0.01],
          axisTick: {
            show: false, // 控制 x轴 是否显示刻度
          },
          axisLine: {
            lineStyle: {
              color: '#474d55', // 控制 x轴的 颜色
            },
          },
          axisLabel: {
            color: '#fff', // 字体颜色
            margin: 4, // x轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
          },
          splitLine: {
            show: false, // 分割线显示与否
          },
        },
        yAxis: {
          type: 'category',
          data: ['07/02', '07/03', '07/04', '07/05', '07/06'],
          axisTick: {
            show: false, // 控制 x轴 是否显示刻度
          },
          axisLine: {
            lineStyle: {
              color: '#474d55', // 控制 x轴的 颜色
            },
          },
          axisLabel: {
            margin: 4, // y轴 与 刻度值 的 间距
            fontSize: 8, // 刻度字体大小
            color: '#fff', // 字体颜色
          },
        },
        series: [
          {
            name: '',
            type: 'bar',
            barMaxWidth: 10,
            data: [182, 234, 290, 104, 131],
          },
        ],
      })
      // 工单平均响应时长
      this.initChart('chart_echo', {
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
          <span>告警状态统计</span>
        </div>
        <div
          id="chart_status"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>告警分类统计</span>
        </div>
        <div
          id="chart_alarm"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>重要设备可用率</span>
        </div>
        <div
          id="chart_able"
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
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>工单状态统计</span>
        </div>
        <div
          id="chart_state"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>工单统计</span>
        </div>
        <div
          id="chart_order"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>工单平均响应时长</span>
        </div>
        <div
          id="chart_echo"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h24">
        <div class="head-title">
          <span class="title-arrow" />
          <span>实时工单信息</span>
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
              prop="date"
              label="时间"
              width="100"
            />

            <el-table-column
              prop="info"
              label="信息"
              width="100"
            />

            <el-table-column
              prop="name"
              label="姓名"
            />

            <el-table-column
              prop="phone"
              label="手机"
              width="100"
            />
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>
