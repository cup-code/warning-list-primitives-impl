<script>
import WaterLeftOne from './components/waterLeftOne.vue'
import WaterLeftTwo from './components/waterLeftTwo.vue'

const iconPath = require('../../assets/xdy/line.png').default

export default {
  name: 'waterElfEcharts',
  components: {
    WaterLeftOne,
    WaterLeftTwo,
  },
  data() {
    return {
      title: '村水精灵可视化中心',
      iconPath,
    }
  },
}
</script>

<template>
  <div class="waterElfEcharts">
    <div class="header">
      <div class="title">
        {{ title }}
      </div>
      <div class="subtitle">
        <div class="fullName">
          您好，{{ $store.state.user.user.fullName }}
        </div>
        <div class="administrator">
          进入管理中心>>
        </div>
      </div>
    </div>
    <div class="echarts-body">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <div class="panel-item" style="height: 200px">
          <div class="panel-title" :style="`background-image:url(${iconPath});`">
            <span>栅渣情况</span>
          </div>
          <div class="panel-content">
            <WaterLeftOne />
          </div>
        </div>
        <div class="panel-item map-container" style="flex: 1">
          <div class="panel-title" :style="`background-image:url(${iconPath});`">
            <span>药耗情况</span>
          </div>
          <div class="panel-content">
            <WaterLeftTwo />
          </div>
        </div>
      </div>

      <!-- 中间面板 -->
      <div class="center-panel">
        <div class="panel-item">
          <div class="panel-title">
            生产批次安排
          </div>
          <div class="panel-content" />
        </div>
        <div class="panel-item map-container">
          <div class="search-bar">
            <input
              type="text"
              placeholder="民安片区/丹务下村/社区下村2-1"
            >
            <i class="search-icon" />
          </div>
          <div class="panel-content" />
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <div class="panel-item">
          <div class="panel-title">
            设备情况
          </div>
          <div class="panel-content" />
        </div>
        <div class="panel-item">
          <div class="panel-title">
            生化情况
          </div>
          <div class="panel-content" />
        </div>
        <div class="panel-item">
          <div class="panel-title">
            出水情况
          </div>
          <div class="panel-content" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.waterElfEcharts {
  width: 100%;
  height: 100%;
  background-image: url('~@/assets/xdy/bg.jpg');
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 100% 100%;
  display: flex;
  flex-direction: column;

  .header {
    height: 10vh;
    width: 100%;
    position: relative;

    .title {
      width: 40%;
      height: 10vh;
      margin: auto;
      text-align: center;
      background-image: linear-gradient(to top, #4ade80 20%, #feffff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 10vh;
      font-size: 2vw;
      font-family: FZDaHei-B02;
      font-weight: 800;
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3),
        0 0 30px rgba(255, 255, 255, 0.2);
      animation: glow 2s ease-in-out infinite alternate;
    }
    @keyframes glow {
      from {
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3),
          0 0 30px rgba(255, 255, 255, 0.1);
      }
      to {
        text-shadow: 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4),
          0 0 40px rgba(255, 255, 255, 0.2);
      }
    }

    .subtitle {
      position: absolute;
      top: 18px;
      right: 5%;
      display: flex;
      align-items: center;
      color: white;

      .fullName {
        margin-right: 10px;
      }

      .administrator {
        color: #00e7ff;
      }
    }
  }

  .echarts-body {
    flex: 1;
    width: 100%;
    display: flex;
    gap: 20px;
    padding: 20px;
    box-sizing: border-box;

    .left-panel,
    .right-panel,
    .center-panel {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .left-panel {
      width: 25%;
      min-width: 300px;
      .panel-item:first-child {
        height: 40%;
      }
      .map-container {
        flex: 1;
        position: relative;
      }
    }

    .center-panel {
      flex: 1;
      min-width: 500px;
      .panel-item:first-child {
        height: 30%;
      }
      .map-container {
        flex: 1;
        position: relative;
        .search-bar {
          position: absolute;
          left: 50%;
          bottom: 20px;
          transform: translateX(-50%);
          z-index: 1;
          width: 300px;
          height: 40px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 20px;
          display: flex;
          align-items: center;
          padding: 0 15px;

          input {
            flex: 1;
            background: transparent;
            border: none;
            color: white;
            &::placeholder {
              color: rgba(255, 255, 255, 0.7);
            }
          }

          .search-icon {
            width: 20px;
            height: 20px;
            // background: url('~@/assets/xdy/search.png') no-repeat center/contain;
          }
        }
      }
    }

    .right-panel {
      width: 25%;
      min-width: 300px;
      .panel-item {
        flex: 1;
      }
    }

    .panel-item {
      padding: 15px;
      box-sizing: border-box;

      .panel-title {
        width: 100%;
        padding-bottom: 10px;
        display: flex;
        align-items: center;
        background-repeat: no-repeat;
        background-position: center center;
        background-size: 100% 100%;

        span {
          display: inline-block;
          background-image: linear-gradient(to top, #4ade80 20%, #feffff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-family: FZDaHei-B02;
          font-weight: 800;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3),
          0 0 30px rgba(255, 255, 255, 0.1);
          font-size: 15px;
          margin-left: 40px;
        }
      }

      .panel-content {
        //height: calc(100% - 4px);
        height: 100%;
      }
    }
  }
}
</style>
