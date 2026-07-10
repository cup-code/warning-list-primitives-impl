/* global jsmap */
<script>
import { loadJsmap } from '@/utils/loadJsmap'
import config from './config'

export default {
  name: 'AddMarkerDialog',
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    isCheck: {
      type: Boolean,
      default: false,
    },
    isEditor: {
      type: Boolean,
      default: false,
    },
    initData: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      pointType: [
        {
          label: '信标',
          icon:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAglJREFUaEPtmGFuwjAMhZ17IQ3uws4xdg64y4rUe2VLoW0oSfzsOGyd2j8IkTb+/J4dF0crv9zK46cN4LcV3BT4Vwrszn5PRHty9HYHC9/D1U2gnj77dzd/r8yAiYV2Z38iRx+CWDoyAqkCGDLu6EsQ+HJpNYgaQJH1POdNjZMmESoA0+DHqJUQYgAD25SUOEgLXA5w8cHzY3cpqR78fU10pKJT+qMTxSRaDFmnYIXa+1PkMoCL98X0AT5GLChRAQZgN04EP2T8fojF3maVABIxJhIHKHu/64/uMD40GeAiqCLEywE8Td2jqFQUGKPCQ0JKtrVRIAYAleIsidaBBCBbwPFmO6bQ0bUvBfjp97OF/rAC+QMM9fbjutIg2KAGSiMz0mGWa0CluAEPrwFu5n+GGMeN8NkJzwF4JoIBQia4Ao1rIZc59hAjIrSAwx4yAE6F8MTaWSioFR2KZhYaFEAA5h1v773zRIpMsGE9bB+xApCNuJSVfxdlXwcgU0GGI8y+CkBhJRRCnH01QBMrKbJfB2BpJcH4vJRT1EaXNwu7Us5KKuuIX2iyBxP3mslUgOTQSj2qSoHqglb6PgapBlBDVPjeHEAMYRR8VRdK+REqasPgzQFYJYyDbwKQhWgQfDOAJ4hGwTcFmCDCC4ryv39kiDJpo8hGrdZsAK0yiz53UwDNVKt1q1fgG/qHRUDqOJooAAAAAElFTkSuQmCC',
        },
      ],
      drowTypeList: [
        {
          label: '点',
          code: 'POINT',
        },
        {
          label: '线',
          code: 'POLYLINE',
        },
        {
          label: '面',
          code: 'POLYGON',
        },
        {
          label: '文本+图标',
          code: 'ICONTEXT',
        },
      ],
      mapServerURL: window.g.MAP_URL,
      drawTool: null,
      form: {
        locationDesc: '',
        drawType: '',
        markType: '',
        markName: '',
        markValue: '',
        buildName: '',
        buildId: '',
        geoInfo: {},
        floorId: 1,
        remarks: '',
      },
      layer: null,
      map: null,
      rules: {
        markName: [{ required: true, message: '请输入标注名称', trigger: 'blur' }],
        markType: [{ required: true, message: '请选择标注种类', trigger: 'change' }],
        locationDesc: [{ required: true, message: '请输入所在位置', trigger: 'blur' }],
        drawType: [{ required: true, message: '请选择绘制种类', trigger: 'change' }],
        buildName: [{ required: true, message: '请输入建筑名称', trigger: 'blur' }],
        floorId: [{ required: true, message: '请输入楼层', trigger: 'blur' }],
      },
      labelType: [],
      marker: null,
    }
  },
  computed: {
    getDrawText() {
      return this.marker === null ? '开始绘制' : '重新绘制'
    },
  },
  watch: {
    visible: {
      async handler(newVal) {
        // console.log('newVal:', this.map, this.marker, newVal && this.isCheck, newVal && this.isEditor)
        if ((newVal && this.isCheck) || (newVal && this.isEditor)) {
          this.form = this.initData
          //   console.log('this.initData:', this.initData, JSON.parse(this.initData.geoInfo))
          this.$nextTick(async () => {
            await this.initMap(this.initData.buildId)
            this.marker = this.onDraw('echo', JSON.parse(this.initData.geoInfo))
            this.map.addMarker(this.marker)
          })

          return
        }
        if (newVal) {
          this.$nextTick(() => {
            this.getBuildingId(this.$dictUtils.getDictList('3DModel')[0])
          })
        }
      },
      immediate: true,
    },
  },
  async created() {
    // 确保 jsmap 加载完成
    await loadJsmap()
  },

  methods: {
    // 初始化地图
    initMap(buildId) {
      this.map = new jsmap.JSMap({
        mapType: jsmap.JSMapType.MAP_3D,
        container: 'map_marker',
        mapServerURL: this.mapServerURL,
        openingAnimation: false, // 是否开启开场动画，默认true
        showLoading: true, // 是否显示地图加载动画，默认true
        buildingSelected: true, // 是否启用建筑选中，默认true
        selectedEffect: false, // 是否启用选中效果，默认true
        showGlobe: true,
        showNavigationDisplay: true,
        defaultTiltAngle: 30,
        defaultRotationAngle: 30,
        showBuildingMarker: {
          show: true,
          statistics: {
            markerType: [
              jsmap.JSMarkerType.POINT_MARKER,
              jsmap.JSMarkerType.LINE_MARKER,
              jsmap.JSMarkerType.POLYGON_MARKER,
              jsmap.JSMarkerType.ICON_TEXT_MARKER,
            ],
          },
        },
      })
      this.map.openMapById(buildId)
      this.map.on('loadComplete', (_e) => {
        // 使用 _e 代替 e
        // console.log(_e, 222)
        this.drawTool = new jsmap.JSDrawTool(this.map, {
          clameToGround: true,
          callback: async (geo) => {
            // console.log('geo:', geo)
            const { x, y } = geo
            if (this.form.drawType === 'POINT' || this.form.drawType === 'ICONTEXT') {
              this.form.latitude = y
              this.form.longitude = x
            }
            this.marker = await this.onDraw('', geo)
            this.map.addMarker(this.marker)
            // console.log('this.marker:', this.marker)
          },
        })

        const compassControl = new jsmap.JSCompassControl({
          position: jsmap.JSControlPosition.LEFT_TOP,
          offset: {
            x: 10,
            y: 20,
          },
        })
        this.map.addControl(compassControl)

        const zoomControl = new jsmap.JSZoomControl({
          position: jsmap.JSControlPosition.LEFT_TOP,
          offset: {
            x: 40,
            y: 10,
          },
        })
        this.map.addControl(zoomControl)
      })
      this.map.on('mapClickNode', (e) => {
        // console.log('mapClickNode', e, e.floorId)
        if (e.floorId) {
          this.form.floorId = e.floorId
        }
      })
    },

    onDraw(type = '', opt) {
      // 调用工厂函数创建配置对象
      const markerConfigs = {
        POINT: config.createJSPointMarker(),
        POLYLINE: config.createJSLineMarker(),
        POLYGON: config.createJSPolygonMarker(),
        ICONTEXT: config.createJSIconTextMarker(),
      }

      const markerConfig = markerConfigs[this.form.drawType]
      //   console.log('markerConfig:', markerConfig, this.form.drawType)
      if (this.form.drawType === 'POINT') {
        const {
          x,
          y,
          z,
        } = opt
        const info
          = type === 'echo'
            ? opt
            : Object.assign({}, markerConfig, {
                position: { x, y, z },
                floorId: this.form.floorId,
              })
        return this.drawArea(this.form.drawType, info)
      }
      else if (this.form.drawType === 'ICONTEXT') {
        const {
          x,
          y,
          z,
        } = opt
        const info
          = type === 'echo'
            ? opt
            : Object.assign({}, markerConfig, {
                position: { x, y, z },
                floorId: this.form.floorId,
                text: this.form.markName || '所在位置',
                image: this.pointType[0].icon,
              })
        return this.drawArea(this.form.drawType, info)
      }
      else if (this.form.drawType === 'POLYLINE' || this.form.drawType === 'POLYGON') {
        const info
          = type === 'echo'
            ? opt
            : Object.assign({}, markerConfig, {
                floorId: this.form.floorId,
                position: opt.points.map((item) => {
                  return { x: item.x, y: item.y, z: 8 }
                }),
              })
        return this.drawArea(this.form.drawType, info)
      }
      else {
        console.warn(`Unsupported draw type: ${this.form.drawType}`)
      }
    },

    startDraw() {
      if (this.marker) {
        this.map.removeMarker(this.marker)
      }
      const mode
        = this.form.drawType === 'ICONTEXT'
          ? jsmap.JSDrawMode.POINT
          : jsmap.JSDrawMode[this.form.drawType]
      this.drawTool.activate(mode)
    },

    // 绘制风险区域
    drawArea(type, option) {
      this.form.geoInfo = JSON.stringify(option)
      if (type === 'POINT') {
        return new jsmap.JSPointMarker(option)
      }
      else if (type === 'POLYLINE') {
        return new jsmap.JSLineMarker(option)
      }
      else if (type === 'POLYGON') {
        return new jsmap.JSPolygonMarker(option)
      }
      else if (type === 'ICONTEXT') {
        const marker = new jsmap.JSIconTextMarker(option)
        marker.setProperties({
          image: this.pointType[0].icon,
        })
        return marker
      }
    },
    // 绘制种类
    getDrawType(e) {
      if (e.code !== this.form.drawType) {
        this.map.removeMarker(this.marker)
      }

      console.log('this.marker:', this.marker)

      this.form.drawType = e
    },
    // 标注种类
    getMarkType(e) {
      this.form.markType = e.label
    },

    onblur(key, e) {
      //   console.log('e:', e)
      this.form[key] = e
    },

    async getBuildingId(e) {
      if (this.map !== null) {
        this.map.destroy()
      }
      //   console.log('e:', e)
      this.form.buildId = e.dictCode
      this.form.buildName = e.dictName
      await this.initMap(e.dictCode)
    },

    closeMap() {
      if (this.map && Object.keys(this.map).length > 0) {
        this.map?.destroy()
        this.map = null
        this.marker = null
      }
    },
    onClose() {
      this.form = {
        locationDesc: '',
        drawType: '',
        markType: '',
        markName: '',
        markValue: '',
        buildName: '',
        buildId: '',
        geoInfo: {},
        floorId: 1,
        remarks: '',
      } // 清空表单
      this.$emit('close', false)
      this.$emit('update:visible', false)
      this.$emit('update:isEditor', false)
      this.$emit('update:isCheck', false)
    },
    submitForm() {
      this.$refs.markerForm.validate((valid) => {
        if (valid) {
          // 在这里处理表单提交逻辑
          console.log('表单数据:', !this.marker.id)
          if (!this.marker.id) {
            this.$message.warning('请先绘制标注')
            return
          }
          this.$emit('submit', this.form)
        }
        else {
          console.log('表单验证失败')
          return false
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog
    v-max-dialog
    title="新增标注"
    :close-on-click-modal="false"
    destroy-on-close
    append-to-body
    class="normal-dialog"
    :visible="visible"
    width="80%"
    @close="onClose"
  >
    <div class="flex">
      <div
        id="map_marker"
        class="flex flex-1 justify-center items-center border border-slate-100"
      >
        <div v-if="map === null">
          请选择建筑ID
        </div>
      </div>
      <el-form
        ref="markerForm"
        :model="form"
        label-width="100px"
        :rules="rules"
      >
        <el-form-item label="建筑名称" prop="buildName">
          <el-select
            v-model="form.buildName"
            :disabled="isCheck"
            placeholder="请选择建筑名称"
            @change="getBuildingId"
          >
            <el-option
              v-for="(item, index) in $dictUtils.getDictList('3DModel')"
              :key="index"
              :label="item.dictName"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="标注名称" prop="markName">
          <el-input
            v-model="form.markName"
            :disabled="isCheck"
            @change="onblur('markName', $event)"
          />
        </el-form-item>
        <el-form-item label="标注种类" prop="markType">
          <el-select
            v-model="form.markType"
            clearable
            :disabled="isCheck"
            placeholder="请选择标注种类"
            @change="getMarkType"
          >
            <el-option
              v-for="(item, index) in pointType"
              :key="index"
              :label="item.label"
              :value="item"
            />
            <!-- 添加更多选项 -->
          </el-select>
        </el-form-item>
        <el-form-item label="标注值" prop="markType">
          <el-input
            v-model="form.markValue"
            :disabled="isCheck"
            placeholder="请输入标注值"
          />
        </el-form-item>
        <el-form-item label="所在位置" prop="locationDesc">
          <el-input
            v-model="form.locationDesc"
            :disabled="isCheck"
            @change="onblur('locationDesc', $event)"
          />
        </el-form-item>
        <el-form-item label="绘制种类" prop="drawType">
          <el-select
            v-model="form.drawType"
            :disabled="isCheck"
            placeholder="请选择绘制种类"
            @change="getDrawType"
          >
            <el-option
              v-for="(item, index) in drowTypeList"
              :key="index"
              :label="item.label"
              :value="item.code"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="楼层" prop="floorId">
          {{ form.floorId || "楼层" }}
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="form.remarks"
            type="textarea"
            :disabled="isCheck"
            @change="onblur('remarks', $event)"
          />
        </el-form-item>
        <el-form-item>
          <EButton
            :disabled="!form.drawType || isCheck"
            type="success"
            plain
            @click="startDraw"
          >
            {{ getDrawText }}
          </EButton>
        </el-form-item>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <EButton @click="onClose">取 消</EButton>
      <EButton
        style="margin-left: 10px"
        type="primary"
        :disabled="isCheck"
        @click="submitForm"
      >确 定</EButton>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
::v-deep.el-form-item {
  margin-bottom: 16px !important;
}
.el-select {
  width: 100%;
}
</style>
