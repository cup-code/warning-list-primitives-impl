<script type="text/ecmascript-6">
import {
  getCount24,
  getDevOnOff,
  getSheetHis,
} from '@/http/magic-api'
// import { getAlarmReal } from '@/http/devices-api'
export default {
  data() {
    return {
      allCharts: {
        chart_person: null, // 人员
        chart_car: null, // 车辆
        chart_energy: null, // 能耗
        chart_order: null, // 工单
        chart_device: null, // 设备
        chart_car_park: null, // 24小时车位饱和统计
      },
      personNum: 20, // 人员数量
      personTotal: 100, // 人员总数
      placeHolderStyle: {
        normal: {
          color: '#0a2332',
          borderColor: '#0a2332',
          borderWidth: 10,
        },
      },
      tableData: [], // 实时报警数据
      interFn: null, // 记录定时器
    }
  },
  created() {
    //   this.getAll();
    //   // 十分钟刷一次数据
    //   this.interFn = setInterval(() => {
    //       this.getAll();
    //   }, 600000);

  },
  mounted() {
    this.initAll() // 初始化所有图表
  },
  destroyed() {
    // 清除定时器
    clearInterval(this.interFn)
    this.interFn = null
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
    // 初始化所有图表
    initAll() {
      // 人员图表
      this.initChart('chart_person', {
        color: ['#48a5ee', '#0a2332'],
        title: {
          show: true,
          text: this.personNum,
          subtext: '人员总数',
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
            { value: this.personNum },
            { value: this.personTotal - this.personNum },
          ],
        },
      })

      // 车位图表
      this.initChart('chart_car', {
        color: ['#27f1ec', '#0a2332'],
        title: {
          show: true,
          text: 0,
          subtext: '车位总数',
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
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            return `${params.name}: ${params.data.value}`
          },

        },
        series: {
          name: '',
          type: 'pie',
          radius: ['65%', '85%'],
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
          hoverOffset: 5, // 控制 hover时 变大的距离
          data: [
            { name: '已用', value: 0 }, // 已用车位数
            { name: '未用', value: 0 }, // 未用车位数
          ],
        },
      })

      // 能耗统计
      this.initChart('chart_energy', {
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
          data: ['公共设备', '用户设备', '照明设备'],
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
            name: '公共设备',
            type: 'pie',
            clockWise: true, // 顺时加载
            hoverAnimation: false, // 鼠标移入变大
            radius: [60, 60],
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
            name: '用户设备',
            type: 'pie',
            clockWise: true,
            hoverAnimation: false,
            radius: [40, 40],
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
            name: '照明设备',
            type: 'pie',
            clockWise: true,
            hoverAnimation: false,
            radius: [20, 20],
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
                value: 5,
                name: '',
              },
              {
                value: 5,
                name: '',
                itemStyle: this.placeHolderStyle,
              },
            ],
          },
        ],
      })

      // 工单
      this.initChart('chart_order', {
        color: ['#1491ff', '#1bc7ff'], // 图例 和 柱状图 的 颜色
        title: {
          text: '近期工单趋势',
          textStyle: {
            color: '#fff',
            fontSize: 10,
          },
        },
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
          data: ['已完成', '应完成'],
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
              color: '#ccc', // 控制 x轴的 颜色
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
          data: [],
        },
        yAxis: {
          type: 'value',
          axisLine: {
            lineStyle: {
              color: '#ccc', // 控制 y轴的 颜色
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
            show: false, // 分割线显示与否
          },
        },
        series: [
          {
            name: '已完成',
            type: 'bar',
            barMaxWidth: 10,
            stack: '标签',
            data: [],
          },
          {
            name: '应完成',
            type: 'bar',
            barMaxWidth: 10,
            stack: '标签',
            data: [],
          },
        ],
      })

      // 设备
      this.initChart('chart_device', {
        color: ['#1cbdf9', '#24e47f', '#207dd1'],
        tooltip: {
          trigger: 'item',
          formatter: (params) => {
            return `设备数量: ${params.data.ext.devNum
            }<br>在线: ${params.data.ext.onNum
            }<br>离线: ${params.data.ext.offNum
            }<br>故障: ${params.data.ext.badNum}`
          },
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
          pageIconColor: 'yellowgreen', // legend区域  滚动条控制按钮 的颜色(type为scroll时 有效)
          pageIconInactiveColor: '#666', // legend区域 滚动条控制按钮 不可点击的时候 的 颜色(type为scroll时 有效)
          pageTextStyle: {
            color: 'yellowgreen', // legend区域 滚动条页数的 字体颜色
          },
          data: ['排风机', '冷却塔', '烟感器', '摄像头', '闸机'],
        },
        series: {
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
          center: ['50%', '40%'], // 控制 饼图的位置
          hoverOffset: 5, // 控制 hover时 变大的距离
          data: [
            {
              ext: { devNum: 30, onNum: 14, offNum: 16, badNum: 0 },
              name: '排风机',
              value: 30,
            },
            {
              ext: { devNum: 10, onNum: 3, offNum: 4, badNum: 3 },
              name: '冷却塔',
              value: 10,
            },
            {
              ext: { devNum: 50, onNum: 14, offNum: 16, badNum: 20 },
              name: '烟感器',
              value: 50,
            },
            {
              ext: { devNum: 100, onNum: 90, offNum: 0, badNum: 10 },
              name: '摄像头',
              value: 100,
            },
            {
              ext: { devNum: 17, onNum: 10, offNum: 3, badNum: 4 },
              name: '闸机',
              value: 17,
            },

          ],
        },
      })

      // 24小时车位饱和统计
      this.initChart('chart_car_park', {
        color: ['#1fe8f9', '#15a5fb', '#e6c47d', '#22ff70'],
        grid: {
          height: '90%',
          left: '0%',
          right: '0%',
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
          data: [],

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
              show: false, // 分割线显示与否
            },

          },
        ],
        series: [
          {
            name: '总车位',
            type: 'bar',
            stack: '数量',
            barMaxWidth: 20,
            data: [],
          },
          {
            name: '总车',
            type: 'bar',
            stack: '数量',
            barMaxWidth: 20,
            data: [],
          },
          {
            name: '剩余车位',
            type: 'bar',
            stack: '数量',
            barMaxWidth: 20,
            data: [],
          },
          {
            name: '饱和度',
            type: 'line',
            yAxisIndex: 1,
            data: [],
          },
        ],
      })
    },

    // 所有接口集合
    getAll() {
      this.getSheet() // 请求工单
      this.getAlarm() // 请求实时报警数据
      this.getCount24() // 请求24小时车位饱和度数据
      this.getOnOff() // 请求设备在线数
    },
    // 请求工单
    getSheet() {
      getSheetHis(7).then((res) => {
        if (res.data.success && res.data.result) {
          this.setSheet(res.data.result)
        }
        else {
          this.setSheet([])
        }
      })
    },
    // 查询实时报警接口
    getAlarm() {
      // getAlarmReal(this.$store, 'page=0&pageSize=0').then(res => {
      //     var oData = res.data.results;
      //     if(oData.length > 0) {
      //         this.tableData = oData.map(item => ({
      //             date: formatDate(item.event_date).split(' ')[0],
      //             level: item.event_data.level,
      //             message: item.event_data.message,
      //             name: item.devName
      //         }))
      //     }else {
      //         this.tableData = [];
      //     }

      // })
    },
    // 请求24小时车位饱和度数据
    getCount24() {
      getCount24().then((res) => {
        const resD = res.data
        if (resD.success) {
          this.setCount24(resD.result)
        }
      })
    },
    // 请求设备在线数
    getOnOff() {
      getDevOnOff().then((res) => {
        const resD = res.data
        if (resD.success) {
          this.setParkNum(resD.result)
        }
      })
    },

    // 设置工单表格
    setSheet(dt) {
      const tags = []; const d1 = []; const d2 = []
      dt.forEach((d, i) => {
        if (i === 0) {
          tags.push('今天')
        }
        else {
          tags.push(`前${i}天`)
        }
        d1.push(d[0])
        d2.push(d[1])
      })

      this.allCharts.chart_order.setOption({
        xAxis: {
          data: tags,
        },
        series: [
          { data: d1 },
          { data: d2 },
        ],
      })
    },
    // 设置24小时车位饱和度图表
    setCount24(dt) {
      const tags = []; const d1 = []; const d2 = []; const d3 = []; const d4 = []
      let ratio
      dt.forEach((item) => {
        tags.push(`${new Date(item.counttime).getHours()}时`)
        d1.push(item.total)
        d2.push(item.stockcount)
        d3.push(item.leftcount)
        ratio = ((item.stockcount / item.total) * 100).toFixed(1)
        d4.push(ratio)
      })

      // 设置24小时饱和度
      this.allCharts.chart_car_park.setOption({
        xAxis: {
          data: tags,
        },
        series: [
          { data: d1 },
          { data: d2 },
          { data: d3 },
          { data: d4 },
        ],
      })
    },
    // 设置 车位总数图表
    setParkNum(dt) {
      this.allCharts.chart_car.setOption({
        title: {
          text: dt[1],
        },
        series: {
          data: [
            { name: '已用', value: dt[0] },
            { name: '未用', value: dt[1] - dt[0] },
          ],
        },
      })
    },

    // 点击报警列表的 单元格
    cellFn(row) {
      const str = `<b>报警设备:</b> ${row.name}<br>
                   <b>报警时间:</b> ${row.date}<br>
                   <b>报警类型:</b> ${row.level}<br>
                   <b>报警信息:</b> ${row.message}`

      this.$alert(str, '报警详情', {
        confirmButtonText: '关闭',
        dangerouslyUseHTMLString: true, // 以html方式解析str
      }).catch(() => {})
    },

  },

}
</script>

