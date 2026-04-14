<script>
import LivePlayer from '@liveqing/liveplayer'
import MapboxLanguage from '@mapbox/mapbox-gl-language'
import mapboxgl from 'mapbox-gl'
import { mapGetters } from 'vuex'
import { getRealDataById } from '@/http/dev/manage-api'
import { getHmiShareUrl } from '@/http/hmi/manage-api'
import { getMapInfoById } from '@/http/map/manage-api'
import 'mapbox-gl/dist/mapbox-gl.css'
// 一定要引入样式， 否则有些东西显示不出来(比如导航控制条)
export default {
  components: {
    LivePlayer,
  },
  data: () => ({
    bgWidth: 0,
    bgHeight: 0,
    popData: {
      name: '',
      des: '',
      type: '', // 弹窗类别
      record: [], // 静态信息
      linkUrl: '', // 组态分享地址
      devList: [], // 设备信息列表
      videoUrl: '', // 视频地址
    },
    isPopLoading: false, // 弹窗loading开关
    isShowPop: false, // 是否显示弹窗
    map: null,
    markers: [],
    lines: [],
    polygons: [],
  }),
  computed: {
    ...mapGetters(['sidebar']),
    isResize() {
      return this.sidebar.opened
    },
  },
  watch: {
    // 为了解决 隐藏菜单时，地图没有自适应;
    isResize() {
      setTimeout(() => {
        this.map.resize()
      }, 500)
    },
  },
  created() {
    this.getPrefix()
  },
  mounted() {
    this.bgWidth = this.$refs.mapView.getBoundingClientRect().width
    this.bgHeight = this.$refs.mapView.getBoundingClientRect().height
    this.initMap()
  },
  methods: {
    // 请求图形数据
    getDataList(fn) {
      const mapId = this.$route.params.id
      getMapInfoById(mapId).then((res) => {
        const resD = res.data
        if (resD.success) {
          const jsonInfo = resD.result.jsonInfo
          const dt = jsonInfo
            ? JSON.parse(jsonInfo)
            : {
                type: 'FeatureCollection',
                features: [],
              }
          fn(dt)

          // 设置地图中心点和缩放
          const center = resD.result.center
          const zoom = resD.result.zoom
          this.setCZ(center, zoom)
        }
      })
    },
    initMap() {
      this.map = new mapboxgl.Map({
        accessToken:
          'pk.eyJ1IjoiZGVsZXZlbnQiLCJhIjoiY2xpaW5xYTh6MDAwcTNyb2RpZzh0aTU2dCJ9.aU6dGRmaFtEHLryCYRDsTA',
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: [116.24959877851877, 39.974791961866096],
        zoom: 16,
        antialias: false,
        attributionControl: false,
      })

      // 设置语言
      const language = new MapboxLanguage({
        defaultLanguage: 'zh',
      })
      this.map.addControl(language)

      // 导航控制条
      const nav = new mapboxgl.NavigationControl({
        visualizePitch: true,
      })
      this.map.addControl(nav, 'bottom-right')

      // 添加全屏控件
      this.map.addControl(
        new mapboxgl.FullscreenControl({
          container: document.querySelector('map'),
        }),
      )
      // map load事件
      this.map.on('load', this.loadFn)
      // map 点击事件
      this.map.on('mousedown', this.mapClick)
    },
    // map的 load事件
    loadFn() {
      // 生成 地图的 3D建筑物
      // this.init3D_building();

      // 请求数据 && 加载到地图上
      this.getDataList((dt) => {
        this.fixData(dt) // 处理数据
        this.setDataToMap() // 在地图上显示;
      })
    },
    // 生成 地图的 3D建筑物
    init3D_building() {
      const layers = this.map.getStyle().layers

      let labelLayerId
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
          labelLayerId = layers[i].id
          break
        }
      }

      this.map.addLayer(
        {
          'id': '3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.6,
          },
        },
        labelLayerId,
      )
    },

    // 处理后台数据
    fixData(dt) {
      dt.features.forEach((item) => {
        // marker类型
        if (item.geometry.type === 'Point') {
          this.markers.push(item)
        }

        // line类型
        if (item.geometry.type === 'LineString') {
          this.lines.push(item)
        }

        // polygon类型
        if (item.geometry.type === 'Polygon') {
          this.polygons.push(item)
        }
      })
    },
    // 设置数据到地图上
    setDataToMap() {
      // 根据数据生成marker
      this.markers.forEach((item) => {
        this.addMarker(item)
      })

      // 生成所有的线 图层
      this.addLines()

      // 生成所有的多边形 图层
      // this.addPolygons();

      // 生成3D多边形 图层
      this.addPolygons_3D()
    },
    // 添加marker
    addMarker(markData) {
      const markOpt = document.createElement('div')
      markOpt.style.borderRadius = '50%'
      markOpt.style.width = '30px'
      markOpt.style.height = '30px'
      markOpt.style.backgroundSize = '100%'
      markOpt.style.cursor = 'pointer'
      // 判断是否有图标
      if (markData.properties.icon) {
        markOpt.style.backgroundImage = `url(${this.filePrefix}${markData.properties.icon})`
      }
      else {
        markOpt.className = 'el-icon-location-outline'
        markOpt.style.fontSize = '30px'
        markOpt.style.lineHeight = '30px'
        markOpt.style.textAlign = 'center'
        markOpt.style.color = markData.properties.color || 'blue'
      }
      // 非静态类型触发自定义弹窗
      // if (markData.properties.type != 'record') {
      markOpt.addEventListener('click', () => {
        this.markerClick(markData)
      })
      // }

      // Add markers to the map.
      const marker = new mapboxgl.Marker(markOpt)
      marker.setLngLat(markData.geometry.coordinates)
      marker.addTo(this.map)

      // 实例 popup
      // let myHtml = `<div style="text-align:center;">${markData.properties.name}</div>`
      // let popup = new mapboxgl.Popup().setHTML(myHtml)
      // marker.setPopup(popup)
    },
    // 添加 线条图层
    addLines() {
      const layer_line = {
        id: 'lines',
        type: 'line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#888',
          'line-width': 2,
        },
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: this.lines,
          },
        },
      }

      this.map.addLayer(layer_line)
    },
    // 添加 多边形图层
    addPolygons() {
      const layer_pg = {
        id: 'polygons',
        type: 'fill',
        paint: {
          'fill-color': '#088',
          'fill-opacity': 0.8,
        },
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: this.polygons,
          },
        },
      }

      this.map.addLayer(layer_pg)
    },
    // 生成polygon的 3D形态
    addPolygons_3D() {
      this.polygons.forEach((item) => {
        const height = item.properties.height
        const color = item.properties.color

        item.properties.min_height = Number.parseInt(0)
        item.properties.height = height ? Number.parseInt(height) : 0
        item.properties.color = color || '#f00'
      })
      this.map.addSource('states', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: this.polygons,
        },
      })

      this.map.addLayer({
        id: '3d-polygons',
        source: 'states',
        type: 'fill-extrusion',
        minzoom: 1,
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height'],
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height'],
          ],
          'fill-extrusion-opacity': 0.6,
        },
      })
      this.addPolygonsMarker()
    },
    /* 添加多边形mark */
    addPolygonsMarker() {
      for (const item of this.polygons) {
        if (item.properties.icon) {
          const markOpt = document.createElement('div')
          markOpt.style.borderRadius = '50%'
          markOpt.style.width = '30px'
          markOpt.style.height = '30px'
          markOpt.style.backgroundSize = '100%'
          markOpt.style.cursor = 'pointer'
          markOpt.style.backgroundImage = `url(${this.filePrefix}${item.properties.icon})`

          // Add markers to the map.
          const marker = new mapboxgl.Marker(markOpt)
          let posX = 0
          let posY = 0
          const posLenth = item.geometry.coordinates[0].length
          for (const pos of item.geometry.coordinates[0]) {
            posX += pos[0]
            posY += pos[1]
          }

          marker.setLngLat([posX / posLenth, posY / posLenth])
          marker.addTo(this.map)
        }
      }
    },

    // 返回按钮
    backFn() {
      this.$router.back(-1)
    },

    // 设置地图的中心点 和 缩放
    setCZ(center, zoom) {
      center && this.map.setCenter(center.split(','))
      if (zoom || zoom == '0') {
        this.map.setZoom(zoom)
      }
    },
    /* 点击地图事件,这里无法检测到点击mark，所以要分开处理 */
    mapClick(data) {
      // 先关闭已打开的弹窗
      this.isShowPop = false
      const features = this.map.queryRenderedFeatures(data.point)
      const tar = features[0]
      if (tar && tar.layer.id.includes('3d-polygons'))
        this.markerClick(tar)
    },
    /* 地图mark点击事件 */
    markerClick(data) {
      const markData = data.properties
      this.popData.type = markData.type
      this.popData.name = markData.name
      this.popData.des = markData.des
      this.isShowPop = true
      switch (markData.type) {
        case 'record':
          if (typeof markData.record == 'string')
            this.popData.record = JSON.parse(markData.record)
          else this.popData.record = markData.record
          break
        case 'link':
          this.popData.linkUrl = ''
          this.isPopLoading = true
          getHmiShareUrl(markData.link)
            .then((res) => {
              if (res.data.success) {
                this.popData.linkUrl = res.data.result
              }
              else {
                this.$message.error(res.data.message || '获取组态链接失败')
              }
            })
            .catch(() => {
              this.$message.error('获取组态链接失败')
            })
            .finally(() => {
              this.isPopLoading = false
            })
          break
        case 'device':
          this.popData.devList = []
          this.isPopLoading = true
          let device = markData.device
          if (typeof markData.device == 'string')
            device = JSON.parse(markData.device)
          getRealDataById(device.productId, device.deviceId, {
            page: 1,
            pageSize: 1000,
          })
            .then((res) => {
              if (res.data.success) {
                for (const item of res.data.result.list) {
                  for (const markCode of device.ioArray) {
                    if (item.code == markCode) {
                      const obj = {
                        name: item.name,
                        value: item.value,
                        unit: item.unit,
                        icon: item.icon,
                      }
                      this.popData.devList.push(obj)
                    }
                  }
                }
              }
              else {
                this.$message.error(res.data.message || '获取设备测点信息失败')
              }
            })
            .catch(() => {
              this.$message.error('获取设备测点信息失败')
            })
            .finally(() => {
              this.isPopLoading = false
            })
          break
        case 'video':
          this.popData.videoUrl = ''
          let video = markData.video
          if (typeof markData.video == 'string')
            video = JSON.parse(markData.video)
          this.$request({
            method: 'get',
            url: `http://10.11.2.18:8081/api/play/${video.deviceId}/${video.channelId}`,
          })
            .then((res) => {
              this.popData.videoUrl = this.getVideoUrlBySsrc(res.data.ssrc)
            })
            .catch(() => {
              this.$message.error('获取视频地址失败')
            })
          break
        case 'dialog':
          break
        default:
          console.log('data.properties.type 错误')
      }
    },
    // 通过 ssrc 生成 播放连接
    getVideoUrlBySsrc(src) {
      // let src = "0102005378"
      let hex_src = Number.parseInt(src).toString(16)
      const hex_src_size = 8 - hex_src.length
      for (let i = 0; i < hex_src_size; i++) {
        hex_src = `0${hex_src}`
      }
      hex_src = hex_src.toLocaleUpperCase()
      const videoUrl = `ws://10.11.2.18:801/rtp/${hex_src}.flv?st=${new Date().getTime()}`
      return videoUrl
    },
  },
}
</script>

