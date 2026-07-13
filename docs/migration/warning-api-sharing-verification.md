# 预警 API 共享验收记录

## 验收环境

- 执行日期：2026-07-13
- Node.js：v18.20.3
- pnpm：10.14.0
- 共享实现：`packages/warning-feature/src/video-warning/createVideoWarningApi.js`
- `link-front` shim：`apps/link-front/src/http/videoWarning/warning-api.js`
- `link-warning` shim：`apps/link-warning/src/http/videoWarning/warning-api.js`

## 共享导出

两个应用的 shim 逐字一致，并继续提供以下 54 个 named exports：

1. `getWarningTypeList`
2. `getWarningTypeListAllTenant`
3. `addCamera`
4. `deleteCamera`
5. `batchDeleteCamera`
6. `cameraList`
7. `exportCameraList`
8. `downloadCameraTemplate`
9. `importCameraList`
10. `clientWarningList`
11. `clientWarningAudit`
12. `maintenanceWarningAudit`
13. `maintenanceWarningList`
14. `machineList`
15. `addMachine`
16. `deleteMachine`
17. `allMachineList`
18. `allWarningList`
19. `allWarningAudit`
20. `machineIndustryList`
21. `machineCompanyList`
22. `machineRegionList`
23. `machineProvinceList`
24. `warningStatusList`
25. `machineTypeYear`
26. `machineRank`
27. `saveOrUpdateAiSkill`
28. `deleteAiAuditSkill`
29. `aiAuditSkillList`
30. `videoModelSkillGlobalQuery`
31. `deleteVideoModelSkillGlobal`
32. `saveOrUpdateVideoModelSkillGlobal`
33. `videoModelSkillTenantQuery`
34. `deleteVideoModelSkillTenant`
35. `saveOrUpdateVideoModelSkillTenant`
36. `attentionAlarm`
37. `batchAttentionAlarm`
38. `batchAttentionAlarmInternal`
39. `exportWarningData`
40. `exportWarningTrend`
41. `exportWarningProcess`
42. `exportOrgWarning`
43. `exportPointWarning`
44. `exportWarningType`
45. `exportWarningLevel`
46. `saveOrUpdateVideoSiren`
47. `deleteVideoSiren`
48. `queryVideoSiren`
49. `batchDeleteWarningProcess`
50. `uploadWarningImage`
51. `queryWarningDetailById`
52. `saveOrUpdateCardSiren`
53. `queryCardSiren`
54. `deleteCardSiren`

## 测试与构建

| 验收项 | 结果 | 退出码 |
| --- | --- | ---: |
| `pnpm test` | 迁移/审计测试 16 项、共享预警功能测试 6 项，共 22 项全部通过 | 0 |
| `pnpm run build:front`（由 `pnpm build` 执行） | `link-front` 生产构建完成，Rsbuild 用时 39.0 秒 | 0 |
| `pnpm run build:warning`（由 `pnpm build` 执行） | `link-warning` 生产构建完成，Rsbuild 用时 6.86 秒 | 0 |
| `pnpm build` | 两个应用顺序构建完成 | 0 |

构建入口产物 SHA-256：

- `dist/link-front/index.html`：`0f5901c0ee2c7352fee0b472cba7e37533e9171e611a53abfddc5edbf1ff52b7`
- `dist/link-warning/index.html`：`159e9c27dfb53ece63e946dfa4f7ba547eac24b803e953e082b74d324bcd250a`

## 共享来源审计

执行 `pnpm audit:shared` 后，`http/videoWarning/warning-api.js` 从更新前的
`differentFiles` 移入更新后的 `identicalFiles`。整体计数变化如下：

- `identical`：322 -> 323
- `different`：148 -> 147
- `common`：470（不变）

审计命令退出码为 0，更新结果记录在 `docs/migration/shared-source-audit.json`。

## 外部来源只读校验

本次验收重新读取两个外部来源目录，并实时生成
`/tmp/link-source-current-task3.json`，再与
`docs/migration/source-before.json` 比较；未使用已提交的
`source-after.json` 代替实时采集。

| 来源 | 实时文件数 | 基线摘要 | 实时摘要 | 结果 |
| --- | ---: | --- | --- | --- |
| `front` | 2426 | `65f3d82a143aa2d48ebf7f46b37e218d0be58cc8add0859fdde7e2034475f214` | `65f3d82a143aa2d48ebf7f46b37e218d0be58cc8add0859fdde7e2034475f214` | 一致 |
| `warning` | 576 | `43461fd48f9c915b24da8de3890536951fc58fc4f54bce12b0dee3121fd12ad0` | `43461fd48f9c915b24da8de3890536951fc58fc4f54bce12b0dee3121fd12ad0` | 一致 |

比较命令退出码为 0，输出：`来源目录未发生变化`。

## 结论

共享预警 API 保持 54 个导出，两个应用的生产构建和全部测试通过；两个
shim 已被审计为相同文件，外部来源目录在验收时未发生变化。
