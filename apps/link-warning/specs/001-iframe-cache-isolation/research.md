# Research: 同源 iframe 缓存隔离方案

**Feature**: 001-iframe-cache-isolation
**Date**: 2026-04-13

## Research Task 1: 同源 iframe 存储隔离策略

### Decision: 全局 Storage API 命名空间代理

### Rationale

同源 iframe 共享同一个 `localStorage` 和 `sessionStorage` 对象（它们指向同一块存储区域）。没有浏览器 API 可以在运行时为同源 iframe 分配独立的存储空间。唯一的隔离方式是在键名层面添加命名空间前缀。

方案核心：在应用启动时（`main.js` 最先导入），通过直接替换 `localStorage` / `sessionStorage` 的 `getItem`、`setItem`、`removeItem` 方法，自动为所有键名添加项目前缀。业务代码无需任何修改。

### Alternatives Considered

| 方案                              | 优点                   | 缺点                                           | 结论     |
|-----------------------------------|------------------------|------------------------------------------------|----------|
| **全局 Storage 代理（命名空间前缀）** | 对业务代码透明；改动最小 | 现有用户需重新登录（key 变化）                   | ✅ 选用  |
| 使用 iframe `sandbox` 属性         | 浏览器原生隔离         | 会限制同源 iframe 的其他能力；不适合本项目场景    | ❌ 排除  |
| `BroadcastChannel` + 内存存储      | 完全隔离               | 刷新丢失；需要大量代码改动                       | ❌ 排除  |
| IndexedDB 命名空间                | 支持复杂数据            | 异步 API，与现有同步代码不兼容                   | ❌ 排除  |
| `window.name` 传递数据             | 简单                   | 容量限制（~2MB）；不适合存储大量数据             | ❌ 排除  |

## Research Task 2: `sessionStorage.clear()` 的靶向清除

### Decision: 替换为 `clearSession()` 函数，仅清除带命名空间前缀的 key

### Rationale

`sessionStorage.clear()` 会清除同源下所有会话存储数据，包括父页面的数据。需要替换为只清除带 `link_s_` 前缀的 key 的函数。

项目中共 7 处 `sessionStorage.clear()` 调用：
1. `src/utils/request.js:44` — token 过期时
2. `src/views/login/autoLogin.vue:71` — 自动登录流程
3. `src/views/login/index.vue:60` — 登录页初始化
4. `src/views/login/index.vue:95` — 登出流程
5. `src/components/RightMenu/index.vue:48` — 右键菜单登出
6. `src/components/UserCenter/setting.vue:196` — 用户设置变更
7. `src/views/userCenter/index.vue:91` — 用户中心登出

## Research Task 3: `localStorage.clear()` 处理

### Decision: 同样需要靶向清除，仅清除带 `link_` 前缀的 key

### Rationale

`localStorage.clear()` 同样影响父页面。项目中约 5 处 `localStorage.clear()` 调用：
1. `src/utils/request.js:45` — token 过期时（与 sessionStorage.clear 成对出现）
2. `src/views/login/index.vue:62` — 登录页初始化
3. `src/views/login/index.vue:97` — 登出流程
4. `src/views/login/autoLogin.vue:74` — 自动登录
5. `src/components/RightMenu/index.vue:49` — 右键菜单登出
6. `src/components/UserCenter/setting.vue:197` — 用户设置变更
7. `src/views/userCenter/index.vue:92` — 用户中心登出

## Research Task 4: Cookie 隔离策略

### Decision: Cookie 不在本方案范围内

### Rationale

同源 Cookie 天然共享，无法通过前端 JS 层面的命名空间解决。`js-cookie` 库直接操作 `document.cookie`，不经过 Storage API。Cookie 隔离需服务端配合。

## Research Task 5: 现有用户数据迁移

### Decision: 不做自动迁移，接受一次性重新登录

### Rationale

键名变化后旧数据无法被新代码读取。登录流程会自动写入新键名数据，旧数据不造成冲突。自动迁移增加复杂度且只需执行一次。

## Research Task 6: Storage API 代理的技术实现方式

### Decision: 覆写 `localStorage` 和 `sessionStorage` 实例方法

### Rationale

直接赋值覆写 `localStorage`/`sessionStorage` 的 `getItem`/`setItem`/`removeItem` 方法。所有直接调用这些方法的代码都会自动通过代理。

## Research Task 7: 登录重定向缺陷根因分析（Phase 0 新增）

### Decision: `permission.js` 使用属性访问器语法绕过了存储代理

### 现象

登录成功后页面停留在登录页，不发生跳转。无控制台报错，iframe 内和独立访问均复现。

### 根因

`storage-namespace.js` 覆盖了 `getItem`/`setItem`/`removeItem` **方法调用**，但浏览器中 `sessionStorage.user` 这类**属性访问器**走的是另一条代码路径（Web Storage 规范中的 named property accessor），不经过被覆盖的 `getItem` 方法。

**完整调用链：**

1. 登录成功后 `afterLogin()` 调用 `sessionStorage.setItem('user', ...)` → 实际存储为 `link_s_user` ✓
2. `afterLogin()` 调用 `this.$router.push({ path: this.defaultPath })` 触发导航
3. `permission.js` 的 `beforeEach` 守卫执行：
   - **第 56 行**：`sessionStorage.user` → 属性访问器，读取原始键 `user` → `undefined` → 刷新恢复分支跳过
   - **第 101 行**：`!sessionStorage.user` → `true`，`checkFlag` → `true` → **执行 `next({ name: 'login' })`，重定向回登录页**
4. `Router.prototype.push` 被 `.catch(err => err)` 覆盖，所有错误静默吞掉，不产生控制台报错

### 受影响代码（全局搜索确认仅 2 处）

| 文件 | 行号 | 当前代码 | 修复为 |
|------|------|----------|--------|
| `src/permission.js` | 56 | `sessionStorage.user` | `sessionStorage.getItem('user')` |
| `src/permission.js` | 101 | `!sessionStorage.user` | `!sessionStorage.getItem('user')` |

### 修复方案选择

| 方案 | 描述 | 结论 |
|------|------|------|
| A. 修复调用方 | 将属性访问改为 `getItem()` 调用 | ✅ **选用** — 最小改动，仅 2 行 |
| B. 增强代理 | 用 Proxy/defineProperty 拦截属性访问 | ❌ 排除 — 复杂度高，可能影响第三方库 |

**理由**：全局搜索确认仅 `permission.js` 这 2 处使用属性访问器，方案 A 完全覆盖问题，且符合 FR-005（零改动原则）。
