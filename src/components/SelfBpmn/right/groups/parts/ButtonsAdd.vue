<script>
export default {
  props: {
    element: {
      type: Object,
      default: undefined,
    },
    bpmnModeler: {
      type: Object,
      default: undefined,
    },
  },
  data() {
    const validatePass2 = (rule, value, callback) => {
      if (this.method === 'add' && this.isDefaultButton(value)) {
        callback(new Error('请勿使用系统预设编码!'))
      }
      else {
        callback()
      }
    }

    return {
      visible: false,
      oldRow: null,
      method: 'add',
      title: '添加按钮',
      form: {
        name: '',
        code: '',
        isHide: '0',
        next: '0',
        sort: 0,
      },
      tableData: [],
      dataRule: {
        name: [
          {
            required: true,
            message: '名称不能为空',
            trigger: 'blur',
          },
        ],
        code: [
          {
            required: true,
            message: '编码不能为空',
            trigger: 'blur',
          },
          {
            validator: validatePass2,
            trigger: 'blur',
          },
        ],
        sort: [
          {
            required: true,
            message: '排序不能为空',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    add() {
      this.visible = true
      this.method = 'add'
      this.$refs.inputForm.resetFields()
      this.title = '添加按钮'
    },
    isDefaultButton(code) {
      const defaultButtons = [
        '_flow_save',
        '_flow_agree',
        '_flow_reject',
        '_flow_back',
        '_flow_add_multi_instance',
        '_flow_del_multi_instance',
        '_flow_transfer',
        '_flow_delegate',
        '_flow_stop',
        '_flow_print',
      ]
      return (
        defaultButtons.filter((val) => {
          return code === val
        }).length > 0
      )
    },
    edit(row) {
      this.visible = true
      this.method = 'edit'
      this.title = '编辑按钮'
      this.form = JSON.parse(JSON.stringify(row))
    },
    save() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.$emit('inputButton', this.form)

          this.visible = false
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog

    :title="title"
    :visible.sync="visible"
    append-to-body
    class="buttonnsAdd-dialog dialog-selfBpmn"
  >
    <el-form
      ref="inputForm"
      size="mini"
      :rules="dataRule"
      label-width="140px"
      :model="form"
    >
      <el-form-item
        label="名称"
        prop="name"
      >
        <el-input v-model="form.name" />
      </el-form-item>

      <el-form-item
        label="编码"
        prop="code"
      >
        <el-input v-model="form.code" />
      </el-form-item>

      <el-form-item>
        <div class="tip">
          <p>
            注意：按钮编码不能重复，系统按钮以_flow_开头，自定义按钮不能以_flow_开头。
            系统按钮和自定义按钮的区别是，系统按钮是绑定具体的action进行提交，如果你定义了系统按钮，必须在代码中实现对应的action方法。
            自定义按钮无需在代码中添加action方法，触发自定义按钮时调用的是【同意】按钮对应的action，并把该按钮对应的code设置为true、其他自定义按钮对应的code设置为false作为流程变量进行提交。
          </p>
        </div>
      </el-form-item>

      <el-form-item
        label="排序"
        prop="sort"
      >
        <el-input-number
          v-model="form.sort"
          style="width: 100%"
          label="排序"
        />
      </el-form-item>

      <el-form-item
        label="是否隐藏"
        prop="isHide"
        :rules="[{ required: true, message: '必选项不能为空', trigger: 'blur' }]"
      >
        <el-select
          v-model="form.isHide"
          style="width: 100%"
          placeholder="请选择"
        >
          <el-option
            v-for="item in [
              { value: '0', label: '否' },
              { value: '1', label: '是' },
            ]"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="mini"
        @click="visible = false"
      >
        取 消
      </el-button>
      <el-button
        size="mini"
        type="primary"
        @click="save"
      >
        确定
      </el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.buttonnsAdd-dialog {
  .el-dialog {
    .el-dialog__body {
      .el-form {
        .tip {
          padding: 8px 16px;
          background-color: #ecf8ff;
          border-radius: 4px;
          border-left: 5px solid #50bfff;
          margin: 20px 0;
        }
      }
    }
  }
}
</style>
