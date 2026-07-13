# 预警共享状态逻辑验证

## 验收环境

- 执行日期：2026-07-13
- Node.js：v18.20.3
- pnpm：10.14.0
- 共享实现：`packages/warning-feature/src/state`
- 应用接入：两个应用保留原 Store 路径作为兼容 shim

## 共享路径与包导出

批量选择 mixin 的共享实现位于
`packages/warning-feature/src/state/batchSelection.js`，由
`@link/warning-feature/batch-selection` 导出。预警详情 Vuex 工厂的共享实现位于
`packages/warning-feature/src/state/createDetailInfoModule.js`，由
`@link/warning-feature/detail-info` 导出。

两个应用均保留原路径以兼容现有引用：

- `views/ForewarningManagement/store/batchInfo.js` 直接默认转发
  `@link/warning-feature/batch-selection`。
- `views/ForewarningManagement/store/detailInfo.js` 从各自宿主的
  `@/http/videoWarning/warning-api` 导入 7 个 API，传入共享
  `createDetailInfoModule` 后默认导出模块实例。

两个应用对应的 `batchInfo.js` 逐字一致，两个 `detailInfo.js` 也逐字一致；共享
工厂不直接引用应用别名或宿主 Store，因此保留了原路径兼容性和宿主依赖边界。

## 测试与构建

| 验收项 | 结果 | 退出码 |
| --- | --- | ---: |
| `NPM_AUTH=verify pnpm test` | 迁移/审计测试 21 项、共享预警功能测试 13 项，共 34 项通过，失败 0 项 | 0 |
| `pnpm run build:front`（由首次 `NPM_AUTH=verify pnpm build` 执行） | `link-front` 生产构建完成，用时 34.4 秒 | 0 |
| `pnpm run build:warning`（由首次 `NPM_AUTH=verify pnpm build` 执行） | `link-warning` 生产构建完成，用时 7.16 秒 | 0 |
| 首次 `NPM_AUTH=verify pnpm build` | 两个应用顺序构建完成，整体实际耗时 50.40 秒 | 0 |
| 最终 `NPM_AUTH=verify pnpm build` | `link-front` 20.2 秒、`link-warning` 4.75 秒，整体实际耗时 31.64 秒 | 0 |

构建产物分别位于 `dist/link-front` 和 `dist/link-warning`。构建输出还包含仓库
既有的 `resolutions` 配置位置和 `cleanDistPath` 警告，未导致构建失败。

## detailInfo 机械对照

机械对照以迁移前提交 `93903dc` 中
`apps/link-front/src/views/ForewarningManagement/store/detailInfo.js` 为基线。分别提取
基线文件从 `// 预警等级列表` 到 `export default` 前一换行的内容，以及共享工厂
从同一注释到末尾模块 `return` 前一换行的内容，再进行字节比较和 SHA-256 计算。

- 结果：逐字一致
- 两侧大小：7,792 字节
- 两侧 SHA-256：
  `adb58a263cf346439dca4b6929d67e263d27dd825e91ede53843f1cc3c71be4f`

该范围覆盖原 Vuex 模块的状态、mutations、actions、API 参数处理、commit 顺序和
返回契约；迁移只在范围外增加 7 个宿主 API 的校验/解构边界，并将原默认导出
改为工厂返回值。

## 共享来源审计

执行 `pnpm audit:shared` 成功，审计计数为 `identical` 323、`different` 147、
`common` 470。两个应用的
`views/ForewarningManagement/store/batchInfo.js` 和
`views/ForewarningManagement/store/detailInfo.js` 均位于 `identicalFiles`，且当前
内容分别为相同的共享转发 shim 和相同的宿主注入 shim。

本次重新生成前后，`docs/migration/shared-source-audit.json` 的 SHA-256 均为
`871139ec1cb5d9874058c9683a519d755077cd90d839b04450347bf75552ed99`，因此没有文本
差异。这不表示审计提前记录了共享迁移内容：该比较器只按两个应用的同名文件
内容是否相同来分类。迁移前两份业务实现相同，迁移后两份 shim 仍相同，所以
路径继续留在 `identicalFiles`，分类、计数和稳定排序后的 JSON 均不变。

## 外部来源只读校验

本次重新读取两个外部来源目录生成 `docs/migration/source-after.json`，再执行
`pnpm verify:sources` 与 `docs/migration/source-before.json` 比较。

| 来源 | 文件数 | 基线摘要 | 迁移后摘要 | 结果 |
| --- | ---: | --- | --- | --- |
| `front` | 2426 | `65f3d82a143aa2d48ebf7f46b37e218d0be58cc8add0859fdde7e2034475f214` | `65f3d82a143aa2d48ebf7f46b37e218d0be58cc8add0859fdde7e2034475f214` | 一致 |
| `warning` | 576 | `43461fd48f9c915b24da8de3890536951fc58fc4f54bce12b0dee3121fd12ad0` | `43461fd48f9c915b24da8de3890536951fc58fc4f54bce12b0dee3121fd12ad0` | 一致 |

比较命令退出码为 0，输出：`来源目录未发生变化`。来源项目仅被摘要工具读取，
未被本次迁移修改。

## 结论

批量选择 mixin 与预警详情 Vuex 模块已由共享包导出，两个应用通过原路径 shim
保持兼容。34 项测试、两个应用生产构建、共享审计和外部来源只读校验均通过。

## 未纳入范围

`selectMachine.vue`、报表相关页面以及两个应用中的其他差异页面均未纳入本次
状态逻辑迁移，继续保留在各自应用内。
