<script>
import imageMaker from '@/assets/site1.png'
import ImageSelect from '@/components/ImageSelect'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import { getDeviceGroup } from '@/http/dev/group-api'
import { editDevice, upLoadDeviceImg } from '@/http/dev/manage-api'
import { getAllProduct } from '@/http/dev/product-api'

export default {
  components: {
    ImageSelect,
    SelectTree,
  },
  props: ['dt'],
  data: () => ({
    loading: false,
    form: {},
    rules: {},
    submitLoading: false,
    productList: [],
    groupList: [],
    map: null,
    marker: null,
  }),
  watch: {
    dt(v) {
      this.genFn(v)
    },
  },
  created() {
    this.getProList()
    this.getGroupList()
    this.getPrefix()
  },
  mounted() {
    this.initMap()

    // 刷新时因为dt为空，所以不走这里（走watch中的dt）; 切换标签时会走这里（不走watch中的dt）
    const v = this.dt
    if (JSON.stringify(v) !== '{}') {
      this.genFn(v)
    }
  },
  beforeDestroy() {
    this.destroyMap()
  },
  methods: {
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
    // 初始化地图
    initMap() {
      this.map = new window.AMap.Map('map', {
        viewMode: '2D',
        center: [116.397026, 39.918058],
        zoom: 13,
      })
      // 放大缩小工具条插件
      window.AMap.plugin(['AMap.ToolBar'], () => {
        const toolbar = new window.AMap.ToolBar({
          position: 'RB',
          liteStyle: true,
        })
        this.map.addControl(toolbar)
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
    // 地图的点击事件
    mapClickFn(e) {
      const ll = e.lnglat

      // 如果存在标记， 先删除
      if (this.marker) {
        this.marker.setMap(null)
        this.marker = null
      }

      // 新建marker
      this.marker = new window.AMap.Marker({
        map: this.map,
        position: [ll.lng, ll.lat],
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

      // 在表单中 显示 经纬度位置
      const location = `${ll.lng},${ll.lat}`
      this.$set(this.form, 'location', location)
    },
    // marker的 拖动结束 事件
    markerDragendFn(e) {
      // 在表单中 显示 经纬度位置
      const ll = e.lnglat
      const location = `${ll.lng},${ll.lat}`
      this.$set(this.form, 'location', location)
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

      const location = `${lg},${la}`
      this.$set(this.form, 'location', location)
    },
    editFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true
        const {
          code,
          name,
          productId,
          groupId,
          remarks,
          location,
          longitude,
          latitude,
          imageUrl,
          companyId,
          sortOrder,
        } = this.form
        const params = {
          id: this.$route.params.did,
          code,
          name,
          productId,
          groupId,
          remarks,
          imageUrl,
          companyId,
          sortOrder,
        }

        if (location) {
          const ll = location.split(',')
          params.longitude = ll[0]
          params.latitude = ll[1]
        }
        else {
          params.longitude = longitude
          params.latitude = latitude
        }
        editDevice(params)
          .then((res) => {
            this.submitLoading = false

            const resD = res.data
            const msg = resD.message
            if (resD.success) {
              this.$message.success('修改成功')
              this.$emit('change')
            }
            else {
              this.$message.error(msg || '修改失败')
            }
          })
          .catch((err) => {
            this.submitLoading = false
            this.$message.error('修改失败')
          })
      })
    },
    // 生成表单数据
    genFn(v) {
      this.form = JSON.parse(JSON.stringify(v))
      // 生成地图里的marker
      if (v.longitude) {
        this.genMarker(v.longitude, v.latitude)
      }
    },
    /* 图片选择回调 */
    fileChangeEvt(file) {
      if (file) {
        upLoadDeviceImg(file).then(({ data }) => {
          this.form.imageUrl = data.result
        })
      }
      else {
        this.form.imageUrl = ''
      }
    },
  },
}
</script>

<template>
  <div class="baseInfo-template">
    <el-form
      ref="form"
      v-loading="loading"
      class="base-form"
      :model="form"
      :rules="rules"
      size="mini"
      label-width="80px"
    >
      <el-form-item
        label="终端编码"
        prop="code"
      >
        <el-input
          v-model="form.code"
          disabled
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item
        label="终端名称"
        prop="name"
      >
        <el-input
          v-model="form.name"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item
        label="所属公司"
        prop="companyId"
      >
        <SelectTree
          ref="officeTree"
          :props="{
            value: 'id', // ID字段名
            label: 'companyName', // 显示名称
            children: 'children', // 子级字段名
          }"
          url="sysCompany/getSubordinateCompany"
          :value="form.companyId"
          :clearable="true"
          :accordion="true"
          @getValue="
            value => {
              form.companyId = value
            }
          "
        />
      </el-form-item>
      <el-form-item
        label="所属产品"
        prop="productId"
      >
        <el-select
          v-model="form.productId"
          disabled
          placeholder="不可以修改产品"
          style="width: 100%"
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
      <el-form-item
        label="终端分组"
        prop="groupId"
      >
        <el-select
          v-model="form.groupId"
          placeholder="请选择"
          style="width: 100%"
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
      <el-form-item
        label="终端描述"
        prop="remarks"
      >
        <el-input
          v-model="form.remarks"
          placeholder="请输入"
        />
      </el-form-item>
      <el-form-item label="终端图标">
        <ImageSelect
          :signUrl="filePrefix + form.imageUrl"
          width="100px"
          height="100px"
          @fileChange="fileChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="排序号"
        prop="sortOrder"
      >
        <el-input-number
          v-model="form.sortOrder"
          :step="1"
          controls-position="right"
          :min="0"
          label="排序号"
        />
      </el-form-item>
      <el-form-item label="地理位置">
        <el-input
          v-model="form.location"
          disabled
        />
      </el-form-item>
      <el-form-item>
        <div
          id="map"
          class="map-con"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="editFn"
        >
          修改
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.baseInfo-template {
  .base-form {
    margin: 0 auto;
    width: 50%;
    .ex-item {
      .ex-info {
        position: absolute;
        top: 0;
        left: 100%;
        width: 100px;
        margin-left: 10px;
      }
    }
    .map-con {
      height: 250px;
    }
  }
}
</style>
