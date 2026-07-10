<script>
import {
  getCurrentInstance,
  reactive,
  ref,
} from 'vue'
import MapSelection from '@/views/manage/components/mapSelection.vue'
import BindDev from './bindDev.vue'
import ViewHistory from './viewHistory.vue'

export default {
  name: 'BaseInfo',
  components: {
    BindDev,
    MapSelection,
    ViewHistory,
  },
  props: {
    type: {
      type: String,
      default: '',
    },
  },
  setup() {
    const vm = getCurrentInstance().proxy
    const formData = reactive({
      stationName: '丹务-1',
      address: '湛江市民安区丹务村',
      standard: '省标二',
      factoryNumber: '13812345678',
      factoryTime: '2024-01-01',
      firstRunTime: '2024-01-01',
      operator: '林晓璇',
      dataCollection: '13812345678',
      imageCollection: '13812345678',
      designWater: '1000',
      batchWater: '100',
      batchCoefficient: '0.5',
      batchCorrectionInterval: '10',
      regulationPoolVolume: '100',
      regulationPoolLowWater: '50',
      reactionPoolVolume: '100',
      reactionPoolLowWater: '50',
      processingWaterUnitPrice: '1',
      degreeElectricCost: '1',
      dailyDrugConsumption: '1',
      equipmentValue: '100',
    })
    /** 三个正常 */
    const statusList = ref(['正常', '异常', '故障'])
    const normalStatus = ref([
      { label: '设备', status: 1 },
      { label: '生化', status: 2 },
      { label: '出水', status: 3 },
    ])

    const collectorStatus = reactive([
      { label: '数据采集器', status: 1 },
      { label: '图像采集器', status: 2 },
      { label: 'PLC通信状态', status: 3 },
    ])

    const operationModesActive = ref(0)
    const operationModes = reactive([
      { label: '手动运行模式', active: 0 },
      { label: '自动运行模式', active: 1 },
    ])

    const bindDevRef = ref(null)
    const viewHistory = ref(null)
    const show = ref(false)
    const mapSelectionData = ref({})
    const mapSelectionIndex = ref(0)

    const rules = {
      stationName: [{ required: true, message: '请选择站点名称', trigger: 'blur' }],
      address: [{ required: true, message: '请输入站点地址', trigger: 'blur' }],
      standard: [{ required: true, message: '请选择排放标准', trigger: 'blur' }],
      factoryNumber: [{ required: true, message: '请输入出厂编号', trigger: 'blur' }],
      factoryTime: [{ required: true, message: '请选择出厂时间', trigger: 'blur' }],
      firstRunTime: [{ required: true, message: '请选择初次运行时间', trigger: 'blur' }],
      operator: [{ required: true, message: '请选择运维负责人', trigger: 'blur' }],
      dataCollection: [{ required: true, message: '请绑定数据', trigger: 'blur' }],
      imageCollection: [
        { required: true, message: '请输入图像采集器编号', trigger: 'blur' },
      ],
      designWater: [{ required: true, message: '请输入站点设计水量', trigger: 'blur' }],
      batchWater: [{ required: true, message: '请输入批次处理水量', trigger: 'blur' }],
      batchCoefficient: [
        { required: true, message: '请输入批次处理系数K', trigger: 'blur' },
      ],
      batchCorrectionInterval: [
        { required: true, message: '请输入批次修正间隔', trigger: 'blur' },
      ],
      regulationPoolVolume: [
        { required: true, message: '请输入调节池容积', trigger: 'blur' },
      ],
      reactionPoolVolume: [
        { required: true, message: '请输入反应池容积', trigger: 'blur' },
      ],
      processingWaterUnitPrice: [
        { required: true, message: '请输入处理水量单价', trigger: 'blur' },
      ],
      degreeElectricCost: [
        { required: true, message: '请输入度电成本', trigger: 'blur' },
      ],
      dailyDrugConsumption: [
        { required: true, message: '请输入日均药耗', trigger: 'blur' },
      ],
      equipmentValue: [{ required: true, message: '请输入设备价值', trigger: 'blur' }],
    }

    const onBindData = () => {
      bindDevRef.value.dialogVisible = true
    }

    const goMapSelection = () => {
      show.value = true
    }

    const close = () => {
      show.value = false
    }

    const onBack = () => {
      vm.$router.back()
    }

    const saveArea = (e) => {
      const { form } = e
      console.log(form, 'form')
      vm.$set(formData, 'address', form.cityName)
      close()
    }

    const onSave = () => {}

    const onBindImage = () => {
      viewHistory.value.dialogVisible = true
    }

    const onViewHistory = () => {}

    const getStatusClass = (item) => {
      if (item.status === 1) {
        return `${item.label}正常`
      }
      else if (item.status === 2) {
        return `${item.label}异常`
      }
      else {
        return `${item.label}故障`
      }
    }

    const onCheckActive = (i) => {
      operationModesActive.value = i
    }

    return {
      show,
      saveArea,
      formData,
      rules,
      bindDevRef,
      viewHistory,
      onBack,
      onSave,
      goMapSelection,
      close,
      onBindData,
      mapSelectionData,
      mapSelectionIndex,
      onBindImage,
      onViewHistory,
      normalStatus,
      collectorStatus,
      operationModes,
      getStatusClass,
      operationModesActive,
      onCheckActive,
    }
  },
}
</script>

