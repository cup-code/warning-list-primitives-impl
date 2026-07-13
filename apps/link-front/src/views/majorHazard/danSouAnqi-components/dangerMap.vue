<script>
import { loadJsmap } from '@/utils/loadJsmap'

export default {
  name: 'dangerMap',
  components: {},
  props: {
    inputForm: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      pointMarker: null, // 地图上的标注点
      mapServerURL: window.g.MAP_URL, // 地图引用的地址
      zq_map: null,
      buildId: '', // 地图建筑id 206092
      showMap: false,
      drawTool: null,
      isEnableFloor: false, // 是否允许打开楼层 true 允许
      buttonType: 'info',
    }
  },
  async mounted() {
    await loadJsmap()
  },
  created() {
    this.buildId = this.$store.state.user.user.buildId
  },
  destroyed() {
    // 销毁地图实例
    if (this.zq_map) {
      this.zq_map.destroy()
      this.zq_map = null
    }
  },
  methods: {
    // 加载地图,编辑或者查看的时候init为true
    loadMap() {
      // 初始化真趣的地图
      this.zq_map = new jsmap.JSMap({
        mapType: jsmap.JSMapType.MAP_3D,
        container: 'mapContainer',
        mapServerURL: this.mapServerURL,
        openingAnimation: false,
        showLoading: false,
        buildingSelected: false, // 是否启用建筑选中，默认true
      })
      this.zq_map.openMapById(this.buildId)
      this.zq_map.on('loadComplete', (e) => {
        // 楼层内绘制
        this.indoorDrawPoint()

        // 室外楼层绘制
        this.zq_map.on('mapClickNode', (event) => {
          if (this.buttonType === 'primary' && !this.isEnableFloor) {
            this.outdoorDrawPoint(event)
          }
        })
        this.initPosition()
      })
    },
    // 室外绘制  floor
    outdoorDrawPoint(event) {
      console.log('event ponit:', event)
      let position_z = event.z
      if (event.floorId > 1) {
        position_z = event.centroid.z - event.z
      }

      if (this.pointMarker && this.pointMarker.floorId === event.floorId) {
        this.pointMarker.setPosition({ x: event.x, y: event.y, z: position_z })
      }
      else {
        this.clearMarkFn()
        const pos = {
          x: event.x,
          y: event.y,
          z: position_z + height,
        }

        let height = this.isEnableFloor ? 4 : 2.5
        this.pointMarker = new jsmap.JSPointMarker({
          color: '#00FF00',
          size: 14,
          position: pos,
          // floorId: event.floorId,
          // 室外默认 1
          floorId: 1,
          outlineColor: '#CD5C5C',
          outlineWidth: 1,
          // this.isEnableFloor
          judgeInOrOutDoor: false,
          depthTest: true,
        })
        this.zq_map.addMarker(this.pointMarker)

        // 保存数据
        this.inputForm.location = pos
        this.inputForm.location.floorId = 1
        this.inputForm.location.judgeInOrOutDoor = false
        console.log(' 室外：', height)
      }
    },
    // 在楼层内绘制
    indoorDrawPoint() {
      // 楼层内
      this.drawTool = new jsmap.JSDrawTool(this.zq_map, {
        // 是否贴地
        clameToGround: false,
        callback: (geo) => {
          console.log(' position:', geo)
          const position = {
            x: geo.x,
            y: geo.y,
            // 每个项目手动测试每个楼层
            z: 8.5,
          }
          // 地图点击事件，如果有标注点，则点击的时候更新；如果没有，则点击的时候增加标注点
          if (this.pointMarker) {
            this.zq_map.updateMarkerPosition(this.pointMarker, {
              position,
            })
          }
          else {
            console.log('buildId:', this.zq_map._map.focusFloorId)
            this.pointMarker = new jsmap.JSPointMarker({
              floorId: this.zq_map._map.focusFloorId,
              color: '#00FF00',
              size: 14,
              position,
              outlineColor: '#CD5C5C',
              outlineWidth: 1,
              //  true 进行室内外判断，false 以室外处理，
              judgeInOrOutDoor: this.isEnableFloor,
              // 是否开启深度检测 默认 false 贴到地图 不会被遮挡  true 按实际高度
              depthTest: true,
            })
            this.zq_map.addMarker(this.pointMarker)
          }
          // 保存数据
          this.inputForm.location = position
          this.inputForm.location.floorId = this.zq_map._map.focusFloorId
          this.inputForm.location.judgeInOrOutDoor = this.isEnableFloor
          console.log('室内 :', this.inputForm)
          this.drawTool.clear()
        },
      })
    },

    initPosition() {
      const location = this.inputForm.location
      if (location && JSON.stringify(location) !== '{}') {
        console.log('---开启室内 :', this.inputForm)
        // 是否自动开启室内
        if (this.inputForm.location.judgeInOrOutDoor) {
          this.isEnableFloor = this.inputForm.location.judgeInOrOutDoor
          this.isOpenFloor()
        }

        this.pointMarker = new jsmap.JSPointMarker({
          floorId: this.inputForm.location.floorId ? this.inputForm.location.floorId : 1,
          color: '#00FF00',
          size: 14,
          position: this.inputForm.location,
          outlineColor: '#CD5C5C',
          outlineWidth: 1,
          judgeInOrOutDoor: this.inputForm.location.judgeInOrOutDoor
            ? this.inputForm.location.judgeInOrOutDoor
            : false,
          depthTest: false,
        })
        this.zq_map.addMarker(this.pointMarker)

        setTimeout(() => {
          this.zq_map.flyToMarker(this.pointMarker, {
            offset: { rotate: 360, tilt: 45, range: 60 },
          })
        }, 200)
      }
    },
    clearMarkFn() {
      this.zq_map.removeAllMarker()
      this.pointMarker = null
      this.inputForm.location = ''
      this.zq_map.removeAllPointMarker()
    },

    // 开始绘制
    startDrawFn() {
      if (this.isEnableFloor) {
        if (this.drawTool) {
          this.drawTool.activate(jsmap.JSDrawMode.POINT)
        }
      }
      if (this.buttonType === 'primary') {
        this.buttonType = 'info'
      }
      else {
        this.buttonType = 'primary'
      }
    },
    // 是否允许
    checkboxFloor(value) {
      this.isOpenFloor()
    },
    // 是否允许打开楼层
    isOpenFloor() {
      if (this.isEnableFloor != this.zq_map.buildingSelected) {
        this.zq_map.buildingSelected = this.isEnableFloor
        this.buttonType = 'info'
      }
    },
    goDrawArea() {
      this.showMap = true
      this.$nextTick(() => {
        this.loadMap()
      })
    },
    closeDialog() {
      // 销毁地图实例
      if (this.zq_map) {
        if (this.drawTool) {
          this.drawTool.clear()
          this.drawTool = null
        }
        this.zq_map.destroy()
        this.zq_map = null
      }
    },
  },
}
</script>

