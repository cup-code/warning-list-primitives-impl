# link-front_new Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-06-05

## Active Technologies
- JavaScript ES2020+, Vue 2.7.16（`setup()` 组合式风格） + Element UI 2.15.x, Vuex 3.x, Vue Router 3.x, Axios, **trtc-sdk-v5（新增）** (031-remote-guidance-room)
- N/A（前端，数据来自后端 API；当前用户身份取自 Vuex `user/user`） (031-remote-guidance-room)

- JavaScript (ES2020+), Vue 2.7.16 + Element UI 2.15.x, @tanstack/vue-query, Vuex 3.x, Vue Router 3.x (002-inspection-fields-update)
- N/A (frontend only) (002-inspection-fields-update)
- JavaScript (ES2020+), Vue 2.7.16 + Element UI 2.15.x, Vuex 3.x, Vue Router 3.x, @tanstack/vue-query (002-inspection-fields-update)
- N/A (frontend only, data from API) (002-inspection-fields-update)
- N/A (frontend only, file download via browser) (003-inspection-place-export)
- JavaScript (ES2020+), Vue 2.7.x (Composition API with `<script setup>`) + Vue 2.7.x, Element UI 2.15.x (not used in this component), CSS variables (006-inspection-status-colors)
- JavaScript ES2020+, Vue 2.7.16 + Element UI 2.15.x, @tanstack/vue-query, Vuex 3.x, Vue Router 3.x, moment.js (007-warning-list-param-logic)
- localStorage (浏览器本地存储) (007-warning-list-param-logic)
- JavaScript ES2020+ + Vue 2.7.16, Element UI 2.15.x, @tanstack/vue-query ^4.33.0, Vuex 3.x, Vue Router 3.x, moment.js (009-fix-param-nav-filter)
- localStorage (browser) (009-fix-param-nav-filter)
- JavaScript ES2020+, Vue 2.7.16 (Composition API with `<script setup>` support) + Element UI 2.15.x, @tanstack/vue-query ^4.33.0, Vuex 3.x, Vue Router 3.x, Axios (010-ai-task-summary)
- N/A (frontend only, API-driven) (010-ai-task-summary)
- JavaScript ES2020+, Vue 2.7.16 (Composition API with `<script>` syntax) + Element UI 2.15.x, Axios (011-ai-summary-button)
- N/A (前端组件，数据来自 API) (011-ai-summary-button)
- JavaScript ES2020+, Vue 2.7.x (Options API) + Element UI 2.15.x, Axios (011-ai-summary-button)
- N/A (前端组件，数据来自 props 和 API) (011-ai-summary-button)
- JavaScript ES2020+, Vue 2.7.16 (Composition API) + Element UI 2.15.x, Axios (012-save-inspection-summary)
- N/A (前端，数据持久化由后端 API 处理) (012-save-inspection-summary)
- JavaScript ES2020+, Vue 2.7.16 (Composition API) + Element UI 2.15.x, @tanstack/vue-query ^4.33.0 (013-inspection-item-deselect)
- N/A (前端，数据通过 API 提交) (013-inspection-item-deselect)
- JavaScript ES2020+, Vue 2.7.16 (Composition API) + Element UI 2.15.x (el-table, el-dialog) (013-inspection-item-deselect)
- N/A (前端内存状态，无需持久化) (013-inspection-item-deselect)
- JavaScript ES2020+, Vue 2.7.16 + Element UI 2.15.x, Vuex 3.x, Vue Router 3.x, Axios (014-skip-marked-image-reupload)
- Vuex (primary) + sessionStorage (persistence) (015-migrate-link-sdk-api)
- JavaScript ES2020+, Vue 2.7.16 + Element UI 2.15.x, Axios (017-inspection-item-import)
- JavaScript ES2020+, Vue 2.7.16 + Element UI 2.15.x, Vuex 3.x, Vue Router 3.x, Axios, @tanstack/vue-query ^4.33.0 (018-inspection-terminal-list)
- JavaScript ES2020+, Vue 2.7.16 + Element UI 2.15.x, @tanstack/vue-query ^4.33.0, Axios (021-report-archive)
- JavaScript ES2020+, Vue 2.7.16 + Element UI 2.15.x, Vuex 3.x, Vue Router 3.x, Axios, 高德地图 (AMap) (022-inspection-default-location)
- JavaScript ES2020+, Vue 2.7.16 + Element UI 2.15.x, Vuex 3.x, Vue Router 3.x, Axios, 高德地图 (AMap) 2.1Beta (023-inspection-3d-map)
- JavaScript ES2020+, Vue 2.7.16 (Composition API `setup()`) + Element UI 2.15.x, @tanstack/vue-query ^4.33.0, Vuex 3.x, Vue Router 3.x, Axios (028-position-code-crud)
- N/A（前端，数据来自 API） (028-position-code-crud)

- JavaScript (ES2020+), Vue 2.7.16 + Element UI 2.15.x, Vuex 3.x, Vue Router 3.x, Axios (001-fix-session-isolation)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

JavaScript (ES2020+), Vue 2.7.16: Follow standard conventions

## Recent Changes
- 031-remote-guidance-room: Added JavaScript ES2020+, Vue 2.7.16（`setup()` 组合式风格） + Element UI 2.15.x, Vuex 3.x, Vue Router 3.x, Axios, **trtc-sdk-v5（新增）**

- 029-tianjian-install-crud: Added JavaScript ES2020+, Vue 2.7.16 (Composition API `setup()`) + Element UI 2.15.x, @tanstack/vue-query ^4.33.0, Vuex 3.x, Vue Router 3.x, Axios

- 027-tianjian-data: Added JavaScript ES2020+, Vue 2.7.16 + Element UI 2.15.x, @tanstack/vue-query ^4.33.0, Axios

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
