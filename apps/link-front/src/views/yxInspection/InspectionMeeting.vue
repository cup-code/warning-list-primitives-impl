<script>
import { computed, onMounted, ref } from 'vue'
import store from '@/store'
import { useTrtcRoom } from './composables/useTrtcRoom'

const LOCAL_KEY = 'local' // 本地 You 画面的固定 key

export default {
  name: 'InspectionMeeting',
  setup() {
    const localVideoRef = ref(null)
    const room = useTrtcRoom({ localVideoRef })

    // 手动点选固定到大框的画面 key；null = 走自动规则
    const pinnedKey = ref(null)

    // 远端 userId → 显示名：取对端经 TRTC 自定义信令广播来的昵称，取不到回退 userId
    const displayName = userId => room.remoteNames.value[userId] || userId

    const localName = computed(() => {
      const user = store.state.user && store.state.user.user
      return (
        user
        && (user.fullName || user.nickName || user.username || user.name)
      ) || 'You'
    })

    // 把参与者展开成可渲染的画面格：每个远端用户一个「摄像头格」(恒在，无视频也保留以盖图标)，
    // 有屏幕共享再加一个「屏幕格」。micOff 用于盖麦克风关闭图标。
    const tiles = computed(() => {
      const list = []
      for (const u of room.remoteUsers.value) {
        list.push({
          key: room.cameraKey(u.userId),
          kind: 'camera',
          userId: u.userId,
          hasVideo: u.hasVideo,
          micOff: !u.hasAudio,
          name: displayName(u.userId),
        })
        if (u.hasScreen) {
          list.push({
            key: room.screenKey(u.userId),
            kind: 'screen',
            userId: u.userId,
            hasVideo: true,
            micOff: false,
            name: '屏幕共享',
          })
        }
      }
      return list
    })

    // 自动规则下大框占用者：远端屏幕共享优先 → 第一个远端摄像头格（创建者）→ 无（等待）
    const autoKey = computed(() => {
      const screen = tiles.value.find(t => t.kind === 'screen')
      if (screen)
        return screen.key
      const firstCam = tiles.value.find(t => t.kind === 'camera')
      return firstCam ? firstCam.key : null
    })

    // 校验某个 key 当前是否还存在（本地恒在；远端按 tiles）——用于 pin 失效回落
    const keyExists = (key) => {
      if (key === LOCAL_KEY)
        return true
      return tiles.value.some(t => t.key === key)
    }

    // 实际大框 key：手动 pin 仍有效则用 pin，否则走自动规则
    const bigKey = computed(() => {
      if (pinnedKey.value && keyExists(pinnedKey.value))
        return pinnedKey.value
      return autoKey.value
    })

    const isBig = key => bigKey.value === key

    // 大框角标文案：本地用户名 / 屏幕共享 / 创建者（第一个远端摄像头）/ 其他远端用姓名
    const bigLabel = computed(() => {
      const key = bigKey.value
      if (!key)
        return ''
      if (key === LOCAL_KEY)
        return localName.value
      const t = tiles.value.find(x => x.key === key)
      if (!t)
        return ''
      if (t.kind === 'screen')
        return '屏幕共享'
      const firstCam = tiles.value.find(x => x.kind === 'camera')
      return firstCam && firstCam.key === key ? '' : t.name
    })

    // 点小框：点的是当前大框 → 取消固定回自动；否则把它固定到大框
    function spotlight(key) {
      pinnedKey.value = bigKey.value === key ? null : key
    }

    // 通话状态是模块级单例，离开页面不退房（通话后台继续）；返回页面时把画面重新
    // 挂到新渲染的 DOM 容器。未在通话中时 reattachViews 自身早返回，照常显示「进入房间」。
    onMounted(() => room.reattachViews())

    return {
      localVideoRef,
      LOCAL_KEY,
      tiles,
      bigKey,
      isBig,
      bigLabel,
      localName,
      spotlight,
      ...room,
    }
  },
}
</script>

