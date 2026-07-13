import { useWebSocket } from '@vueuse/core'
import { Notification } from 'element-ui'
import { getSpecifiedModule } from '@/http/companyConfig/companyConfig-api'
import router from '@/router'
/**
 * useWebSocket 使用说明：
 *
 * 1. 基本用法：
 *    const { status, data, send, open, close } = useWebSocket(url, options)
 *
 * 2. 配置选项 (options)：
 *    - immediate: boolean - 是否立即连接（默认 false）
 *    - heartbeat: boolean | object - 心跳配置
 *      message: string | ArrayBuffer | Blob - 心跳消息（默认 'ping'）
 *      responseMessage: string | ArrayBuffer | Blob - 心跳响应消息
 *      interval: number - 心跳间隔（毫秒，默认 1000）
 *      timeout: number - 心跳响应超时（毫秒，默认 1000）
 *    - onConnected: (ws: WebSocket) => void - 连接成功回调
 *    - onDisconnected: (ws: WebSocket, event: CloseEvent) => void - 断开连接回调
 *    - onError: (ws: WebSocket, event: Event) => void - 错误回调
 *    - onMessage: (ws: WebSocket, event: MessageEvent) => void - 消息接收回调
 *    - autoReconnect: boolean | object - 自动重连配置（默认 false）
 *      retries: number - 重试次数（默认 3）
 *      delay: number - 重试延迟（毫秒，默认 1000）
 *      onFailed: () => void - 重连失败回调
 *
 * 3. 返回值：
 *    - status: Ref<'OPEN' | 'CONNECTING' | 'CLOSED'> - 连接状态
 *    - data: Ref<T | null> - 最新接收的数据（响应式）
 *    - send: (data: string | ArrayBuffer | Blob, useBuffer?: boolean) => boolean - 发送消息
 *    - open: () => void - 手动打开连接
 *    - close: (code?: number, reason?: string) => void - 关闭连接
 *    - ws: Ref<WebSocket | undefined> - WebSocket 实例引用
 */

function getWarningNotice(companyId) {
  return getSpecifiedModule(companyId, 'videoManagement').then(({ data }) => {
    if (data.success) {
      const { result } = data
      const isNotification = result?.filter(s => s.item === 'isNotification')[0]?.value
      return isNotification
    }
  })
}

