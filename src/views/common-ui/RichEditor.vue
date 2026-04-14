<script>
import { Quill, quillEditor } from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

export default {
  components: {
    QuillEditor: quillEditor,
  },
  props: {
    // 富文本内容
    value: {
      type: String,
      default: '',
    },
    // 富文本类型，用于区分同一页面下多个富文本框
    textType: {
      type: String,
      default: '',
    },
    // 编辑框高度
    height: {
      type: String,
      default: '400px',
    },
    // 编辑框宽度
    width: {
      type: String,
      default: '100%',
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      richText: '',
      // 配置项
      editorOption: {
        modules: {
          imageResize: {
            displayStyles: {
              backgroundColor: 'black',
              border: 'none',
              color: 'white',
            },
            modules: ['Resize', 'DisplaySize', 'Toolbar'],
          },
          toolbar: {
            container: [
              ['bold', 'italic', 'underline', 'strike'], // 加粗 斜体 下划线 删除线
              ['blockquote', 'code-block'], // 引用  代码块
              [{ header: 1 }, { header: 2 }], // 1、2 级标题
              [{ list: 'ordered' }, { list: 'bullet' }], // 有序、无序列表
              [{ script: 'sub' }, { script: 'super' }], // 上标/下标
              [{ indent: '-1' }, { indent: '+1' }], // 缩进
              [{ direction: 'rtl' }], // 文本方向
              [
                {
                  size: [
                    '10px',
                    '12px',
                    '14px',
                    '16px',
                    '18px',
                    '20px',
                    '22px',
                    '24px',
                    '26px',
                    '28px',
                    '30px',
                    '32px',
                    '36px',
                    '38px',
                    '40px',
                    '45px',
                    '50px',
                    false,
                  ],
                },
              ], // 字体大小
              [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题
              [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
              [{ font: [] }], // 字体种类
              [{ align: [] }], // 对齐方式
              ['clean'], // 清除文本格式
              //   ["link", "image","video"] // 链接、图片、视频
              ['image'], // 链接、图片
            ],
          },
        },
        placeholder: '请输入内容...',
      },
    }
  },
  watch: {
    editable() {
      this.refreshOption()
    },
    value(newValue, oldValue) {
      this.richText = newValue
    },
  },
  async mounted() {
    try {
      // 动态导入图片调整模块
      const ImageResize = await import('quill-image-resize-module')
      Quill.register('modules/imageResize', ImageResize.default || ImageResize)
      this.imageResizeLoaded = true
    }
    catch (error) {
      console.warn('图片调整模块加载失败，将禁用此功能:', error)
      // 如果加载失败，移除imageResize配置
      delete this.editorOption.modules.imageResize
    }

    this.refreshOption()
    this.richText = this.value
  },
  methods: {
    onEditorBlur(quill) {
      // console.log('editor blur!')
    },
    onEditorFocus(quill) {
      // console.log('editor focus!')
    },
    onEditorReady(quill) {
      // console.log('editor ready!')
    },
    onEditorChange({
      quill,
      html,
      text,
    }) {
      this.$emit('input', html)
    },
    /* 刷新配置 */
    refreshOption() {
      if (this.$refs.richEditor) {
        this.$refs.richEditor.quill.enable(this.editable)
      }
    },
  },
}
</script>

<template>
  <quill-editor
    ref="richEditor"
    v-model="richText"
    class="rich-editor"
    :options="editorOption"
    :style="`height: ${height}; width: ${width};margin:0 0 66px 0;`"
    @blur="onEditorBlur($event)"
    @focus="onEditorFocus($event)"
    @ready="onEditorReady($event)"
    @change="onEditorChange($event)"
  />
</template>

<style lang="scss" scoped>
.rich-editor {
  // .quill-editor {
  //   line-height: normal;
  .ql-snow {
    .ql-tooltip[data-mode="link"]::before {
      content: "请输入链接地址:";
    }
    .ql-tooltip.ql-editing a.ql-action::after {
      border-right: 0px;
      content: "保存";
      padding-right: 0px;
    }
    .ql-tooltip[data-mode="video"]::before {
      content: "请输入视频地址:";
    }
    .ql-picker.ql-size {
      .ql-picker-label[data-value="12px"]::before,
      .ql-picker-item[data-value="12px"]::before {
        content: "12px";
      }
      .ql-picker-label[data-value="14px"]::before,
      .ql-picker-item[data-value="14px"]::before {
        content: "14px";
      }
      .ql-picker-label[data-value="16px"]::before,
      .ql-picker-item[data-value="16px"]::before {
        content: "16px";
      }
      .ql-picker-label[data-value="18px"]::before,
      .ql-picker-item[data-value="18px"]::before {
        content: "18px";
      }
      .ql-picker-label[data-value="20px"]::before,
      .ql-picker-item[data-value="20px"]::before {
        content: "20px";
      }
      .ql-picker-label[data-value="24px"]::before,
      .ql-picker-item[data-value="24px"]::before {
        content: "24px";
      }
      .ql-picker-label[data-value="28px"]::before,
      .ql-picker-item[data-value="28px"]::before {
        content: "28px";
      }
      .ql-picker-label[data-value="32px"]::before,
      .ql-picker-item[data-value="32px"]::before {
        content: "32px";
      }
      .ql-picker-label[data-value="36px"]::before,
      .ql-picker-item[data-value="36px"]::before {
        content: "36px";
      }
    }
    .ql-picker.ql-header {
      .ql-picker-label::before,
      .ql-picker-item::before {
        content: "文本";
      }
      .ql-picker-label[data-value="1"]::before,
      .ql-picker-item[data-value="1"]::before {
        content: "标题1";
      }
      .ql-picker-label[data-value="2"]::before,
      .ql-picker-item[data-value="2"]::before {
        content: "标题2";
      }
      .ql-picker-label[data-value="3"]::before,
      .ql-picker-item[data-value="3"]::before {
        content: "标题3";
      }
      .ql-picker-label[data-value="4"]::before,
      .ql-picker-item[data-value="4"]::before {
        content: "标题4";
      }
      .ql-picker-label[data-value="5"]::before,
      .ql-picker-item[data-value="5"]::before {
        content: "标题5";
      }
      .ql-picker-label[data-value="6"]::before,
      .ql-picker-item[data-value="6"]::before {
        content: "标题6";
      }
    }
    .ql-picker.ql-font {
      .ql-picker-label[data-value="SimSun"]::before,
      .ql-picker-item[data-value="SimSun"]::before {
        content: "宋体";
        font-family: "SimSun" !important;
      }
      .ql-picker-label[data-value="SimHei"]::before,
      .ql-picker-item[data-value="SimHei"]::before {
        content: "黑体";
        font-family: "SimHei";
      }
      .ql-picker-label[data-value="Microsoft-YaHei"]::before,
      .ql-picker-item[data-value="Microsoft-YaHei"]::before {
        content: "微软雅黑";
        font-family: "Microsoft YaHei";
      }
      .ql-picker-label[data-value="KaiTi"]::before,
      .ql-picker-item[data-value="KaiTi"]::before {
        content: "楷体";
        font-family: "KaiTi" !important;
      }
      .ql-picker-label[data-value="FangSong"]::before,
      .ql-picker-item[data-value="FangSong"]::before {
        content: "仿宋";
        font-family: "FangSong";
      }
    }
  }
  .ql-align-center {
    text-align: center;
  }
  .ql-align-right {
    text-align: right;
  }
  .ql-align-left {
    text-align: left;
  }
  // }
}
</style>
