<script>
import { addHKBox } from '@/http/hkAi-api'

export default {
  name: 'AddBoxDialog',
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
        name: [{ required: true, message: '盒子名称不能为空', trigger: 'blur' }],
        ip: [{ required: true, message: '盒子ip不能为空', trigger: 'blur' }],
        port: [{ required: true, message: '端口不能为空', trigger: 'blur' }],
        user: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
        pwd: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
      },
    }
  },
  computed: {
    getDisabled() {
      const {
        name,
        ip,
        user,
        port,
        pwd,
      } = this.forms
      return !name || !ip || !user || !port || !pwd || this.disabled
    },
  },
  methods: {
    onCancel() {
      this.$emit('update:dialogVisible', false)
      this.$emit('update:disabled', false)
      this.$emit('update:forms', {
        name: '',
        ip: '',
        port: '',
        pwd: '',
        user: '',
      })
    },
    onConfirm() {
      console.log(this.forms)
      addHKBox(this.forms)
        .then((res) => {
          if (res.data?.success) {
            this.$message.success('添加成功')
            this.form = { name: '', port: '', ip: '', pwd: '', user: '' }
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
          label="盒子名称"
          prop="name"
        >
          <el-input
            v-model="forms.name"
            clearable
          />
        </el-form-item>
        <el-form-item
          style="margin-right: 6px"
          label="盒子ip"
          prop="ip"
        >
          <el-input
            v-model="forms.ip"
            clearable
          />
        </el-form-item>
        <el-form-item
          style="margin-right: 6px"
          label="端口"
          prop="port"
        >
          <el-input
            v-model="forms.port"
            clearable
          />
        </el-form-item>
        <el-form-item
          style="margin-right: 6px"
          label="用户名"
          prop="user"
        >
          <el-input
            v-model="forms.user"
            clearable
          />
        </el-form-item>
        <el-form-item
          style="margin-right: 6px"
          label="密码"
          prop="pwd"
        >
          <el-input
            v-model="forms.pwd"
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
</style>
