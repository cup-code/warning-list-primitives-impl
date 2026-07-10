<script>
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import MapboxLanguage from '@mapbox/mapbox-gl-language'
import mapboxgl from 'mapbox-gl'
import {
  getAllDevice,
  getAllIoById,
  getHmiDevs,
} from '@/http/dev/manage-api'
import { getAllHmi } from '@/http/hmi/manage-api'
import {
  addMapIcon,
  editMap,
  getMapInfoById,
} from '@/http/map/manage-api'
import 'mapbox-gl/dist/mapbox-gl.css' // 一定要引入样式， 否则有些东西显示不出来(比如导航控制条)
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css' // draw

export default {
  data() {
    return {
      mapId: '', // 地图id
      mapMarkers: [], // 存放地图标记
      videoChannelList: [], // 视频通道列表
      videoDevList: [], // 视频设备列表
      devTypeList: [], // 设备类型列表
      devIdList: [], // 设备id列表
      devIoList: [], // 设备输出列表
      hmiList: [], // 组态信息列表
      isPropLoading: false, // 属性添加器loading
      // mapbox
      mapDraw: null, // 地图绘制实例
      mapType: 'streets-v11', // streets-v9 普通地图 //satellite-v9 卫星地图 //dark-v10黑夜
      mapStyle: false, // 地图样式
      boxgl: null, // 地图实例
      showPopWindow: false, // 属性添加器开关
      // 弹窗属性表单
      formData: {
        icon: null,
        name: '',
        height: '',
        color: null,
        des: '',
        type: null,
        record: [],
        link: null,
        device: {
          productId: null,
          deviceId: null,
          ioArray: [],
        },
        video: {
          deviceId: null,
          channelId: null,
        },
      },
      mapBaseInfo: {}, // 地图的基础信息, 后台接口提供，保存数据时用
      drawData: {
        // 记录所有可编辑的图形数据
        type: 'FeatureCollection',
        features: [],
      },
      curId: null, // 记录 当前选中的图形的 图层id
      curType: '', // 记录 当前选中的图形的 类型 (LineString, Point, Polygon)
    }
  },
  computed: {
    isResize() {
      return this.$store.state.app.sidebar.opened
    },
  },
  watch: {
    // 如果属性添加器关闭， 则标识置空，数据清空
    showPopWindow(v) {
      if (!v) {
        this.curId = null
        this.formData = {
          icon: null,
          name: '',
          height: '',
          color: null,
          des: '',
          type: null,
          record: [],
          link: null,
          device: {
            productId: null,
            deviceId: null,
            ioArray: [],
          },
          video: {
            deviceId: null,
            channelId: null,
          },
        }
      }
    },
    // 为了解决 隐藏菜单时，地图没有自适应;
    isResize() {
      setTimeout(() => {
        this.boxgl.resize()
      }, 500)
    },
  },
  created() {
    this.mapId = this.$route.params.id
    this.getPrefix()
    this.initData()
  },
  mounted() {
    this.initMap()
  },
  beforeDestroy() {
    this.saveMapData()
  },
  methods: {
    /* 初始化组态数据 */
    initData() {
      // 获取组态数据
      getAllHmi(1)
        .then((res) => {
          if (res.data.success) {
            // 整理数据格式，抽取需要的部分
            for (const item of res.data.result) {
              let isExist = false
              for (const realItem of this.hmiList) {
                if (realItem.groupId == item.groupId) {
                  isExist = true
                  const someObj = {
                    id: item.id,
                    name: item.name,
                  }
                  realItem.list.push(someObj)
                  break
                }
              }
              if (!isExist) {
                this.hmiList.push({
                  groupId: item.groupId,
                  groupName: item.groupName,
                  list: [
                    {
                      id: item.id,
                      name: item.name,
                    },
                  ],
                })
              }
            }
          }
          else {
            this.$message.error(res.data.message)
          }
        })
        .catch((err) => {
          this.$message.error('获取组态数据出错', err)
        })
      // 获取设备数据
      getAllDevice()
        .then((res) => {
          if (res.data.success)
            this.devTypeList = res.data.result
          else this.$message.error(res.data.message)
        })
        .catch((err) => {
          this.$message.error('获取设备类型列表出错', err)
        })
    },
    /* 初始化地图 */
    initMap() {
      this.boxgl = new mapboxgl.Map({
        accessToken:
          'pk.eyJ1IjoiZGVsZXZlbnQiLCJhIjoiY2xpaW5xYTh6MDAwcTNyb2RpZzh0aTU2dCJ9.aU6dGRmaFtEHLryCYRDsTA',
        container: 'container-map',
        style: `mapbox://styles/mapbox/${this.mapType}`,
        center: [116.24959877851877, 39.974791961866096],
        zoom: 18,
        antialias: false,
        attributionControl: false,
      })

      // 设置语言
      const language = new MapboxLanguage({
        defaultLanguage: 'zh',
      })
      this.boxgl.addControl(language)

      // 导航控制条
      const nav = new mapboxgl.NavigationControl({
        visualizePitch: true,
      })
      this.boxgl.addControl(nav, 'bottom-right')

      // 自定义模式
      const modes = MapboxDraw.modes
      modes.draw_assisted_rectangle = 'rect' // rect
      this.mapDraw = new MapboxDraw({
        displayControlsDefault: true,
        modes,
        controls: {
          polygon: true,
          trash: true,
        },
      })
      // 地图加载完成
      this.boxgl.on('load', this.mapLoadEvt)
      // 地图的右键事件
      this.boxgl.on('contextmenu', this.rightClickEvt)
    },
    /* mapbox 加载事件 */
    mapLoadEvt() {
      this.boxgl.addControl(this.mapDraw)
      this.boxgl.on('draw.modechange', (e) => {
        if (e.mode === 'draw_polygon') {
          switch (e.clickName) {
            case 'mapbox-gl-draw_rect':
              this.mapDraw.changeMode('draw_assisted_rectangle')
              break
            case 'mapbox-gl-draw_polygon':
              this.mapDraw.changeMode('draw_polygon')
              break
            case 'mapbox-gl-draw_circle':
              this.mapDraw.changeMode('draw_circle')
              break
            default:
              console.log(`clickName 错误：${e.clickName}`)
          }
        }
      })
      this.boxgl.on('draw.create', this.saveMapData)
      this.boxgl.on('draw.delete', this.delMapData)
      this.boxgl.on('draw.update', this.saveMapData)
      this.getDataList() // 加载可编辑图形的数据
    },
    /* 加载可编辑图形的数据 */
    getDataList() {
      getMapInfoById(this.mapId).then((res) => {
        const result = res.data.result
        if (res.data.success) {
          // 设置地图中心点和缩放
          this.setCZ(result.center, result.zoom)
          this.mapBaseInfo = result
          this.drawData = result.jsonInfo
            ? JSON.parse(result.jsonInfo)
            : { type: 'FeatureCollection', features: [] }
          // 把数据注入draw工具
          this.mapDraw.add(this.drawData)
          // 更新地图标记
          this.updateIcon()
        }
      })
    },
    /* 切换 地图样式风格列表 显示与隐藏 */
    showMapStyle() {
      this.mapStyle = !this.mapStyle
    },
    /* 根据上传的图片更新地图icon */
    updateIcon() {
      // 清空marker
      this.mapMarkers.forEach((m) => {
        m.remove()
      })
      this.mapMarkers = []
      for (const markData of this.drawData.features) {
        if (markData.properties.icon) {
          const markOpt = document.createElement('div')
          markOpt.style.borderRadius = '50%'
          markOpt.style.width = '20px'
          markOpt.style.height = '20px'
          markOpt.style.backgroundSize = '100%'
          markOpt.style.cursor = 'pointer'
          markOpt.style.backgroundImage = `url(${markData.properties.icon})`
          // Add markers to the map.
          const marker = new mapboxgl.Marker(markOpt)
          let pos
          switch (markData.geometry.type) {
            case 'Polygon':
              let posX = 0
              let posY = 0
              const posLenth = markData.geometry.coordinates[0].length
              for (const posItem of markData.geometry.coordinates[0]) {
                posX += posItem[0]
                posY += posItem[1]
              }
              pos = [posX / posLenth, posY / posLenth]
              break
            case 'Point':
              pos = markData.geometry.coordinates
              break
            default:
              console.log('markData.geometry.type错误', markData.geometry.type)
              return
          }
          marker.setLngLat(pos)
          marker.addTo(this.boxgl)
          this.mapMarkers.push(marker) // 保存到mapMarkers中, 为了后续方便删除
        }
      }
    },
    /* 保存数据 */
    saveMapData(showMsg = false) {
      this.drawData = this.mapDraw.getAll()
      // 修改数据
      this.drawData.features.forEach((item) => {
        if (item.id === this.curId) {
          let proIcon = item.properties.icon
          if (this.formData.icon && proIcon != this.formData.icon) {
            proIcon = this.formData.icon
            this.updateIcon()
          }
          for (const key in this.formData) {
            item.properties[key] = this.formData[key]
          }
        }
      })
      this.mapDraw.set(this.drawData) // 把修改后的数据 保存到画图工具中
      const {
        name,
        remarks,
        status,
      } = this.mapBaseInfo
      const params = { name, remarks, status }
      params.id = this.mapId
      params.jsonInfo = JSON.stringify(this.drawData)

      // 保存mapbox地图的中心点、缩放级别
      const center = this.boxgl.getCenter()
      params.center = `${center.lng},${center.lat}`
      params.zoom = this.boxgl.getZoom()

      editMap(params)
        .then((res) => {
          if (res.data.success)
            this.$message.success(res.data.message || '保存成功')
          else this.$message.error(res.data.message || '保存失败')
        })
        .catch((err) => {
          this.$message.error('保存出错', err)
        })
    },
    /* 删除数据 */
    delMapData() {
      this.saveMapData()
      this.updateIcon()
    },
    /* mapbox 右键事件 */
    rightClickEvt(e) {
      const features = this.boxgl.queryRenderedFeatures(e.point)
      const tar = features[0]
      // 如果是可编辑的图形
      if (tar && tar.layer.id.includes('gl-draw')) {
        this.showPopWindow = true // 打开 属性添加器
        this.curId = tar.properties.id // 记录当前选中的图形
        console.log(this.curId, tar.properties.id)
        this.curType = tar.properties['meta:type'] // 记录当前选中图形的类型
        this.getCurData() // 找到选中图形的数据;
      }
      else {
        this.showPopWindow = false
      } // 关闭 属性添加器
    },
    /* 找到选中图形的数据,保存到formData中 */
    getCurData() {
      this.drawData.features.forEach((item) => {
        if (item.id === this.curId) {
          // this.formData = JSON.parse(JSON.stringify(item.properties))
          const obj = JSON.parse(JSON.stringify(item.properties))
          for (const key in obj) {
            this.formData[key] = obj[key]
          }
        }
      })
    },
    /* 地图风格切换 */
    mapTypeChange(value) {
      this.mapStyle = false
      this.boxgl.setStyle(`mapbox://styles/mapbox/${value}`) // 风格设置
    },
    /* 属性添加器 确定按钮 */
    doneClick() {
      this.$refs.ruleForm.validate((valid) => {
        if (!valid)
          return
        this.saveMapData(true) // 保存数据;
        this.showPopWindow = false // 关闭属性添加器
      })
    },
    /* 返回按钮 */
    backClick() {
      this.$router.back(-1)
    },
    /* 设置地图的中心点 和 缩放 */
    setCZ(center, zoom) {
      center && this.boxgl.setCenter(center.split(','))
      if (zoom || zoom == 0) {
        this.boxgl.setZoom(zoom)
      }
    },
    /* 上传前回调 */
    uploadEvt(data) {
      return new Promise((resolve, reject) => {
        if (!['image/png', 'image/jpg', 'image/jpeg'].includes(data.file.type)) {
          this.$message.error('只能上传png/jpg/jpeg格式的图片')
          reject()
        }
        else {
          this.isPropLoading = true
          addMapIcon(data.file)
            .then((res) => {
              if (res.data.success) {
                this.formData.icon = res.data.result
                resolve()
              }
              else {
                this.$message.error(res.data.message || '上传失败')
                reject()
              }
            })
            .catch((err) => {
              this.$message.error('上传失败')
              reject(err)
            })
            .finally(() => {
              this.isPropLoading = false
            })
        }
      })
    },
    /* 移除icon */
    removeIconClick() {
      this.formData.icon = null
    },
    /* 添加静态信息 */
    addRecordClick() {
      // 最多添加8个
      if (this.formData.record.length < 8) {
        this.formData.record.push({
          title: '',
          value: '',
          unit: '',
        })
      }
    },
    /* 删除静态信息 */
    delRecordClick(index) {
      this.formData.record.splice(index, 1)
    },
    /* 设备类型变化事件 */
    devTypeChange(pId) {
      this.devIdList = [] // 清空设备id列表;
      this.devIoList = [] // 清空设备io列表;
      this.formData.device.deviceId = '' // 清除表单选中的设备;
      this.formData.device.ioArray = [] // 清除表单选中的io点;
      // 请求该类型下的所有设备
      getHmiDevs(pId)
        .then((res) => {
          if (res.data.success) {
            this.devIdList = res.data.result
          }
          else {
            this.$message.error(res.data.message || '查询设备失败')
          }
        })
        .catch(() => {
          this.$message.error('查询设备失败')
        })
    },
    /* 设备id变化 */
    devIdChange(dId) {
      this.devIoList = [] // 清空设备io列表;
      this.formData.device.ioArray = [] // 清除表单选中的io点;
      getAllIoById(dId)
        .then((res) => {
          if (res.data.success) {
            this.devIoList = res.data.result
          }
          else {
            this.$message.error(res.data.message || '获取设备测点失败')
          }
        })
        .catch(() => {
          this.$message.error('获取设备测点失败')
        })
    },
    /* 设备输出变化 */
    devIoChange(v) {
      // 长度限制为8
      if (v.length > 8) {
        v.splice(8)
      }
    },
    /* 视频设备变化 */
    videoDevChange(devId) {
      this.videoChannelList = []
      this.formData.video.channelId = ''
      for (const item of this.videoDevList) {
        if (item.deviceId == devId) {
          for (const cKey in item.channelMap) {
            this.videoChannelList.push(item.channelMap[cKey])
          }
          break
        }
      }
    },
    /* 数据类型变化 */
    dataTypeChange() {
      this.formData.record = []
      this.formData.link = null
      this.formData.device.productId = null
      this.formData.device.deviceId = null
      this.formData.device.ioArray = []
      this.formData.video.deviceId = null
      this.formData.video.channelId = null
    },
  },
}
</script>

