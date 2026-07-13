<script>
// 基本信息
import BaseInfo from "@/components/Detail/UserInfo/baseInfo";
// 业务信息
import OtherInfo from "@/components/Detail/UserInfo/otherInfo";
// import LivePlayer from "@liveqing/liveplayer"
// import { getGroupByUser } from '@/http/xingfaBi/xingfa.js'
import JessibucaPlayer from "@/components/JessibucaPlayer/index";
import { videoById } from "@/http/hkAi-api"; // 播放视频
import {
  getAreaPeopleCar,
  getCardsByKey, // 获取所有的开屏页list
  getGroupByUser, // 获取厂区人数相关
  getHistoryLocations,
  locationGetAlarmStat,
} from "@/http/map/gis-map.js";
import { formatDate } from "@/utils";
import { USERTYPE } from "@/views/manage/form/user";
import IMAGES from "./js/image.js";
import { histroyTrack } from "./js/index.js";

export default {
  components: {
    // LivePlayer,
    JessibucaPlayer,
    BaseInfo,
    OtherInfo,
  },
  filters: {
    typeToStr(val) {
      if (!val) return;

      const res = USERTYPE.find((item) => item.code === val).lable;
      return res || "";
    },
  },
  props: {
    companyName: { type: String, default: "" },
    buildId: { type: String, default: "" },
    areaPersonCarCameraData: { type: Array, default: () => [] },
    isCarNumber: { type: Object, default: () => {} },
    positionInfoDisplay: { type: Object, default: () => {} },
  },
  data() {
    return {
      // 图片资源（通过计算属性访问）
      images: IMAGES,
      sKeyId: "person-car-id",
      sKey: "",
      // 是否离线测试
      isOffline: histroyTrack.isOffline || false,
      mapPerson: [], // 人员 在地图分布
      personAndCarList: [], // 人员 车辆 摄像头 列表
      personCarAlarmList: [], // 人车报警统计
      chart_gjtj: undefined, // 人车告警统计图表
      outList: [],
      perBtnType: 0, // 1: 实时跟踪； 2: 历史轨迹
      isTrack: false, // 文字状态   flase: 实时跟踪；true: 取消实时跟踪
      otherCars: 0,
      otherPers: 0,
      othBtnType: 1, // 1: 人员； 2: 车辆
      trcBtnType: 0, // 1: 今日轨迹； 2: 昨日轨迹
      sForm: {
        unit: 3,
        long: 30,
        startTime: undefined,
      },
      historyData: [],
      perNumInfo: {}, // 左上角 人数相关
      areaFlag: false, // 人车卡片
      curArea: {}, // 记录点击 左下角 人车厂区分布情况的item
      clickTrigger: false, // 是否点击是触发 建议列表
      suggestResults: [], // 建议选项
      areaBtnType: 1, // 1: 人员； 2: 车辆
      areaData_p: [], // 区域人员列表
      areaData_c: [], // 区域车辆列表
      timer_area: null, // 区域 定时轮询后台接口
      isHistoryTrack: false, // 是否有历史轨迹  true 禁用 disable
      // 默认激活  禁用 pointerEvents:'none'
      style_enable: { color: "#fff", pointerEvents: "auto" },
      // 最近的人车视频
      // recentPersonCarVideo:[],
      videoList: [], // 最近的视频
      videoUrlList: [],
      enterComponent: false, // true 进入，false退出
      // 弹窗
      dialogTitle: "一人一档",
      showInfoDialog: false,
      userId: "",
      method: "view",
      activeName: "baseInfo", // 'baseInfo' ，'otherInfo'
    };
  },
  computed: {
    leftHide() {
      return this.$store.state.newMaterial.isExpand;
    },
    rightHide() {
      return this.$store.state.newMaterial.isExpand;
    },
    isPers() {
      //let res = this.$store.state.newMaterial.isPers;
      let res = this.$parent.isPers;
      if (res && this.chart_gjtj) {
        this.chart_gjtj.dispose();
      } else {
        this.$nextTick(() => {
          if (this.enterComponent) {
            // 关闭历史轨迹
            if (this.isHistoryTrack) {
              this.closeHistoryTrack();
              this.isHistoryTrack = false;
            }
            //取消跟踪
            if (this.isTrack) {
              this.cancelPersonTrack();
              this.isTrack = false;
            }
            //清除视频
            this.clearVideoUrlList();
            this.initAllCharts();

            // 启用人车点击按钮
            this.isEnablePersonCarClick(true);
          }
        });
      }
      return res;
    },
    curPer() {
      this.historyData = [];
      // return this.$store.state.newMaterial.curPer;
      return this.$parent.curPerson;
    },

    // 所在区域人车
    areaPersonCarData() {
      return this.areaPersonCarCameraData.filter((item) => {
        return item.busType !== 3;
      });
    },

    // 卡号关联的摄像头  item.busType === 3
    personCameraList() {
      this.videoList = this.areaPersonCarCameraData.filter((item) => item.busType === 3);
      let isExist = false;
      // 清理不在的视频
      if (this.videoUrlList.length > 0) {
        for (let i = this.videoUrlList.length - 1; i >= 0; i--) {
          isExist = false;
          if (
            this.videoList.find((item) => item.cardCode === this.videoUrlList[i].cardCode)
          ) {
            isExist = true;
          }
          // 不存在
          if (!isExist) {
            // 销毁视频
            this.$refs.jessibucaVideo[i].methods_destroy();
            // .methods_destroy();
            this.$refs.jessibucaVideo.splice(i, 1);
            // 删除数据
            this.videoUrlList[i].url = "";
            this.videoUrlList.splice(i, 1);
          }
        }
      }

      // 添加新的视频
      for (let j = 0; j < this.videoList.length; j++) {
        isExist = false;
        if (
          this.videoUrlList.find((item) => item.cardCode === this.videoList[j].cardCode)
        ) {
          // 视频已经存在
          isExist = true;
        }
        if (!isExist) {
          // 添加视频
          const video = {
            cardCode: this.videoList[j].cardCode,
            name: this.videoList[j].busName,
            url: "",
            visiable: true,
          };
          this.videoUrlList.push(video);
        }
      }

      return this.videoUrlList;
    },
    areaPerson() {
      return [
        {
          icon: this.images.person.glgb,
          text: "安全员",
          value: this.perNumInfo.safer,
        },
        {
          icon: this.images.person.qyyg,
          text: "部门负责人",
          value: this.perNumInfo.departmentHeader,
        },
        {
          icon: this.images.person.cbs,
          text: "其他员工",
          value: this.perNumInfo.contractor,
        },
      ];
    },
    areaCar() {
      return [
        {
          icon: this.images.vehicle.cqcl1,
          text: "厂区车辆",
          value: 0,
        },
        {
          icon: this.images.vehicle.yscl,
          text: "运输车辆",
          value: 0,
        },
        {
          icon: this.images.vehicle.sjc,
          text: "私家车辆",
          value: 0,
        },
        {
          icon: this.images.vehicle.qtc,
          text: "其他车辆",
          value: 0,
        },
      ];
    },
  },

  mounted() {
    console.log("isCarNumber", this.isCarNumber);
    if (!this.isOffline) {
      this.getAreaPeoPleCarData();
      // 人员定位报警接口
      this.getAlarmStatData();
    } else {
      // 离线测试  所在区域的人车
      this.personAndCarList = histroyTrack.personAndCarList;
    }
    // ?? 暂不请求数据
    this.getPerNumInfo();
    this.loopGetAreaInfo();

    // 上次搜索人员卡
    if (localStorage.getItem(this.skeyId) != null) {
      const localObj = JSON.parse(localStorage.getItem(this.skeyId));
      if (localObj.hasOwnProperty("suggestResults")) {
        this.suggestResults = localObj.suggestResults;
        // 是否点击触发 建议列表
        this.clickTrigger = true;
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.timer_area);
  },
  // 进入组件
  activated() {
    // 设置为非人 显示人车统计 更新触发计算属性
    // this.$store.dispatch('newMaterial/isPers', false);
    this.$parent.isPers = false;
    this.enterComponent = true;
    this.initial();
  },
  // 退出组件
  deactivated() {
    this.enterComponent = false;
    // 退出时恢复初始设置
    this.reset();
  },
  created() {
    this.getPrefix();
  },
  methods: {
    formatDate,

    initial() {
      // 如果时间为undefined,设定默认时间  为前1小时
      if (this.sForm.startTime === undefined) {
        const hours = 0.5; // 1小时
        // 时间戳
        this.sForm.startTime = new Date().getTime() - `${hours * 60 * 60 * 1000}`;
        // console.log('startTime:',this.formatDate(this.sForm.startTime));
      }
    },
    // 恢复初始
    reset() {
      // 销毁视频数据
      this.clearVideoUrlList();
      // 实时跟踪
      if (this.perBtnType === 1) {
        // 取消人员跟踪
        if (this.isTrack) {
          this.cancelPersonTrack();
          this.isTrack = false;
        }
      }
      // 历史轨迹
      else if (this.perBtnType === 2) {
        // 关闭历史轨迹
        if (this.isHistoryTrack) {
          this.closeHistoryTrack();
          this.isHistoryTrack = false;
        }
      }
      this.perBtnType = 0;

      // 设置为非人 显示人车统计
      // 关闭卡片 ( 人 ，车)
      if (this.areaFlag) {
        this.areaFlag = false;
      }
      // 启用人车按钮点击
      this.isEnablePersonCarClick(true);
    },

    personInfo(userId) {
      if (userId) {
        this.showInfoDialog = true;
        this.userId = userId;
        // this.$refs.baseInfo.submitBaseInfo()
        if (this.$refs.baseInfo) {
          this.$refs.baseInfo.getCompanyList();
          this.$refs.baseInfo.getUserDetail(userId);
        }
      } else {
        console.log("userId:", userId);
        this.$message.warning("定位卡未关联人员信息!");
      }
    },
    // 是否启用人车按钮点击
    isEnablePersonCarClick(isEnable) {
      if (isEnable) {
        //  启用
        this.style_enable = { color: "#fff", pointerEvents: "auto" };
      } else {
        // 禁用
        this.style_enable = { color: "#a5a5a5", pointerEvents: "none" };
      }
    },

    vidoByIdPlay(deviceId, index) {
      // Request URL: https://hs-test.angelyeast.com/api/video/play?deviceId=3520
      // Request URL: https://hs-test.angelyeast.com/api/video/play?channelId=42050301581314000355&deviceId=42050302002000112233
      videoById(deviceId)
        .then(({ data }) => {
          if (data.code === 200 && data.result) {
            // 读取的是m3u8格式的，用livePlayer播放器
            // this.videoUrl = data.result.hls;

            // 读取的是flv格式的，用JessibucaPlayer播放器
            if (window.g.IS_HTTPS) {
              this.videoUrlList[index].url = data.result.https_flv;
            } else {
              this.videoUrlList[index].url = data.result.flv;
            }
            this.videoUrlList[index].visiable = false;
          } else {
            this.$message.error(data.message || "请求失败!");
          }
        })
        .catch((err) => {
          this.$message.error(err || "请求失败!");
        });
    },

    // 清空视频列表
    clearVideoUrlList() {
      if (this.$refs.jessibucaVideo) {
        this.$refs.jessibucaVideo.forEach((item) => {
          item.methods_destroy();
        });
      }
      for (let i = 0; i < this.videoUrlList.length; i++) {
        this.videoUrlList[i].url = "";
        this.videoUrlList[i].isPlay = false;
      }

      // this.$refs.videoDiv
      this.videoUrlList = [];
      this.videoList = [];
      // console.log('清空视频URL',this.videoUrlList)
    },

    // 人员定位报警接口
    getAlarmStatData() {
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
            const option = this.chart_gjtj.getOption();

            option.title[0].text = ["{name|报警数}", `{value|${alarmTotal}}`].join("\n");
            option.series[0].data = this.personCarAlarmList;
            this.chart_gjtj.setOption(option);
          } else {
            this.$message.warning(data.message || "获取定位报警数据失败");
          }
        })
        .catch((error) => {
          this.$message.error("获取定位报警数据出错", error);
        });
    },

    // 获取厂区人数相关
    getPerNumInfo() {
      getGroupByUser().then(({ data }) => {
        if (data.success) {
          const res = {
            total: 0,
          };
          (data.result || []).forEach((item) => {
            res[item.userType] = item.count;
            res.total += item.count;
          });
          this.perNumInfo = res;
        }
      });
    },
    // 获取区域数据
    loopGetAreaInfo() {
      if (this.timer_area) {
        clearInterval(this.timer_area);
        this.timer_area = null;
      }
      this.timer_area = setInterval(() => {
        if (this.enterComponent) {
          if (!this.isOffline) {
            // 获取所有 人车
            // this.getAreaPeoPleCarData();
            this.getAlarmStatData();
            // 实时更新 人所在区摄像头列表  摄像头 busType:3
            if (this.perBtnType === 1 && this.isTrack) {
              const params = {
                buildId: this.buildId,
                searchNear: 1,
                cardCode: [this.curPer.cardCode],
              };
              // 更新数据  计算属性会自动更新视频列表
              this.updateToParent(params);
            }
          }
        }
      }, 5000); // 2秒轮询一次
    },
    // 获取建筑下的 人车
    getAreaPeoPleCarData() {
      getAreaPeopleCar(this.buildId).then(({ data }) => {
        if (data.code === 200) {
          this.personAndCarList = data.result || [];
          console.log("人车:", this.personAndCarList);
          // 添加一个在线属性
          for (let i = 0; i < this.personAndCarList[0]?.items?.length; i++) {
            this.personAndCarList[0].items[i].online = true;
          }
        }
      });
    },

    // 人车卡片
    tapItemLeft(val) {
      this.curArea = val;
      this.curArea.areaName = this.companyName;
      this.areaFlag = true;
      this.areaData_p = [];
      this.areaData_c = [];
      val.items &&
        val.items.forEach((item) => {
          if (item.busType === 1) {
            this.areaData_p.push(item);
          } else {
            this.areaData_c.push(item);
          }
        });
      this.curArea.carCount = this.areaData_c.length;
      this.$emit("locationToMap", { id: "100", type: "area" });
    },
    // 人卡片
    tapItemLeftPerson(value) {
      // 区域名称
      this.curArea.areaName = value.name;
      this.areaData_p = [];
      this.areaData_c = [];
      value.persons.forEach((item) => {
        if (item.busType === 1) {
          this.areaData_p.push({
            latitude: item.latitude,
            longitude: item.longitude,
            timestamp: item.timestamp,
            buildId: this.buildId,
            busType: item.busType,
            busName: item.name,
            cardCode: item.id,
            floorNum: item.floorId,
            dept: item.dept,
            userId: item.userId,
            userType: item.userType,
            userPost: item.userPost,
            online: true,
          });
        } else {
          this.areaData_c.push({
            latitude: item.latitude,
            longitude: item.longitude,
            timestamp: item.timestamp,
            buildId: this.buildId,
            busType: item.busType,
            busName: item.busName,
            cardCode: item.cardCode,
            floorNum: item.floorNum,
            userId: item.userId,
            userType: item.userType,
            userPost: item.userPost,
            dept: item.dept,
            online: true,
          });
        }
      });
      // 人员数量
      this.curArea.peopleCount = this.areaData_p.length;
      // 车辆数量
      this.curArea.carCount = this.areaData_c.length;
      // 定位到建筑区域
      this.$emit("locationToMap", { id: value.key, type: "area" });
      this.areaFlag = true;
    },

    // 初始化图表
    initChart(options) {
      const chartDom = document.getElementById("chart_gjtj");
      if (chartDom) {
        this.chart_gjtj = this.$echarts.init(chartDom);
        this.chart_gjtj.setOption(options);
      }
    },
    initAllCharts() {
      this.initChart({
        title: {
          zlevel: 0,
          text: ["{name|报警数}", `{value|${0}}`].join("\n"),
          top: "38%",
          left: "49.2%",
          textAlign: "center",
          textStyle: {
            rich: {
              value: {
                color: "#fffff",
                fontSize: 16,
                lineHeight: 20,
              },
              name: {
                color: "#ffffff",
                fontSize: 16,
                lineHeight: 16,
              },
            },
          },
        },
        color: [
          "#91cc75",
          "#3cc7e8",
          "#6881ff",
          "#ff8e43",
          "#ff7070",
          "#2388eb",
          "#57f0bc",
          "#ffe45f",
        ],
        tooltip: {
          trigger: "item",
          formatter: "{b}: {c}",
        },
        series: [
          {
            type: "pie",
            minAngle: 20, // 最小占比
            radius: ["50%", "70%"],
            label: {
              show: true, // 名称 + 数量
              formatter(param) {
                return `${param.name}:${param.value}`;
              },
            },
            data: [
              { value: 0, name: "车辆超速报警" },
              { value: 0, name: "静止报警" },
              { value: 0, name: "滞留报警" },
              { value: 0, name: "越界报警" },
              { value: 0, name: "缺员报警" },
              { value: 0, name: "一键报警" },
              { value: 0, name: "超员报警" },
              { value: 0, name: "作业报警" },
            ],
            center: ["50%", "50%"], // 控制 饼图的位置
            hoverOffset: 5, // 控制 hover时 变大的距离
          },
        ],
      });
    },
    // 点击 实时跟踪/取消跟踪
    tapReal() {
      // 进入跟踪
      this.perBtnType = 1;
      // 关闭历史轨迹
      if (this.isHistoryTrack) {
        this.closeHistoryTrack();
        this.isHistoryTrack = false;
      }

      // 如果是跟踪状态，则取消跟踪
      if (this.isTrack) {
        // 取消人员跟踪
        this.cancelPersonTrack();
        this.isTrack = false;
        // 启用人车按钮点击
        this.isEnablePersonCarClick(true);
      }
      // 如果是未跟踪状态，则进行跟踪
      else {
        // 所在区域人车  摄像头 busType:3    重新搜索
        const params = {
          buildId: this.buildId,
          searchNear: 1,
          cardCode: [this.curPer.cardCode],
        };
        // 更新数据  计算属性会自动更新视频列表
        this.updateToParent(params);
        // 开始实时跟踪
        this.$emit("toMap", {
          name: "startPersonTrack",
          params: { cardCode: this.curPer.cardCode },
        });
        this.isTrack = true;

        // 关闭卡片 ( 人 ，车)
        if (this.areaFlag) {
          this.areaFlag = false;
        }
        // 禁用人车按钮点击
        this.isEnablePersonCarClick(false);
      }
    },
    // 点击 历史轨迹
    toggleHistory() {
      this.perBtnType = 2;
      // 清除视频URL
      // this.clearVideoUrlList();
      // 取消人员跟踪
      if (this.isTrack) {
        this.cancelPersonTrack();
        this.isTrack = false;
        // 启用人车按钮点击
        this.isEnablePersonCarClick(true);
      }
    },
    // 返回上一步
    tapBack() {
      if (this.perBtnType === 1) {
        // 取消人员跟踪
        this.clearVideoUrlList();
        this.cancelPersonTrack();
        this.isTrack = false;
      } else if (this.perBtnType === 2) {
        // 关闭历史轨迹
        if (this.isHistoryTrack) {
          this.closeHistoryTrack();
          this.isHistoryTrack = false;
        }
      }
      this.perBtnType = 0;
      // 启用人车点击按钮
      this.isEnablePersonCarClick(true);
    },
    // 其他车辆
    tapCar() {
      this.othBtnType = 2;
    },
    // 其他人员
    tapPer() {
      this.othBtnType = 1;
    },
    // 点击今日轨迹
    tapTod() {
      this.trcBtnType = 1;
    },
    // 点击昨日轨迹
    tapYes() {
      this.trcBtnType = 2;
    },
    // 点击左侧隐藏按钮
    toHideLeft() {
      this.$store.dispatch("newMaterial/leftHide", true);
    },
    // 点击左侧显示按钮
    toShowLeft() {
      this.$store.dispatch("newMaterial/leftHide", false);
    },
    // 点击右侧隐藏按钮
    toHideRight() {
      this.$store.dispatch("newMaterial/rightHide", true);
    },
    // 点击右侧显示按钮
    toShowRight() {
      this.$store.dispatch("newMaterial/rightHide", false);
    },

    //  天 / 小时 / 分 监听转换
    selectTime(value) {
      if (value === 3) {
        // 分
        if (this.sForm.long === "") {
          this.sForm.long = 30;
        }
      } else if (value === 2) {
        // 时
        this.sForm.long = "";
      } else if (value === 1) {
        // 秒
        this.sForm.long = "";
      }
    },
    // 历史轨迹的 立即查询 按钮
    hisDone() {
      // 历史轨迹 查询历史轨迹 查询轨迹
      if (!this.isOffline) {
        this.queryHistryTrack();
      } else {
        // 离线数据
        this.historyData = histroyTrack.aq_track;
      }
    },
    queryHistryTrack() {
      const { startTime, unit, long } = this.sForm;
      if (!startTime) {
        this.$message.error("请选择开始时间!");
        return;
      }
      if (!unit) {
        this.$message.error("请选择时间单位!");
        return;
      }
      if (!long) {
        this.$message.error("请选择查询时长!");
        return;
      }

      const params = {};
      switch (unit) {
        case 1:
          params.endTime = startTime + +long * 24 * 60 * 60 * 1000;
          break;
        case 2:
          params.endTime = startTime + +long * 60 * 60 * 1000;
          break;
        case 3:
          params.endTime = startTime + +long * 60 * 1000;
          break;
      }
      params.startTime = startTime;
      params.cardCode = this.curPer.cardCode;

      const info = {
        "卡号/姓名": this.curPer.busName || params.cardCode,
        开始: this.formatTime(params.startTime),
        结束: this.formatTime(params.endTime),
      };

      getHistoryLocations(params)
        .then(({ data }) => {
          if (data.code === 200) {
            this.historyData = data.result || [];
            // 人员轨迹数据  打印记录轨迹
            // console.log(' 轨迹数据:', JSON.stringify(this.historyData));
          } else {
            this.historyData = [];
            this.$message.error(data.message || "请求失败!");
          }
        })
        .catch((err) => {
          this.$message.error(err || "请求失败!");
        });
    },

    // 显示播放历史轨迹界面
    openHistoryTrack(row) {
      console.log(row, "row");
      this.$refs.tableTrack.setCurrentRow(row);
      this.areaCardClose();
      const points = row.points.map((p) => {
        p.floorNum = row.floorNum;
        p.cardCode = row.cardCode;
        return p;
      });
      // 暂时无轨迹数据
      if (points.length > 0) {
        window.showPath(points);
        this.isHistoryTrack = true;
        // 禁用人员车辆点击按钮
        this.isEnablePersonCarClick(false);
      }
    },
    // 卡片弹窗中的 标签按钮的点击（人员、车辆）
    tapArea(v) {
      this.areaBtnType = v;
    },
    // 卡片弹窗的关闭
    areaCardClose() {
      this.areaFlag = false;
    },

    // 区域弹出 人车卡片 / 人员表格 行点击事件
    areaPTap(row) {
      // 销毁视频数据
      this.clearVideoUrlList();
      // 实时跟踪
      if (this.perBtnType === 1) {
        // 取消人员跟踪
        if (this.isTrack) {
          this.cancelPersonTrack();
          this.isTrack = false;
        }
        this.perBtnType = 0;
      }
      this.$emit("locationToMap", { id: row.cardCode, type: "" });
      this.toShowRight();
      // this.$store.dispatch('newMaterial/isPers', true);
      // this.$store.dispatch('newMaterial/curPer', row);

      this.$parent.isPers = true;
      this.$parent.curPerson = row;

      const params = {
        buildId: this.buildId,
        searchNear: 1,
        cardCode: [row.cardCode],
      };

      // 所在区域人车  摄像头 busType:3
      this.updateToParent(params);
    },
    // 左下角厂区分布情况的 搜索
    remoteSearch(key, callback) {
      // let results = [];
      let results = this.suggestResults;
      if (key) {
        getCardsByKey(this.buildId, key).then(({ data }) => {
          if (data.code === 200) {
            results = (data.result || []).filter((item) => {
              item.value = item.busName || item.cardCode;
              if (!item.online) {
                this.handleOfflineInfo(item);
              }
              // item.online;
              return item;
            });
          }
          callback(results);
        });
      } else if (results.length > 0) {
        callback(results);
      }
    },
    // 处理 查询离线人员信息 离线人员
    handleOfflineInfo(currValue) {
      // 切换到历史轨迹
      this.toggleHistory();
      // 当前的人车
      // this.$store.dispatch('newMaterial/curPer', currValue);
      this.$parent.curPerson = currValue;
      // 显示人右侧员菜单UI （跟踪，轨迹）
      // this.$store.dispatch('newMaterial/isPers', true);
      this.$parent.isPers = true;
    },

    // 远程搜索 选中   现有列表的选择名称触发
    remoteSelect(value) {
      if (value.value) {
        const cardObj = {};
        for (const [key, value] of Object.entries(value)) {
          cardObj[key] = value;
        }
        // 人员是存在  保存搜索建议
        if (
          this.suggestResults.find((obj) => {
            return obj.cardCode === value.cardCode;
          }) === undefined
        ) {
          if (this.suggestResults.length < 10) {
            // this.suggestResults.push(cardObj);
            // 往前添加
            this.suggestResults.unshift(cardObj);
          } else {
            // 删除最后一个元素
            this.suggestResults.pop();
            // 从数组前面添加元素
            this.suggestResults.unshift(cardObj);
          }
          localStorage.setItem(
            this.skeyId,
            JSON.stringify({ suggestResults: this.suggestResults })
          );
          // 是否点击触发 建议列表
          this.clickTrigger = true;
        }
      }
      // 定位到地图
      this.$emit("locationToMap", value.cardCode);
      // 显示右侧菜单
      this.toShowRight();

      // 显示人右侧员菜单UI （跟踪，轨迹）
      // this.$store.dispatch('newMaterial/isPers', true);
      this.$parent.isPers = true;

      // 被选中当前人员信息
      // value = curPer = {busName:'姓名'，userType:'类型',cardCode:'定位卡号',dept:"所属部门",userPost:'岗位'}
      // this.$store.dispatch('newMaterial/curPer', value);
      this.$parent.curPerson = value;

      const params = {
        buildId: this.buildId,
        searchNear: 1,
        cardCode: [value.cardCode],
      };
      // 卡号 所在区域的  人车 摄像头
      this.updateToParent(params);
    },
    handleIconClick(ev) {
      console.log("click:", ev);
    },

    // 取消人员跟踪
    cancelPersonTrack() {
      this.$emit("toMap", {
        name: "cancelPersonTrack",
        params: { cardCode: this.curPer.cardCode },
      });
    },
    // 关闭历史轨迹
    closeHistoryTrack() {
      // 关闭历史轨迹
      this.$emit("toMap", {
        name: "closeHistoryTrack",
        params: {},
      });
      // this.$store.dispatch('newMaterial/clearHisTrack');
    },

    // 公共方法

    // 来自地图点击
    from3dMapClick(markerObj) {
      // 启用人车按钮点击
      if (markerObj.id === "PersonCar-colseTrack") {
        this.isEnablePersonCarClick(true);
      } else if (markerObj.id === "build-person") {
        // 地图人员分布
        this.mapPerson = markerObj.data;
        // other: { peopleCount:this.allPersons.length, carCount: 0, items:this.allPersons ,areaName:'33333' },
        this.personAndCarList = markerObj.other;

        // this.personAndCarList = markerObj.other;
        // 添加一个在线属性
        /* for(let i = 0 ; i < this.personAndCarList[0].items.length; i++ ){
                      this.personAndCarList[0].items[i].online =  true;
                  } */
      } else if (markerObj.id === "personCarAlarmList") {
        const option = this.chart_gjtj.getOption();
        (option.title[0].text = [
          "{name|报警数}",
          `{value|${markerObj.data.alarmTotal}}`,
        ].join("\n")),
          (this.personCarAlarmList = markerObj.data.personCarAlarmList);
        option.series[0].data = this.personCarAlarmList;
        this.chart_gjtj.setOption(option);
        // console.log('报警数量 :',markerObj.data.alarmTotal);
      }
    },

    // 调用父级 请求数据
    updateToParent(params) {
      this.$emit("upPublicDataByChildren", {
        name: "areaPersonCarCameraData",
        params,
      });
    },

    // 时间格式化
    formatTime(timestamp) {
      // let timestamp=inputTime.toString().length===10?inputTime*1000:inputTime
      const date = new Date(timestamp);
      const y = date.getFullYear();
      let m = date.getMonth() + 1;
      m = m < 10 ? `0${m}` : m;
      let d = date.getDate();
      d = d < 10 ? `0${d}` : d;
      let h = date.getHours();
      h = h < 10 ? `0${h}` : h;
      let minute = date.getMinutes();
      let second = date.getSeconds();
      minute = minute < 10 ? `0${minute}` : minute;
      second = second < 10 ? `0${second}` : second;
      // 2022-03-23 20:49:31
      return `${y}-${m}-${d} ${h}:${minute}:${second}`;
      // Date.parse(time)/1000);日期转换成秒=就是时间戳
    },
  },
};
</script>

