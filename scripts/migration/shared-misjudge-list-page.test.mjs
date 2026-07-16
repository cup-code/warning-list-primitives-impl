import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const apps = ['link-warning', 'link-front']
const pageRoot = 'src/views/ForewarningManagement'
const sharedRoot
  = 'packages/shared-ui/src/forewarning-management/warning-list/pages'
const migrationBaseline = '8b501c3'
const otherListPages = [
  'warningList.vue',
  'customMisjudgeList.vue',
  'clientWarningList.vue',
  'attentionList.vue',
  'allTenantWaringList.vue',
]
const hostKeys = [
  'tenantControlList',
  'getDepartListSimple',
  'getUserListByRoleFn',
  'allWarningList',
  'getStorageItem',
  'setStorageItem',
  'delStorageItem',
  'allMachineList',
  'machineList',
  'batchAttentionAlarm',
  'batchAttentionAlarmInternal',
  'warningListHost',
]
const expectedRouteGuardBody = `const page = this.$refs.page
    if (!page) {
      if (process.env.NODE_ENV !== 'production') {
        throw new Error('[MisjudgeListRoute] shared page ref is unavailable')
      }
      next()
      return undefined
    }
    return page.handleRouteLeave(to, from, next)`

async function source(relativePath) {
  try {
    return await readFile(path.join(root, relativePath), 'utf8')
  }
  catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

function assertSource(value, label) {
  assert.notEqual(value, null, `${label} should exist`)
  return value
}

function exportedObjectKeys(value, label) {
  const object = value.match(/const\s+misjudgeListHost\s*=\s*{([\s\S]*?)\n}/)
  assert.ok(object, `${label} should define the named misjudgeListHost object`)
  return object[1]
    .split('\n')
    .map(line => line.match(/^\s{2}([A-Za-z_$][\w$]*)\s*(?::|,)/)?.[1])
    .filter(Boolean)
}

function methodBody(value, signature, label) {
  const start = value.indexOf(signature)
  assert.notEqual(start, -1, `${label} should exist`)
  const openingBrace = value.indexOf('{', start + signature.length)
  assert.notEqual(openingBrace, -1, `${label} should have a body`)

  let depth = 0
  for (let index = openingBrace; index < value.length; index += 1) {
    if (value[index] === '{') depth += 1
    if (value[index] === '}') depth -= 1
    if (depth === 0) return value.slice(openingBrace + 1, index).trim()
  }

  assert.fail(`${label} body should be closed`)
}

test('shared-ui exports the shared misjudge page and warning table config', async () => {
  const manifest = JSON.parse(await source('packages/shared-ui/package.json'))
  assert.equal(
    manifest.exports['./forewarning-management/warning-list/pages/misjudge'],
    './src/forewarning-management/warning-list/pages/MisjudgeListPage.vue',
  )
  assert.equal(
    manifest.exports['./forewarning-management/warning-list/warning-table-config'],
    './src/forewarning-management/warning-list/pages/warningListTableConfig.js',
  )
})

test('shared misjudge sources exist without application imports', async () => {
  for (const file of [
    'MisjudgeListPage.vue',
    'misjudgeListHostCapabilities.js',
    'warningListTableConfig.js',
  ]) {
    const value = assertSource(await source(`${sharedRoot}/${file}`), file)
    assert.doesNotMatch(value, /@\//, `${file} must not import from @/`)
    assert.doesNotMatch(value, /apps\//, `${file} must not import from apps/`)
  }
})

test('both original routes are identical thin shared-page wrappers', async () => {
  const wrappers = []
  for (const app of apps) {
    const label = `${app}/misjudgeList.vue`
    const value = assertSource(
      await source(`apps/${app}/${pageRoot}/misjudgeList.vue`),
      label,
    )
    assert.match(
      value,
      /import\s+MisjudgeListPage\s+from\s+['"]@link\/shared-ui\/forewarning-management\/warning-list\/pages\/misjudge['"]/,
      `${label} should import the shared page`,
    )
    assert.match(
      value,
      /import\s+misjudgeListHost\s+from\s+['"]\.\/misjudgeListHost['"]/,
      `${label} should import its host`,
    )
    assert.match(value, /ref=['"]page['"]/, `${label} should expose the page ref`)
    assert.match(value, /v-bind=['"]\$attrs['"]/, `${label} should forward attrs`)
    assert.match(value, /v-on=['"]\$listeners['"]/, `${label} should forward listeners`)
    assert.equal(
      methodBody(
        value,
        'beforeRouteLeave(to, from, next)',
        `${label} beforeRouteLeave`,
      ),
      expectedRouteGuardBody,
      `${label} should preserve the complete approved route guard`,
    )
    wrappers.push(value)
  }
  assert.equal(wrappers[0], wrappers[1], 'application wrappers should be byte-identical')
})

test('both applications expose the identical exact twelve-key host', async () => {
  const hosts = []
  for (const app of apps) {
    const label = `${app}/misjudgeListHost.js`
    const value = assertSource(
      await source(`apps/${app}/${pageRoot}/misjudgeListHost.js`),
      label,
    )
    assert.deepEqual(exportedObjectKeys(value, label), hostKeys, `${label} keys`)
    assert.match(
      value,
      /^export default misjudgeListHost\s*$/m,
      `${label} should default-export the named host object`,
    )
    hosts.push(value)
  }
  assert.equal(hosts[0], hosts[1], 'application hosts should be byte-identical')
})

test('application configs preserve exact shared and local ownership', async () => {
  for (const app of apps) {
    const value = assertSource(
      await source(`apps/${app}/${pageRoot}/config.js`),
      `${app}/config.js`,
    )
    assert.match(
      value,
      /import\s*{\s*WarningListConfig\s*}\s*from\s*['"]@link\/shared-ui\/forewarning-management\/warning-list\/warning-table-config['"]/,
      `${app} config should import shared WarningListConfig`,
    )
    assert.match(
      value,
      /import\s*{\s*tableListConfig\s*}\s*from\s*['"]@link\/shared-ui\/forewarning-management\/warning-list\/table-config['"]/,
      `${app} config should keep the established shared tableListConfig import`,
    )
    assert.doesNotMatch(value, /const\s+WarningListConfig\s*=/)
    assert.match(value, /const\s+cameraListConfig\s*=/, `${app} camera config ownership`)
    assert.match(value, /const\s+machineListConfig\s*=/, `${app} machine config ownership`)
    if (app === 'link-front') {
      assert.match(value, /const\s+cardSirenColumns\s*=/, 'front card siren ownership')
    }
    else {
      assert.doesNotMatch(value, /\bcardSirenColumns\b/, 'warning must not own card siren columns')
    }

    const exportBlock = value.match(/export\s*{([\s\S]*?)}/)
    assert.ok(exportBlock, `${app} config should retain named exports`)
    const expectedExports = [
      'WarningListConfig',
      'cameraListConfig',
      'machineListConfig',
      'tableListConfig',
      ...(app === 'link-front' ? ['cardSirenColumns'] : []),
    ]
    for (const symbol of expectedExports) {
      assert.match(exportBlock[1], new RegExp(`\\b${symbol}\\b`), `${app} should export ${symbol}`)
    }
  }
})

test('the other five list-page pairs keep using their local config boundary', async () => {
  for (const app of apps) {
    for (const page of otherListPages) {
      const value = assertSource(
        await source(`apps/${app}/${pageRoot}/${page}`),
        `${app}/${page}`,
      )
      assert.doesNotMatch(
        value,
        /@link\/shared-ui\/forewarning-management\/warning-list\/pages\/misjudge/,
        `${app}/${page} must not import the shared misjudge page`,
      )
    }
  }
})

test('implementation diff leaves routers and the other five list pages untouched', () => {
  const committed = execFileSync(
    'git',
    ['diff', '--name-only', `${migrationBaseline}..HEAD`],
    { cwd: root, encoding: 'utf8' },
  )
  const working = execFileSync('git', ['diff', '--name-only', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  })
  const untracked = execFileSync(
    'git',
    ['ls-files', '--others', '--exclude-standard'],
    { cwd: root, encoding: 'utf8' },
  )
  const changed = new Set(
    `${committed}\n${working}\n${untracked}`.split('\n').filter(Boolean),
  )
  const forbidden = [...changed].filter((file) => {
    if (/^apps\/(?:link-warning|link-front)\/src\/router\//.test(file)) return true
    return apps.some(app => otherListPages.some(
      page => file === `apps/${app}/${pageRoot}/${page}`,
    ))
  })
  assert.deepEqual(forbidden, [], 'router and non-target list pages must stay outside the diff')
})
