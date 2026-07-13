import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const testDirectory = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(testDirectory, '../..')
const appRoots = ['apps/link-front', 'apps/link-warning']

const readWorkspaceFile = relativePath => (
  readFile(path.join(workspaceRoot, relativePath), 'utf8')
)

function staticImportSources(source) {
  return [...source.matchAll(/^import\s+(?:[\w*{},\s]+\s+from\s+)?['"]([^'"]+)['"]/gm)]
    .map(match => match[1])
}

function destructuredExportNames(source) {
  const match = source.match(/export const\s*\{([\s\S]*?)\}\s*=/)
  assert.ok(match, 'expected a destructured named export')
  return match[1].split(',').map(name => name.trim()).filter(Boolean)
}

test('两个应用的报告工具 shim 逐字一致并仅保留固定宿主依赖和命名导出', async () => {
  const dateSources = await Promise.all(appRoots.map(appRoot => (
    readWorkspaceFile(`${appRoot}/src/views/ForewarningManagement/test/dateUtils.js`)
  )))
  assert.equal(dateSources[0], dateSources[1])
  assert.deepEqual(staticImportSources(dateSources[0]), [
    'dayjs/plugin/weekOfYear',
    'moment',
    'moment/locale/zh-cn',
    '@link/warning-feature/report-date-utils',
  ])
  assert.deepEqual(destructuredExportNames(dateSources[0]), [
    'getCurrentWeekNumber',
    'getCurrentYear',
    'getWeekday',
    'getWeekDateStr',
    'getCurrentWeekDates',
    'getWeekRange',
    'getCurrentTitle',
    'getDefaultReportTitle',
  ])
  assert.equal(dateSources[0].match(/^export\s/gm)?.length, 1)

  const pdfSources = await Promise.all(appRoots.map(appRoot => (
    readWorkspaceFile(`${appRoot}/src/views/ForewarningManagement/test/pdfExport.js`)
  )))
  assert.equal(pdfSources[0], pdfSources[1])
  assert.deepEqual(staticImportSources(pdfSources[0]), [
    'html2canvas',
    'html2pdf.js',
    '@link/warning-feature/report-pdf-export',
  ])
  assert.match(pdfSources[0], /export \{ exportToPDF \}/)
  assert.doesNotMatch(pdfSources[0], /export (?:async )?function exportToPDF/)
  assert.equal(pdfSources[0].match(/^export\s/gm)?.length, 1)
})

test('报告包精确导出两个子路径且共享工厂不引用宿主实现', async () => {
  const packageJson = JSON.parse(await readWorkspaceFile('packages/warning-feature/package.json'))
  const reportExports = Object.fromEntries(
    Object.entries(packageJson.exports).filter(([name]) => name.startsWith('./report-')),
  )
  assert.deepEqual(reportExports, {
    './report-date-utils': './src/report/createReportDateUtils.js',
    './report-pdf-export': './src/report/createReportPdfExporter.js',
  })

  const factorySources = await Promise.all([
    readWorkspaceFile('packages/warning-feature/src/report/createReportDateUtils.js'),
    readWorkspaceFile('packages/warning-feature/src/report/createReportPdfExporter.js'),
  ])
  for (const source of factorySources) {
    assert.doesNotMatch(source, /@\//)
    assert.doesNotMatch(source, /apps\//)
    assert.doesNotMatch(source, /^import .*['"]moment(?:\/|['"])/m)
    assert.doesNotMatch(source, /^import .*['"](?:html2canvas|html2pdf\.js)['"]/m)
    assert.doesNotMatch(source, /\brouter\b/)
    assert.doesNotMatch(source, /\bStore\b/)
  }
})