<template>
  <div class="personCar-buisCon">
    <!-- 左侧 -->
    <div
      class="w-[24%] h-[calc(100vh-66px)] absolute left-0 top-0 rounded-lg overflow-hidden mx-3 transition-all duration-300 ease-in-out"
      :class="leftHide ? 'translate-x-[-106%] ease-out' : ''"
    >
      <div
        class="h-[calc(100vh-66px)] flex flex-col rounded-lg overflow-hidden border border-primary-dark-light backdrop-blur-lg p-2 box-border"
      >
        <!-- 人数 -->
        <div
          class="rounded-md p-2 overflow-hidden mb-4 backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
        >
          <div class="flex items-center text-base text-white font-bold">
            <img :src="images.person.cqrs" class="w-4 h-4 mr-2" />
            <span>厂区人数</span>
          </div>

          <div class="flex items-center justify-between my-3 px-2">
            <div class="relative w-32 h-full">
              <img :src="images.person.cqrs_bg" />
              <div
                class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white text-sm flex flex-col items-center justify-center"
              >
                <div>厂区人数</div>
                <div class="text-2xl font-bold">
                  {{ perNumInfo.total }}
                </div>
              </div>
            </div>

            <div class="flex-1 flex flex-col justify-between gap-3 h-full pl-5">
              <div
                v-for="item in areaPerson"
                :key="item.text"
                class="flex items-center text-white"
              >
                <img :src="item.icon" class="w-6 mr-1" />
                <div class="flex items-center">
                  <div class="text-sm">
                    {{ item.text }}
                  </div>
                  <div class="text-sm font-bold ml-1">
                    {{ item.value || 0 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 车辆数 -->
        <div
          v-if="isCarNumber.value"
          class="rounded-md p-2 border border-primary-dark-light overflow-hidden mb-4 backdrop-blur-lg bg-primary-dark/60 shadow-insetLight"
        >
          <div class="flex items-center text-base text-white font-bold">
            <img :src="images.vehicle.cqcl" class="w-4 h-4 mr-2" />
            <span>厂区车辆数</span>
          </div>

          <div
            class="grid grid-cols-2 gap-x-2 gap-y-2 my-3"
            style="grid-template-columns: 1fr 1fr; gap: 8px"
          >
            <div
              v-for="item in areaCar"
              :key="item.text"
              class="bg-cover bg-center h-10 flex items-center justify-between px-3"
              :style="{ backgroundImage: `url(${images.vehicle.cl_bg})` }"
            >
              <div class="flex items-center">
                <img :src="item.icon" class="w-4 h-4 mr-2" />
                <span class="text-sm text-white">{{ item.text }}</span>
              </div>
              <div class="text-white">
                <span class="text-sm">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 人车分布 -->
        <div
          class="rounded-md flex-auto px-2 border border-primary-dark-light py-3 overflow-hidden backdrop-blur-lg bg-primary-dark/60 shadow-insetLight flex flex-col min-h-0"
        >
          <div class="flex items-center text-base text-white font-bold">
            <img :src="images.function.rcfb" class="w-4 h-4 mr-2" />
            <span>人车厂区分布情况</span>
          </div>

          <div
            class="gap-2 my-3 bg-cover bg-center rounded-lg px-2 py-3 flex-1 min-h-0 flex flex-col"
          >
            <!-- :style="{ backgroundImage: `url(${images.common.bg1})` }" -->
            <!-- 搜索框 -->
            <div class="flex items-center w-full mb-2">
              <el-autocomplete
                v-model="sKey"
                popper-class="my-autocomplete"
                class="w-full"
                clearable
                :trigger-on-focus="clickTrigger"
                :fetch-suggestions="remoteSearch"
                placeholder="输入卡号、车辆编号检索人员或车辆"
                :debounce="1000"
                @select="remoteSelect"
              >
                <template slot="suffix">
                  <i
                    class="el-icon-edit el-input__icon text-slate-400 hover:text-sky-400 text-lg cursor-pointer"
                    @click="handleIconClick"
                  />
                </template>
                <template slot-scope="{ item }">
                  <div class="name text-base text-gray-800">
                    {{ item.value }}
                  </div>
                </template>
              </el-autocomplete>
            </div>
            <div class="flex flex-col flex-1 min-h-0 overflow-y-auto">
              <button
                key="total-person-car"
                class="w-full flex flex-wrap items-center justify-between px-2 py-1 rounded-sm text-white text-xs font-medium transition-colors hover:bg-[#e8f0f7] group"
                :style="style_enable"
                @click="tapItemLeft(personAndCarList)"
              >
                <span class="truncate text-left group-hover:text-primary">
                  {{ companyName }}总人数 :
                </span>
                <span class="ml-2 truncate group-hover:text-primary">
                  {{ personAndCarList.peopleCount }}人
                </span>
                <span class="ml-2 truncate group-hover:text-primary">
                  {{ personAndCarList.carCount }}车
                </span>
              </button>

              <button
                v-for="item in mapPerson"
                :key="item.key"
                class="w-full flex flex-wrap items-center justify-between px-2 py-1 rounded-sm text-white text-xs font-medium transition-colors hover:bg-[#e8f0f7] group"
                :style="style_enable"
                @click="tapItemLeftPerson(item)"
              >
                <span class="truncate text-left group-hover:text-primary">
                  {{ item.name }}
                </span>
                <span class="ml-2 truncate group-hover:text-primary">
                  {{ item.sumber }}人
                </span>
                <span class="ml-2 truncate group-hover:text-primary" />
              </button>
            </div>
          </div>
        </div>

        <!-- 收起按钮 -->
        <div class="showBtns">
          <div
            v-if="!leftHide"
            :style="{ backgroundImage: `url(${images.common.left_hide})` }"
            @click="toHideLeft"
          />
          <div
            v-else
            :style="{ backgroundImage: `url(${images.common.right_hide})` }"
            @click="toShowLeft"
          />
        </div>
      </div>
    </div>

    <!-- 右侧 -->
    <div
      class="w-[24%] h-[calc(100vh-66px)] absolute right-0 top-0 rounded-lg overflow-hidden mx-3 transition-all duration-300 ease-in-out"
      :class="rightHide ? 'translate-x-[106%]' : ''"
    >
      <div
        class="h-[calc(100vh-66px)] flex flex-col rounded-lg overflow-hidden border border-primary-dark-light backdrop-blur-lg p-2 box-border"
      >
        <template v-if="!isPers">
          <!-- 人车告警统计 -->
          <div
            class="rounded-md p-2 overflow-hidden mb-4 backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
          >
            <div class="flex items-center text-base text-white font-bold">
              <img :src="images.function.gjtj" class="w-4 h-4 mr-2" />
              <span>人车告警统计</span>
            </div>
            <div v-if="!isPers" id="chart_gjtj" ref="chart_gjtj" class="h-32 my-3" />
          </div>

          <!-- 外来人车登记记录 -->
          <div
            class="rounded-md p-2 overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 flex-auto shadow-insetLight"
          >
            <div class="flex items-center text-base text-white font-bold">
              <img :src="images.person.rydj" class="w-4 h-4 mr-2" />
              <span>外来人车登记记录</span>
            </div>
            <div class="flex-1 flex flex-col overflow-auto text-white text-xs my-3">
              <div v-for="item in outList" :key="item.id" class="mb-3 leading-5 p-1">
                <div>
                  <span>{{ item.type }}</span>
                  <span>{{ item.name }}</span>
                </div>
                <div>
                  <span>{{ item.phone }}</span>
                  <span>{{ item.company }}</span>
                </div>
                <div>{{ item.content }}</div>
                <div>{{ item.time }}</div>
              </div>
            </div>
          </div>
        </template>

        <template v-if="isPers">
          <!-- 人员信息 -->
          <div
            class="h-[calc(100vh-66px)] flex flex-col rounded-md p-2 overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
          >
            <div class="flex items-center text-base text-white font-bold">
              <img :src="images.person.cqrs" class="w-4 h-4 mr-2" />
              <span>人员信息</span>
            </div>

            <!-- 人员基础信息 -->
            <div class="flex w-full h-40 my-3">
              <div class="ml-2">
                <!-- <img :src="images.person.worker">  filePrefix -->
                <img
                  class="w-24 h-28 object-cover"
                  v-if="curPer.userPhoto"
                  :src="filePrefix + curPer.userPhoto"
                />
                <img class="w-20 h-28 object-cover" v-else :src="images.person.worker" />
              </div>
              <div class="flex flex-col justify-between h-full ml-2">
                <div class="text-xs text-white">
                  <span>姓名:</span>
                  <span>{{ curPer.busName }}</span>
                </div>
                <div class="text-xs text-white">
                  <span>类型:</span>
                  <span>{{ curPer.userType | typeToStr }}</span>
                </div>
                <div class="text-xs text-white">
                  <span>定位卡号:</span>
                  <span>{{ curPer.cardCode }}</span>
                </div>
                <div class="text-xs text-white">
                  <span>所属部门:</span>
                  <span>{{ curPer.dept }}</span>
                </div>
                <div class="text-xs text-white">
                  <span>岗位:</span>
                  <span>{{ curPer.userPost }}</span>
                </div>
                <template>
                  <div class="text-xs text-white">
                    <span>状态:</span>
                    <span>{{ curPer.online ? " 在线 " : " 离线 " }}</span>
                  </div>
                </template>
                <div
                  class="py-1 px-2 rounded-md text-white border border-primary-dark-light"
                  @click="personInfo(curPer.userId)"
                >
                  <span class="text-xs text-white">一人一档</span>
                </div>
              </div>
            </div>

            <!-- 实时、历史按钮组 -->
            <div class="button-div">
              <button
                :style="{ color: perBtnType === 1 ? '#00f4ff' : '#fff' }"
                @click="tapReal"
              >
                {{ !isTrack ? "实时跟踪" : "取消跟踪" }}
              </button>
              <button
                :style="{ color: perBtnType === 2 ? '#00f4ff' : '#fff' }"
                @click="toggleHistory"
              >
                历史轨迹
              </button>
            </div>

            <!-- 返回上一步 -->
            <div v-if="perBtnType != 0" class="button-box">
              <button @click="tapBack">返回上一步</button>
            </div>

            <!-- 所在区域其他人车 -->
            <div v-if="perBtnType === 0" class="flex flex-col flex-1">
              <!-- <div>所在区域其他人车</div> -->
              <div class="flex items-center text-base text-white font-bold my-2">
                <img :src="images.function.lszs" class="w-4 h-4 mr-2" />
                <span>所在区域其他人车</span>
              </div>
              <div class="flex justify-between gap-2 mb-2">
                <el-button
                  :style="{ color: othBtnType === 1 ? '#00f4ff' : '#333' }"
                  @click="tapPer"
                  plain
                  class="w-full py-1 px-2 rounded-md text-sm text-white bg-primary-dark-light"
                >
                  {{ `人员(${areaPersonCarData.length})` }}
                </el-button>
                <el-button
                  :style="{ color: othBtnType === 2 ? '#00f4ff' : '#333' }"
                  @click="tapCar"
                  plain
                  class="w-full py-1 px-2 rounded-md text-sm text-white bg-primary-dark-light"
                >
                  {{ `车辆(${otherCars})` }}
                </el-button>
              </div>
              <div class="flex-1 overflow-auto">
                <el-table :data="areaPersonCarData" height="95%">
                  <el-table-column label="姓名" align="center">
                    <template slot-scope="scope">
                      {{ scope.row.busName || scope.row.cardCode }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="userType" label="类型" width="70" align="center">
                    <template slot-scope="scope">
                      {{ scope.row.userType | typeToStr }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="dept" label="部门车间" align="center" />
                  <el-table-column
                    prop="userPost"
                    label="岗位"
                    width="70"
                    align="center"
                  />
                </el-table>
              </div>
            </div>

            <!-- 历史追溯 -->
            <div v-if="perBtnType === 2" class="flex flex-col flex-1">
              <div class="flex items-center text-base text-white font-bold my-2">
                <img :src="images.function.lszs" class="w-4 h-4 mr-2" />
                <span>历史追溯</span>
              </div>
              <div class="hisCon">
                <!-- 按钮组 -->
                <!-- <div class="btn-row">
                            <div :style="{backgroundImage: 'url(' + (trcBtnType === 1 ? btn_bg : btn_bg1) + ')', color: trcBtnType === 1 ? '#fff' : '#00f4ff'}" @click="tapTod">今日轨迹</div>
                            <div :style="{backgroundImage: 'url(' + (trcBtnType === 2 ? btn_bg : btn_bg1) + ')', color: trcBtnType === 2 ? '#fff' : '#00f4ff'}" @click="tapYes">昨日轨迹</div>
                        </div> -->

                <!-- 查询条件 :model="sForm" -->
                <el-form :model="sForm" inline label-width="60px">
                  <!-- <el-form-item label="姓名/SN/车牌" prop="a">
                                <el-input v-model="sForm.a" placeholder="请输入姓名/SN/车牌" style="width: 100%;" />
                            </el-form-item> -->
                  <!-- <el-form-item label="追溯方式" prop="b">
                                <el-radio-group v-model="sForm.b">
                                    <el-radio :label="1">时间段</el-radio>
                                    <el-radio :label="2">精确时间</el-radio>
                                </el-radio-group>
                            </el-form-item> -->
                  <el-form-item label="开始时间" prop="startTime">
                    <el-date-picker
                      v-model="sForm.startTime"
                      style="width: 100%"
                      placeholder="开始时间"
                      type="datetime"
                      value-format="timestamp"
                      clearable
                      popper-class="datePicker-personCar"
                    />
                  </el-form-item>
                  <!-- <el-form-item label="结束时间" prop="endTime">
                                <el-date-picker
                                    v-model="sForm.endTime"
                                    style="width: 100%"
                                    placeholder="结束时间"
                                    type="datetime"
                                    value-format="timestamp"
                                    clearable
                                />
                            </el-form-item> -->
                  <el-form-item label="时间单位" prop="unit">
                    <el-radio-group v-model="sForm.unit" @change="selectTime">
                      <el-radio :label="1"> 天 </el-radio>
                      <el-radio :label="2"> 小时 </el-radio>
                      <el-radio :label="3"> 分钟 </el-radio>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="查询时长" prop="long">
                    <el-input v-model="sForm.long" placeholder="请输入时长" />
                  </el-form-item>
                  <div class="button-box mb-2">
                    <button @click.prevent="hisDone">立即查询</button>
                  </div>
                </el-form>

                <!-- 表格  -->
                <el-table
                  ref="tableTrack"
                  :data="historyData"
                  class="hisTable comm-table"
                  height="56%"
                  :highlight-current-row="true"
                  @row-click="openHistoryTrack"
                >
                  <el-table-column label="序号" type="index" align="center" width="45" />
                  <el-table-column prop="floorNum" label="楼层" width="45" align="center">
                    <template slot-scope="props"> F{{ props.row.floorNum }} </template>
                  </el-table-column>
                  <el-table-column prop="startTime" label="进入时间" align="center">
                    <template slot-scope="props">
                      {{ formatDate(props.row.startTime) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="endTime" label="离开时间" align="center">
                    <template slot-scope="props">
                      {{ formatDate(props.row.endTime) }}
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>

            <!-- 视频联动画面 -->
            <div v-if="perBtnType === 1" class="vds">
              <div class="flex items-center text-base text-white font-bold my-2">
                <img :src="images.function.spld" class="w-4 h-4 mr-2" />
                <span>视频联动画面</span>
              </div>
              <div ref="videoDiv" class="vdsCon">
                <div
                  v-for="(item, index) in personCameraList"
                  :key="item.cardCode"
                  class="video-item"
                >
                  <div class="video-box">
                    <!--  <LivePlayer
                                    fluent
                                    :show-custom-button="false"
                                    hide-snapshot-button
                                /> -->
                    <!--  <LivePlayer :videoUrl="videoUrl" fluent autoplay live stretch /> -->
                    <JessibucaPlayer
                      :id="Math.floor(Math.random() * 10 + 1)"
                      ref="jessibucaVideo"
                      :videoUrl="item.url"
                    />
                    <template v-if="item.visiable">
                      <div class="play-box" />
                      <div
                        class="play-button"
                        :style="{ backgroundImage: `url(${images.function.player})` }"
                        @click="vidoByIdPlay(item.cardCode, index)"
                      />
                    </template>
                    <div class="title-row">
                      {{ item.name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
        <!-- 收起按钮 -->
        <div class="showBtns">
          <div
            v-if="!rightHide"
            :style="{ backgroundImage: `url(${images.common.right_hide})` }"
            @click="toHideRight"
          />
          <div
            v-else
            :style="{ backgroundImage: `url(${images.common.left_hide})` }"
            @click="toShowRight"
          />
        </div>
      </div>
    </div>

    <!-- 区域显示人车卡片 卡片 -->
    <div
      v-show="areaFlag"
      class="areaCard"
      :style="{ backgroundImage: `url(${images.common.bg1})` }"
    >
      <div class="acTitle">
        <span>{{ curArea.areaName }}</span>
        <span @click="areaCardClose"><i class="el-icon-close" /></span>
      </div>

      <div class="acCon">
        <div class="button-div">
          <button
            :style="{ color: areaBtnType === 1 ? '#00f4ff' : '#fff' }"
            @click="tapArea(1)"
          >
            在线人员({{ curArea.peopleCount || 0 }})
          </button>
          <button
            :style="{ color: areaBtnType === 2 ? '#00f4ff' : '#fff' }"
            @click="tapArea(2)"
          >
            在线车辆({{ curArea.carCount }})
          </button>
        </div>

        <!-- 人卡片 -->
        <div v-if="areaBtnType === 1" class="tab-item">
          <el-table
            :data="areaData_p"
            class="comm-table"
            height="100%"
            :highlight-current-row="true"
            @row-click="areaPTap"
          >
            <el-table-column label="序号" type="index" align="center" width="45" />
            <el-table-column label="姓名" align="center">
              <template slot-scope="scope">
                {{ scope.row.busName || scope.row.cardCode }}
              </template>
            </el-table-column>
            <el-table-column label="楼层" align="center" width="45">
              <template slot-scope="props"> F{{ props.row.floorNum }} </template>
            </el-table-column>
            <el-table-column prop="dept" label="所属部门" align="center" />
          </el-table>
        </div>
        <!-- 车卡片 -->
        <div v-if="areaBtnType === 2" class="tab-item">
          <el-table
            :data="areaData_c"
            class="comm-table"
            height="100%"
            :highlight-current-row="true"
            @row-click="areaPTap"
          >
            <el-table-column label="序号" type="index" align="center" width="45" />
            <el-table-column label="车辆" align="center">
              <template slot-scope="scope">
                {{ scope.row.busName || scope.row.cardCode }}
              </template>
            </el-table-column>
            <el-table-column prop="dept" label="所属部门" align="center" />
          </el-table>
        </div>
      </div>
    </div>
    <template>
      <el-dialog
        v-max-dialog
        :title="dialogTitle"
        :visible.sync="showInfoDialog"
        width="70%"
        append-to-body
        :close-on-click-modal="false"
      >
        <el-tabs v-model="activeName">
          <el-tab-pane label="基本信息" name="baseInfo" />
          <el-tab-pane label="其他业务" name="otherInfo" />
        </el-tabs>
        <div class="contentArea">
          <BaseInfo
            v-show="activeName === 'baseInfo'"
            :id.sync="userId"
            ref="baseInfo"
            :method="method"
          />
          <OtherInfo v-show="activeName === 'otherInfo'" :id.sync="userId" />
        </div>
      </el-dialog>
    </template>
  </div>
</template>
<style lang="scss" scoped>
::v-deep {
  .el-form-item__label {
    color: #fff;
  }
}
.personCar-buisCon {
  position: relative;
  z-index: 50;
  //   ::v-deep .el-table .cell {
  //     color: #ffffff !important;
  //   }

  .left-pc {
    width: 30%;
    height: calc(100vh - 50px);

    &.hide {
      transform: translateX(calc(-100% + 100px));
    }
  }
  .right-pc {
    width: 30%;
    height: calc(100vh - 50px);
    position: absolute;
    right: 0;
    /* ??right: 70px; */
    top: 0;
    background-image: url("../../../assets/anhuan3d/right.png");
    background-size: 100% 100%;
    padding: 10px 20px 10px 100px;
    display: flex;
    flex-direction: column;
    .stis {
      #chart_gjtj {
        height: 140px;
      }
    }
    .outs {
      padding-top: 10px;
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      .oCon {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: auto;
        color: #fff;
        font-size: 12px;
        .item-out {
          margin-bottom: 10px;
          line-height: 20px;
          padding: 5px;
          border: 1px solid #0f81a3;
          & > div {
            span {
              margin-right: 20px;
            }
            &:first-child {
              font-size: 14px;
              font-weight: bold;
            }
            &:nth-child(2),
            &:nth-child(3) {
              color: #ccc;
            }
            &:last-child {
              font-weight: bold;
            }
          }
        }
        // chrome浏览器隐藏滚动条
        &::-webkit-scrollbar {
          display: none;
        }
        // 火狐浏览器的滚动条隐藏
        scrollbar-width: none;
      }
    }
    .pers {
      display: flex;
      flex-direction: column;
      font-size: 12px;
      color: #fff;
      .base-row {
        height: 160px;
        width: 100%;
        display: flex;
        img {
          width: 80px;
          height: 100px;
          border: 1px solid rgb(15, 129, 163);
        }
        & > div {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          span:nth-child(2) {
            padding-left: 6px;
            -webkit-user-select: text;
            -moz-user-select: text;
            -o-user-select: text;
            user-select: text;
          }
        }
        .yryd {
          padding: 2px 3px 2px 3px;
          margin: 2px;
          border: 1px solid #00e7ff;
          color: #00e7ff;
          background-size: 100% 100%;
          width: fit-content;
          //padding: 6px 8px;
          font-weight: bold;
          cursor: pointer;
        }
        .yryd:hover {
          color: #ffffff;
        }
      }
    }

    .other-row {
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      .bot-or {
        flex: 1;
        overflow: hidden;
      }
    }

    .historyQuery {
      padding-top: 10px;
      font-size: 12px;
      color: #fff;
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      .hisCon {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        .btn-row {
          padding-bottom: 6px;
          display: flex;
          justify-content: space-between;
          & > div {
            padding: 8px 0;
            width: 49%;
            text-align: center;
            cursor: pointer;
            background-size: 100% 100%;
            font-weight: bold;
            color: #fff;
          }
        }
        .el-form {
          .el-form-item {
            margin: 0;
            width: 100%;
            display: flex;
            .el-form-item__label {
              color: #fff;
              text-align: left;
              line-height: 24px;
            }
            .el-form-item__content {
              line-height: 24px;
              flex: 1;
              .el-input__inner {
                height: 22px;
                line-height: 22px;
                background: transparent;
                border-color: #0f81a3;
                color: #fff;
              }
              .el-input__icon {
                line-height: 22px;
              }
              .el-radio {
                margin-right: 10px;
                .el-radio__label {
                  padding-left: 5px;
                  color: #fff;
                }
              }
            }
          }
          .schBtn {
            background-size: 100% 100%;
            padding: 8px 0;
            text-align: center;
            cursor: pointer;
            margin-left: -4px;
            margin-right: -4px;
            margin-top: 6px;
            color: #00f4ff;
            font-weight: bold;
          }
        }
        .hisTable {
          margin-top: 6px;
          flex: 1;
          overflow: hidden;
        }
      }
    }
    .vds {
      padding-top: 10px;
      font-size: 12px;
      color: #fff;
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      .vdsCon {
        flex: 1;
        overflow: auto;
        .video-item {
          position: relative;
          //height: 150px;
          width: 100%;
          padding-bottom: 56.25%;
          .video-box {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            border: 1px solid #00e7ff;
            background: url("../../../assets/anhuan3d/video.png");
            background-repeat: no-repeat;
            background-size: 100% 100%;

            .play-box {
              z-index: 99;
              position: absolute;
              top: 0%;
              height: 100%;
              width: 100%;
              background: #00000075;
              border: 1px solid #0f81a3;
            }
            .play-button {
              z-index: 100;
              cursor: pointer;
              content: "";
              position: absolute;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              width: 48px;
              height: 48px;
              background-repeat: no-repeat;
              background-position: 50%;
              opacity: 0.7;
            }
            .play-button:hover {
              z-index: 100;
              opacity: 1;
              //border:2px solid #00e7ff;
            }
            .title-row {
              z-index: 100;
              text-align: center;
              position: relative;
              bottom: 20px;
            }
          }
        }

        // chrome浏览器隐藏滚动条
        &::-webkit-scrollbar {
          display: none;
        }
        // 火狐浏览器的滚动条隐藏
        scrollbar-width: none;
      }
    }

    .showBtns {
      position: absolute;
      top: 50%;
      right: calc(100% - 95px);
      transform: translateY(-50%);
      & > div {
        width: 18px;
        height: 61px;
        background-size: 100% 100%;
        cursor: pointer;
      }
    }
    &.hide {
      transform: translateX(calc(100% - 100px));
    }
  }
  .comm-title {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: bold;
    color: #fff;
    padding-bottom: 10px;
    img {
      width: 16px;
      margin-right: 6px;
    }
  }
  .comm-table {
    color: #fff;
    background: transparent;
    border: 1px solid #0f81a3;
    &::before {
      height: 0px;
    }
    th,
    tr {
      background: transparent;
    }
    th {
      color: #fff;
      font-weight: bold;
      padding: 0;
      border: none !important;
      background: transparent !important;
    }
    tr:hover td {
      background: rgba(15, 129, 163, 0.9) !important;
      cursor: pointer;
    }
    td {
      padding: 0;
      border: none !important;
    }
    .el-table__body-wrapper {
      // chrome浏览器隐藏滚动条
      &::-webkit-scrollbar {
        display: none;
      }
      // 火狐浏览器的滚动条隐藏
      scrollbar-width: none;
    }
    //选中高亮
    .current-row > td {
      background: #0794a980 !important;
      border-left: none;
      border-right: none;
    }
  }
  .areaCard {
    padding: 10px;
    background-size: 100% 101%;
    background-color: rgba(1, 1, 1, 0.4);
    position: absolute;
    top: calc(100vh - 485px);
    left: calc(50% - 173px);
    width: 345px;
    height: 400px;
    display: flex;
    flex-direction: column;
    z-index: 1;
    .acTitle {
      display: flex;
      justify-content: space-between;
      color: #fff;
    }
    .acCon {
      flex: 1;
      overflow: hidden;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      .acTab {
        display: flex;
        & > div {
          background-size: 100% 100%;
          padding: 10px 20px;
          cursor: pointer;
          &:first-child {
            margin-right: -3px;
          }
        }
      }
      .tab-item {
        flex: 1;
        overflow: hidden;
        .comm-table {
          border: none;
        }
      }
    }
  }
}
.datePicker-personCar {
  left: unset !important;
  right: 30px !important;
  top: unset !important;
  bottom: 30px !important;
}
.button-box {
  button {
    width: 100%;
    margin: 6px 0px 0px 0px;
    padding: 6px;
    font-size: 14px;
    color: #fff;
    background-color: #0f445d40;
    border: 1px solid #0bb4c0;
    cursor: pointer;
  }
  button:hover {
    color: #47eff4;
    font-size: 14px;
    background: rgba(15, 129, 163, 0.9) !important;
  }
}
.button-div {
  padding-top: 6px;
  display: flex;
  justify-content: space-between;
  button {
    width: 100%;
    padding: 6px;
    font-size: 14px;
    color: #fff;
    background-color: #0f445d40;
    border: 1px solid #0bb4c0;
    cursor: pointer;
  }
  button:hover {
    color: #47eff4;
    font-size: 14px;
    background: rgba(15, 129, 163, 0.9) !important;
  }
}
.contentArea {
  flex: 1;
  overflow-y: auto;
  height: 600px;
}

::v-deep .el-dialog {
  margin: 50px auto !important;
}
</style>
