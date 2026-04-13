/**
 * Canvas转图片工具 - 专注于canvas.toBlob()方法的使用
 */

/**
 * 使用canvas.toBlob()方法将canvas转换为Blob对象
 * @param {HTMLCanvasElement} canvas - canvas元素
 * @param {string} format - 图片格式，默认'image/png'
 * @param {number} quality - 图片质量，0-1之间，默认0.9（仅对JPEG有效）
 * @returns {Promise<Blob>} blob对象
 */
export function canvasToBlob(canvas, format = 'image/png', quality = 0.9) {
  if (!canvas) {
    throw new Error('Canvas元素不能为空')
  }

  return new Promise((resolve, reject) => {
    // 使用canvas.toBlob()方法
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      }
      else {
        reject(new Error('Canvas转Blob失败'))
      }
    }, format, quality)
  })
}

/**
 * 使用canvas.toBlob()创建blob链接
 * @param {HTMLCanvasElement} canvas - canvas元素
 * @param {string} format - 图片格式，默认'image/png'
 * @param {number} quality - 图片质量，0-1之间，默认0.9
 * @returns {Promise<string>} blob链接
 */
export async function createBlobURL(canvas, format = 'image/png', quality = 0.9) {
  const blob = await canvasToBlob(canvas, format, quality)
  return URL.createObjectURL(blob)
}

/**
 * 使用canvas.toBlob()创建文件对象
 * @param {HTMLCanvasElement} canvas - canvas元素
 * @param {string} filename - 文件名
 * @param {string} format - 图片格式，默认'image/png'
 * @param {number} quality - 图片质量，0-1之间，默认0.9
 * @returns {Promise<File>} 文件对象
 */
export async function createFileFromCanvas(canvas, filename, format = 'image/png', quality = 0.9) {
  const blob = await canvasToBlob(canvas, format, quality)
  return new File([blob], filename, { type: format })
}

/**
 * 释放blob URL资源
 * @param {string} url - blob URL
 */
export function revokeBlobURL(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}
