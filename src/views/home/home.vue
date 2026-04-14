<script>
import moment from 'moment'
import ChangesImplementationLoading from './components/changesImplementationLoading.vue'
import CommonFunc from './components/CommonFunc.vue'
import MsgNotic from './components/MsgNotic.vue'
import TeamWork from './components/TeamWork.vue'

export default {
  components: {
    CommonFunc,
    MsgNotic,
    TeamWork,
    ChangesImplementationLoading,
  },
  data() {
    return {
      showPeopleDialog: false,
      changeFactParams: {},
      dateDes: '', // 日期内容
      weekList: ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      companyRecordInfo: '',
    }
  },
  computed: {
    setHeight() {
      const settings = this.$store.state.settings
      let height = '50px'
      if (settings.tagModel && settings.layout !== 'lr') {
        height = '100px'
      }
      return height
    },
  },
  created() {
    this.getDateDes()
    this.companyRecordInfo = JSON.parse(localStorage.getItem('globalData')).companyRecordInfo || ''
  },
  methods: {
    getDateDes() {
      const nowDate = new Date()
      const dateContent = moment(nowDate).format('YYYY年MM月DD日')
      const week = moment(nowDate).day()
      const weekContent = this.weekList[week]
      this.dateDes = dateContent + weekContent
    },
    changeFactData(data) {
      this.changeFactParams.applyId = data.applyId
      this.changeFactParams.contentId = data.contentId
      this.changeFactParams.todoTaskId = data.taskId
      this.showPeopleDialog = data.isShow
    },
    closeLoading(e) {
      this.showPeopleDialog = e
      location.reload()
    },
  },
}
</script>

<template>
  <KyTreeTable :isShowLeft="false">
    <ECard slot="table">
      <div class="home-bg flex flex-col px-3">
        <!-- 标题 -->
        <div class="home-header mb-4">
          <div class="home-welcome">
            您好，{{ $store.state.user.user.fullName }}
          </div>
          <div class="home-date">
            今天是{{ dateDes }}，欢迎回到{{ $store.state.user.user.companyName }}管控平台
          </div>
        </div>
        <div class="home-body">
          <!-- 第一栏 常用功能 消息通知 -->
          <div class="home-daily">
            <!-- 常用功能 -->
            <!-- <CommonFunc class="home-func" /> -->
            <!-- 消息通知 -->
            <MsgNotic class="home-msg" />
          </div>
          <!-- 第二栏 协同工作 -->
          <TeamWork
            class="team-work"
            @changeFactData="changeFactData"
          />
        </div>

        <!-- 公司信息 -->
        <div class="home-footer">
          {{ companyRecordInfo }}
        </div>
      </div>
    </ECard>

    <el-dialog
      slot="diallog"
      class="fixed-dialog"
      title="变更事项落实"
      :visible.sync="showPeopleDialog"
      width="800px"
      append-to-body
      :close-on-click-modal="false"
    >
      <ChangesImplementationLoading
        v-if="showPeopleDialog"
        :changeFactParams="changeFactParams"
        @closeLoading="closeLoading"
      />
    </el-dialog>
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.home-bg {
  // padding: 10px 15px 0 15px;
  // background: #f6fafe;
  // display: flex;
  // flex-direction: column;

  .home-header {
    // height: 50px;
    .home-welcome {
      font-weight: bold;
      font-size: 20px;
      margin: 0 0 4px 0;
    }
    .home-date {
      font-size: 15px;
    }
  }

  .home-body {
    height: calc(100vh - 220px);
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 26px;
      span {
        font-size: 18px;
        font-weight: bold;
      }
      i {
        font-size: 14px;
        font-style: normal;
        color: black;
        user-select: none;
        cursor: pointer;
      }
    }
  }

  .home-daily {
    height: 46%;
    margin: 0 0 14px 0;
    display: flex;
    justify-content: space-between;
    border: 1px solid var(--ky-border-color);
    border-radius: 6px;
    overflow: hidden;
    .home-func {
      overflow: hidden;
      width: calc(50% - 10px);
      padding: 10px;
    }
    .home-msg {
      flex: 1;
      overflow: hidden;
      width: calc(50% - 10px);
      padding: 10px;
    }
  }
  .team-work {
    width: 100%;
    height: 60%;
    padding: 10px 10px 5px 10px;
    border: 1px solid var(--ky-border-color);
    border-radius: 6px;
    overflow: hidden;
  }
  .home-footer {
    height: 30px;
    font-weight: bold;
    color: #6b6e71;
    font-size: 12px;
    line-height: 30px;
    text-align: center;
  }
}
</style>
