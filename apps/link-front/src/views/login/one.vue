<script>
import bgImg from "@/assets/login/bg.png";
import logo from "@/assets/logo.png";
import copyright from "@/components/copyright";
import { initDictToLocalstorage } from "@/http/anji-report/dict-data";
import { getGlobalParameters } from "@/http/manage-api";
import { getTenantDictListMap } from "@/http/safe-production/dict-manage-api";
import { login, loginByOa } from "@/http/user-api";
import { asyncRoutes, resetRouter } from "@/router/index";
import { initRouter, setPermissionTreeData, setStorage } from "@/utils";
import { setAuthToken, setSessionAlive, getAuthToken } from "@/utils/tab-session";
import ChangePasswordDialog from "./changePasswordDialog";

export default {
  name: "LoginOne",
  components: {
    Copyright: copyright,
    ChangePasswordDialog,
  },
  data() {
    return {
      defaultPath: "", // 默认打开第一个板块的第一个菜单
      loading: false,
      form: {},
      rules: {
        username: [{ required: true, trigger: "blur", message: "请输入账号" }],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { validator: this.validator.isPwd, trigger: "blur" },
        ],
      },
      passwordType: "password",
      appUrl: "", // app下载地址
      comInfo: {},
      filePrefix: "",
      logo,
      sty: {
        backgroundImage: bgImg,
      },
      urlParams: {
        tenantCode: "001", // 给个初始值，防止闪现登录页面
      },
    };
  },
  async created() {
    this.urlParams = this.getRequestParams();
    const globalDataRes = await getGlobalParameters();
    if (globalDataRes && globalDataRes.data && globalDataRes.data.success) {
      const comInfo = (this.comInfo = globalDataRes.data.result);
      localStorage.setItem("globalData", JSON.stringify(comInfo));
      this.filePrefix = comInfo.minioFilePrefix;
      this.changeWeb(comInfo.webLogo, comInfo.webTitle, comInfo.loginPic);
    }
    if (this.urlParams.tenantCode && this.urlParams.userToken) {
      this.loading = true;
      // 先清空local等内容
      sessionStorage.clear();
      this.$store.dispatch("user/logout"); // 清空全局状态
      loginByOa(this.urlParams)
        .then((res) => {
          this.afterLogin(res);
        })
        .catch((err) => {
          this.$message({
            message: "登录失败",
            type: "error",
          });
        })
        .finally(() => {
          this.loading = false;
        });
    }
  },
  methods: {
    showPwd() {
      this.passwordType = this.passwordType === "password" ? "" : "password";
      this.$nextTick(() => {
        this.$refs.password.focus();
      });
    },

    // 登录按钮
    loginFn() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true;
          const form = this.form;
          // 1、先清空sessionStorage（不影响其他标签页）
          sessionStorage.clear();
          this.$store.dispatch("user/logout"); // 清空全局状态
          // 2、再登录
          login(form.username, form.password)
            .then((res) => {
              this.afterLogin(res);
            })
            .catch((err) => {
              this.$message({
                message: "登录失败",
                type: "error",
              });
            })
            .finally(() => {
              this.loading = false;
            });
        }
      });
    },
    afterLogin(res) {
      const resD = res.data;
      const msg = resD.message;
      const result = resD.result;
      if (resD.success) {
        // 修改网站icon为用户所属公司设置的icon
        this.changeWeb(resD.result.webIcon || "");
        // 设置请求头里的Authorization
        setAuthToken(res.headers.authorization);
        this.$store.dispatch("user/token", res.headers.authorization);
        const saveSet = {};
        for (const setData of result.companyConfigList || []) {
          if (setData.module == "LayoutSettings") {
            saveSet[setData.item] = setData.value;
          }
        }
        if (saveSet) {
          localStorage.setItem("setting", JSON.stringify(saveSet));
          this.$store.dispatch("settings/refreshSetting");
        } else {
          this.$store.dispatch("settings/resetTag");
        }
        sessionStorage.setItem("user", JSON.stringify(result));
        console.log(result, "result");
        console.log("当前登录用户ID:", result.id);

        // 查询指定用户的岗位ID
        const apiBaseUrl =
          process.env.NODE_ENV !== "production"
            ? window.g.BASE_URL_DEV
            : window.g.BASE_URL_PRO;
        fetch(`${apiBaseUrl}sysUser/extend/detailById/a264b2d568ab82f4d74c8f884e346c68`, {
          headers: { Authorization: getAuthToken() },
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("用户 a264b2d568ab82f4d74c8f884e346c68 详情:", data);
            console.log("岗位ID:", data?.result?.postId);
          });

        this.$store.dispatch("user/user", result);
        // 专门用来控制失效的(默认是半小时)
        setStorage("isAlive", true, 365 * 24 * 60 * 60); // 一年
        setSessionAlive(365 * 24 * 60 * 60);
        // 获取到用户菜单权限，转为tree类型
        const permsTree = setPermissionTreeData(result.permissions);
        initRouter(this.$store, { result: permsTree });

        // 请求字典数据，并且全局保存
        getTenantDictListMap().then(({ data }) => {
          sessionStorage.setItem("dictList", JSON.stringify(data.result || "[]"));
        });
        // 报表设计用到的字典
        initDictToLocalstorage();
        // 如果用户设置了开屏页，则把开屏页加入路由
        if (resD.result.afterLoginMenu) {
          asyncRoutes.push({
            path: "/afterLoginMenu",
            component: this.lazyLoading(resD.result.afterLoginMenu),
            hidden: true,
          });
          resetRouter(); // 重新设置路由（根据生成的路由表）
        }
        // 判断密码有效期是否超过180天，过期应修改
        const intervalDays = Math.floor(
          (new Date() * 1 - new Date(result.updatedTime) * 1) / (1000 * 60 * 60 * 24)
        );
        if (intervalDays > 180) {
          const tipMessage = "距离上次修改密码已超过180天，请修改密码";
          this.$nextTick(() => {
            this.$refs.changePasswordDialog.init(this.form.username, tipMessage);
          });
        } else {
          // 如果设置了开屏页面，则直接进入开屏页；否则进入第一个菜单页
          if (resD.result.afterLoginMenu) {
            this.$router.push({ path: "/afterLoginMenu" });
          } else {
            // 默认打开第一个菜单下的第一个子级菜单
            this.defaultPath = permsTree[0].path;
            // 递归找出打开的第一个菜单
            this.openDefaultMenu(permsTree[0]);
          }
        }
      } else {
        this.$message({
          message: msg || "登录失败",
          type: "error",
        });
      }
    },
    // 默认打开第一个板块下的第一个菜单
    openDefaultMenu(item) {
      if (item.children && item.children.length > 0) {
        this.defaultPath += `/${item.children[0].path}`;
        this.openDefaultMenu(item.children[0]);
      } else {
        this.$router.push({ path: this.defaultPath, query: this.otherQuery });
      }
    },
    /* 获取全局变量 */
    // getGlobalData() {
    //   getGlobalParameters().then(({ data }) => {
    //     if (data.success) {
    //       let comInfo = (this.comInfo = data.result)
    //       localStorage.setItem('globalData', JSON.stringify(comInfo))
    //       this.filePrefix = comInfo.minioFilePrefix
    //       this.changeWeb(comInfo.webLogo, comInfo.webTitle, comInfo.loginPic)
    //     }
    //   })
    // },
    // 更新网站标题、网站logo
    changeWeb(logo, title, bg) {
      if (logo) {
        logo = this.filePrefix + logo;
        const $webLogo = document.querySelector('link[rel*="icon"]');
        $webLogo.href = logo;
      }
      if (title) {
        const $webTitle = document.querySelector("title");
        $webTitle.innerHTML = title;
      }
      if (bg) {
        bg = this.filePrefix + bg;
        this.$set(this.sty, "backgroundImage", bg);
      }
    },
    lazyLoading(url) {
      return () => import(`@/${url}.vue`);
    },
    // 获取路径参数, 如果有参数，说明是从OA平台直接登录的，则免登录
    getRequestParams() {
      const url = location.href;
      const requestParams = {};
      if (url.includes("?")) {
        const str = url.substr(url.indexOf("?") + 1); // 截取?后面的内容作为字符串
        const strs = str.split("&"); // 将字符串内容以&分隔为一个数组
        for (let i = 0; i < strs.length; i++) {
          requestParams[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
          // 将数组元素中'='左边的内容作为对象的属性名，'='右边的内容作为对象对应属性的属性值
        }
      }
      return requestParams;
    },
  },
};
</script>

