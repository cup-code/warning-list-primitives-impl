<script>
import moment from "moment";
import btn_bg from "@/assets/anhuan3d/btn_bg.png";
// 业务组件
import { getSpecifiedModule } from "@/http/companyConfig/companyConfig-api.js";
// 公共数据接口
import {
  dangerOriginPageQuery, // 重大危险源列表
  getAllImportantSourceByPage, // 重要危险源列表
  getRecentLocations,
  locationGetAlarmStat, // 所在区域人,车,摄像头
  occupationalHazardArea,
} from "@/http/map/gis-map.js";

// 地图组件
import BaseMap from "./BaseMap"; // 地图
import DangerOrigin from "./DangerOrigin"; // 重大危险源
import FireProtection from "./FireProtection"; // 消防管理
import FlyManager from "./flyManager"; // 地图3D漫游管理
import ImportantDangerOrigin from "./ImportantDangerOrigin"; // 重要危险源
import { zq_config } from "./js/index.js";
import OccupationDisease from "./OccupationDisease"; // 职业病因素分布图
import PersonCar from "./PersonCar"; // 人员定位
import RiskArea from "./RiskArea"; // 风险区域
import SafeOperation from "./SafeOperation"; // 安全生成

export default {
  components: {
    BaseMap,
    PersonCar,
    DangerOrigin,
    ImportantDangerOrigin,
    FireProtection,
    SafeOperation,
    RiskArea,
    OccupationDisease,
    FlyManager,
  },
  data() {
    return {
      btn_bg,
      timer: null, // 时钟定时器
      dateTime: "", // 时间
      dateDes: "", // 日期
      navs: zq_config.menuList,
      // style 默认启用 ，人员定位： 在启用历史轨迹/跟踪时需要禁用其它菜单 pointer / no-drop /not-allowed
      menu_style: { backgroundImage: "" },
      // componentNames:['RiskArea','ImportantDangerOrigin','PersonCar','FireProtection','SafeOperation','OccupationDisease','DangerOrigin'],
      componentNames: zq_config.componentNames,
      // 当前激活组件
      curNav: zq_config.currMenu,
      // false 禁用菜单切换 、 true 启用菜单切换
      isEnable: true,

      // 路由列表 进入管理中心
      routerList: [],
      navList: [], // 顶部分配菜单项
      mainComponent: [], // 顶部分配菜单对应的数据组件

      // 公共数据 与地图相关
      // 建筑id 206092 -->
      buildId: "",
      publicMapProps: {
        // 公司id
        companyId: "",
        companyName: "", // 公司名称
        componentName: "",
        // 重大危险源
        hardDangerOriginData: [],
        // 重要危险源
        dangerSourceData: [],
        // 人员定位：人 busType:1, 车busType:2, 摄像头 busType:3
        areaPersonCarCameraData: [],
        // 职业病区域
        occupationDiseaseData: [],
        isCarNumber: {},
        positionInfoDisplay: {},
        isShowOnePicture: {},
      },
      isDestroy: false,
      // 职业危害类型数据字典 JSON.parse(sessionStorage.getItem('dictList')).occupational_hazards,
      occupationType: [],
      layerList: zq_config.layerList, // 图层数据

      //  人员定位  公共变量
      curPerson: { name: "test" },
      isPers: false, // 击的是否是人员图标

      // 人车报警统计 轮询更新
      secondCount: 5, //   秒统计  默认5 秒
      personCarAlarmList: [], //  报警统计数据
      // 一键报警
      alarmTotal: 0,
      // audio
      audioUrl: require("../../../assets/anhuan3d/alarm.ogg"), // mp3
      audio: null,
      //  是否暂停
      isMuted: true,
      iconMenuItems: [{ icon: "home" }],
    };
  },

  computed: {
    timeDes() {
      return moment(this.dateTime).format("HH:mm:ss");
    },
    isExpand() {
      return this.$store.state.newMaterial.isExpand;
    },
  },

  created() {
    // 获取用户信息
    this.getUserInfo();
    this.genClock();
  },
  beforeMount() {},

  mounted() {
    this.isDestroy = false;
    // 读取缓存获取路由
    this.routerList = JSON.parse(sessionStorage.getItem("routerList") || "[]");
    if (this.routerList.length >= 6) {
      this.routerList = this.routerList.slice(0, 6);
    }

    // 2d 到 3d
    // 定位到地图3d标记  赋值一方法 vuex state.locateTo3dIcon
    // this.$store.commit('newMaterial/LOCATE_TO_3D_ICON', this.$refs.baseMap.locateTo3dIcon);

    // 显示子级左侧菜单
    this.$store.dispatch("newMaterial/leftHide", false);
    // 显示子级右侧菜单
    this.$store.dispatch("newMaterial/rightHide", false);

    /* let music = new Audio();
          music = require("../../../assets/anhuan3d/alarm.wav");
          this.$refs.audio.src = music

          if (this.$refs.audio) {
              // 模拟用户点击事件
              this.$refs.audio.addEventListener('canplay', () => {
                  this.$refs.audio.play();
              });
              const playPromise = this.$refs.audio.play();
              if (playPromise !== undefined) {
                  playPromise.catch(error => {
                      console.error(`Failed to play audio: ${error}`);
                  });
              }
          } */

    // this.playAutoTemp();
    if (this.$refs.audio) {
      // 模拟用户点击事件
      // this.$refs.audio.addEventListener('canplay', () => {
      console.log("500后 模拟用户点击：");
      this.$refs.audio.pause();
      // 取消静音
      // this.$refs.audio.muted = true
      // this.isMuted = true
      if (this.$refs.audio.paused) {
        // this.$refs.audio.play();
      }
      // })
    }
  },

  beforeDestroy() {
    this.isDestroy = true;
    clearInterval(this.timer);
    this.timer = null;
  },

  methods: {
    onStartInspection() {
      this.$refs.baseMap.isShowViewerOption = false;
      this.$refs.baseMap.layerboxVisable = false;
    },
    onSetCurrView() {
      this.$refs.baseMap.setCurrView(this.$refs.baseMap.view3d);
      this.$refs.baseMap.isShowViewerOption = true;
      this.$refs.baseMap.layerboxVisable = true;
    },
    // 获取顶部导航栏信息
    getTopLabel() {
      getSpecifiedModule(this.publicMapProps.companyId, "safetyEnvironmentalChart").then(
        ({ data }) => {
          if (data.success) {
            const { result } = data;

            result
              .filter((s) => s.item === "topNavigationBar")[0]
              .value.map((a) => {
                const obj = this.navs.filter((b) => b.id === a);

                if (Object.keys(obj).length) {
                  this.navList.push(obj[0]);
                  this.mainComponent.push(obj[0].componentName);
                }
              });

            this.publicMapProps.isCarNumber = result.filter(
              (s) => s.item === "isCarNumber"
            )[0];
            this.publicMapProps.positionInfoDisplay = result.filter(
              (s) => s.item === "positionInfoDisplay"
            )[0];
          }
        }
      );
    },
    // 轮询报警数据
    loopAlarmData() {
      locationGetAlarmStat(this.buildId)
        .then(({ data }) => {
          if (data.success) {
            this.personCarAlarmList = [];
            let alarmTotal = 0;
            data.result.forEach((item) => {
              //  {alarmTypeName: '一键报警', alarmTypeCode: 'oneKeyAlarm:alarm', alarmCount: 0}
              this.personCarAlarmList.push({
                name: item.alarmTypeName,
                value: item.alarmCount,
              });
              alarmTotal += item.alarmCount;
            });
            //  更新一键报警声音 alarmTotal
            // 测试报警  Math.floor(Math.random()*10); 0-9
            // alarmTotal = Math.floor(Math.random()*4)
            this.upAlarmTotal(alarmTotal);
            // 更新到人员点位 模块
            if (this.navList[this.curNav].componentName === "PersonCar") {
              this.mapClickTo2d({
                id: "personCarAlarmList",
                tyeo: "PersonCar", // 人员定位组件
                name: "人员定位报警数据",
                data: {
                  alarmTotal,
                  personCarAlarmList: this.personCarAlarmList,
                },
              });
            }
          } else {
            this.$message.warning(data.message || "获取定位报警数据失败");
          }
        })
        .catch((error) => {
          this.$message.error("获取定位报警数据出错", error);
        });
    },

    // 弃用
    baginAudio() {
      this.audio = new Audio();
      // 静音
      this.audio.muted = true;
      // 自动播放
      // this.audio.autoplay = true;
      // this.audioSetTimeout = setTimeout(()=>{
      this.audio.src = require("../../../assets/anhuan3d/alarm.mp3");
      this.audio.load();
      // 模拟用户点击事件
      this.audio.addEventListener("canplay", () => {
        console.log("模拟用户点击：");
        this.audio.muted = false;
        this.audio.play();
      });
      // this.audio.play();
      // },500);
    },

    // 更新报警
    upPlayAudio() {
      if (this.alarmTotal > 0 && !this.isMuted) {
        if (this.$refs.audio.paused) {
          this.$refs.audio.play();
        }
      } else {
        this.$refs.audio.pause();
      }
    },

    // 是否静音
    audioPause() {
      if (this.isMuted) {
        //  开启
        this.$refs.audio.muted = false;
        this.isMuted = false;
      } else {
        //  静音
        this.$refs.audio.muted = true;
        this.isMuted = true;
      }
      this.upPlayAudio();
    },

    // 更新报警数量
    upAlarmTotal(alarmTotal) {
      this.alarmTotal = alarmTotal;
      // 测试报警
      // this.alarmTotal = 1;
      // 更新报警
      this.upPlayAudio();
    },

    /* 处理时间和计时器 */
    genClock() {
      // 计时器初始时间
      const nowDate = new Date().getTime();
      this.dateTime = nowDate;
      this.timer = setInterval(() => {
        this.dateTime += 1000;

        // 2-5秒 轮询报警一次
        if (this.secondCount >= 5) {
          this.secondCount = 0;
          // this.loopAlarmData()
        }
        this.secondCount++;
      }, 1000);
      // 年月日
      this.dateDes = moment(nowDate).format("YYYY.MM.DD");

      // 是否禁用菜单切换
      this.enableAndDisable_style(this.isEnable);
    },

    // 起用和禁用菜单按钮
    enableAndDisable_style(isEnable) {
      if (isEnable) {
        this.menu_style = {
          backgroundImage: "",
          cursor: "ponit",
          color: "#fff",
        };
      } else {
        this.menu_style = {
          backgroundImage: "",
          cursor: "no-drop",
          color: "#a5a5a5",
        };
      }
    },

    // 进入到管理中心
    toCenterClick() {
      // 主页默认路径
      this.defaultPath = this.routerList[0].path;
      this.openDefaultMenu(this.routerList[0]);
    },
    openDefaultMenu(item) {
      if (item.children && item.children.length > 0) {
        this.defaultPath += `/${item.children[0].path}`;
        if (item.children[0].query) {
          this.defaultPath += `?${item.children[0].query}`;
        }
        this.openDefaultMenu(item.children[0]);
      } else {
        if (item.pageSourceType == 1) {
          // 如果是前端组件类型
          this.$router.push(this.defaultPath);
        } else if (item.pageSourceType == 3) {
          // 如果是外链地址
          const element = document.createElement("a");
          element.setAttribute("href", item.externalUrl);
          element.setAttribute("target", "_blank");
          element.style.display = "none";
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }
      }
    },

    // 公共数据 与地图相关

    // #region

    // 点击导航 定位到地图
    tapNav(item, index) {
      if (this.curNav === index) {
        this.$store.dispatch(
          "newMaterial/setIsExpand",
          !this.$store.state.newMaterial.isExpand
        );
      }

      if (this.isEnable) {
        this.curNav = index;
        this.$refs.baseMap.navigation3dMethod(item);
        this.upPlayAudio();
        // if(this.navs[this.curNav].componentName=== "PersonCar"){}
      }
    },

    // 来自地图点击
    mapClickTo2d(obj) {
      this.$refs.childComponent.from3dMapClick(obj);
    },
    locationToMap(obj) {
      this.$refs.baseMap.locateTo3dIcon(obj);
    },

    // 人员定位( 跟踪 、历史轨迹 )
    toMap(obj) {
      if (this.isDestroy) {
        return;
      }
      // 关闭历史轨迹
      if (obj.name === "closeHistoryTrack") {
        this.$refs.baseMap.closeHistoryTrack();
      }
      // 打开历史轨迹
      // else if(obj.name === 'openHistoryTrack'){
      //     window.showPath(points);
      // }

      // 开始人员跟踪
      else if (obj.name === "startPersonTrack") {
        this.$refs.baseMap.startPersonTrack(obj.params.cardCode);
      }
      // 取消人员跟踪
      else if (obj.name === "cancelPersonTrack") {
        this.$refs.baseMap.cancelPersonTrack(obj.params);
      }
    },

    // 获取用户信息
    getUserInfo() {
      // 建筑id
      this.buildId = this.$store.state.user.user.buildId;
      console.log(this.buildId);

      // 公司id
      const userData = JSON.parse(sessionStorage.getItem("user"));
      this.publicMapProps.companyId = userData.companyId;
      this.publicMapProps.companyName = userData.companyName;
      // console.log('companyName:',userData.companyName);
      this.getTopLabel();
      // 获取职业危害类型
      this.occupationType = JSON.parse(
        sessionStorage.getItem("dictList")
      ).occupational_hazards;

      const searchData = {
        isPage: false, // false 不分页
        pageNum: 1,
        pageSize: 200,
        queryKey: "",
        unitName: "", // 危险源名称
        companyId: userData.companyId,
      };

      // 获取重要危险源
      this.getAllImportantSourceByPageData(searchData);
      // 获取重大危险源
      if (this.layerList.find((item) => item.id === "hard-danger-origin")) {
        this.hardDangerOriginPageQuery(searchData);
      }

      // 获取职业危害区域
      this.occupationalHazardAreaData();
    },

    // 重大危险源数据列表
    hardDangerOriginPageQuery(searchData) {
      dangerOriginPageQuery(searchData)
        .then(({ data }) => {
          if (data.success) {
            const dataList = data.result.list || [];
            if (dataList.length > 0) {
              this.publicMapProps.hardDangerOriginData = dataList.filter((item) => {
                return (
                  item.hasOwnProperty("location") &&
                  item.location.hasOwnProperty("x") &&
                  item.location.hasOwnProperty("y")
                );
              });
            }
          } else {
            this.$message.warning(data.message || "获取数据失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取数据出错", err);
        })
        .finally(() => {});
    },

    // 重要危险源 / 获取所有重要危险源列表
    getAllImportantSourceByPageData(searchData) {
      getAllImportantSourceByPage(searchData)
        .then(({ data }) => {
          if (data.success) {
            const dataList = data.result.list || [];
            if (dataList.length > 0) {
              this.publicMapProps.dangerSourceData = dataList.filter((item) => {
                return (
                  item.hasOwnProperty("location") &&
                  item.location.hasOwnProperty("x") &&
                  item.location.hasOwnProperty("y")
                );
              });
            }
          } else {
            this.$message.warning(data.message || "获取列表数据失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取列表数据出错", err);
        })
        .finally(() => {});
    },

    // 人员定位 / 所在区域人，车 ，摄像头
    getAreaPersonCarCameraData(searchData) {
      getRecentLocations(searchData)
        .then(({ data }) => {
          if (data.success) {
            this.publicMapProps.areaPersonCarCameraData = (data.result || []).filter(
              (item) => !item.self
            );
            // console.log(' 人车摄像头:',this.publicMapProps.areaPersonCarCameraData);
            this.publicMapProps.areaPersonCarCameraData.forEach((item) => {
              if (item.busType === "3") {
                console.log("视频:", item);
              }
            });
          } else {
            this.$message.warning(data.message || "获取列表数据失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取列表数据出错", err);
        })
        .finally(() => {});
    },

    // 职业危害区域
    occupationalHazardAreaData() {
      occupationalHazardArea()
        .then(({ data }) => {
          if (data.success) {
            const dataList = data.result || [];
            if (dataList.length > 0) {
              this.publicMapProps.occupationDiseaseData = dataList.filter((item) => {
                // 对象不能为空
                return (
                  item.hasOwnProperty("location") &&
                  item.location.hasOwnProperty("position") &&
                  Object.keys(item.location.position).length > 0
                );
              });
              // 添加职业危害类型
              for (let i = 0; i < this.publicMapProps.occupationDiseaseData.length; i++) {
                let number = 0;
                this.publicMapProps.occupationDiseaseData[i].harmFactor.forEach(
                  (item) => {
                    if (number === 0) {
                      this.publicMapProps.occupationDiseaseData[
                        i
                      ].typeName = this.occupationType.find(
                        (element) => element.id === item
                      ).dictName;
                    } else {
                      this.publicMapProps.occupationDiseaseData[i].typeName += `,${
                        this.occupationType.find((element) => element.id === item)
                          .dictName
                      }`;
                    }

                    number++;
                  }
                );
              }
            }
          } else {
            this.$message.warning(data.message || "获取职业危害区域失败");
          }
        })
        .catch((error) => {
          this.$message.error("获取职业危害区域出错", error);
        });
    },

    // 更新父级公共数据
    // <1>子组更新 父级的公共数据
    upPublicDataByChildren(obj) {
      switch (obj.name) {
        // 重大危险源数据 / 所有危险源
        case "hardDangrOriginData":
          this.hardDangerOriginPageQuery(obj.params);
          break;

        // 重要危险源数据 / 所有危险源
        case "dangerSourceData":
          this.getAllImportantSourceByPageData(obj.params);
          break;

        // 人员定位 / 定位卡所在区域： 人，车，摄像头
        case "areaPersonCarCameraData":
          this.getAreaPersonCarCameraData(obj.params);
          break;
        // default : console.log('没有定义的名称:',obj.name);
      }
    },
    // <2>地图更新 父级的公共数据
    upPublicDataByMap(obj) {
      switch (obj.name) {
        // 人员定位 / 定位卡所在区域： 人，车，摄像头
        case "areaPersonCarCameraData":
          this.getAreaPersonCarCameraData(obj.params);
          break;
      }
    },

    // #endregion
  },
};
</script>

<template>
  <div class="w-full absolute top-0 left-0">
    <BaseMap
      ref="baseMap"
      :buildId="buildId"
      v-bind="publicMapProps"
      :curPerson="curPerson"
      :navList="navList"
      @upPublicDataByMap="upPublicDataByMap"
      @mapClickTo2d="mapClickTo2d"
    />
    <div class="flex items-center justify-between z-50">
      <!-- 底图 206092 -->
      <!-- 头部导航 -->
      <div class="flex items-center">
        <div
          class="w-52 flex items-center z-20 h-10 rounded-full px-2 my-auto box-border text-white mx-3 bg-primary-dark/80"
        >
          <svg-icon icon-class="globe" size="30" />
          <div class="pl-2 text-2xl font-bold text-white">安环一张图</div>
        </div>
      </div>

      <div class="flex items-center z-50 mx-2">
        <div
          class="flex items-center backdrop-blur-md bg-gradient-white rounded-full overflow-hidden my-2 mx-4 h-11"
          v-if="navList.length > 0"
        >
          <div class="w-full h-full flex px-2 items-center bg-primary-light/60">
            <!--  :style="{backgroundImage: curNav === index ? 'url(' + btn_bg + ')' : ''}" -->
            <div class="flex items-center justify-center flex-1">
              <button
                v-for="(item, index) in navList"
                :key="index"
                class="flex items-center justify-center px-4 cursor-pointer text-sm mx-1 font-semibold text-white h-10 box-border"
                :class="{
                  'bg-primary-dark  rounded-full overflow-hidden h-8 leading-8':
                    curNav === index,
                }"
                :style="curNav === index ? { backgroundImage: `` } : menu_style"
                @click="tapNav(item, index)"
              >
                <span>{{ item.name }}</span>

                <div
                  v-if="curNav === index"
                  class="ml-2 transition-all duration-300 ease-in-out"
                  :class="{ '-rotate-180': !isExpand }"
                >
                  <svg-icon icon-class="showIcon" size="16" />
                </div>
              </button>
            </div>
            <!-- 底部线条 -->
            <div class="bot-line" />
          </div>
        </div>
        <div class="flex items-center">
          <div
            class="flex z-20 flex-col justify-center items-center w-[120px] h-10 rounded-xl py-1 px-3 text-white box-border bg-primary-dark"
          >
            <span class="text-lg leading-5">
              {{ timeDes }}
            </span>
            <span class="text-xs">
              {{ dateDes }}
            </span>
          </div>
          <div
            ref="clickAudio"
            class="flex items-center z-20 h-10 rounded-xl px-4 my-auto box-border text-white mx-3 bg-primary-dark"
            @click="audioPause"
          >
            <svg-icon :icon-class="isMuted ? 'bella' : 'bellOff'" class="w-4 h-4 mr-1" />
            报警信息：{{ alarmTotal }}
            <!-- loop <iframe :src="audioUrl" allow="autoplay" type="audio/mp3" id="audio" style="display:none"></iframe> -->
            <audio ref="audio" autoplay="autoplay" muted="muted" loop>
              <source :src="audioUrl" type="audio/ogg" />
            </audio>
          </div>
          <div
            class="flex z-20 flex-col cursor-pointer justify-center items-center h-10 w-11 rounded-xl text-white box-border bg-primary-dark"
            @click="toCenterClick"
          >
            <svg-icon
              icon-class="home"
              class="w-10 h-10 text-gray-300 transition-colors duration-300 hover:text-white"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="w-1/4 h-full"></div> -->
    <!-- :is="mainComponent[curNav]" -->
    <!-- keep-alive 动态切换组件把内部的组件进行缓存，而不是销毁组件 -->
    <keep-alive :exclude="['FlyManager']">
      <component
        :is="mainComponent[curNav]"
        ref="childComponent"
        :buildId="buildId"
        v-bind="publicMapProps"
        @upPublicDataByChildren="upPublicDataByChildren"
        @toMap="toMap"
        @locationToMap="locationToMap"
        @exitInspection="onSetCurrView"
        @startInspection="onStartInspection"
      />
    </keep-alive>
  </div>
</template>

<style lang="scss" scoped>
.back-info {
  background: linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 -2px 4px rgba(255, 255, 255, 0.05), 0 4px 8px rgba(0, 0, 0, 0.3);
}

.active {
  // color: #4afafe;
  // background-size: 100% 100%;
  border-radius: 50px;
  background: linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4),
    inset 0 -2px 4px rgba(255, 255, 255, 0.05), 0 4px 8px rgba(0, 0, 0, 0.3);
}
// .buisCon-newMaterial {
//   position: absolute;
//   top: 0;
//   left: 0;
// .topNav {
//   position: relative;
//   width: 100vw;
//   height: 50px;
//   display: flex;
// background-color: #035170c9;

// &::after {
//   content: "";
//   width: 40vw;
//   background-image: url("@/assets/anhuan3d/l_t.png");
//   background-size: 100% 100%;
//   position: absolute;
//   left: 0;
//   top: 0;
//   bottom: 0;
// }

// &::before {
//   content: "";
//   width: 40vw;
//   background-image: url("@/assets/anhuan3d/r_t.png");
//   background-size: 100% 100%;
//   position: absolute;
//   right: 0;
//   top: 0;
//   bottom: 0;
// }
.left-tn {
  // width: 0%;
  // flex: 1 1;
  padding: 10px 20px;
  font-size: 22px;
  font-weight: bold;
  color: #fff;
  line-height: 30px;
  z-index: 10;
}
.center-tn {
  width: 0%;
  flex: 1 1;
  // margin-left: -100px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  z-index: 50;
  .item-nav {
    padding: 8px 8px;
    margin: 0 2px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    color: #fff;
    &.active {
      // color: #4afafe;
      // background-size: 100% 100%;
      border-radius: 50px;
      background: linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4),
        inset 0 -2px 4px rgba(255, 255, 255, 0.05), 0 4px 8px rgba(0, 0, 0, 0.3);
    }
    /*清除默认背景 */
    border: 0px;
    outline: none;
    background-color: transparent;
  }
  .item-nav:hover {
    // color: #4afafe;
  }
}
.right-tn {
  // width: 0%;
  // flex: 1 1;

  // z-index: 10;
  // color: #fff;
  // display: flex;
  // flex-direction: row;
  // justify-content: flex-end;
  // align-items: center;
  // font-size: 14px;
  //返回管理中心
  .bi-top-right {
    /* position: absolute;
                  top: 15%;
                  right: 2.4%;
                  height: 5vh; */
    width: 15%;
    display: flex;
    flex-wrap: wrap;
    font-size: 0.9vw;
  }
}
.bot-line {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
}
// }
// }

.alarm-default {
  color: #ffffff;
}
.alarm-blink {
  color: #dceb0c;
  animation: blink 1s infinite;
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
