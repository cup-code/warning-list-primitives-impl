<script>
import {
  getCurrentInstance,
  reactive,
  ref,
} from 'vue'
import EditSubsystem from './editSubsystem.vue'

export default {
  name: 'BaseInfo',
  components: {
    EditSubsystem,
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
      // 水量系统
      reactionPoolLevel: '1', // 反应池液位
      regulationPoolLevel: '2', // 调节池液位
      totalProcessedWater: '3', // 累计处理水量
      lastProcessedWater: '4', // 上次处理水量
      pendingProcessWater: '5', // 调节池待处理水量
      reactionPoolHighLevel: '6', // 反应池高液位设置
      reactionPoolLowLevel: '7', // 反应池低液位设置
      regulationPoolHighLevel: '8', // 调节池高液位设置
      regulationPoolLowLevel: '9', // 调节池低液位设置
      // 水质系统
      waterStandard: '一级A',
      processType: 'A²O+',
      outWaterAmmonia: '达标',
      outWaterCOD: '达标',
      outWaterTestCount: '2',
      codDrugCount: '10',
      ammoniaPackageCount: '10',
      outWaterAmmoniaLimit: '0.8',
      outWaterCODLimit: '0.8',
      inWaterCOD: '0.8',
      inWaterCODLimit: '300',
      inWaterAmmonia: '0',
      inWaterAmmoniaLimit: '40',
      ammoniaPackageSetting: '3',
      outWaterTestSetting: '0.8',
      codPackageSetting: '3',

      // 栅渣系统
      garbageHeight: '1.15',
      garbageTotal: '940.2',
      garbageCheckTime: '34405.19',
      garbageHeightLimit: '0.8',
      garbageTriggerHeight: '0.8',
      garbageCheckTimeSetting: '0.8',

      // 生化系统
      sv30RatioValue: '10',
      sv5RatioValue: '11',
      sv30LowLimit: '0',
      sv30HighLimit: '40',
      sludgeCheckTime: '3',

      // 污泥系统
      sludgeCheckTime: '10',
      drainageCycle: '11',
      sludgeLevel: '0',
      sludgeLevelLimit: '0',
      sludgeCheckDuration: '0',
      waterPumpFlow: '0',
      drainageVolume: '0',
      drainageCycleCount: '0',

      // 无害化系统
      harmlessStatus: '已开启',
      harmlessTime: '11',
      sludgeTemp: '27.2',
      waterBoxTemp: '27.2',
      sludgeTempHighLimit: '0',
      sludgeTempLowLimit: '0',
      waterBoxTempHighLimit: '0',
      waterBoxTempLowLimit: '0',
      harmlessTimeSetting: '0',

      // 加药系统
      carbonDosage: '32',
      carbonDosagePerCOD: '1.15',
      carbonDosagePerRatio: '0',
      periodWaterVolume: '10.89',
      carbonPumpSource: '不加碳源',
      ammoniaPumpSource: '不加碳源',
      carbonPumpSource2: '不加碳源',
      ammoniaPumpSource2: '不加碳源',
      carbonTimeSelect: '计算',
      carbonWeight: '重置',
      ammoniaWeight: '重置',
      codAirRatio: '0',
      codRiseSpeed: '0',
      carbonConfig: '0',
      carbonInitialDosage: '0',
      pumpFlowRate: '0',
      ammoniaInitialDosage: '0',
      ammoniaRemainingDosage: '0',
      ammoniaDosagePerTime: '0',

      // 除臭系统
      deodorizationStatus: '已开启',
      deodorizationReset: '复位',
      deodorizationStartTime: '11',
      deodorizationInterval: '27.2',
      filterUsageTime: '27.2',
      deodorizationStartSetting: '0',
      deodorizationIntervalSetting: '0',
      filterLifetime: '0',

      // 设备监控系统
      accumulatedPower: '11342',
      waterPumpCurrent: '36',
      fanCurrent: '36',
      pressurePumpCurrent: '0',
      pumpRunningTime: '0',
      currentVoltage: '36',
      waterPumpPower: '36',
      fanPower: '10',
      pressurePumpPower: '11342',
      runningDays: '789',
      runningHours: '18',
      currentCurrent: '0',
      currentPower: '0',
      dailyPowerConsumption: '0',
      waterPumpCurrentLimit: '0',
      fanCurrentLimit: '0',
      pressurePumpCurrentLimit: '0',
      waterPumpPowerLimit: '0',
      fanPowerLimit: '0',
      pressurePumpPowerLimit: '0',
      deviceCheckInterval: '0',
      deviceSoundCheckInterval: '0',
      pumpCheckInterval: '0',
    })

    const systemStatusActive = ref(0)
    const systemStatusData = reactive([
      { label: '系统启动', active: 0 },
      { label: '系统关闭', active: 1 },
    ])

    const sbrStatusActive = ref(0)
    const sbrStatusData = reactive([
      { label: 'SBR1', active: 0 },
      { label: 'SBR2', active: 1 },
    ])

    const sbrStepActive = ref(0)
    const sbrStepData = reactive([
      { label: '切换曝气状态', active: 0 },
      { label: '关闭曝气状态', active: 1 },
    ])

    const rules = {

    }

    const tableData = ref([
      { index: 2, name: '调节池高位预警值', value: 10, unit: '米' },
      { index: 3, name: '调节池低位预警值', value: 43800, unit: '米' },
      { index: 4, name: '反应池高位预警值', value: 5, unit: '米' },
    ])

    const editSubsystem = ref(null)

    const onBack = () => {
      vm.$router.back()
    }

    const onSave = () => {}

    const objectSpanMethod = ({
      row,
      column,
      rowIndex,
      columnIndex,
    }) => {
      if (columnIndex === 5) {
        // 操作列
        if (rowIndex === 0) {
          // 第一行显示，其他行隐藏
          return {
            rowspan: tableData.value.length, // 合并所有行
            colspan: 1,
          }
        }
        else {
          return {
            rowspan: 0,
            colspan: 0,
          }
        }
      }
    }

    const editValue = () => {
      editSubsystem.value.dialogVisible = true
    }

    return {
      formData,
      rules,
      onBack,
      onSave,
      systemStatusActive,
      systemStatusData,
      sbrStatusActive,
      sbrStatusData,
      sbrStepActive,
      sbrStepData,
      tableData,
      objectSpanMethod,
      editSubsystem,
      editValue,
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
        步序设置
      </div>

      <div class="mb-6 flex items-center gap-8">
        <div class="flex items-center">
          <span class="mr-4 text-gray-600">系统状态：</span>
          <div class="flex">
            <button
              v-for="(item, index) in systemStatusData"
              :key="`system-${index}`"
              class="px-4 py-2 transition-colors duration-200"
              :disabled="type === 'view'"
              :class="{
                'bg-blue-500 text-white': item.active === systemStatusActive,
                'bg-gray-200 text-gray-700': item.active !== systemStatusActive,
                'rounded-l-md': index === 0,
                'rounded-r-md': index === 1,
              }"
              @click="systemStatusActive = item.active"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <!-- SBR切换 -->
        <div class="flex items-center">
          <span class="mr-4 text-gray-600">SBR切换：</span>
          <div class="flex">
            <button
              v-for="(item, index) in sbrStatusData"
              :key="`sbr-${index}`"
              class="px-4 py-2 transition-colors duration-200"
              :disabled="type === 'view'"
              :class="{
                'bg-blue-500 text-white': item.active === sbrStatusActive,
                'bg-gray-200 text-gray-700': item.active !== sbrStatusActive,
                'rounded-l-md': index === 0,
                'rounded-r-md': index === 1,
              }"
              @click="sbrStatusActive = item.active"
            >
              {{ item.label }}
            </button>
          </div>
        </div>

        <!-- SBR步序切换 -->
        <div class="flex items-center">
          <span class="mr-4 text-gray-600">SBR步序：</span>
          <div class="flex">
            <button
              v-for="(item, index) in sbrStepData"
              :key="`step-${index}`"
              class="px-4 py-2 transition-colors duration-200"
              :disabled="type === 'view'"
              :class="{
                'bg-blue-500 text-white': item.active === sbrStepActive,
                'bg-gray-200 text-gray-700': item.active !== sbrStepActive,
                'rounded-l-md': index === 0,
                'rounded-r-md': index === 1,
              }"
              @click="sbrStepActive = item.active"
            >
              {{ item.label }}
            </button>
          </div>
        </div>
      </div>

      <el-table
        :data="tableData"
        border
        style="width: 100%"
        :span-method="objectSpanMethod"
      >
        <el-table-column
          prop="index"
          label="序号"
          width="80"
          align="center"
        />
        <el-table-column
          prop="name"
          label="预警指标"
          align="center"
        />
        <el-table-column
          prop="value"
          label="输出"
          align="center"
        />
        <el-table-column
          prop="unit"
          label="单位"
          width="100"
          align="center"
        />
        <el-table-column
          label="操作"
          width="100"
          align="center"
        >
          <template>
            <div class="flex h-full items-center justify-center">
              <el-button
                type="text"
                size="small"
                class="text-red-500"
              >
                修改
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="my-2 border-b border-gray-200" />

      <div class="-ml-2 mb-4 flex items-center text-lg font-bold md:mt-8">
        <div class="mr-2 h-6 w-2 bg-primary" />
        水量系统
      </div>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="反应池液位"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.reactionPoolLevel"
                :disabled="true"
              />
              <span class="ml-2">米</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="调节池液位"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.regulationPoolLevel"
                :disabled="true"
              />
              <span class="ml-2">米</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="累计处理水量"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.totalProcessedWater"
                :disabled="true"
              />
              <span class="ml-2">m³</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="上次处理水量"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.lastProcessedWater"
                :disabled="true"
              />
              <span class="ml-2">m³</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="调节池待处理水量"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.pendingProcessWater"
                :disabled="true"
              />
              <span class="ml-2">m³</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="反应池高液位设置"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.reactionPoolHighLevel"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500" @click="editValue">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="反应池低液位设置"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.reactionPoolLowLevel"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="调节池高液位设置"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.regulationPoolHighLevel"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="调节池低液位设置"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.regulationPoolLowLevel"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="my-2 border-b border-gray-200" />

      <div class="-ml-2 mb-4 mt-6 flex items-center text-lg font-bold md:mt-9">
        <div class="mr-2 h-6 w-2 bg-primary" />
        水质系统
      </div>

      <el-row>
        <el-col :span="12">
          <el-form-item
            label="出水标准"
            prop="waterStandard"
          >
            <el-radio-group v-model="formData.waterStandard">
              <el-radio label="一级A">
                一级A
              </el-radio>
              <el-radio label="一级B">
                一级B
              </el-radio>
              <el-radio label="地表水">
                地表水
              </el-radio>
              <el-radio label="省标一">
                省标一
              </el-radio>
              <el-radio label="省标二">
                省标二
              </el-radio>
              <el-radio label="省标三">
                省标三
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="工艺选择"
            prop="processType"
          >
            <el-radio-group v-model="formData.processType">
              <el-radio label="A²O+">
                A²O+
              </el-radio>
              <el-radio label="A²O">
                A²O
              </el-radio>
              <el-radio label="AO">
                AO
              </el-radio>
              <el-radio label="O">
                O
              </el-radio>
              <el-radio label="AOAO">
                AOAO
              </el-radio>
              <el-radio label="其他">
                其他
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 状态显示行 -->
      <el-row>
        <el-col :span="6">
          <el-form-item
            label="出水氨氮"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              {{ formData.outWaterAmmonia }}
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="出水COD"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              {{ formData.outWaterCOD }}
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="出水间隔测量计数"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.outWaterTestCount"
                :disabled="true"
              />
              <span class="ml-2">次</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="COD药包数量计数"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.codDrugCount"
                :disabled="true"
              />
              <span class="ml-2">条</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 药包和测量行 -->
      <el-row>
        <el-col :span="6">
          <el-form-item
            label="氨氮药包数量计数"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.ammoniaPackageCount"
                :disabled="true"
              />
              <span class="ml-2">条</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="COD药包复位"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="type === 'view'"
            >
              复位
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="排水氨氮达标"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              达标
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="排水COD达标"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              达标
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 测量和复位行 -->
      <el-row>
        <el-col :span="6">
          <el-form-item
            label="氨氮药包复位"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="type === 'view'"
            >
              复位
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="出水COD测量"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="type === 'view'"
            >
              测量
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="出水氨氮测量"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="type === 'view'"
            >
              测量
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 水值选择行 -->
      <el-row>
        <el-col :span="6">
          <el-form-item
            label="进水值选择"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-button
                type="primary"
                size="mini"
                :disabled="type === 'view'"
              >
                输入
              </el-button>
              <span class="ml-2 text-xs" @click="editValue">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="出水值选择"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-button
                type="primary"
                size="mini"
                :disabled="type === 'view'"
              >
                输入
              </el-button>
              <span class="ml-2 text-xs">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 参数设置行1 -->
      <el-row>
        <el-col :span="6">
          <el-form-item
            label="出水氨氮高限(mg/L)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.outWaterAmmoniaLimit"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="出水COD高限(mg/L)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.outWaterCODLimit"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="进水COD(mg/L)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.inWaterCOD"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="进水COD高限(mg/L)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.inWaterCODLimit"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 参数设置行2 -->
      <el-row>
        <el-col :span="6">
          <el-form-item
            label="进水氨氮(mg/L)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.inWaterAmmonia"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="进水氨氮高限(mg/L)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.inWaterAmmoniaLimit"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="氨氮药包数量设定(条)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.ammoniaPackageSetting"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="出水间隔测量设定(次)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.outWaterTestSetting"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 参数设置行3 -->
      <el-row>
        <el-col :span="6">
          <el-form-item
            label="COD药包数量设定(条)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.codPackageSetting"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="my-2 border-b border-gray-200" />

      <div class="-ml-2 mb-4 mt-6 flex items-center text-lg font-bold md:mt-9">
        <div class="mr-2 h-6 w-2 bg-primary" />
        栅渣系统
      </div>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="栅渣物位值"
            prop="designWater"
            required
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.designWater"
                :disabled="type === 'view'"
                placeholder="请输入栅渣物位值"
              />
              <span class="ml-2">米</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="栅渣累计总量"
            prop="designWater"
            required
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.designWater"
                :disabled="type === 'view'"
                placeholder="请输入栅渣累计总量"
              />
              <span class="ml-2">L</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="栅渣检测时间计时"
            prop="designWater"
            required
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.designWater"
                :disabled="type === 'view'"
                placeholder="请输入栅渣检测时间计时"
              />
              <span class="ml-2">时</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item
            label="栅渣物位高限(米)"
            prop="regulationPoolLowWater"
            required
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.regulationPoolLowWater"
                :disabled="type === 'view'"
                placeholder="请输入栅渣物位高限(米)"
              />
              <span class="ml-2 w-12">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="栅渣检测触发液位(米)"
            prop="regulationPoolLowWater"
            required
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.regulationPoolLowWater"
                :disabled="type === 'view'"
                placeholder="请输入栅渣检测触发液位(米)"
              />
              <span class="ml-2 w-12">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="栅渣检测时间设置"
            prop="regulationPoolLowWater"
            required
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.regulationPoolLowWater"
                :disabled="type === 'view'"
                placeholder="请输入栅渣检测时间设置"
              />
              <span class="ml-2 w-12">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="6">
          <el-form-item
            label="栅渣复位"
            prop="reactionPoolVolume"
            required
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              复位
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="my-2 border-b border-gray-200" />

      <div class="-ml-2 mb-4 mt-6 flex items-center text-lg font-bold md:mt-9">
        <div class="mr-2 h-6 w-2 bg-primary" />
        生化系统
      </div>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="SV30比例读取数值"
            required
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.sv30RatioValue"
                :disabled="true"
                placeholder="请输入SV30比例读取数值"
              />
              <span class="ml-2">%</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="SV5比例读取数值"
            required
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.sv5RatioValue"
                :disabled="true"
                placeholder="请输入SV5比例读取数值"
              />
              <span class="ml-2">%</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="SV30高限设置(%)"
            required
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.sv30HighLimit"
                :disabled="type === 'view'"
                placeholder="请输入SV30高限设置"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="SV30低限设置(%)"
            required
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.sv30LowLimit"
                :disabled="type === 'view'"
                placeholder="请输入SV30低限设置"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="栅渣检测时间设置"
            required
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.sludgeCheckTime"
                :disabled="type === 'view'"
                placeholder="请输入栅渣检测时间设置"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="my-2 border-b border-gray-200" />

      <div class="-ml-2 mb-4 mt-6 flex items-center text-lg font-bold md:mt-9">
        <div class="mr-2 h-6 w-2 bg-primary" />
        污泥系统
      </div>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="污泥检测时间计时"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.sludgeCheckTime"
                :disabled="true"
              />
              <span class="ml-2">%</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="排泥周期计数"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.drainageCycle"
                :disabled="true"
              />
              <span class="ml-2">%</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="污泥物位(米)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.sludgeLevel"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="污泥物位高限(米)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.sludgeLevelLimit"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="污泥检测时间(时)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.sludgeCheckDuration"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="水泵流量(m³/h)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.waterPumpFlow"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="排泥量(m³)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.drainageVolume"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="排泥周期次数(次)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.drainageCycleCount"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item label="污泥复位">
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              复位
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
      <div class="my-2 border-b border-gray-200" />

      <div class="-ml-2 mb-4 mt-6 flex items-center text-lg font-bold md:mt-9">
        <div class="mr-2 h-6 w-2 bg-primary" />
        无害化系统
      </div>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="无害化开关状态"
            label-width="140px"
            label-position="left"
          >
            <div class="flex items-center gap-4">
              <el-button
                type="primary"
                size="mini"
                :disabled="true"
              >
                已开启
              </el-button>
              <el-button
                type="info"
                size="mini"
                :disabled="true"
              >
                已关闭
              </el-button>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="无害化复位"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              复位
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="无害化状态"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              进行中
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="无害化计时"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.harmlessTime"
                :disabled="true"
              />
              <span class="ml-2">分</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="污泥温度"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.sludgeTemp"
                :disabled="true"
              />
              <span class="ml-2">℃</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="循环水箱温度"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.waterBoxTemp"
                :disabled="true"
              />
              <span class="ml-2">℃</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="污泥温度高限(℃)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.sludgeTempHighLimit"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="污泥温度低限(℃)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.sludgeTempLowLimit"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="水箱温度高限(℃)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.waterBoxTempHighLimit"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="水箱温度低限(℃)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.waterBoxTempLowLimit"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="无害化时间设置(分)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.harmlessTimeSetting"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="my-2 border-b border-gray-200" />

      <div class="-ml-2 mb-4 mt-6 flex items-center text-lg font-bold md:mt-9">
        <div class="mr-2 h-6 w-2 bg-primary" />
        加药系统
      </div>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="碳源剂药剂剂量"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.carbonDosage"
                :disabled="true"
              />
              <span class="ml-2">L</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="碳源每次用量(低COD)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.carbonDosagePerCOD"
                :disabled="true"
              />
              <span class="ml-2">L</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="碳源每次用量(碳氮比)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.carbonDosagePerRatio"
                :disabled="true"
              />
              <span class="ml-2">L</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="每周期进水量"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.periodWaterVolume"
                :disabled="true"
              />
              <span class="ml-2">m³</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="厌氧1加碳源"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              不加碳源
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="好氧1加碳源"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              不加碳源
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="厌氧2加碳源"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              不加碳源
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="好氧2加碳源"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              不加碳源
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="碳源时间选择"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              计算
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="碳源重置"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              重置
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="累计剂重置"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              重置
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="COD氨氮比"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.codAirRatio"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="COD提升浓度(mg/L)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.codRiseSpeed"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="碳源配药浓度(mg/L)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.carbonConfig"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="碳源初始药剂总量(L)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.carbonInitialDosage"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="药泵流量(mL/s)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.pumpFlowRate"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="累计剂初始药剂总量(L)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.ammoniaInitialDosage"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="累计剂剩余药剂总量(L)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.ammoniaRemainingDosage"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="累计剂每次药剂用量(L)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.ammoniaDosagePerTime"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="my-2 border-b border-gray-200" />

      <div class="-ml-2 mb-4 mt-6 flex items-center text-lg font-bold md:mt-9">
        <div class="mr-2 h-6 w-2 bg-primary" />
        除臭系统
      </div>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="除臭系统时间开启状态"
            label-width="140px"
            label-position="left"
          >
            <div class="flex items-center gap-4">
              <el-button
                type="primary"
                size="mini"
                :disabled="true"
              >
                已开启
              </el-button>
              <el-button
                type="info"
                size="mini"
                :disabled="true"
              >
                已关闭
              </el-button>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="除臭复位"
            label-width="140px"
            label-position="left"
          >
            <el-button
              type="primary"
              size="mini"
              :disabled="true"
            >
              复位
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="除臭开启时间计时"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.deodorizationStartTime"
                :disabled="true"
              />
              <span class="ml-2">分</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="除臭间歇时间计时"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.deodorizationInterval"
                :disabled="true"
              />
              <span class="ml-2">分</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="滤料使用时计时长"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.filterUsageTime"
                :disabled="true"
              />
              <span class="ml-2">时</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="除臭开启时间设定(分)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.deodorizationStartSetting"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="除臭间歇时间设定(分)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.deodorizationIntervalSetting"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="滤料有效时长(时)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.filterLifetime"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="my-2 border-b border-gray-200" />

      <div class="-ml-2 mb-4 mt-6 flex items-center text-lg font-bold md:mt-9">
        <div class="mr-2 h-6 w-2 bg-primary" />
        设备监控系统
      </div>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="累计电量"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.accumulatedPower"
                :disabled="true"
              />
              <span class="ml-2">度</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="水泵电流"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.waterPumpCurrent"
                :disabled="true"
              />
              <span class="ml-2">A</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="风机电流"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.fanCurrent"
                :disabled="true"
              />
              <span class="ml-2">A</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="空压机电流"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.pressurePumpCurrent"
                :disabled="true"
              />
              <span class="ml-2">A</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="来水泵累计时"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.pumpRunningTime"
                :disabled="true"
              />
              <span class="ml-2">时</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="当前电压"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.currentVoltage"
                :disabled="true"
              />
              <span class="ml-2">V</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="水泵声级"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.waterPumpPower"
                :disabled="true"
              />
              <span class="ml-2">分贝</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="风机声级"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.fanPower"
                :disabled="true"
              />
              <span class="ml-2">分贝</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="空压机声级"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.pressurePumpPower"
                :disabled="true"
              />
              <span class="ml-2">分贝</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="运行天数"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.runningDays"
                :disabled="true"
              />
              <span class="ml-2">天</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="运行小时"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.runningHours"
                :disabled="true"
              />
              <span class="ml-2">时</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="当前电流(A)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.currentCurrent"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="当前声级(分贝)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.currentPower"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="日常用电量设置(度)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.dailyPowerConsumption"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="水泵电流高限(A)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.waterPumpCurrentLimit"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="风机电流高限(A)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.fanCurrentLimit"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="空压机电流高限(A)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.pressurePumpCurrentLimit"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="水泵声级高限(分贝)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.waterPumpPowerLimit"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="风机声级高限(分贝)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.fanPowerLimit"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="空压机声级高限(分贝)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.pressurePumpPowerLimit"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="6">
          <el-form-item
            label="设备电流检测时间(分钟)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.deviceCheckInterval"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="设备声级检测时间(分钟)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.deviceSoundCheckInterval"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item
            label="来水泵检测时间设置(时)"
            label-width="140px"
            label-position="left"
          >
            <div class="flex w-full items-center">
              <el-input
                v-model="formData.pumpCheckInterval"
                :disabled="type === 'view'"
              />
              <span class="ml-2 w-12 cursor-pointer text-blue-500">修改</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <EditSubsystem ref="editSubsystem" />
  </div>
</template>

<style lang="scss" scoped>
.el-input {
  width: 130px;
}
</style>
