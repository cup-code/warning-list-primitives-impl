<script>
import imageMaker from "@/assets/site1.png";

export default {
  name: "InlineMapSelection",
  props: {
    geoInfo: {
      type: [String, Object],
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      form: {
        cityName: "",
        longitude: "",
        latitude: "",
      },
      map: null,
      marker: null,
      placeSearch: null,
      mapId: "inlineMapContainer-" + Date.now(),
      searchKeyword: "",
      searchResults: [],
    };
  },
  watch: {
    disabled(newVal) {
      if (this.map) {
        if (newVal) {
          this.map.off("click", this.mapClickFn);
          if (this.marker) {
            this.marker.setDraggable(false);
          }
        } else {
          this.map.on("click", this.mapClickFn);
          if (this.marker) {
            this.marker.setDraggable(true);
          }
        }
        this.syncMapBrowseInteraction();
      }
    },
    geoInfo: {
      handler(newVal) {
        if (this.map) {
          this.initFromGeoInfo();
        }
      },
      immediate: false,
    },
  },
  mounted() {
    // 弹窗打开后组件挂载，直接初始化地图
    this.$nextTick(() => {
      this.initMap();
    });
  },
  beforeDestroy() {
    this.destroyMap();
  },
  methods: {
    // 统一解析 geoInfo（字符串 / 对象 / 数组第一项 / 嵌套 info）
    // 查看模式下仍允许滚轮缩放、拖拽平移、双击缩放（仅通过 disabled 关闭选点与拖拽标记）
    syncMapBrowseInteraction() {
      if (!this.map || typeof this.map.setStatus !== "function") return;
      this.map.setStatus({
        scrollWheel: true,
        dragEnable: true,
        zoomEnable: true,
        doubleClickZoom: true,
        keyboardEnable: true,
      });
    },

    parseGeoPayload(raw) {
      if (raw == null || raw === "") return null;
      let data = raw;
      try {
        if (typeof raw === "string" && raw.trim()) {
          data = JSON.parse(raw);
        }
      } catch (e) {
        console.error("[InlineMapSelection] geoInfo JSON 解析失败:", e);
        return null;
      }
      if (Array.isArray(data) && data.length) {
        data = data[0];
      }
      if (!data || typeof data !== "object") return null;
      const inner = data.info && typeof data.info === "object" ? data.info : data;
      const lngRaw = inner.longitude ?? inner.lng ?? inner.x;
      const latRaw = inner.latitude ?? inner.lat ?? inner.y;
      if (lngRaw == null || latRaw == null || lngRaw === "" || latRaw === "") return null;
      const lng = Number(lngRaw);
      const lat = Number(latRaw);
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
      return {
        lng,
        lat,
        cityName: inner.cityName || inner.address || data.cityName || data.address || "",
      };
    },

    // 初始化地图
    initMap() {
      // 如果地图已存在，不重复初始化
      if (this.map) {
        return;
      }

      // 检查 AMap 是否已加载
      if (!window.AMap) {
        console.error("[InlineMapSelection] AMap not loaded");
        return;
      }

      // 检查容器是否存在且尺寸有效
      const container = document.getElementById(this.mapId);
      if (!container) {
        console.error("[InlineMapSelection] container not found");
        return;
      }

      console.log("[InlineMapSelection] creating map...");
      try {
        // 解析 geoInfo 获取初始坐标
        let initialCenter = [116.397026, 39.918058]; // 默认北京坐标
        let initialZoom = 11;

        const parsedCenter = this.parseGeoPayload(this.geoInfo);
        if (parsedCenter) {
          initialCenter = [parsedCenter.lng, parsedCenter.lat];
          initialZoom = 15;
        }

        this.map = new window.AMap.Map(this.mapId, {
          zoom: initialZoom,
          center: initialCenter,
          viewMode: "2D",
          scrollWheel: true,
          dragEnable: true,
          zoomEnable: true,
          doubleClickZoom: true,
        });
        this.syncMapBrowseInteraction();

        // 放大缩小工具条插件
        window.AMap.plugin(["AMap.ToolBar", "AMap.PlaceSearch"], () => {
          const toolbar = new window.AMap.ToolBar({
            position: "RB",
            liteStyle: true,
          });
          this.map.addControl(toolbar);

          // 根据城市搜索
          this.placeSearch = new window.AMap.PlaceSearch({
            map: this.map,
            pageSize: 5,
          });
        });

        // 监听map的点击事件
        if (!this.disabled) {
          this.map.on("click", this.mapClickFn);
        }

        // 初始化后强制 resize
        setTimeout(() => {
          if (this.map) {
            this.map.resize();
            this.syncMapBrowseInteraction();
            this.initFromGeoInfo();
          }
        }, 100);

        // 如果有传入的geoInfo，则显示标记
        this.initFromGeoInfo();
        console.log("[InlineMapSelection] map initialized successfully");
      } catch (e) {
        console.error("[InlineMapSelection] map creation failed:", e);
      }
    },

    // 从 geoInfo 初始化标记与信息栏
    initFromGeoInfo() {
      if (!this.map) return;
      if (this.marker) {
        this.marker.setMap(null);
        this.marker = null;
      }

      const parsed = this.parseGeoPayload(this.geoInfo);
      if (parsed) {
        this.$set(this.form, "longitude", parsed.lng);
        this.$set(this.form, "latitude", parsed.lat);
        this.$set(this.form, "cityName", parsed.cityName || "");
        this.genMarker(parsed.lng, parsed.lat);
      } else {
        this.$set(this.form, "longitude", "");
        this.$set(this.form, "latitude", "");
        this.$set(this.form, "cityName", "");
      }
    },

    // 销毁地图
    destroyMap() {
      if (this.marker) {
        this.marker.setMap(null);
        this.marker = null;
      }
      if (this.map) {
        this.map.off("click", this.mapClickFn);
        this.map.destroy();
        this.map = null;
      }
    },

    // 地图的点击事件
    mapClickFn(e) {
      if (this.disabled) return;

      const ll = e?.lnglat ? e.lnglat : e;

      // 如果存在标记，先删除
      if (this.marker) {
        this.marker.setMap(null);
        this.marker = null;
      }

      // 新建marker
      this.createMarker(ll.lng, ll.lat);

      // 在表单中显示经纬度位置
      this.$set(this.form, "geoInfo", {
        longitude: ll.lng,
        latitude: ll.lat,
        address: "",
      });

      // 获取定位的详细中文地址名称
      this.getAddress(ll);

      // 触发事件
      this.emitGeoInfo();
    },

    // 创建标记
    createMarker(lng, lat) {
      this.marker = new window.AMap.Marker({
        map: this.map,
        position: [lng, lat],
        draggable: !this.disabled,
        offset: new window.AMap.Pixel(-12.5, -28),
        icon: new window.AMap.Icon({
          image: imageMaker,
          size: new window.AMap.Size(25, 33),
          imageSize: new window.AMap.Size(25, 33),
        }),
      });
      this.marker.on("dragend", this.markerDragendFn);
      this.map.setCenter([lng, lat]);
    },

    // 根据经纬度生成标记
    genMarker(lg, la) {
      this.createMarker(lg, la);
    },

    // 获取地址
    getAddress(ll) {
      window.AMap.plugin("AMap.Geocoder", () => {
        const geocoder = new window.AMap.Geocoder();
        geocoder.getAddress([ll.lng, ll.lat], (status, result) => {
          if (status === "complete" && result.regeocode) {
            const address = result.regeocode.formattedAddress;
            this.$set(this.form, "geoInfo", {
              longitude: ll.lng,
              latitude: ll.lat,
              cityName: address,
            });
            this.emitGeoInfo();
          } else {
            console.error("Failed to get address");
          }
        });
      });
    },

    // marker的拖动结束事件
    markerDragendFn(e) {
      const ll = e.lnglat;
      this.$set(this.form, "geoInfo", {
        longitude: ll.lng,
        latitude: ll.lat,
        cityName: "",
      });
      this.getAddress(ll);
    },

    // 触发setPointInfo事件
    emitGeoInfo() {
      const geoInfo = this.form.geoInfo || {};
      const data = {
        longitude: geoInfo?.longitude || 0,
        latitude: geoInfo?.latitude || 0,
        cityName: geoInfo?.cityName || "",
        address: geoInfo?.address || 0,
      };
      this.$emit("setPointInfo", JSON.stringify(data));
    },

    // 搜索地址
    handleSearch() {
      if (!this.searchKeyword.trim()) {
        this.$message.warning("请输入搜索关键词");
        return;
      }
      if (!this.placeSearch) {
        this.$message.warning("地图服务未初始化，请稍后重试");
        return;
      }

      this.placeSearch.search(this.searchKeyword, (status, result) => {
        if (status === "complete" && result.poiList && result.poiList.pois) {
          this.searchResults = result.poiList.pois.slice(0, 5);
          if (this.searchResults.length === 0) {
            this.$message.warning("未找到相关地址");
          }
        } else {
          this.searchResults = [];
          this.$message.warning("未找到相关地址");
        }
      });
    },

    // 选择搜索结果
    selectSearchResult(item) {
      const location = item.location;
      if (location) {
        // 清空搜索结果
        this.searchResults = [];
        this.searchKeyword = item.name;

        // 在地图上标注
        const lng = location.lng;
        const lat = location.lat;

        // 更新表单
        this.$set(this.form, "geoInfo", {
          longitude: lng,
          latitude: lat,
          address: item.name + (item.address ? " " + item.address : ""),
        });

        // 创建标记
        if (this.marker) {
          this.marker.setMap(null);
          this.marker = null;
        }
        this.createMarker(lng, lat);

        // 地图居中并放大
        this.map.setCenter([lng, lat]);
        this.map.setZoom(15);

        // 触发事件
        this.emitGeoInfo();
      }
    },

    // 清空搜索结果
    clearSearchResults() {
      this.searchResults = [];
    },
  },
};
</script>

