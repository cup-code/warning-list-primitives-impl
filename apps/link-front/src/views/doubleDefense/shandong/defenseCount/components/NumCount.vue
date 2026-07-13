<script>
export default {
  props: {
    info: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {}
  },
  computed: {},
}
</script>

<template>
  <!-- 左侧上部数量统计 -->
  <div class="count-num">
    <el-image
      class="card-img"
      :src="info.icon"
    />
    <div class="card-des">
      <div>{{ info.name }}</div>
      <span>
        <span>{{ info.num }}</span>
        {{ info.unit }}
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.count-num {
  display: flex;
  align-items: center;
  min-width: 150px;

  .card-img {
    width: 88px;
    height: 78px;
  }
  .card-des {
    display: flex;
    flex-direction: column;
    align-items: center;
    div {
      font-size: 16px;
      margin: 0 0 5px 0;
    }
    span {
      font-size: 14px;
      span {
        font-weight: bold;
        font-size: 30px;
      }
    }
  }
}
</style>
