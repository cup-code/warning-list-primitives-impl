<script>
import moment from 'moment'
import { getHomeMessage, updateMessageState } from '@/http/user-api.js'
import MsgDetail from './MsgDetail.vue'

export default {
  components: {
    MsgDetail,
  },
  data() {
    return {
      loadingMsg: false,
      msgList: [], // 消息内容列表
      showMsgDialog: false,
      curMsgData: {}, // 当前阅读的消息内容
    }
  },
  computed: {
    setTimeDate() {
      return function (getTime) {
        return moment(getTime).format('YYYY/MM/DD HH:mm')
      }
    },
  },
  created() {
    this.loadingMsg = true
    getHomeMessage()
      .then((res) => {
        if (res.data.success) {
          this.msgList = res.data.result
        }
        else {
          this.$message.warning(res.data.message || '查询消息列表失败')
        }
      })
      .catch((err) => {
        this.$message.error('查询消息列表出错', err)
      })
      .finally(() => {
        this.loadingMsg = false
      })
  },
  methods: {
    /* 点击查看消息内容 */
    showMsgDetail(item) {
      this.curMsgData = item
      this.showMsgDialog = true
      // 发送已读请求
      if (item.state === 0) {
        const params = { id: item.id, state: 1 }
        updateMessageState(params)
          .then((res) => {
            if (res.data.success) {
              item.state = 1
            }
            else {
              console.log(res.data.message || '请求已读失败')
            }
          })
          .catch((err) => {
            console.log('请求已读出错', err)
          })
      }
    },
  },
}
</script>

<template>
  <div v-loading="loadingMsg">
    <div class="item-img" />
    <div class="item-header">
      <span>消息通知</span>
    </div>
    <div class="msg-notic">
      <div
        v-for="item in msgList"
        :key="item.id"
        class="msg-item"
        :class="item.state == 1 ? '' : 'not-read'"
        @click="showMsgDetail(item)"
      >
        <div class="msg-icon" />
        <div class="msg-date">
          {{ setTimeDate(item.createdTime) }}
        </div>
        <div class="msg-des">
          {{ item.message }}
        </div>
      </div>
    </div>
    <!-- 消息弹窗 -->
    <el-dialog
      :visible.sync="showMsgDialog"
      :close-on-click-modal="false"
      width="600px"
    >
      <MsgDetail :msgData="curMsgData" />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.item-img {
  width: 7px;
  height: 23px;
  background-color: rgba($color: #1195f9, $alpha: 0.8);
  border-radius: 20px;
  margin: 1px 3px 4px 3px;
  float: left;
}

.msg-notic {
  height: calc(100% - 26px);
  width: 100%;
  overflow-y: auto;
  .msg-item {
    width: 100%;
    height: 30px;
    line-height: 30px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    overflow: hidden;
    font-weight: bold;
    color: gray;
    cursor: pointer;
    user-select: none;

    .msg-icon {
      background: gray;
      width: 6px;
      height: 6px;
      margin: 0 5px 0 0;
      border-radius: 50%;
    }
    .msg-date {
      width: 115px;
      height: 100%;
    }
    .msg-des {
      height: 100%;
      width: calc(100% - 130px);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
  .msg-item:hover {
    color: blue;
  }
  .not-read {
    color: black;
    .msg-icon {
      background: lightgreen;
    }
  }
}

.msg-dialog {
  .el-dialog__body {
    padding: 0;
  }
  .el-dialog__header {
    height: 0;
    padding: 0;
  }
}
</style>
