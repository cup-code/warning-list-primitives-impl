/* * @Author: xiaorui 地图上选点单独弹框 * @Date: 2023-04-12 09:41:40 * @Last Modified by:
xiaorui * @Last Modified time: 2023-04-14 16:54:10 */
<script>
import { loadJsmap } from '@/utils/loadJsmap'

export default {
  data() {
    return {
      visible: false,
      mapServerURL: window.g.MAP_URL, // 地图引用的地址
      zq_map: null, // 真趣地图
      drawTool: null, // 地图画图工具
      pointMarker: null,
      isEnableFloor: false, // 是否允许打开楼层 true 允许
      buttonType: 'info',
      distance: 150,
    }
  },
  async mounted() {
    await loadJsmap()
  },
  methods: {
    // 初始化地图
    initMap(mapPoint) {
      // console.log(mapPoint)
      this.visible = true
      this.pointOnMap = mapPoint
      const buildId = this.$store.state.user.user.buildId
      this.$nextTick(() => {
        // 初始化真趣的地图
        this.zq_map = new jsmap.JSMap({
          mapType: jsmap.JSMapType.MAP_3D,
          container: 'mapContainer',
          mapServerURL: this.mapServerURL,
          openingAnimation: false,
          showLoading: false,
          buildingSelected: false,
        })
        this.zq_map.openMapById(buildId)
        this.zq_map.on('loadComplete', (e) => {
          if (Object.keys(mapPoint).length) {
            let judgeInOrOutDoor = false
            let position = {}
            let floorId = 0

            // 新点标记数据保护 是否室内 judgeInOrOutDoor ，position
            // hasOwnProperty
            if (
              mapPoint.hasOwnProperty('judgeInOrOutDoor')
              && mapPoint.hasOwnProperty('position')
            ) {
              judgeInOrOutDoor = mapPoint.judgeInOrOutDoor
              position = mapPoint.position
              floorId = mapPoint.floorId
            }
            else {
              // 旧点标记数据
              position = mapPoint
            }
            this.pointMarker = new jsmap.JSPointMarker({
              color: '#00FF00',
              size: 14,
              position,
              floorId,
              outlineColor: '#CD5C5C',
              outlineWidth: 1,
              judgeInOrOutDoor, // 是否判断室内 false 否 ，true 是
              depthTest: false,
            })
            this.zq_map.addMarker(this.pointMarker)
            setTimeout(() => {
              this.zq_map.flyToMarker(this.pointMarker, {
                offset: { rotate: 360, tilt: 45, range: this.distance },
              })
            }, 200)
          }
          // 地图点击事件，如果有标注点，则点击的时候更新；如果没有，则点击的时候增加标注点
          this.zq_map.on('mapClickNode', (event) => {
            if (this.buttonType === 'primary') {
              this.drawingPoint(event)
            }
          })
        })
      })
    },

    // 绘制点
    drawingPoint(event) {
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
        this.pointMarker = new jsmap.JSPointMarker({
          color: '#00FF00',
          size: 14,
          position: {
            x: event.x,
            y: event.y,
            z: position_z,
          },
          floorId: event.floorId,
          outlineColor: '#CD5C5C',
          outlineWidth: 1,
          judgeInOrOutDoor: this.isEnableFloor,
          depthTest: false,
        })
        this.zq_map.addMarker(this.pointMarker)
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
        if (this.zq_map.buildingSelected) {
          this.buttonType = 'info'
        }
      }
    },

    // 开始绘制
    startDrawFn() {
      if (this.buttonType === 'primary') {
        this.buttonType = 'info'
      }
      else {
        this.buttonType = 'primary'
      }

      // this.drawTool.activate(jsmap.JSDrawMode.POLYGON);
    },
    // 清除绘制区域
    clearMarkFn() {
      if (this.pointMarker) {
        this.zq_map.removeAllMarker()
        this.pointMarker = null
      }
    },
    submitClick() {
      if (this.pointMarker) {
        this.pointOnMap = {
          position: {
            x: this.pointMarker.position._x,
            y: this.pointMarker.position._y,
            z: this.pointMarker.position._z,
          },
          judgeInOrOutDoor: this.isEnableFloor,
          floorId: this.pointMarker.floorId,
        }
      }
      this.$emit('changePoint', this.pointOnMap)
      this.visible = false
      console.log('save point:', this.pointOnMap)
    },
    closeDialog() {
      if (this.zq_map) {
        this.zq_map.destroy()
        this.zq_map = null
      }
      this.pointMarker = null
    },
  },
}
</script>

<template>
  <el-dialog
    v-max-dialog
    class="normal-dialog"
    title="选择点位"
    :visible.sync="visible"
    append-to-body
    :close-on-click-modal="false"
    width="850px"
    @close="closeDialog"
  >
    <el-row class="heightBox">
      <el-button
        key="drawing01"
        :type="buttonType"
        style="margin: 0 10px 0 0"
        @click="startDrawFn"
      >
        开始绘制
      </el-button>
      <el-button key="drawing02" @click="clearMarkFn">
        重置
      </el-button>
      <div>
        <el-checkbox
          v-model="isEnableFloor"
          @change="checkboxFloor"
        >
          允许打开楼层
        </el-checkbox>
      </div>
    </el-row>
    <el-row>
      <el-col :span="24">
        <div id="mapContainer" />
      </el-col>
    </el-row>
    <span slot="footer" class="dialog-footer">
      <el-button
        size="small"
        style="margin: 0 10px 0 0"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-noMoreClick
        size="small"
        type="primary"
        @click="submitClick"
      >确定</el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
//强制覆盖公共css属性
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

.heightBox {
  display: flex;
  // justify-content:center;
  height: 28px;
  margin-bottom: 6px;

  div {
    display: flex;
    align-items: center;
    margin-left: 15px;
    span {
      margin-right: 10px;
    }
    .el-slider {
      width: 200px;
    }
  }
}
</style>
