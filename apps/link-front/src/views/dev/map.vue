<script>
import dianjiImage from '@/assets/lanying/dianji.png' // 电机温度图片路径
import dianliuImage from '@/assets/lanying/dianliu.png' // 电流图片路径
import dianyaImage from '@/assets/lanying/dianya.png' // 电压图片路径
import mixerImage from '@/assets/lanying/jixie.png' // 搅拌机图片路径
import mokuaifuImage from '@/assets/lanying/mokuai.png' // 模块温度图片路径
import qudongImage from '@/assets/lanying/qudong.png' // 驱动温度图片路径
import suduImage from '@/assets/lanying/sudu.png' // 模块温度图片路径
import zhenfuImage from '@/assets/lanying/zhenfu.png' // 振幅图片路径
import offlineMaker from '@/assets/map/offline.png'
import onlineMaker from '@/assets/map/online.png'
import warnMaker from '@/assets/map/warn.png'
import { getDeviceGroup } from '@/http/dev/group-api'
import {
  getDeviceListByGroupFn,
  getDeviceListByPid,
  getRealDataById,
} from '@/http/dev/manage-api'
import { getAllProduct } from '@/http/dev/product-api'
import { formatDate } from '@/utils'

export default {
  data: () => ({
    loading: false,
    mode: true, // true: 2D;  false: 3D;
    map: null,
    center: [116.397026, 39.918058],
    zoom: 4,
    searchFlag: false,
    sForm: {},
    productList: [], // 产品列表
    groupList: [], // 设备分组列表
    deviceList: [], // 根据条件筛选出来的 设备列表
    markers: [], // 用来放 地图上的所有marker实例
    clickMarkerData: {}, // 记录 当前点击的marker的数据
    markerConFlag: false,
    isLanyingAdmin: false, // 是否是蓝莹管理员
    markerConStyle: {}, // 动态样式
    mixerImage, // 搅拌机图片
    dianliuImage, // 电流图片
    dianyaImage, // 电压图片
    zhenfuImage, // 振幅图片
    dianjiImage, // 电机温度图片
    qudongImage, // 驱动温度图片
    mokuaifuImage, // 模块温度图片
    suduImage, // 速度图片
  }),
  created() {
    this.getProList()
    this.getGroupList()
  },
  mounted() {
    this.init()
    // 判断是否是蓝莹管理员
    this.isLanyingAdmin = this.$store.state.user.user.fullName === '蓝莹管理员'
    console.log(this.$store.state.user.user.fullName, '当前角色')
  },
  methods: {
    formatDate,
    // 获取产品列表
    getProList() {
      getAllProduct().then(({ data }) => {
        if (data.success === true) {
          this.productList = data.result || []
        }
      })
    },
    // 获取分组列表
    getGroupList() {
      getDeviceGroup().then(({ data }) => {
        if (data.success === true) {
          this.groupList = data.result || []
        }
      })
    },
    // 获取设备
    getDevices(flag, id) {
      this.loading = true
      this.deviceList = []
      let func = ''
      if (flag === 0) {
        // 代表id是产品
        func = getDeviceListByPid
      }
      else {
        // 代表id是分组
        func = getDeviceListByGroupFn
      }
      func(id)
        .then(({ data }) => {
          this.loading = false
          if (data.success) {
            this.deviceList = data.result || []
          }
          // 根据设备列表， 在地图上生成marker
          this.initObj()
        })
        .catch((err) => {
          this.loading = false
          // 根据设备列表， 在地图上生成marker
          this.initObj()
        })
    },
    init() {
      const mode = this.mode ? '2D' : '3D'

      this.map = new window.AMap.Map('map', {
        center: this.center,
        zoom: this.zoom,
        pitch: 45,
        viewMode: mode,
      })

      if (mode === '2D') {
        // 放大缩小工具条插件(只在2D下显示)
        this.map.plugin('AMap.ToolBar', () => {
          const toolbar = new window.AMap.ToolBar({
            position: 'RB',
            liteStyle: true,
          })
          this.map.addControl(toolbar)
        })
      }

      if (mode === '3D') {
        // 3D罗盘插件(只在3D下显示)
        this.map.plugin('AMap.ControlBar', () => {
          const controlBar = new window.AMap.ControlBar({
            position: { top: '120px', right: '0px' },
          })
          this.map.addControl(controlBar)
        })
      }

      // 右上角 地图切换插件
      this.map.plugin('AMap.MapType', () => {
        const mapTypeTool = new window.AMap.MapType({
          defaultType: 0,
        })
        this.map.addControl(mapTypeTool)
      })

      // 给地图添加点击事件
      this.map.on('click', this.mapClickFn)
    },
    initObj() {
      // 先清空地图上的所有覆盖物
      this.map.remove(this.map.getAllOverlays())
      this.markers = []

      // 生成marker
      this.deviceList.forEach((item) => {
        if (item.longitude) {
          const marker = new window.AMap.Marker({
            map: this.map,
            position: [item.longitude, item.latitude],
            title: item.name,
            offset: new window.AMap.Pixel(-12.5, -28),
            icon: new window.AMap.Icon({
              image: item.state == 3 ? warnMaker : item.state == 2 ? onlineMaker : offlineMaker,
              size: new window.AMap.Size(25, 25),
              imageSize: new window.AMap.Size(25, 25),
            }),
          })
          this.markers.push(marker)

          // 给每个marker注册点击事件
          marker.on('click', e => this.clickMarkerFn(e, item))
        }
      })

      // 设置地图为合适的 视野
      this.map.setFitView(this.markers)
    },
    // 清空地图覆盖物
    clearMap() {
      this.deviceList = []
      this.markers = []
      this.map.remove(this.map.getAllOverlays())
      this.map.setZoomAndCenter(this.zoom, this.center)
    },
    searchFn() {
      this.searchFlag = !this.searchFlag
    },
    // 维度change事件
    typeFn() {
      this.markerConFlag = false // 关闭点击marker时显示的内容盒子
      this.sForm.groupId = ''
      this.sForm.productId = ''
      this.clearMap()
    },
    // 产品change事件
    productFn(v) {
      this.markerConFlag = false // 关闭点击marker时显示的内容盒子
      this.getDevices(0, v)
    },
    // 分组change事件
    groupFn(v) {
      this.markerConFlag = false // 关闭点击marker时显示的内容盒子
      this.getDevices(1, v)
    },
    // 重置
    resetFn() {
      this.markerConFlag = false // 关闭点击marker时显示的内容盒子
      this.sForm = {}
      this.clearMap()
    },
    // 地图的点击事件
    mapClickFn() {
      this.markerConFlag = false // 关闭点击marker时显示的内容盒子
    },
    // marker的点击事件
    clickMarkerFn(e, v) {
      console.log(v, '盒子信息')
      const params = { page: 1, pageSize: 3000 }
      getRealDataById(v.productId, v.id, params).then((res) => {
        console.log(res.data.result.list, '设备实时数据')
        const resD = res.data.result.list

        // this.clickMarkerData.dt = resD.result || []
        // 更新具体数据
        this.updateMarkerData(resD)
      })
      this.clickMarkerData = {
        name: v.name,
        state: v.state,
        dt: [],
        electricCurrent: '100', // 电流
        voltage: '100', // 电压
        amplitude: '100', // 振幅
        motorTemp: '100', // 电机温度
        driveTemp: '100', // 驱动温度
        moduleTemp: '100', // 模块温度
        speed: '50', // 速度
      }
      this.markerConFlag = true

      // 计算盒子显示位置
      this.calculateMarkerConPosition(e)
    },
    calculateMarkerConPosition(e) {
      // 获取地图容器的尺寸
      const mapWidth = document.getElementById('map').offsetWidth
      const mapHeight = document.getElementById('map').offsetHeight

      // 获取盒子的尺寸
      const markerCon = this.$refs.markerCon
      const boxWidth = markerCon.offsetWidth
      const boxHeight = markerCon.offsetHeight

      // 获取点击位置的像素坐标
      const pixel = this.map.lngLatToContainer(e.lnglat)

      // 计算盒子的显示位置
      let left = pixel.x - boxWidth / 2
      let top = pixel.y - boxHeight / 2

      // 防止盒子超出地图边界
      if (left < 0)
        left = 0
      if (left + boxWidth > mapWidth)
        left = mapWidth - boxWidth
      if (top < 0)
        top = 0
      if (top + boxHeight > mapHeight)
        top = mapHeight - boxHeight

      // 更新盒子的样式
      this.markerConStyle = {
        left: `${left}px`,
        top: `${top}px`,
      }
    },
    updateMarkerData(data) {
      console.log(data, 'shuju')
      const currentData = data.find(item => item.name === '输出电流')
      this.clickMarkerData.electricCurrent = currentData ? currentData.unit : '--'

      const voltageData = data.find(item => item.name === '输出电压')
      this.clickMarkerData.voltage = voltageData ? voltageData.unit : '--'

      const amplitudeData = data.find(item => item.name === '震动')
      this.clickMarkerData.amplitude = amplitudeData ? amplitudeData.unit : '--'

      const motorTempData = data.find(item => item.name === '电机温度')
      this.clickMarkerData.motorTemp = motorTempData ? motorTempData.unit : '--'

      const driveTempData = data.find(item => item.name === 'IGBT温度')
      this.clickMarkerData.driveTemp = driveTempData ? driveTempData.unit : '--'

      const moduleTempData = data.find(item => item.name === '电路温度')
      this.clickMarkerData.moduleTemp = moduleTempData ? moduleTempData.unit : '--'

      const speedData = data.find(item => item.name === '运行转速')
      this.clickMarkerData.speed = speedData ? speedData.value : '--'
    },
    // 增加速度
    increaseSpeed() {
      if (this.clickMarkerData.speed !== '--') {
        this.clickMarkerData.speed = String(Number.parseInt(this.clickMarkerData.speed) + 10)
      }
    },
    // 减少速度
    decreaseSpeed() {
      if (this.clickMarkerData.speed !== '--') {
        this.clickMarkerData.speed = String(Number.parseInt(this.clickMarkerData.speed) - 10)
      }
    },
    // 切换开关
    toggleOnOff() {
      // 切换逻辑可以根据实际需求进行调整
      console.log('Toggle On/Off')
    },
    // 电机参数
    motorParams() {
      // 电机参数设置逻辑可以根据实际需求进行调整
      console.log('Motor Parameters')
    },
  },
}
</script>

