/* * @Author: xiaorui 绘制区域单独弹框 * @Date: 2023-04-03 10:27:43 * @Last Modified by:
wangyang * @Last Modified time: 2023-11-14 10:04:59 */

<script>
import { loadJsmap } from "@/utils/loadJsmap"; // 动态加载 jsmap

export default {
  data() {
    return {
      visible: false,
      mapServerURL: window.g.MAP_URL, // 地图引用的地址
      zq_map: null, // 真趣地图
      drawTool: null, // 地图画图工具
      marker: null, // 画的marker
      ht: 0,
      ht_s: 9, // 默认高度 5米
      distance: 60, // 默认距离
      drawData: [
        { label: "染色", value: "risk-dyeing" },
        { label: "盒子", value: "risk-box" },
      ],
      drawType: "risk-dyeing", // 绘制类型 risk-dyeing :染色 , 合作: risk-box
      areaOnMap: {}, // 区域数据
      isEnableFloor: false, // 是否允许打开楼层 true 允许
      buildId: "",
    };
  },
  watch: {
    // 基础高度
    ht(value) {
      if (!this.marker) return;
      this.marker.height = value;
      this.areaOnMap.height = value;
    },
    // 拉伸高度
    ht_s(value) {
      if (!this.marker) return;
      this.marker.stretchHeight = value;
      this.areaOnMap.stretchHeight = value;
    },
  },
  async mounted() {
    this.buildId = this.$store.state.user.user.buildId;
    console.log(this.buildId, "this.buildId");
    await loadJsmap();
  },
  methods: {
    initialDrawType(type) {
      this.drawType = type;
    },
    // 初始化地图
    initMap(mapArea, cor) {
      this.visible = true;
      const color = mapArea.color ? mapArea.color : cor;
      this.areaOnMap = mapArea;
      this.$nextTick(() => {
        this.zq_map = new jsmap.JSMap({
          mapType: jsmap.JSMapType.MAP_3D,
          container: "zq_map",
          mapServerURL: this.mapServerURL,
          openingAnimation: false, // 是否开启开场动画，默认true
          showLoading: false, // 是否显示地图加载动画，默认true
          buildingSelected: true, // 是否启用建筑选中，默认true
          selectedEffect: false, // 是否启用选中效果，默认true
          showGlobe: true,
        });
        this.zq_map.openMapById(this.buildId);
        this.zq_map.on("loadComplete", (e) => {
          this.drawTool = new jsmap.JSDrawTool(this.zq_map, {
            clameToGround: true,
            callback: (geo) => {
              const opt = {
                id: Math.random(),
                position: geo._points,
                floorId: this.zq_map._map.focusFloorId,
                color,
                strokeColor: "#000",
                height: this.ht,
                stretchHeight: this.ht_s,
                drawType: this.drawType,
              };

              // 增加属性 当前选择的建筑id
              const currBuildId = this.zq_map._map._currentBuildingId || undefined;
              if (currBuildId) {
                // currBuildId = undefined 模型在室外
                opt.currBuildId = currBuildId;
              }

              // this.marker = new jsmap.JSBoxMarker(opt);
              this.marker = this.drawArea(this.drawType, opt);
              this.zq_map.addMarker(this.marker);
              this.drawTool.clear();
              this.areaOnMap = opt;
            },
          });

          if (Object.keys(mapArea).length) {
            this.showRisk(mapArea);
            if (this.marker) {
              this.marker.color = color;
              setTimeout(() => {
                this.zq_map.flyToMarker(this.marker, {
                  offset: { rotate: 360, tilt: 45, range: this.distance },
                });
              }, 200);
            }
          }
        });
      });
    },
    // 回显区域的
    showRisk(option) {
      if (option.hasOwnProperty("drawType")) {
        this.drawType = option.drawType;
      }
      this.marker = this.drawArea(this.drawType, option);
      this.zq_map.addMarker(this.marker);
      if (this.drawType === "risk-dyeing") {
        // 染色
        this.isEnableFloor = false;
      } else {
        // 合子
        this.isEnableFloor = true;
      }
      this.isOpenFloor();
    },

    // 是否允许
    checkboxFloor(value) {
      this.isOpenFloor();
    },
    // 是否允许打开楼层
    isOpenFloor() {
      if (this.isEnableFloor != this.zq_map.buildingSelected) {
        this.zq_map.buildingSelected = this.isEnableFloor;
      }
    },

    // 设置绘制类型
    setDrawType(value) {
      if (Object.keys(this.areaOnMap).length) {
        if (this.marker) {
          this.zq_map.removeAllMarker();
        }
        this.areaOnMap.drawType = value;
        this.marker = this.drawArea(value, this.areaOnMap);
        this.zq_map.addMarker(this.marker);
      } else {
        if (value === "risk-dyeing") {
          // 染色
          this.isEnableFloor = false;
        } else {
          // 盒子
          this.isEnableFloor = true;
        }
      }
      this.isOpenFloor();
    },

    // 绘制风险区域
    drawArea(type, option) {
      // console.log(' option:',option);
      if (type === "risk-dyeing") {
        // 染色
        return new jsmap.JSGroundBoxMarker(option);
      } else {
        // 合子
        return new jsmap.JSBoxMarker(option);
      }
    },
    // 开始绘制
    startDrawFn() {
      this.drawTool.activate(jsmap.JSDrawMode.POLYGON);
    },
    // 清除绘制区域
    clearMarkFn() {
      this.zq_map.removeAllMarker();
      this.areaOnMap = {};
    },
    submitClick() {
      this.$emit("changeArea", this.areaOnMap);
      this.visible = false;
    },
    closeDialog() {
      if (this.zq_map) {
        this.zq_map.destroy();
        this.zq_map = null;
      }
    },
  },
};
</script>

