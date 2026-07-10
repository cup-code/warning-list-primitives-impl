# Tasks: 同源 iframe 缓存隔离方案

**Input**: Design documents from `/specs/001-iframe-cache-isolation/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: 创建核心存储命名空间代理模块

- [x] T001 Create `src/utils/storage-namespace.js` — 全局 localStorage/sessionStorage 命名空间代理模块，包含以下功能：
  - 拦截 `localStorage.getItem/setItem/removeItem`，自动添加 `link_` 前缀
  - 拦截 `sessionStorage.getItem/setItem/removeItem`，自动添加 `link_s_` 前缀
  - 实现 `clearNamespacedSession()` 函数：遍历 sessionStorage，只删除带 `link_s_` 前缀的 key
  - 实现 `clearNamespacedStorage()` 函数：遍历 localStorage，只删除带 `link_` 前缀的 key
  - 导出 `clearSession`（别名 clearNamespacedSession）和 `clearProjectStorage`（别名 clearNamespacedStorage）
  - 处理 `Storage.prototype.key(index)` 和 `Storage.prototype.length` 的代理兼容
  - 导入即执行代理初始化（side effect import）

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 将代理模块集成到应用启动流程，确保所有后续代码都通过代理访问存储

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Add `import '@/utils/storage-namespace'` as the **first line** of `src/main.js` (before all other imports)，确保存储代理在任何其他模块访问 localStorage/sessionStorage 之前初始化
- [x] T003 [P] Update `src/utils/storage.js` — 添加从 storage-namespace.js 导入并导出 `clearProjectStorage` 和 `clearSession`，使现有使用 storage.js 的代码可通过统一入口访问靶向清除函数

**Checkpoint**: 代理已集成。此时所有 localStorage/sessionStorage 的 getItem/setItem/removeItem 调用自动添加前缀。

---

## Phase 3: Login Redirect Bug Fix (Priority: P0 — 阻塞性缺陷)

**Purpose**: 修复登录成功后页面不跳转的缺陷（FR-008, SC-006）

**Root Cause**: `storage-namespace.js` 覆盖了 `getItem/setItem/removeItem` 方法，但未拦截属性访问器语法（`sessionStorage.user`）。`permission.js` 第 56、101 行使用属性访问器绕过代理读到 `undefined`，导航守卫重定向回登录页。

**Independent Test**: 登录后页面应跳转到第一个菜单页面，而非停留在登录页

### Implementation

- [x] T015 Fix property accessor bypass in `src/permission.js` — 修改第 56 行和第 101 行：
  - 第 56 行：`if (sessionStorage.user && !store.state.user.user)` → `if (sessionStorage.getItem('user') && !store.state.user.user)`
  - 第 101 行：`else if (!sessionStorage.user && checkFlag)` → `else if (!sessionStorage.getItem('user') && checkFlag)`
  - 注意：`sessionStorage.getItem('user')` 走代理读取 `link_s_user`，属性访问器 `sessionStorage.user` 绕过代理读取原始键 `user`（不存在）

**Checkpoint**: 登录跳转修复完成。验证：输入账号密码登录后应自动跳转到第一个菜单页面。

---

## Phase 4: User Story 1 - 登录/登出不影响父页面缓存 (Priority: P1) 🎯 MVP

**Goal**: 替换登录/登出流程中的 `sessionStorage.clear()` 和 `localStorage.clear()` 为靶向清除函数，确保 iframe 登出不会清除父页面数据

**Independent Test**: 在 iframe 内执行登录 → 登出，检查父页面 localStorage/sessionStorage 数据条目数量不变

### Implementation for User Story 1

- [x] T004 [US1] Replace `sessionStorage.clear()` + `localStorage.clear()` in `src/utils/request.js` — 将第 44-45 行的 `sessionStorage.clear()` 和 `localStorage.clear()` 替换为从 storage-namespace.js 导入的 `clearSession()` 和 `clearProjectStorage()`，添加对应 import 语句
- [x] T005 [P] [US1] Replace clear calls in `src/views/login/index.vue` — 将第 60 行的 `sessionStorage.clear()` 和第 62 行的 `localStorage.clear()`（登录页初始化）替换为 `clearSession()` 和 `clearProjectStorage()`；将第 95 行的 `sessionStorage.clear()` 和第 97 行的 `localStorage.clear()`（登出流程）同样替换，添加 import 语句
- [x] T006 [P] [US1] Replace clear calls in `src/views/login/autoLogin.vue` — 将第 71 行的 `sessionStorage.clear()` 和第 74 行的 `localStorage.clear()` 替换为 `clearSession()` 和 `clearProjectStorage()`，添加 import 语句

**Checkpoint**: 登录/登出流程完成隔离。User Story 1 可独立测试：登录 → 正常使用 → 登出，验证父页面数据完整。

---

## Phase 5: User Story 2 - 父页面清除缓存不影响 iframe (Priority: P2)

**Goal**: 通过前缀机制确保 iframe 的存储数据与父页面在键名层面隔离，父页面操作自有数据时不会触及 iframe 数据

**Independent Test**: 在父页面中执行 `localStorage.removeItem` 清除其自有 key 后，iframe 的带前缀 key 数据仍然可读

**Note**: 本 User Story 无需额外代码改动。前缀隔离机制已在 Phase 1-2 的基础设施中实现（`link_` / `link_s_` 前缀确保 iframe 数据与父页面数据在键名层面完全区分）。以下为验证性任务。

- [x] T007 [US2] Verify prefix isolation works correctly — 在浏览器 DevTools 中手动验证：
  1. iframe 执行 `localStorage.setItem('test', 'value')`，确认实际存储 key 为 `link_test`
  2. 父页面执行 `localStorage.removeItem('test')`，确认 iframe 数据 `link_test` 未受影响
  3. iframe 执行 `localStorage.getItem('test')` 返回 `'value'`

**Checkpoint**: 确认前缀机制为 iframe 数据提供了键名层面的隔离。

---

## Phase 6: User Story 3 - iframe 内多个存储清理场景的隔离 (Priority: P3)

**Goal**: 覆盖剩余所有 `sessionStorage.clear()` / `localStorage.clear()` 调用点，确保每个存储清理场景都使用靶向清除

**Independent Test**: 逐一触发各清理入口（右键菜单登出、用户设置变更、用户中心登出），验证父页面数据不受影响

### Implementation for User Story 3

- [x] T008 [P] [US3] Replace clear calls in `src/components/RightMenu/index.vue` — 将第 48 行的 `sessionStorage.clear()` 和第 49 行的 `localStorage.clear()` 替换为 `clearSession()` 和 `clearProjectStorage()`，添加 import 语句
- [x] T009 [P] [US3] Replace clear calls in `src/components/UserCenter/setting.vue` — 将第 196 行的 `sessionStorage.clear()` 和第 197 行的 `localStorage.clear()` 替换为 `clearSession()` 和 `clearProjectStorage()`，添加 import 语句
- [x] T010 [P] [US3] Replace clear calls in `src/views/userCenter/index.vue` — 将第 91 行的 `sessionStorage.clear()` 和第 92 行的 `localStorage.clear()` 替换为 `clearSession()` 和 `clearProjectStorage()`，添加 import 语句
- [x] T011 [US3] Scan for any remaining `sessionStorage.clear()` or `localStorage.clear()` calls across `src/` directory — 使用 grep 搜索确认所有调用点已被覆盖，如有遗漏则补充替换

**Checkpoint**: 所有存储清理场景均已使用靶向清除。User Story 3 完整验证。

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 构建验证、代码检查、完整回归测试

- [x] T012 Run `npm run lint` and fix any errors introduced by the changes
- [x] T013 Run `npm run build` and verify production build succeeds with no warnings related to new code
- [ ] T014 Full regression verification — 按照 `specs/001-iframe-cache-isolation/quickstart.md` 中的验证步骤执行完整回归测试：
  1. 构建验证
  2. 存储前缀代理验证（localStorage + sessionStorage）
  3. 靶向清除验证
  4. 登录/登出流程回归（含登录跳转验证）
  5. 页面刷新恢复验证

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **Login Redirect Fix (Phase 3)**: Depends on Phase 2 — BLOCKS testing of all other phases
- **User Story 1 (Phase 4)**: Depends on Phase 2 and Phase 3 — MVP
- **User Story 2 (Phase 5)**: Satisfied by Phase 2 infrastructure — verification only
- **User Story 3 (Phase 6)**: Depends on Phase 2 — can run in parallel with Phase 4
- **Polish (Phase 7)**: Depends on Phase 3 + Phase 6 completion

### User Story Dependencies

- **Login Redirect Fix (P0)**: Depends on Phase 2 — BLOCKS all testing
- **User Story 1 (P1)**: Depends on Phase 2 + Phase 3 — No dependencies on other stories
- **User Story 2 (P2)**: No additional code — satisfied by infrastructure
- **User Story 3 (P3)**: Depends on Phase 2 — Independent of US1

### Parallel Opportunities

- T005 and T006 can run in parallel (different files)
- T008, T009, T010 can run in parallel (different files)
- US1 and US3 implementation tasks can run in parallel after Phase 2

---

## Parallel Example: Login Redirect Fix

```bash
# Single task, must complete before any testing:
Task: "Fix property accessor bypass in src/permission.js"
```

## Parallel Example: User Story 1

```bash
# Launch all US1 replacements together (after Phase 2):
Task: "Replace clear calls in src/views/login/index.vue"
Task: "Replace clear calls in src/views/login/autoLogin.vue"
# Note: T004 (request.js) can also run in parallel with T005 and T006
```

---

## Implementation Strategy

### Bug Fix First (Critical Path)

1. Complete Phase 3: Fix login redirect in `permission.js` (T015)
2. **STOP and VALIDATE**: Login → confirm redirect to first menu page works
3. Only then proceed to regression testing

### MVP First (User Story 1 Only)

1. Phase 3 (Login Redirect Fix) already done
2. Phase 4 (US1) clear() replacements already done
3. Phase 7: Full regression validation (T014)
4. Deploy if ready

### Full Delivery

1. Phase 3 → Login works → Validate
2. Phase 4 + Phase 6 (already complete) → All clear() sites covered
3. Phase 7 → Full regression validated → Final deploy

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **T015 is the only remaining implementation task** — all others (T001-T013) are complete
- **T014 is the final validation task** — must run after T015
- Cookie isolation is out of scope (requires server-side cooperation)
- Existing users will need to re-login after deployment (one-time)
