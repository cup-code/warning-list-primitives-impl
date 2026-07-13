<script>
import { addHKModel } from '@/http/hkAi-api'

export default {
  name: 'AddModelDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    forms: {
      type: Object,
      defult: () => {
        return {}
      },
    },
  },
  data() {
    return {
      rules: {
        mpId: [{ required: true, message: '模型id不能为空', trigger: 'blur' }],
        mpName: [{ required: true, message: '模型名称不能为空', trigger: 'blur' }],
        target: [{ required: true, message: '目标类别不能为空', trigger: 'blur' }],
        modelId: [{ required: true, message: '目标id不能为空', trigger: 'blur' }],
        labelId: [{ required: true, message: '标签id不能为空', trigger: 'blur' }],
        labelName: [{ required: true, message: '标签名称不能为空', trigger: 'blur' }],
      },
    }
  },
  computed: {
    getDisabled() {
      const {
        mpId,
        mpName,
        target,
        modelId,
        labelId,
        labelName,
      } = this.forms
      return !mpId || !mpName || !target || !modelId || !labelId || !labelName || this.disabled
    },
  },
  methods: {
    onCancel() {
      this.$emit('update:dialogVisible', false)
      this.$emit('update:disabled', false)
      this.$emit('update:forms', {
        mpId: '',
        mpName: '',
        target: '',
        modelId: '',
        labelId: '',
        labelName: '',
        propType: '',
      })
    },
    onConfirm() {
      addHKModel(this.forms)
        .then((res) => {
          if (res.data?.success) {
            this.$message.success('添加成功')
            this.forms = {
              mpId: '',
              mpName: '',
              target: '',
              modelId: '',
              labelId: '',
              labelName: '',
              propType: '',
            }
            this.onCancel()
            this.$emit('confirm')
          }
        })
        .catch()
    },
  },
}
</script>

<template>
  <el-dialog
    class="normal-dialog edit-dialog"
    :visible.sync="dialogVisible"
    :title="title"
    @close="onCancel"
  >
    <el-form
      :model="forms"
      :rules="rules"
      label-width="auto"
      :disabled="disabled"
      label-position="left"
    >
      <div class="form-block">
        <el-form-item
          style="margin-right: 6px"
          label="模型id"
          prop="mpId"
        >
          <el-input
            v-model="forms.mpId"
            clearable
          />
        </el-form-item>
        <el-form-item
          style="margin-right: 6px"
          label="模型名称"
          prop="mpName"
        >
          <el-input
            v-model="forms.mpName"
            clearable
          />
        </el-form-item>
        <el-form-item
          style="margin-right: 6px"
          label="目标类别"
          prop="target"
        >
          <el-input
            v-model="forms.target"
            clearable
          />
        </el-form-item>
        <el-form-item
          style="margin-right: 6px"
          label="目标id"
          prop="modelId"
        >
          <el-input
            v-model="forms.modelId"
            clearable
          />
        </el-form-item>
        <el-form-item
          style="margin-right: 6px"
          label="标签id"
          prop="labelId"
        >
          <el-input
            v-model="forms.labelId"
            clearable
          />
        </el-form-item>
        <el-form-item
          style="margin-right: 6px"
          label="标签名称"
          prop="labelName"
        >
          <el-input
            v-model="forms.labelName"
            clearable
          />
        </el-form-item>
        <el-form-item
          style="margin-right: 6px"
          label="属性类型"
          prop="propType"
        >
          <el-input
            v-model="forms.propType"
            clearable
          />
        </el-form-item>
      </div>
    </el-form>

    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="onCancel">取 消</el-button>
      <el-button
        type="primary"
        :disabled="getDisabled"
        @click="onConfirm"
      >确 定</el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.form-block {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

::v-deep .theme-default.el-form-item--mini.el-form-item {
  margin-right: 4px !important;
}
</style>
