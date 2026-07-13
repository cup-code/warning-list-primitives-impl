<script>
export default {
  name: 'WarningInfo',
  props: {
    item: {
      type: Object,
      default: () => {
        return {}
      },
    },
    customStyle: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
    allType: {
      type: Boolean,
      default: false,
    },
    form: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      level: ['一级', '二级', '三级', '四级'],
    }
  },
  computed: {
    getInfo() {
      return this.filePrefix
    },
    getStatus() {
      return (status) => {
        const statusList = this.$dictUtils.getDictList(this.type)
        let text = ''
        if (this.type !== 'CustomerStatus') {
          text = status !== '0' ? '已审核 |' : ''
        }
        else {
          text = status !== '0' && status !== '1' ? '已处理 |' : ''
        }

        return `${text} ${statusList.find(s => s.dictCode === status)?.dictName}`
      }
    },
    tagType() {
      return (status) => {
        const statusList = this.$dictUtils.getDictList(this.type)

        const code = statusList.find(s => s.dictCode === status)?.dictCode

        const color = {
          0: this.type === 'CustomerStatus' ? 'danger' : 'primary',
          1: this.type === 'CustomerStatus' ? 'primary' : 'danger',
          2: 'success',
          3: 'info',
          4: this.type === 'CustomerStatus' ? undefined : 'info',
          5: 'warning',
        }
        return color[Number(code)] || '--'
      }
    },
    getLevel() {
      return (levels) => {
        return `${this.level[Number(levels) - 1] || '--'}`
      }
    },
  },
  created() {
    this.getPrefix()
  },
  methods: {
    itemTap() {
      const data = {
        detailId: this.item.id,
        type: this.allType ? 'all' : this.type,
        form: this.form,
      }
      this.$emit('itemTap', data)
    },
  },
}
</script>

<template>
  <div class="item" :style="customStyle" @click="itemTap">
    <el-popover placement="bottom" trigger="hover" popper-class="videoAi-pop">
      <img :src="filePrefix + item.alarmPic" style="height: 150px">
      <el-image
        slot="reference"
        fit="fill"
        class="image"
        :src="getInfo + item.alarmPic"
      />
    </el-popover>

    <div class="right">
      <el-tag :type="tagType(item.auditStatus)">
        {{ getStatus(item.auditStatus) }}
      </el-tag>
      <div>
        <i class="el-icon-time" />
        <span>{{ item.alarmDate || "--" }}</span>
      </div>
      <div>
        <i class="el-icon-location-outline" />
        <span>{{ item.cameraName || "--" }}</span>
      </div>
      <div>
        <i class="el-icon-warning-outline" />
        <span>{{ item.alarmType || "--" }}</span>
      </div>

      <div>
        <span>预警等级：</span>
        <span>{{ getLevel(item.alarmLevel) }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item {
  display: flex;
  width: calc((100% - 36px) / 3);
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
    width: 12vw;
    height: calc(((67vh - 30px) / 4) - 13px);
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
