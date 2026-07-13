export function createReportPdfExporter({ html2canvas, html2pdf } = {}) {
  if (typeof html2canvas !== 'function') {
    throw new TypeError('createReportPdfExporter requires html2canvas to be a function')
  }
  if (typeof html2pdf !== 'function') {
    throw new TypeError('createReportPdfExporter requires html2pdf to be a function')
  }

/**
 * 导出PDF（每页带页眉）
 * @param {HTMLElement} element 要导出的DOM元素
 * @param {HTMLElement} headerElement 页眉DOM元素（用html2canvas渲染为图片，支持中文）
 * @param {string} filename 文件名
 * @returns {Promise} 导出Promise
 */
async function exportToPDF(element, headerElement, filename) {
  try {
    const opt = {
      margin: [20, 20, 20, 20],
      filename: filename || `预警报告_${new Date().toLocaleDateString()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#fff' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    }

    let headerImgData = null
    let headerImgHeight = 0

    if (headerElement) {
      const canvas = await html2canvas(headerElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#fff',
      })
      headerImgData = canvas.toDataURL('image/jpeg', 0.98)
      const imgWidth = 210 - 40
      headerImgHeight = imgWidth * (canvas.height / canvas.width)
      // 动态调整上边距：页眉位置 + 页眉高度 + 间距
      opt.margin[0] = Math.max(20, headerImgHeight + 10)
    }

    const pdf = await html2pdf().set(opt).from(element).toPdf().get('pdf')

    if (headerImgData) {
      const pageCount = pdf.internal.getNumberOfPages()
      const pageWidth = pdf.internal.pageSize.getWidth()
      const imgWidth = pageWidth - 40

      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i)
        pdf.addImage(headerImgData, 'JPEG', 20, 5, imgWidth, headerImgHeight)
      }
    }

    pdf.save(opt.filename)

    return { success: true, message: 'PDF导出成功！' }
  }
  catch (error) {
    console.error('PDF导出失败:', error)
    return { success: false, message: 'PDF导出失败，请重试！', error }
  }
}

  return { exportToPDF }
}
