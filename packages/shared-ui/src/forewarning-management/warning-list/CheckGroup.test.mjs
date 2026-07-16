import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const sharedUrl = new URL('./CheckGroup.vue', import.meta.url)
const warningWrapperUrl = new URL(
  '../../../../../apps/link-warning/src/views/ForewarningManagement/components/checkGroup.vue',
  import.meta.url,
)
const frontWrapperUrl = new URL(
  '../../../../../apps/link-front/src/views/ForewarningManagement/components/checkGroup.vue',
  import.meta.url,
)
const packageUrl = new URL('../../../package.json', import.meta.url)

test('preserves the seven legacy props and their defaults', async () => {
  const source = await readFile(sharedUrl, 'utf8')

  for (const prop of [
    'tableData',
    'height',
    'form',
    'type',
    'allType',
    'isBatch',
    'checkboxGroup',
  ]) {
    assert.match(source, new RegExp(`\\b${prop}:\\s*{`))
  }
  assert.match(source, /tableData:\s*{[\s\S]*?type:\s*Array,[\s\S]*?default:\s*\(\)\s*=>\s*{[\s\S]*?return \[\]/)
  assert.match(source, /height:\s*{[\s\S]*?type:\s*String,[\s\S]*?default:\s*'100%'/)
  assert.match(source, /form:\s*{[\s\S]*?type:\s*Object,[\s\S]*?default:\s*\(\)\s*=>\s*{}/)
  assert.match(source, /type:\s*{[\s\S]*?type:\s*String,[\s\S]*?default:\s*''/)
  for (const prop of ['allType', 'isBatch']) {
    assert.match(source, new RegExp(`${prop}:\\s*{[\\s\\S]*?type:\\s*Boolean,[\\s\\S]*?default:\\s*false`))
  }
  assert.match(source, /checkboxGroup:\s*{[\s\S]*?type:\s*Array,[\s\S]*?default:\s*\(\)\s*=>\s*{[\s\S]*?return \[\]/)
})

test('keeps local checkbox and list state synchronized with immediate watchers', async () => {
  const source = await readFile(sharedUrl, 'utf8')

  assert.match(source, /data\(\)\s*{[\s\S]*?localCheckboxGroup:\s*\[\],[\s\S]*?list:\s*\[\]/)
  assert.match(source, /checkboxGroup:\s*{[\s\S]*?this\.localCheckboxGroup\s*=\s*newVal[\s\S]*?immediate:\s*true/)
  assert.match(source, /tableData:\s*{[\s\S]*?this\.list\s*=\s*newVal[\s\S]*?immediate:\s*true/)
})

test('emits the legacy check event and preserves the checkbox template and scoped style', async () => {
  const source = await readFile(sharedUrl, 'utf8')

  assert.match(source, /handleChecked\(value\)\s*{[\s\S]*?this\.\$emit\('check',\s*value\)/)
  for (const snippet of [
    'v-model="localCheckboxGroup"',
    '@change="handleChecked"',
    'v-for="item in list"',
    ':label="item.id"',
    'class="warning-checkbox-wrapper"',
  ]) {
    assert.ok(source.includes(snippet), `missing template snippet: ${snippet}`)
  }
  assert.match(source, /<style lang="scss" scoped>/)
  assert.match(source, /width:\s*calc\(\(100% - 36px\) \/ 3\)/)
  assert.match(source, /&:nth-child\(-n \+ 3\)/)
  assert.match(source, /::v-deep\.el-checkbox\.is-bordered\.el-checkbox--mini/)
})

test('validates its required host and passes it to WarningInfo with legacy bindings', async () => {
  const source = await readFile(sharedUrl, 'utf8')

  assert.match(source, /import WarningInfo from '\.\/WarningInfo\.vue'/)
  assert.match(source, /host:\s*{[\s\S]*?required:\s*true/)
  assert.match(source, /validateWarningListHost\(this\.host,\s*'CheckGroup'\)/)
  for (const binding of [
    ':host="host"',
    ':type="type"',
    ':form="form"',
    ':pageNum="form.pageNum"',
    ':item="item"',
    ':allType="allType"',
    'customStyle="width:100%;margin:0;border:none;"',
  ]) {
    assert.ok(source.includes(binding), `missing WarningInfo binding: ${binding}`)
  }
})

test('uses identical wrappers that inject the local host and forward attrs and listeners', async () => {
  const [warningWrapper, frontWrapper] = await Promise.all([
    readFile(warningWrapperUrl, 'utf8'),
    readFile(frontWrapperUrl, 'utf8'),
  ])

  assert.equal(warningWrapper, frontWrapper)
  assert.match(warningWrapper, /import CheckGroup from '@link\/shared-ui\/forewarning-management\/warning-list\/check-group'/)
  assert.match(warningWrapper, /import warningListHost from '\.\.\/warningListHost'/)
  assert.match(warningWrapper, /inheritAttrs:\s*false/)
  assert.match(warningWrapper, /data:\s*\(\)\s*=>\s*\(\{ warningListHost \}\)/)
  assert.match(warningWrapper, /<CheckGroup v-bind="\$attrs" :host="warningListHost" v-on="\$listeners" \/>/)
})

test('exports CheckGroup through the check-group package subpath', async () => {
  const packageJson = JSON.parse(await readFile(packageUrl, 'utf8'))

  assert.equal(
    packageJson.exports['./forewarning-management/warning-list/check-group'],
    './src/forewarning-management/warning-list/CheckGroup.vue',
  )
})