<template>
  <div class="map-dev">
    <div id="map" v-loading="loading" />

    <!-- 左上角 按钮 -->
    <el-button
      type="danger"
      icon="el-icon-search"
      size="mini"
      class="search-btn"
      @click="searchFn"
    />
    <transition name="fc">
      <el-card
        v-show="searchFlag"
        class="search-card"
        shadow="always"
      >
        <el-form
          size="mini"
          :model="sForm"
          label-width="40px"
        >
          <el-form-item label="维度">
            <el-select
              v-model="sForm.type"
              style="width: 100%"
              @change="typeFn"
            >
              <el-option label="产品" :value="0" />
              <el-option label="分组" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item v-show="sForm.type === 0" label="产品">
            <el-select
              v-model="sForm.productId"
              placeholder="请选择"
              style="width: 100%"
              @change="productFn"
            >
              <el-option
                v-for="item in productList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <span>{{ item.name }}</span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-show="sForm.type === 1" label="分组">
            <el-select
              v-model="sForm.groupId"
              placeholder="请选择"
              style="width: 100%"
              @change="groupFn"
            >
              <el-option
                v-for="item in groupList"
                :key="item.id"
                :label="item.groupName"
                :value="item.id"
              >
                <span>{{ item.groupName }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item style="margin: 0">
            <el-button type="warning" @click="resetFn">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </transition>

    <!-- 内容展示盒子 -->
    <div
      v-if="isLanyingAdmin"
      v-show="markerConFlag"
      ref="markerCon"
      class="marker-con"
      :style="markerConStyle"
    >
      <div class="marker-con-title">
        搅拌操作
      </div>
      <div class="marker-con-content">
        <!-- 左侧两份 -->
        <div class="left-section">
          <div class="data-item">
            <div class="data-label">
              <img :src="dianliuImage" alt="">电流
            </div>
            <div class="data-value">
              {{ clickMarkerData.electricCurrent || '--' }}
            </div>
          </div>
          <div class="data-item">
            <div class="data-label">
              <img :src="dianyaImage" alt="">电压
            </div>
            <div class="data-value">
              {{ clickMarkerData.voltage || '--' }}
            </div>
          </div>
          <div class="data-item">
            <div class="data-label">
              <img :src="zhenfuImage" alt="">振幅
            </div>
            <div class="data-value">
              {{ clickMarkerData.amplitude || '--' }}
            </div>
          </div>
        </div>

        <!-- 中间三份 -->
        <div class="middle-section">
          <img
            class="mixer-image"
            :src="mixerImage"
            alt="搅拌机"
          >
        </div>

        <!-- 右侧两份 -->
        <div class="right-section">
          <div class="data-item">
            <div class="data-value">
              {{ clickMarkerData.motorTemp || '--' }}
            </div>
            <div class="data-label">
              <img :src="dianjiImage" alt="">电机温度
            </div>
          </div>
          <div class="data-item">
            <div class="data-value">
              {{ clickMarkerData.driveTemp || '--' }}
            </div>
            <div class="data-label">
              <img :src="qudongImage" alt="">驱动温度
            </div>
          </div>
          <div class="data-item">
            <div class="data-value">
              {{ clickMarkerData.moduleTemp || '--' }}
            </div>
            <div class="data-label">
              <img :src="mokuaifuImage" alt="">模块温度
            </div>
          </div>
        </div>
      </div>
      <div class="bottom_box">
        <div class="marker-con-bottom">
          <!-- 速度控制部分 -->
          <div class="speed-control">
            <!-- 左侧部分：速度控制 -->
            <div class="speed-section" style="width: 40%;">
              <div class="speed-display">
                <span>{{ clickMarkerData.speed || '--' }} rpm </span>
              </div>
              <div class="speed-buttons">
                <button @click="decreaseSpeed">
                  -
                </button>
                <button @click="increaseSpeed">
                  +
                </button>
              </div>
            </div>
            <!-- 右侧部分：速度设定 -->
            <div class="speed-settings" style="width: 60%;">
              <div class="speed-setting-title">
                <img :src="suduImage" alt="">速度设定
              </div>
              <div class="speed-setting-buttons">
                <button @click="toggleOnOff">
                  ON
                </button>
                <button @click="toggleOnOff">
                  OFF
                </button>
                <button @click="motorParams">
                  电机参数
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 非蓝莹管理员时的内容展示盒子 -->
    <div
      v-else
      v-show="markerConFlag"
      ref="markerCon"
      class="marker-con marker-con-default"
      :style="markerConStyle"
    >
      <div>
        <span>设备信息:</span>
        <span>{{ clickMarkerData.name }}</span>
      </div>
      <div>
        <span>设备状态:</span>
        <span>{{
          clickMarkerData.state == 3
            ? '报警'
            : clickMarkerData.state == 2
              ? '在线'
              : clickMarkerData.state == 1
                ? '离线'
                : clickMarkerData.state == 0
                  ? '未激活'
                  : '未发布'
        }}</span>
      </div>
      <div v-for="item in clickMarkerData.dt" :key="item.id">
        <span style="margin-right: 10px">{{ item.name }}: </span>
        <span>{{ item.value }} </span>
        <span>{{ item.unit }}</span>
        <span>
          {{ formatDate(item.eventDate) }}
        </span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.map-dev {
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
		z-index: 1;
	}

	.search-btn {
		position: absolute;
		top: 10px;
		left: 10px;
		z-index: 100;
	}

	.search-card {
		width: 300px;
		position: absolute;
		top: 50px;
		left: 10px;
		transform-origin: center top;
		z-index: 100;
	}

	.fc-enter-active,
	.fc-leave-active {
		transition: all 0.5s ease;
	}

	.fc-enter,
	.fc-leave-to {
		opacity: 0;
		transform: scaleY(0);
	}

	.marker-con {
		position: absolute;
		padding: 10px;
		box-shadow: 0 1px 6px rgb(0, 0, 0);
		background: url('../../assets/lanying/bg.png') no-repeat center;
		border-radius: 4px;
		color: #333;
		max-width: calc(100% - 40px);
		max-height: calc(100% - 40px);
		overflow: auto;
		z-index: 200;

		&.marker-con-default {
			background: none;
			background-color: white;
			color: #333;
		}

		.marker-con-title {
			text-align: center;
			font-size: 18px;
			font-weight: bold;
			color: white;
			background: url('../../assets/lanying/title.png') no-repeat center;
			background-size: 80% 100%;
			padding: 20px 0px;
			padding-top: 0px;
		}

		.marker-con-content {
			display: grid;
			grid-template-columns: 2fr 2fr 2fr;
			height: calc(100% - 174px);
			gap: 10px;
			padding: 26px 41px 0px;
		}

		.left-section,
		.right-section {
			display: flex;
			flex-direction: column;
			justify-content: space-evenly;
		}

		.left-section {
			.data-item {
				background: url('../../assets/lanying/left.png') no-repeat center;
				background-size: 100% 100%;
			}
		}

		.left-section {
			.data-item {
				.data-value {
					background: url('../../assets/lanying/left_value.png') no-repeat center;
					background-size: 100% 100%;
				}
			}
		}

		.right-section {
			.data-item {
				.data-value {
					background: url('../../assets/lanying/right_value.png') no-repeat center;
					background-size: 100% 100%;
				}
			}
		}

		.right-section {
			.data-item {
				background: url('../../assets/lanying/right.png') no-repeat center;
				background-size: 100% 100%;
			}
		}

		.middle-section {
			display: flex;
			justify-content: center;
			align-items: center;
		}

		.data-item {
			display: flex;
			flex-direction: row;
			align-items: center;
			padding: 8px;
			border-radius: 4px;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
			justify-content: space-around;
			background: transparent;
			color: white !important;
		}

		.data-label {
			font-size: 11px;
			display: flex;
			align-items: center;

			img {
				width: 16px;
				height: 16px;
				margin-right: 5px;
			}
		}

		.data-value {
			font-size: 12px;
			padding: 9px 18px;
			display: flex;
			align-items: center;
			justify-content: center;
			min-width: 40%;

			.unit {
				font-size: 8px;
				display: block;
				margin-left: 5px;
				position: relative;
				top: -5px;
			}
		}

		.mixer-image {
			width: 100%;
			max-width: 200px;
			height: auto;
		}

		.bottom_box {
			width: 45%;
			margin: 10px auto;
		}

		.marker-con-bottom {
			width: 100%;
			background-color: transparent;
			margin-top: 6px;
			background: url('../../assets/lanying/bottom_bg.png') no-repeat center;
			background-size: 100% 100%;
		}

		.speed-control {
			display: flex;
			width: 100%;
			height: 80px;
		}

		.speed-section {
			display: flex;
			flex-direction: column;
			justify-content: space-around;
			align-items: center;
			padding: 10px 30px 10px 10px;
			border-radius: 4px;
			width: 40%;
			background: url('../../assets/lanying/bottom_left.png') no-repeat center;
			background-size: 100% 100%;
		}

		.speed-display {
			font-size: 18px;
			font-weight: bold;
			color: rgb(238, 223, 121);
			display: flex;

			.unit {
				font-size: 12px;
				display: block;
				margin-left: 5px;
				position: relative;
				top: -5px;
				font-weight: 400;
			}
		}

		.speed-buttons {
			display: flex;
			gap: 5px;
			margin-right: 21px;
		}

		.speed-buttons button {
			width: 19px;
			height: 15px;
			border: none;
			background-color: rgb(235, 225, 151);
			color: black;
			border-radius: 4px;
			cursor: pointer;
		}

		.speed-settings {
			display: flex;
			flex-direction: column;
			justify-content: space-around;
			align-items: center;
			padding: 10px;
			border-radius: 4px;
			width: 60%;
		}

		.speed-setting-title {
			font-size: 12px;
			color: rgb(238, 223, 121);
			display: flex;
			align-items: center;

			img {
				width: 16px;
				height: 16px;
				margin-right: 5px;
			}
		}

		.speed-setting-buttons {
			display: flex;
			gap: 10px;
			width: 100%;
			justify-content: flex-start;
		}

		.speed-setting-buttons button {
			width: 35px;
			height: 15px;
			border: none;
			background-color: rgb(235, 225, 151);
			color: black;
			border-radius: 4px;
			cursor: pointer;
			font-size: 7px;
			font-weight: bold;
		}
	}
}
</style>
