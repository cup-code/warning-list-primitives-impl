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
    pluginImageCompress(),
  ],
  source: {
    // 根据 TASK 环境变量指定入口文件
    entry: {
      index: './src/main.js',
    }, // 统一使用 index 作为入口名称，输出为 index.html
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
      // 确保使用完整版的 Vue
      'vue$': 'vue/dist/vue.esm.js',
      // 使用dayjs替代moment
      'dayjs': resolve('node_modules/dayjs'),
      // 为了兼容，添加moment别名指向dayjs
      'moment': resolve('node_modules/dayjs'),
      '@/dayjs': resolve('src/utils/dayjs.js'),
      // 解决vue-pdf的worker加载问题
      'worker-loader!': '',
      ...getPkgAlias(),
    },
  },
  output: {
    assetPrefix: './', // 使用相对路径，支持子目录部署
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
      {
        from: 'public',
        globOptions: {
          ignore: [
            '**/index.html',
            '**/*.LICENSE.txt',
            '**/wxbind/**', // ~44KB 微信绑定页面
            // 精简版排除大型资源
            '**/jsmap/**', // ~29MB 3D地图库（使用动态加载）
            '**/jessibuca/**', // ~1.3MB 视频播放器
            '**/source/anhuan3d/**', // ~780KB 3D安全资源
            '**/luckysheet/**', // ~7.6MB Excel表格库
            '**/media/**', // ~216KB 音视频文件
            '**/static/**', // ~216KB 静态文件
            '**/*.swf', // Flash文件
            '**/*.mp3', // 音频文件
            '**/*.ogg', // 音频文件
          ],
        },
      },
    ],
    charset: 'utf8',
    polyfill: 'usage',
    externals: {
      'pdfjs-dist': 'pdfjsLib',
      'vue-pdf': 'VuePdf',
      'cesium': 'Cesium',
      'monaco-editor': 'monaco',
    },
  },
  dev: {
    assetPrefix: '', // 开发环境也使用相对路径
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
    template: 'public/index.html',
    // 根据 TASK 环境变量选择模板
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
          // ============ 精简版分包策略 ============
          // 将Element UI单独打包
          elementUI: {
            name: 'chunk-element-ui',
            priority: 30,
            test: /[\\/]node_modules[\\/]element-ui[\\/]/,
          },
          // 基础库打包
          vendors: {
            name: 'chunk-vendors',
            test: /[\\/]node_modules[\\/]/,
            priority: 15,
            chunks: 'initial',
            reuseExistingChunk: true,
          },
          // 将频繁变动的组件单独打包
          components: {
            name: 'chunk-components',
            test: /[\\/]src[\\/]components[\\/]/,
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
          // 异步模块
          async: {
            name: 'chunk-async',
            chunks: 'async',
            minChunks: 1,
            priority: 1,
            reuseExistingChunk: true,
          },
          // 将各业务模块分开打包
          modules: {
            name(module) {
              const moduleName = module.context.match(
                /[\\/]src[\\/]views[\\/](.*?)[\\/]/,
              )
              return moduleName
                ? `module-${moduleName[1].replace(/[\\/]/g, '-')}`
                : 'common'
            },
            test: /[\\/]src[\\/]views[\\/]/,
            minChunks: 1,
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      },
    },
  },
}))
