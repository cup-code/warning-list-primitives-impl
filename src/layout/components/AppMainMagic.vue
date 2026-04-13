<script>
// 公共3D底图
// import BaseBg from '@/components/magic/BaseBg.vue'
export default {
  name: 'AppMainMagic',
  components: {
    // BaseBg
  },
  computed: {
    key() {
      return this.$route.path
    },
  },
}
</script>

<template>
  <section class="app-main-magic">
    <!-- 3D 底图 -->
    <base-bg />

    <transition
      name="fade-transform"
      mode="out-in"
    >
      <router-view :key="key" />
    </transition>
  </section>
</template>

<style lang="scss">
.app-main-magic {
  /*50 = navbar  */
  min-height: calc(100vh - 45px);
  width: 100%;
  position: relative;
  overflow: hidden;
  background: #090e16;
  color: #fff;
  .side {
    box-sizing: border-box;
    padding-top: 10px;
    width: 25%;
    height: calc(100vh - 50px);
    background-repeat: no-repeat;
    background-size: 10px 100%;
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    /* justify-content: space-around; */
  }
  .left-con {
    padding-left: 20px;
    left: 0;
    background-image: url('../../assets/magic/imgs/left-bd.png');
  }
  .right-con {
    padding-right: 20px;
    right: 0;
    background-image: url('../../assets/magic/imgs/right-bd.png');
    background-position: 100% 0;
  }
  .side-item {
    box-sizing: border-box;
    /* margin-bottom: 20px; */
    background-size: 100% 100%;
    padding: 8px;
    display: flex;
    flex-direction: column;
  }

  .head-title {
    display: flex;
    align-items: center;
    height: 18px;
    line-height: 18px;
    color: #80a6ef;
    font-size: 12px;
  }
  .head-title > span {
    height: 100%;
  }
  .title-arrow {
    width: 18px;
    background: url('../../assets/magic/imgs/arrow.png');
    background-size: 100% 100%;
  }

  .bd1 {
    background-image: url('../../assets/magic/imgs/border1.png');
  }
  .bd2 {
    background-image: url('../../assets/magic/imgs/border2.png');
  }
  .bd3 {
    background-image: url('../../assets/magic/imgs/border3.png');
  }

  /* 报警列表相关 */
  .table-box {
    margin: 6px;
    position: relative;
  }
  #alert_table {
    background: transparent;
    font-size: 12px;
    position: absolute;
  }
  #alert_table th,
  #alert_table tr {
    background: transparent;
  }
  #alert_table th {
    padding: 0;
    border: none;
    color: #4e77e2;
  }
  #alert_table td {
    padding: 4px 0;
    border-bottom: none;
    color: #fff;
  }
  #alert_table .cell {
    text-align: center;
    white-space: nowrap;
  }
  #alert_table tr:hover td {
    background: #1581ff;
    cursor: pointer;
  }
  .el-table__body-wrapper::-webkit-scrollbar {
    height: 8px;
  }

  /* Magic.vue中用到 */
  .right1-top {
    padding-bottom: 10px;
  }
  .right1-top > div {
    padding: 0 5px;
    margin-right: 10px;
    background: url('../../assets/magic/imgs/small-border.jpg');
    background-size: 100% 100%;
  }

  /* Asset.vue中用到 */
  .l1 {
    flex-direction: row;
  }
  .l1-item {
    flex: 1;
    margin: 10px;
    background: url('../../assets/magic/imgs/small-border.jpg');
    background-size: 100% 100%;
  }
  .l1-item:first-child {
    margin-right: 5px;
  }
  .l1-item:last-child {
    margin-left: 5px;
  }
  .l1-item > div {
    margin: 6px;
  }
  .l1-vol {
    background: url('../../assets/magic/imgs/sty1.png') no-repeat;
    background-position: 0% 50%;
    background-size: 100% 50%;
  }
  .l1-title {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .l1-num {
    font-size: 16px;
  }
  .l1-text {
    transform: scale(0.7);
    width: 142%;
    text-align: center;
  }
  .r2-num,
  .r3-num {
    text-align: center;
    font-size: 13px;
    font-weight: bold;
    color: #7fceea;
  }
  .r3-num {
    color: #7c82d9;
  }

  /* Environment.vue中用到 */
  .fc1 {
    text-align: center;
    font-size: 13px;
    font-weight: bold;
    color: #7c82d9;
  }

  /* Safe.vue中用到 */
  .fsw {
    font-weight: bold;
    font-size: 14px;
  }

  /* 公用样式 */
  .f1 {
    flex: 1;
  }
  .dfr {
    display: flex;
    flex-direction: row;
  }
  .dfc {
    display: flex;
    flex-direction: column;
  }
  .dfrc {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
  }
  .dfcc {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .ft12 {
    font-size: 12px;
  }

  .h15 {
    height: 15%;
  }
  .h20 {
    height: 20%;
  }
  .h24 {
    height: 24%;
  }
  .h25 {
    height: 25%;
  }
  .h30 {
    height: 30%;
  }
  .h35 {
    height: 35%;
  }
  .h40 {
    height: 40%;
  }
  .h50 {
    height: 50%;
  }
  .h55 {
    height: 55%;
  }
}
.fixed-header + .app-main-magic {
  padding-top: 50px;
}
.fixed-header + .app-main-magic .side {
  top: 50px;
}
</style>