<template>
  <!-- @wheel.stop：避免弹窗内滚轮冒泡到 el-dialog__body 导致只滚动对话框、地图不缩放 -->
  <div class="inline-map-wrapper" @wheel.stop>
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入地址搜索"
        clearable
        :disabled="disabled"
        @keyup.enter.native="handleSearch"
        @focus="searchResults = []"
      >
        <el-button
          slot="append"
          icon="el-icon-search"
          :disabled="disabled"
          @click="handleSearch"
        >
          搜索
        </el-button>
      </el-input>
      <!-- 搜索结果下拉 -->
      <div v-if="searchResults.length > 0" class="search-results">
        <div
          v-for="(item, index) in searchResults"
          :key="index"
          class="search-result-item"
          @click="selectSearchResult(item)"
        >
          <span class="name">{{ item.name }}</span>
          <span class="address">{{ item.address || item.cityname || "" }}</span>
        </div>
      </div>

      <!-- 信息栏 -->
      <div class="map-info-bar">
        <div class="info-item">
          <span class="label">经度:</span>
          <span class="value">{{ form.longitude || "-" }}</span>
        </div>
        <div class="info-item">
          <span class="label">纬度:</span>
          <span class="value">{{ form.latitude || "-" }}</span>
        </div>
        <div class="info-item address">
          <span class="label">地址:</span>
          <span class="value">{{ form.cityName || "-" }}</span>
        </div>
      </div>
    </div>

    <!-- 地图容器 -->
    <div :id="mapId" class="map-container" />
  </div>
</template>

<style scoped lang="scss">
.inline-map-wrapper {
  position: relative;
  width: 100%;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: flex-start;
  gap: 12px;
  margin-bottom: 8px;

  ::v-deep .el-input {
    width: 320px;
    flex: 0 0 auto;
  }

  ::v-deep .el-input-group__append {
    padding: 0 12px;
  }
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  margin-top: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.search-result-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;

  &:hover {
    background: #f5f7fa;
  }

  &:last-child {
    border-bottom: none;
  }

  .name {
    display: block;
    color: #303133;
    font-size: 14px;
  }

  .address {
    display: block;
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }
}

.map-info-bar {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-wrap: nowrap;
  align-items: center;
  gap: 16px;
  padding: 0 12px;
  // background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  overflow-x: auto;
  overflow-y: hidden;

  .info-item {
    display: flex;
    align-items: center;
    flex: 0 0 auto;
    white-space: nowrap;

    .label {
      color: #909399;
      margin-right: 4px;
    }

    .value {
      color: #606266;
    }

    &.address {
      flex: 1;
      min-width: 0;

      .value {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

.map-container {
  width: 100%;
  height: 300px;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  overflow: hidden;
}
</style>
