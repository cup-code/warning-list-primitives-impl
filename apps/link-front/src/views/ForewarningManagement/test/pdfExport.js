import html2pdf from 'html2pdf.js'

/**
 * 将图片路径转换为Base64格式
 * @param {string} imgPath 图片路径或URL
 * @returns {Promise<string>} 返回图片的Base64字符串
 */
export function getImageBase64(imgPath) {
  return new Promise((resolve, reject) => {
    if (!imgPath) {
      reject(new Error('图片路径不能为空'))
      return
    }
    const img = new window.Image()
    // 支持跨域图片
    img.crossOrigin = 'anonymous'
    img.onload = function () {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth || img.width
        canvas.height = img.naturalHeight || img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataURL = canvas.toDataURL('image/png')
        resolve(dataURL)
      }
      catch (err) {
        reject(new Error(`图片转Base64失败: ${err.message}`))
      }
    }
    img.onerror = function (error) {
      reject(new Error(`图片加载失败: ${error}`))
    }
    img.src = imgPath
    // 兼容缓存图片立即触发onload
    if (img.complete) {
      img.onload()
    }
  })
}

/**
 * 批量获取图片Base64
 * @param {Array} imagePaths 图片路径数组
 * @returns {Promise<Array>} 返回Base64数组
 */
export async function getImagesBase64(imagePaths) {
  const results = []
  for (const path of imagePaths) {
    try {
      const base64 = await getImageBase64(path)
      results.push(base64)
    }
    catch (error) {
      console.warn(`加载图片失败 ${path}:`, error)
      results.push(null)
    }
  }
  return results
}

/**
 * 添加页眉页脚的方法
 * @param {object} pdf PDF对象
 * @param {Array} logoBase64Array Base64图片数组
 */
export function addHeaderFooter(pdf, logoBase64Array) {
  const [logoBase64, topRightLogoBase64, footerLogoBase64, rightLabelBase64, leftLabelBase64] = logoBase64Array

  const pageCount = pdf.internal.getNumberOfPages()
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)

    // 页眉左侧：Logo图片
    if (logoBase64) {
      try {
        const logoWidth = 36
        const logoHeight = 7
        pdf.addImage(logoBase64, 'PNG', 20, 10, logoWidth, logoHeight)
      }
      catch (error) {
        console.warn('添加左侧logo图片失败:', error)
      }
    }

    // 页眉右侧：右侧标签图标
    if (topRightLogoBase64) {
      try {
        const rightLabelWidth = 45
        const rightLabelHeight = 7
        pdf.addImage(
          topRightLogoBase64,
          'PNG',
          pageWidth - rightLabelWidth - 20,
          10,
          rightLabelWidth,
          rightLabelHeight,
        )
      }
      catch (error) {
        console.warn('添加右侧标签图片失败:', error)
      }
    }

    // 页眉分割线
    pdf.setLineWidth(0.3)
    pdf.setDrawColor(200, 200, 200)
    pdf.line(20, 18, pageWidth - 20, 18)

    // 页脚左侧：左侧标签图标
    // if (leftLabelBase64) {
    //   try {
    //     const leftLabelWidth = 60;
    //     const leftLabelHeight = 8;
    //     pdf.addImage(
    //       leftLabelBase64,
    //       "PNG",
    //       20,
    //       pageHeight - leftLabelHeight - 10,
    //       leftLabelWidth,
    //       leftLabelHeight
    //     );
    //   } catch (error) {
    //     console.warn("添加页脚左侧标签图片失败:", error);
    //   }
    // }

    // if (rightLabelBase64) {
    //   try {
    //     const rightLabelWidth = 20;
    //     const rightLabelHeight = 7;
    //     pdf.addImage(
    //       rightLabelBase64,
    //       "PNG",
    //       pageWidth - rightLabelWidth - 35,
    //       pageHeight - rightLabelHeight - 10,
    //       rightLabelWidth,
    //       rightLabelHeight
    //     );
    //   } catch (error) {
    //     console.warn("添加右侧标签图片失败:", error);
    //   }
    // }

    // // 页脚右侧：二维码图标
    // if (footerLogoBase64) {
    //   try {
    //     const qrWidth = 15;
    //     const qrHeight = 15;
    //     pdf.addImage(
    //       footerLogoBase64,
    //       "PNG",
    //       pageWidth - qrWidth - 20,
    //       pageHeight - qrHeight - 5,
    //       qrWidth,
    //       qrHeight
    //     );
    //   } catch (error) {
    //     console.warn("添加页脚二维码图片失败:", error);
    //   }
    // }

    // 页脚分割线
    // pdf.setLineWidth(0.3);
    // pdf.setDrawColor(200, 200, 200);
    // pdf.line(15, pageHeight - 12, pageWidth - 15, pageHeight - 12);
  }
}

/**
 * 导出PDF
 * @param {HTMLElement} element 要导出的DOM元素
 * @param {Array} imagePaths 图片路径数组
 * @param {string} filename 文件名
 * @returns {Promise} 导出Promise
 */
export async function exportToPDF(element, imagePaths, filename) {
  try {
    // 获取所有图片的base64
    const logoBase64Array = await getImagesBase64(imagePaths)

    // 生成PDF配置
    const opt = {
      margin: [20, 20, 20, 20], // 上右下左，增加上下边距为页眉页脚留空间
      filename: filename || `预警报告_${new Date().toLocaleDateString()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#fff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    }

    // 生成PDF并添加页眉页脚
    const pdf = await html2pdf().set(opt).from(element).toPdf().get('pdf')

    // 添加页眉页脚
    addHeaderFooter(pdf, logoBase64Array)

    // 保存PDF
    pdf.save(opt.filename)

    return { success: true, message: 'PDF导出成功！' }
  }
  catch (error) {
    console.error('PDF导出失败:', error)
    return { success: false, message: 'PDF导出失败，请重试！', error }
  }
}

/**
 * 初始化logo路径
 * @returns {object} logo路径对象
 */
export function initLogoPath() {
  const logoConfig = {
    logoPath: null,
    leftLogo: null,
    rightLabel: null,
    footerLogo: null,
    topRightLogo: null,
  }

  try {
    logoConfig.logoPath = require('../static/headIcon.png')
    logoConfig.leftLogo = require('../static/leftLabel.png')
    logoConfig.rightLabel = require('../static/wechat.png')
    logoConfig.footerLogo = require('../static/qrcode.png')
    logoConfig.topRightLogo = require('../static/topLabel.png')
  }
  catch (error) {
    console.warn('Logo文件不存在:', error)
  }

  return logoConfig
}
