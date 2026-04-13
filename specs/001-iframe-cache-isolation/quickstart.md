# Quickstart: 同源 iframe 缓存隔离方案

**Feature**: 001-iframe-cache-isolation
**Date**: 2026-04-13

## Prerequisites

- Node.js >= 18.17.0
- 项目已安装依赖 (`npm install`)

## Build & Run

```bash
npm install
npm run dev      # 开发环境 localhost:8800
npm run build    # 生产构建
npm run lint     # 代码检查
```

## 修复内容

### 登录重定向缺陷修复

**问题**：登录成功后页面停留在登录页不跳转。

**根因**：`permission.js` 使用 `sessionStorage.user`（属性访问器）读取会话数据，但 `storage-namespace.js` 的代理只覆盖了 `getItem()`/`setItem()` 方法，属性访问器绕过了代理，读到 `undefined`，导致导航守卫重定向回登录页。

**修复**：`src/permission.js` 第 56 行和第 101 行，将 `sessionStorage.user` 改为 `sessionStorage.getItem('user')`。

## Verification Steps

### 1. 登录跳转验证（核心）

1. 启动 `npm run dev`
2. 访问 `http://localhost:8800/#/login`
3. 输入正确的账号密码，点击登录
4. **预期**：登录后自动跳转到第一个菜单页面（如 `/ForewarningManagement/warningList`）
5. **确认**：URL 不再停留在 `/#/login`，页面显示菜单布局

### 2. 页面刷新恢复验证

1. 登录成功后，按 F5 刷新页面
2. **预期**：页面正确恢复登录状态，不跳回登录页

### 3. 存储隔离验证（iframe 环境）

1. 在父页面中打开 iframe
2. 在 iframe 内登录 → 正常使用 → 登出
3. 检查父页面的 localStorage / sessionStorage 是否完整保留
4. 在 iframe 内 DevTools 查看 Application > Storage，确认 key 均有 `link_` / `link_s_` 前缀

### 4. 构建验证

```bash
npm run build
npm run lint
```

确认构建成功且 lint 无错误。

### 5. 独立访问验证

直接在浏览器（非 iframe 环境）访问登录页，确认登录跳转同样正常工作。

## Expected Behavior

| 操作 | 之前行为 | 之后行为 |
|------|----------|----------|
| 登录成功 | 停留在登录页 | 跳转到第一个菜单页面 |
| 页面刷新 | 可能跳回登录页 | 正确恢复登录状态 |
| `localStorage.setItem('tk', x)` | 存储 key 为 `tk` | 存储 key 为 `link_tk` |
| `sessionStorage.setItem('user', x)` | 存储 key 为 `user` | 存储 key 为 `link_s_user` |
| 登出 → 父页面数据 | 父页面数据丢失 | 父页面数据完整保留 |
