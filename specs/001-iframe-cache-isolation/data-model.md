# Data Model: 同源 iframe 缓存隔离方案

**Feature**: 001-iframe-cache-isolation
**Date**: 2026-04-13

## Storage Key Mapping

本方案不涉及数据库实体，而是定义浏览器存储的键名映射规则。

### localStorage 键名映射

| 原 key     | 代理后实际 key      | 说明               |
|------------|---------------------|--------------------|
| `tk`       | `link_tk`           | 认证 token         |
| `authToken` | `link_authToken`   | 租户 token         |
| `globalData` | `link_globalData` | 公司信息（logo、标题等） |
| `isAlive`  | `link_isAlive`      | 登录存活标记       |
| `{任意 key}` | `link_{任意 key}`  | 所有 localStorage 操作自动加前缀 |

### sessionStorage 键名映射

| 原 key     | 代理后实际 key        | 说明               |
|------------|-----------------------|--------------------|
| `user`     | `link_s_user`         | 用户信息           |
| `btnPermissions` | `link_s_btnPermissions` | 按钮权限列表 |
| `routerList` | `link_s_routerList` | 动态路由列表       |
| `dictList` | `link_s_dictList`     | 字典数据           |
| `{任意 key}` | `link_s_{任意 key}` | 所有 sessionStorage 操作自动加前缀 |

## Storage API 代理覆盖范围

| 访问方式 | 示例 | 是否被代理覆盖 | 说明 |
|----------|------|----------------|------|
| 方法调用 | `localStorage.getItem('tk')` | ✅ | 走覆写后的方法 |
| 方法调用 | `localStorage.setItem('tk', v)` | ✅ | 走覆写后的方法 |
| 方法调用 | `localStorage.removeItem('tk')` | ✅ | 走覆写后的方法 |
| 属性访问 | `sessionStorage.user` | ❌ | 走浏览器原生 named property accessor |
| 属性访问 | `localStorage.tk` | ❌ | 同上 |

**重要约束**：项目中禁止使用 `localStorage.X` 或 `sessionStorage.X` 属性访问器语法，必须使用 `getItem(X)` / `setItem(X, V)` 方法调用。当前代码中仅 `permission.js` 有 2 处违规，需修复。

## Key Relationships

```
storage-namespace.js (全局代理，main.js 最先导入)
├── localStorage 代理
│   ├── 前缀: "link_"
│   ├── getItem(key) → 实际读取 link_{key}
│   ├── setItem(key, value) → 实际写入 link_{key}
│   ├── removeItem(key) → 实际删除 link_{key}
│   └── 未覆盖: 属性访问器、.key()、.length
├── sessionStorage 代理
│   ├── 前缀: "link_s_"
│   ├── getItem(key) → 实际读取 link_s_{key}
│   ├── setItem(key, value) → 实际写入 link_s_{key}
│   ├── removeItem(key) → 实际删除 link_s_{key}
│   └── 未覆盖: 属性访问器、.key()、.length
└── 导出函数
    ├── clearNamespacedSession() / clearSession() — 靶向清除 sessionStorage
    └── clearNamespacedStorage() / clearProjectStorage() — 靶向清除 localStorage

permission.js [需修复]
├── 第 56 行: sessionStorage.user → sessionStorage.getItem('user')
└── 第 101 行: !sessionStorage.user → !sessionStorage.getItem('user')
```

## Validation Rules

1. **前缀一致性**: 所有 `localStorage` 操作必须使用 `link_` 前缀，所有 `sessionStorage` 操作必须使用 `link_s_` 前缀
2. **清除隔离**: `clearSession()` 只删除 `link_s_*` key，`clearProjectStorage()` 只删除 `link_*` key
3. **透明性**: 业务代码中的 `localStorage.getItem('tk')` 等调用无需修改
4. **访问器禁用**: 禁止使用 `sessionStorage.user` 属性访问器语法，必须使用 `getItem()`
5. **Cookie 独立**: Cookie 操作不受代理影响（`js-cookie` 直接操作 `document.cookie`）
