import assert from 'node:assert/strict'
import test from 'node:test'

import { createReportPdfExporter } from './createReportPdfExporter.js'

function createFixture({ canvasError, pdfError } = {}) {
  const calls = []
  const pdf = {
    internal: {
      getNumberOfPages: () => 2,
      pageSize: { getWidth: () => 210 },
    },
    setPage: page => calls.push(['setPage', page]),
    addImage: (...args) => calls.push(['addImage', ...args]),
    save: filename => calls.push(['save', filename]),
  }
  const canvas = {
    width: 100,
    height: 20,
    toDataURL: (...args) => { calls.push(['toDataURL', ...args]); return 'header-data' },
  }
  const html2canvas = async (...args) => {
    calls.push(['html2canvas', ...args])
    if (canvasError) throw canvasError
    return canvas
  }
  const chain = {
    set: (options) => { calls.push(['set', options]); return chain },
    from: (element) => { calls.push(['from', element]); return chain },
    toPdf: () => { calls.push(['toPdf']); return chain },
    get: async (name) => {
      calls.push(['get', name])
      if (pdfError) throw pdfError
      return pdf
    },
  }
  return { calls, html2canvas, html2pdf: () => chain }
}

test('PDF 工厂校验两个宿主依赖', () => {
  assert.throws(() => createReportPdfExporter(), /html2canvas/)
  assert.throws(() => createReportPdfExporter({ html2canvas() {} }), /html2pdf/)
})

test('带页眉导出保持配置、分页图片和保存契约', async () => {
  const fixture = createFixture()
  const { exportToPDF } = createReportPdfExporter(fixture)
  const element = { id: 'report' }
  const header = { id: 'header' }
  const result = await exportToPDF(element, header, 'report.pdf')
  assert.deepEqual(result, { success: true, message: 'PDF导出成功！' })
  const options = fixture.calls.find(call => call[0] === 'set')[1]
  assert.deepEqual(options.margin, [44, 20, 20, 20])
  assert.equal(options.filename, 'report.pdf')
  assert.deepEqual(fixture.calls.filter(call => call[0] === 'setPage'), [
    ['setPage', 1], ['setPage', 2],
  ])
  assert.equal(fixture.calls.filter(call => call[0] === 'addImage').length, 2)
  assert.deepEqual(fixture.calls.at(-1), ['save', 'report.pdf'])
})

test('无页眉和失败路径保持返回契约', async () => {
  const successFixture = createFixture()
  const success = createReportPdfExporter(successFixture)
  assert.deepEqual(await success.exportToPDF({}, null, 'plain.pdf'), {
    success: true, message: 'PDF导出成功！',
  })
  assert.equal(successFixture.calls.some(call => call[0] === 'html2canvas'), false)
  assert.equal(successFixture.calls.some(call => call[0] === 'addImage'), false)

  const error = new Error('pdf failed')
  const failure = createReportPdfExporter(createFixture({ pdfError: error }))
  const originalError = console.error
  console.error = () => {}
  try {
    assert.deepEqual(await failure.exportToPDF({}, null, 'failed.pdf'), {
      success: false, message: 'PDF导出失败，请重试！', error,
    })
  }
  finally {
    console.error = originalError
  }
})
