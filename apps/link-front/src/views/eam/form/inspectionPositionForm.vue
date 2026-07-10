/* * @Author: xiaorui 新增/修改巡检点的弹框 * @Date: 2022-04-21 11:35:28 * @Last Modified
by: xiaorui * @Last Modified time: 2022-09-01 11:56:11 */
<script>
import Sortable from 'sortablejs'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  addInspectionPositionFn,
  getDeviceListByPositionFn,
} from '@/http/dev_new/inspection-api'
import { getBuildIdFn, getDeviceListByDepartFn } from '@/http/dev_new/manage-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { loadJsmap } from '@/utils/loadJsmap'
import StandardTable from './standardTable'

export default {
  components: {
    SelectTree,
    StandardTable,
  },
  data() {
    return {
      title: '',
      visible: false,
      loading: false,
      method: '',
      inputForm: {
        id: '',
        placeName: '',
        placeCode: '',
        departmentId: '',
        placePosition: '',
        remarks: '',
        sortOrder: 0,
        deviceIdList: [],
        areaOnMapInfo: {}, // 巡检点在地图上的标注面信息
      },
      dataRule: {
        placeName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        placeCode: [{ required: true, message: '编码不能为空', trigger: 'blur' }],
        departmentId: [
          { required: true, message: '所属部门不能为空', trigger: 'change' },
        ],
      },
      departList: [], // 部门列表
      positionDeviceList: [], // 巡检点下面的设备列表
      mapServerURL: window.g.MAP_URL, // 地图引用的地址
      zqMap: null,
    }
  },
  created() {
    this.buildId = this.$store.state.user.user.buildId || '' // 获取当前用户所属公司的建筑id。用于地图初始化
    getDepartListSimple().then(({ data }) => {
      this.departList = data.result || []
    })
  },
  async mounted() {
    await loadJsmap()
  },
  methods: {
    init(method, obj) {
      this.method = method
      this.inputForm.id = obj.id // 新增时要置空
      this.visible = true
      if (method === 'add') {
        this.title = '新增巡检点'
        this.positionDeviceList = []
      }
      else if (method === 'edit') {
        this.title = '编辑巡检点'
      }
      else if (method === 'view') {
        this.title = '查看巡检点'
      }
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        this.inputForm.departmentId = obj.departmentId // 如果是新增，有部门id的话需要赋值
        // 有部门的话，则需要根据部门id获取对应的buildId加载地图
        if (this.inputForm.departmentId) {
          getBuildIdFn(this.inputForm.departmentId, 'DEPARTMENT_ID').then(({ data }) => {
            this.buildId = data.result || ''
            if (this.buildId) {
              this.loadMap(this.buildId, obj)
            }
          })
        }
        // 如果不是新增，需赋值form
        if (method !== 'add') {
          this.inputForm = this.recover(this.inputForm, obj)
          // 根据巡检点id获取巡检点的设备列表
          getDeviceListByPositionFn(obj.id).then(({ data }) => {
            if (data.success) {
              const arr = []
              data.result.forEach((item) => {
                arr.push(getDeviceListByDepartFn(item.departmentId))
              })
              // 给每个设备信息加上当前设备行可选的设备list
              Promise.all(arr).then((res) => {
                res.forEach((item, index) => {
                  data.result[index].deviceList = item.data.result
                })
                this.positionDeviceList = data.result || []
                setTimeout(() => {
                  this.rowDrop()
                }, 1000)
              })
            }
          })
        }
        else {
          setTimeout(() => {
            this.rowDrop()
          }, 1000)
        }
      })
    },
    // 添加设备按钮
    addDevice() {
      this.positionDeviceList.push({
        sortOrder: '',
        departmentId: '', // 部门id
        id: '', // 设备id
        deviceList: [], // 当前行的可选设备
      })
    },
    // 查看设备巡检标准
    viewStandard(id) {
      if (!id) {
        this.$message.warning('请先选择设备')
        return
      }
      this.$refs.standardTable.init(id)
    },
    // 删除设备按钮
    deleteDevice(index) {
      this.positionDeviceList.splice(index, 1)
    },
    async getRowDeviceList(row, value) {
      row.departmentId = value
      const res = await getDeviceListByDepartFn(value)
      row.deviceList = res.data.result || []
    },
    // 行拖拽
    rowDrop() {
      const tbody = document.querySelectorAll(
        '.el-table__body-wrapper > table > tbody',
      )[1]
      Sortable.create(tbody, {
        handle: '.handle',
        animation: 150,
        onEnd: (_ref) => {
          const newIndex = _ref.newIndex
          const oldIndex = _ref.oldIndex
          const currRow = this.positionDeviceList.splice(oldIndex, 1)[0]
          this.positionDeviceList.splice(newIndex, 0, currRow)
        },
      })
    },
    // 设置form里的标注面信息
    setAreaOnMap(info) {
      const position = JSON.parse(JSON.stringify(info))
      this.inputForm.areaOnMapInfo = position
    },
    removeAreaOnMap() {
      this.inputForm.areaOnMapInfo = {}
    },
    // 切换部门的时候重新加载地图
    getMapByDepartId(id) {
      this.inputForm.departmentId = id
      // 销毁地图实例
      if (this.zqMap) {
        this.zqMap.destroy()
        this.zqMap = null
      }
      this.inputForm.areaOnMapInfo = {}
      if (id) {
        getBuildIdFn(id, 'DEPARTMENT_ID').then(({ data }) => {
          this.buildId = data.result || ''
          if (this.buildId) {
            this.loadMap(this.buildId, {})
          }
        })
      }
    },
    // 加载地图,编辑或者查看的时候init为true
    loadMap(buildId, obj) {
      this.zqMap = new jsmap.JSMap({
        mapType: jsmap.JSMapType.MAP_3D,
        container: 'inspectionMapContainer',
        mapServerURL: this.mapServerURL,
        openingAnimation: false, // 是否开启开场动画，默认true
        showLoading: false, // 是否显示地图加载动画，默认true
        buildingSelected: false, // 是否启用建筑选中，默认true
        selectedEffect: false, // 是否启用选中效果，默认true
        showGlobe: true,
      })
      this.zqMap.openMapById(buildId)
      this.zqMap.on('loadComplete', (e) => {
        const drawTool = new jsmap.JSDrawToolControl({
          position: jsmap.JSControlPosition.RIGHT_TOP, // 画图工具在容器中的相对位置，当前为右上
          offset: {
            x: 5,
            y: 5,
          }, // 偏移量
          drawMode: jsmap.JSDrawMode.POLYGON, // 画图类型POINT:画点  POLYLINE:画线  POLYGON:画面
          // 画图结束的回调，返回所画的面信息
          callback: (feature) => {
            this.setAreaOnMap(feature)
          },
          // 移除相应面的回调，返回相应面信息
          removeCallback: (feature) => {
            this.removeAreaOnMap()
          },
          // 编辑相应面的回调，返回相应面信息
          editCallback: (feature) => {
            this.setAreaOnMap(feature)
          },
          // 定位到相应面的回调，返回相应面信息
          // locateCallback: (feature) => {
          //   console.log('locate..', feature);
          // }
        })
        this.zqMap.addControl(drawTool)
        // 如果有标注巡检点，则在地图上显示
        if (obj.areaOnMapInfo) {
          drawTool.addGraphic(obj.areaOnMapInfo)
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.inputForm.deviceIdList = this.positionDeviceList.map((item) => {
            return item.id
          })
          if (!this.inputForm.deviceIdList.length) {
            this.$message.error('请添加设备')
            return
          }
          this.loading = true
          addInspectionPositionFn(this.inputForm).then(({ data }) => {
            this.loading = false
            if (data && data.success) {
              this.$message.success(data.message)
              this.visible = false
              this.$emit('refreshDataList')
            }
            else {
              this.$message.error(data.message || '提交失败')
            }
          })
        }
      })
    },
    closeDialog() {
      if (this.zqMap) {
        this.zqMap.destroy()
        this.zqMap = null
      }
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      :title="title"
      :close-on-click-modal="false"
      width="700px"
      :visible.sync="visible"
      class="normal-dialog"
      @close="closeDialog"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        :model="inputForm"
        :rules="dataRule"
        label-width="80px"
        :disabled="method === 'view'"
        @submit.native.prevent
      >
        <el-row>
          <el-col :span="12">
            <el-form-item label="名称" prop="placeName">
              <el-input v-model="inputForm.placeName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="编号" prop="placeCode">
              <el-input v-model="inputForm.placeCode" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="所属部门" prop="departmentId">
          <SelectTree
            :props="{
              value: 'id', // ID字段名
              label: 'departmentName', // 显示名称
              children: 'children', // 子级字段名
            }"
            :list="departList"
            :value="inputForm.departmentId"
            :clearable="true"
            :accordion="true"
            @getValue="
              (value) => {
                getMapByDepartId(value);
              }
            "
          />
        </el-form-item>
        <el-form-item label="所在位置" prop="placePosition">
          <el-input v-model="inputForm.placePosition" />
        </el-form-item>
        <el-form-item label="位置标注">
          <el-tag v-show="!zqMap" type="warning">
            <i class="el-icon-warning" />
            提示：未选择部门或所属部门未绑定建模地图
          </el-tag>
          <div id="inspectionMapContainer" />
        </el-form-item>
        <el-form-item label="排序号" prop="sortOrder">
          <el-input-number
            v-model="inputForm.sortOrder"
            :step="1"
            controls-position="right"
            :min="0"
            label="排序号"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input
            v-model="inputForm.remarks"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4 }"
          />
        </el-form-item>
        <el-row style="margin-bottom: 10px">
          <el-button type="primary" @click="addDevice">
            新增设备
          </el-button>
        </el-row>
        <el-table :data="positionDeviceList" row-key="sortOrder">
          <el-table-column prop="sortOrder" label="序号" width="50">
            <template slot-scope="scope">
              {{ (scope.row.sortOrder = scope.$index) }}
            </template>
          </el-table-column>
          <el-table-column width="50" align="center" label="拖动">
            <i class="el-icon-rank handle" />
          </el-table-column>
          <el-table-column prop="departmentId" align="center" label="部门">
            <template slot-scope="scope">
              <SelectTree
                :props="{
                  value: 'id', // ID字段名
                  label: 'departmentName', // 显示名称
                  children: 'children', // 子级字段名
                }"
                :list="departList"
                :value="scope.row.departmentId"
                :clearable="true"
                :accordion="true"
                style="width: 100%"
                @getValue="
                  (value) => {
                    getRowDeviceList(scope.row, value);
                  }
                "
              />
            </template>
          </el-table-column>
          <el-table-column prop="id" align="center" label="设备名称">
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.id"
                placeholder="请选择"
                style="width: 100%"
                filterable
              >
                <el-option
                  v-for="item in scope.row.deviceList"
                  :key="item.id"
                  :label="item.assetName"
                  :value="item.id"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="120" fixed="right">
            <template slot-scope="scope">
              <el-button type="text" @click="viewStandard(scope.row.id)">
                巡检标准
              </el-button>
              <el-button
                style="color: var(--ky-danger)"
                type="text"
                @click="deleteDevice(scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="visible = false">关闭</el-button>
        <el-button
          v-if="method !== 'view'"
          type="primary"
          :loading="loading"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>
    <standard-table ref="standardTable" />
  </div>
</template>

<style lang="scss" scoped>
.handle {
  cursor: pointer;
}
</style>
