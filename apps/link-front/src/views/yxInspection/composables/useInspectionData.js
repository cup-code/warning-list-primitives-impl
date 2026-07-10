import { computed } from "vue";

/**
 * 状态常量定义
 */
export const STAFF_STATUS = {
  ONLINE: "online",       // 在线 - 绿色
  SOS: "sos",             // 在线且报警 - 红色
  OFFLINE: "offline",     // 离线 - 灰色
};

export const POINT_STATUS = {
  NO_CLOCK: "no_clock",
  CURRENT: "current",
  ABNORMAL: "abnormal",
  SOS: "sos",
};

/**
 * 处理人员列表数据
 * @param {Object} params - 参数对象
 * @param {Array} params.userInfoList - 用户信息列表
 * @param {Array} params.taskDetailsList - 任务详情列表
 * @param {string} params.selectedPlanId - 选中的计划ID（用于筛选点位）
 * @returns {Array} 处理后的人员列表
 */
export function processStaffList({ userInfoList = [], taskDetailsList = [], selectedPlanId = null }) {
  // 根据选中的计划筛选任务
  const filteredTasks = selectedPlanId
    ? taskDetailsList.filter((task) => task.scheduleRecordId === selectedPlanId)
    : taskDetailsList;

  return userInfoList.map((user) => {
    const { pointId, pointName } = findUserPointInfo(user.userId, filteredTasks);
    const status = determineUserStatus(user);

    return {
      id: user.userId,
      name: user.userName || "未知人员",
      status,
      isOnline: user.isOnline,
      isSos: user.isSos,
      pointId,
      pointName,
      avatarColor: generateAvatarColor(user.userId || ""),
    };
  });
}

/**
 * 查找用户关联的巡检点（根据最新打卡时间）
 * @param {string} userId - 用户ID
 * @param {Array} taskDetailsList - 任务详情列表
 * @returns {Object} { pointId, pointName, markTime }
 */
function findUserPointInfo(userId, taskDetailsList = []) {
  let pointId = null;
  let pointName = "";
  let latestMarkTime = null;

  for (const task of taskDetailsList) {
    const placeInfoList = task.placeInfoList || [];
    for (const place of placeInfoList) {
      const markInfoList = place.markInfoList || [];
      // 查找该用户的所有打卡记录
      const userMarks = markInfoList.filter((mark) => mark.markUserId === userId);

      userMarks.forEach((mark) => {
        // 比较打卡时间，找到最新的
        const markTime = mark.markTime;
        if (markTime && (!latestMarkTime || new Date(markTime) > new Date(latestMarkTime))) {
          latestMarkTime = markTime;
          pointId = place.placeId;
          pointName = place.placeName;
        }
      });
    }
  }

  return { pointId, pointName, markTime: latestMarkTime };
}

/**
 * 确定用户状态
 * 规则：在线且报警 → 红色 | 在线 → 绿色 | 离线 → 灰色
 * @param {Object} user - 用户信息
 * @returns {string} 状态标识
 */
function determineUserStatus(user) {
  // 在线且报警 → 红色
  if (user.isOnline && user.isSos) {
    return STAFF_STATUS.SOS;
  }
  // 在线 → 绿色
  if (user.isOnline) {
    return STAFF_STATUS.ONLINE;
  }
  // 离线 → 灰色
  return STAFF_STATUS.OFFLINE;
}

/**
 * 生成头像颜色
 * @param {string} seed - 种子字符串
 * @returns {string} 颜色值
 */
