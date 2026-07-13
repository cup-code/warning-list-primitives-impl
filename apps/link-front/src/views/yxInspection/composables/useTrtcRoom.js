import TRTC from 'trtc-sdk-v5'
import { nextTick, ref } from 'vue'
import { getInspectionRoom, getInspectionUserSign } from '@/http/inspection/inspection-room-api'
import store from '@/store'

/**
 * 远程指导房间 —— TRTC 生命周期响应式封装（模块级单例）
 *
 * 把 TRTC 的命令式 + 事件式 API 包成「响应式状态 + 方法」：页面只读状态、调方法，不直接接触 TRTC 细节。
 *
 * 关键点：
 * - 客户端 trtc 与所有状态都提升到「模块作用域单例」，活得比组件久：切走路由/组件卸载后通话仍在后台
 *   继续；返回页面调 reattachViews() 把画面重挂到新渲染的 DOM。只有挂断按钮调 exitRoom 才真正退房。
 * - 远端按「参与者」维护：每个远端用户记 hasVideo/hasAudio/hasScreen；关摄像头/麦克风只改状态、保留
 *   该用户，页面据此盖「已关闭」图标，而不是移除画面格。
 * - 昵称：TRTC 无原生昵称字段，用自定义信令(cmdId=1)让每端广播自己 fullName，对端按 userId 存 remoteNames。
 *
 * @param {object} opts
 * @param {import('vue').Ref<HTMLElement>} opts.localVideoRef 本地画面容器
 */

// ---- 模块级单例：跨组件挂载/卸载存活 ----
let trtc = null // 惰性创建的 TRTC 客户端
let listenersBound = false // 事件是否已绑定（只绑一次）
let localViewRef = { value: null } // 本地画面容器 ref，每次组件挂载更新指向当前 DOM

// ---- 响应式状态（页面读）----
const entering = ref(false) // 进房请求进行中
const joined = ref(false) // 已进房
const camOn = ref(true) // 本地摄像头开启
const micOn = ref(true) // 本地麦克风开启
const sharing = ref(false) // 正在屏幕共享
const remoteUsers = ref([]) // 远端参与者 [{ userId, hasVideo, hasAudio, hasScreen }]，驱动页面 v-for
const remoteNames = ref({}) // 远端 userId → 昵称，来自对端自定义信令广播（见 handleCustomMessage）
const roomName = ref('') // 房间名称（展示）
const error = ref(null) // 最近一次错误信息

// ---- 远端流类型 & DOM key 约定（摄像头=主流、屏幕共享=辅流）----
const MAIN = TRTC.TYPE.STREAM_TYPE_MAIN
const SUB = TRTC.TYPE.STREAM_TYPE_SUB
const cameraKey = userId => `${userId}_${MAIN}` // 摄像头格 DOM id / spotlight key
const screenKey = userId => `${userId}_${SUB}` // 屏幕共享格 DOM id / spotlight key

// ---- 昵称广播：TRTC 无原生昵称字段，用自定义信令让每端自报姓名（与 Android 同协议）----
// 约定 cmdId=1 表示「昵称广播」，data 为 JSON 信封 {"name":"张三"} 的 UTF-8 字节
const NAME_CMD_ID = 1
function broadcastSelfName() {
  const name = store.state.user && store.state.user.user && store.state.user.user.fullName
  if (!name || !trtc)
    return
  try {
    trtc.sendCustomMessage({ cmdId: NAME_CMD_ID, data: new TextEncoder().encode(JSON.stringify({ name })).buffer })
  }
  catch {}
}
function handleCustomMessage({ userId, cmdId, data }) {
  if (cmdId !== NAME_CMD_ID)
    return
  try {
    const { name } = JSON.parse(new TextDecoder().decode(data))
    if (name)
      remoteNames.value = { ...remoteNames.value, [userId]: name }
  }
  catch {}
}

