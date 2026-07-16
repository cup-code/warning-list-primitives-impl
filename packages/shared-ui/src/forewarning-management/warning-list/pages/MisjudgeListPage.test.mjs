import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const sharedPageUrl = new URL('./MisjudgeListPage.vue', import.meta.url)
const packageUrl = new URL('../../../../package.json', import.meta.url)

// Derived from commit 2d1ba55's normalized pre-extraction link-warning route
// page: strip imports and the legacy beforeRouteLeave boundary, replace its
// router push
// with __PUSH_WARNING_DETAIL__, trim line endings/space, then SHA-256 the full
// remaining script, template, and scoped style. The shared transform below
// reverses only the approved extraction adaptations into that same form.
const preExtractionSemanticSha256
  = '6d0e1efca7af66fb581cda88a3f18969dadc6f71f81976f22421c98a77836ce9'

const read = url => readFile(url, 'utf8')

function normalizeSharedPageToLegacySemantics(source) {
  let normalized = source.replace(/\r\n/g, '\n')

  normalized = normalized.replace(/^import[\s\S]*?from\s+['"][^'"]+['"]\n/gm, '')

  normalized = normalized
    .replace(/\n  props: \{\n    host: \{\n      type: Object,\n      required: true,\n    \},\n  \},/, '')
    .replace(/setup\(props\) \{\n    const \{ proxy \} = getCurrentInstance\(\)\n    const \{ host \} = props\n    validateMisjudgeListHost\(host, 'MisjudgeListPage'\)/, 'setup() {\n    const { proxy } = getCurrentInstance()')
    .replace(/\n    handleRouteLeave\(to, from, next\) \{[\s\S]*?\n    \},\n    handleBatchProcess/, '\n    handleBatchProcess')
    .replace(/host\.(tenantControlList|getDepartListSimple|getUserListByRoleFn|allWarningList|getStorageItem|setStorageItem|delStorageItem)/g, '$1')
    .replace(/host\.warningListHost\.pushWarningDetail\(item\)/g, '__PUSH_WARNING_DETAIL__')
    .replace(/host\.warningListHost\.getDictList/g, '$dictUtils.getDictList')
    .replace(/moment\((value\[[01]\])\)\.format\('YYYY-MM-DD HH:mm:ss'\)/g, 'proxy.$formatDate($1)')
    .replace(/batchSelection/g, 'batchInfo')
    .replace(/List: ForewarningList/g, 'List')
    .replace(/\n\s*:(?:host|all-machine-list-api|machine-list-api|batch-attention-alarm|batch-attention-alarm-internal)="[^"]+"/g, '')

  return normalized.replace(/[ \t]+$/gm, '').replace(/\s+/g, ' ').trim()
}

test('declares and validates the required host boundary', async () => {
  const source = await read(sharedPageUrl)

  assert.match(source, /host:\s*\{\s*type:\s*Object,\s*required:\s*true,?\s*\}/)
  assert.match(source, /validateMisjudgeListHost\(host,\s*'MisjudgeListPage'\)/)
  assert.match(source, /import \{ validateMisjudgeListHost \} from '\.\/misjudgeListHostCapabilities\.js'/)
})

test('uses shared imports and exposes the package page subpath', async () => {
  const [source, packageSource] = await Promise.all([
    read(sharedPageUrl),
    read(packageUrl),
  ])
  const manifest = JSON.parse(packageSource)

  assert.match(source, /from '@link\/warning-feature\/batch-selection'/)
  assert.match(source, /WarningInfo from '\.\.\/WarningInfo\.vue'/)
  assert.match(source, /CheckGroup from '\.\.\/CheckGroup\.vue'/)
  assert.match(source, /ForewarningList from '\.\.\/ForewarningList\.vue'/)
  assert.match(source, /SelectMachine from '\.\.\/\.\.\/SelectMachine\.vue'/)
  assert.match(source, /BatchDeal from '\.\.\/\.\.\/BatchDeal\.vue'/)
  assert.match(source, /WarningListConfig[\s\S]*from '\.\/warningListTableConfig\.js'/)
  assert.match(source, /runMisjudgeRouteLeave[\s\S]*from '\.\/misjudgeRouteLeave\.js'/)
  assert.equal(
    manifest.exports['./forewarning-management/warning-list/pages/misjudge'],
    './src/forewarning-management/warning-list/pages/MisjudgeListPage.vue',
  )
})

test('locks the approved mixin, component, date, and storage adaptations', async () => {
  const source = await read(sharedPageUrl)

  assert.match(source, /mixins:\s*\[batchSelection\],/)
  assert.doesNotMatch(source, /\bbatchInfo\b/)
  assert.match(source, /components:\s*\{[\s\S]*?\bList:\s*ForewarningList,[\s\S]*?\}/)
  assert.doesNotMatch(source, /components:\s*\{[\s\S]*?\n\s*List,\s*\n[\s\S]*?\}/)

  assert.match(
    source,
    /form\.value\.alarmDateStart\s*=\s*moment\(value\[0\]\)\.format\('YYYY-MM-DD HH:mm:ss'\)/,
  )
  assert.match(
    source,
    /form\.value\.alarmDateEnd\s*=\s*moment\(value\[1\]\)\.format\('YYYY-MM-DD HH:mm:ss'\)/,
  )
  assert.doesNotMatch(source, /\$formatDate/)

  const storageCalls = [
    ...source.matchAll(/(?:(\b[\w$]+)\.)?(getStorageItem|setStorageItem|delStorageItem)\s*\(/g),
  ]
  assert.ok(storageCalls.length > 0)
  for (const [, qualifier, capability] of storageCalls) {
    assert.equal(qualifier, 'host', `${capability} must be called through host`)
  }
  assert.doesNotMatch(
    source,
    /(?<!host\.)\b(?:getStorageItem|setStorageItem|delStorageItem)\s*\(/,
  )
})

test('routes queries, storage, navigation, dictionaries, and child APIs through host', async () => {
  const source = await read(sharedPageUrl)

  for (const capability of [
    'tenantControlList',
    'getDepartListSimple',
    'getUserListByRoleFn',
    'allWarningList',
    'getStorageItem',
    'setStorageItem',
    'delStorageItem',
  ]) {
    assert.match(source, new RegExp(`host\\.${capability}\\(`))
  }

  assert.match(source, /<SelectMachine[\s\S]*:all-machine-list-api="host\.allMachineList"[\s\S]*:machine-list-api="host\.machineList"/)
  assert.match(source, /<BatchDeal[\s\S]*:batch-attention-alarm="host\.batchAttentionAlarm"[\s\S]*:batch-attention-alarm-internal="host\.batchAttentionAlarmInternal"/)
  for (const tag of ['CheckGroup', 'WarningInfo', 'List']) {
    assert.match(source, new RegExp(`<${tag}\\b[^>]*:host="host\\.warningListHost"[^>]*>`))
  }
  assert.match(source, /host\.warningListHost\.pushWarningDetail\(item\)/)
  assert.match(source, /host\.warningListHost\.getDictList\('InternalStatus'\)/)
  assert.match(source, /host\.warningListHost\.getDictList\('CustomerStatus'\)/)
  assert.match(source, /host\.warningListHost\.getDictList\('AiJudge'\)/)

  const executableSource = source.replace(/\/\/.*$/gm, '')
  assert.doesNotMatch(executableSource, /@\/|apps\/|\$router|\$dictUtils|localStorage|sessionStorage/)
})

test('preserves cache, query, refresh, layout, and selection contracts', async () => {
  const source = await read(sharedPageUrl)

  for (const key of ['misjudgeListFilter', 'misjudgeListChecked', 'misjudgeListStatus']) {
    assert.match(source, new RegExp(`['"]${key}['"]`))
  }
  assert.equal((source.match(/delStorageItem\('misjudgeListFilter'\)/g) || []).length, 3)
  assert.match(source, /pageNum:\s*1,\s*pageSize:\s*12,\s*customerStatus:\s*\['3'\]/)
  for (const queryKey of ['tenantList', 'peopleList', 'misjudgeList', 'departmentList']) {
    assert.match(source, new RegExp(`queryKey: \\['${queryKey}'`))
  }
  assert.match(source, /setInterval\(\(\) => \{\s*refetch\(\)\s*\}, 30000\)/)
  assert.match(source, /cacheTime:\s*24 \* 60 \* 60 \* 1000/)
  assert.match(source, /const layout = ref\('card'\)/)
  assert.match(source, /v-if="layout === 'card'"/)
  assert.match(source, /ref="tableRef"/)
  for (const handler of ['handleCheckAllChange', 'handleChecked', 'onSelected', 'cancelBatch']) {
    assert.match(source, new RegExp(`${handler}\\(`))
  }
})

test('exposes route-leave handling through the pure helper', async () => {
  const source = await read(sharedPageUrl)

  assert.match(source, /handleRouteLeave\(to, from, next\) \{/)
  assert.match(source, /runMisjudgeRouteLeave\(\{\s*to,\s*clearCache:\s*this\.clearCache,\s*next,?\s*\}\)/)
  assert.doesNotMatch(source, /beforeRouteLeave\s*\(/)
})

test('matches the immutable full-semantics snapshot of the pre-extraction common page', async () => {
  const sharedSource = await read(sharedPageUrl)
  const normalized = normalizeSharedPageToLegacySemantics(sharedSource)
  const actualSha256 = createHash('sha256').update(normalized).digest('hex')

  assert.equal(actualSha256, preExtractionSemanticSha256)
  assert.match(sharedSource, /<template>[\s\S]*<KyTreeTable[\s\S]*<\/template>/)
  assert.match(sharedSource, /<style lang="scss" scoped>[\s\S]*\.warning-checkbox-wrapper[\s\S]*::v-deep\.el-checkbox/)
})