function generateAvatarColor(seed) {
  const colors = ["#00D4FF", "#00E396", "#FFD93D", "#FF8C42", "#FF4560", "#775DD0"];
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

/**
 * 计算人员统计
 * @param {Array} staffList - 人员列表
 * @returns {Object} 统计数据 { online, offline, sos }
 */
export function calculateStaffStats(staffList = []) {
  return {
    online: staffList.filter((s) => s.status === STAFF_STATUS.ONLINE).length,
    offline: staffList.filter((s) => s.status === STAFF_STATUS.OFFLINE).length,
    sos: staffList.filter((s) => s.status === STAFF_STATUS.SOS).length,
  };
}

/**
 * 处理任务状态数据
 * @param {Object} taskStatus - 任务状态对象
 * @returns {Object} 处理后的任务状态数据
 */
export function processTaskStatus(taskStatus = {}) {
  const completed = taskStatus.completed || 0;
  const ongoing = taskStatus.ongoing || 0;
  const toStart = taskStatus.toStart || 0;
  const total = completed + ongoing + toStart || 1;

  return {
    completed,
    ongoing,
    toStart,
    completedPct: Math.round((completed / total) * 100),
    ongoingPct: Math.round((ongoing / total) * 100),
    toStartPct: Math.round((toStart / total) * 100),
  };
}

/**
 * 处理地图点位数据
 * @param {Object} params - 参数对象
 * @param {Array} params.taskDetailsList - 任务详情列表
 * @param {string} params.selectedPlanId - 选中的计划ID
 * @param {Array} params.userInfoList - 用户信息列表（用于判断人员位置和SOS状态）
 * @returns {Array} 地图点位列表
 */
export function processMapPoints({ taskDetailsList = [], selectedPlanId = null, userInfoList = [] }) {
  const points = [];

  const filteredTasks = selectedPlanId
    ? taskDetailsList.filter((task) => task.scheduleRecordId === selectedPlanId)
    : taskDetailsList;

  // 构建用户ID到用户信息的映射
  const userMap = new Map();
  userInfoList.forEach((user) => {
    userMap.set(user.userId, user);
  });

  // 构建每个用户的最新打卡位置映射
  const userLatestPlaceMap = buildUserLatestPlaceMap(filteredTasks);

  filteredTasks.forEach((task) => {
    const placeInfoList = task.placeInfoList || [];
    placeInfoList.forEach((place) => {
      const geoInfo = parseGeoInfo(place.geoInfo);
      if (geoInfo?.lng && geoInfo?.lat) {
        // 确定点位状态
        const status = determinePointStatus(place, userMap, userLatestPlaceMap);

        points.push({
          id: place.placeId,
          name: place.placeName,
          lng: geoInfo.lng,
          lat: geoInfo.lat,
          status,
          sortOrder: place.sortOrder,
          data: {
            地点编码: place.placeCode,
            完成率: place.placeCompletionRate,
            已巡检: place.processedContent,
            总计: place.totalContent,
            经度: geoInfo.lng.toFixed(6),
            纬度: geoInfo.lat.toFixed(6),
          },
        });
      }
    });
  });

  return points;
}

/**
 * 构建用户最新打卡位置映射
 * @param {Array} taskDetailsList - 任务详情列表
 * @returns {Map} userId -> { placeId, markTime }
 */
function buildUserLatestPlaceMap(taskDetailsList) {
  const userLatestPlaceMap = new Map();

  taskDetailsList.forEach((task) => {
    const placeInfoList = task.placeInfoList || [];
    placeInfoList.forEach((place) => {
      const markInfoList = place.markInfoList || [];
      markInfoList.forEach((mark) => {
        const userId = mark.markUserId;
        const markTime = mark.markTime;
        const existing = userLatestPlaceMap.get(userId);

        // 如果没有记录或者当前打卡时间更新，则更新映射
        if (!existing || (markTime && new Date(markTime) > new Date(existing.markTime))) {
          userLatestPlaceMap.set(userId, {
            placeId: place.placeId,
            markTime: markTime,
          });
        }
      });
    });
  });

  return userLatestPlaceMap;
}

/**
 * 确定点位状态
 * @param {Object} place - 巡检点信息
 * @param {Map} userMap - 用户ID到用户信息的映射
 * @param {Map} userLatestPlaceMap - 用户最新位置映射
 * @returns {string} 状态标识
 */
function determinePointStatus(place, userMap, userLatestPlaceMap) {
  const markInfoList = place.markInfoList || [];
  const hasClockIn = markInfoList.length > 0;

  // 检查是否有人员最新位置在该点位且报SOS
  let hasSosAtPlace = false;

  markInfoList.forEach((mark) => {
    const userId = mark.markUserId;
    const user = userMap.get(userId);
    const latestPlace = userLatestPlaceMap.get(userId);

    // 判断该用户的最新打卡位置是否是当前点位
    if (latestPlace && latestPlace.placeId === place.placeId) {
      if (user && user.isSos) {
        hasSosAtPlace = true;
      }
    }
  });

  // 1. 红色 - 有人员最新位置在该点位且报SOS（双闪）
  if (hasSosAtPlace) {
    return POINT_STATUS.SOS;
  }

  // 2. 打过卡的情况
  if (hasClockIn) {
    // 黄色 - 有异常
    if (place.abnormal) {
      return POINT_STATUS.ABNORMAL;
    }
    // 绿色 - 不异常
    return POINT_STATUS.CURRENT;
  }

  // 3. 灰色 - 还没有打卡
  return POINT_STATUS.NO_CLOCK;
}

/**
 * 处理执行进度数据（巡检点级别）
 * @param {Object} params - 参数对象
 * @param {Array} params.taskDetailsList - 任务详情列表
 * @param {string} params.selectedPlanId - 选中的计划ID
 * @returns {Array} 执行进度列表
 */
export function processExecutionList({ taskDetailsList = [], selectedPlanId = null }) {
  const points = [];

  const filteredTasks = selectedPlanId
    ? taskDetailsList.filter((task) => task.scheduleRecordId === selectedPlanId)
    : taskDetailsList;

  filteredTasks.forEach((task) => {
    const placeInfoList = task.placeInfoList || [];
    placeInfoList.forEach((place) => {
      const totalContent = place.totalContent || 0;
      const processedContent = place.processedContent || 0;
      const pct = totalContent > 0 ? Math.round((processedContent / totalContent) * 100) : 0;

      // Status logic: abnormal → critical (red), completed → completed (green), pending → in_progress (cyan)
      let status = "in_progress";
      if (place.abnormal) {
        status = "critical";
      } else if (pct === 100) {
        status = "completed";
      }

      points.push({
        id: place.placeId,
        name: place.placeName,
        pct,
        status,
        taskName: task.taskName,
        isOvertime: task.isOvertime,
        overtimeMinutes: task.overtimeMinutes,
      });
    });
  });

  return points;
}

/**
 * 处理异常巡检点数据
 * @param {Object} params - 参数对象
 * @param {Array} params.taskDetailsList - 任务详情列表
 * @param {string} params.selectedPlanId - 选中的计划ID
 * @returns {Array} 异常巡检点列表
 */
export function processAbnormalPoints({ taskDetailsList = [], selectedPlanId = null }) {
  const points = [];

  const filteredTasks = selectedPlanId
    ? taskDetailsList.filter((task) => task.scheduleRecordId === selectedPlanId)
    : taskDetailsList;

  filteredTasks.forEach((task) => {
    const placeInfoList = task.placeInfoList || [];
    placeInfoList.forEach((place) => {
      // 只收集异常的巡检点
      if (place.abnormal) {
        // abnormalStatus: 0-待审核，1-已确认
        const statusText = place.abnormalStatus === "1" ? "已确认" : "待审核";
        const severity = place.abnormalStatus === "1" ? "critical" : "warning";

        points.push({
          id: place.placeId,
          name: place.placeName,
          placeCode: place.placeCode,
          status: place.abnormalStatus, // 0-待审核，1-已确认
          statusText,
          severity,
          taskName: task.taskName,
        });
      }
    });
  });

  return points.slice(0, 5);
}

/**
 * 处理超时任务数据（筛选isOvertime为true的任务）
 * @param {Array} taskDetailsList - 任务详情列表
 * @returns {Array} 超时任务列表
 */
export function processOvertimeTasks(taskDetailsList = []) {
  return taskDetailsList
    .filter((task) => task.isOvertime)
    .map((task) => ({
      id: task.scheduleRecordId,
      title: task.taskName || "巡检任务",
      detail: task.overtimeMinutes > 0 ? `超时 ${task.overtimeMinutes} 分钟` : "已超时",
    }));
}

/**
 * 处理巡检计划下拉选项
 * @param {Array} taskDetailsList - 任务详情列表
 * @returns {Array} 下拉选项列表
 */
export function processTaskOptions(taskDetailsList = []) {
  return taskDetailsList.map((task) => ({
    label: task.taskName,
    value: task.scheduleRecordId,
    scheduleRecordId: task.scheduleRecordId,
  }));
}

/**
 * 解析地理信息
 * @param {string|Object} geoInfo - 地理信息（JSON字符串或对象）
 * @returns {Object|null} { lng, lat }
 */
export function parseGeoInfo(geoInfo) {
  if (!geoInfo) return null;

  try {
    const info = typeof geoInfo === "string" ? JSON.parse(geoInfo) : geoInfo;

    if (info.longitude && info.latitude) {
      return { lng: info.longitude, lat: info.latitude };
    }

    if (info.x !== undefined && info.y !== undefined) {
      return { lng: info.x, lat: info.y };
    }

    if (info.lng !== undefined && info.lat !== undefined) {
      return { lng: info.lng, lat: info.lat };
    }
  } catch (e) {
    console.error("解析地理信息失败:", e);
  }

  return null;
}