<template>
  <div class="magic-magic3D">
    <!-- 左边 -->
    <div class="side left-con">
      <div class="side-item bd2 h30">
        <div class="head-title">
          <span class="title-arrow" />
          <span>人车数量统计</span>
        </div>
        <div class="f1 dfr">
          <div
            id="chart_person"
            class="f1"
          />
          <div
            id="chart_car"
            class="f1"
          />
        </div>
      </div>
      <div class="side-item bd2 h30">
        <div class="head-title">
          <span class="title-arrow" />
          <span>24小时车位饱和度统计</span>
        </div>
        <div
          id="chart_car_park"
          class="f1"
        />
      </div>
      <div class="side-item bd2 h30">
        <div class="head-title">
          <span class="title-arrow" />
          <span>能耗统计</span>
        </div>
        <div
          id="chart_energy"
          class="f1"
        />
      </div>
    </div>
    <!-- 右边 -->
    <div class="side right-con">
      <div class="side-item bd2 h30">
        <div class="dfr right1-top">
          <div>
            <span class="ft12">本日工单</span>
            <span style="margin-left: 6px; font-size: 16px; color: #27f1ec">719</span>
          </div>
          <div>
            <span class="ft12">未处理工单</span>
            <span style="margin-left: 6px; font-size: 16px; color: #f99d49">58</span>
          </div>
        </div>
        <div
          id="chart_order"
          class="f1"
        />
      </div>
      <div class="side-item bd2 h30">
        <div class="head-title">
          <span class="title-arrow" />
          <span>设备信息</span>
        </div>
        <div
          id="chart_device"
          class="f1"
        />
      </div>
      <div class="side-item bd2 h30">
        <div class="head-title">
          <span class="title-arrow" />
          <span>实时报警</span>
        </div>
        <div class="f1 table-box">
          <el-table
            id="alert_table"
            :data="tableData"
            style="width: 100%"
            height="100%"
            empty-text="暂无数据..."
            @cell-click="cellFn"
          >
            <el-table-column
              prop="name"
              label="报警设备"
            />

            <el-table-column
              prop="date"
              label="报警时间"
              width="100"
            />

            <el-table-column
              prop="level"
              label="报警类型"
            />

            <el-table-column
              prop="message"
              label="报警信息"
            />
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>
