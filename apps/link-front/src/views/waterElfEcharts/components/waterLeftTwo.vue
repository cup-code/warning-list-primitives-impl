<script>
export default {
  name: 'waterLeftTwo',
  data() {
    return {
      drugConsumptionData: [
        { name: '碳源', useValue: 256, usableValue: 100, status: 1 },
        { name: '絮凝剂', useValue: 512, usableValue: 30, status: 2 },
        { name: '碳源', useValue: 185, usableValue: 120, status: 3 },
      ],
    }
  },
  methods: {
    getStatusClass(status) {
      return {
        'status-normal': status === 1,
        'status-warning': status === 2,
        'status-error': status === 3,
      }
    },
    getStatusText(status) {
      return status === 1 ? '正常' : status === 2 ? '预警' : '告警'
    },
  },
}
</script>

<template>
  <div class="waterLeftTwo">
    <div class="drug-list">
      <div
        v-for="(item, index) in drugConsumptionData"
        :key="index"
        class="drug-item"
      >
        <div class="info-row">
          <span class="consumption">
            当日{{ item.name }}消耗
            <span class="value">{{ item.useValue }}L</span>
          </span>
          <span class="remaining">
            剩余可用
            <span class="value">{{ item.usableValue }}天</span>
          </span>
        </div>
        <div class="status-row">
          <div
            class="status-dot"
            :class="getStatusClass(item.status)"
          />
          <span class="status-text">药剂剩余{{ getStatusText(item.status) }}</span>
          <i
            v-if="item.status === 3"
            class="warning-icon"
          />
        </div>
      </div>
    </div>
    <div class="" />
  </div>
</template>

<style scoped lang="scss">
.waterLeftTwo {
  padding: 0 20px;
  height: 100%;
  width: 100%;

  .drug-list {
    display: flex;
    flex-direction: column;

    .drug-item {
      .info-row {
        display: flex;
        margin-bottom: 8px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 14px;

        .consumption,
        .remaining {
          .value {
            background: linear-gradient(to top, #ffffff 0%, #4ade80 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 20px;
            font-weight: bold;
            margin-left: 4px;
          }
        }
      }

      .status-row {
        display: flex;
        align-items: center;
        gap: 8px;

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;

          &.status-normal {
            background-color: #4ade80;
          }
          &.status-warning {
            background-color: #fbbf24;
          }
          &.status-error {
            background-color: #ef4444;
          }
        }

        .status-text {
          font-size: 12px;
          &.status-normal {
            color: #4ade80;
          }
          &.status-warning {
            color: #fbbf24;
          }
          &.status-error {
            color: #ef4444;
          }
        }

        .warning-icon {
          display: inline-block;
          width: 16px;
          height: 16px;
          background: url('~@/assets/xdy/warn.png') no-repeat center/contain;
        }
      }
    }
  }
}
</style>
