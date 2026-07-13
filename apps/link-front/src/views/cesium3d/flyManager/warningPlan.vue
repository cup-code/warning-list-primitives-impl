<script>
import { mapActions, mapState } from "vuex";
import LoadingText from "./loadingText.vue";
import { queryRobotAlarmList } from "@/http/machineManage/index";
import { alarmInfoList } from "@/http/machineManage/index";
import { clientWarningList } from "@/http/videoWarning/warning-api";
import { getIORealTimeData } from "@/http/map/gis-map.js";
export default {
  name: "WarningPlan",
  components: {
    LoadingText,
  },
  data() {
    return {
      image: require("../css/step-icon.png"),
      activeStep: 0,
      activeStepInfo: {},
      activeName: "",
      warningIdCounter: 0, // 用于生成唯一的 warning id
      isFinished: false,
      currentItem: -1,
      currentActiveIndex: -1, // 当前正在巡检的步骤索引
    };
  },
  computed: {
    ...mapState("cesium3dStore", ["list", "pointInfo", "currentStep", "inspectionItems"]),
  },
  watch: {
    currentStep: {
      handler(newVal, oldVal) {
        // 防止在 mounted/初始化时和后续watch中都触发，从而执行两次
        // 只在值真正变更之后执行
        if (
          newVal &&
          Object.keys(newVal).length > 0 &&
          (!oldVal || newVal.id !== oldVal.id)
        ) {
          this.activeStep = this.list.findIndex((item) => item.id === newVal.id) || 0;
          setTimeout(() => {
            this.getWarningTestList(this.currentStep);
            this.activeName = this.list[this.activeStep]?.placeName || "";
          }, 2000);
        }
      },
      immediate: false, // 禁用 immediate，避免初始调用
      deep: false,
    },
  },

  methods: {
    ...mapActions("cesium3dStore", [
      "setCurrentStep",
      "getPointInfo",
      "getInspectionItems",
    ]),
    async getWarningTestList(item) {
      const currentPlan = this.list[this.activeStep];
      this.$set(currentPlan, "warningTest", []);
      // 重置当前项索引和激活索引
      this.currentItem = -1;
      this.currentActiveIndex = -1;
      await this.getPointInfo(item.placeId);

      this.$store.commit("cesium3dStore/SET_NON_PROCESS_INFO", []);
      const queue = await this.buildWarningQueue(this.pointInfo.inspectItems);
      // 使“视频智能”排在最后面
      currentPlan.warningTest = queue.sort((a, b) => {
        // “非工艺”在最前面
        if (a.typeName === "非工艺" && b.typeName !== "非工艺") return -1;
        if (a.typeName !== "非工艺" && b.typeName === "非工艺") return 1;
        // “视频智能”排在最后面
        if (a.typeName === "视频智能" && b.typeName !== "视频智能") return 1;
        if (a.typeName !== "视频智能" && b.typeName === "视频智能") return -1;
        return 0;
      });
      await this.setCurrentStep(currentPlan);

      await this.playWarningQueue(queue);

      if (this.activeStep < this.list.length - 1) {
        this.setCurrentStep(this.list[this.activeStep + 1]);
      }

      if (this.activeStep === this.list.length - 1) {
        this.isFinished = true;
        this.activeName = this.list.map((item) => item.placeName);
      }
    },
    async buildWarningQueue(inspectItems = []) {
      const queue = [];
      // 等循环全部结束后再执行 playWarningQueue
      for (const [index, element] of inspectItems.entries()) {
        if (element.typeName !== "视频智能") {
          queue.push({
            typeName: element.typeName,
            pendingText: `${element.typeName}`, //巡检项-类型名称
            itemId: element.itemId, //巡检项-id
            status: "pending", // 状态: pending-待处理, active-巡检中, normal-正常, alarm-报警
          });
          continue;
        }

        await this.getInspectionItems({ id: element.itemId, index: this.activeStep }); // 巡检项摄像头的技能
        this.inspectionItems.skills.split(",").forEach((el) => {
          queue.push({
            typeName: element.typeName,
            pendingText: `${el}`, //巡检项-摄像头技能
            cameraName: element.itemName, //巡检项-摄像头名称
            status: "pending", // 状态: pending-待处理, active-巡检中, normal-正常, alarm-报警
          });
        });
      }
      return queue;
    },
    async playWarningQueue(queue) {
      const { startTime, endTime } = this.getTodayRange();
      for (let index = 0; index < queue.length; index++) {
        const task = queue[index];
        // 设置当前步骤为激活状态
        this.$set(task, "status", "active");
        this.currentActiveIndex = index;
        this.$forceUpdate(); // 强制更新视图

        // 调用接口
        // 每个接口调用等待3秒
        await this.delay(3000);
        await this.requestWarningByTask(task, { startTime, endTime });
      }
      // 所有步骤完成后，重置当前激活索引
      this.currentActiveIndex = -1;
    },
    async requestWarningByTask(task, { startTime, endTime }) {
      let hasAlarm = false; // 是否有报警

      switch (task.typeName) {
        case "视频智能": {
          const res = await clientWarningList({
            pageNum: 1,
            pageSize: 10,
            cameraName: task.cameraName,
            alarmType: task.pendingText,
            alarmDateEnd: endTime,
            alarmDateStart: startTime,
            isPage: false,
          });
          console.log(res, "视频智能");
          const resultInfo = res?.data?.result?.list || [];
          hasAlarm = res?.data?.success && resultInfo.length > 0;
          break;
        }
        case "预测维护": {
          const res = await alarmInfoList({
            pageNum: 1,
            pageSize: 10,
            deviceCode: task.itemId,
            alarmTimeEnd: endTime,
            isPage: false,
            alarmTimeStart: startTime,
          });
          console.log(res, "预测维护");
          const resultInfo = res?.data?.result?.list || [];
          hasAlarm = res?.data?.success && resultInfo.length > 0;
          break;
        }
        case "机器人": {
          const res = await queryRobotAlarmList({
            pageNum: 1,
            pageSize: 10,
            robotCode: task.itemId,
            isPage: false,
            alarmTimeEnd: endTime,
            alarmTimeStart: startTime,
          });
          console.log(res, "机器人");
          const resultInfo = res?.data?.result?.list || [];
          hasAlarm = res?.data?.success && resultInfo.length > 0;
          break;
        }
        case "非工艺": {
          const res = await getIORealTimeData(task.itemId);
          const resultInfo = res?.data?.result || [];
          this.$store.commit("cesium3dStore/SET_NON_PROCESS_INFO", resultInfo);
          break;
        }
        default: {
          // 类型未知时清空
          break;
        }
      }
      // 存在的task返回resultInfo，不存在时已在开头处理
      this.$set(task, "status", hasAlarm ? "alarm" : "normal");
      this.currentItem++;
      this.$forceUpdate(); // 强制更新视图
    },
    getTodayRange() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return {
        endTime: `${year}-${month}-${day} 23:59:59`,
        startTime: `${year}-${month}-${day} 00:00:00`,
      };
    },

    delay(duration) {
      return new Promise((resolve) => {
        setTimeout(resolve, duration);
      });
    },
    // 获取步骤图标颜色类
    getStepIconClass(status) {
      const statusMap = {
        pending: "step-icon-pending", // 默认白色
        active: "step-icon-active animate-spin", // 激活蓝色
        normal: "step-icon-normal", // 正常绿色
        alarm: "step-icon-alarm", // 报警红色
      };
      return statusMap[status] || "step-icon-pending";
    },
    // 获取步骤文案颜色类
    getStepTextClass(status) {
      const baseClass = "text-xs";
      const statusMap = {
        pending: `${baseClass} text-white transition-opacity duration-500 opacity-100`, // 默认白色，添加淡出动画类
        active: `${baseClass} text-blue-400 transition-opacity duration-500 opacity-100`, // 激活蓝色并添加旋转动画和淡出动画类
        normal: `${baseClass} text-green-400 transition-opacity duration-500 opacity-100`, // 正常绿色，添加淡出动画类
        alarm: `${baseClass} text-red-400 transition-opacity duration-500 opacity-100`, // 报警红色，添加淡出动画类
      };
      return statusMap[status] || `${baseClass} text-white`;
    },
    // 获取步骤显示的文案
    getStepText(warning) {
      if (warning.status === "active") {
        return warning.typeName === "非工艺"
          ? `${warning.pendingText}数据查询中...`
          : `${warning.pendingText}检测中...`;
      } else if (warning.status === "normal") {
        return warning.typeName === "非工艺"
          ? `${warning.pendingText}数据查询完成`
          : `${warning.pendingText}正常`;
      } else if (warning.status === "alarm") {
        return `${warning.pendingText}报警`;
      }
      return warning.pendingText;
    },

    getIcon(status) {
      const statusMap = {
        pending: "clock",
        active: "using",
        normal: "badgeCheck",
        alarm: "alarm",
      };
      return statusMap[status] || "clock";
    },
  },
};
</script>

