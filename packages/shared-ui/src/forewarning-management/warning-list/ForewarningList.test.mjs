import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const sharedUrl = new URL('./ForewarningList.vue', import.meta.url)
const warningWrapperUrl = new URL(
  '../../../../../apps/link-warning/src/views/ForewarningManagement/components/list.vue',
  import.meta.url,
)
const frontWrapperUrl = new URL(
  '../../../../../apps/link-front/src/views/ForewarningManagement/components/list.vue',
  import.meta.url,
)
const packageUrl = new URL('../../../package.json', import.meta.url)

test('preserves the seven legacy props and requires a host', async () => {
  const source = await readFile(sharedUrl, 'utf8')

  for (const prop of [
    'tableData',
    'type',
    'height',
    'allType',
    'loading',
    'form',
    'selection',
  ]) {
    assert.match(source, new RegExp(`\\b${prop}:\\s*{`))
  }
  assert.match(source, /host:\s*{[\s\S]*?required:\s*true/)
  assert.match(source, /validateWarningListHost\(props\.host,\s*'ForewarningList'\)/)
})

test('preserves the table bindings, slots, status tags, levels, and selection event', async () => {
  const source = await readFile(sharedUrl, 'utf8')

  for (const snippet of [
    'ref="tables"',
    ':list="tableListConfig"',
    ':table-data="tableData"',
    ':loading="loading"',
    ':selection="selection"',
    ':height="height"',
    '@select="onSelection"',
    '#status="{ info }"',
    ':type="tagType(info.auditStatus)"',
    '{{ getStatus(info.auditStatus) }}',
    '#level="{ info }"',
    '{{ getLevel(info.alarmLevel) }}',
    '#operation="{ info }"',
    '@click="handleView(info)"',
  ]) {
    assert.ok(source.includes(snippet), `missing template snippet: ${snippet}`)
  }
  assert.match(source, /onSelection\(selection\)\s*{[\s\S]*?this\.\$emit\('selection',\s*selection\)/)
  assert.match(source, /const level = ref\(\['一级',\s*'二级',\s*'三级',\s*'四级'\]\)/)
  assert.match(source, /props\.type !== 'CustomerStatus'/)
  assert.match(source, /status !== '0'\s*\?\s*'已审核 \|'\s*:\s*''/)
  assert.match(source, /status !== '0' && status !== '1'\s*\?\s*'已处理 \|'\s*:\s*''/)
  assert.match(source, /0:\s*props\.type === 'CustomerStatus'\s*\?\s*'danger'\s*:\s*'primary'/)
  assert.match(source, /4:\s*props\.type === 'CustomerStatus'\s*\?\s*undefined\s*:\s*'info'/)
})

test('uses only the host for dictionaries and warning detail navigation', async () => {
  const source = await readFile(sharedUrl, 'utf8')

  assert.equal(source.match(/props\.host\.getDictList\(props\.type\)/g)?.length, 2)
  assert.match(source, /createWarningDetailData\(row,\s*{[\s\S]*?type:\s*props\.type,[\s\S]*?allType:\s*props\.allType,[\s\S]*?form:\s*props\.form,[\s\S]*?},\s*props\.host\.detailPayloadMode\)/)
  assert.match(source, /props\.host\.pushWarningDetail\(data\)/)
  assert.doesNotMatch(source, /\$router|\$dictUtils|@\/|apps\//)
})

test('forwards imperative table selections through the legacy ref API', async () => {
  const source = await readFile(sharedUrl, 'utf8')

  assert.match(source, /setSelections\(ids\)\s*{[\s\S]*?this\.\$refs\.tables\.setSelection\(ids\)/)
})

test('uses identical wrappers that inject the local host and preserve the ref proxy', async () => {
  const [warningWrapper, frontWrapper] = await Promise.all([
    readFile(warningWrapperUrl, 'utf8'),
    readFile(frontWrapperUrl, 'utf8'),
  ])

  assert.equal(warningWrapper, frontWrapper)
  assert.match(warningWrapper, /import ForewarningList from '@link\/shared-ui\/forewarning-management\/warning-list\/list'/)
  assert.match(warningWrapper, /import warningListHost from '\.\.\/warningListHost'/)
  assert.match(warningWrapper, /inheritAttrs:\s*false/)
  assert.match(warningWrapper, /data:\s*\(\)\s*=>\s*\(\{ warningListHost \}\)/)
  assert.match(warningWrapper, /setSelections\(ids\)\s*{[\s\S]*?return this\.\$refs\.sharedList\.setSelections\(ids\)/)
  assert.match(warningWrapper, /<ForewarningList[\s\S]*?ref="sharedList"[\s\S]*?v-bind="\$attrs"[\s\S]*?:host="warningListHost"[\s\S]*?v-on="\$listeners"[\s\S]*?\/>/)
})

test('exports ForewarningList through the list package subpath', async () => {
  const packageJson = JSON.parse(await readFile(packageUrl, 'utf8'))

  assert.equal(
    packageJson.exports['./forewarning-management/warning-list/list'],
    './src/forewarning-management/warning-list/ForewarningList.vue',
  )
})