<template>
  <div>
    <div class="top-btns">
      <el-button type="primary" @click="goDrawArea">
        前往绘制
      </el-button>
      <el-tag
        v-if="inputForm.location"
        :type="buttonType"
        style="margin-left: 10px; cursor: pointer"
      >
        已绘制
      </el-tag>
      <el-tag
        v-else
        type="info"
        style="margin-left: 10px"
      >
        未绘制
      </el-tag>
    </div>

    <el-dialog
      v-max-dialog
      class="normal-dialog"
      title="绘制危险源"
      :visible.sync="showMap"
      append-to-body
      :close-on-click-modal="false"
      width="80%"
      @close="closeDialog"
    >
      <el-row style="margin-bottom: 6px">
        <el-button
          :type="buttonType"
          style="margin: 0 10px 0 0"
          @click="startDrawFn"
        >
          开始绘制
        </el-button>
        <el-button type="warning" @click="clearMarkFn">
          重置
        </el-button>
        <el-checkbox
          v-model="isEnableFloor"
          style="margin-left: 15px"
          @change="checkboxFloor"
        >
          允许打开楼层
        </el-checkbox>
        <!-- <span class="tips-box">注: 关闭绘制窗口前，请点击保存</span> -->
      </el-row>

      <!-- <el-button @click="clearMarkFn" type="warning">重置</el-button> -->
      <div id="mapContainer" />
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="showMap = false">
          保存
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.top-btns {
  margin-bottom: 10px;
}
/* #mapContainer {
        margin-top: 10px;
        width: 100%;
        height: 650px;
    }
    ::v-deep .normal-dialog.edit-dialog {
        .el-dialog__header {
            min-height: 46px;
            .el-dialog__title {
                font-size: 16px;
                &::before {
                    height: 20px;
                }
            }
        }
        .el-dialog__body {
            padding: 24px;
            padding-top: 0px;
            overflow: auto;
        }
        .el-dialog__footer {
            padding: 8px 20px;
            border-top: 1px solid #e8e8e8;
            .dialog-footer {
                height: 30px;
            }
        }
	} */
.el-dialog {
  max-height: 80vh;
}
::v-deep .el-dialog {
  max-height: 100vh !important;
}
::v-deep .el-dialog__body {
  padding: 0px 24px 0 24px;
}
::v-deep .el-dialog__footer {
  padding: 10px 20px 10px 20px;
  .dialog-footer {
    height: 36px;
  }
}
</style>