<template>
  <div>
    <div
      v-if="urlParams.tenantCode"
      v-loading="loading"
      class="loginOne-container"
      element-loading-text="正在登录"
      element-loading-spinner="el-icon-loading"
    />
    <div v-else class="loginOne-container">
      <img
        :src="sty.backgroundImage"
        class="fixed top-0 right-0 bottom-0 left-0 w-screen h-screen"
        loading="lazy"
      />
      <div class="rounded-xl box-card">
        <div class="hasInfo">
          <div class="mb-3 font-sans text-4xl font-medium">登录</div>
          <div class="font-sans text-xl">
            {{ comInfo.appSystemName || "两山智联云" }}
          </div>

          <!-- <el-tooltip :content="comInfo.appSystemName || '两山智联云'" placement="top">
          </el-tooltip> -->
        </div>

        <el-form ref="form" :model="form" :rules="rules" class="p-5" size="medium">
          <el-form-item prop="username">
            <div>
              <div class="mb-1 font-sans text-base font-normal text-black">账号</div>
              <el-input
                v-model="form.username"
                clearable
                class="h-11"
                placeholder="请输入账号"
                autocomplete="off"
              />
            </div>
          </el-form-item>
          <!-- 密码： 显示查看密码图标的版本 -->
          <el-form-item prop="password">
            <div>
              <div class="mb-1 font-sans text-base font-normal text-black">密码</div>
              <el-input
                :key="passwordType"
                ref="password"
                v-model="form.password"
                :type="passwordType"
                placeholder="请输入密码"
                name="password"
                class="mb-3"
                auto-complete="on"
                @keyup.enter.native="loginFn"
              >
                <div
                  slot="suffix"
                  class="flex justify-center items-center h-10 leading-10"
                  @click="showPwd"
                >
                  <svg-icon
                    color="#4d72ee"
                    :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'"
                  />
                </div>
              </el-input>
            </div>
          </el-form-item>
          <el-form-item style="margin-bottom: 0">
            <div class="login-btn" :loading="loading" @click="loginFn">
              <el-button class="button-login" size="large" color="#409eff">
                登录
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <!-- 版权信息 -->
      <copyright :desc="(comInfo && comInfo.companyRecordInfo) || ''" />
      <!-- 修改密码弹框 -->
      <ChangePasswordDialog ref="changePasswordDialog" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loginOne-container {
  // background-image: url('../../assets/login/bg.png');
  height: 100vh;
  width: 100vw;
  position: relative;
  .top-con {
    background: rgba(255, 255, 255, 0.1);
    height: 50px;
    padding: 0 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .top-left {
      height: 100%;
      display: flex;
      align-items: center;
      & > img {
        height: 70%;
      }
      & > span {
        color: #fff;
        background-color: #409eff;
        border-radius: 5px;
        padding: 4px 10px;
        margin-left: 6px;
        font-size: 12px;
        font-weight: bold;
        margin-left: 16px;
      }
      .hasInfo {
        display: flex;
        align-items: center;
        color: #fff;
        font-size: 20px;
        font-weight: bolder;
        flex: 1;
        overflow: hidden;
        max-width: 60vw;
        img {
          width: 40px;
          margin-right: 10px;
        }
        span {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          cursor: pointer;
        }
      }
    }
    .top-right {
      span {
        color: #fff;
        font-size: 13px;
        font-weight: bold;
        cursor: pointer;
      }
    }
  }

  .box-card {
    width: 350px;
    padding: 15px 15px 20px;
    position: absolute;
    right: 5%;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 14px;
    box-sizing: border-box;
    z-index: 999;
    background: #fff;
    .hasInfo {
      padding: 30px 20px 20px;
      color: #222;
      font-size: 20px;
      font-weight: bolder;
      img {
        width: 40px;
        margin-right: 10px;
      }
      span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        cursor: pointer;
      }
    }

    // 定义input输入框样式的 begin (如果只需要使用默认的，把这里注释掉就行)
    .el-form {
      .el-form-item {
        margin-bottom: 20px !important;
      }
      .el-form-item.is-error input {
        border-color: #f56c73;
      }
      input {
        border-color: #4d72ee;
        background: transparent;
        // border: none;
        // background-color: rgba($color: #a8a8a8, $alpha: 0.2);
        height: 40px;
        line-height: 40px;
        -webkit-appearance: none;
        color: #222222;
        &:-webkit-autofill {
          // box-shadow: 0 0 0px 1000px rgba(64, 158, 255, 0.1) inset !important;
          -webkit-text-fill-color: #333 !important;
        }
      }
    }

    // 定义input输入框样式的 end
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 16px;
    color: #409eff;
    cursor: pointer;
    user-select: none;
  }
  .login-btn {
    width: 100%;
    text-align: center;
    margin-top: 10px;
    display: inline-block;

    .button-login {
      cursor: pointer;
      user-select: none;
      color: white;
      border-radius: 4px;
      font-size: 14px;
      width: 100%;
      background: #4d72ee;
      border: none;
      padding: none;

      &:hover {
        background: #5477eb;
        color: #ffffff;
      }
    }
  }

  &:-moz-loading {
    opacity: 0.5;
  }
}
</style>
