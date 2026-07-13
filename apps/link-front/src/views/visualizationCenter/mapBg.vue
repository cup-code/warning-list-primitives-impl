<script>
import worldJson from './word.json'
// const worldJson = require('./word.json');
export default {
  name: 'mapBg',
  props: {
    msg: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      loading: false,
      map: null,
      center: [116.397026, 39.918058],
      zoom: 4,
    }
  },
  watch: {
    msg: {
      deep: true,
      handler(val) {
        this.getWorld(val)
      },
    },
  },
  mounted() {
    // this.init();
    this.getWorld(this.msg)
  },
  methods: {
    // init(){
    //   this.map = new window.AMap.Map('container', {
    //     center: [170.451348,43.792165],
    //     zoom: 1,
    //     zooms:[2,4],
    //     showLabel: false,
    //   });
    //   // 给地图添加点击事件
    //   this.map.on('click', this.mapClickFn);
    //
    //
    // },
    // mapClickFn(){
    //   // console.log(123)
    // },
    getWorld(data) {
      const that = this
      const namemap = worldJson.namemap
      const dataArr = worldJson.dataArr
      that.drawChart(namemap, dataArr)
    },
    drawChart(name, data) {
      const allMapData = {
        citys: [
          { name: '美国', value: [-118.24311, 34.052713, 100] },
          { name: '澳大利亚', value: [149.08, -35.15, 2] },
          { name: '以色列', value: [35.12, 31.47, 4] },
        ],
        moveLines: [
          {
            fromName: '长春',
            toName: '美国',
            coords: [
              [125.299633, 43.914039],
              [-118.24311, 34.052713],
            ],
          },
          {
            fromName: '长春',
            toName: '澳大利亚',
            coords: [
              [125.299633, 43.914039],
              [149.08, -35.15],
            ],
          },
          {
            fromName: '长春',
            toName: '以色列',
            coords: [
              [125.299633, 43.914039],
              [35.12, 31.47],
            ],
          },
        ],
      }
      const cityData = [{ name: '总公司', value: [125.299633, 43.914039, 10] }]
      // 基于准备好的dom，初始化echarts实例
      const chart = this.$echarts.init(document.getElementById('chart'))
      // 绘制图表数据
      const optionMap = {
        grid: {
          width: '100%',
          height: '100%',
          left: '0%',
          right: '0%',
          bottom: '0%',
          containLabel: true,
        },
        geo: {
          // 配合series一起使用，设置地图边缘3D阴影效果
          map: 'world',
          zoom: 1.2,
          aspectScale: 0.75,
          roam: true,
          itemStyle: {
            normal: {
              // areaColor: "#0a4ea2",
              shadowColor: '#0b345d',
              shadowOffsetX: 0,
              shadowOffsetY: 15,
            },
          },
          emphasis: {
            label: {
              show: false,
            },
            itemStyle: {
              areaColor: '#0a50a8',
            },
          },
        },
        series: [
          {
            name: '世界地图',
            type: 'map', // 类型
            map: 'world', // 地图类型
            zoom: 1.2, // 当前视角的缩放比例
            roam: true, // 是否开启鼠标缩放和平移漫游
            scaleLimit: {
              // 滚轮缩放的极限控制
              min: 1,
              max: 2,
            },
            // 地图区域的多边形 图形样式
            itemStyle: {
              areaColor: '#0a50a8', // 地图区域的颜色 如果设置了visualMap，areaColor属性将不起作用
              borderWidth: 0, // 描边线宽
            },
            // 高亮状态下的多边形和标签样式
            emphasis: {
              label: {
                show: false,
              },
              itemStyle: {
                areaColor: '#0a50a8', // 地图区域的颜色
              },
            },
            // nameMap: name,            // 自定义地区的名称映射
            // data: data             // 地图系列中的数据内容数组 数组项可以为单个数值
          },
          {
            name: '出发地',
            type: 'scatter',
            coordinateSystem: 'geo',
            zlevel: 2, // 用于 Canvas 分层
            label: {
              normal: {
                show: true,
                position: 'bottom', // 显示位置
                offset: [0, 10], // 偏移设置
                formatter: '{b}', // 圆环显示数据名
                fontSize: '20',
                textStyle: {
                  color: '#FFFF00',
                },
              },
              emphasis: {
                // 鼠标悬停样式
                // show: false,
                color: '#f60',
              },
            },
            symbol: 'pin', // 标记图形
            symbolSize: 30,
            itemStyle: {
              // 图形样式
              normal: {
                show: true,
                color: '#FFFF00',
                shadowColor: '#FFFF00',
                shadowBlur: 10,
              },
            },
            data: cityData,
          },
          {
            name: '目标地点',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            zlevel: 2,
            rippleEffect: {
              // 涟漪特效
              period: 4, // 动画时间，值越小速度越快
              brushType: 'stroke', // 波纹绘制方式 stroke, fill
              scale: 2, // ! 波纹圆环最大限制，值越大波纹越大
            },
            label: {
              normal: {
                show: true,
                position: 'bottom',
                offset: [5, 10],
                formatter: '{b}',
                fontSize: '15',
                textStyle: {
                  color: '#FFFF00',
                },
              },
            },
            symbol: 'circle',
            symbolSize: '6',
            itemStyle: {
              normal: {
                show: false,
                color: '#FFFF00',
                shadowColor: '#FFFF00',
                shadowBlur: 10,
              },
            },
            data: allMapData.citys,
          },
          {
            name: '线路',
            type: 'lines',
            coordinateSystem: 'geo',
            large: true,
            zlevel: 2,
            effect: {
              // 特效
              show: true,
              period: 10, // 箭头指向速度，值越小速度越快
              trailLength: 0.1, // 特效尾迹长度[0,1]值越大，尾迹越长重
              symbol: 'arrow', // 箭头图标
              symbolSize: 7, // 图标大小
            },
            lineStyle: {
              normal: {
                color: '#f8d325',
                width: 0.2, // 线条宽度
                opacity: 0.4, // 图形透明度，从0到1
                curveness: 0.3, // 线条弧度
              },
            },
            label: {
              normal: {
                show: false,
                position: 'middle',
                formatter: '{b}',
              },
            },
            data: allMapData.moveLines,
          },
        ],
      }
      // var uploadedDataURL =  "./data/test.json"  //获取本地文件或者发起网络请求
      // $.getJSON(uploadedDataURL, function(geoJson) {
      //  this.$echarts.registerMap('mapType',data);
      //  // mapType与optionMap中的数据字符串保持一致。data是提取成功后返回的数据。
      chart.setOption(optionMap)
      // }

      // 监听屏幕变化自动缩放图表
      window.addEventListener('resize', () => {
        chart.resize()
      })
    },
  },
}
</script>

<template>
  <div style="width: 100%; height: 100%; position: relative">
    <div
      id="chart"
      v-loading="loading"
      class="mapScreen"
    />
    <div class="bigScreen" />
  </div>
</template>

<style scoped lang="scss">
.mapScreen {
  z-index: 2;
  position: absolute;
  width: 82%;
  height: 85%;
  top: 55%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: auto;
  opacity: 0.8;
}
.bigScreen {
  z-index: 1;
  position: absolute;
  width: 100%;
  height: 100%;
  //height: calc(100vh - 50px);
  background-image: url('~@/assets/anqiBi/bg.png');
  background-repeat: no-repeat;
  background-size: 100% 100%;
}
</style>
