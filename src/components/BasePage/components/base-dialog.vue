<script>
import anjiSelect from '@/components/AnjiPlus/anji-select'
import optSelect from '@/components/BasePage/components/opt-select'
import InnerTable from '@/components/BasePage/components/table.vue'
import upload from '@/components/BasePage/components/upload.vue'
import SelectTree from '@/components/treeSelect/treeSelect.vue'

export default {
  components: {
    OptSelect: optSelect,
    SelectTree,
    Upload: upload,
    InnerTable,
    AnjiSelect: anjiSelect,
  },
  props: {
    title: {
      require: true,
      type: String,
      default: '标题',
    },
    width: {
      type: String,
      default: '50%',
    },
    visible: {
      required: true,
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'mini',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    labelWidth: {
      type: String,
      default: '80px',
    },
    formFields: {
      require: true,
      type: Array,
      default: () => {
        return []
      },
    },
    dataSource: {
      required: false,
      type: Object,
      default: () => {
        return {}
      },
    },
    api: '',
  },
  data() {
    return {
      dialogForm: {},
      rules: {},
      fileObj: {},
    }
  },
  watch: {
    dataSource(val) {
      this.dialogForm = JSON.parse(JSON.stringify(val))

      // 处理文件回显
      if (val.fileName) {
        this.fileObj = {
          name: val.fileName,
          file: val.file,
        }
      }
      else {
        this.fileObj = {}
      }

      // 处理培训计划时间的回显
      if (val.trainDate) {
        this.dialogForm.trainDate = new Date(val.trainDate).getTime()
      }

      this.$nextTick(() => {
        // zbs: 为了解决左侧树修改了 但是 弹窗内的下拉树 没有实施更新的问题
        const selTrees = Object.keys(this.$refs).filter(
          item => item.includes('selectTree_'),
        )
        selTrees.forEach((item) => {
          this.$refs[item][0].getTree()
        })
      })
    },
  },
  methods: {
    // 关闭模态框
    closeDialog() {
      this.$emit('handleClose')
    },
    formFieldSpan(item) {
      if (item.span != null) {
        return item.span
      }
      else {
        return 24
      }
    },
    fileChange(fileObj) {
      this.fileObj = fileObj
      if (JSON.stringify(fileObj) === '{}') {
        delete this.dialogForm.fileName
        delete this.dialogForm.file
      }
      else {
        this.$set(this.dialogForm, 'fileName', fileObj.name)
        this.$set(this.dialogForm, 'file', fileObj.url)

        // 清除校验提示
        this.$refs.uploadItem[0].clearValidate()
      }
    },
    // table的change事件
    handleTable(data, item, form) {
      item.fn && item.fn(data, item, form)
    },
    // opt-select的change事件
    handleOptSelect(value, item, form) {
      form[item.prop] = value

      const $innerTable = this.$refs.innerTable
      item.fn && item.fn(value, item, form, $innerTable[0])
    },

    // 确定
    doneFn() {
      this.$refs.dialogForm.validate((valid) => {
        if (!valid)
          return

        this.api(this.dialogForm).then(({ data }) => {
          if (data.code != '200') {
            this.$message.error(data.message || '保存失败!')
            return
          }
          else {
            this.$message.success('保存成功')
          }
          this.$emit('refreshList')
          this.closeDialog()
        })
      })
    },
  },
}
</script>

<template>
  <el-dialog
    class="normal-dialog base-dialog"
    :title="title"
    :width="width"
    :close-on-click-modal="false"
    center
    :visible.sync="visible"
    :before-close="closeDialog"
  >
    <el-form
      ref="dialogForm"
      :model="dialogForm"
      :rules="rules"
      :size="size"
      :label-width="labelWidth"
      :disabled="disabled"
    >
      <el-row>
        <el-col
          v-for="item in formFields"
          :key="item.prop"
          :span="formFieldSpan(item)"
        >
          <el-form-item
            v-if="item.type !== 'upload'"
            :label="item.label"
            :rules="item.rules"
            :prop="item.prop"
          >
            <!-- 输入框 -->
            <el-input
              v-if="item.type == 'input'"
              v-model.trim="dialogForm[item.prop]"
              :placeholder="item.placeholder || '请输入'"
              :clearable="item.clearable !== false"
              :disabled="item.disabled"
            >
              <span v-if="item.suffix" slot="suffix">{{ item.suffix }}</span>
              <span v-if="item.append" slot="append">{{ item.append }}</span>
            </el-input>
            <!-- 数字输入框 -->
            <!-- <el-input-number
                            v-if="item.type == 'input-number'"
                            v-model.trim="dialogForm[item.prop]"
                            :placeholder="item.placeholder || '请输入'"
                            :clearable="item.clearable !== false"
                            :disabled="item.disabled"
                        /> -->
            <el-input
              v-if="item.type == 'input-number'"
              v-model.trim="dialogForm[item.prop]"
              type="number"
              :placeholder="item.placeholder || '请输入'"
              :clearable="item.clearable !== false"
              :disabled="item.disabled"
            />
            <!-- 多行文本 -->
            <el-input
              v-if="item.type == 'textarea'"
              v-model.trim="dialogForm[item.prop]"
              type="textarea"
              :rows="item.rows"
              :placeholder="item.placeholder || '请输入'"
              :clearable="item.clearable !== false"
              :disabled="item.disabled"
            />
            <!-- 下拉框 -->
            <opt-select
              v-if="item.type == 'anji-select'"
              v-model.trim="dialogForm[item.prop]"
              :multiple="item.anjiSelectOption.multiple"
              :dict-code="item.anjiSelectOption.dictCode"
              :url="item.anjiSelectOption.url"
              :method="item.anjiSelectOption.method"
              :query-param="item.anjiSelectOption.queryParam"
              :option="item.anjiSelectOption.option"
              :label="item.anjiSelectOption.label"
              :disabled-options="item.anjiSelectOption.disabledOptions"
              :disabled="item.disabled"
              :merge-label="item.anjiSelectOption.mergeLabel"
              :localOptions="item.anjiSelectOption.localOptions"
              @change="(value) => handleOptSelect(value, item, dialogForm)"
            />
            <!-- 下拉选择树 -->
            <SelectTree
              v-if="item.type === 'selectTree'"
              :ref="`selectTree_${item.prop}`"
              v-model="dialogForm[item.prop]"
              size="mini"
              :props="item.props"
              :url="item.url"
              :clearable="item.clearable"
              :accordion="true"
              :disabled="item.disabled"
              @getValue="
                (value) => {
                  dialogForm[item.prop] = value;
                }
              "
            />
            <!-- 文件上传 -->
            <!-- <upload
                            v-if="item.type === 'upload'"
                            v-model="fileObj"
                            :upLoadUrl="item.upload.upLoadUrl"
                            @change="value => fileChange(value)"
                        /> -->
            <!-- 可编辑表格 -->
            <InnerTable
              v-if="item.type === 'table'"
              ref="innerTable"
              v-model="dialogForm[item.prop]"
              :api="item.api"
              :apiCallback="item.apiCallback"
              :config="item.config"
              @change="(data) => handleTable(data, item, dialogForm)"
            />

            <el-date-picker
              v-if="item.type === 'date'"
              v-model="dialogForm[item.prop]"
              style="width: 100%"
              :placeholder="item.placeholder || '请选择'"
              :type="item.inputType"
              :format="item.format"
              :value-format="item.valueFormat"
              :clearable="item.clearable !== false"
              @change="
                (value) => {
                  dialogForm[item.prop] = value;
                }
              "
            />
          </el-form-item>

          <el-form-item
            v-if="item.type === 'upload'"
            ref="uploadItem"
            :label="item.label"
            :rules="item.rules"
            :prop="item.prop"
          >
            <upload
              v-if="item.type === 'upload'"
              v-model="fileObj"
              :upLoadUrl="item.upload.upLoadUrl"
              :downloadable="item.downloadable"
              @change="(value) => fileChange(value)"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="closeDialog">
        取消
      </el-button>
      <el-button
        type="primary"
        :disabled="disabled"
        @click="doneFn"
      >
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.normal-dialog.base-dialog {
  .el-dialog__header {
    min-height: 46px;
    .el-dialog__title {
      font-size: 16px;
      &::before {
        height: 20px;
      }
    }
  }
  .el-dialog__footer {
    padding: 8px 20px;
    border-top: 1px solid #e8e8e8;
    .dialog-footer {
      height: 30px;
    }
  }
}
</style>