<template>
  <div class="px-6">
    <el-form
      ref="formRef"
      :model="formData"
      :disabled="type === 'view'"
      :rules="rules"
      inline
      size="small"
    >
      <div class="-ml-2 mb-5 flex items-center text-lg font-bold">
        <div class="mr-2 h-6 w-2 bg-primary" />
        基本信息
      </div>
      <div class="flex flex-wrap items-center">
        <el-form-item
          label="站点名称"
          prop="stationName"
          required
        >
          <el-input
            v-model="formData.stationName"
            class="mr-2"
            :disabled="type === 'view'"
            placeholder="请输入站点名称"
          />
        </el-form-item>
        <el-form-item
          label="站点地址"
          prop="address"
          required
        >
          <div class="flex w-full items-center">
            <el-input
              v-model="formData.address"
              class="mr-2"
              :disabled="type === 'view'"
              placeholder="请输入站点地址"
            />
            <el-button
              type="primary"
              size="mini"
              @click="goMapSelection"
            >
              经纬度定位
            </el-button>
          </div>
        </el-form-item>
        <el-form-item
          label="排放标准"
          prop="standard"
          required
        >
          <el-select
            v-model="formData.standard"
            :disabled="type === 'view'"
            placeholder="请选择排放标准"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('station_standard')"
              :key="item.dictCode"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="出厂编号"
          prop="factoryNumber"
          required
        >
          <el-input
            v-model="formData.factoryNumber"
            :disabled="type === 'view'"
            placeholder="请输入出厂编号"
          />
        </el-form-item>
        <el-form-item
          label="出厂时间"
          prop="factoryTime"
          required
        >
          <el-date-picker
            v-model="formData.factoryTime"
            type="date"
            :disabled="type === 'view'"
            placeholder="请选择出厂时间"
          />
        </el-form-item>
        <el-form-item
          label="初次运行时间"
          prop="firstRunTime"
          required
        >
          <el-date-picker
            v-model="formData.firstRunTime"
            type="date"
            :disabled="type === 'view'"
            placeholder="请选择初次运行时间"
          />
        </el-form-item>

        <el-form-item
          label="运维负责人"
          prop="operator"
          required
        >
          <el-select
            v-model="formData.operator"
            :disabled="type === 'view'"
            placeholder="请选择运维负责人"
          >
            <el-option label="陈永久" value="1" />
            <el-option label="林晓璇" value="2" />
            <el-option label="莫名恩" value="3" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="数据采集"
          prop="dataCollection"
          required
        >
          <div class="flex w-full items-center">
            <el-input
              v-model="formData.dataCollection"
              class="mr-2"
              :disabled="type === 'view'"
              placeholder="请输入数据采集"
            />
            <el-button
              type="primary"
              size="mini"
              @click="onBindData"
            >
              绑定数据
            </el-button>
          </div>
        </el-form-item>
      </div>

      <el-form-item
        label="图像采集器编号"
        prop="imageCollection"
        style="width: 480px !important; display: flex"
        required
      >
        <div class="flex items-center">
          <el-input
            v-model="formData.imageCollection"
            style="width: 50%; margin-right: 10px"
            :disabled="type === 'view'"
            placeholder="请输入图像采集器编号"
          />
          <el-button
            type="primary"
            :disabled="type === 'view'"
            size="mini"
            @click="onBindImage"
          >
            SV30拍照
          </el-button>
          <el-button
            type="primary"
            :disabled="type === 'view'"
            size="mini"
            @click="onBindImage"
          >
            查看历史
          </el-button>
        </div>
      </el-form-item>

      <div class="-ml-2 mb-4 flex items-center text-lg font-bold md:mt-8">
        <div class="mr-2 h-6 w-2 bg-primary" />
        站点状态
      </div>

      <div class="mb-3 grid grid-cols-6 gap-4">
        <div
          v-for="(item, index) in normalStatus"
          :key="`normal-${index}`"
          class="flex items-center justify-center space-x-2 rounded-md p-3 text-white"
          :class="{
            'bg-green-500': item.status === 1,
            'bg-yellow-500': item.status === 2,
            'bg-red-500': item.status === 3,
          }"
        >
          {{ getStatusClass(item) }}
        </div>
        <div
          v-for="(item, index) in collectorStatus"
          :key="`collector-${index}`"
          class="flex items-center justify-center space-x-2 rounded-md bg-gray-50 p-3 text-white"
          :class="{
            'bg-green-500': item.status === 1,
            'bg-yellow-500': item.status === 2,
            'bg-red-500': item.status === 3,
          }"
        >
          <span> {{ getStatusClass(item) }}</span>
        </div>
      </div>

      <div class="mb-6 flex">
        <button
          v-for="(item, index) in operationModes"
          :key="`mode-${index}`"
          class="px-4 py-2 transition-colors duration-200"
          :disabled="type === 'view'"
          :class="{
            'bg-blue-500 text-white': item.active === operationModesActive,
            'bg-gray-200 text-gray-700': item.active !== operationModesActive,
            'rounded-l-md': index === 0,
            'rounded-r-md': index === 1,
          }"
          @click="onCheckActive(item.active)"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="-ml-2 mb-4 flex items-center text-lg font-bold md:mt-8">
        <div class="mr-2 h-6 w-2 bg-primary" />
        站点参数
      </div>

      <el-form-item
        label="站点设计处理量"
        prop="designWater"
        required
      >
        <div class="flex w-full items-center">
          <el-input
            v-model="formData.designWater"
            :disabled="type === 'view'"
            placeholder="请输入站点设计处理量"
          />
          <span class="ml-2">m³/d</span>
        </div>
      </el-form-item>
      <el-form-item
        label="批次设计处理量"
        prop="batchWater"
        required
      >
        <div class="flex w-full items-center">
          <el-input
            v-model="formData.batchWater"
            :disabled="type === 'view'"
            placeholder="请输入批次设计处理量"
          />
          <span class="ml-2">m³/d</span>
        </div>
      </el-form-item>
      <el-form-item
        label="批次最小处理量系数"
        prop="batchCoefficient"
        required
      >
        <div class="flex w-full items-center">
          <el-input
            v-model="formData.batchCoefficient"
            :disabled="type === 'view'"
            placeholder="请输入批次最小处理量系数"
          />
        </div>
      </el-form-item>
      <el-form-item
        label="批次修正间隔"
        prop="batchCorrectionInterval"
        required
      >
        <div class="flex w-full items-center">
          <el-input
            v-model="formData.batchCorrectionInterval"
            :disabled="type === 'view'"
            style="width: 70%"
            placeholder="请输入批次修正间隔"
          />
          <span class="ml-2">分钟</span>
        </div>
      </el-form-item>
      <el-form-item
        label="调节池容量"
        prop="regulationPoolVolume"
        required
      >
        <div class="flex w-full items-center">
          <el-input
            v-model="formData.regulationPoolVolume"
            :disabled="type === 'view'"
            placeholder="请输入调节池容量"
          />
          <span class="ml-2">m³</span>
        </div>
      </el-form-item>
      <el-form-item
        label="调节池最低水量"
        prop="regulationPoolLowWater"
        required
      >
        <div class="flex w-full items-center">
          <el-input
            v-model="formData.regulationPoolLowWater"
            :disabled="type === 'view'"
            placeholder="请输入调节池最低水量"
          />
          <span class="ml-2">%</span>
        </div>
      </el-form-item>
      <el-form-item
        label="反应池容量"
        prop="reactionPoolVolume"
        required
      >
        <div class="flex w-full items-center">
          <el-input
            v-model="formData.reactionPoolVolume"
            :disabled="type === 'view'"
            placeholder="请输入反应池容量"
          />
          <span class="ml-2">m³</span>
        </div>
      </el-form-item>
      <el-form-item
        label="反应池最低水量"
        prop="reactionPoolLowWater"
        required
      >
        <div class="flex w-full items-center">
          <el-input
            v-model="formData.reactionPoolLowWater"
            :disabled="type === 'view'"
            placeholder="请输入反应池最低水量"
          />
          <span class="ml-2">%</span>
        </div>
      </el-form-item>

      <div class="-ml-2 mb-4 mt-6 flex items-center text-lg font-bold md:mt-9">
        <div class="mr-2 h-6 w-2 bg-primary" />
        运营指标
      </div>

      <el-form-item
        label="处理水量单价"
        prop="processingWaterUnitPrice"
        required
      >
        <div class="flex w-full items-center">
          <el-input
            v-model="formData.processingWaterUnitPrice"
            :disabled="type === 'view'"
            style="width: 70%"
            placeholder="请输入处理水量单价"
          />
          <span class="ml-2">元/吨</span>
        </div>
      </el-form-item>

      <el-form-item
        label="度电成本"
        prop="degreeElectricCost"
        required
      >
        <div class="flex w-3/4 items-center">
          <el-input
            v-model="formData.degreeElectricCost"
            :disabled="type === 'view'"
            placeholder="请输入度电成本"
          />
        </div>
      </el-form-item>

      <el-form-item
        label="日均药耗"
        prop="dailyDrugConsumption"
        required
      >
        <div class="flex w-3/4 items-center">
          <el-input
            v-model="formData.dailyDrugConsumption"
            :disabled="type === 'view'"
            placeholder="请输入日均药耗"
          />
        </div>
      </el-form-item>

      <el-form-item
        label="设备价值"
        prop="equipmentValue"
        required
      >
        <div class="flex w-full items-center">
          <el-input
            v-model="formData.equipmentValue"
            :disabled="type === 'view'"
            style="width: 70%"
            placeholder="请输入设备价值"
          />
          <span class="ml-2">万元</span>
        </div>
      </el-form-item>
    </el-form>

    <MapSelection
      :dialogFormVisible.sync="show"
      :mapSelectionData="mapSelectionData"
      :mapSelectionIndex="mapSelectionIndex"
      @close="close"
      @saveArea="saveArea"
    />
    <BindDev ref="bindDevRef" />
    <ViewHistory ref="viewHistory" />
  </div>
</template>

<style lang="scss" scoped>
.el-form-item {
  margin-bottom: 18px !important;
  width: calc((100% - 30px) / 3) !important;
  text-align: left;
}

::v-deep .el-form-item--small .el-form-item__content {
  line-height: 32px;
  min-width: calc(100% - 130px) !important;
  max-width: calc(100% - 70px) !important;
}

// ::v-deep .el-form-item__label {
//   padding-left: 5px !important;
// }
</style>
