# Link Front Project

## 项目介绍
这是一个基于 Vue 2 和 Element UI 的前端项目，提供了各种业务功能模块。

## 技术栈
- Vue 2
- Element UI
- Vuex
- Vue Router
- Axios
- Echarts
- SCSS

- **前端框架**: Vue 2.6.14 + Element UI 2.15.6
- **状态管理**: Vuex 3.x
- **路由管理**: Vue Router 3.x
- **UI组件库**: Element UI + Link UI (自研)
- **CSS预处理**: SCSS + Tailwind CSS
- **图表库**: ECharts 5.2.0
- **地图组件**: Mapbox GL
- **国际化**: vue-i18n
- **工具库**: Lodash, Dayjs
- **构建工具**: Vue CLI 3.x

## 功能模块

### 1. 预警管理系统

#### 1.1 预警信息列表
提供预警信息的查询、处理和管理功能，支持按多种条件筛选预警信息。

#### 1.2 预警统计分析
提供预警数据的统计分析功能，包含以下主要功能：
- **时间范围筛选**：支持按日、周、月、自定义时间范围筛选数据
- **预警类型TOP5**：以柱状图形式展示排名前5的预警类型及其数量
- **点位预警数量TOP10**：以表格形式展示预警数量排名前10的监控点位
- **组织预警统计**：以表格形式展示各组织单位的预警数量统计
- **预警等级分布**：以饼图形式展示不同等级预警的分布情况
- **数据导出**：支持各统计图表数据的导出功能

## 开发环境配置

### 环境要求

- Node.js v18+
- NPM v10+

### 安装和运行

```bash
npm install
```

2. 运行开发服务器
```bash
npm run dev
```

3. 构建生产版本
```bash
npm run build
```

## 项目结构
- `src/`: 源代码目录
  - `assets/`: 静态资源
  - `components/`: 组件
  - `views/`: 页面
  - `router/`: 路由配置
  - `store/`: Vuex状态管理
  - `utils/`: 工具函数
  - `styles/`: 样式文件
  - `http/`: API请求

## 构建配置
项目使用 Rsbuild 进行构建，主要配置文件为 `rsbuild.config.mjs`。

### 关键配置项
- **assetPrefix**: 设置为 "../"，确保CSS文件中的资源路径正确引用
- **distPath**: 配置各类资源的输出目录
  ```js
  distPath: {
    root: "dist",
    js: "assets/js",
    css: "assets/css",
    svg: "assets/svg",
    font: "assets/fonts",
    image: "assets/images",
    media: "assets/media",
  }
  ```

## 常见问题及解决方案

### 循环依赖问题
**问题**: 在使用动态导入时可能出现 "Cannot access '__WEBPACK_DEFAULT_EXPORT__' before initialization" 错误，这通常是由循环依赖引起的。

**解决方案**:
1. 避免在组件中使用动态导入 API 函数，而是在组件顶部直接导入
2. 对于可能导致循环依赖的模块，重构代码以避免相互依赖
3. 在 API 函数中，避免使用依赖于路由或组件的工具函数

### 资源路径问题
**问题**: 构建产物文件相互使用时，如CSS文件引用字体或图片，可能出现路径错误。

**解决方案**:
1. 在 `rsbuild.config.mjs` 中将 `assetPrefix` 设置为 "../" 而非 "./"
2. 这样CSS文件中的资源引用路径会从 `./assets/fonts/xxx` 变为 `../fonts/xxx`，正确指向同级目录下的资源
3. 在CSS中避免使用webpack别名（如`~@`）引用静态资源，因为在rsbuild打包后这些别名可能无法正确解析
4. 推荐做法：在CSS中使用相对路径（如`../../../assets/images/xxx.png`）代替别名路径（如`~@/assets/images/xxx.png`）

**示例**:
```scss
/* 不推荐 - 可能在rsbuild打包后无法正确加载 */
.example {
  background-image: url("~@/assets/images/example.png");
}

/* 推荐 - 使用相对路径 */
.example {
  background-image: url("../../../assets/images/example.png");
}
```

### 其他常见问题
- 组件加载失败: 检查组件路径和命名是否正确
- API请求失败: 检查网络配置和接口地址
- 样式冲突: 使用命名空间或CSS Modules隔离样式

## 功能模块
- 用户认证与授权
- 数据可视化
- 表单处理
- 文件管理
- 地图集成
- 多语言支持

## 开发规范
- 组件命名使用 PascalCase
- 文件命名使用 kebab-case
- CSS 类名使用 BEM 命名规范
- 使用 ESLint 进行代码质量控制

## 贡献指南
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request
