/**
 * 媒体文件工具函数
 */

/**
 * 获取文件前缀
 * @returns {string} minio文件服务器前缀
 */
export function getFilePrefix() {
  try {
    const globalData = JSON.parse(localStorage.getItem('globalData'))
    return globalData?.minioFilePrefix || ''
  } catch {
    return ''
  }
}

/**
 * 解析媒体URL，自动添加前缀
 * @param {string} url - 媒体URL
 * @returns {string} 完整URL
 */
export function resolveMediaUrl(url) {
  if (!url) return ''
  return getFilePrefix() + url
}

/**
 * 根据URL判断媒体类型
 * @param {string} url - 媒体URL
 * @returns {'image' | 'video' | 'audio' | 'unknown'} 媒体类型
 */
export function getMediaType(url) {
  if (!url) return 'unknown'

  const ext = url.split('?')[0].split('#')[0].toLowerCase().split('.').pop()

  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico']
  const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv']
  const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a', 'wma']

  if (imageExts.includes(ext)) return 'image'
  if (videoExts.includes(ext)) return 'video'
  if (audioExts.includes(ext)) return 'audio'

  return 'unknown'
}

/**
 * 将逗号分隔的媒体URL字符串转换为统一格式数组
 * @param {Object} row - 数据行对象
 * @param {string} row.photo - 照片URL（逗号分隔）
 * @param {string} row.video - 视频URL（逗号分隔）
 * @param {string} row.audio - 音频URL（逗号分隔）
 * @returns {Array<{type: string, url: string, name: string}>} 媒体项数组
 */
export function parseMediaUrls(row) {
  const items = []

  // 照片
  if (row.photo) {
    row.photo.split(',').filter(Boolean).forEach((url, index) => {
      const resolvedUrl = resolveMediaUrl(url.trim())
      if (resolvedUrl) {
        items.push({
          type: 'image',
          url: resolvedUrl,
          name: `照片 ${index + 1}`,
        })
      }
    })
  }

  // 视频
  if (row.video) {
    row.video.split(',').filter(Boolean).forEach((url, index) => {
      const resolvedUrl = resolveMediaUrl(url.trim())
      if (resolvedUrl) {
        items.push({
          type: 'video',
          url: resolvedUrl,
          name: `视频 ${index + 1}`,
        })
      }
    })
  }

  // 音频
  if (row.audio) {
    row.audio.split(',').filter(Boolean).forEach((url, index) => {
      const resolvedUrl = resolveMediaUrl(url.trim())
      if (resolvedUrl) {
        items.push({
          type: 'audio',
          url: resolvedUrl,
          name: `音频 ${index + 1}`,
        })
      }
    })
  }

  console.log("items", items)
  console.log("row", row)
  return items
}

/**
 * 获取媒体类型的中文名称
 * @param {string} type - 媒体类型
 * @returns {string} 中文名称
 */
export function getMediaTypeLabel(type) {
  const labels = {
    image: '照片',
    video: '视频',
    audio: '音频',
    unknown: '未知',
  }
  return labels[type] || '未知'
}
