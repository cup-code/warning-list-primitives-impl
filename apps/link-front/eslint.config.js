import antfu from '@antfu/eslint-config'

export default antfu({
  // 项目配置
  typescript: false,
  vue: {
    vueVersion: 2,
    sfcBlocks: false, // 禁用 eslint-processor-vue-blocks（不兼容 Vue 2）
  },
  markdown: false,
  formatters: true, // 启用 @antfu 的内置格式化

  rules: {
    // ========== Vue 规则 ==========
    'vue/attribute-hyphenation': 'off',
    'vue/no-unused-refs': 'off',
    'vue/valid-v-for': 'off',
    'vue/no-unused-components': 'off',
    'vue/component-name-in-template-casing': 'off',
    'vue/component-definition-name-casing': 'off',
    'vue/max-attributes-per-line': 'off', // 让 @antfu 的格式化自动处理

    // ========== 代码质量规则 ==========
    'no-console': 'off', // 允许 console
    'no-use-before-define': 'off',
    'no-undef': 'warn',
    'eqeqeq': ['warn', 'smart'], // 智能相等比较
    'no-new': 'off',
    // ========== 未使用变量/导入 ==========
    'no-unused-vars': ['warn', {
      caughtErrors: 'all',
      varsIgnorePattern: '^err',
    }],
    'unused-imports/no-unused-vars': ['warn', {
      vars: 'all',
      varsIgnorePattern: '^_',
      args: 'after-used',
      argsIgnorePattern: '^_',
    }],
    'unused-imports/no-unused-imports': 'error',
    // ========== 其他规则 ==========
    'curly': 'off',
    'node/prefer-global/process': 'off',
    'unicorn/prefer-node-protocol': 'off',
    'no-useless-call': 'off',
    'ts/no-namespace': 'off',
    'perfectionist/sort-exports': 'off',
    'array-callback-return': 'off',
    'style/no-tabs': 'off',
  },
})
