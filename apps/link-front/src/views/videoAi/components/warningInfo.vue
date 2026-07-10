<script>
export default {
  name: 'WarningInfo',
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      },
      // filePrefixs: {
      //   type: String,
      //   default: ''
      // }
    },
  },
  computed: {
    getInfo() {
      return this.filePrefix
    },
  },
  created() {
    this.getPrefix()
  },
  methods: {
    itemTap() {
      this.$emit('click')
    },
  },
}
</script>

<template>
  <div class="item" @click="itemTap">
    <el-popover
      placement="bottom"
      trigger="hover"
      popper-class="videoAi-pop"
    >
      <img :src="filePrefix + item.pic" style="height: 150px">
      <el-image
        slot="reference"
        fit="cover"
        class="image"
        :src="getInfo + item.pic"
      />
    </el-popover>

    <div class="right">
      <el-tag
        :type="
          item.auditStatus === '待审核' || item.auditStatus === '待处理'
            ? 'warning'
            : item.auditStatus === '已验收'
              ? 'success'
              : item.auditStatus === '误报'
                ? 'info'
                : 'danger'
        "
      >
        {{ item.auditStatus }}
      </el-tag>
      <div>
        <i class="el-icon-time" />
        <span>{{ item.createdTime }}</span>
      </div>
      <div>
        <i class="el-icon-location-outline" />
        <span>{{ item.camName }}</span>
      </div>
      <div>
        <i class="el-icon-warning-outline" />
        <span>{{ item.alarmInfo }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item {
  display: flex;
  width: calc((100% - 36px) / 3);
  height: calc((67vh - 30px) / 4);
  padding: 8px;
  border: 1px solid var(--ky-border-color);
  border-radius: 6px;
  box-sizing: border-box;
  margin: 0 6px;
  margin-top: 10px;
  overflow: hidden;
  box-sizing: border-box;
  &:nth-child(-n + 3) {
    margin-top: 0;
  }
  .image {
    width: 170px;
    height: 100%;
    border-radius: 6px;
  }

  .right {
    padding-left: 10px;

    & > div {
      padding-top: 6px;
      line-height: 16px;
      display: flex;
      align-items: center;
      i {
        font-weight: bold;
        margin-right: 4px;
      }
      span {
        overflow: auto;
        white-space: nowrap;
        // chrome浏览器隐藏滚动条
        &::-webkit-scrollbar {
          display: none;
        }
        // 火狐浏览器的滚动条隐藏
        scrollbar-width: none;
      }
    }
  }
}
</style>
