import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const sharedUrl = new URL('./WarningInfo.vue', import.meta.url)
const warningWrapperUrl = new URL(
  '../../../../../apps/link-warning/src/views/ForewarningManagement/components/warningInfo.vue',
  import.meta.url,
)
const frontWrapperUrl = new URL(
  '../../../../../apps/link-front/src/views/ForewarningManagement/components/warningInfo.vue',
  import.meta.url,
)
const packageUrl = new URL('../../../package.json', import.meta.url)

test('declares the WarningInfo props and validates the required host', async () => {
  const source = await readFile(sharedUrl, 'utf8')

  for (const prop of ['item', 'customStyle', 'type', 'allType', 'form']) {
    assert.match(source, new RegExp(`\\b${prop}:\\s*{`))
  }
  assert.match(source, /host:\s*{[\s\S]*?required:\s*true/)
  assert.match(source, /validateWarningListHost\(this\.host,\s*'WarningInfo'\)/)
})

test('uses host dictionaries and initializes the file prefix from the host', async () => {
  const source = await readFile(sharedUrl, 'utf8')

  assert.equal(source.match(/this\.host\.getDictList\(this\.type\)/g)?.length, 2)
  assert.match(source, /created\(\)\s*{[\s\S]*?this\.filePrefix\s*=\s*this\.host\.getFilePrefix\(\)/)
  assert.doesNotMatch(source, /\$dictUtils|\bgetPrefix\(/)
})

test('emits the legacy id-based itemTap payload without using detailPayloadMode', async () => {
  const source = await readFile(sharedUrl, 'utf8')

  assert.match(source, /detailId:\s*this\.item\.id/)
  assert.match(source, /type:\s*this\.allType\s*\?\s*'all'\s*:\s*this\.type/)
  assert.match(source, /form:\s*this\.form/)
  assert.match(source, /this\.\$emit\('itemTap',\s*data\)/)
  assert.doesNotMatch(source, /detailPayloadMode|createWarningDetailData/)
})

test('retains the warning card template and scoped SCSS semantics', async () => {
  const source = await readFile(sharedUrl, 'utf8')

  for (const snippet of [
    '<div class="item" :style="customStyle" @click="itemTap">',
    ':src="filePrefix + item.alarmPic"',
    ':src="getInfo + item.alarmPic"',
    ':type="tagType(item.auditStatus)"',
    '{{ getStatus(item.auditStatus) }}',
    '{{ getLevel(item.alarmLevel) }}',
  ]) {
    assert.ok(source.includes(snippet), `missing template snippet: ${snippet}`)
  }
  assert.match(source, /<style lang="scss" scoped>/)
  assert.match(source, /width:\s*calc\(\(100% - 36px\) \/ 3\)/)
  assert.match(source, /height:\s*calc\(\(\(67vh - 30px\) \/ 4\) - 13px\)/)
  assert.match(source, /&:nth-child\(-n \+ 3\)/)
})

test('uses identical wrappers that inject the local host and forward attrs and listeners', async () => {
  const [warningWrapper, frontWrapper] = await Promise.all([
    readFile(warningWrapperUrl, 'utf8'),
    readFile(frontWrapperUrl, 'utf8'),
  ])

  assert.equal(warningWrapper, frontWrapper)
  assert.match(warningWrapper, /import WarningInfo from '@link\/shared-ui\/forewarning-management\/warning-list\/warning-info'/)
  assert.match(warningWrapper, /import warningListHost from '\.\.\/warningListHost'/)
  assert.match(warningWrapper, /inheritAttrs:\s*false/)
  assert.match(warningWrapper, /data:\s*\(\)\s*=>\s*\(\{ warningListHost \}\)/)
  assert.match(warningWrapper, /<WarningInfo v-bind="\$attrs" :host="warningListHost" v-on="\$listeners" \/>/)
})

test('exports WarningInfo through the warning-info package subpath', async () => {
  const packageJson = JSON.parse(await readFile(packageUrl, 'utf8'))

  assert.equal(
    packageJson.exports['./forewarning-management/warning-list/warning-info'],
    './src/forewarning-management/warning-list/WarningInfo.vue',
  )
})