<template>
  <el-dialog
    v-max-dialog
    class="normal-dialog"
    title="绘制区域"
    :visible.sync="visible"
    append-to-body
    :close-on-click-modal="false"
    width="850px"
    @close="closeDialog"
  >
    <el-row>
      <el-button type="primary" style="margin: 0 10px 0 0" @click="startDrawFn">
        开始绘制
      </el-button>
      <el-button @click="clearMarkFn"> 重置 </el-button>
      <span class="tips-box">注：绘制完成后,点击鼠标右键保存</span>
    </el-row>
    <el-row class="heightBox">
      <div>
        <span>绘制类型</span>
        <el-select
          v-model="drawType"
          style="width: 200px"
          filterable
          @change="setDrawType"
        >
          <el-option
            v-for="item in drawData"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div>
        <!-- v-model="isEnableFloor"  -->
        <el-checkbox v-model="isEnableFloor" @change="checkboxFloor">
          允许打开楼层
        </el-checkbox>
      </div>
    </el-row>
    <!-- 基础高度、拉伸高度 -->
    <el-row class="heightBox">
      <div>
        <span>基础高度</span>
        <el-slider v-model="ht" :max="50" :disabled="drawType === 'risk-dyeing'" />
      </div>
      <div>
        <span>拉伸高度</span>
        <el-slider v-model="ht_s" :disabled="drawType === 'risk-dyeing'" />
      </div>
    </el-row>
    <el-row>
      <el-col :span="24">
        <div id="zq_map" />
      </el-col>
    </el-row>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" style="margin: 0 10px 0 0" @click="visible = false"
        >关闭</el-button
      >
      <el-button v-noMoreClick size="small" type="primary" @click="submitClick"
        >确定</el-button
      >
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
  margin-top: 6px;

  div {
    display: flex;
    align-items: center;
    margin-right: 10px;
    span {
      margin-right: 10px;
    }
    .el-slider {
      width: 200px;
    }
  }
}
.tips-box {
  display: inline-block;
  font-size: 12px;
  color: red;
  margin-left: 10px;
}
</style>
