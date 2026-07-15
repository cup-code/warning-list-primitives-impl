# 预警批量处理组件共享验证

## 范围

- 公共业务模型：`@link/warning-feature/batch-deal`
- 公共 UI：`@link/shared-ui/forewarning-management/batch-deal`
- 公共 UI：`@link/shared-ui/forewarning-management/deal-dialog`
- 两个应用保留原组件路径，并只通过薄适配器注入各自的预警 API。

## 验证环境

- 验证起点：`cedc47775c99946b2ae75b4fc88c3a71e3eba5d3`
- 验证日期：2026-07-15
- 构建模式：production

旧提交上的失败构建未作为成功证据；以下结果均为锁文件修复后从验证起点重新执行所得。

## 验证结果

### 独立生产构建

- `NPM_AUTH=verify pnpm run build:warning`：PASS（exit 0，Rsbuild 14.0 秒），输出到 `dist/link-warning`。
- `NPM_AUTH=verify pnpm run build:front`：PASS（exit 0，Rsbuild 57.2 秒），输出到 `dist/link-front`。
- `dist/link-warning/index.html` 与 `dist/link-front/index.html` 均存在。
- 两个产物目录互相独立：warning 目录共 196 个文件、约 11 MB；front 目录共 2397 个文件、约 146 MB。

两个构建均提示应用级 `package.json` 中的 `resolutions` 不由 pnpm workspace 根配置生效；Rsbuild 还提示产物目录位于应用 root 之外，因此不会自动清空。它们是现有构建配置警告，不影响本次构建成功与产物目录隔离。

### 单一来源审计

`pnpm audit:shared`：PASS（exit 0），并刷新 `docs/migration/shared-source-audit.json`。实际计数：

| 分类 | 数量 |
| --- | ---: |
| warning 源文件（smaller） | 477 |
| front 源文件（larger） | 1866 |
| 共同路径（common） | 470 |
| 内容相同（identical） | 324 |
| 内容不同（different） | 146 |
| warning 独有（smallerOnly） | 7 |
| front 独有（largerOnly） | 1396 |

以下两个原路径适配器均位于 `identicalFiles`：

- `views/ForewarningManagement/components/batchDeal.vue`
- `views/ForewarningManagement/components/dealDialog.vue`

检索业务模型函数、审核选项文案和批量处理 mutation 后确认：业务模型和提交 mutation 主体仅存在于 `packages/warning-feature/src/batch-deal` 与 `packages/shared-ui/src/forewarning-management/DealDialog.vue`；批量处理条的公共 UI 与事件逻辑位于 `packages/shared-ui/src/forewarning-management/BatchDeal.vue`。两个应用的上述原路径文件只保留一致的宿主 API 注入适配器。

### 来源与测试

- `pnpm verify:sources`：PASS（exit 0），输出 `来源目录未发生变化`。
- `NPM_AUTH=verify pnpm test`：PASS（exit 0），迁移/审计测试 41 项、预警功能测试 24 项，共 65 项全部通过。

测试仅出现 Node.js `buffer.File` experimental warning；未出现测试失败。

## 结论

批量处理条和处理弹窗的业务主体已收敛为单一公共实现。`link-warning` 与 `link-front` 通过原路径薄适配器注入宿主 API，保持既有调用路径，并可分别完成生产构建、输出到互不影响的独立产物目录。
