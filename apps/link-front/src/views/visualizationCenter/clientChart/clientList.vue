<script>
import ClientHead from './clientHead'

export default {
  name: 'ClientList',
  components: { ClientHead },
  props: {
    listData: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
}
</script>

<template>
  <div class="e-list">
    <ClientHead :list="listData.head" />
    <div class="list-block">
      <div
        v-for="(item, index) in listData.list"
        :key="index"
        class="item"
      >
        <el-tooltip
          effect="dark"
          :content="item.name"
          placement="top-start"
        >
          <div class="item-text">
            {{ item.problem }}
          </div>
        </el-tooltip>

        <el-tooltip
          effect="dark"
          :content="item.name"
          placement="top-start"
        >
          <div class="item-text">
            {{ item.name }}
          </div>
        </el-tooltip>

        <el-tooltip
          effect="dark"
          :content="item.time"
          placement="top-start"
        >
          <div class="item-text">
            {{ item.time }}
          </div>
        </el-tooltip>

        <div class="item-text-last">
          {{ item.local }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.e-list {
  width: 100%;
  .list-block {
    overflow: auto;
    height: 68%;

    .item {
      display: flex;
      height: 30px;
      line-height: 30px;

      &:nth-child(2n) {
        background: rgba($color: #0a1e46, $alpha: 0.6);
      }

      .item-text {
        flex: 1;
        text-align: center;
        max-width: calc((100% - 74px) / 3);
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
        padding: 0 8px;
        box-sizing: border-box;

        &-last {
          width: 74px;
          padding: 0 8px;
          box-sizing: border-box;
          text-align: center;
        }
      }
    }
  }
}

::-webkit-scrollbar {
  width: 10px;
  background-color: transparent;
}
/*定义滚动条轨道：内阴影+圆角*/
::-webkit-scrollbar-track {
  background-color: transparent;
}
/*定义滑块：内阴影+圆角*/
::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background-color: transparent;
}
</style>
