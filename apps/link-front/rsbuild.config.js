import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig, loadEnv } from '@rsbuild/core'
import { pluginBabel } from '@rsbuild/plugin-babel'
import { pluginImageCompress } from '@rsbuild/plugin-image-compress'
import { pluginLess } from '@rsbuild/plugin-less'
import { pluginNodePolyfill } from '@rsbuild/plugin-node-polyfill'
import { pluginSass } from '@rsbuild/plugin-sass'
import { pluginVue2 } from '@rsbuild/plugin-vue2'
import { pluginVue2Jsx } from '@rsbuild/plugin-vue2-jsx'
import { rspack } from '@rspack/core'
import pkg from './aliasconfig.js'

const { getPkgAlias } = pkg
const __dirname = path.dirname(fileURLToPath(import.meta.url))

function resolve(dir) {
  return path.join(__dirname, dir)
}

// 获取环境变量
const { publicVars } = loadEnv({ prefixes: ['VUE_APP_'] })
const isProduction = env => env === 'production'
// 需要编译的依赖包
const transpileDependencies = [
  'link-ui',
  'link-sdk',
  'link-angel-system-review',
  'link-angel-special-operation',
  'link-angel-change-management',
  'link-angel-group-report',
  'link-angel-editor',
  'link-angel-edu',
]

