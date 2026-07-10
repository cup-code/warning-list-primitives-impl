<script>
import LayoutSettings from './components/LayoutSettings.vue'
import LeaderConfiguration from './components/leaderConfiguration.vue'
import OnePicture from './components/onePicture.vue'
import RemainConfig from './components/remainConfig.vue'
import SpecialWork from './components/specialWork.vue'
import VideoManagement from './components/videoManagement.vue'

export default {
  components: {
    LayoutSettings,
    OnePicture,
    SpecialWork,
    RemainConfig,
    LeaderConfiguration,
    VideoManagement,
  },
  data() {
    return {
      companyName: '', // 所属公司
      companyId: '', // 所属公司id
      activeName: 'first',
      itemCode: 'LayoutSettings',
    }
  },
  mounted() {
    // 获取所属公司
    this.companyName = JSON.parse(sessionStorage.getItem('user')).companyName
    this.companyId = JSON.parse(sessionStorage.getItem('user')).companyId
  },
  methods: {
    handleClick(event) {
      console.log(event)
      switch (event.name) {
        case 'first':
          this.itemCode = 'LayoutSettings' // 基础配置
          break
        case 'second':
          this.itemCode = 'specialWork' // 特殊作业
          break
        case 'third':
          this.itemCode = 'safetyEnvironmentalChart' // 安环一张图
          break
        case 'fourth':
          this.itemCode = 'remainConfig' // 双重预防
          break
        case 'fifth':
          this.itemCode = 'LeaderConfiguration' // 组织架构设置
          break
        case 'sixth':
          this.itemCode = 'VideoManagement' // 视频智能管理
          break
      }
    },
  },
}
</script>

<template>
  <TreeTable :isShowLeft="false">
    <ECard slot="table">
      <div class="text-lg font-medium">
        所属公司：{{ companyName }}
      </div>
      <div class="content">
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane
            v-if="hasBtnPermission('layout_settings')"
            label="基础设置"
            name="first"
          >
            <LayoutSettings
              v-if="itemCode === 'LayoutSettings'"
              :companyId="companyId"
              :itemCode="itemCode"
            />
          </el-tab-pane>
          <el-tab-pane
            v-if="hasBtnPermission('special_work')"
            label="特殊作业"
            name="second"
          >
            <SpecialWork
              v-if="itemCode === 'specialWork'"
              :companyId="companyId"
              :itemCode="itemCode"
            />
          </el-tab-pane>
          <el-tab-pane
            v-if="hasBtnPermission('safety_environmental_chart')"
            label="安环一张图"
            name="third"
          >
            <OnePicture
              v-if="itemCode === 'safetyEnvironmentalChart'"
              :companyId="companyId"
              :itemCode="itemCode"
            />
          </el-tab-pane>
          <el-tab-pane
            v-if="hasBtnPermission('remain_config')"
            label="检验到期提醒设置"
            name="fourth"
          >
            <RemainConfig v-if="itemCode === 'remainConfig'" :companyId="companyId" />
          </el-tab-pane>
          <el-tab-pane
            v-if="hasBtnPermission('leader_configuration')"
            label="组织架构设置"
            name="fifth"
          >
            <LeaderConfiguration
              v-if="itemCode === 'LeaderConfiguration'"
              :companyId="companyId"
              :itemCode="itemCode"
            />
          </el-tab-pane>
          <el-tab-pane
            v-if="hasBtnPermission('video_management')"
            label="视频智能管理"
            name="sixth"
          >
            <VideoManagement
              v-if="itemCode === 'VideoManagement'"
              :companyId="companyId"
              :itemCode="itemCode"
            />
          </el-tab-pane>
        </el-tabs>
      </div>
    </ECard>
  </TreeTable>
</template>

<style scoped lang="scss">
// .page-container {
h2 {
  margin: 0 !important;
}

.content {
  padding: 10px 14px;
  height: 80vh;
}
// }
</style>
