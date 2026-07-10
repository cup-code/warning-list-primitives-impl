<script>
import {
  getAllSafeLibEvalType,
  getByIdSafeLibEvalItem,
  saveOrUpdateSafeLibEvalItem,
} from '@/http/fireControl-api'

export default {
  components: {},
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
      default: '90px',
    },
    dataSource: {
      required: false,
      type: Object,
      default: () => {
        return {}
      },
    },
    formStatus: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      dialogForm: {
        item: '',
      },
      rules: {
        category: [{ required: true, message: '不能为空', trigger: 'change' }],
        item: [{ required: true, message: '不能为空', trigger: 'change' }],
        evalContent: [{ required: true, message: '不能为空', trigger: 'change' }],
        evalMeasure: [{ required: true, message: '不能为空', trigger: 'change' }],
        standardScore: [{ required: true, message: '不能为空', trigger: 'change' }],
      },
      problemOptions: [
        { label: '是', value: '1' },
        { label: '否', value: '2' },
      ],
      categoryList: [],
      itemList: [],
      allTreeTypeList: [],
    }
  },
  watch: {
    dataSource: {
      handler(val) {
        this.dialogForm = JSON.parse(JSON.stringify(val))
        if (val.id) {
          getByIdSafeLibEvalItem({ id: val.id }).then(({ data }) => {
            if (data.code === 200 && data.result) {
              this.dialogForm = data.result
              this.reverseParams(this.dialogForm)
            }
          })
        }
      },
      immediate: true,
    },
  },
  created() {
    // this.getTreeType()
  },
  methods: {
    // 关闭模态框
    closeDialog() {
      this.$emit('handleClose', false)
    },
    reverseParams(data) {
      // 考评项目下拉数据拼接
      if (data.item) {
        this.itemList = [{ id: data.item, typeName: data.itemName }]
      }
    },
    // 确定
    doneFn() {
      this.$refs.dialogForm.validate((valid, obj) => {
        if (!valid)
          return
        saveOrUpdateSafeLibEvalItem(this.dialogForm).then(({ data }) => {
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
    getTreeType() {
      getAllSafeLibEvalType().then(({ data }) => {
        if (data.success) {
          const typeList = data.result || []
          this.allTreeTypeList = typeList
          this.categoryList = typeList.filter(item => !item.parentId)
        }
      })
    },
    handleCategory(val, itemOption) {
      // this.$refs.item.resetField()
      this.$set(this.dialogForm, 'item', '')
      this.itemList = this.allTreeTypeList.filter(item => item.parentId === val)
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      class="normal-dialog course-dialog"
      :title="title"
      :width="width"
      :close-on-click-modal="false"
      center
      :visible.sync="visible"
      :before-close="closeDialog"
      destroy-on-close
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
          <el-col :span="12">
            <el-form-item
              label="考评类目"
              prop="category"
            >
              <el-input
                v-model.trim="dialogForm.categoryName"
                placeholder="请输入"
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              ref="item"
              label="考评项目"
              prop="item"
            >
              <el-input
                v-model.trim="dialogForm.itemName"
                placeholder="请输入"
                clearable
                :disabled="true"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="考评内容"
              prop="evalContent"
            >
              <el-input
                v-model.trim="dialogForm.evalContent"
                type="textarea"
                rows="3"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="考评办法"
              prop="evalMeasure"
            >
              <el-input
                v-model.trim="dialogForm.evalMeasure"
                type="textarea"
                rows="3"
                placeholder="请输入"
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              label="标准分值"
              prop="standardScore"
            >
              <el-input-number
                v-model="dialogForm.standardScore"
                :min="1"
                label="标准分值"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div
        slot="footer"
        class="dialog-footer"
      >
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
  </div>
</template>

<style scoped lang="scss">
.normal-dialog.course-dialog {
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
@mixin requiredFlag {
  content: '*';
  color: #f03d3d;
  margin-right: 4px;
}
.define-item {
  .el-form-item__label::before {
    @include requiredFlag;
  }
}
.defineHeader {
  @include requiredFlag;
}
</style>
