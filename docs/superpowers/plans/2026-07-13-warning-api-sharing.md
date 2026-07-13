# 预警 API 共享化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目标：** 把两个应用重复维护的 `src/http/videoWarning/warning-api.js` 提取到 `@link/warning-feature`，保留原应用导入路径和运行行为，实现预警 API 只维护一份源码。

**架构：** `@link/warning-feature` 提供无宿主别名依赖的 `createVideoWarningApi(dependencies)` 工厂。两个应用原路径只保留相同的绑定 shim，把各自的请求工具、查询序列化和文件下载能力显式传入工厂；现有页面继续从 `@/http/videoWarning/warning-api` 导入，不需要批量修改业务页面。

**技术栈：** Vue 2.7.16、Node.js 18+ ESM、pnpm workspace、Rsbuild、Node.js 内置测试运行器。

## 全局约束

- 不修改 `/Users/jxz/project/new/front/project/link-front_new` 和 `/Users/jxz/project/new/front/project/link-warning`。
- 共享包不能导入 `@/`、`apps/`、Vuex store、router 或任一应用内部文件。
- 共享工厂通过参数接收 `axiosParams`、`axiosPost`、`createAxiosFromStore`、`createFormDataAxios`、`qs`、`fileDownload` 和 `createFormData`。
- 以 `apps/link-front/src/http/videoWarning/warning-api.js` 为功能超集，共享 API 固定导出 54 个方法。
- `link-warning` 获得 6 个当前未使用的模型技能配置接口属于向后兼容的契约扩展。
- 两个应用的绑定 shim 必须逐字一致，现有业务调用方不改导入路径。
- 每个任务结束运行聚焦测试；最终必须通过根测试、两个生产构建和来源摘要校验。
- 不在本阶段迁移 `ForewarningManagement` 页面、Vuex 模块、路由或公共请求实现。

---

## 文件结构

```text
packages/warning-feature/
|-- package.json
`-- src/video-warning/
    |-- createVideoWarningApi.js
    `-- createVideoWarningApi.test.mjs

apps/link-front/src/http/videoWarning/warning-api.js
apps/link-warning/src/http/videoWarning/warning-api.js
scripts/migration/video-warning-sharing.test.mjs
package.json
```

---

### Task 1: 建立共享工厂契约和失败测试

**文件：**
- 修改：`packages/warning-feature/package.json`
- 创建：`packages/warning-feature/src/video-warning/createVideoWarningApi.test.mjs`
- 修改：`package.json`

**接口：**
- 产出：包导出 `@link/warning-feature/video-warning`
- 产出：`createVideoWarningApi(dependencies): VideoWarningApi`

- [ ] **步骤 1：声明共享包导出**

把 `packages/warning-feature/package.json` 改为：

```json
{
  "name": "@link/warning-feature",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    "./video-warning": "./src/video-warning/createVideoWarningApi.js"
  }
}
```

- [ ] **步骤 2：在根目录增加共享包测试命令**

在根 `package.json` 的 `scripts` 中增加：

```json
"test:warning-feature": "node --test packages/warning-feature/**/*.test.mjs",
"test": "pnpm test:migration && pnpm test:warning-feature"
```

- [ ] **步骤 3：编写失败测试**

创建 `packages/warning-feature/src/video-warning/createVideoWarningApi.test.mjs`。测试使用真实 spy 函数，不 mock 模块系统：

