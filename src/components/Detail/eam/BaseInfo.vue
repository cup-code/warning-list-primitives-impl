<script>
import ImageSelect from '@/components/ImageSelect'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
import {
  addDeviceFn,
  getAllDeviceTypeFn,
  getBuildIdFn,
  getInfoByIdFn,
} from '@/http/dev_new/manage-api'
import { upLoadImg } from '@/http/manage-api'
import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
import { getUsersByDepartIdFn } from '@/http/safe-production/user-manage-api'
import { loadJsmap } from '@/utils/loadJsmap'

export default {
  components: {
    SelectTree,
    ImageSelect,
  },
  props: {
    did: String,
    method: String,
  },
  data: () => ({
    loading: false,
    inputForm: {
      id: '',
      assetCode: '', // 资产设备编码
      assetDeviceSafe: '', // 设备安全，逗号分隔的整数
      assetLevel: '', // 资产设备级别
      assetName: '', // 资产设备名称
      assetNo: '', // 资产设备位号
      assetPrincipalId: '', // 资产设备负责人id
      assetState: '运行', // 状态
      assetTypeId: '', // 资产设备类别id
      brand: '', // 品牌
      departmentId: '', // 使用单位组织机构id
      exFactoryNo: '', // 出厂编号
      exFactoryNoDate: '', // 出厂日期
      guaranteeEndDate: '', // 保修期止
      importanceLevel: '', // 重要等级
      installationLocation: '', // 安装地点
      lifeCycle: 1, // 生命周期
      pointInfoList: [], // 位置标注信息
      manufacturer: '', // 制造厂家
      model: '', // 规格型号
      optionalBrands: '', // 可选品牌库
      photo: '', // 照片地址
      purchasePrice: 0, // 置入金额
      purchaseTime: '', // 置入时间
      purchaseType: '1', // 置入类别
      runningCost: 1, // 运行成本
      standardCapacity: 0, // 标准产能
      supplier: '', // 供应商
      workshopPrincipalId: '', // 车间负责人id
    },
    dataRule: {
      assetName: [{ required: true, message: '设备名称不能为空', trigger: 'blur' }],
      assetLevel: [{ required: true, message: '设备级别不能为空', trigger: 'change' }],
      assetPrincipalId: [
        { required: true, message: '设备负责人不能为空', trigger: 'change' },
      ],
      assetTypeId: [{ required: true, message: '设备类别不能为空', trigger: 'change' }],
      departmentId: [{ required: true, message: '单位组织不能为空', trigger: 'change' }],
      importanceLevel: [
        { required: true, message: '重要等级不能为空', trigger: 'change' },
      ],
      workshopPrincipalId: [
        { required: true, message: '车间负责人不能为空', trigger: 'change' },
      ],
    },
    users: [],
    departList: [],
    typeList: [],
    pointMarker: null, // 地图上的标注点
    mapServerURL: window.g.MAP_URL, // 地图引用的地址
    zqMap: null,
  }),
  created() {
    this.getPrefix() // 获取图片/文件前缀
  },
  async mounted() {
    await loadJsmap()
    const departRes = await getDepartListSimple() // 获取当前用户所拥有的部门
    this.departList = departRes.data.result || []
    const deviceTypeRes = await getAllDeviceTypeFn() // 获取设备类型
    this.typeList = deviceTypeRes.data.result || []
    // 如果不是新增设备，需要加载设备详情
    if (this.method !== 'add') {
      this.loading = true
      const formRes = await getInfoByIdFn(this.did)
      this.loading = false
      if (formRes.data.success) {
        this.inputForm = this.recover(this.inputForm, formRes.data.result)
        this.getUsersByDepartId(formRes.data.result.departmentId, true) // 通过使用单位获取人员列表，并加载地图
      }
      else {
        this.$message.error(formRes.data.message || '查询失败')
      }
    }
  },
  destroyed() {
    // 销毁地图实例
    if (this.zqMap) {
      this.zqMap.destroy()
      this.zqMap = null
    }
  },
  methods: {
    // 加载地图,编辑或者查看的时候init为true
    loadMap(buildId, init) {
      // 初始化真趣的地图
      this.zqMap = new jsmap.JSMap({
        mapType: jsmap.JSMapType.MAP_3D,
        container: 'mapContainer',
        mapServerURL: this.mapServerURL,
        openingAnimation: false,
        showLoading: false,
        buildingSelected: false,
      })
      this.zqMap.openMapById(this.buildId)
      this.zqMap.on('loadComplete', (e) => {
        if (init && this.inputForm.pointInfoList && this.inputForm.pointInfoList.length) {
          this.pointMarker = new jsmap.JSPointMarker({
            color: '#00FF00',
            size: 14,
            position: this.inputForm.pointInfoList[0],
            outlineColor: '#CD5C5C',
            outlineWidth: 1,
            judgeInOrOutDoor: false,
            depthTest: false,
          })
          this.zqMap.addMarker(this.pointMarker)
        }
        // 地图点击事件，如果有标注点，则点击的时候更新；如果没有，则点击的时候增加标注点
        this.zqMap.on('mapClickNode', (event) => {
          if (this.pointMarker) {
            this.zqMap.updateMarkerPosition(this.pointMarker, {
              position: {
                x: event.x,
                y: event.y,
                z: event.z,
              },
            })
          }
          else {
            this.pointMarker = new jsmap.JSPointMarker({
              color: '#00FF00',
              size: 14,
              position: {
                x: event.x,
                y: event.y,
                z: event.z,
              },
              outlineColor: '#CD5C5C',
              outlineWidth: 1,
              judgeInOrOutDoor: false,
              depthTest: false,
            })
            this.zqMap.addMarker(this.pointMarker)
          }
        })
      })
    },
    /* 图片选择回调 */
    fileChangeEvt(file) {
      if (file) {
        upLoadImg(file, 'DEVICE_ICON').then(({ data }) => {
          if (data.success) {
            this.inputForm.photo = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.inputForm.photo = ''
      }
    },
    // 查询指定部门所在公司下的所有用户,仅返回id/username/fullname
    getUsersByDepartId(id, init) {
      this.inputForm.departmentId = id
      this.pointMarker = null // 切换部门的时候清空地图上的标记点
      // 销毁地图实例
      if (this.zqMap) {
        this.zqMap.destroy()
        this.zqMap = null
      }
      if (id) {
        getUsersByDepartIdFn(id).then(({ data }) => {
          this.users = data.result || []
        })
        getBuildIdFn(id, 'DEPARTMENT_ID').then(({ data }) => {
          this.buildId = data.result || ''
          if (this.buildId) {
            this.loadMap(this.buildId, init)
          }
        })
      }
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          // 如果有地图上的标注点，取标注点的位置赋值给form里的locationInformation
          if (this.pointMarker) {
            this.inputForm.pointInfoList = [this.pointMarker.position].map((position) => {
              return {
                x: position._x,
                y: position._y,
                z: position._z,
              }
            })
          }
          addDeviceFn(this.inputForm).then(({ data }) => {
            this.loading = false
            if (data && data.success) {
              this.$message.success(data.message)
              if (this.method === 'add') {
                this.$emit('update:did', data.result) // 提交成功之后，更新did，保存技术参数等时需要
              }
            }
            else {
              this.$message.error(data.message || '提交失败')
            }
          })
        }
      })
    },
    backFn() {
      this.$router.back(-1)
    },
  },
}
</script>

