import { Base64 } from 'js-base64'
/* 打开新窗口查看文件，支持word/pdf/excel/图片 */
export function showFileWindow(url) {
  const globalData = JSON.parse(localStorage.getItem('globalData'))
  const fileShow = globalData.fileOnlinePreviewUrl
  const resultUrl
    = `${fileShow
    }/onlinePreview?url=${
      encodeURIComponent(Base64.encode(globalData.minioFilePrefix + url))}`
  window.open(resultUrl, '_blank')
}
export function downloadFile(url) {
  const globalData = JSON.parse(localStorage.getItem('globalData'))
  window.open(`${globalData.minioFilePrefix}/${url}`, '_blank')
}

// 这是公司
export function showFileCompany(url) {
  const globalData = JSON.parse(localStorage.getItem('globalData'))
  const resultUrl = globalData.minioFilePrefix + url
  window.open(resultUrl, '_blank')
}
