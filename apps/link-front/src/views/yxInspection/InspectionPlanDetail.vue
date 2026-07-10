<script>
const BaseInfo = () => import("./components/inspectionPlanDetail/BaseInfo");
const MapSet = () => import("./components/inspectionPlanDetail/MapSet");
const ScheduleConfig = () => import("./components/inspectionPlanDetail/ScheduleConfig");
const TaskShifts = () => import("./components/inspectionPlanDetail/TaskShifts");
const InspectionRecord = () =>
  import("./components/inspectionPlanDetail/InspectionRecord");
const MessageSet = () => import("./components/inspectionPlanDetail/MessageSet");

export default {
  name: "YxInspectionPlanDetail",
  components: {
    BaseInfo,
    MapSet,
    ScheduleConfig,
    TaskShifts,
    InspectionRecord,
    MessageSet,
  },
  data: () => ({
    activeIndex: "1",
    method: "", // add/edit/view
    id: "", // 计划id
  }),
  created() {
    this.id = this.$route.params.id;
    this.method = this.$route.params.method;
  },
  methods: {
    changeIndex(idx) {
      this.activeIndex = idx;
    },
    // 更新id（新增保存后）
    updateId(newId) {
      this.id = newId;
      this.$emit("update:id", newId);
    },
  },
};
</script>

<template>
  <div class="page-container plan-detail">
    <ECard>
      <el-row>
        <el-col :span="3">
          <el-menu default-active="1" style="height: 80vh" @select="changeIndex">
            <el-menu-item index="1">
              <span slot="title">基础信息</span>
            </el-menu-item>
            <el-menu-item index="2">
              <span slot="title">计划排班</span>
            </el-menu-item>
            <el-menu-item index="3">
              <span slot="title">任务班次</span>
            </el-menu-item>
            <el-menu-item index="4">
              <span slot="title">巡检记录</span>
            </el-menu-item>
            <el-menu-item index="5">
              <span slot="title">消息提醒</span>
            </el-menu-item>
          </el-menu>
        </el-col>
        <el-col :span="21">
          <!-- 基础信息 -->
          <BaseInfo v-show="activeIndex === '1'" :id.sync="id" :method="method" />
          <!-- 计划排班 -->
          <ScheduleConfig v-if="activeIndex === '2'" :id.sync="id" :method="method" />
          <!-- 任务班次 -->
          <TaskShifts v-if="activeIndex === '3'" :id.sync="id" :method="method" />
          <!-- 巡检记录 -->
          <InspectionRecord v-if="activeIndex === '4'" :id.sync="id" />
          <!-- 消息提醒 -->
          <MessageSet v-show="activeIndex === '5'" :id.sync="id" :method="method" />
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