export default async function realTimeWarning() {
  const {
    id,
    tenantCode,
    companyId,
  } = JSON.parse(sessionStorage.getItem('user'))
  const isAction = await getWarningNotice(companyId)
  if (!isAction) {
    // 返回一个空对象，包含空的 close 方法，确保调用方不会出错
    return
  }
  const wsUrl = `${window.g.BASE_WS_DEV}videoAlarm/${tenantCode}/${id}`
  let notificationInstance = null
  let countdownTimer = null

  // 创建音频实例
  let alarmAudio = null
  // 初始化音频
  const initAudio = () => {
    if (!alarmAudio) {
      alarmAudio = new Audio()
      alarmAudio.src = require('@/assets/anhuan3d/notice.mp3')
      alarmAudio.preload = 'auto'
      // 设置音量（0-1之间，0.5表示50%音量）
      alarmAudio.volume = 0.7
      // 循环播放（可选，根据需求调整）
      alarmAudio.loop = false
    }
  }

  // 播放报警音频
  const playAlarmSound = () => {
    try {
      if (!alarmAudio) {
        initAudio()
      }

      // 重置音频到开始位置
      alarmAudio.currentTime = 0

      // 播放音频
      const playPromise = alarmAudio.play()

      // 处理播放Promise（处理浏览器的自动播放策略）
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // 音频播放成功
            console.log('报警音频播放成功')
          })
          .catch((error) => {
            // 音频播放失败（可能是浏览器阻止自动播放）
            console.warn('报警音频播放失败，可能需要用户交互:', error)
            // 可以在这里添加用户提示，告知用户需要点击页面才能播放音频
          })
      }
    }
    catch (error) {
      console.error('播放报警音频时出错:', error)
    }
  }

  const {
    status,
    data,
    send,
    open,
    close,
    ws,
  } = useWebSocket(wsUrl, {
    // 立即连接
    immediate: true,

    // 心跳配置
    heartbeat: {
      message: 'ping',
      interval: 60000, // 60秒发送一次心跳
    },

    // 连接成功回调
    onConnected: (ws) => {
      console.log('WebSocket 连接成功', ws)
    },

    // 断开连接回调
    onDisconnected: (ws, event) => {
      console.log('WebSocket 断开连接', event)
      notificationInstance?.close()
      // 停止音频播放
      if (alarmAudio && !alarmAudio.paused) {
        alarmAudio.pause()
        alarmAudio.currentTime = 0
      }
    },

    // 错误回调
    onError: (ws, event) => {
      console.error('WebSocket 错误', event)
    },

    // 消息接收回调（可选，也可以直接 watch data）
    onMessage: async (ws, event) => {
      console.log('收到消息', event.data)
      const levelColor = { 1: '#f54a41', 2: '#f9ae3d', 3: '#cfde00', 4: '#0069b9' }
      const levelTag = { 1: '一级', 2: '二级', 3: '三级', 4: '四级' }
      let info = {}
      try {
        info = JSON.parse(event.data)
      }
      catch (e) {
        return
      }

      if (info.id) {
        // 播放报警音频提示音
        playAlarmSound()

        // 创建倒计时
        let countdown = 30 // 30秒倒计时

        // 新消息到来时，先清除旧的倒计时定时器
        if (countdownTimer) {
          clearInterval(countdownTimer)
          countdownTimer = null
        }

        // 关闭上一条消息通知（Element UI 的 close 可能不返回 Promise）
        if (notificationInstance) {
          try {
            notificationInstance.close()
          }
          catch (e) {
            console.error('关闭通知失败', e)
          }
          notificationInstance = null
        }

        // 等待一小段时间确保旧通知已关闭
        await new Promise(resolve => setTimeout(resolve, 50))

        // 显示通知
        notificationInstance = Notification.success({
          dangerouslyUseHTMLString: true,
          message: `<div class="notification-header-content">
            <span>实时预警</span>
            <span class="countdowns">(${countdown}s)</span>
          </div>
            <div class="notification-body">
              <div class="alarm-type">${info.alarmType || '预警信息'}</div>
              <div class="info-item">
                <span class="label">设备名称:</span>
                <span class="value">${info.cameraName || '未知'}</span>
              </div>
              <div class="info-item">
                <span class="label">预警等级:</span>
                <span class="level-badge" style="background: ${
                  levelColor[info.alarmLevel]
                }">
                  <i class="el-icon-lightning"></i>
                  ${levelTag[info.alarmLevel] || '未知'}
                </span>
              </div>
            </div>
          `,
          duration: 300000,
          position: 'top-right',
          offset: 60,
          customClass: 'real-time-warning-notification',
          onClose: () => {
            if (countdownTimer) {
              clearInterval(countdownTimer)
              countdownTimer = null
            }
          },
          onClick: () => {
            router.push({
              path: `/detail/warningDetail`,
              query: {
                data: JSON.stringify({
                  detailId: info.id,
                  type: 'CustomerStatus',
                  origin: 'notification',
                }),
              },
            })
          },
        })

        // 使用 requestAnimationFrame 和 setTimeout 确保 DOM 完全渲染
        requestAnimationFrame(() => {
          setTimeout(() => {
            // 再次检查，确保旧定时器已清除
            if (countdownTimer) {
              clearInterval(countdownTimer)
              countdownTimer = null
            }

            // 查找通知元素，使用更精确的选择器
            const notificationEl = document.querySelector(
              '.real-time-warning-notification',
            )
            if (!notificationEl) {
              console.warn('未找到通知元素')
              return
            }

            // 重置倒计时为30秒
            countdown = 30

            // 查找倒计时元素
            const countdownEl = notificationEl.querySelector('.countdowns')
            if (!countdownEl) {
              console.warn('未找到倒计时元素')
              return
            }

            // 立即更新一次倒计时显示
            countdownEl.textContent = `(${countdown}s)`

            // 倒计时更新
            countdownTimer = setInterval(() => {
              countdown--
              if (countdown <= 0) {
                clearInterval(countdownTimer)
                countdownTimer = null
                if (notificationInstance) {
                  notificationInstance.close()
                  notificationInstance = null
                }
                return
              }

              // 每次更新时重新查找元素，确保能找到最新的 DOM
              const currentNotificationEl = document.querySelector(
                '.real-time-warning-notification',
              )
              if (currentNotificationEl) {
                const currentCountdownEl = currentNotificationEl.querySelector(
                  '.countdowns',
                )
                if (currentCountdownEl) {
                  // 使用 textContent 更新，确保内容刷新
                  currentCountdownEl.textContent = `(${countdown}s)`
                }
                else {
                  console.warn('倒计时元素不存在，停止定时器')
                  clearInterval(countdownTimer)
                  countdownTimer = null
                }
              }
              else {
                console.warn('通知元素不存在，停止定时器')
                clearInterval(countdownTimer)
                countdownTimer = null
              }
            }, 1000)
          }, 150)
        })
      }
    },
  })

  return {
    status, // 连接状态：'OPEN' | 'CONNECTING' | 'CLOSED'
    data, // 最新接收的数据（响应式）
    send, // 发送消息函数
    open, // 手动打开连接
    close, // 关闭连接
    ws, // WebSocket 实例引用
  }
}
