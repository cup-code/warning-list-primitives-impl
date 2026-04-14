<script>
import { getSpecifiedModule, setSpecifiedModule } from '@/http/companyConfig/companyConfig-api.js'
import InlineMapSelection from '@/views/yxInspection/components/InlineMapSelection.vue'

export default {
  name: 'YixunSetting',
  components: {
    InlineMapSelection,
  },
  props: {
    companyId: {
      type: String,
      default: '',
    },
    itemCode: {
      type: String,
      default: 'YixunSetting',
    },
  },
  data() {
    return {
      form: {
        longitude: '',
        latitude: '',
        cityName: '',
      },
      geoInfo: '',
      mapKey: 0,
      loading: false,
    }
  },
  mounted() {
    this.getConfig()
  },
  methods: {
    // 加载配置
    getConfig() {
      getSpecifiedModule(this.companyId, this.itemCode).then(({ data }) => {
        if (data.success && data.result) {
          data.result.forEach((res) => {
            if (this.form.hasOwnProperty(res.item)) {
              this.form[res.item] = res.value
            }
          })
          // 更新 geoInfo 供地图组件使用
          if (this.form.longitude && this.form.latitude) {
            this.geoInfo = JSON.stringify({
              longitude: this.form.longitude,
              latitude: this.form.latitude,
              cityName: this.form.cityName,
            })
          }
          // 强制刷新地图组件
          this.mapKey = Date.now()
        }
      })
    },

    // 保存配置
    saveConfig() {
      this.loading = true
      const dtoList = [
        { item: 'longitude', value: this.form.longitude || '' },
        { item: 'latitude', value: this.form.latitude || '' },
        { item: 'cityName', value: this.form.cityName || '' },
      ]

      setSpecifiedModule(this.companyId, this.itemCode, dtoList)
        .then(({ data }) => {
          if (data.success) {
            this.$message.success(data.message || '保存成功')
          } else {
            this.$message.error(data.message || '保存失败')
          }
        })
        .catch(() => {
          this.$message.error('保存失败')
        })
        .finally(() => {
          this.loading = false
        })
    },

    // 处理地图选点事件
    handleSetPointInfo(info) {
      try {
        const data = typeof info === 'string' ? JSON.parse(info) : info
        this.form.longitude = data.longitude || ''
        this.form.latitude = data.latitude || ''
        this.form.cityName = data.cityName || data.address || ''
      } catch (e) {
        console.error('解析 geoInfo 失败:', e)
      }
    },
  },
}
</script>

<template>
  <div class="yixun-setting">
    <div class="setting-tip">
      <i class="el-icon-location-outline" />
      <span>设置地图初始化定位坐标，用于易讯相关功能模块的地图默认显示位置</span>
    </div>

    <div class="map-section">
      <InlineMapSelection
        :key="mapKey"
        :geoInfo="geoInfo"
        @setPointInfo="handleSetPointInfo"
      />
    </div>

    <div class="button">
      <el-button type="primary" :loading="loading" @click="saveConfig">
        保存
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.yixun-setting {
  padding: 10px 0;
}

.setting-tip {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  color: #909399;
  font-size: 14px;

  i {
    margin-right: 8px;
    font-size: 18px;
    color: #409eff;
  }
}

.map-section {
  margin-bottom: 20px;
}

.button {
  margin-top: 20px;
}
</style>