<template>
  <KyTreeTable ref="treeTable" :is-show-left="false" class="h-full">
    <ECard slot="table">
      <!-- 未进房：只显示进入按钮 -->
      <div v-if="!joined" class="meeting__lobby">
        <span class="meeting__lobby-title">{{ roomName || "远程指导" }}</span>
        <el-button type="primary" :loading="entering" @click="enterRoom">
          进入房间
        </el-button>
        <el-alert
          v-if="error"
          class="meeting__error"
          :title="error"
          type="error"
          :closable="false"
          show-icon
        />
      </div>

      <!-- 已进房：单一 stage 网格；大框=加 --big 类（DOM 稳定，切换不重挂 TRTC 画面） -->
      <div v-else class="meeting__room">
        <div class="meeting__stage">
          <!-- 大框为空：等待创建者 -->
          <div v-if="!bigKey" class="meeting__cell meeting__cell--big meeting__waiting">
            等待创建者加入…
          </div>

          <!-- 本地用户 -->
          <div
            class="meeting__cell"
            :class="{ 'meeting__cell--big': isBig(LOCAL_KEY) }"
            title="点击切换到大框"
            @click="spotlight(LOCAL_KEY)"
          >
            <div
              ref="localVideoRef"
              class="meeting__cell-video meeting__cell-video--local"
            />
            <!-- 摄像头关闭：盖图标 -->
            <div v-if="!camOn" class="meeting__media-off">
              <i class="el-icon-video-camera" />
              <span>摄像头已关闭</span>
            </div>
            <span class="meeting__cell-name">
              <i v-if="!micOn" class="el-icon-turn-off-microphone meeting__mic-off" />
              {{ localName }}
            </span>
          </div>

          <!-- 远端：每个用户一个摄像头格(恒在) + 有屏幕共享再加屏幕格 -->
          <div
            v-for="t in tiles"
            :key="t.key"
            class="meeting__cell"
            :class="{ 'meeting__cell--big': isBig(t.key) }"
            title="点击切换到大框"
            @click="spotlight(t.key)"
          >
            <div :id="t.key" class="meeting__cell-video" />
            <!-- 摄像头关闭：盖图标 -->
            <div v-if="!t.hasVideo" class="meeting__media-off">
              <i class="el-icon-video-camera" />
              <span>摄像头已关闭</span>
            </div>
            <span class="meeting__cell-name">
              <i v-if="t.micOff" class="el-icon-turn-off-microphone meeting__mic-off" />
              {{ t.name }}
            </span>
          </div>

          <!-- 大框角标 -->
          <!-- <div v-if="bigKey" class="meeting__badge">
            {{ bigLabel }}
          </div> -->
        </div>

        <!-- 控制条：固定底部居中 -->
        <div class="meeting__controls">
          <button
            class="meeting__ctrl"
            :class="{ 'meeting__ctrl--off': !micOn }"
            title="麦克风"
            @click="toggleMic"
          >
            <i :class="micOn ? 'el-icon-microphone' : 'el-icon-turn-off-microphone'" />
          </button>
          <button
            class="meeting__ctrl"
            :class="{ 'meeting__ctrl--off': !camOn }"
            title="摄像头"
            @click="toggleCam"
          >
            <i class="el-icon-video-camera" />
          </button>
          <button
            class="meeting__ctrl"
            :class="{ 'meeting__ctrl--on': sharing }"
            title="屏幕共享"
            @click="sharing ? stopShare() : startShare()"
          >
            <i class="el-icon-monitor" />
          </button>
          <button
            class="meeting__ctrl meeting__ctrl--leave"
            title="离开房间"
            @click="exitRoom"
          >
            <i class="el-icon-phone" />
          </button>
        </div>

        <!-- 错误浮层 -->
        <el-alert
          v-if="error"
          class="meeting__error meeting__error--float"
          :title="error"
          type="error"
          :closable="false"
          show-icon
        />
      </div>
    </ECard>
  </KyTreeTable>
</template>

<style scoped lang="scss">
/* 未进房 */
.meeting__lobby {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  height: 100%;
  min-height: 320px;
}
.meeting__lobby-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

/* 已进房整体 */
.meeting__room {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 480px;
}

/* 画面舞台：单一网格；大框 = --big（横跨整行、置顶、放大），其余为小格 */
.meeting__stage {
  position: relative;
  flex: 1;
  min-height: 320px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  grid-auto-rows: 110px;
  gap: 8px;
  overflow-y: auto;
  align-content: start;
}
.meeting__cell {
  position: relative;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}
.meeting__cell:hover {
  outline: 2px solid rgba(64, 158, 255, 0.6);
  outline-offset: -2px;
}
/* 大框：横跨所有列、置顶、约 4 行高 */
.meeting__cell--big {
  grid-column: 1 / -1;
  grid-row: span 6;
  order: -1;
  background: #1f1f1f;
}
.meeting__cell-video {
  width: 100%;
  height: 100%;
}
.meeting__cell-video--local {
  display: block;
  object-fit: cover;
}
.meeting__cell-name {
  position: absolute;
  bottom: 6px;
  left: 6px;
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 12px;
  border-radius: 6px;
}

/* 媒体关闭覆盖层（摄像头关闭）：盖在画面容器上，居中图标 + 文字 */
.meeting__media-off {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: #1f1f1f;
  color: rgba(255, 255, 255, 0.7);
}
.meeting__media-off i {
  font-size: 28px;
}
.meeting__media-off span {
  font-size: 12px;
}
.meeting__cell--big .meeting__media-off i {
  font-size: 48px;
}
.meeting__cell--big .meeting__media-off span {
  font-size: 14px;
}
/* 麦克风关闭小图标（名字旁，红色） */
.meeting__mic-off {
  margin-right: 4px;
  color: #f5453f;
}

/* 大框为空时的等待提示 */
.meeting__waiting {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 15px;
  cursor: default;
}

/* 大框角标 */
.meeting__badge {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1;
  padding: 6px 14px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 14px;
  border-radius: 999px;
  backdrop-filter: blur(4px);
}

/* 控制条：固定底部居中 */
.meeting__controls {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 8px;
}
.meeting__ctrl {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border: none;
  border-radius: 50%;
  background: #4b4f57;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  transition: background 0.15s;
}
.meeting__ctrl:hover {
  background: #5b606a;
}
.meeting__ctrl--off {
  background: rgba(244, 67, 54, 0.9);
}
.meeting__ctrl--off:hover {
  background: rgba(244, 67, 54, 1);
}
.meeting__ctrl--on {
  background: #409eff;
}
.meeting__ctrl--leave {
  background: #f5453f;
}
.meeting__ctrl--leave:hover {
  background: #e23b35;
}

/* 错误提示 */
.meeting__error {
  width: 100%;
  margin-top: 8px;
}
.meeting__error--float {
  position: absolute;
  top: 12px;
  left: 50%;
  z-index: 10;
  width: auto;
  transform: translateX(-50%);
}
</style>
