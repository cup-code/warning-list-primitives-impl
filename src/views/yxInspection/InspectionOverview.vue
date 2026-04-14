<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, watch } from "vue";
import { useRouter } from "vue-router/composables";
import store from "@/store";
import dayjs from "dayjs";
import {
  queryInspectionSummary,
  countAbnormalByState,
} from "@/http/inspection/yx-inspection-api.js";

// 导入模块化数据处理函数
import {
  STAFF_STATUS,
  POINT_STATUS,
  processStaffList,
  calculateStaffStats,
  processTaskStatus,
  processMapPoints,
  processExecutionList,
  processAbnormalPoints,
  processOvertimeTasks,
  processTaskOptions,
  parseGeoInfo,
} from "./composables/useInspectionData.js";

// 导入子组件
import {
  DashboardHeader,
  TaskStatusPanel,
  ViolationPanel,
  PersonnelPanel,
  CenterTopBar,
  MapPanel,
  BottomStats,
  ProgressPanel,
  AbnormalPanel,
} from "./components/overview/index.js";

const router = useRouter();
const mapPanelRef = ref(null);

// 加载状态
const loading = ref(false);

// 总览数据（新接口数据）
const summaryData = ref({
  taskDetailsList: [],
  taskStatus: { completed: 0, ongoing: 0, toStart: 0 },
  userInfoList: [],
});

// 响应式数据
const focusedUserId = ref(null);

// 根据聚焦的用户计算对应的点位ID（用于地图聚焦）
const focusedPointId = computed(() => {
  if (!focusedUserId.value) return null;
  const staff = staffList.value.find((s) => s.id === focusedUserId.value);
  return staff?.pointId || null;
});

// 用户信息和管理中心
const routerList = ref([]);
const isFullscreen = ref(false);
const userInfo = computed(() => store.state.user?.user || {});

// 判断是否为大屏首页（登录后直接进入的页面）
const isBigScreenHome = computed(() => {
  const storedUser = sessionStorage.getItem("user");
  if (!storedUser) return false;
  try {
    const user = JSON.parse(storedUser);
    return user.afterLoginMenu === "views/yxInspection/InspectionOverview";
  } catch {
    return false;
  }
});

// 巡检任务选项（从taskDetailsList生成巡检计划列表）
const taskOptions = computed(() => processTaskOptions(summaryData.value.taskDetailsList));
const selectedPlanId = ref(null);

// 监听taskOptions变化，自动选中第一项
watch(
  taskOptions,
  (newOptions) => {
    if (newOptions.length > 0 && !selectedPlanId.value) {
      selectedPlanId.value = newOptions[0].value;
    }
  },
  { immediate: true }
);

// 任务状态数据（使用总览接口数据）
const taskStatusData = computed(() => processTaskStatus(summaryData.value.taskStatus));

// 超时任务数据（从总览接口taskDetailsList中筛选isOvertime为true）
const overtimeTasks = computed(() =>
  processOvertimeTasks(summaryData.value.taskDetailsList)
);

// 人员状态数据（使用总览接口的userInfoList，根据选中的巡检计划筛选点位）
const staffList = computed(() =>
  processStaffList({
    userInfoList: summaryData.value.userInfoList,
    taskDetailsList: summaryData.value.taskDetailsList,
    selectedPlanId: selectedPlanId.value,
  })
);

// 人员统计
const staffStats = computed(() => calculateStaffStats(staffList.value));

// 地图点位数据（从总览接口taskDetailsList生成，根据选中的scheduleRecordId筛选）
const mapPoints = computed(() =>
  processMapPoints({
    taskDetailsList: summaryData.value.taskDetailsList,
    selectedPlanId: selectedPlanId.value,
    userInfoList: summaryData.value.userInfoList,
  })
);

// 执行进度数据（从总览接口taskDetailsList生成，显示每个巡检点的进度）
const executionList = computed(() =>
  processExecutionList({
    taskDetailsList: summaryData.value.taskDetailsList,
    selectedPlanId: selectedPlanId.value,
  })
);