// ---- 参与者模型：按「房间里的人」维护，摄像头/麦克风/屏幕各自开关状态 ----
// 进房(ENTER)默认音视频都关；随后 *_AVAILABLE 事件把对应状态置开。关闭时**保留**该用户
// （hasVideo/hasAudio=false），页面据此盖「摄像头/麦克风已关闭」图标，而不是移除其画面格。
function findUser(userId) {
  return remoteUsers.value.find(u => u.userId === userId)
}
function upsertUser(userId) {
  let u = findUser(userId)
  if (!u) {
    u = { userId, hasVideo: false, hasAudio: false, hasScreen: false }
    remoteUsers.value.push(u)
  }
  return u
}
function handleUserEnter({ userId }) {
  upsertUser(userId)
  // 有新人进房：重播一次自己的名字，确保对方收到（自定义消息只发给发送那刻已在房的人）
  broadcastSelfName()
}
function handleUserExit({ userId }) {
  const idx = remoteUsers.value.findIndex(u => u.userId === userId)
  if (idx !== -1)
    remoteUsers.value.splice(idx, 1)
}
function handleRemoteVideoAvailable({ userId, streamType }) {
  const u = upsertUser(userId)
  const screen = streamType === SUB
  if (screen)
    u.hasScreen = true
  else
    u.hasVideo = true
  // 等 DOM 渲染好（nextTick）→ 把远端画面挂到对应容器（摄像头 or 屏幕）
  nextTick(() => {
    try {
      trtc.startRemoteVideo({ userId, streamType, view: screen ? screenKey(userId) : cameraKey(userId) })
    }
    catch {}
  })
}
function handleRemoteVideoUnavailable({ userId, streamType }) {
  const u = findUser(userId)
  if (!u)
    return
  // 关摄像头/停共享：只改状态、保留该用户。SDK 自动停播，无需 stopRemoteVideo
  if (streamType === SUB)
    u.hasScreen = false
  else
    u.hasVideo = false
}
function handleRemoteAudioAvailable({ userId }) {
  upsertUser(userId).hasAudio = true
}
function handleRemoteAudioUnavailable({ userId }) {
  const u = findUser(userId)
  if (u)
    u.hasAudio = false
}
function handleScreenShareStopped() {
  // 浏览器原生停止共享时，同步本端状态
  sharing.value = false
}

// 把 getUserMedia/TRTC 推流错误转成面向用户的文案：区分「未授权」「找不到设备」「其它」
// 用于 enterRoom 推流失败时给明确提示，而非笼统的「进入房间失败」
function mediaErrMsg(e, label) {
  const name = (e && e.name) || ''
  const msg = (e && e.message) || String(e || '')
  if (/LOCAL_VIDEO_VIEW_NOT_READY/i.test(`${name} ${msg}`))
    return `${label}预览容器未就绪`
  if (/NotAllowed|Permission|Security|denied/i.test(`${name} ${msg}`))
    return `${label}未授权`
  if (/NotFound|DevicesNotFound|Overconstrained/i.test(`${name} ${msg}`))
    return `未检测到${label}`
  return `${label}开启失败`
}

function waitForAnimationFrame() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(resolve)
      return
    }
    setTimeout(resolve, 16)
  })
}

function isUsableView(view) {
  if (!view)
    return false
  if (view.isConnected === false)
    return false
  if (typeof view.getBoundingClientRect !== 'function')
    return true
  const rect = view.getBoundingClientRect()
  return rect.width > 0 && rect.height > 0
}

async function waitForLocalView() {
  for (let i = 0; i < 20; i += 1) {
    await nextTick()
    const view = localViewRef.value
    if (isUsableView(view))
      return view
    await waitForAnimationFrame()
  }
  const view = localViewRef.value
  if (isUsableView(view))
    return view
  const err = new Error('LOCAL_VIDEO_VIEW_NOT_READY')
  err.name = 'LOCAL_VIDEO_VIEW_NOT_READY'
  throw err
}

async function startLocalCamera() {
  const view = await waitForLocalView()
  await trtc.startLocalVideo({
    view,
    option: {
      fillMode: 'cover',
      mirror: 'view',
    },
  })
}

