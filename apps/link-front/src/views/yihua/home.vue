<script>
import { getDevAlarmRecord, getMapData } from '@/http/yihua-api'
// import 'echarts/map/js/china.js'
import { formatDate } from '@/utils'

export default {
  data: () => ({
    showR: true, // 控制右侧显示与否
    sForm: {
      deviceType: 1, // 默认废水
      dataType: 1, // 默认24小时
      isErr: false, // 默认正常数据
    },
    clock: null, // 时钟定时器
    cur_date: '',
    cur_time: '',

    mapDt: [], // 地图的 所有数据
    mapDt_cur: [], // 经过筛选条件过滤后的数据， 地图真正需要展示的数据
    chinaMap: null,
    toMonth: '',
    curMonth: '',
    allCharts: {
      chart_tra: null, // 传输率
      chart_eff: null, // 有效率
      chart_traEff: null, // 传输有效率
    },
    alarmList: [], // 报警列表
  }),
  computed: {
    ioList() {
      let ioList

      switch (this.sForm.deviceType) {
        case 1: // 废水
          ioList = [
            { code: 'codavg', name: 'COD浓度' },
            { code: 'andanavg', name: '氨氮浓度' },
            { code: 'wushuileiji', name: '污水流量' },
            { code: 'phzhiavg', name: 'PH值' },
            { code: 'codcou', name: 'COD排放量' },
            { code: 'andancou', name: '氨氮排放量' },
            { code: 'zongdanavg', name: '总氮浓度' },
            { code: 'zonglinavg', name: '总磷浓度' },
            { code: 'fuhuawuavg', name: '氟化物浓度' },
            { code: 'xuanfuwuavg', name: '悬浮物浓度' },
          ]
          break
        case 2: // 废气
          ioList = [
            { code: 'yanchenavg', name: '烟尘浓度' },
            { code: 'yanchenzsavg', name: '烟尘折算' },
            { code: 'eryanghualiuavg', name: '二氧化硫浓度' },
            { code: 'eryanghualiuzsavg', name: '二氧化硫折算' },
            { code: 'danyanghuawuavg', name: '氮氧化物浓度' },
            { code: 'danyanghuawuzsavg', name: '氮氧化物折算' },
            { code: 'feiqileiji', name: '废气排放量' },
            { code: 'yangqihanliangavg', name: '氧气含量' },
            { code: 'yanqiliusuavg', name: '烟气流速' },
            { code: 'yanqiwenduavg', name: '烟气温度' },
            { code: 'yanqijingyaavg', name: '烟气静压' },
            { code: 'yanchencou', name: '烟尘排放量' },
            { code: 'eryanghualiucou', name: '二氧化硫排放量' },
            { code: 'danyanghuawucou', name: '氮氧化物排放量' },
          ]
          break
        default:
          ioList = []
      }

      return ioList
    },
  },
  watch: {
    showR() {
      setTimeout(() => {
        this.chinaMap.resize()
      }, 500)
    },
    // 监测 废水、废气的切换
    'sForm.deviceType': function () {
      this.getDataList()
      this.sForm.point = ''
    },
    // 监测 时间的 的切换
    'sForm.dataType': function () {
      this.getDataList()
    },
    // 监测 异常选项的 切换
    'sForm.isErr': function (v) {
      // 生成 地图数据
      this.mapDt_cur = this.genPointData(v, this.sForm.point)
    },
    // 监测 测点单选的 变化
    'sForm.point': function (v) {
      if (!v)
        return
      this.mapDt_cur = this.genPointData(this.sForm.isErr, v)
    },
    // 监测 筛选后的地图数据
    mapDt_cur(v) {
      if (!this.sForm.point) {
        this.resetMap([]) // 清空地图
      }
      else {
        this.resetMap(v)
      }
    },

    // sForm: {
    //     // immediate: true,
    //     deep: true,
    //     handler(v) {
    //         console.log("深度监听sForm, 更新地图散点:", v)
    //         const option = this.chinaMap.getOption()
    //         option.series[1].data = [
    //           {name: '北京', value: [112.781327, 39.608266, 68]}
    //         ]
    //         this.chinaMap.setOption(option)
    //     },

    // }
  },
  created() {
    this.initClock() // 初始化时钟
  },
  mounted() {
    this.initMap()
    this.initAll() // 初始化所有图表

    this.getDataList() // 获取地图数据
    this.getAlarmList() // 获取报警数据
  },
  destroyed() {
    this.clearClock()
  },
  methods: {
    formatDate,
    // 获取接口的 地图数据
    getDataList() {
      getMapData(this.sForm)
        .then((res) => {
          const resD = res.data
          if (resD.success) {
            this.mapDt = resD.result || []
            this.mapDt_cur = this.genPointData(this.sForm.isErr, this.sForm.point)
          }
          else {
            this.mapDt = []
            this.mapDt_cur = []
          }
        })
        .catch((err) => {
          this.mapDt = []
          this.mapDt_cur = []
        })
    },
    // 获取报警数据
    getAlarmList() {
      getDevAlarmRecord({ page: 1, pageSize: 5 }).then((res) => {
        const resD = res.data
        if (resD.success === true) {
          this.alarmList = resD.result || []
        }
      })
    },
    // 过滤异常和正常数据
    genPointData(flag, p) {
      const arr = []
      let temp
      this.mapDt.forEach((item) => {
        temp = Object.assign({}, item)
        temp.eventDataList = [];
        (item.eventDataList || []).forEach((e) => {
          if (!flag && e.status == 0 && e.enName == p) {
            temp.eventDataList.push(e)
          }
          if (flag && e.status != 0 && e.enName == p) {
            temp.eventDataList.push(e)
          }
        })

        arr.push(temp)
      })

      return arr
    },

    initClock() {
      if (!this.clock) {
        this.clock = setInterval(() => {
          // 更新时间的
          const now = formatDate(+new Date()).split(' ')
          this.cur_date = now[0]
          this.cur_time = now[1].split(':').join(':')
        }, 1000)
      }
    },
    clearClock() {
      this.clock && clearInterval(this.clock)
      this.clock = null
    },
    initMap() {
      this.chinaMap = this.$echarts.init(this.$refs.china_map) // 这里是为了获得容器所在位置
      window.onresize = this.chinaMap.resize
      this.chinaMap.setOption({
        // 进行相关配置
        backgroundColor: '#fff',
        tooltip: {
          formatter(a) {
            return `${a.data.name}: ${a.data.value[2]}`
          },
        }, // 鼠标移到图里面的浮动提示框
        // 右下角 图例
        // visualMap: {
        //     show : true,
        //     right: '5%',
        //     bottom: '10%',
        //     pieces: [
        //         {gte: 100},
        //         {gte: 80, lt: 100},
        //         {gte: 0, lt: 80}
        //     ],
        //     formatter: function(a, b) {
        //         if(b === Infinity) {
        //             return '≥ ' + a + '%'
        //         }
        //         if(a === 0) {
        //             return a + ' ~ ' + b + '%'
        //         }
        //         return a + '% ~ ' + b + '%'
        //     },
        //     color: ['#f6012d', '#f2b83a', '#4bbd61']
        // },

        // 地图的 底图
        geo: {
          map: 'china', // 表示中国地图
          silent: true, // 不响应鼠标事件（为了取消 hover的高亮显示效果）
          label: {
            show: false,
          },
          // 地图的 外边廓
          itemStyle: {
            borderColor: 'rgba(0, 0, 0, 0.2)',
            borderType: 'dotted',
            shadowColor: 'rgba(128, 128, 128, .4)',
            shadowBlur: 10,
          },
          // 隐藏 南海诸岛
          regions: [
            {
              name: '南海诸岛',
              itemStyle: {
                opacity: 0,
              },
            },
          ],
        },
        series: [
          // 地图的 第二层
          {
            type: 'map',
            map: 'china',
            silent: true, // 不响应鼠标事件（为了取消 hover的高亮显示效果）
            label: {
              show: true,
              fontSize: 6,
            },
            itemStyle: {
              areaColor: '#fff',
              borderColor: 'rgba(128, 128, 128, .2)',
              borderType: 'dotted',
            },
            // 隐藏 南海诸岛（series中的map类型没有regions属性，所以不能通过regions属性隐藏南海诸岛。 改成设置data的方法隐藏）
            data: [
              {
                name: '南海诸岛',
                itemStyle: { opacity: 0 },
                label: { show: false },
              },
            ],
          },

          // 散点
          {
            type: 'scatter',
            coordinateSystem: 'geo', // 对应上方配置
            // symbol: 'image://' + require('@/assets/site.png'), // 自定义图标
            // symbol: 'pin', // 默认图标
            symbolSize: 15,
            data: [
              // {name: '鄂尔多斯', value: [112, 20, 102]}
            ],
          },
        ],
      })
    },
    // 初始化图表
    initChart(name, options) {
      this.allCharts[name] = this.$echarts.init(document.getElementById(name))
      this.allCharts[name].setOption(options)
    },
    // 初始化所有图表
    initAll() {
      // 传输率
      this.initChart('chart_tra', {
        tooltip: {
          show: false,
        },
        series: [
          {
            type: 'pie',
            color: ['#f8e5c1'], // 进度条的默认颜色
            radius: ['50%', '80%'],
            hoverAnimation: false,
            startAngle: 150, // 起始角度
            labelLine: {
              normal: { show: false },
            },
            data: [
              {
                value: 60,
                name: '传输率',
                // 中间文字
                label: {
                  normal: {
                    position: 'center',
                    fontSize: 10,
                    color: '#000',
                    formatter: '{r1|{d}%}\n{b}',
                    rich: {
                      r1: {
                        color: '#f0464e',
                        lineHeight: 24,
                        fontSize: 14,
                        fontWeight: 'bold',
                      },
                    },
                  },
                },
                // 自定义 进度条的样式
                itemStyle: {
                  normal: {
                    color: {
                      colorStops: [
                        { offset: 0, color: '#ed9931' }, // 0% 处的颜色
                        { offset: 1, color: '#f0464e' }, // 100% 处的颜色
                      ],
                    },
                    shadowColor: '#ee6f3e',
                    shadowBlur: 6,
                  },
                },
              },
              {
                value: 40,
                label: {
                  normal: { show: false },
                },
                itemStyle: {
                  emphasis: { color: '#f8e5c1' },
                },
              },
            ],
          },
        ],
      })

      // 有效率
      this.initChart('chart_eff', {
        tooltip: {
          show: false,
        },
        series: [
          {
            type: 'pie',
            color: ['#1dc7da'], // 进度条的默认颜色
            radius: ['50%', '80%'],
            hoverAnimation: false,
            startAngle: 120, // 起始角度
            labelLine: {
              normal: { show: false },
            },
            data: [
              {
                value: 75,
                name: '有效率',
                // 中间文字
                label: {
                  normal: {
                    position: 'center',
                    fontSize: 10,
                    color: '#000',
                    formatter: '{r1|{d}%}\n{b}',
                    rich: {
                      r1: {
                        color: '#1dc7da',
                        lineHeight: 24,
                        fontSize: 14,
                        fontWeight: 'bold',
                      },
                    },
                  },
                },
                // 自定义 进度条的样式
                itemStyle: {
                  normal: {
                    color: {
                      colorStops: [
                        { offset: 0, color: '#1fe195' }, // 0% 处的颜色
                        { offset: 1, color: '#1fe195' }, // 100% 处的颜色
                      ],
                    },
                    shadowColor: '#2fe58e',
                    shadowBlur: 6,
                  },
                },
              },
              {
                value: 25,
                label: {
                  normal: { show: false },
                },
                itemStyle: {
                  emphasis: { color: '#1dc7da' },
                },
              },
            ],
          },
        ],
      })

      // 传输有效率
      this.initChart('chart_traEff', {
        tooltip: {
          show: false,
        },
        series: [
          {
            type: 'pie',
            color: ['#87c7f1'], // 进度条的默认颜色
            radius: ['50%', '80%'],
            hoverAnimation: false,
            startAngle: 150, // 起始角度
            labelLine: {
              normal: { show: false },
            },
            data: [
              {
                value: 40,
                name: '传输有效率',
                // 中间文字
                label: {
                  normal: {
                    position: 'center',
                    fontSize: 10,
                    color: '#000',
                    formatter: '{r1|{d}%}\n{b}',
                    rich: {
                      r1: {
                        color: '#1683ed',
                        lineHeight: 24,
                        fontSize: 14,
                        fontWeight: 'bold',
                      },
                    },
                  },
                },
                // 自定义 进度条的样式
                itemStyle: {
                  normal: {
                    color: {
                      colorStops: [
                        { offset: 0, color: '#1683ed' }, // 0% 处的颜色
                        { offset: 1, color: '#1dc6ed' }, // 100% 处的颜色
                      ],
                    },
                    shadowColor: '#1774e8',
                    shadowBlur: 6,
                  },
                },
              },
              {
                value: 65,
                label: {
                  normal: { show: false },
                },
                itemStyle: {
                  emphasis: { color: '#87c7f1' },
                },
              },
            ],
          },
        ],
      })
    },
    // 重置地图数据
    resetMap(dt) {
      console.log('dt: ', dt)
      // 组装地图数据
      const mapData = []
      let temp
      let name
      dt.forEach((item) => {
        name = item.companyName;
        (item.eventDataList || []).forEach((e) => {
          temp = {}
          temp.name = name
          temp.value = [item.longitude, item.latitude, e.value]
          // 自定义颜色
          temp.itemStyle = {
            color: e.status == 0 ? '#4bbd61' : e.status == 1 ? '#f2b83a' : '#f6012d',
          }
          mapData.push(temp)
        })
      })

      // 更新地图
      const option = this.chinaMap.getOption()
      option.series[1].data = mapData
      console.log('mapData: ', mapData)
      this.chinaMap.setOption(option)
    },
  },
}
</script>

