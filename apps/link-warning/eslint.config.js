import antfu from '@antfu/eslint-config'

export default antfu({
  // 项目配置
  typescript: false,
  vue: {
    vueVersion: 2,
    sfcBlocks: false, // 禁用 eslint-processor-vue-blocks（不兼容 Vue 2）
  },
  markdown: false,
  formatters: true,
  rules: {
    'vue/attribute-hyphenation': ['off'],
    'node/prefer-global/process': ['off'],
    'no-console': ['off'],
    'no-use-before-define': ['off'],
    'curly': ['off'],
    'object-property-newline': [
      'error',
      { allowAllPropertiesOnSameLine: true },
    ],
    'object-curly-spacing': ['error', 'always'],
    'object-curly-newline': ['error', {
      ObjectPattern: {
        multiline: true,
        minProperties: 3,
      },
      ImportDeclaration: {
        multiline: true,
        minProperties: 3,
      },
      ExportDeclaration: {
        multiline: true,
        minProperties: 3,
      },
    }],
    'vue/no-unused-refs': ['off'],
    // 关闭模板字符串（小程序端需要设置）
    // 'vue/prefer-template': ['off'],
    // 'vue/component-definition-name-casing': ['off'],
    'vue/valid-v-for': ['off'],
    'vue/no-unused-components': ['off'],
    'vue/max-attributes-per-line': ['error', {
      singleline: {
        max: 4,
      },
      multiline: {
        max: 1,
      },
    }],
    'no-unused-vars': ['warn', { caughtErrors: 'all', varsIgnorePattern: '^err' }],
    'unused-imports/no-unused-vars': [
      'warn',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    'unused-imports/no-unused-imports': ['error'],
    'no-undef': ['warn'],
    'unicorn/prefer-node-protocol': ['off'],
    'no-useless-call': 'off',
    'ts/no-namespace': 'off',
    'perfectionist/sort-exports': 'off',
    'vue/component-name-in-template-casing': ['off'],
    // 关闭模板字符串（小程序端需要设置）
    // 'vue/prefer-template': ['off'],
    'vue/component-definition-name-casing': ['off'],
  },
})
