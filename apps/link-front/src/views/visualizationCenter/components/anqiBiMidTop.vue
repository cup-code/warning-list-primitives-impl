<script>
export default {
  name: 'anqiBiMid',
  props: {
    trainList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  mounted() {},
  beforeDestroy() {},
  // data() {
  //   return {
  //     trainList: [
  //       { count: 35241, icon: require('@/assets/anqiBi/trainTimeIcon.png'), name: '培训总时长(h)', color: '#fde148' },
  //       { count: 6531, icon: require('@/assets/anqiBi/trainPeoIcon.png'), name: '培训总人次', color: '#00ffe4' },
  //       { count: 42, icon: require('@/assets/anqiBi/trainSumIcon.png'), name: '培训总数量', color: '#00ffe4' }
  //     ]
  //   }
  // },
  methods: {},
}
</script>

<template>
  <div class="middle-top">
    <div
      v-for="(item, index) in trainList"
      :key="index"
      class="train-item"
    >
      <div
        class="sort-img"
        :style="`background-image:url(${item.icon});`"
      />
      <div style="width: 7vw; height: 6vh">
        <div
          class="sort-count"
          :style="`color:${item.color}`"
        >
          {{ item.count }}
        </div>
        <div class="sort-title">
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.middle-top {
  width: 40vw;
  height: 8vh;
  display: flex;
  flex-wrap: nowrap;
  margin-top: 10px;
  .train-item {
    width: calc(40vw / 3);
    // width: 12.2vw;
    margin: 0 0.5vw;
    height: 8vh;
    display: flex;
    flex-wrap: wrap;
    .sort-img {
      width: 4.5vw;
      height: 8vh;
      // margin: 0 0.5vw 0 0;
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }
    .sort-count {
      width: 7vw;
      height: 4vh;
      font-size: 1.6vw;
      font-weight: 700;
      font-family: '造字工房力黑';
      text-align: center;
    }
    .sort-title {
      color: #ffffff;
      width: 7vw;
      height: 3vh;
      line-height: 3vh;
      text-align: center;
    }
  }
}
</style>
