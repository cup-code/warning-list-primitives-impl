<script>
import { IconUrl } from './constant'

export default {
  data() {
    return {
      IconUrl,
    }
  },
}
</script>

<template>
  <div class="hidden-dange-msg-bg">
    <div class="dange-title">
      隐患动态
    </div>
    <el-timeline class="time-line-box">
      <el-timeline-item
        v-for="item in 15"
        :key="item"
        type="primary"
      >
        <div class="msg-time">
          2018/4/3
        </div>
        <span class="msg-title">公司名称，用户岗位，用户名称，发现/整改【重大隐患】</span>
        <span class="msg-content">隐患内容</span>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<style lang="scss" scoped>
.hidden-dange-msg-bg {
  height: 100%;
  overflow: hidden;
  overflow-y: auto;
  .dange-title {
    font-weight: bold;
    font-size: 16px;
    margin: 0 0 10px 0;
  }
  .time-line-box {
    padding: 0 0 0 5px;
    .msg-time {
      font-weight: bold;
    }
    .msg-title {
      color: black;
    }
    .msg-content {
      color: #409eff;
    }
    .el-timeline-item__tail {
      border-left: 1px solid var(--ky-primary);
    }
  }
}
</style>