// ---- 惰性创建客户端 + 绑事件（只绑一次，跨组件复用同一份）----
function ensureClient() {
  if (!trtc)
    trtc = TRTC.create()
  if (!listenersBound) {
    trtc.on(TRTC.EVENT.REMOTE_USER_ENTER, handleUserEnter)
    trtc.on(TRTC.EVENT.REMOTE_USER_EXIT, handleUserExit)
    trtc.on(TRTC.EVENT.REMOTE_VIDEO_AVAILABLE, handleRemoteVideoAvailable)
    trtc.on(TRTC.EVENT.REMOTE_VIDEO_UNAVAILABLE, handleRemoteVideoUnavailable)
    trtc.on(TRTC.EVENT.REMOTE_AUDIO_AVAILABLE, handleRemoteAudioAvailable)
    trtc.on(TRTC.EVENT.REMOTE_AUDIO_UNAVAILABLE, handleRemoteAudioUnavailable)
    trtc.on(TRTC.EVENT.CUSTOM_MESSAGE, handleCustomMessage)
    trtc.on(TRTC.EVENT.SCREEN_SHARE_STOPPED, handleScreenShareStopped)
    listenersBound = true
  }
  return trtc
}

// ---- 方法（页面调）----
async function enterRoom() {
  if (entering.value || joined.value)
    return
  error.value = null
  entering.value = true
  try {
    ensureClient()

    // 1. 当前登录用户 id —— 房间内唯一标识
    const userId = store.state.user && store.state.user.user && store.state.user.user.id

    if (!userId)
      throw new Error('未获取到登录用户信息，请重新登录')

    // 2. 环境检测
    const support = await TRTC.isSupported()
    if (!support.result)
      throw new Error('当前浏览器不支持音视频通话，请使用桌面版 Chrome')

    // 3. 房间信息（appId、字符串 roomId、roomName）
    const { data: roomData } = await getInspectionRoom()
    if (!roomData || !roomData.success)
      throw new Error((roomData && roomData.message) || '获取房间信息失败')
    const room = roomData.result
    if (!room || !room.appId || !room.roomId)
      throw new Error('房间信息不完整')
    roomName.value = room.roomName || ''

    // 4. 进房签名（后端签发）
    const { data: signData } = await getInspectionUserSign(userId)
    if (!signData || !signData.success)
      throw new Error((signData && signData.message) || '获取用户签名失败')
    const userSig = signData.result
    if (!userSig)
      throw new Error('用户签名为空')

    // 5. 进房（后端把房间号序列化成字符串返回，但 TRTC 与移动端用的是数字房间号，须 Number 转换）
    const roomId = Number(room.roomId)
    if (!Number.isInteger(roomId) || roomId <= 0)
      throw new Error('房间号无效，需为数字房间号')
    await trtc.enterRoom({
      sdkAppId: Number(room.appId),
      roomId,
      userId,
      userSig,
    })
    joined.value = true

    // 进房成功，立刻广播自己的名字（房间里已有的人收到）；新人后续进房由 REMOTE_USER_ENTER 重播覆盖
    broadcastSelfName()

    // 等舞台容器（v-if="joined"）渲染出来，localVideoRef 才挂得到 DOM
    await nextTick()

    // 6. 推本地摄像头 + 麦克风：各自独立、各自容错。
    //    首次调用浏览器弹授权框；若用户拒绝/此前被拒/无设备，对应 start 会抛错。
    //    不阻断进房（无摄像头/麦克风也能进），只把 camOn/micOn 置 false（页面盖「已关闭」图标）+ 给明确提示。
    let camMsg = ''
    let micMsg = ''
    try {
      await startLocalCamera()
      camOn.value = true
    }
    catch (e) {
      camOn.value = false
      camMsg = mediaErrMsg(e, '摄像头')
    }
    try {
      await trtc.startLocalAudio()
      micOn.value = true
    }
    catch (e) {
      micOn.value = false
      micMsg = mediaErrMsg(e, '麦克风')
    }
    if (camMsg || micMsg) {
      error.value = `${[camMsg, micMsg].filter(Boolean).join('；')}。请在浏览器地址栏权限设置中允许后，离开房间重新进入。`
    }
  }
  catch (e) {
    // 进房本身失败时 joined 仍为 false；若已进房但推流失败，保留 joined 以便用户离开/重试
    error.value = (e && e.message) || '进入房间失败'
  }
  finally {
    entering.value = false
  }
}

