<script>
import ImageSelect from "@/components/ImageSelect";
import {
  getSpecifiedModule,
  setSpecifiedModule,
} from "@/http/companyConfig/companyConfig-api.js";
import { upLoadImg } from "@/http/manage-api";

export default {
  name: "VideoManagement",
  components: {
    ImageSelect,
  },
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
      colorList: [
        {
          name: "一级",
          value: "#FB0000",
        },
        {
          name: "二级",
          value: "#FFF305",
        },
        {
          name: "三级",
          value: "#0BD700",
        },
        {
          name: "四级",
          value: "#08A1EE",
        },
      ],
      videoManagement: {
        isAutoRefresh: false,
        autoRefreshTime: 1,
        warningLogo: "",
        warningTitle: "",
        CarouselDataType: 0,
        trendPeriod: 1,
        typePeriod: 1,
        handlePeriod: 1,
        levelPeriod: 1,
        orgPeriod: 1,
        devicePeriod: 1,
        alarmLevelColor: {},
        videoPublicIpPort: "",
        isNotification: false,
        headerLogo: "",
        headerText: "",
        advertText:
          "易见 Ai 一体机不仅是「监控工具」，更是您的「安全管理助手」，cameraNumber路摄像头覆盖全场景、cameraSkillNumber项技能精准识别风险、实时推送缩短响应时间。助力您持续优化安全管理。",
      },
      filePrefix: "",
    };
  },
  created() {
    this.getPrefix();
  },
  mounted() {
    this.getModule();
  },
  methods: {
    colorChangeEvt(index, value) {
      this.colorList[index].value = value;
      this.videoManagement.alarmLevelColor[index + 1] = value;
      console.log(this.videoManagement.alarmLevelColor);
    },
    getModule() {
      getSpecifiedModule(this.companyId, this.itemCode).then(({ data }) => {
        if (data.success) {
          if (this.itemCode === "VideoManagement") {
            data.result.forEach((res) => {
              this.videoManagement[res.item] = res.value;

              if (res.item === "alarmLevelColor") {
                this.colorList = this.colorList.map((item, index) => {
                  item.value = res.value[index + 1];
                  return item;
                });
              }
            });
          }
        }
      });
    },
    /* 图片选择回调 */
    fileChangeEvt(file) {
      if (file) {
        upLoadImg(file, "USER_ICON_PATH", false).then(({ data }) => {
          if (data.success) {
            this.videoManagement.warningLogo = data.result;
          } else {
            this.$message.warning(data.message || "上传失败");
          }
        });
      } else {
        this.videoManagement.warningLogo = "";
      }
    },
    sumbit(formName) {
      const dtoList = [];
      for (const key in this.videoManagement) {
        dtoList.push({
          item: key,
          value: this.videoManagement[key],
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
  },
};
</script>

<template>
  <div class="video-management">
    <el-form ref="videoManagement" :model="videoManagement" label-width="200px">
      <el-row>
        <el-col :span="20">
          <el-form-item label="是否自动刷新驾驶舱:" prop="isAutoRefresh">
            <div class="flex-row items-center">
              <el-switch v-model="videoManagement.isAutoRefresh" />
              <span class="mx-2 text-xs text-gray-500"> 开启后，智能驾驶舱每</span>
              <el-input-number
                v-model="videoManagement.autoRefreshTime"
                :min="1"
                :step="1"
              />
              <span class="ml-2 text-xs text-gray-500">分钟刷新一次</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="20">
          <el-form-item label="设置视频驾驶舱logo:" prop="warningLogo">
            <ImageSelect
              :signUrl="
                videoManagement.warningLogo
                  ? filePrefix + videoManagement.warningLogo
                  : ''
              "
              width="160px"
              height="160px"
              @fileChange="fileChangeEvt"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="设置视频驾驶舱标题:" prop="warningTitle">
            <el-input
              v-model="videoManagement.warningTitle"
              style="width: 200px"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="20">
          <el-form-item label="设置驾驶舱轮播数据:" prop="CarouselDataType">
            <el-radio-group v-model="videoManagement.CarouselDataType">
              <el-radio :label="0"> 最近10条关注信息 </el-radio>
              <el-radio :label="1"> 最近10条预警信息 </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="设置默认预警趋势时间周期:" prop="defaultPeriod">
            <el-radio-group v-model="videoManagement.trendPeriod">
              <el-radio :label="0"> 日 </el-radio>
              <el-radio :label="1"> 周 </el-radio>
              <el-radio :label="2"> 月 </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="设置默认预警类型排名时间周期:" prop="defaultPeriod">
            <el-radio-group v-model="videoManagement.typePeriod">
              <el-radio :label="0"> 日 </el-radio>
              <el-radio :label="1"> 周 </el-radio>
              <el-radio :label="2"> 月 </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="设置默认预警处理情况时间周期:" prop="defaultPeriod">
            <el-radio-group v-model="videoManagement.handlePeriod">
              <el-radio :label="0"> 日 </el-radio>
              <el-radio :label="1"> 周 </el-radio>
              <el-radio :label="2"> 月 </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="设置默认预警等级占比时间周期:" prop="defaultPeriod">
            <el-radio-group v-model="videoManagement.levelPeriod">
              <el-radio :label="0"> 日 </el-radio>
              <el-radio :label="1"> 周 </el-radio>
              <el-radio :label="2"> 月 </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="设置默认组织预警排名时间周期:" prop="defaultPeriod">
            <el-radio-group v-model="videoManagement.orgPeriod">
              <el-radio :label="0"> 日 </el-radio>
              <el-radio :label="1"> 周 </el-radio>
              <el-radio :label="2"> 月 </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="10">
          <el-form-item label="设置默认设备预警排名时间周期:" prop="defaultPeriod">
            <el-radio-group v-model="videoManagement.devicePeriod">
              <el-radio :label="0"> 日 </el-radio>
              <el-radio :label="1"> 周 </el-radio>
              <el-radio :label="2"> 月 </el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="20">
          <el-form-item label="声光报警器预警等级颜色:" prop="alarmLevelColor">
            <div class="flex">
              <div
                v-for="(item, index) in colorList"
                :key="index"
                class="flex items-center mx-2 space-x-4"
              >
                <span class="ml-1">{{ item.name }}:</span>
                <el-color-picker
                  :key="index"
                  v-model="item.value"
                  @change="colorChangeEvt(index, $event)"
                />
              </div>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="20">
          <el-form-item label="预警视频映射公网IP端口:" prop="videoPublicIpPort">
            <el-input
              v-model="videoManagement.videoPublicIpPort"
              style="width: 300px"
              clearable
              placeholder="请输入预警视频映射公网IP端口"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="20">
          <el-form-item label="是否开启预警处理“实时预警通知”" prop="isNotification">
            <el-switch v-model="videoManagement.isNotification" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="20">
          <el-form-item label="页眉logo文字:" prop="headerLogo">
            <el-input
              v-model="videoManagement.headerLogo"
              style="width: 300px"
              clearable
              placeholder="请输入页眉logo文字"
            />
          </el-form-item>
          <el-form-item label="页眉右侧文字:" prop="headerText">
            <el-input
              v-model="videoManagement.headerText"
              style="width: 300px"
              clearable
              placeholder="请输入页眉右侧文字"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="20">
          <el-form-item label="设置广告词:" prop="advertText">
            <el-input
              v-model="videoManagement.advertText"
              type="textarea"
              :rows="4"
              style="width: 500px"
              clearable
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <el-row justify="end">
      <el-col class="flex pl-52 mt-5">
        <el-button type="primary" @click="sumbit('videoManagement')"> 保存 </el-button>
      </el-col>
    </el-row>
  </div>
</template>

<style scoped lang="scss">
.video-management {
  overflow-y: auto;
  max-height: calc(80vh - 60px);
}
</style>