```js
import assert from 'node:assert/strict'
import test from 'node:test'

import { createVideoWarningApi } from './createVideoWarningApi.js'

const expectedExports = [
  'getWarningTypeList',
  'getWarningTypeListAllTenant',
  'addCamera',
  'deleteCamera',
  'batchDeleteCamera',
  'cameraList',
  'exportCameraList',
  'downloadCameraTemplate',
  'importCameraList',
  'clientWarningList',
  'clientWarningAudit',
  'maintenanceWarningAudit',
  'maintenanceWarningList',
  'machineList',
  'addMachine',
  'deleteMachine',
  'allMachineList',
  'allWarningList',
  'allWarningAudit',
  'machineIndustryList',
  'machineCompanyList',
  'machineRegionList',
  'machineProvinceList',
  'warningStatusList',
  'machineTypeYear',
  'machineRank',
  'saveOrUpdateAiSkill',
  'deleteAiAuditSkill',
  'aiAuditSkillList',
  'videoModelSkillGlobalQuery',
  'deleteVideoModelSkillGlobal',
  'saveOrUpdateVideoModelSkillGlobal',
  'videoModelSkillTenantQuery',
  'deleteVideoModelSkillTenant',
  'saveOrUpdateVideoModelSkillTenant',
  'attentionAlarm',
  'batchAttentionAlarm',
  'batchAttentionAlarmInternal',
  'exportWarningData',
  'exportWarningTrend',
  'exportWarningProcess',
  'exportOrgWarning',
  'exportPointWarning',
  'exportWarningType',
  'exportWarningLevel',
  'saveOrUpdateVideoSiren',
  'deleteVideoSiren',
  'queryVideoSiren',
  'batchDeleteWarningProcess',
  'uploadWarningImage',
  'queryWarningDetailById',
  'saveOrUpdateCardSiren',
  'queryCardSiren',
  'deleteCardSiren',
].sort()

function createFixture() {
  const calls = []
  const axios = {
    request: async config => {
      calls.push(['request', config])
      return {
        data: new Blob(['file']),
        headers: { 'content-disposition': 'attachment; filename=alarms.xlsx' },
      }
    },
  }
  const dependencies = {
    axiosParams: (...args) => { calls.push(['axiosParams', ...args]); return args },
    axiosPost: (...args) => { calls.push(['axiosPost', ...args]); return args },
    createAxiosFromStore: () => axios,
    createFormDataAxios: () => ({ kind: 'formAxios' }),
    qs: { stringify: params => new URLSearchParams(params).toString() },
    fileDownload: (...args) => calls.push(['fileDownload', ...args]),
    createFormData: () => new FormData(),
  }
  return { api: createVideoWarningApi(dependencies), calls }
}

test('返回固定的 54 个预警 API', () => {
  const { api } = createFixture()
  assert.deepEqual(Object.keys(api).sort(), expectedExports)
})

test('普通查询通过 axiosParams 保持原参数顺序', () => {
  const { api, calls } = createFixture()
  const params = { pageNum: 1 }
  api.cameraList(params)
  assert.deepEqual(calls[0], ['axiosParams', 'get', 'videoCamera/pageQueryCamera', params])
})

test('JSON 提交使用宿主 axios 和 axiosPost', () => {
  const { api, calls } = createFixture()
  const params = { id: '1' }
  api.addCamera(params)
  assert.equal(calls[0][0], 'axiosPost')
  assert.equal(calls[0][2], 'videoCamera/saveOrUpdateCamera')
  assert.equal(calls[0][3], params)
})

test('导出接口完成请求、文件名解析和下载', async () => {
  const { api, calls } = createFixture()
  const filename = await api.exportCameraList({ keyword: 'test' })
  assert.equal(filename, '摄像头列表.xlsx')
  assert.equal(calls.at(-1)[0], 'fileDownload')
})

test('文件导入使用宿主 FormData 工厂', () => {
  const { api, calls } = createFixture()
  const file = new Blob(['camera'])
  api.importCameraList(file)
  assert.equal(calls[0][0], 'axiosPost')
  assert.equal(calls[0][2], 'videoCamera/importCamera')
  const storedFile = calls[0][3].get('file')
  assert.equal(storedFile.size, file.size)
  assert.equal(storedFile.type, file.type)
})
```

- [ ] **步骤 4：运行测试并确认失败**

执行：

```bash
pnpm test:warning-feature
```

预期：失败，错误包含 `ERR_MODULE_NOT_FOUND` 和 `createVideoWarningApi.js`。