<template>
  <div class="mapEdit-detail">
    <!-- 地图 -->
    <div id="container-map" />
    <!-- 自己的控制条 -->
    <div class="self-control left-top">
      <div
        class="ctr-item"
        @click="backClick"
      >
        <i class="el-icon-back" />
      </div>
    </div>
    <div class="self-control right-top">
      <div
        class="ctr-item"
        @click="showMapStyle"
      >
        <i class="el-icon-map-location" />
      </div>
    </div>
    <!-- 地图样式选择器 -->
    <div
      v-show="mapStyle"
      class="map-style animate__animated animate__fadeIn"
    >
      <el-radio-group
        v-model="mapType"
        class="map-style-list"
        @change="mapTypeChange"
      >
        <el-radio label="streets-v11">
          streets
        </el-radio>
        <el-radio label="dark-v10">
          dark
        </el-radio>
        <el-radio label="satellite-v9">
          satellite
        </el-radio>
      </el-radio-group>
    </div>

    <!-- 属性添加器  -->
    <div
      v-show="showPopWindow"
      v-loading="isPropLoading"
      :popper-append-to-body="false"
      class="pop-pro animate__animated animate__bounceInLeft"
    >
      <el-form
        ref="ruleForm"
        :model="formData"
        label-width="70px"
      >
        <el-form-item label="图标">
          <div class="upload-btn">
            <!-- :class="{disUoloadSty:formData.icon}" -->
            <el-upload
              v-if="!formData.icon"
              list-type="picture-card"
              :limit="1"
              action
              accept=".jpg, .jpeg, .png"
              :http-request="uploadEvt"
              :on-remove="removeIconClick"
              :show-file-list="false"
            >
              <i class="el-icon-plus" />
            </el-upload>
            <div
              v-if="formData.icon"
              class="icon-box"
            >
              <el-image
                class="icon-image"
                :src="filePrefix + formData.icon"
              />
              <el-button
                type="primary"
                size="mini"
                @click="formData.icon = null"
              >
                重新上传
              </el-button>
            </div>
          </div>
        </el-form-item>
        <el-form-item
          label="名称"
          prop="name"
          :rules="{ required: true, message: '请输入名称', trigger: 'blur' }"
        >
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item
          v-if="curType == 'Polygon'"
          label="高度"
          prop="height"
          :rules="{ required: true, message: '请输入高度', trigger: 'blur' }"
        >
          <el-input
            v-model="formData.height"
            type="number"
          />
        </el-form-item>
        <el-form-item label="颜色">
          <el-color-picker
            v-model="formData.color"
            :disabled="formData.icon != null && curType == 'Point'"
          />
        </el-form-item>
        <el-form-item
          label="描述"
          prop="des"
          :rules="{ required: true, message: '请输入描述', trigger: 'blur' }"
        >
          <el-input v-model="formData.des" />
        </el-form-item>
        <el-form-item
          label="数据类型"
          prop="type"
          :rules="{
            required: true,
            message: '请选择数据类型',
            trigger: 'change',
          }"
        >
          <el-select
            v-model="formData.type"
            style="width: 100%"
            popper-class="pop-set"
            placeholder="请选择数据类型"
            @change="dataTypeChange"
          >
            <el-option
              label="静态信息"
              value="record"
            />
            <el-option
              label="组态"
              value="link"
            />
            <el-option
              label="设备监控"
              value="device"
            />
            <el-option
              label="视频监控"
              value="video"
            />
            <el-option
              label="内部弹窗"
              value="dialog"
            />
          </el-select>
        </el-form-item>
        <!-- 静态信息 -->
        <el-form-item
          v-show="formData.type == 'record'"
          label="静态信息"
        >
          <el-button
            style="width: 22px; height: 22px; padding: 0; margin: 0"
            type="primary"
            icon="el-icon-plus"
            circle
            @click="addRecordClick"
          />
          <div
            v-for="(item, index) in formData.record"
            :key="index"
            class="list-box"
          >
            <el-input
              v-model="item.title"
              style="width: 100px"
              placeholder="标题名"
            />
            <el-input
              v-model="item.value"
              style="width: 100px"
              placeholder="标题值"
            />
            <el-input
              v-model="item.unit"
              style="width: 100px"
              placeholder="单位"
            />
            <el-button
              style="width: 22px; height: 22px; padding: 0; margin: 0"
              type="danger"
              icon="el-icon-close"
              circle
              @click="delRecordClick(index)"
            />
          </div>
        </el-form-item>
        <!-- 组态页面 -->
        <el-form-item
          v-show="formData.type == 'link'"
          label="组态页面"
          prop="link"
          :rules="{
            required: formData.type == 'link',
            message: '请选择组态页面',
            trigger: 'change',
          }"
        >
          <el-select
            v-model="formData.link"
            placeholder="请选择组态页面"
          >
            <el-option-group
              v-for="group in hmiList"
              :key="group.groupId"
              :label="group.groupName"
            >
              <el-option
                v-for="item in group.list"
                :key="`zt${item.id}`"
                :label="item.name"
                :value="item.id"
              />
            </el-option-group>
          </el-select>
        </el-form-item>
        <!-- 设备监控 -->
        <el-form-item
          v-show="formData.type == 'device'"
          label="产品"
          prop="device.productId"
          :rules="{
            required: formData.type == 'device',
            message: '请选择产品',
            trigger: 'change',
          }"
        >
          <el-select
            v-model="formData.device.productId"
            style="width: 100%"
            popper-class="pop-set"
            placeholder="请选择产品"
            @change="devTypeChange"
          >
            <el-option
              v-for="item in devTypeList"
              :key="`type${item.id}`"
              :label="item.name"
              :value="item.productId"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-show="formData.type == 'device'"
          label="设备"
          prop="device.deviceId"
          :rules="{
            required: formData.type == 'device',
            message: '请选择设备',
            trigger: 'change',
          }"
        >
          <el-select
            v-model="formData.device.deviceId"
            style="width: 100%"
            popper-class="pop-set"
            placeholder="请选择设备"
            @change="devIdChange"
          >
            <el-option
              v-for="item in devIdList"
              :key="`dev${item.id}`"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-show="formData.type == 'device'"
          label="输出"
          prop="device.ioArray"
          :rules="{
            required: formData.type == 'device',
            message: '请选择输出',
            trigger: 'change',
          }"
        >
          <el-select
            v-model="formData.device.ioArray"
            style="width: 100%"
            popper-class="pop-set"
            multiple
            placeholder="请选择输出"
            @change="devIoChange"
          >
            <el-option
              v-for="item in devIoList"
              :key="`io${item.id}`"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <!-- 视频监控 -->
        <el-form-item
          v-show="formData.type == 'video'"
          label="视频设备"
          prop="video.deviceId"
          :rules="{
            required: formData.type == 'video',
            message: '请选择视频设备',
            trigger: 'change',
          }"
        >
          <el-select
            v-model="formData.video.deviceId"
            style="width: 100%"
            popper-class="pop-set"
            placeholder="请选择视频设备"
            @change="videoDevChange"
          >
            <el-option
              v-for="item in videoDevList"
              :key="item.deviceId"
              :label="item.name"
              :value="item.deviceId"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-show="formData.type == 'video'"
          label="通道"
          prop="video.channelId"
          :rules="{
            required: formData.type == 'video',
            message: '请选择通道',
            trigger: 'change',
          }"
        >
          <el-select
            v-model="formData.video.channelId"
            style="width: 100%"
            popper-class="pop-set"
            placeholder="请选择通道"
          >
            <el-option
              v-for="item in videoChannelList"
              :key="item.channelId"
              :label="item.name"
              :value="item.channelId"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button
            style="margin: 0 10px 0 0"
            @click="showPopWindow = false"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            @click="doneClick"
          >
            提交
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mapEdit-detail {
  width: 100%;
  height: calc(100vh - 50px);
  position: relative;

  #container-map {
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

    // 绘图工具条
    .mapboxgl-ctrl-top-right .mapboxgl-ctrl {
      margin-top: 50px;
    }

    // 隐藏 合并和取消合并 工具
    .mapbox-gl-draw_combine,
    .mapbox-gl-draw_uncombine {
      display: none;
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

  // 控制地图样式
  .map-style {
    position: absolute;
    top: 10px;
    right: 45px;
    z-index: 100;
    background: #fff;
    padding: 6px;
    border-radius: 2px;

    .map-style-list {
      .el-radio {
        margin: 0;

        &:nth-child(2) {
          margin: 0 10px;
        }

        .el-radio__label {
          padding-left: 6px;
        }
      }
    }
  }

  // 属性添加器
  .pop-pro {
    position: absolute;
    top: 50px;
    left: 10px;
    background: #fff;
    border-radius: 4px;
    padding: 16px 30px 16px 5px;
    width: 500px;
    max-height: 80%;
    overflow-y: auto;

    .el-form {
      .el-form-item {
        margin-bottom: 12px;

        &:last-child {
          margin: 0;
        }

        .list-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 10px 0 0 0;
        }
      }
    }
  }
}

.pop-set {
  min-width: 400px !important;
}

.upload-btn {
  // .el-upload-list--picture-card .el-upload-list__item-thumbnail{
  //   display: none;
  // }
  .el-upload--picture-card {
    width: 80px;
    height: 80px;
    line-height: 90px;
  }

  .icon-box {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .icon-image {
      width: 80px;
      height: 80px;
      margin: 0 20px 0 0;
      // border-radius: 50%;
    }
  }
}
</style>
