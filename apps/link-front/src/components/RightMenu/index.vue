<script>
import QRCode from '@chenfengyuan/vue-qrcode'
import { mapState } from 'vuex'
import logo from '@/assets/logo.png'
import HelpCenter from '@/components/HelpCenter'
import MessageTip from '@/components/MessageTip'
import { getSpecifiedModule } from '@/http/companyConfig/companyConfig-api.js'
import { getServiceConfiguration } from '@/http/manage-api.js'
import { logout } from '@/http/user-api'

export default {
  components: {
    MessageTip,
    HelpCenter,
    QRCode,
  },
  data() {
    return {
      portUrl: '',
      isShowOnePicture: false,
    }
  },
  created() {
    this.getPrefix()
    this.getServiceConfiguration()
    this.getOnePicture()
  },
  computed: {
    ...mapState({
      user: state => state.user.user,
    }),
    logo() {
      return logo
    },
    appUrl() {
      const globalData = JSON.parse(localStorage.getItem('globalData'))
      return globalData.minioFilePrefix + globalData.appDownloadPath
    },
  },

  methods: {
    logout() {
      // 调用登出接口
      logout().then(({ data }) => {
        if (data.success) {
          // 清空storage（仅清除当前标签页，不影响其他标签页）
          sessionStorage.clear()
          // 清空全局状态
          this.$store.dispatch('user/logout')
          // 跳转到 登录页面
          this.$router.push(`/login?redirect=${this.$route.fullPath}`)
        }
        else {
          this.$message.error(data.message)
        }
      })
    },
    toUserCenter() {
      this.$router.push({
        path: `/userCenter/index`,
      })
    },
    goAlarmList() {
      this.$router.push({
        path: `/report/warn`,
      })
    },
    getOnePicture() {
      getSpecifiedModule(this.user.companyId, 'safetyEnvironmentalChart').then((res) => {
        if (res.data.success) {
          const { result } = res.data
          this.isShowOnePicture
            = result.find(s => s.item === 'isShowOnePicture')?.value || false
        }
      })
    },

    getServiceConfiguration() {
      getServiceConfiguration('env').then((res) => {
        this.portUrl = JSON.stringify(res.data.result)
      })
    },
  },
}
</script>

<template>
  <div class="user-right-menu">
    <!-- 消息提醒 -->
    <!--        <el-tooltip content="未处理报警" effect="dark" placement="bottom" :hide-after="500" @click.native="goAlarmList"> -->
    <!--            <message-tip :user="user" class="user-right-menu-item hover-effect" style="font-size: 22px;" /> -->
    <!--        </el-tooltip> -->

    <!-- 帮助中心 -->
    <!-- <el-tooltip :content="$t('.helpCenter')" effect="dark" placement="bottom" :hide-after="500">
            <help-center class="user-right-menu-item hover-effect" style="font-size: 22px;" />
        </el-tooltip> -->

    <!-- 预警中心下拉框 (暂定功能为跳转进入导航大屏) -->
    <router-link
      v-if="user.afterLoginMenu"
      :to="{ path: '/afterLoginMenu' }"
      class="user-right-menu-item hover-effect"
    >
      <span class="warn-center"><i class="el-icon-monitor" />管理驾驶舱</span>
    </router-link>
    <router-link
      v-if="user.buildId && isShowOnePicture"
      :to="{ path: '/map3d' }"
      class="user-right-menu-item hover-effect"
    >
      <span class="warn-center"><i class="el-icon-monitor" />安环一张图</span>
    </router-link>
    <!-- 用户头像下拉框 -->
    <el-dropdown
      class="avatar-container user-right-menu-item hover-effect"
      trigger="click"
    >
      <div class="flex items-center avatar-wrapper">
        <!-- <img :src="user.logo ? user.logo : logo" class="user-avatar"> -->
        <svg-icon class="user-icon" icon-class="user" />
        <span class="user-des">您好，{{ user.fullName }}</span>
        <!-- 下拉三角 -->
        <i class="el-icon-caret-bottom" />
      </div>
      <el-dropdown-menu slot="dropdown" class="user-dropdown">
        <!-- <el-dropdown-item>{{user.username}}</el-dropdown-item> -->
        <el-dropdown-item>{{ user.nickName }}</el-dropdown-item>

        <el-dropdown-item divided @click.native="toUserCenter">
          <span style="display: block">{{ $t("navbar.userCenter") }}</span>
        </el-dropdown-item>
        <el-dropdown-item divided>
          <el-popover
            placement="left"
            width="300"
            trigger="hover"
          >
            <div style="display: flex; flex-direction: column; align-items: center">
              <div style="padding-bottom: 6px; font-weight: bold">
                请扫码下载
              </div>
              <QRCode
                v-if="appUrl"
                :value="appUrl"
                tag="img"
                :options="{ size: 200 }"
              />
              <div
                v-else
                style="
                  width: 200px;
                  height: 200px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #f5f5f5;
                  color: #999;
                "
              >
                加载中...
              </div>
            </div>
            <span slot="reference" style="display: block">APP下载</span>
          </el-popover>
        </el-dropdown-item>
        <el-dropdown-item divided>
          <el-popover
            placement="left"
            width="300"
            trigger="hover"
          >
            <div style="display: flex; flex-direction: column; align-items: center">
              <div style="padding-bottom: 6px; font-weight: bold">
                请扫码获取端口地址
              </div>
              <QRCode
                v-if="portUrl"
                :value="portUrl"
                tag="img"
                :options="{ size: 200 }"
              />
              <div
                v-else
                style="
                  width: 200px;
                  height: 200px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  background: #f5f5f5;
                  color: #999;
                "
              >
                加载中...
              </div>
            </div>
            <span slot="reference" style="display: block">端口地址</span>
          </el-popover>
        </el-dropdown-item>
        <el-dropdown-item divided @click.native="logout">
          <span style="display: block">{{ $t("navbar.logOut") }}</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
</template>

<style lang="scss" scoped>
.user-right-menu {
  // float: right;
  height: 100%;
  line-height: 45px;
  display: flex;
  align-items: center;

  &:focus {
    outline: none;
  }

  .user-right-menu-item {
    display: inline-block;
    padding: 4px 8px;
    // height: 100%;
    font-size: 15px;
    color: #5a5e66;
    // vertical-align: text-bottom;

    &.hover-effect {
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: rgba(0, 0, 0, 0.025);
      }
    }
  }

  .avatar-container {
    margin-right: 0px;
    // padding-right: 0;

    .avatar-wrapper {
      // margin-top: 5px;
      // position: relative;
      // margin: auto;
      .user-avatar {
        cursor: pointer;
        width: 40px;
        height: 40px;
        border-radius: 10px;
      }

      .el-icon-caret-bottom {
        cursor: pointer;
        // position: absolute;
        // right: -20px;
        // top: 25px;
        font-size: 12px;
      }
    }
  }
}
.user-dropdown {
  margin-top: 5px !important;
  padding: 0;
  .el-dropdown-menu__item {
    padding: 10px 20px;
    line-height: normal;
  }
  .el-dropdown-menu__item--divided:before {
    height: 0 !important;
  }
  .el-dropdown-menu__item--divided {
    margin-top: 0 !important;
  }
}
.user-des {
  margin: 0 5px;
  font-size: 12px;
}
.user-icon {
  font-size: 12px;
}
.warn-center {
  border-radius: 5px;
  padding: 10px;
  background: var(--ky-warning);
  i {
    font-weight: bold;
    margin: 0 5px 0 0;
  }
}
</style>
