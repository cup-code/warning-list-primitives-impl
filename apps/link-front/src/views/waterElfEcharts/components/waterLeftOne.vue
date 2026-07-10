<script>
export default {
  name: 'waterLeftOne',
  data() {
    return {
      currentValue: 89,
      remainingDays: 100,
    }
  },
}
</script>

<template>
  <div class="waterLeftOne">
    <div class="container-left">
      <div class="title">
        栅渣运行情况
      </div>
      <div class="status-list">
        <div class="status-item">
          <div class="dot normal" />
          <span>正常</span>
        </div>
        <div class="status-item">
          <div class="dot warning" />
          <span>异常</span>
        </div>
        <div class="status-item">
          <div class="dot error" />
          <span>故障</span>
        </div>
      </div>
    </div>

    <div class="info-cards">
      <div class="card">
        <div class="card-content">
          <div class="label">
            当前栅渣量
          </div>
          <div class="value">
            89<span class="unit">L</span>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-content">
          <div class="label">
            格栅剩余可用天数
          </div>
          <div class="value">
            100<span class="unit">天</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.waterLeftOne {
  height: 100%;
  padding:0 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  .container-left {
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .title {
      font-size: 13px;
      color: #fff;
    }
    .status-list {
      display: flex;
      flex-direction: column;
      margin-top:20px;
      .status-item {
        display: flex;
        align-items: center;
        color: #fff;
        font-size: 14px;
        margin-bottom: 10px;

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 16px;

          &.normal {
            background-color: #4ade80;
          }
          &.warning {
            background-color: #fbbf24;
          }
          &.error {
            background-color: #ef4444;
          }
        }
      }
    }
  }

  .info-cards {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-left:20px;

    .card {
      background: url('~@/assets/xdy/gridSlag.png') no-repeat center/100% 100%;
      height: 80px;
      padding: 10px 20px;

      .card-content {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        .label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
          width: 50%;
        }

        .value {
          color: #4ade80;
          font-size: 20px;
          margin-left: 4px;
          font-weight: bold;
          text-shadow: 0 0 10px rgba(74, 222, 128, 0.3);

          .unit {
            font-size: 14px;
            margin-left: 4px;
            opacity: 0.8;
          }
        }
      }
    }
  }
}
</style>