// 异常巡检点数据（从总览接口taskDetailsList生成，根据选中的scheduleRecordId筛选）
const abnormalPoints = computed(() =>
  processAbnormalPoints({
    taskDetailsList: summaryData.value.taskDetailsList,
    selectedPlanId: selectedPlanId.value,
  })
);

// 异常统计
const abnormalStats = ref({});

// ========== 方法 ==========

// 聚焦用户
function focusUser(userId) {
  if (!userId) return;
  focusedUserId.value = userId;
}

// 人员行点击
function onStaffClick(staff) {
  if (staff.id) {
    focusUser(staff.id);
  }
}

// 进入管理中心
function toManagementCenter() {
  const firstRoute = routerList.value[0];
  navigateToRoute(firstRoute);
}

// 递归导航到路由（与 visualizationCenter Header openDefaultMenu 逻辑一致）
function navigateToRoute(item) {
  let defaultPath = item.path;

  function openDefaultMenu(menuItem) {
    if (menuItem.children && menuItem.children.length > 0) {
      defaultPath += `/${menuItem.children[0].path}`;
      if (menuItem.children[0].query) {
        defaultPath += `?${menuItem.children[0].query}`;
      }
      openDefaultMenu(menuItem.children[0]);
    } else {
      if (menuItem.pageSourceType == 1) {
        router.push(defaultPath);
      } else if (menuItem.pageSourceType == 3) {
        const element = document.createElement("a");
        element.setAttribute("href", menuItem.externalUrl);
        element.setAttribute("target", "_blank");
        element.style.display = "none";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    }
  }

  openDefaultMenu(item);
}

// 全屏切换
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    isFullscreen.value = true;
  } else {
    document.exitFullscreen();
    isFullscreen.value = false;
  }
}

// 监听全屏变化
function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement;
}

// ========== 数据获取方法 ==========

// 获取巡检总览数据（新接口）
async function fetchInspectionSummary() {
  try {
    const { data } = await queryInspectionSummary();
    if (data.success && data.result) {
      summaryData.value = {
        taskDetailsList: data.result.taskDetailsList || [],
        taskStatus: data.result.taskStatus || { completed: 0, ongoing: 0, toStart: 0 },
        userInfoList: data.result.userInfoList || [],
      };
    }
  } catch (error) {
    console.error("获取巡检总览数据失败:", error);
  }
}

// 获取异常统计
async function fetchAbnormalStats() {
  try {
    const today = dayjs();
    const { data } = await countAbnormalByState({
      startDate: today.startOf("day").format("YYYY-MM-DD HH:mm:ss"),
      endDate: today.endOf("day").format("YYYY-MM-DD HH:mm:ss"),
    });

    if (data.success && data.result) {
      const stats = {};
      if (Array.isArray(data.result)) {
        data.result.forEach((item) => {
          stats[item.auditState] = item.count;
        });
      } else {
        stats["0"] = data.result["0"]?.count ?? data.result["0"] ?? 0;
        stats["1"] = data.result["1"]?.count ?? data.result["1"] ?? 0;
        stats["2"] = data.result["2"]?.count ?? data.result["2"] ?? 0;
      }
      abnormalStats.value = stats;
    }
  } catch (error) {
    console.error("获取异常统计失败:", error);
  }
}

// 刷新所有数据
async function refreshAllData() {
  loading.value = true;
  try {
    // 调用新的总览接口
    await fetchInspectionSummary();

    // 其他独立接口
    await Promise.all([fetchAbnormalStats()]);
  } catch (error) {
    console.error("刷新数据失败:", error);
  } finally {
    loading.value = false;
  }
}

// 监听巡检计划选择变化
watch(selectedPlanId, (newPlanId, oldPlanId) => {
  // 切换计划时，取消聚焦和人员选中状态
  if (oldPlanId !== undefined && newPlanId !== oldPlanId) {
    focusedUserId.value = null;
  }
});

