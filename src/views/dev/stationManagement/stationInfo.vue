<script>
import { getCurrentInstance, ref } from 'vue'
import BaseInfo from './baseInfo.vue'

import { tabsList } from './config'
import CurrentTreatment from './currentTreatment.vue'
import DataAnalysis from './dataAnalysis.vue'
import Forecast from './Forecast.vue'
import PositionInformation from './positionInformation.vue'
import StartupParams from './startupParams.vue'
import Subsystem from './subsystem.vue'
import VolumeCalibration from './VolumeCalibration.vue'

export default {
  name: 'StationInfo',
  components: {
    BaseInfo,
    VolumeCalibration,
    StartupParams,
    CurrentTreatment,
    Forecast,
    DataAnalysis,
    PositionInformation,
    Subsystem,
  },
  // props: {
  //   station: {
  //     type: String,
  //     default: "丹务1",
  //   },
  //   type: {
  //     type: String,
  //     default: "view",
  //   },
  // },
  setup() {
    const vm = getCurrentInstance().proxy
    const activeComponent = ref('BaseInfo')

    const onTabClick = (v) => {
      activeComponent.value = v.name
    }

    const onBack = () => {
      vm.$router.back()
    }

    const onSave = () => {}

    return {
      activeComponent,
      onTabClick,
      onBack,
      onSave,
    }
  },
  data() {
    return {
      tabsList,
      station: '丹务1',
      type: 'view',
    }
  },
  watch: {
    activeComponent(newVal) {
      console.log(newVal)
    },
    type(newVal) {
      console.log(newVal)
    },
  },
  created() {
    const { station, type } = this.$route.query
    this.station = station || '默认站点'
    this.type = type || 'view'
  },
}
</script>

<template>
  <div class="page-container">
    <ECard customStyle="min-height: calc(100vh - 73px);margin-bottom: 0px!important">
      <div class="relative px-2">
        <div class="flex absolute top-0 right-0 z-40 justify-end items-center">
          <el-button
            v-if="activeComponent === 'BaseInfo'"
            type="primary"
            size="mini"
            @click="onSave"
          >
            保存
          </el-button>
          <el-button
            type="default"
            size="mini"
            @click="onBack"
          >
            返回
          </el-button>
        </div>
        <el-tabs v-model="activeComponent" @tab-click="onTabClick">
          <el-tab-pane label="基础信息" name="BaseInfo">
            <BaseInfo
              key="BaseInfo"
              :station="station"
              :type="type"
            />
          </el-tab-pane>
          <el-tab-pane label="预警配置" name="StartupParams">
            <StartupParams
              key="StartupParams"
              :station="station"
              :type="type"
            />
          </el-tab-pane>
          <el-tab-pane label="容积标定" name="VolumeCalibration">
            <VolumeCalibration
              key="VolumeCalibration"
              :station="station"
              :type="type"
            />
          </el-tab-pane>
          <el-tab-pane label="部位信息" name="PositionInformation">
            <PositionInformation
              key="PositionInformation"
              :station="station"
              :type="type"
            />
          </el-tab-pane>
          <el-tab-pane label="当前生产" name="CurrentTreatment">
            <CurrentTreatment key="CurrentTreatment" :station="station" />
          </el-tab-pane>
          <el-tab-pane label="预测生产" name="Forecast">
            <Forecast
              key="Forecast"
              :active="activeComponent === 'Forecast'"
              :station="station"
            />
          </el-tab-pane>
          <el-tab-pane label="数据分析" name="DataAnalysis">
            <DataAnalysis
              key="DataAnalysis"
              :active="activeComponent === 'DataAnalysis'"
              :station="station"
            />
          </el-tab-pane>
          <el-tab-pane label="子系统" name="Subsystem">
            <Subsystem
              key="Subsystem"
              :active="activeComponent === 'Subsystem'"
              :station="station"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </ECard>
  </div>
</template>

<style lang="scss" scoped></style>
