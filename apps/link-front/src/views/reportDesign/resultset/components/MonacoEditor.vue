<script>
// 将直接导入修改为动态导入
// import * as monaco from "monaco-editor";
import createJavascriptCompleter from './util/javascript-completion'
import registerLanguage from './util/log-language'
import createSqlCompleter from './util/sql-completion'

const global = {}

let monaco = null

/**
 * monaco options
 * https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandaloneeditorconstructionoptions.html
 */
export default {
  name: 'MonacoEditor',
  props: {
    options: {
      type: Object,
      default() {
        return {}
      },
    },
    value: {
      type: String,
      required: false,
    },
    language: {
      type: String,
    },
    hints: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      editorInstance: null,
      defaultOptions: {
        theme: 'vs-dark',
        fontSize: 14,
      },
    }
  },
  watch: {
    value() {
      if (this.editorInstance && this.value !== this.editorInstance.getValue()) {
        this.editorInstance.setValue(this.value)
      }
    },
  },
  async mounted() {
    // 动态导入monaco编辑器
    await this.loadMonaco()
    this.initEditor()
    global[this.editorInstance._id] = this
    window.addEventListener('resize', this.layout)
  },
  destroyed() {
    if (this.editorInstance) {
      this.editorInstance.dispose()
    }
    global[this.editorInstance._id] = null
    window.removeEventListener('resize', this.layout)
  },
  methods: {
    async loadMonaco() {
      if (!monaco) {
        monaco = await (() => import('monaco-editor')).then(m => m.default)
        const getHints = (model) => {
          const id = model.id.substring(6)
          return (global[id] && global[id].hints) || []
        }
        // 使用更新后的工具函数接口
        monaco.languages.registerCompletionItemProvider(
          'sql',
          createSqlCompleter(getHints)(monaco),
        )
        monaco.languages.registerCompletionItemProvider(
          'javascript',
          createJavascriptCompleter(getHints)(monaco),
        )
        registerLanguage(monaco)
      }
      return monaco
    },
    layout() {
      if (this.editorInstance) {
        this.editorInstance.layout()
      }
    },
    undo() {
      if (this.editorInstance) {
        this.editorInstance.trigger('anyString', 'undo')
        this.onValueChange()
      }
    },
    redo() {
      if (this.editorInstance) {
        this.editorInstance.trigger('anyString', 'redo')
        this.onValueChange()
      }
    },
    getOptions() {
      const props = { value: this.value }
      this.language !== undefined && (props.language = this.language)
      const options = Object.assign({}, this.defaultOptions, this.options, props)
      return options
    },
    onValueChange() {
      this.$emit('input', this.editorInstance.getValue())
      this.$emit('change', this.editorInstance.getValue())
    },
    initEditor() {
      // this.MonacoEnvironment = {
      //   getWorkerUrl: function () {
      //     return './editor.worker.bundle.js'
      //   },
      // }

      this.editorInstance = monaco.editor.create(this.$refs.editor, this.getOptions())
      this.editorInstance.onContextMenu((e) => {
        this.$emit('contextmenu', e)
      })
      this.editorInstance.onDidChangeModelContent(() => {
        this.onValueChange()
      })
      this.editorInstance.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
        this.$emit('save', this.editorInstance.getValue())
      })
    },
  },
}
</script>

<template>
  <div ref="editor" class="main" />
</template>

<style scoped>
.main::v-deep .view-lines * {
  font-family: Consolas, "Courier New", monospace !important;
}
</style>