<template>
  <div class="asset-baseinfo">
    <div class="btnArea">
      <el-button
        type="primary"
        :loading="loading"
        :disabled="method === 'view'"
        @click="doSubmit()"
      >
        保存
      </el-button>
      <el-button @click="backFn">
        返回
      </el-button>
    </div>
    <el-form
      ref="inputForm"
      v-loading="loading"
      :inline="true"
      :model="inputForm"
      :rules="dataRule"
      label-width="100px"
      :disabled="method === 'view'"
      @submit.native.prevent
    >
      <el-row class="title">
        基础属性
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="设备名称" prop="assetName">
            <el-input v-model="inputForm.assetName" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="设备编码" prop="assetCode">
            <el-input v-model="inputForm.assetCode" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="规格型号" prop="model">
            <el-input v-model="inputForm.model" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="设备类别" prop="assetTypeId">
            <SelectTree
              :props="{
                value: 'id', // ID字段名
                label: 'assetTypeName', // 显示名称
                children: 'children', // 子级字段名
              }"
              :list="typeList"
              :value="inputForm.assetTypeId"
              :clearable="true"
              :accordion="true"
              @getValue="
                (value) => {
                  inputForm.assetTypeId = value;
                }
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="设备级别" prop="assetLevel">
            <el-select
              v-model="inputForm.assetLevel"
              placeholder="请选择"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in $dictUtils.getDictList('asset_level')"
                :key="item.dictCode"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="重要等级" prop="importanceLevel">
            <el-select
              v-model="inputForm.importanceLevel"
              placeholder="请选择"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in $dictUtils.getDictList('importance_level')"
                :key="item.dictCode"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="设备位号" prop="assetNo">
            <el-input v-model="inputForm.assetNo" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="使用单位" prop="departmentId">
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
                  getUsersByDepartId(value, false);
                }
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="车间负责人" prop="workshopPrincipalId">
            <el-select
              v-model="inputForm.workshopPrincipalId"
              placeholder="请选择"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in users"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="安装地点" prop="installationLocation">
            <el-input v-model="inputForm.installationLocation" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="设备负责人" prop="assetPrincipalId">
            <el-select
              v-model="inputForm.assetPrincipalId"
              placeholder="请选择"
              style="width: 100%"
              filterable
            >
              <el-option
                v-for="item in users"
                :key="item.id"
                :label="item.fullName"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item label="状态" prop="assetState">
          <el-radio-group v-model="inputForm.assetState">
            <el-radio-button label="运行">
              运行
            </el-radio-button>
            <el-radio-button label="停机">
              停机
            </el-radio-button>
            <el-radio-button label="维修">
              维修
            </el-radio-button>
            <el-radio-button label="故障">
              故障
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="生命周期" prop="lifeCycle">
            <el-input-number
              v-model="inputForm.lifeCycle"
              controls-position="right"
              :min="0"
            />
            <span>(年)</span>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="标准产能" prop="standardCapacity">
            <el-input-number
              v-model="inputForm.standardCapacity"
              controls-position="right"
              :min="0"
            />
            <span>(万吨/年)</span>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="运行成本" prop="runningCost">
            <el-input-number
              v-model="inputForm.runningCost"
              controls-position="right"
              :min="0"
            />
            <span>(元/天)</span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="照片" prop="photo">
            <ImageSelect
              :signUrl="inputForm.photo ? filePrefix + inputForm.photo : ''"
              width="100px"
              height="100px"
              @fileChange="fileChangeEvt"
            />
          </el-form-item>
        </el-col>
        <el-col :span="16">
          <el-form-item label="位置标注">
            <el-tag v-show="!zqMap" type="warning">
              <i class="el-icon-warning" />
              提示：未选择单位或使用单位未绑定建模地图
            </el-tag>
            <div id="mapContainer" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row class="title">
        置入信息
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="置入类别" prop="purchaseType">
            <el-radio-group v-model="inputForm.purchaseType">
              <el-radio-button label="1">
                购买
              </el-radio-button>
              <el-radio-button label="2">
                租赁
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="供应商" prop="supplier">
            <el-input v-model="inputForm.supplier" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="制造厂家" prop="manufacturer">
            <el-input v-model="inputForm.manufacturer" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="品牌" prop="brand">
            <el-input v-model="inputForm.brand" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="品牌库" prop="optionalBrands">
            <el-input v-model="inputForm.optionalBrands" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="出厂编号" prop="exFactoryNo">
            <el-input v-model="inputForm.exFactoryNo" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="置入金额" prop="purchasePrice">
            <el-input-number
              v-model="inputForm.purchasePrice"
              controls-position="right"
              :min="0"
            />
            <span>(万)</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出厂日期" prop="exFactoryNoDate">
            <el-date-picker
              v-model="inputForm.exFactoryNoDate"
              type="date"
              placeholder="选择出厂日期"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="采购时间" prop="purchaseTime">
            <el-date-picker
              v-model="inputForm.purchaseTime"
              type="date"
              placeholder="选择采购时间"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="保修期止" prop="guaranteeEndDate">
            <el-date-picker
              v-model="inputForm.guaranteeEndDate"
              type="date"
              placeholder="选择保修期止"
              value-format="yyyy-MM-dd"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.asset-baseinfo {
  height: 80vh;
  overflow: auto;
  scrollbar-width: none;
}
.btnArea {
  display: flex;
  justify-content: flex-end;
}
.title {
  font-weight: bold;
  font-size: 16px;
  line-height: 30px;
  margin-left: 17px;
  padding-left: 8px;
  text-align: left;
  position: relative;

  &::before {
    content: "";
    width: 5px;
    height: 18px;
    background: var(--ky-primary);
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 0;
  }
}
#mapContainer {
  width: 450px;
  height: 300px;
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid var(--ky-border-color);
}
</style>
