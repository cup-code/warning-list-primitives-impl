export default {
  presets: [
    ['@vue/babel-preset-app', {
      useBuiltIns: 'usage',
      corejs: 3,
      targets: {
        browsers: ['> 1%', 'last 2 versions', 'not dead']
      }
    }]
  ],
  sourceType: 'unambiguous',
  plugins: [
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-syntax-dynamic-import',
    ["import", {
      "libraryName": "link-sdk",
      "libraryDirectory": "lib",
      "camel2DashComponentName": false,
      "style": (name) => {
        return false
      }
    }, "link-sdk"],
    ["import", {
      "libraryName": "link-ui",
      "libraryDirectory": "lib",
      "camel2DashComponentName": false,
      "style": (name) => {
        return true
      }
    }, "link-ui"]
  ],
}