async function exitRoom() {
  if (!joined.value)
    return
  // 停本地采集（各自容错，确保后续步骤继续）
  try {
    await trtc.stopLocalVideo()
  }
  catch {}
  try {
    await trtc.stopLocalAudio()
  }
  catch {}
  if (sharing.value) {
    try {
      await trtc.stopScreenShare()
    }
    catch {}
    sharing.value = false
  }
  try {
    await trtc.exitRoom()
  }
  catch (e) {
    error.value = (e && e.message) || '离开房间失败'
  }
  remoteUsers.value.splice(0) // 清空远端画面
  remoteNames.value = {} // 清空远端昵称缓存
  joined.value = false
}

async function toggleCam() {
  if (!joined.value)
    return
  try {
    // camOn.value 为当前状态：开→关画面(mute:true)；关→重开。
    // 本地预览由 TRTC 渲染，重开时把画面重新挂到当前容器。
    const next = !camOn.value
    if (next) {
      const view = await waitForLocalView()
      await trtc.updateLocalVideo({
        mute: false,
        view,
        option: {
          mirror: 'view',
        },
      })
    }
    else {
      await trtc.updateLocalVideo({ mute: true })
    }
    camOn.value = next
  }
  catch (e) {
    error.value = (e && e.message) || '切换摄像头失败'
  }
}

async function toggleMic() {
  if (!joined.value)
    return
  try {
    await trtc.updateLocalAudio({ mute: micOn.value })
    micOn.value = !micOn.value
  }
  catch (e) {
    error.value = (e && e.message) || '切换麦克风失败'
  }
}

async function startShare() {
  if (!joined.value)
    return
  try {
    await trtc.startScreenShare()
    sharing.value = true
  }
  catch {
    // 含用户取消选择共享源：静默复位
    sharing.value = false
  }
}

async function stopShare() {
  try {
    await trtc.stopScreenShare()
  }
  catch {}
  sharing.value = false
}

/**
 * 返回页面时把本地 + 远端画面重新挂到「当前组件新渲染的」DOM 容器。
 * 本地预览和远端画面都由 TRTC 重挂到当前组件新渲染的 DOM 容器。
 * 未进房（!joined）或客户端未创建时直接返回，照常显示「进入房间」。幂等、容错。
 */
async function reattachViews() {
  if (!joined.value || !trtc)
    return
  // 本地预览由 TRTC 渲染；页面 remount 后把画面重挂到当前容器。
  if (camOn.value) {
    try {
      const view = await waitForLocalView()
      await trtc.updateLocalVideo({
        view,
        option: { mirror: 'view' },
      })
    }
    catch {}
  }
  // 远端：按参与者状态把摄像头/屏幕画面重挂到新的 <div id>（仅在有对应画面时）
  remoteUsers.value.forEach((u) => {
    if (u.hasVideo) {
      try {
        trtc.updateRemoteVideo({ userId: u.userId, streamType: MAIN, view: cameraKey(u.userId) })
      }
      catch {}
    }
    if (u.hasScreen) {
      try {
        trtc.updateRemoteVideo({ userId: u.userId, streamType: SUB, view: screenKey(u.userId) })
      }
      catch {}
    }
  })
}

/**
 * 释放资源：退房 + 解绑事件。改造后**不再**由页面 onBeforeUnmount 调用
 * （否则离开页面就断线），仅供「退出登录 / 应用级销毁」时主动释放摄像头麦克风用。
 * 释放后重置单例，下次进房会重新创建客户端并绑事件。幂等、容错。
 */
async function destroy() {
  try {
    await exitRoom()
  }
  catch {
    /* 容错，确保后续解绑仍执行 */
  }
  if (trtc) {
    trtc.off('*')
    trtc = null
  }
  listenersBound = false
}

// 供「退出登录 / 应用级销毁」直接调用（无需组件实例）：关闭通话、释放摄像头麦克风
export { destroy as destroyTrtcRoom }

export function useTrtcRoom({ localVideoRef } = {}) {
  // 每次组件挂载，更新本地画面容器引用（DOM 每次都不同）
  if (localVideoRef)
    localViewRef = localVideoRef

  return {
    // state
    entering,
    joined,
    camOn,
    micOn,
    sharing,
    remoteUsers,
    remoteNames,
    roomName,
    error,
    // helpers
    cameraKey,
    screenKey,
    // methods
    enterRoom,
    exitRoom,
    toggleCam,
    toggleMic,
    startShare,
    stopShare,
    reattachViews,
    destroy,
  }
}
