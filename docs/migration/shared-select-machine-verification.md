# 一体机选择组件共享验证

## 范围

- `packages/shared-ui/src/forewarning-management/SelectMachine.vue`
- `packages/shared-ui/src/forewarning-management/selectMachineLogic.js`
- 两个应用原 `ForewarningManagement/components/selectMachine.vue`

## 机械对照

- 公共 Props 保持 `value`、`type`、`disabled`；共享实现另外接收宿主注入的 `allMachineListApi` 与 `machineListApi`。
- 普通模式和 `all` 模式都使用 `{ isPage: false }` 查询参数；普通模式读取 `response.data.result.list`，`all` 模式读取 `response.data.result`，失败响应不更新列表。
- 根节点仍为 `div`，Element UI 结构仍为 `el-select` 包含 `el-option`；保留 `clearable`、禁用态、`item.id` 值、`item.machineName` 标签和“请选择所属一体机”中文文案。
- 可执行测试直接覆盖查询 API 选择、响应解析、名称恢复，以及从列表查找完整一体机对象（未匹配时为 `undefined`）的纯辅助函数。SFC 的值同步与 `change` 发射、包装层的 Props、`$attrs`、`$listeners` 透传仅通过源码契约检查确认相应实现仍存在；本次未挂载 Vue 组件直接执行这些运行时行为。
- 两个包装层 SHA-256 均为 `36a01ff9d3a3055510bcb54c8688e3b82b7dd5bc001019e269765058f5b52be4`，逐字一致；它们只负责导入共享组件、注入宿主 `allMachineList`/`machineList` API，并透传 Props、`$attrs` 和 `$listeners`。
- 对两个共享源码执行宿主路径/模块扫描，未命中 `apps/link-`、`@/`、`~/`、`src/`、`http/`、`store` 或 `router` 耦合。

## 验证结果

- 选择器测试：`NPM_AUTH=verify node --test scripts/migration/shared-select-machine.test.mjs` 退出码 0，5/5 通过，0 失败；其中纯辅助函数由测试直接执行，SFC 与两个包装层未被挂载，仅有选定实现约束通过源码文本断言检查。
- 全量迁移测试：作为 `NPM_AUTH=verify pnpm test` 的 `test:migration` 阶段执行，28/28 通过，0 失败。
- 全量测试：`NPM_AUTH=verify pnpm test` 退出码 0；`test:migration` 28/28、`test:warning-feature` 20/20，共 48/48 通过，0 失败。
- 生产构建：`NPM_AUTH=verify pnpm build` 首次与最终复验均退出码 0，验证共享 SFC 与两个包装层能够在两应用中成功编译打包，但不等同于挂载后的交互行为测试。首次运行中 `link-front` 在 41.8 秒完成、`link-warning` 在 7.72 秒完成；最终复验中 `link-front` 在 26.8 秒完成且 `link-warning` 也成功完成。产物分别生成于 `dist/link-front` 和 `dist/link-warning`。构建期间出现工作区应用 `resolutions` 字段不生效及 `dist` 不位于应用根目录、不会自动清理的既有警告。
- 共享源审计：`pnpm audit:shared` 退出码 0，输出 `{"smaller":477,"larger":1865,"common":470,"identical":323,"different":147,"smallerOnly":7,"largerOnly":1395}`；两个应用的 `views/ForewarningManagement/components/selectMachine.vue` 被列为相同文件，业务实现位于 `packages/shared-ui`。
- 来源基线授权刷新：首次重新生成 `docs/migration/source-after.json` 后，`pnpm verify:sources` 曾以退出码 1 输出 `warning: 内容摘要变化`。核对发现 `front` 仍为 2426 个文件且摘要相同，外部原始目录 `link-warning` 从旧基线 576 个文件变为 579 个文件：`src/http/videoWarning/warning-api.js` 内容变化，并新增 `src/views/ForewarningManagement/SkillConfiguration.vue`、`src/views/ForewarningManagement/SkillConfigurationGlobal.vue`、`src/views/ForewarningManagement/components/AddModelSkill.vue`。用户随后明确授权把当前外部变化作为新来源基线；本任务从同一次当前来源采集结果刷新 `docs/migration/source-before.json` 和 `docs/migration/source-after.json`，两文件 SHA-256 均为 `986f8d5d62fef7fcdf42599534f596415d218c74a4f8d3db85cfc818ce65b2b0`。本任务未修改原始来源目录。
- 来源校验：授权刷新后执行 `pnpm verify:sources` 退出码 0，实际输出 `来源目录未发生变化`。
- 全量测试同时输出 Node.js `buffer.File` 的 `ExperimentalWarning`，不影响测试退出码和通过数量。
- 最终差异检查：`git diff --check` 退出码 0、无输出；提交前 `git status --short` 只列出修改的 `docs/migration/source-before.json`、`docs/migration/source-after.json` 和新增的本验证记录。`docs/migration/shared-source-audit.json` 经重新生成后与当前提交内容相同，因此没有工作树差异。
- 未设置 `NPM_AUTH` 的 `pnpm audit:shared` 与 `pnpm verify:sources` 均输出 `.npmrc` 中 `${NPM_AUTH}` 无法替换的警告；审计仍退出 0，来源校验的失败原因仍为上述内容摘要变化。

## 未纳入范围

未修改现有调用页面、HTTP 模块、Store、Router、其他候选共享组件或错误提示策略。