#### Task 1 续：实现共享预警 API 工厂

**文件：**
- 创建：`packages/warning-feature/src/video-warning/createVideoWarningApi.js`
- 测试：`packages/warning-feature/src/video-warning/createVideoWarningApi.test.mjs`

**接口：**
- 使用：Task 1 定义的 dependencies
- 产出：包含固定 54 个方法的纯 JavaScript 对象

- [ ] **步骤 1：从完整版复制功能超集**

以 `apps/link-front/src/http/videoWarning/warning-api.js` 为唯一实现基线，执行以下机械转换：

1. 删除顶部 `qs` 和 `../common/utils` imports。
2. 增加 `export function createVideoWarningApi(dependencies) { ... }`。
3. 在工厂内解构：

```js
const {
  axiosParams,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
  qs,
  fileDownload,
  createFormData,
} = dependencies
```

4. 把两个 helper 和 54 个函数原样放入工厂，删除函数前的 `export`。
5. 把 `require('js-file-download')` 删除，直接调用注入的 `fileDownload`。
6. 把 `new FormData()` 改为 `createFormData()`。
7. 在工厂末尾明确返回全部 54 个函数，顺序与 Task 1 的 `expectedExports` 一致。

不得改接口 URL、HTTP method、参数位置、导出文件名或响应处理逻辑。

- [ ] **步骤 2：增加依赖契约校验**

在工厂入口验证七个依赖存在且类型正确。缺少依赖时抛出：

```js
throw new TypeError(`createVideoWarningApi: ${name} must be provided`)
```

其中 `qs` 必须包含 `stringify` 函数，其余依赖均为函数。

- [ ] **步骤 3：增加缺失依赖测试**

在测试文件增加：

```js
test('缺少宿主依赖时给出明确错误', () => {
  assert.throws(
    () => createVideoWarningApi({}),
    /createVideoWarningApi: axiosParams must be provided/,
  )
})
```

- [ ] **步骤 4：运行共享包测试**

执行：

```bash
pnpm test:warning-feature
```

预期：6 项测试通过，0 项失败。

- [ ] **步骤 5：提交共享工厂**

```bash
git add package.json packages/warning-feature
git commit -m "feat: add shared video warning API factory"
```

---

### Task 2: 用相同 shim 接入两个应用

**文件：**
- 修改：`apps/link-front/src/http/videoWarning/warning-api.js`
- 修改：`apps/link-warning/src/http/videoWarning/warning-api.js`
- 创建：`scripts/migration/video-warning-sharing.test.mjs`
- 修改：`package.json`

**接口：**
- 使用：`createVideoWarningApi()`
- 保持：现有 `@/http/videoWarning/warning-api` 导入路径和 54 个 named exports

- [ ] **步骤 1：编写失败的共享边界测试**

测试必须断言：

- 两个应用 shim 内容逐字一致。
- shim 从 `@link/warning-feature/video-warning` 导入工厂。
- shim 只导入 `qs`、`js-file-download`、本地 `../common/utils` 和共享工厂。
- 共享工厂源码不包含 `@/`、`apps/`、`../common/utils`、`vuex` 或 `router`。
- 两个应用源码树中，`warning-api.js` 之外不存在第二份 `createVideoWarningApi` 实现。

把该文件加入 `test:migration` 已有 glob，无需修改 glob。

执行：

```bash
node --test scripts/migration/video-warning-sharing.test.mjs
```

预期：失败，因为两个应用仍包含各自完整实现。

- [ ] **步骤 2：创建统一绑定 shim**

两个应用的 `warning-api.js` 内容必须完全相同：

