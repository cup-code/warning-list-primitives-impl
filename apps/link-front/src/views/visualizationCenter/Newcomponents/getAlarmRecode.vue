<script>
import { getAlarmRecord, getAlarmRecordTop10 } from '@/http/videoStat/screenData'

export default {
  name: 'getAlarmRecode',
  components: {},
  props: {
    customStyle: {
      type: String,
      default: '',
    },
    departmentIds: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      videoAlarmList: [],
      activeTab: 'todayAlarm',
      customerStatus: ['待加急处理', '待处理', '有效', '误报'],
    }
  },

  computed: {
    getStatusColor() {
      return (status) => {
        switch (status) {
          case '3':
            return 're  d'
          case '2':
            return 'green'
          case '1':
            return 'white'
          case '0':
            return 'orange'
          default:
            return 'blue' // 默认颜色
        }
      }
    },
    getText() {
      return '暂无预警信息'
    },
  },
  watch: {
    departmentIds: {
      handler(newVal) {
        this.getTodayAlarm()
      },
      immediate: true,
    },
  },
  mounted() {
    this.getTodayAlarm()
  },
  methods: {
    handleRecordClick() {
      this.$router.push({
        path: '/videoOperation/ForeWarningManagement/clientWarningInfoList',
      })
    },
    handleTabClick(tab, event) {
      this.activeTab = tab.name
      if (tab.name === 'todayAlarm') {
        this.getTodayAlarm()
      }
      else {
        this.getTopAlarm()
      }
    },
    getTodayAlarm() {
      getAlarmRecord({ departmentId: this.departmentIds, onlyTodo: false }).then(
        (res) => {
          const { result, code } = res.data
          if (code === 200) {
            this.videoAlarmList = result
          }
        },
      )
    },
    getTopAlarm() {
      getAlarmRecordTop10({
        departmentId: this.departmentIds,
        onlyTodo: false,
        n: 10,
      }).then((res) => {
        const { result, code } = res.data
        if (code === 200) {
          this.videoAlarmList = result
        }
      })
    },
    refreshRecords() {
      if (this.activeTab === 'todayAlarm') {
        this.getTodayAlarm()
      }
      else {
        this.getTopAlarm()
      }
    },
  },
}
</script>

<template>
  <div class="panel" :style="customStyle">
    <div class="flex justify-between">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane
          lazy
          label="今日预警信息"
          name="todayAlarm"
        />
        <el-tab-pane
          lazy
          label="最近10条预警信息"
          name="topAlarm"
        />
      </el-tabs>
      <div class="title-actions">
        <button class="refresh-btn" @click="refreshRecords">
          <svg viewBox="0 0 24 24">
            <path
              d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"
            />
          </svg>
        </button>
      </div>
    </div>

    <div class="record-list">
      <div
        v-for="(record, index) in videoAlarmList"
        :key="index"
        class="record-item"
        @click="handleRecordClick"
      >
        <div class="type">
          {{ record.alarmType }}
        </div>
        <div class="time">
          {{ record.alarmDate }}
        </div>
        <div class="status" :style="{ color: getStatusColor(record.customerStatus) }">
          {{ customerStatus[record.customerStatus] || "未知状态" }}
        </div>
      </div>

      <div v-if="videoAlarmList.length === 0" class="no-data">
        {{ getText }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.panel {
  flex: 1;
  padding: 0.5vw 1vw;
  border-radius: 0.3vw;
  display: block;
  // margin-bottom: 0.7vw;
  border: 0.08vw solid #0a5299;
  background: rgba(0, 21, 41, 0.8);
  overflow: hidden;
  // height: 100%;

  &:last-child {
    margin-bottom: 0;
  }
}

::v-deep .el-tabs__nav-wrap::after {
  display: none !important;
}
::v-deep .el-tabs__item {
  color: #0069b9;
}
::v-deep .el-tabs__item.is-active {
  color: #00f0ff;
}
::v-deep .el-tabs__active-bar {
  background: #00f0ff;
}

h2 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1vw;
  margin-bottom: 0.7vw;
  color: #fff;
  border-bottom: 0.08vw solid rgba(10, 82, 153, 0.8);
  padding-bottom: 0.3vw;
  flex-shrink: 0;
}

h2 span {
  font-weight: 500;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 0.6vw;
  margin-left: auto;
}

.refresh-time {
  font-size: 0.9vw;
  color: rgba(255, 255, 255, 0.65);
  transition: color 0.3s ease;
  font-weight: normal;
  display: none;
}

.refresh-time.active {
  color: #00f0ff;
}

.refresh-btn {
  background: none;
  border: none;
  padding: 0.3vw;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  width: 1.7vw;
  height: 1.7vw;
  background: rgba(0, 21, 41, 0.3);
  border: 0.08vw solid rgba(10, 82, 153, 0.3);
  border-radius: 0.3vw;
}

.refresh-btn:hover {
  transform: rotate(180deg);
  background: rgba(10, 82, 153, 0.3);
  border-color: #00f0ff;
}

.refresh-btn svg {
  width: 1.1vw;
  height: 1.1vw;
  stroke: rgba(255, 255, 255, 0.65);
  stroke-width: 0.15vw;
  fill: none;
}

.refresh-btn:hover svg {
  stroke: #fff;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.refresh-btn.loading {
  animation: rotate 1s linear infinite;
  pointer-events: none;
}

.refresh-btn.loading svg {
  stroke: #00f0ff;
}

button {
  padding: 0.6vw 1.2vw;
  font-size: 1vw;
  cursor: pointer;
  border: none;
  border-radius: 0.3vw;
  color: white;
  transition: background-color 0.3s ease;
  background-color: #0a5299;
  margin: 0.4vw;
}

button:hover {
  background-color: #0a5299;
}
.record-list {
  height: 20vh;
  overflow-y: auto;
  scrollbar-width: none;

  .record-item {
    padding: 0.6vw 0;
    border-bottom: 0.1vw solid rgba(255, 255, 255, 0.1);
    font-size: 1vw;
    display: flex;
    justify-content: space-between;
    color: white;

    .time {
      flex: 0 0 50%;
      color: white;
      text-align: center;
    }

    .type {
      flex: 0 0 25%;
      /* .type 和 .status 元素各占25%宽度 */
      text-align: left;
      /* 可选：居中对齐文本 */
    }

    .status {
      flex: 0 0 25%;
      /* .type 和 .status 元素各占25%宽度 */
      text-align: center;
      /* 可选：居中对齐文本 */
    }

    &:hover {
      background: rgba(0, 240, 255, 0.1);
    }
  }
  .no-data {
    height: 20vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: white;
    font-size: 1vw;
    padding: 0.6vw 0;
  }
}
</style>
