<script>
import ImageSelect from '@/components/ImageSelect'
import { saveSystemInfoFn, upLoadImgNoOriName } from '@/http/manage-api'

export default {
  components: {
    ImageSelect,
  },
  data: () => ({
    form: {
      appSystemName: '', // 	默认系统名称
      companyLogo: '', // 	系统logo
      // companyName: "", // 默认公司名称
      companyRecordInfo: '', // 网站备案信息
      loginPic: '', // 登录页背景图
      shrinkLogo: '', // 	系统收缩logo
      webLogo: '', // 网站icon
      webTitle: '', // 网站title
    },
    rules: {},
    submitLoading: false,
    user: JSON.parse(sessionStorage.getItem('user')),
  }),
  created() {
    this.getPrefix()
  },
  mounted() {
    this.$nextTick(() => {
      this.form = this.recover(this.form, JSON.parse(localStorage.getItem('globalData')))
    })
  },
  methods: {
    /* 图片选择回调 */
    fileChangeEvt(file, type, key) {
      // console.log(type)
      if (file) {
        upLoadImgNoOriName(file, type).then(({ data }) => {
          if (data.success) {
            this.form[key] = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.form[key] = ''
      }
    },
    submitFn() {
      this.$refs.form.validate((valid) => {
        if (!valid)
          return
        this.submitLoading = true
        saveSystemInfoFn(this.form)
          .then(({ data }) => {
            const msg = data.message
            this.submitLoading = false
            if (data.success) {
              this.$message.success('修改成功')
              // 修改网站的标题和logo
              this.changeWeb(this.form.webLogo, this.form.webTitle)
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
    // 更新网站标题、网站logo
    changeWeb(logo, title) {
      if (logo) {
        logo = this.filePrefix + logo
        const $webLogo = document.querySelector('link[rel*="icon"]')
        $webLogo.href = logo
      }
      if (title) {
        const $webTitle = document.querySelector('title')
        $webTitle.innerHTML = title
      }
    },
  },
}
</script>

<template>
  <div class="page-container-fixed">
    <ECard>
      <ETitle title="系统信息" classNameCell="mb-4" />
      <el-form
        ref="form"
        class="webApp-form"
        :model="form"
        label-width="95px"
        :rules="rules"
        :disabled="user.tenantCode !== 'super'"
      >
        <el-form-item label="网站标题" prop="webTitle">
          <el-input v-model="form.webTitle" />
        </el-form-item>
        <div class="flex items-center w-1/2">
          <el-form-item label="网站图标" prop="webLogo">
            <ImageSelect
              :signUrl="form.webLogo ? filePrefix + form.webLogo : ''"
              width="100px"
              height="100px"
              @fileChange="fileChangeEvt($event, 'COMPANY_WEB_LOGO_PATH', 'webLogo')"
            />
          </el-form-item>
          <el-form-item label="登录页背景" prop="loginPic">
            <ImageSelect
              :signUrl="form.loginPic ? filePrefix + form.loginPic : ''"
              width="100px"
              height="100px"
              @fileChange="fileChangeEvt($event, 'COMPANY_LOGIN_PIC_PATH', 'loginPic')"
            />
          </el-form-item>
        </div>
        <el-form-item label="网站备案信息" prop="companyRecordInfo">
          <el-input v-model="form.companyRecordInfo" />
        </el-form-item>
        <!-- <el-form-item label="企业名称" prop="companyName">
                <el-input v-model="form.companyName"></el-input>
            </el-form-item> -->
        <el-form-item label="系统名称" prop="appSystemName">
          <el-input v-model="form.appSystemName" />
        </el-form-item>
        <div class="flex items-center w-1/2">
          <el-form-item label="系统图标" prop="companyLogo">
            <ImageSelect
              :signUrl="form.companyLogo ? filePrefix + form.companyLogo : ''"
              width="100px"
              height="100px"
              @fileChange="fileChangeEvt($event, 'COMPANY_LOGO_PATH', 'companyLogo')"
            />
          </el-form-item>

          <el-form-item label="系统收缩图标" prop="shrinkLogo">
            <ImageSelect
              :signUrl="form.shrinkLogo ? filePrefix + form.shrinkLogo : ''"
              width="100px"
              height="100px"
              @fileChange="fileChangeEvt($event, 'COMPANY_LOGO_PATH', 'shrinkLogo')"
            />
          </el-form-item>
        </div>
        <el-form-item v-if="user.tenantCode === 'super'">
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="submitFn"
          >
            确定
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>
  </div>
</template>

<style lang="scss" scoped>
.webApp-manage {
  position: relative;
  padding: 10px;
  .webApp-form {
    width: 50%;
    // 选择图片按钮的样式 begin
    .sel-pic-btn {
      color: #fff;
      background-color: #409eff;
      border-color: #409eff;
    }
    .el-input-group__append {
      border: none;
      background: #409eff;
    }
    // 选择图片按钮的样式 end
  }
}

::v-deep .el-form-item--mini.el-form-item {
  margin-bottom: 20px !important;
  width: 50% !important;
}
</style>