```js
import fileDownload from 'js-file-download'
import qs from 'qs'
import { createVideoWarningApi } from '@link/warning-feature/video-warning'
import {
  axiosParams,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
} from '../common/utils'

const api = createVideoWarningApi({
  axiosParams,
  axiosPost,
  createAxiosFromStore,
  createFormDataAxios,
  qs,
  fileDownload,
  createFormData: () => new FormData(),
})

export const {
  getWarningTypeList,
  getWarningTypeListAllTenant,
  addCamera,
  deleteCamera,
  batchDeleteCamera,
  cameraList,
  exportCameraList,
  downloadCameraTemplate,
  importCameraList,
  clientWarningList,
  clientWarningAudit,
  maintenanceWarningAudit,
  maintenanceWarningList,
  machineList,
  addMachine,
  deleteMachine,
  allMachineList,
  allWarningList,
  allWarningAudit,
  machineIndustryList,
  machineCompanyList,
  machineRegionList,
  machineProvinceList,
  warningStatusList,
  machineTypeYear,
  machineRank,
  saveOrUpdateAiSkill,
  deleteAiAuditSkill,
  aiAuditSkillList,
  videoModelSkillGlobalQuery,
  deleteVideoModelSkillGlobal,
  saveOrUpdateVideoModelSkillGlobal,
  videoModelSkillTenantQuery,
  deleteVideoModelSkillTenant,
  saveOrUpdateVideoModelSkillTenant,
  attentionAlarm,
  batchAttentionAlarm,
  batchAttentionAlarmInternal,
  exportWarningData,
  exportWarningTrend,
  exportWarningProcess,
  exportOrgWarning,
  exportPointWarning,
  exportWarningType,
  exportWarningLevel,
  saveOrUpdateVideoSiren,
  deleteVideoSiren,
  queryVideoSiren,
  batchDeleteWarningProcess,
  uploadWarningImage,
  queryWarningDetailById,
  saveOrUpdateCardSiren,
  queryCardSiren,
  deleteCardSiren,
} = api
```

- [ ] **步骤 3：运行共享边界和工厂测试**

执行：

```bash
node --test scripts/migration/video-warning-sharing.test.mjs
pnpm test:warning-feature
pnpm test:migration
```

预期：全部通过。

- [ ] **步骤 4：提交两个应用接入**

```bash
git add apps/*/src/http/videoWarning/warning-api.js scripts/migration/video-warning-sharing.test.mjs
git commit -m "refactor: share video warning API implementation"
```

---

### Task 3: 双应用构建和共享结果验收

**文件：**
- 修改：`docs/migration/shared-source-audit.json`
- 创建：`docs/migration/warning-api-sharing-verification.md`

**接口：**
- 产出：共享 API 验收记录
- 保持：两个生产构建、来源项目只读、工作树干净

- [ ] **步骤 1：执行完整测试和双构建**

```bash
pnpm test
pnpm build
```

预期：所有测试通过，两个应用构建退出码为 0。

- [ ] **步骤 2：重新生成审计结果**

```bash
pnpm audit:shared
```

预期：`http/videoWarning/warning-api.js` 从 `differentFiles` 移动到 `identicalFiles`。

- [ ] **步骤 3：验证原来源目录仍未变化**

重新实时采集两个来源 manifest 到 `/tmp`，与 `docs/migration/source-before.json` 比较。不能只比较已提交的 before/after 文件。

预期：输出 `来源目录未发生变化`。

- [ ] **步骤 4：写入中文验收记录**

`docs/migration/warning-api-sharing-verification.md` 必须记录：

- 执行日期、Node/pnpm 版本。
- 共享包文件和两个 shim 路径。
- 54 个共享导出名称。
- 测试数量和退出码。
- 两个构建退出码及两个 `index.html` SHA-256。
- 更新前后审计中 `warning-api.js` 的分类变化。
- 实时来源摘要比较结果。

- [ ] **步骤 5：提交验收结果**

```bash
git add docs/migration/shared-source-audit.json docs/migration/warning-api-sharing-verification.md
git commit -m "docs: verify shared video warning API"
```

- [ ] **步骤 6：确认工作树干净**

```bash
git status --short
```

预期：无输出。
