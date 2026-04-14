<script type="text/ecmascript-6">
export default {
  data() {
    return {
      allCharts: {
        chart_area: null, // 办公区使用率
        chart_env: null, // 室内环境质量
        chart_warn: null, // 告警统计
        chart_room: null, // 会议室使用统计
      },
      areaTotal: 1000, // 办公区 总数
      areaNum: 860, // 办公区 已使用数
      roomTotal: 56, // 会议室总数
      roomNum1: 45, // 会议室占用数
      roomNum2: 11, // 会议室空闲数

      // 会议室实时使用列表
      tableData: [
        {
          info: '设备1',
          name: '张三',
          date: '2020-06-29',
        },
        {
          info: '设备2',
          name: '李四',
          date: '2020-06-29',
        },
        {
          info: '设备3',
          name: '王五',
          date: '2020-06-29',
        },
        {
          info: '设备4',
          name: '赵六',
          date: '2020-06-29',
        },
        {
          info: '设备5',
          name: '齐七',
          date: '2020-06-29',
        },
        {
          info: '设备6',
          name: '孙八',
          date: '2020-06-29',
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
      // 办公区使用率
      this.initChart('chart_area', {
        color: ['#7c82d9', '#0a2332'],
        title: {
          show: true,
          text: `${Number.parseInt(this.areaNum / this.areaTotal * 100)}%`,
          subtext: '已使用',
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
          type: 'pie',
          radius: ['55%', '85%'],
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
            { value: this.areaNum },
            { value: this.areaTotal - this.areaNum },
          ],
        },
      })
      // 室内环境质量
      this.initChart('chart_env', {
        color: ['#22ff70', '#1fe8f9', '#15a5fb', '#7c82d9'],
        tooltip: {},
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
          data: ['D1', 'D2', 'D3', 'D4'],

        },
        radar: {
          center: ['30%', '50%'],
          radius: '80%',
          nameGap: 1,
          splitNumber: 4,
          splitArea: {
            areaStyle: {
              color: [],
            },
          },
          splitLine: {
            lineStyle: {
              color: '#686f77',
            },
          },
          axisLine: {
            lineStyle: {
              color: '#686f77',
            },
          },
          name: {
            textStyle: {
              color: '#fff',
              fontSize: 8,
            },
          },
          indicator: [
            { name: '温度', max: 50 },
            { name: '湿度', max: 100 },
            { name: 'CO₂', max: 100 },
            { name: 'PM2.5', max: 100 },
            { name: 'PM10', max: 100 },
          ],
        },
        series: [{
          type: 'radar',
          areaStyle: { normal: {} },
          lineStyle: {
            width: 0,
          },
          symbolSize: 1,

          data: [
            {
              value: [20, 50, 10, 40, 50],
              name: 'D1',
            },
            {
              value: [10, 10, 30, 50, 40],
              name: 'D2',
            },
            {
              value: [40, 60, 10, 10, 30],
              name: 'D3',
            },
            {
              value: [10, 20, 30, 40, 50],
              name: 'D4',
            },
          ],
        }],
      })
      // 告警统计
      this.initChart('chart_warn', {
        color: ['#7fceea', '#e6c47d'],
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
          data: ['一般', '紧急'],
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
              { value: 23, name: '一般' },
              { value: 68, name: '紧急' },
            ],
          },
        ],
      })
      // 会议室使用统计
      this.initChart('chart_room', {
        color: ['#4ebefd', '#53f1f2'],
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
          data: ['占用', '空闲'],
        },
        series: [
          {
            type: 'pie',
            radius: ['45%', '75%'],
            center: ['30%', '50%'],
            hoverAnimation: false,
            label: {
              normal: {
                show: false,
              },
              emphasis: {
                show: false,
              },
            },
            data: [
              { value: this.roomNum1, name: '占用' },
              { value: this.roomNum2, name: '空闲' },
            ],
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
          <span>办公区使用率</span>
        </div>
        <div class="f1 dfr">
          <div
            id="chart_area"
            class="f1"
          />
          <div class="f1 dfcc">
            <div style="margin-bottom: 10px">
              <div class="fc1">
                {{ areaNum }}
              </div>
              <div>已使用</div>
            </div>
            <div>
              <div class="fc1">
                {{ areaTotal }}
              </div>
              <div>总数</div>
            </div>
          </div>
        </div>
      </div>
      <div class="side-item bd1 h30">
        <div class="head-title">
          <span class="title-arrow" />
          <span>室内环境质量</span>
        </div>
        <div
          id="chart_env"
          class="f1"
        />
      </div>
      <div class="side-item bd1 h30">
        <div class="head-title">
          <span class="title-arrow" />
          <span>告警统计</span>
        </div>
        <div
          id="chart_warn"
          class="f1"
        />
      </div>
    </div>
    <!-- 右边 -->
    <div class="side right-con">
      <div class="side-item bd1 h30">
        <div class="head-title">
          <span class="title-arrow" />
          <span>会议室使用统计</span>
        </div>
        <div
          id="chart_room"
          class="f1"
        />
      </div>
      <div class="side-item bd3 h50">
        <div class="head-title">
          <span class="title-arrow" />
          <span>会议室实时使用列表</span>
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
              prop="info"
              label="信息"
            />
            <el-table-column
              prop="name"
              label="姓名"
            />
            <el-table-column
              prop="date"
              label="时间"
            />
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>
