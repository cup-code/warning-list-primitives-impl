<script>
export default {
  props: {
    title: {
      type: String,
      default: '',
    },
    refreshTime: {
      type: String,
      default: '60',
    },
    customStyle: {
      type: String,
      default: '',
    },
    isMore: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    handleRefresh() {
      // 触发父组件的 refresh 事件
      this.$emit('refresh')
    },
    onMore() {
      this.$emit('more')
    },
  },
}
</script>

<template>
  <div class="panel" :style="customStyle">
    <h2 v-if="title">
      <span>{{ title }}</span>
      <div class="title-actions">
        <slot name="title-actions" />
        <span class="refresh-time">{{ refreshTime }}</span>
        <button class="refresh-btn" @click="handleRefresh">
          <svg viewBox="0 0 24 24">
            <path
              d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"
            />
          </svg>
        </button>

        <el-button v-if="isMore" type="text" @click="onMore">
          更多<i class="el-icon-d-arrow-right" />
        </el-button>
      </div>
    </h2>
    <slot />
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
</style>