onMounted(() => {
  const storedRouterList = JSON.parse(sessionStorage.getItem("routerList") || "[]");
  if (storedRouterList.length > 0) {
    routerList.value = storedRouterList.slice(0, 6);
  }

  document.addEventListener("fullscreenchange", handleFullscreenChange);

  refreshAllData();
});

onUnmounted(() => {
  document.removeEventListener("fullscreenchange", handleFullscreenChange);
});
</script>

<template>
  <div class="inspection-dashboard">
    <!-- Header -->
    <DashboardHeader
      :user-name="userInfo.fullName || '用户'"
      :is-fullscreen="isFullscreen"
      :is-big-screen-home="isBigScreenHome"
      @fullscreen-toggle="toggleFullscreen"
      @enter-management="toManagementCenter"
    />

    <!-- Main Content -->
    <main class="dashboard-content">
      <!-- Left Column -->
      <aside class="column-left">
        <TaskStatusPanel
          :completed="taskStatusData.completed"
          :ongoing="taskStatusData.ongoing"
          :to-start="taskStatusData.toStart"
        />
        <ViolationPanel :tasks="overtimeTasks" />
        <PersonnelPanel
          :staff-list="staffList"
          :staff-stats="staffStats"
          :focused-user-id="focusedUserId"
          @staff-click="onStaffClick"
        />
      </aside>

      <!-- Center Column -->
      <section class="column-center">
        <CenterTopBar
          :online-count="summaryData.taskDetailsList.length"
          :task-options="taskOptions"
          :selected-plan-id="selectedPlanId"
          @plan-change="(val) => (selectedPlanId = val)"
        />
        <MapPanel
          ref="mapPanelRef"
          :points="mapPoints"
          :focused-point-id="focusedPointId"
          @point-focus="
            (pointId) => {
              /* 地图点击不反向设置用户ID */
            }
          "
        />
        <!-- <BottomStats :overview-data="overviewData" :point-stats="pointStats" /> -->
      </section>

      <!-- Right Column -->
      <aside class="column-right">
        <ProgressPanel :list="executionList" :task-count="executionList.length" />
        <AbnormalPanel :points="abnormalPoints" :stats="abnormalStats" />
      </aside>
    </main>
  </div>
</template>

<style scoped>
/* ===== 基础样式 ===== */
.inspection-dashboard {
  --bg-primary: #0b1120;
  --bg-panel: #111b2e;
  --bg-panel-header: #0d1829;
  --accent-cyan: #00d4ff;
  --accent-green: #00e396;
  --accent-red: #ff4560;
  --accent-yellow: #ffd93d;
  --accent-orange: #ff8c42;
  --accent-blue: #4a90d9;
  --text-primary: #ffffff;
  --text-secondary: #8b9dc3;
  --text-muted: #4a5f85;
  --border-accent: #00d4ff;
  --border-dim: #1e3050;
  --progress-bg: #1a2740;

  background: var(--bg-primary);
  min-height: calc(100vh - 120px);
  padding: 0;
  padding-bottom: 12px;
  font-family: "Geist", "Inter", -apple-system, sans-serif;
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
  min-height: calc(-45px + 100vh);
  display: flex;
  flex-direction: column;
}

/* 背景网格 */
.inspection-dashboard::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(rgba(0, 212, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 212, 255, 0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  pointer-events: none;
  z-index: 0;
}

.inspection-dashboard > * {
  position: relative;
  z-index: 1;
}

/* ===== Main Layout ===== */
.dashboard-content {
  display: grid;
  grid-template-columns: 340px 1fr 340px;
  gap: 12px;
  margin-top: 12px;
  padding: 0 16px;
  min-height: calc(100vh - 200px);
  height: calc(100vh - 200px);
  flex: 1;
}

.column-left,
.column-right {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.column-center {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.column-center > * {
  flex-shrink: 0;
}

.column-center > :nth-child(2) {
  flex: 1;
  min-height: 0;
}
</style>