<template>
  <div
    ref="mapView"
    class="mapView-detail"
  >
    <div id="map" />
    <!-- 自己的控制条 -->
    <div class="self-control left-top">
      <div
        class="ctr-item"
        @click="backFn"
      >
        <i class="el-icon-back" />
      </div>
    </div>
    <!-- mark详情弹窗 -->
    <div
      v-show="isShowPop"
      v-loading="isPopLoading"
      :popper-append-to-body="false"
      class="pop-pro"
    >
      <div>
        <div style="display: flex; justify-content: center; align-items: center; height: 20px">
          <p style="text-align: center; font-size: 16px; font-weight: bold; flex: 1">
            {{ popData.name }}
          </p>
          <i
            class="el-icon-close"
            style="cursor: pointer"
            @click="isShowPop = false"
          />
        </div>
        <p><span style="color: orange">描述：</span>{{ popData.des }}</p>
        <!-- 静态 -->
        <div v-if="popData.type == 'record'">
          <p
            v-for="(item, index) in popData.record"
            :key="index"
          >
            <span style="color: orange">{{ `${item.title}：` }}</span>
            {{ item.value || '无数据' }}
            <span v-if="item.value">{{ item.unit || '' }}</span>
          </p>
        </div>
        <!-- 组态 -->
        <div v-if="popData.type == 'link'">
          <!-- <a target="_blank" :href="popData.linkUrl">查看组态页面</a> -->
          <iframe
            :src="popData.linkUrl"
            frameborder="0"
            :height="0.7 * bgHeight"
            :width="0.7 * bgWidth"
          >您的浏览器无法显示外部链接</iframe>
        </div>
        <!-- 设备 -->
        <div v-if="popData.type == 'device'">
          <p
            v-for="(item, index) in popData.devList"
            :key="index"
          >
            <span style="color: orange">{{ `${item.name}：` }}</span>
            {{ item.value || '无数据' }}
            <span v-if="item.value">{{ item.unit || '' }}</span>
          </p>
        </div>
        <!-- 视频 -->
        <div v-if="popData.type == 'video'">
          <LivePlayer
            :style="`width:${0.75 * bgWidth}px;`"
            :videoUrl="popData.videoUrl"
            poster=""
            live
            muted
            stretch
            element-loading-text="加载中..."
            element-loading-background="#000"
            loading.sync=""
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mapView-detail {
  width: 100%;
  height: calc(100vh - 50px);
  position: relative;

  #map {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;

    .mapboxgl-canvas {
      outline: none;
    }

    // 隐藏mapbox商标
    .mapboxgl-ctrl-logo {
      display: none;
    }

    // popup 右上角的关闭按钮
    .mapboxgl-popup-close-button {
      outline: none;
    }
  }

  // 自己的 控制条 盒子
  .self-control {
    position: absolute;
    top: 10px;

    &.left-top {
      left: 10px;
    }

    &.right-top {
      right: 10px;
    }

    background: #fff;
    border-radius: 4px;

    &:not(:empty) {
      box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
    }

    .ctr-item {
      width: 29px;
      height: 29px;
      background: transparent;
      border-top: 1px solid #ddd;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &:first-child {
        border: none;
      }

      &:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      i {
        font-weight: bold;
      }
    }
  }

  .pop-pro {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    border-radius: 4px;
    padding: 15px 20px;
    min-width: 200px;
    max-height: 80%;
    overflow-y: auto;

    a {
      color: blue;
    }
  }
}
</style>