<template>
  <div>
    <div
      class="text-white mb-2 p-1 w-1/3 rounded-sm"
      style="background-image: linear-gradient(30deg, #0f445d 10%, transparent 80%)"
    >
      巡检路线
    </div>

    <div
      class="overflow-auto bg-black/30 rounded-lg h-[54vh]"
      style="scrollbar-width: none"
    >
      <el-collapse v-model="activeName" :accordion="!isFinished">
        <el-collapse-item
          v-for="(item, index) in list"
          :key="item.placeName || `${index}-${item.placeName}`"
          :name="item.placeName"
        >
          <template slot="title">
            <div :class="`relative  flex items-start`">
              <div class="flex flex-col items-start">
                <div
                  :class="`text-sm font-bold
                ${
                  activeStep === index && !isFinished
                    ? 'text-primary-dark-light'
                    : activeStep > index && !isFinished
                    ? 'text-green-400'
                    : isFinished
                    ? 'text-green-400'
                    : 'text-white'
                }
             `"
                >
                  {{ item.placeName }}
                </div>
                <div
                  v-if="activeStep === index && !isFinished"
                  class="text-xs text-gray-400"
                >
                  巡检中...
                </div>
              </div>
            </div>
          </template>

          <el-steps direction="vertical" :active="currentItem">
            <el-step
              v-for="(warning, warningIndex) in item.warningTest"
              :key="warning.itemId || `warning-${index}-${warningIndex}`"
              :title="warning.pendingText"
              style="flex-basis: 10%"
            >
              <template #icon>
                <svg-icon
                  :icon-class="getIcon(warning.status)"
                  :class="getStepIconClass(warning.status)"
                />
              </template>
              <template #title>
                <div :class="getStepTextClass(warning.status)">
                  {{ getStepText(warning) }}
                </div>
              </template>
            </el-step>
          </el-steps>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>

<style scoped lang="scss">
::v-deep .el-collapse {
  border: none !important;
}
::v-deep .el-collapse-item__wrap {
  background: transparent !important;
  border-bottom: none !important;
}
::v-deep .el-collapse-item__header {
  background: transparent;
  padding: 8px 16px !important;
  box-sizing: border-box !important;
  border-bottom: 1px solid #eeeeee3d !important;
}
::v-deep .el-collapse-item:nth-child(2n) .el-collapse-item__header {
  background: #ffffff14; /* 偶数背景色，可自定义 */
}
::v-deep .el-collapse-item:nth-child(2n + 1) .el-collapse-item__header {
  background: #ffffff14; /* 奇数背景色，可自定义 */
}
::v-deep .el-collapse-item__arrow {
  color: #fff !important;
}
::v-deep .el-collapse-item__content {
  padding: 10px 10px 20px !important;
}

::v-deep .el-step__icon {
  background: transparent !important;
  border: none !important;
}

::v-deep .el-step.is-vertical .el-step__main {
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  padding-left: 10px;
  align-items: center;
}

::v-deep .el-step.is-vertical .el-step__title {
  padding-bottom: 0px;
  line-height: 24px;
}

::v-deep .el-step__title.is-finish {
  color: #0bb4c0 !important;
}

::v-deep .el-step.is-vertical .el-step__line {
  display: none !important;
}
.type-info {
  background: url(../css/bg-icon.png) no-repeat;
  background-size: 100% 100%;
  pointer-events: all;
}

.warning-fade-enter-active,
.warning-fade-leave-active {
  transition: all 0.3s ease;
}

.warning-fade-enter-from,
.warning-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

// 当元素位置改变时的过渡（move 过渡）
.warning-fade-move {
  transition: transform 0.3s ease;
}

/* 步骤图标颜色样式 */
.step-icon-pending {
  color: #ffffff !important; /* 默认白色 */
}

.step-icon-active {
  color: #60a5fa !important; /* 激活蓝色 (text-blue-400) */
}

.step-icon-normal {
  color: #4ade80 !important; /* 正常绿色 (text-green-400) */
}

.step-icon-alarm {
  color: #f87171 !important; /* 报警红色 (text-red-400) */
}
</style>
