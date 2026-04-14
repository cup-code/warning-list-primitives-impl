<script>
export default {
  data: () => ({
    today: new Date(),
  }),
  methods: {
    testFn(date, data) {
      console.log('*** 点击了 ***')
    },
  },
}
</script>

<template>
  <div class="assetCalendar-eam">
    <el-calendar v-model="today">
      <template
        slot="dateCell"
        slot-scope="{ date, data }"
      >
        <div
          class="self-cell"
          @click="testFn(date, data)"
        >
          <div class="cell-left">
            {{ date.getDate() }}
          </div>
          <div class="cell-right">
            <el-tag
              :type="data.isSelected ? '' : 'info'"
              effect="plain"
            >
              起床, 篮球, 跑步
            </el-tag>
            <el-tag
              :type="data.isSelected ? '' : 'info'"
              effect="plain"
            >
              熬粥, 炒菜
            </el-tag>
            <el-tag
              :type="data.isSelected ? '' : 'info'"
              effect="plain"
            >
              看书
            </el-tag>
          </div>
        </div>
      </template>
    </el-calendar>
  </div>
</template>

<style lang="scss" scoped>
.assetCalendar-eam {
  .is-selected {
    color: #1989fa;
  }
  .self-cell {
    height: 100%;
    display: flex;
    .cell-left {
      font-size: 16px;
      padding-right: 6px;
      width: 20%;
    }
    .cell-right {
      flex: 1;
      overflow: auto;
      display: flex;
      flex-direction: column;
      .el-tag {
        margin: 2px 0;
        width: fit-content;
      }
    }
  }
}
</style>