<template>
  <div class="home-yihua">
    <!-- 左边 -->
    <el-card class="main-left">
      <el-button
        class="rt-btn"
        :icon="showR ? 'el-icon-s-unfold' : 'el-icon-s-fold'"
        circle
        type="text"
        @click="showR = !showR"
      />
      <!-- 头部检索条件 -->
      <div class="left-top">
        <el-form
          ref="sForm"
          inline
          :model="sForm"
          label-width="75px"
          size="mini"
        >
          <div>
            <el-form-item>
              <el-radio-group v-model="sForm.deviceType">
                <el-radio :label="1">
                  废水监测
                </el-radio>
                <el-radio :label="2">
                  废气监测
                </el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item>
              <el-checkbox v-model="sForm.isErr">
                异常数据
              </el-checkbox>
            </el-form-item>
            <el-form-item>
              <el-radio-group v-model="sForm.dataType">
                <el-radio :label="1">
                  24小时
                </el-radio>
                <el-radio :label="2">
                  一周内
                </el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 时钟 -->
            <el-form-item>
              <el-tag class="self-tag">
                <svg-icon icon-class="clock" />
              </el-tag>
              <span style="padding: 0 6px 0 4px">{{ cur_date }}</span>
              <span>{{ cur_time }}</span>
            </el-form-item>
          </div>

          <!-- 测点列表 -->
          <div>
            <el-form-item class="specItem">
              <el-radio-group v-model="sForm.point">
                <el-radio
                  v-for="io in ioList"
                  :key="io.code"
                  :label="io.code"
                >
                  {{
                    io.name
                  }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </div>
        </el-form>
      </div>

      <!-- 地图 -->
      <div id="china_map" ref="china_map" />

      <!-- 图例 -->
      <div class="legendBox">
        <h3>图例</h3>
        <div>
          <span class="circle" style="background: #f6012d" />
          <span>>100%</span>
        </div>
        <div>
          <span class="circle" style="background: #f2b83a" />
          <span>80% ~ 100%</span>
        </div>
        <div>
          <span class="circle" style="background: #4bbd61" />
          <span>0 ~ 80%</span>
        </div>
      </div>

      <!-- 提示信息 -->
      <div class="tipBox">
        Tip: 监测评价%=实测值/指标值, 示意某排放量低于或高于国家标准值比例
      </div>
    </el-card>

    <!-- 右边 -->
    <transition>
      <el-card v-show="showR" class="main-right">
        <!-- 数据传输率   begin -->
        <el-row type="flex" align="middle">
          <el-col :span="14">
            <el-tag class="self-tag">
              <svg-icon icon-class="layer" />
              <span>数据传输率</span>
            </el-tag>
          </el-col>
          <el-col :span="10">
            <el-date-picker
              v-model="toMonth"
              style="width: 100%"
              type="month"
              placeholder="选择月"
            />
          </el-col>
        </el-row>
        <div style="padding-top: 2px; text-align: right">
          <el-checkbox v-model="curMonth">
            截止到当前月
          </el-checkbox>
        </div>
        <!-- 进度环 -->
        <el-row class="pgBar">
          <el-col id="chart_tra" :span="8">
            123
          </el-col>
          <el-col id="chart_eff" :span="8">
            456
          </el-col>
          <el-col id="chart_traEff" :span="8">
            789
          </el-col>
        </el-row>
        <!-- 数据传输率   end -->

        <!-- 异常报警   begin -->
        <div style="padding-top: 1.5vh">
          <el-tag class="self-tag">
            <i class="el-icon-message-solid" />
            <span>异常报警</span>
          </el-tag>
        </div>
        <el-timeline>
          <el-timeline-item
            v-for="(item, index) in alarmList"
            :key="index"
            placement="top"
            type="danger"
            :timestamp="formatDate(item.eventDate)"
          >
            <div>{{ item.company }}</div>
            <div class="alarm-info">
              {{ item.deviceName }} {{ item.ioName }} {{ item.message }}
            </div>
          </el-timeline-item>
        </el-timeline>
        <!-- 异常报警   end -->
      </el-card>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
.home-yihua {
  position: relative;
  padding: 10px;
  height: calc(100vh - 50px);
  display: flex;
  .el-card {
    .el-card__body {
      padding: 10px;
      height: 100%;
    }
  }

  .main-left {
    flex: 5;
    position: relative;
    .el-card__body {
      display: flex;
      flex-direction: column;

      .left-top {
        padding-right: 32px;
        .el-form-item {
          margin-right: 24px;
          margin-bottom: 10px;
        }
        .specItem {
          margin-bottom: 0;
          .el-radio {
            margin-bottom: 6px;
          }
        }
      }
      .rt-btn {
        font-size: 16px;
        position: absolute;
        right: 0;
        top: 0;
      }

      #china_map {
        flex: 1;
      }

      .legendBox {
        padding: 10px;
        border-radius: 6px;
        background: #e1fbf5;
        position: absolute;
        right: 2vh;
        bottom: 4vh;
        h3 {
          text-align: center;
          font-weight: normal;
          margin: 0;
          margin-bottom: 6px;
        }
        & > div {
          padding: 8px;
          display: flex;
          align-items: center;
        }

        .circle {
          display: inline-block;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          margin-right: 6px;
        }
      }

      .tipBox {
        position: absolute;
        bottom: 1vh;
        left: 0;
        width: 100%;
        text-align: center;
      }
    }
  }
  .main-right {
    flex: 3;
    margin-left: 6px;

    .el-card__body {
      display: flex;
      flex-direction: column;
      .pgBar {
        height: 25%;
        .el-col {
          height: 100%;
        }
      }
      .el-timeline {
        flex: 1;
        padding: 10px 4px;
        font-size: 12px;
        overflow: auto;
        .el-timeline-item__tail {
          border-left: 1px dashed #f56c6c;
        }
        .alarm-info {
          color: #f56c6c;
          padding-top: 6px;
        }
      }
    }
  }

  .el-radio {
    margin-right: 12px;
    &:last-child {
      margin-right: 0;
    }
  }
  .el-radio__label,
  .el-checkbox__label {
    font-size: 12px;
    padding-left: 6px;
  }
  .el-checkbox__inner {
    width: 12px;
    height: 12px;
    &::after {
      height: 5px;
      left: 3px;
    }
  }
  .self-tag {
    padding: 0;
    border: none;
    background: none;
    span {
      margin-left: 4px;
    }
  }
}
</style>
