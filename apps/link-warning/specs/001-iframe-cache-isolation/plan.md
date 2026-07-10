# Implementation Plan: 同源 iframe 缓存隔离方案

**Branch**: `001-iframe-cache-isolation` | **Date**: 2026-04-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-iframe-cache-isolation/spec.md`

## Summary

修复登录成功后页面不跳转的缺陷，并确保同源 iframe 缓存隔离方案（`storage-namespace.js`）对所有存储访问路径完全生效。根因：`storage-namespace.js` 仅覆盖了 `getItem`/`setItem`/`removeItem` 方法，未拦截属性访问器语法（`sessionStorage.user`），导致 `permission.js` 中两处属性访问绕过代理、读到 `undefined`，导航守卫将请求重定向回登录页。

## Technical Context

**Language/Version**: JavaScript (ES2020+), Node.js >=18.17.0
**Primary Dependencies**: Vue 2.7.16, Vuex ^3.6.2, Vue Router ^3.5.4, Element UI ^2.15, Rsbuild ^1.3.22
**Storage**: localStorage / sessionStorage（通过 `storage-namespace.js` 命名空间代理）
**Testing**: 无测试框架（需手动验证）
**Target Platform**: 现代浏览器（Chrome 90+, Firefox 90+, Edge 90+, Safari 15+）
**Project Type**: Web 应用（SPA，iframe 可嵌入）
**Performance Goals**: 存储操作开销 <1ms，登录跳转 <2s
**Constraints**: 对现有业务代码零改动（FR-005），命名空间代理必须透明
**Scale/Scope**: 单页应用，约 30+ 页面视图

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Component-First | PASS | 修复仅在 `permission.js` 和 `storage-namespace.js` 中进行，不涉及组件修改 |
| II. API Layer Discipline | PASS | 不涉及 HTTP 通信 |
| III. State Management Clarity | PASS | Vuex 路由恢复流程已使用正确的 `dispatch` 路径 |
| IV. UI/UX Consistency | PASS | 无 UI 变更 |
| V. Internationalization by Default | PASS | 不涉及用户可见文本 |

**Post-Phase-1 re-check**: PASS — 所有变更限于存储工具层和路由守卫，未引入新组件或 API 调用。

## Project Structure

### Documentation (this feature)

```text
specs/001-iframe-cache-isolation/
├── plan.md              # This file
├── research.md          # Phase 0: 根因分析
├── data-model.md        # Phase 1: 存储代理数据模型
├── quickstart.md        # Phase 1: 快速验证指南
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── permission.js                          # [MODIFY] 修复属性访问器绕过代理
├── utils/
│   ├── storage-namespace.js               # [MODIFY] 增强代理覆盖属性访问器
│   ├── storage.js                         # (不变)
│   ├── auth.js                            # (不变)
│   └── index.js                           # (不变)
├── router/
│   └── index.js                           # (不变)
├── store/
│   └── modules/
│       └── user.js                        # (不变)
└── views/
    └── login/
        ├── index.vue                      # (不变)
        └── autoLogin.vue                  # (不变)
```

**Structure Decision**: 单项目结构。修改范围仅限 `permission.js` 和 `storage-namespace.js`，不新增文件。

## Complexity Tracking

> 无 Constitution 违反需要记录。
