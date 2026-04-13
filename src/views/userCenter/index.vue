<script>
import { mapState } from 'vuex'
import setting from '@/components/UserCenter/setting'
import { editUser } from '@/http/manage-api'

export default {
  components: {
    Setting: setting,
  },
  data() {
    // 验证用户名不能有中文
    const checkData = (rule, value, callback) => {
      if (value) {
        if (/[\u4E00-\u9FA5]/.test(value)) {
          callback(new Error('不能为中文!'))
        }
        else {
          callback()
        }
      }
      callback()
    }
    return {
      drawer: false, // 抽屉
      form: {},
      rules: {
        username: [
          { required: true, trigger: 'blur', message: '请输入用户名' },
          { validator: checkData, trigger: 'blur' },
        ],
      },
      dictSex: [
        { value: 0, title: '男' },
        { value: 1, title: '女' },
      ],
      submitLoading: false,
      usernameCopy: '', // 记录原始用户名（如果修改了， 则重新登录）
    }
  },
  created() {
    this.getPrefix()
  },
  computed: {
    ...mapState({
      user: state => state.user.user,
    }),
  },
  methods: {
    // 修改 按钮
    editFn() {
      this.drawer = true
      const {
        username,
        nickName,
        email,
        sex,
        address,
        id,
      } = this.user
      this.form = { username, nickName, email, sex, address, id }
    },
    submitFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true
        editUser(this.form)
          .then((res) => {
            const resD = res.data
            const msg = resD.message
            this.submitLoading = false

            if (resD.success === true) {
              this.drawer = false
              this.restartFn() // 清空所有， 重新登录
              this.$message.success('修改成功，请重新登录')
            }
            else {
              this.$message.error(msg || '修改失败')
            }
          })
          .catch((err) => {
            this.submitLoading = false
            this.$message.error('修改失败')
          })
      })
    },
    // 清空所有，重新登录
    restartFn() {
      // 清空storage
      sessionStorage.clear()
      localStorage.clear()

      // 清空全局状态
      this.$store.dispatch('user/logout')

      // 跳转到 登录页面
      this.$router.push(`/login`)
    },
  },
}
</script>

<template>
  <div class="index-userCenter">
    <el-card
      class="top-card"
      shadow="hover"
    >
      <div class="card-title">
        基本信息
      </div>
      <el-row
        class="card-con"
        type="flex"
        align="middle"
      >
        <el-col :span="5">
          <div>
            <span>姓名:</span>
            <span>{{ user.fullName }}</span>
          </div>
          <div>
            <span>部门:</span>
            <span>{{ user.departmentName }}</span>
          </div>
        </el-col>
        <el-col :span="5">
          <div>
            <span>登录名:</span>
            <span>{{ user.username }}</span>
          </div>
          <div>
            <span>岗位:</span>
            <span>{{ user.postName }}</span>
          </div>
        </el-col>
        <el-col
          :span="5"
          style="height: 100%"
        >
          <img
            v-if="user.photo"
            :src="filePrefix + user.photo"
            style="height: 100%"
          >
        </el-col>
        <!-- <el-col :span="8" style="text-align: right;">
                    <el-button type="primary" size="mini" @click="editFn">修改</el-button>
                </el-col> -->
      </el-row>
    </el-card>

    <el-tabs type="border-card">
      <el-tab-pane label="账号设置">
        <setting :userName="user.username" />
      </el-tab-pane>
    </el-tabs>

    <!-- 修改基础信息 抽屉 -->
    <el-drawer
      :visible.sync="drawer"
      :with-header="false"
      class="user-manage-drawer"
    >
      <!-- 标题 -->
      <div class="drawer-title">
        修改基础信息
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 内容 -->
      <div class="drawer-con">
        <el-form
          ref="form"
          :model="form"
          label-width="60px"
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
            label="昵称"
            prop="nickName"
          >
            <el-input v-model="form.nickName" />
          </el-form-item>
          <el-form-item
            label="邮箱"
            prop="email"
          >
            <el-input v-model="form.email" />
          </el-form-item>
          <el-form-item
            label="地址"
            prop="address"
          >
            <el-input v-model="form.address" />
          </el-form-item>
          <el-form-item
            label="性别"
            prop="sex"
          >
            <el-radio-group
              v-model="form.sex"
              size="mini"
            >
              <el-radio
                v-for="(item, i) in dictSex"
                :key="i"
                :label="item.value"
              >
                {{ item.title }}
              </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <div class="drawer-con-btns">
          <el-button
            size="mini"
            type="primary"
            :loading="submitLoading"
            @click="submitFn"
          >
            提交
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<style lang="scss">
.index-userCenter {
  padding: 10px;
  position: relative;
  .top-card {
    margin-bottom: 2vh;
    .el-card__body {
      padding: 0;
      .card-title {
        background: #f5f7fa;
        padding: 10px;
        font-size: 14px;
      }
      .card-con {
        padding: 10px 20px;
        height: 63px;
        box-sizing: content-box;
        .el-col {
          & > div {
            padding: 4px 0;
            & > span:first-child {
              padding-right: 10px;
            }
          }
        }
      }
    }
  }
}
</style>