export default defineConfig(env => ({
  plugins: [
    pluginVue2(),
    pluginVue2Jsx(),
    pluginBabel({
      include: transpileDependencies,
      babelLoaderOptions: {
        cacheDirectory: true,
        cacheCompression: false,
        compact: true,
      },
      plugins: [
        '@babel/plugin-syntax-dynamic-import',
        '@babel/plugin-proposal-nullish-coalescing-operator',
        '@babel/plugin-proposal-optional-chaining',
      ],
    }),
    pluginSass({
      sassOptions: {
        outputStyle: 'expanded',
        sourceMap: false, // ✅ 简化：开发环境禁用 Sass source map
      },
      // ✅ 移除自动注入，改为在需要的文件中显式导入
      prependData: `@import "@/styles/variables.scss";`,
    }),
    pluginLess(),
    pluginNodePolyfill(),
    // 自定义 PNG 压缩参数并跳过已知问题文件，其余沿用默认 jpeg/ico 规则
    pluginImageCompress(
      'jpeg',
      {
        use: 'png',
        // 避免特定 PNG 在压缩阶段触发 VALUE_OUT_OF_RANGE
        exclude: [
          /jsmap\/Assets\/Textures\/maki\/cesium\.png$/,
          /jsmap\/Widgets\/Images\/ImageryProviders\/ArcGisMapServiceWorldHillshade\.png$/,
        ],
        // 降低压缩强度，减少极端格式报错
        quality: 80,
        effort: 4,
      },
      'ico',
    ),
  ],
  source: {
    // 入口文件
    entry: { index: './src/main.js' }, // 统一使用 index 作为入口名称，输出为 index.html
    define: {
      ...publicVars,
      // 确保使用完整版的 Vue
      'process.env.RUNTIME_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.TASK': JSON.stringify(process.env.TASK),
    },
    include: transpileDependencies,
  },
  resolve: {
    alias: {
      '@': resolve('src'),
      '@router': resolve('src/router'),
      // 路由配置别名
      '@router-config': resolve('src/router/routes-all.js'),
      // 确保使用完整版的 Vue
      'vue$': 'vue/dist/vue.esm.js',
      // 使用dayjs替代moment
      'dayjs': resolve('node_modules/dayjs'),
      // 为了兼容，添加moment别名指向dayjs
      'moment': resolve('node_modules/dayjs'),
      '@/dayjs': resolve('src/utils/dayjs.js'),
      ...getPkgAlias(),
    },
  },
  output: {
    assetPrefix: './', // 统一为空字符串，避免CSS中图片路径被错误添加前缀
    distPath: {
      root: 'dist',
      html: './',
      js: 'js',
      css: 'css',
      svg: 'svg',
      font: 'font',
      image: 'images',
      media: 'media',
    },
    // 启用WebP格式支持
    dataUriLimit: {
      image: 4096, // 8KB以下的图片转为base64
    },
    sourceMap: {
      js: false, // ✅ 开发环境禁用 JS source map，提升速度
      css: false, // ✅ 开发环境禁用 CSS source map
    },
    injectStyles: true,
    minify: true,
    // 启用资源压缩
    compress: true,
    targets: ['chrome >= 87', 'edge >= 88', 'firefox >= 78', 'safari >= 14'],
    copy: [
      // 视频播放器相关资源
      {
        from: 'node_modules/@liveqing/liveplayer/dist/component/crossdomain.xml',
        to: '',
      },
      {
        from: 'node_modules/@liveqing/liveplayer/dist/component/liveplayer.swf',
        to: '',
      },
      {
        from:
          'node_modules/@liveqing/liveplayer/dist/component/liveplayer-lib.min.js',
        to: 'js/',
      },
      {
        from: 'public',
        to: '',
        globOptions: {
          ignore: [
            '**/index.html',
            '**/*.LICENSE.txt',
            '**/wxbind/**', // ~44KB 微信绑定页面
          ],
        },
      },
    ],
    charset: 'utf8',
    polyfill: 'usage',
    externals: {
      // 'pdfjs-dist': 'pdfjsLib', // 已改为使用本地 npm 包，不再使用 CDN
      // 'vue-pdf': 'VuePdf',
      'cesium': 'Cesium',
      'monaco-editor': 'monaco',
    },
  },
  dev: {
    assetPrefix: '', // 开发环境也修改为空字符串
    hmr: true,
    https: false,
    host: 'localhost',
    port: 8800,
    open: true,
    strictPort: false,
    writeToDisk: false,
    lazyCompilation: true,
    //  {
    //   imports: true,
    //   entries: true,  // ✅ 修改：让入口也懒编译，按需编译路由页面
    // },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://101.42.139.163:8778',
        pathRewrite: { '^/api': '/api' },
        changeOrigin: true,
      },
      '/mapdata': {
        target: 'http://101.42.139.163:8778',
        pathRewrite: { '^/mapdata': '/mapdata' },
        changeOrigin: true,
      },
    },
  },
  html: {
    template({ entryName }) {
      // HTML 模板
      return 'public/index.html'
    },
    crossorigin: 'anonymous',
    // 优化字体加载
    templateParameters: {
      fontPreload: [
        {
          href: './font/iconfont.240814-1717.2adc9267.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: 'anonymous',
        },
        {
          href: './font/element-icons.ff18efd1.woff',
          as: 'font',
          type: 'font/woff',
          crossorigin: 'anonymous',
        },
      ],
    },
  },
  tools: {
    postcss: {
      plugins: [['tailwindcss', { config: './tailwind.config.cjs' }], ['autoprefixer']],
    },
    rspack: (config, { env }) => {
      // if (env !== 'production') {
      //   config.cache = {
      //     type: 'filesystem',
      //     cacheDirectory: path.resolve(__dirname, 'node_modules/.cache/rspack'),
      //     buildDependencies: {
      //       config: [],
      //     },
      //   };
      // }
      // 启用Tree Shaking
      config.optimization.usedExports = true
      config.optimization.sideEffects = false

      // 优化模块解析
      config.resolve.modules = ['node_modules']
      config.resolve.extensions = ['.js', '.vue', '.json']

      // 添加WebP格式支持
      config.module = config.module || {}
      config.module.rules = config.module.rules || []

      // WebP图片处理规则 (排除SVG，SVG由svg-sprite-loader处理)
      config.module.rules.push({
        test: /\.(png|jpe?g|gif)$/i,
        type: 'asset',
        generator: {
          filename: 'images/[name].[hash:8][ext]',
        },
        parser: {
          dataUrlCondition: {
            maxSize: 8192, // 8KB
          },
        },
      })

      // 3D模型文件处理规则 - 防止被当成JavaScript解析
      config.module.rules.push({
        test: /\.(glb|gltf|bin|hdr)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'models/[name].[hash:8][ext]',
        },
      })

    // ============ PDF.js Worker 配置 ============
      // 解决 worker-loader 与 rspack 的兼容性问题
      // 使用 NormalModuleReplacementPlugin 将 worker-loader! 替换为 worker-rspack-loader!

      config.plugins.push(
        new rspack.NormalModuleReplacementPlugin(
          /^worker-loader\?.*!.*pdf\.worker\.js$/,
          (resource) => {
            // 提取 worker-loader! 后面的实际文件路径
            const match = resource.request.match(/worker-loader\?.*!(.+)$/)
            if (match) {
              // 替换为 worker-rspack-loader，保持相同的配置参数
              resource.request = `worker-rspack-loader?filename=js/[name].[contenthash].worker.js&esModule=false!${match[1]}`
            }
          }
        )
      )

      // 配置 worker-rspack-loader 处理规则
      // 确保所有 PDF worker 文件都被正确打包
      config.module.rules.push({
        test: /\.worker\.js$/i,
        include: /node_modules[\\/]pdfjs-dist[\\/]/,
        use: [
          {
            loader: 'worker-rspack-loader',
            options: {
              filename: 'js/[name].[contenthash].worker.js',
              esModule: false,
            },
          },
        ],
        type: 'javascript/auto',
      })
      // 富文本编辑器，处理图片相关
      config.builtins = config.builtins || {}
      config.builtins.provide = config.builtins.provide || {}
      Object.assign(config.builtins.provide, {
        'window.Quill': 'quill/dist/quill.js',
        'Quill': 'quill/dist/quill.js',
      })

      // 生产环境优化
      if (env === 'production') {
        config.optimization.minimize = true
      }

      config.plugins.push(
        new rspack.experiments.CssChunkingPlugin({
          strict: false,
        }),
      )
      return config
    },
    bundlerChain: (chain) => {
      // 设置 SVG 处理规则
      chain.module.rule('svg').exclude.add(resolve('src/icons')).end()

      chain.module
        .rule('icons')
        .test(/\.svg$/)
        .include
        .add(resolve('src/icons'))
        .end()
        .use('svg-sprite-loader')
        .loader('svg-sprite-loader')
        .options({
          symbolId: 'icon-[name]',
          extract: false,
          spriteFilename: 'icons.svg',
        })
    },
  },
  performance: {
    buildCache: {
      cacheDirectory: './node_modules/.cache/rsbuild',
    },
    // 增加构建缓存
    profile: process.env.ANALYZE === 'true',
    removeConsole: isProduction(env),
    // 启用预加载
    // preload: true,
    chunkSplit: {
      strategy: isProduction(env) ? 'custom' : 'all-in-one',
      splitChunks: {
        chunks: isProduction(env) ? 'all' : 'async',
        minSize: 20000,
        maxSize: 500000,
        maxAsyncRequests: 15,
        maxInitialRequests: 10,
        cacheGroups: {
            // ============ 完整版分包策略 ============
            // 2. Element UI - 单独打包
            elementUI: {
              name: 'chunk-element-ui',
              test: /[\\/]node_modules[\\/]element-ui[\\/]/,
              priority: 45,
              chunks: 'all',
              enforce: true,
            },

            // 3. 图表库 - ECharts相关
            charts: {
              name: 'chunk-charts',
              test: /[\\/]node_modules[\\/](echarts|vue-echarts)[\\/]/,
              priority: 40,
              chunks: 'all',
              enforce: true,
            },

            // 4. 编辑器相关 - Monaco Editor
            editor: {
              name: 'chunk-editor',
              test: /[\\/]node_modules[\\/]monaco-editor[\\/]/,
              priority: 35,
              chunks: 'all',
              enforce: true,
            },

            // 5. BPMN流程相关
            bpmn: {
              name: 'chunk-bpmn',
              test: /[\\/]node_modules[\\/](bpmn-js|kaka-bpmn)[\\/]/,
              priority: 30,
              chunks: 'all',
              enforce: true,
            },

            // 6. 地图相关 - Mapbox GL
            map: {
              name: 'chunk-map',
              test: /[\\/]node_modules[\\/](mapbox-gl|@mapbox)[\\/]/,
              priority: 25,
              chunks: 'all',
              enforce: true,
            },

            // 6.5. Luckysheet 已改为按需加载（通过 loadLuckysheet），不需要代码分割
            // luckysheet: {
            //   name: "chunk-luckysheet",
            //   test: /[\\/]node_modules[\\/]luckysheet[\\/]/,
            //   priority: 24,
            //   chunks: "all",
            //   enforce: true,
            // },

            // 6.6. 3D地图 - Jsmap
            jsmap: {
              name: 'chunk-jsmap',
              test: /[\\/]node_modules[\\/]link-jsmap-package[\\/]/,
              priority: 23,
              chunks: 'all',
              enforce: true,
            },

            // 7. PDF相关
            // pdf: {
            //   name: 'chunk-pdf',
            //   test: /[\\/]node_modules[\\/](pdfjs-dist|vue-pdf)[\\/]/,
            //   priority: 20,
            //   chunks: 'all',
            //   enforce: true,
            // },

            // 9. 业务模块 - 按功能域拆分
            safety: {
              name: 'chunk-safety',
              test: /[\\/]src[\\/]views[\\/](accidentManage|majorHazard|safeProductionTarget|safetyInvestment|specialEquipment|specialOperation)[\\/]/,
              priority: 10,
              chunks: 'all',
              minChunks: 1,
              reuseExistingChunk: true,
            },

            emergency: {
              name: 'chunk-emergency',
              test: /[\\/]src[\\/]views[\\/](emergency|contingencyManage|fireControl)[\\/]/,
              priority: 10,
              chunks: 'all',
              minChunks: 1,
              reuseExistingChunk: true,
            },

            equipment: {
              name: 'chunk-equipment',
              test: /[\\/]src[\\/]views[\\/](eam|equipment|dev)[\\/]/,
              priority: 10,
              chunks: 'all',
              minChunks: 1,
              reuseExistingChunk: true,
            },

            visualization: {
              name: 'chunk-visualization',
              test: /[\\/]src[\\/]views[\\/](visualizationCenter|cesium3d|maps)[\\/]/,
              priority: 10,
              chunks: 'all',
              minChunks: 1,
              reuseExistingChunk: true,
            },

            components: {
              name: 'chunk-components',
              test: /[\\/]src[\\/]components[\\/]/,
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },

            // 10. 其他第三方库
            vendor: {
              name: 'chunk-vendor',
              test: /[\\/]node_modules[\\/]/,
              priority: 5,
              chunks: 'all',
              maxSize: 300000,
              enforce: true,
            },

            async: {
              name: 'chunk-async',
              chunks: 'async',
              minChunks: 1,
              priority: 1,
              reuseExistingChunk: true,
            },

            // 11. 公共业务代码
            views: {
              name: 'chunk-views',
              test: /[\\/]src[\\/]views[\\/]/,
              minChunks: 1,
              priority: 5,
              reuseExistingChunk: true,
              chunks: 'async',
            },
          },
      },
    },
  },
}))
