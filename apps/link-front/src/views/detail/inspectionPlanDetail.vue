/* * @Author: xiaorui 巡检计划详情页面 * @Date: 2022-05-07 10:19:11 * @Last Modified by: xiaorui *
@Last Modified time: 2022-05-17 10:09:43 */
<script>
const BaseInfo = () => import('@/components/Detail/inspectionPlan/BaseInfo')
const MapSet = () => import('@/components/Detail/inspectionPlan/MapSet')
const ScheduleConfig = () => import('@/components/Detail/inspectionPlan/ScheduleConfig')
const TaskShifts = () => import('@/components/Detail/inspectionPlan/TaskShifts')
const InspectionRecord = () => import('@/components/Detail/inspectionPlan/InspectionRecord')
const MessageSet = () => import('@/components/Detail/inspectionPlan/MessageSet')
export default {
  components: {
    BaseInfo,
    MapSet,
    ScheduleConfig,
    TaskShifts,
    InspectionRecord,
    MessageSet,
  },
  data: () => ({
    activeIndex: '1',
    method: '', // 判断是增加还是修改
    id: '', // 计划id
  }),
  created() {
    this.id = this.$route.params.id
    this.method = this.$route.params.method
  },
  methods: {
    changeIndex(idx) {
      this.activeIndex = idx
    },
  },
}
</script>

<template>
  <div class="page-container plan-detail">
    <ECard>
      <el-row>
        <el-col :span="3">
          <el-menu
            default-active="1"
            style="height: 80vh"
            @select="changeIndex"
          >
            <el-menu-item index="1">
              <span slot="title">基础信息</span>
            </el-menu-item>
            <el-menu-item index="2">
              <span slot="title">线路设置</span>
            </el-menu-item>
            <el-menu-item index="3">
              <span slot="title">计划排班</span>
            </el-menu-item>
            <el-menu-item index="4">
              <span slot="title">任务班次</span>
            </el-menu-item>
            <el-menu-item index="5">
              <span slot="title">巡检记录</span>
            </el-menu-item>
            <el-menu-item index="6">
              <span slot="title">消息提醒</span>
            </el-menu-item>
          </el-menu>
        </el-col>
        <el-col :span="21">
          <!-- 基础信息 -->
          <BaseInfo
            v-show="activeIndex === '1'"
            :id.sync="id"
            :method="method"
          />
          <!-- 地图选点需关联部门，所以这里用v-if -->
          <MapSet
            v-if="activeIndex === '2'"
            :id.sync="id"
            :method="method"
          />
          <!-- 生成任务班次需判断状态，所以这里用v-if -->
          <ScheduleConfig
            v-if="activeIndex === '3'"
            :id.sync="id"
            :method="method"
          />
          <!-- 任务班次每次都需重新获取，所以这里用v-if -->
          <TaskShifts
            v-if="activeIndex === '4'"
            :id.sync="id"
            :method="method"
          />
          <!-- 巡检记录 -->
          <InspectionRecord
            v-if="activeIndex === '5'"
            :id.sync="id"
          />
          <!-- 消息设置 -->
          <MessageSet
            v-show="activeIndex === '6'"
            :id.sync="id"
            :method="method"
          />
        </el-col>
      </el-row>
    </ECard>
  </div>
</template>

<style lang="scss" scoped>
.plan-detail ::v-deep {
  .el-menu-item {
    height: 30px;
    line-height: 30px;
    margin-top: 3px;
  }
}
</style>
