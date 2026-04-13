<script>
import imageMaker from '@/assets/site1.png'

export default {
  props: {
    dialogFormVisible: {
      type: Boolean,
      default: false,
    },
    mapSelectionIndex: {
      type: Number,
      default: 0,
    },
    mapSelectionData: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      form: {
        cityName: '',
        longitude: '',
        latitude: '',
      },
      autoOptions: {
        input: 'tishikuang',
      },
      map: null,
      marker: null,
      auto: null,
      placeSearch: null,
    }
  },

  watch: {
    dialogFormVisible(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.initMap()
        })
      }
    },
  },
  mounted() {
    this.$nextTick(() => {
      // this.initMap();
      this.mapClickFn(this.mapSelectionData)
    })
  },
  methods: {
    // 初始化地图
    initMap() {
      this.map = new window.AMap.Map('map', {
        resizeEnable: true,
        // center: [116.397026, 39.918058],
        zoom: 11, // 地图显示的缩放级别
        pitch: 45,
        viewMode: '2D',
      })
      // 放大缩小工具条插件
      AMap.service(['AMap.ToolBar', 'AMap.PlaceSearch'], () => {
        const toolbar = new window.AMap.ToolBar({
          position: 'RB',
          liteStyle: true,
        })
        this.map.addControl(toolbar)

        // 根据城市搜索
        this.placeSearch = new AMap.PlaceSearch({
          map: this.map,
          pageSize: 1,
        })
      })
      // 监听map的点击事件
      this.map.on('click', this.mapClickFn)
    },

    // 销毁地图
    destroyMap() {
      this.map.off('click', this.mapClickFn)
      this.map.destroy()
      this.map = null
      this.marker = null
    },
    queryCity() {
      this.placeSearch.search(this.form.cityName, (status, result) => {
        console.log('status=====', status)
        console.log('result=====', result)
      })
    },
    // 地图的点击事件
    mapClickFn(e) {
      const ll = e?.lnglat ? e.lnglat : e

      // 如果存在标记， 先删除
      if (this.marker) {
        this.marker.setMap(null)
        this.marker = null
      }

      // 新建marker
      this.marker = new window.AMap.Marker({
        map: this.map,
        position: [ll.lng ? ll.lng : ll.longitude, ll.lat ? ll.lat : ll.latitude],
        draggable: true,
        offset: new window.AMap.Pixel(-12.5, -28),
        icon: new window.AMap.Icon({
          image: imageMaker,
          size: new window.AMap.Size(25, 33),
          imageSize: new window.AMap.Size(25, 33),
        }),
      })
      this.marker.on('dragend', this.markerDragendFn) // 监听marker的 dragend 事件
      this.marker.setMap(this.map)

      // 在表单中 显示 经纬度位置
      this.$set(this.form, 'longitude', ll.lng ? ll.lng : ll.longitude)
      this.$set(this.form, 'latitude', ll.lat ? ll.lat : ll.latitude)

      // 获取定位的详细中文地址名称
      if (ll) {
        this.getAddress(ll)
      }
    },

    getAddress(ll) {
      AMap.service('AMap.Geocoder', () => {
        const geocoder = new AMap.Geocoder()
        geocoder.getAddress(
          [ll.lng ? ll.lng : ll.longitude, ll.lat ? ll.lat : ll.latitude],
          (status, result) => {
            if (status === 'complete' && result.regeocode) {
              console.log(result, 'result')
              const address = result.regeocode.formattedAddress
              this.$set(this.form, 'cityName', address)
            }
            else {
              console.error('Failed to get address')
            }
          },
        )
      })
    },
    // marker的 拖动结束 事件
    markerDragendFn(e) {
      // 在表单中 显示 经纬度位置
      const ll = e.lnglat
      // let location = ll.lng + ',' + ll.lat
      this.$set(this.form, 'longitude', ll.lng)
      this.$set(this.form, 'latitude', ll.lat)
    },

    genMarker(lg, la) {
      // 新建marker
      this.marker = new window.AMap.Marker({
        map: this.map,
        position: [lg, la],
        draggable: true,
        offset: new window.AMap.Pixel(-12.5, -28),
        icon: new window.AMap.Icon({
          // image: require('@/assets/site1.png'),
          image: imageMaker,
          size: new window.AMap.Size(25, 33),
          imageSize: new window.AMap.Size(25, 33),
        }),
      })
      this.marker.on('dragend', this.markerDragendFn) // 监听marker的 dragend 事件
      this.marker.setMap(this.map)
      this.map.setCenter([lg, la]) // 设置地图中心点

      // let location = lg + ',' + la
      this.$set(this.form, 'longitude', lg)
      this.$set(this.form, 'latitude', la)
    },
    close() {
      this.$emit('close', false)
      this.$emit('update:dialogFormVisible', false)
    },
    sumbit() {
      this.$emit('saveArea', {
        form: this.form,
        isShow: false,
        mapSelectionIndex: this.mapSelectionIndex,
      })
    },
  },
}
</script>

<template>
  <el-dialog
    title="区域划分地图标注"
    :visible.sync="dialogFormVisible"
    class="normal-dialog"
    @close="close"
  >
    <el-form
      :model="form"
      label-width="60px"
      inline
    >
      <el-form-item label="位置">
        <div class="flex items-center">
          <el-input
            id="tishikuang"
            v-model="form.cityName"
            placeholder="请输入位置"
          />
          <el-button
            type="primary"
            size="mini"
            style="margin-left: 20px"
            @click="queryCity"
          >
            查 询
          </el-button>
        </div>
      </el-form-item>
      <el-form-item label="经度">
        <el-input
          v-model="form.longitude"
          style="width: 180px"
          disabled
        />
      </el-form-item>
      <el-form-item label="纬度">
        <el-input
          v-model="form.latitude"
          style="width: 180px"
          disabled
        />
      </el-form-item>
    </el-form>

    <div class="mt-6 flex justify-center">
      <div
        id="map"
        class="map-con"
      />
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        @click="sumbit"
      >
        保 存
      </el-button>
      <el-button @click="close">
        取 消
      </el-button>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
::v-deep {
  .el-form-item__content {
    display: flex;
    align-items: center;
  }
}
.map-con {
  width: 550px;
  height: 290px;
}
</style>
