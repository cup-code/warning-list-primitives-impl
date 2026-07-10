<script>
import { loadJsmap, unloadJsmap } from "@/utils/loadJsmap";

export default {
  name: "setPoint",
  props: {
    geoInfo: {
      type: String,
      default: "",
    },
    dialogType: {
      type: String,
      default: "add",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      mapServerURL: window.g.MAP_URL,
      zqMap: null,
      loading: true,
      viewInfo: {},
      pointInfo: {},
      objInfo: {},
      buildId: "",
    };
  },

  created() {
    this.buildId = this.$store.state.user.user.buildId;
  },
  mounted() {
    setTimeout(() => {
      let geoInfo;
      try {
        geoInfo =
          typeof this.geoInfo === "string" && this.geoInfo
            ? JSON.parse(this.geoInfo)
            : this.geoInfo || {};
      } catch (e) {
        console.error("Error parsing geoInfo:", e);
        geoInfo = {};
      }
      console.log(geoInfo, "geoInfo");
      this.viewInfo = geoInfo.info || {};
      this.objInfo = geoInfo;
      this.init(this.buildId, geoInfo);
    }, 1000);
  },
  beforeDestroy() {
    // 销毁地图实例并卸载 jsmap 资源
    if (this.zqMap) {
      this.zqMap.destroy();
      this.zqMap = null;
      this.viewInfo = [];
      this.objInfo = {};
      this.pointInfo = {};
    }
    unloadJsmap();
  },
  methods: {
    // 设置form里的标注面信息
    setAreaOnMap(type, info) {
      this.pointInfo = info;
      let positions = {};
      if (type === "add") {
        this.viewInfo =
          Object.keys(this.viewInfo).length > 0 ? this.viewInfo : this.zqMap.currentView;
        console.log(this.viewInfo, type, "add");
      }

      if (type === "locate") {
        // const oldPosition = this.viewInfo.find(
        //   (item) => item.id === position.properties.id
        // );
        console.log(this.viewInfo, type, "viewInfo");

        this.zqMap.setView({
          center: this.viewInfo.center,
          distance: this.viewInfo.distance,
          rotate: this.viewInfo.rotate,
          tilt: this.viewInfo.tilt,
        });
      }
      if (type === "edit") {
        positions = {
          center: this.zqMap.currentView.center,
          distance: this.zqMap.currentView.distance,
          rotate: this.zqMap.currentView.rotate,
          tilt: this.zqMap.currentView.tilt,
        };

        this.viewInfo = positions;
      }

      console.log(this.viewInfo, this.pointInfo, "setArea");
      this.$emit("setPointInfo", {
        ...this.objInfo,
        info: this.viewInfo,
        areaOnMapInfo: this.pointInfo,
      });
    },
    // 移除form里的标注面信息
    removeAreaOnMap() {
      this.viewInfo = {};
      this.pointInfo = {};
      this.$emit("setPointInfo", {});
    },
    // 加载地图,编辑或者查看的时候init为true
    async init(buildId, obj) {
      await loadJsmap();
      this.zqMap = new jsmap.JSMap({
        mapType: jsmap.JSMapType.MAP_3D,
        container: "inspectionMapContainer",
        mapServerURL: this.mapServerURL,
        openingAnimation: false, // 是否开启开场动画，默认true
        showLoading: false, // 是否显示地图加载动画，默认true
        buildingSelected: false, // 是否启用建筑选中，默认true
        selectedEffect: false, // 是否启用选中效果，默认true
        showGlobe: true,
      });
      this.zqMap.openMapById(buildId);
      this.zqMap.on("loadComplete", (e) => {
        this.zqMap.addControl(
          new jsmap.JSCompassControl({
            position: jsmap.JSControlPosition.LEFT_TOP,
            offset: {
              x: 10,
              y: 20,
            },
          })
        );
        this.zqMap.on("mapClickNode", this.mapRightClickNode);

        const drawTool = new jsmap.JSDrawToolControl({
          position: jsmap.JSControlPosition.RIGHT_TOP, // 画图工具在容器中的相对位置，当前为右上
          offset: {
            x: 5,
            y: 5,
          }, // 偏移量
          drawMode: jsmap.JSDrawMode.POINT, // 画图类型POINT:画点  POLYLINE:画线  POLYGON:画面
          // 画图结束的回调，返回所画的面信息
          callback: (feature) => {
            this.setAreaOnMap("add", feature);
          },

          // 移除相应面的回调，返回相应面信息
          removeCallback: (feature) => {
            this.removeAreaOnMap(feature);
          },
          // 编辑相应面的回调，返回相应面信息
          editCallback: (feature) => {
            this.setAreaOnMap("edit", feature);
          },
          // 定位到相应面的回调，返回相应面信息
          locateCallback: (feature) => {
            this.setAreaOnMap("locate", feature);
          },
        });
        this.zqMap.addControl(drawTool);

        // 如果有标注巡检点，则在地图上显示
        if (obj?.areaOnMapInfo) {
          drawTool.addGraphic(obj.areaOnMapInfo);
        }

        const viewInfo = Object.keys(this.viewInfo).length > 0 ? this.viewInfo : null;

        console.log(viewInfo, "viewInfoee");
        if (viewInfo) {
          this.zqMap.setView({
            center: viewInfo.center,
            distance: viewInfo.distance,
            rotate: viewInfo.rotate,
            tilt: viewInfo.tilt,
          });
        }
        this.loading = false;
      });
    },

    mapRightClickNode(event) {
      console.log("event:", event);
    },
  },
};
</script>

<template>
  <div v-loading="loading">
    <div id="inspectionMapContainer" />
  </div>
</template>

<style scoped>
#inspectionMapContainer {
  width: 100%;
  height: 100%;
}
</style>
