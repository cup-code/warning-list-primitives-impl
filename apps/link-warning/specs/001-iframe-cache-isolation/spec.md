# Feature Specification: 同源 iframe 缓存隔离方案

**Feature Branch**: `001-iframe-cache-isolation`
**Created**: 2026-04-13
**Status**: Draft
**Input**: User description: "同源iframe缓存隔离方案"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 登录/登出不影响父页面缓存 (Priority: P1)

用户在父页面中打开了本项目的 iframe。用户在 iframe 内完成登录、正常使用后点击退出登录。登出流程会清除 iframe 侧的会话数据（如 token、用户信息等）。清除操作不得影响父页面中已存储的任何数据。

**Why this priority**: 登录/登出是最频繁触发缓存清除的场景。如果登出操作意外清除了父页面的数据，将直接导致父页面功能异常，属于生产事故级别的缺陷。

**Independent Test**: 在 iframe 内执行登录再登出后，检查父页面的本地存储和会话存储是否完整保留。

**Acceptance Scenarios**:

1. **Given** 父页面已存储了若干本地数据, **When** 用户在 iframe 内完成登录并正常使用, **Then** 父页面的所有本地存储数据保持不变
2. **Given** 用户在 iframe 内已登录, **When** 用户在 iframe 内点击退出登录, **Then** iframe 的会话数据被清除，但父页面的本地存储和会话存储完全不受影响
3. **Given** 父页面和 iframe 各自存储了数据, **When** iframe 执行任意缓存清理操作, **Then** 父页面的数据仍然完整

---

### User Story 2 - 父页面清除缓存不影响 iframe (Priority: P2)

用户在浏览器中手动清除缓存或父页面自身的逻辑触发了缓存清除。iframe 中的持久化数据（如用户偏好设置、token）应保持独立，不受父页面清除操作的连带影响。

**Why this priority**: 反向隔离同样重要——如果父页面的清理逻辑意外删除了 iframe 的数据，用户需要重新登录，影响体验。但发生频率低于 iframe 侧主动清除。

**Independent Test**: 在父页面中触发缓存清除操作后，刷新页面检查 iframe 中的持久化数据是否保留。

**Acceptance Scenarios**:

1. **Given** iframe 内用户已登录且 token 已持久化, **When** 父页面执行自身的缓存清理, **Then** iframe 的持久化数据（token 等）不受影响
2. **Given** iframe 存储了用户偏好设置, **When** 父页面清除其自有数据, **Then** iframe 的偏好设置仍然保留
3. **Given** 用户刷新页面后 iframe 重新加载, **When** iframe 读取之前存储的数据, **Then** 所有 iframe 自身存储的数据均可正常读取

---

### User Story 3 - iframe 内多个存储清理场景的隔离 (Priority: P3)

iframe 内部存在多个使用本地存储和会话存储的业务场景（如多租户切换、标签页会话管理、用户中心设置）。每个场景中的存储清理操作都必须只作用于 iframe 自身的数据，不波及父页面。

**Why this priority**: 覆盖边缘场景，确保所有触发缓存清理的代码路径都经过隔离处理。

**Independent Test**: 逐一测试 iframe 内的每个存储清理入口（登出、切换租户、关闭标签页等），验证父页面数据不受影响。

**Acceptance Scenarios**:

1. **Given** 用户在 iframe 内切换租户, **When** 切换过程中触发会话清理, **Then** 仅清除 iframe 自身的会话数据，父页面不受影响
2. **Given** iframe 内的标签页会话管理触发清理, **When** 用户关闭某个标签页, **Then** 仅清理该标签页相关的会话数据
3. **Given** 用户在 iframe 内修改个人中心设置后登出, **When** 登出流程执行, **Then** iframe 的会话数据被清除，父页面的数据仍然完整

---

### Edge Cases

- 父页面直接操作了与 iframe 使用相同键名的数据时如何避免覆盖？
- 浏览器存储空间达到上限时，iframe 和父页面的数据竞争如何处理？
- Cookie 在同源场景下天然共享，本方案如何处理 Cookie 隔离？
- 存储键名变更后，现有已登录用户的旧数据如何迁移？

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: iframe 的所有本地存储操作必须使用独立的命名空间，与父页面的存储完全隔离
- **FR-002**: iframe 的所有会话存储操作必须使用独立的命名空间，与父页面的存储完全隔离
- **FR-003**: iframe 内执行会话清除操作时，必须只清除属于 iframe 自身的会话数据，不得影响父页面或其他同源 iframe
- **FR-004**: iframe 内执行本地存储清除操作时，必须只清除属于 iframe 自身的数据
- **FR-005**: 存储隔离对 iframe 内的所有现有业务代码必须完全透明，无需逐个文件修改
- **FR-006**: iframe 与父页面之间需要受控的数据通信通道，用于必要的跨页面交互
- **FR-008**: 登录成功后必须正确跳转到用户权限对应的第一个菜单页面（最深层子路由），当前停留在登录页的缺陷需修复
- **FR-007**: 必须提供明确的错误处理机制，在存储操作异常时给出可追溯的信息

### Key Entities

- **命名空间存储代理**: 为 iframe 的所有存储操作自动添加命名空间标识，确保与父页面的数据键名不冲突
- **靶向清除函数**: 替代原生的全量清除方法，仅清除带有 iframe 命名空间前缀的存储条目
- **存储迁移机制**: 处理从旧键名到新命名空间键名的数据迁移

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: iframe 内任意存储清理操作后，父页面本地存储和会话存储的数据条目数量与操作前完全一致
- **SC-002**: 父页面任意存储清理操作后，iframe 自身的持久化数据（如 token）仍然可正常读取
- **SC-003**: 存储隔离方案对现有业务代码零改动——所有使用本地存储和会话存储的文件无需修改
- **SC-004**: iframe 登出后重新登录，整个流程在 5 秒内完成，无异常报错
- **SC-005**: 所有存储操作的性能开销增加不超过 1 毫秒（命名空间代理不应引入可感知的延迟）
- **SC-006**: 登录成功后必须在 2 秒内完成页面跳转，导航到用户权限对应的第一个菜单页面，不得停留在登录页

## Clarifications

### Session 2026-04-13

- Q: 登录后当前的具体表现是什么？ → A: 登录后页面停留在登录页，没有跳转
- Q: 这个问题是在什么运行环境下出现的？ → A: iframe 内和独立访问都会出现
- Q: 登录成功后期望的跳转目标是什么？ → A: 跳转到用户权限对应的第一个菜单页面
- Q: 登录后浏览器控制台是否有报错信息？ → A: 没有报错，静默失败

## Assumptions

- 本项目作为 iframe 嵌入到同源父页面中（非跨域场景）
- 父页面使用不同的命名空间前缀，或不会直接操作 iframe 的命名空间键名
- Cookie 隔离不在本方案范围内（同源 Cookie 天然共享，需服务端配合路径隔离）
- **登录重定向缺陷（待修复）**：`permission.js` 第 56、101 行使用 `sessionStorage.user` 属性访问器语法绕过了 `storage-namespace.js` 的代理（代理仅覆盖 `getItem`/`setItem`/`removeItem` 方法），导致读到 `undefined`，导航守卫将请求重定向回登录页。修复：改为 `sessionStorage.getItem('user')`
- 浏览器环境为现代浏览器（Chrome 90+、Firefox 90+、Edge 90+、Safari 15+）
- 存储键名变更后，现有用户需要重新登录（一次性影响，可接受）
- iframe 内存在多个需要清除会话存储的代码路径（登录、登出、租户切换、标签页管理等）
