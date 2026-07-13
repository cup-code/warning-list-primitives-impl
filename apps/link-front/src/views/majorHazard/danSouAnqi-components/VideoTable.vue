<script>
import LivePlayer from '@liveqing/liveplayer'
import JessibucaPlayer from '@/components/JessibucaPlayer/index'
import { videoPlayById } from '@/http/hkAi-api'
import {
  deleteBindCameraById,
  mhsBindCamera,
  mhsBindCameraSave,
} from '@/http/major-hazard/dangerSourceAnqi-api'
import BindCamera from '../components/bindCamera'

export default {
  name: 'VideoTable',
  components: { BindCamera, LivePlayer, JessibucaPlayer },
  props: {
    method: {
      type: String,
      default: '',
    },
    info: {
      type: Object,
      default() {
        return {}
      },
    },
  },
  data() {
    return {
      videoList: [],
      visibleBind: false,
      // 打开前已选的数据
      oldList: [],
      dialog_vid: false,
      title_vid: '摄像头播放',
      videoUrl: '',
    }
  },
  watch: {
    info(v) {
      this.getDataList()
    },
  },
  methods: {
    async getDataList() {
      const { data } = await mhsBindCamera({
        hazardType: this.info.hazardType,
        hazardId: this.info.id,
        companyId: this.info.companyId,
      })
      if (data.code == 200) {
        this.videoList = data.result || []
      }
      else {
        this.videoList = []
      }
    },
    // 绑定摄像头
    bindFn() {
      const params = {
        companyId: this.info.companyId,
        hazardId: this.info.id,
        hazardType: this.info.hazardType,
      }
      mhsBindCamera(params)
        .then(({ data }) => {
          if (data.success) {
            this.oldList = data.result || []
          }
          else {
            this.oldList = []
            this.$message.warning(data.message || '获取已有信息失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取已有信息出错', err)
        })
        .finally(() => {
          this.visibleBind = true
        })
    },
    closeHkA(pickList) {
      if (pickList) {
        const cameraLsitSave = []
        pickList.forEach((item) => {
          cameraLsitSave.push({
            cameraId: item.cameraId,
            companyName: item.companyName,
            companyId: item.companyId,
            hazardId: this.info.id,
          })
        })
        mhsBindCameraSave(cameraLsitSave)
          .then(({ data }) => {
            if (data.success) {
              this.visibleBind = false
              this.$message.success('保存摄像头信息成功')
              this.getDataList()
            }
            else {
              this.$message.warning(data.message || '保存摄像头信息失败')
            }
          })
          .catch((err) => {
            this.$message.error('保存摄像头信息出错', err)
          })
      }
      else {
        this.visibleBind = false
      }
    },
    // 删除
    delFn(v) {
      this.$confirm(`您确认要删除${v.camName}吗？`, '提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          deleteBindCameraById(v.id)
            .then(({ data }) => {
              if (data.success) {
                this.$message.success('删除成功')
                this.getDataList()
              }
              else {
                this.$message.error(data.message || '删除失败!')
              }
            })
            .catch((err) => {
              this.$message.error('删除失败!')
            })
        })
        .catch((e) => {})
    },
    // 播放按钮
    playFn(dt) {
      if (!dt.channelId || !dt.deviceId) {
        this.$message.error('缺少通道编号或者设备编号!')
        return
      }

      videoPlayById(dt.channelId, dt.deviceId)
        .then(({ data }) => {
          if (data.code === 200 && data.result) {
            this.title_vid = dt.camName
            this.dialog_vid = true
            // 读取的是m3u8格式的，用livePlayer播放器
            // this.videoUrl = data.result.hls;

            // 读取的是flv格式的，用JessibucaPlayer播放器
            if (window.g.IS_HTTPS) {
              this.videoUrl = data.result.https_flv
            }
            else {
              this.videoUrl = data.result.flv
            }
          }
          else {
            this.$message.error(data.message || '请求失败!')
          }
        })
        .catch((err) => {
          this.$message.error(err || '请求失败!')
        })
    },
  },
}
</script>

<template>
  <div style="margin: 20px 0">
    <div style="margin: 10px 0">
      <el-button
        type="primary"
        plain
        size="mini"
        @click="bindFn"
      >
        绑定摄像头
      </el-button>
    </div>

    <el-table
      slot="table"
      :data="videoList"
      :header-cell-style="{ background: '#f5f5f5' }"
      align="center"
      height="200"
    >
      <el-table-column
        type="index"
        width="50"
        align="center"
        label="序号"
      />
      <el-table-column
        label="摄像头名称"
        align="center"
        prop="camName"
      />
      <el-table-column
        label="位置"
        align="center"
        prop="camLocation"
      />
      <el-table-column
        label="品牌"
        align="center"
        prop="brand"
      />
      <el-table-column
        v-if="method !== 'view'"
        label="操作"
        min-width="160"
        align="center"
        fixed="right"
      >
        <template
          v-if="method !== 'view'"
          slot-scope="scope"
        >
          <el-button
            type="text"
            @click="playFn(scope.row)"
          >
            查看视频
          </el-button>
          <el-button
            type="text"
            style="color: var(--ky-danger)"
            @click="delFn(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 绑定弹窗 -->
    <el-dialog
      class="normal-dialog"
      title="绑定摄像头"
      :close-on-click-modal="false"

      width="850px"
      :visible.sync="visibleBind"
    >
      <BindCamera
        v-if="visibleBind"
        :oldList="oldList"
        :companyId="info.companyId"
        @close="closeHkA"
      />
    </el-dialog>

    <!-- 播放弹窗 -->
    <el-dialog
      class="normal-dialog edit-dialog video-dialog"
      :title="title_vid"
      :visible.sync="dialog_vid"
      width="50%"
      :close-on-click-modal="false"
      @close="videoUrl = ''"
    >
      <!-- <LivePlayer :videoUrl="videoUrl" fluent autoplay live stretch /> -->
      <JessibucaPlayer
        :id="Math.floor(Math.random() * 10 + 1)"
        :videoUrl="videoUrl"
      />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.normal-dialog.edit-dialog {
  .el-dialog__header {
    min-height: 46px;
    .el-dialog__title {
      font-size: 16px;
      &::before {
        height: 20px;
      }
    }
  }
  .el-dialog__footer {
    padding: 8px 20px;
    border-top: 1px solid #e8e8e8;
    .dialog-footer {
      height: 30px;
    }
  }
  .barSty {
    display: flex;
    align-items: center;
    font-weight: bold;
    margin-bottom: 10px;
    &::before {
      display: inline-block;
      content: '';
      margin-right: 6px;
      width: 5px;
      height: 14px;
      background-color: #409eff;
    }
  }

  // &.video-dialog {
  //     .el-dialog__body {
  //         padding: 0;
  //     }
  //     .player-wrapper {
  //         height: 400px;
  //     }
  //     .video-wrapper {
  //         height: 100%;
  //         padding-bottom: 0 !important;
  //     }
  // }

  &.video-dialog {
    .el-dialog__body {
      padding: 0;
      height: 480px;
    }
  }
}
</style>
