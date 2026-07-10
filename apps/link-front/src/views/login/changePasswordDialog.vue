/* * @Author: xiaorui 登录时密码过于简单，强制修改密码的弹框 * @Date: 2023-05-25 15:28:51 * @Last
Modified by: xiaorui * @Last Modified time: 2023-09-28 15:59:49 */
<script>
import { editUserPw } from '@/http/manage-api'

export default {
  data() {
    const comfirmPasswordVaild = (rule, value, callback) => {
      if (value !== this.form.newPass) {
        callback(new Error('两次输入密码不一致!'))
      }
      else {
        callback()
      }
    }
    return {
      visible: false,
      title: '请修改密码',
      rules: {
        oldPass: [
          {
            type: 'string',
            required: true,
            message: '请输入旧密码',
            trigger: 'blur',
          },
        ],
        newPass: [
          {
            type: 'string',
            required: true,
            message: '请输入新密码',
            trigger: 'blur',
          },
          { validator: this.validator.isNewPwd, trigger: 'blur' },
        ],
        confirmPassword: [
          {
            type: 'string',
            required: true,
            message: '再次输入新密码',
            trigger: 'blur',
          },
          { validator: comfirmPasswordVaild, trigger: 'blur' },
        ],
      },
      form: {
        username: '',
        oldPass: '',
        newPass: '',
        confirmPassword: '',
      },
    }
  },
  methods: {
    init(username, title) {
      this.visible = true
      this.title = title
      this.$nextTick(() => {
        this.$refs.form.resetFields()
        this.form.username = username
      })
    },
    doSubmit() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true
        // 修改密码
        editUserPw(this.form)
          .then(({ data }) => {
            if (data.success) {
              this.visible = false
              this.$message.success('修改密码成功，请重新登录')
            }
            else {
              this.$message.warning(data.message || '修改密码失败')
            }
          })
          .catch((err) => {
            this.$message.error('修改密码失败')
          })
          .finally(() => {
            this.submitLoading = false
          })
      })
    },
  },
}
</script>

<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    :show-close="false"
    :append-to-body="true"

    :visible.sync="visible"
    class="normal-dialog"
    width="500px"
  >
    <el-form
      ref="form"
      :model="form"
      label-width="80px"
      :rules="rules"
      size="mini"
    >
      <el-form-item
        label="用户名"
        prop="username"
      >
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item
        label="旧密码"
        prop="oldPass"
      >
        <el-input
          v-model="form.oldPass"
          type="password"
          show-password
        />
      </el-form-item>
      <el-form-item
        label="新密码"
        prop="newPass"
      >
        <el-input
          v-model="form.newPass"
          type="password"
          show-password
        />
      </el-form-item>
      <el-form-item
        label="确认密码"
        prop="confirmPassword"
      >
        <el-input
          v-model="form.confirmPassword"
          type="password"
          show-password
        />
      </el-form-item>
      <el-button type="text">
        密码要求：
      </el-button>
      <br>
      <el-button type="text">
        1、必须包含大小写字母
      </el-button>
      <br>
      <el-button type="text">
        2、必须包含数字
      </el-button>
      <br>
      <el-button type="text">
        3、必须包含特殊字符：!、@、$、%、^、&、*
      </el-button>
      <br>
      <el-button type="text">
        4、密码长度不少于8个字符
      </el-button>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-noMoreClick
        size="small"
        type="primary"
        @click="doSubmit()"
      >确定</el-button>
    </span>
  </el-dialog>
</template>
