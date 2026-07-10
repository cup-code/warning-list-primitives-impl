<script>
import { ThemeList } from "@/assets/theme/theme.js";
import {
  getSpecifiedModule,
  setSpecifiedModule,
} from "@/http/companyConfig/companyConfig-api.js";

export default {
  props: {
    companyId: {
      type: String,
      default: "",
    },
    itemCode: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      ThemeList, // 主题列表
      LayoutSettings: {
        layout: "lt", // 布局
        theme: "theme-default",
        fixedHeader: true,
        sidebarLogo: true,
        tagModel: false,
      },
      rules: {
        layout: [{ required: true, message: "请选择布局", trigger: "change" }],
        theme: [{ required: true, message: "请选择主题", trigger: "blur" }],
      },
      backgroundInput: "#11c8e5",
      buttonInput: "#11c8e5",
    };
  },
  mounted() {
    setTimeout(() => {
      this.getSpecifiedModule();
    }, 100);
  },
  methods: {
    getSpecifiedModule() {
      getSpecifiedModule(this.companyId, this.itemCode).then(({ data }) => {
        if (data.success) {
          if (this.itemCode === "LayoutSettings") {
            data.result.forEach((res) => {
              this.LayoutSettings[res.item] = res.value;
            });
          }
        }
      });
    },
    saveDelineateFence(formName) {
      const dtoList = [];
      for (const key in this.LayoutSettings) {
        dtoList.push({
          item: key,
          value: this.LayoutSettings[key],
        });
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          setSpecifiedModule(this.companyId, this.itemCode, dtoList).then(({ data }) => {
            this.$message({
              message: data.message,
              type: "success",
            });
          });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    //   获取背景色
    getBackgroundColor(e) {
      this.backgroundInput = e;
    },
    // 获取按钮背景色
    getButtonColor(e) {
      this.buttonInput = e;
    },
  },
};
</script>

<template>
  <div>
    <el-form
      ref="LayoutSettings"
      :model="LayoutSettings"
      :rules="rules"
      label-width="120px"
    >
      <el-form-item label="布局：" prop="layout">
        <el-radio-group v-model="LayoutSettings.layout">
          <el-radio label="lt"> 左上 </el-radio>
          <el-radio label="lr"> 左右 </el-radio>
          <el-radio label="tb"> 上下 </el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- <el-form-item label="固定Header" prop="fixedHeader">
        <el-switch v-model="LayoutSettings.fixedHeader" />
      </el-form-item> -->
      <el-form-item label="侧边栏Logo：" prop="sidebarLogo">
        <el-switch v-model="LayoutSettings.sidebarLogo" />
      </el-form-item>
      <el-form-item label="多页签模式：" prop="tagModel">
        <el-switch v-model="LayoutSettings.tagModel" />
      </el-form-item>
      <el-form-item label="主题：" prop="theme">
        <el-radio-group v-model="LayoutSettings.theme">
          <el-radio v-for="item in ThemeList" :key="item.value" :label="item.value">
            {{ item.name }}
          </el-radio>
        </el-radio-group>
      </el-form-item>

      <div class="button">
        <el-button type="primary" @click="saveDelineateFence('LayoutSettings')">
          保存
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.button {
  margin: 20px 0 0 120px;
}
.about-bg-color {
  display: flex;
  align-items: center;
}
.about-bg-color ::v-deep .el-form-item__content {
  margin: 0 !important;
  display: flex;
  align-items: center;
}
</style>
