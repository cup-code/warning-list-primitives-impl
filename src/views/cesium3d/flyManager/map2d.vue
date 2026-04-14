<script>
import { mapState } from "vuex";
import { loadJsmapLight, unloadJsmap } from "@/utils/loadJsmapLight";

export default {
  name: "Map2d",
  data() {
    return {
      map: null,
      mapServerURL: window.g.MAP_URL,
      buildId: "",
      positionMarker: null,
      isMapLoaded: false,
    };
  },
  computed: {
    ...mapState("cesium3dStore", ["pointInfo"]),
  },
  watch: {
    pointInfo: {
      handler(newVal) {
        if (!newVal || !Object.keys(newVal).length) return;

        this.$nextTick(() => {
          const info = this.parseGeoInfo(newVal);

          // 标记已存在则更新，否则尝试创建
          if (this.positionMarker) {
            this.updatePositionMarker(info);
          } else {
            this.tryCreateMarker();
          }
        });
      },
      immediate: true,
    },
  },
  async created() {
    this.buildId = this.$store.state.user.user.buildId + "-2d";
    loadJsmapLight();
  },
  async mounted() {
    setTimeout(() => {
      this.initMap();
    }, 1000);
  },
  destroyed() {
    // 清理标记
    if (this.positionMarker && this.map) {
      this.map.removeMarker(this.positionMarker);
      this.positionMarker = null;
    }

    // 销毁地图
    if (this.map) {
      this.map.destroy();
      this.map = null;
    }
    unloadJsmap();
  },
  methods: {
    initMap() {
      this.map = new jsmaplight.JSMap({
        container: "map2d",
        mapServerURL: this.mapServerURL,
        openingAnimation: false,
        showLoading: false,
        buildingSelected: false,
        selectedEffect: false,
        mapScaleLevelRange: [1, 24],
        defaultMapScaleLevel: 19,
        showGlobe: false,
        showNavigationDisplay: false,
        imageryProvider: jsmaplight.JSImageryProviderType.IMAGE_TDT,
      });
      console.log(this.buildId, 9999);
      this.map.openMapById(this.buildId);

      this.map.on("loadComplete", () => {
        setTimeout(() => {
          this.isMapLoaded = true;
          this.tryCreateMarker();
        }, 1000);
      });
    },

    // 解析 geoInfo 数据
    parseGeoInfo(pointInfo) {
      if (!pointInfo?.geoInfo || typeof pointInfo.geoInfo !== "string") {
        return {};
      }
      try {
        return JSON.parse(pointInfo.geoInfo)?.info || {};
      } catch (e) {
        console.error("[map2d] 解析 geoInfo 失败:", e);
        return {};
      }
    },

    // 尝试创建标记（需满足：地图已加载 + 数据就绪 + 标记未创建）
    async tryCreateMarker() {
      if (!this.isMapLoaded || !this.map || this.positionMarker) return;
      if (!this.pointInfo || !Object.keys(this.pointInfo).length) return;

      const info = this.parseGeoInfo(this.pointInfo);
      const { center } = info || {};

      if (!center?.x || !center?.y) return;

      try {
        this.positionMarker = await new jsmaplight.JSImageMarker({
          id: "position-indicator",
          color: "#00FFFF",
          position: new jsmaplight.JSPoint(center.x, center.y, center.z || 0),
          width: 12,
          height: 12,
          offset: jsmaplight.JSControlPosition.center,
          image: require("../css/icon.png"),
          show: true,
        });
        this.map.addMarker(this.positionMarker);
      } catch (error) {
        console.error("[map2d] 创建位置指示器失败:", error);
      }
    },

    // 更新位置指示器位置
    async updatePositionMarker(info) {
      if (!this.positionMarker || !info?.center) return;

      try {
        const { x, y, z } = info.center;
        await this.positionMarker.moveTo({ x, y, z }, 3000);
      } catch (error) {
        console.error("[map2d] 更新位置指示器失败:", error);
      }
    },
  },
};
</script>

<template>
  <div class="box-border">
    <div
      class="text-white mb-2 p-1 w-1/3 rounded-sm"
      style="background-image: linear-gradient(30deg, #0f445d 10%, transparent 80%)"
    >
      小地图
    </div>
    <div id="map2d" class="w-full h-[18vh] relative rounded-lg">
      <div
        class="absolute inset-0 z-50 bg-gray-400 opacity-10"
        style="cursor: not-allowed"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
