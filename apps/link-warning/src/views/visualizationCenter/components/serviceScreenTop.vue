<script>
export default {
  name: 'serviceScreenTop',
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
  methods: {},
}
</script>

<template>
  <div class="middle-top">
    <div v-for="(item, index) in trainList" :key="index" class="train-item">
      <!-- <div class="sort-img" :style="`background-image:url(${item.icon});`"></div> -->
      <div style="width: 7vw; height: 6vh">
        <div class="sort-count" :style="`color:${item.color}`">
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
  height: 8vh;
  display: flex;
  flex: 1;
  justify-content: space-around;
  flex-wrap: nowrap;
  margin-top: 10px;
  .train-item {
    width: calc(40vw / 5);
    // width: 12.2vw;
    margin: 0 0.5vw;
    height: 8vh;
    display: flex;
    flex-direction: column;
    align-items: center;
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
      font-family: "造字工房力黑";
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
