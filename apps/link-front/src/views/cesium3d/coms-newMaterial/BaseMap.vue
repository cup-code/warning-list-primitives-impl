<script>
import * as turf from "@turf/turf";
import { Loading } from "element-ui";
import { mapState } from "vuex";
import bg1 from "@/assets/anhuan3d/bg1.png";
import JessibucaPlayer from "@/components/JessibucaPlayer/index";
import { getHkCameraList, videoPlayById } from "@/http/hkAi-api";
import {
  getAllFirePointFn, // 消防点位
  getLastLocations,
  getRiskAreaAll, // 风险区域
  getWorklistAll,
} from "@/http/map/gis-map.js";
// 人员定位报警接口 /api/locationAlarm/getAlarmStat
import { getViewPointList } from "@/http/map/manage-api";
import { loadJsmap, unloadJsmap } from "@/utils/loadJsmap";
import trackPlay from "./components/zq_trackPlayer.vue";
import { zq_handleMarker } from "./handleMarker.js";
import { buildIndoorArea, zq_config } from "./js/index.js";
import {
  buildViewerOptions,
  flyToViewerOption,
} from "./viewerOption.js";

let handleMarker;

export default {
  components: {
    TrackPlay: trackPlay,
    JessibucaPlayer,
  },
  props: {
    buildId: { type: String, default: "" }, // 地图资源id
    companyId: { type: String, default: "" },
    // 重大危险源
    hardDangerOriginData: { type: Array, default: () => [] },
    // 重要危险源
    dangerSourceData: { type: Array, default: () => [] },
    occupationDiseaseData: { type: Array, default: () => [] },
    // 当前选择人员
    curPerson: { type: Object, default: () => {} },
    positionInfoDisplay: { type: Object, default: () => {} },
    navList: { type: Array, default: () => [] },
  },
  data() {
    return {
      bg1,
      mapServerURL: window.g.MAP_URL, // 地图引用的地址 window.g.MAP_URL
      layerIsSpread: false, // 图层控制是否展开 ,展开 true , 收起fase
      menuList: zq_config.menuList, // 功能模块包含图层
      currMenuId: "",
      deviceData: zq_config.deviceData, // 设备名称
      layerboxVisable: true, // 显示图层控制
      percent: 0,
      allShapes: [], // 所有要交互图形
      personObj: {},
      loadingInstance: null,
      // 用以内部计算，不做绑定UI显示
      percentage: 0,
      intervalTimeout: null,
      allPersons: [], // 所有的人员定位卡 -- 后台数据
      allCameras: [], // 所有摄像头列表 -- 后台数据
      allRisks: [], // 所有风险区域列表 -- 后台数据
      dialog_vid: false,
      videoUrl: "",
      websocket: null, // websocket 实例
      mapPerson: [], // 建筑名称、人员数量 [{key:'1',name:'建筑名称',sun:1},]
      buildIndoorAreaList: buildIndoorArea.data, // 建筑室内区域
      mapTool: undefined, // 坐标转换工具
      viewerOptions: [], // 视图位置
      currViewerId: "",
      view3d: undefined, // 3d
      view2d_top: undefined, // 2d
      judgeInOrOutDoor: false, // 默认不做室内判断
      highlightMarker: undefined, // 高亮标签
      mainMap: null, // 主地图
      isShowViewerOption: true, // 是否显示视图选项
      // 消防管理
      // 消防点位
      pointList: [],
      firePointType: {}, // 消防点位类型

      // 安全作业
      safeOperationData: [],
      // 电子围栏数据
      fenceDataList: [],

      // 地图销毁是否被销毁
      isDestroy: false,
      // 记录切换的组件名称
      recordComponentName: "",

      // 是否可以拖动进度条,等待动画完成
      isDrawing: true,
      layerList: [],
      // 点击的建筑图标 默认显示
      clickBuildMark: null,
      buildingArea: [],
    };
  },
  computed: {
    ...mapState("cesium3dStore", ["currentStep", "pointInfo"]),
    leftHide() {
      return this.$store.state.newMaterial.leftHide;
    },

    rightHide() {
      return this.$store.state.newMaterial.rightHide;
    },

    // 记录地图当前点击的人员
    curPer() {
      return this.$parent.curPerson;
    },

    isAnimated() {
      return this.recordComponentName === "FlyManager";
    },
  },
  watch: {
    // 重要危险源
    // 监听点击对象
    "clickBuildMark._show": {
      handler(newValue, _oldValue) {
        this.riskAreaIndoor(newValue);
      },
    },
    navList: {
      handler(newValue) {
        this.$nextTick(() => {
          const list = newValue.map((item) => item.id);
          this.layerList = zq_config.layerList.filter(
            (item) => list.includes(item.belong) || item.belong === "always"
          );
        });
      },
      immediate: true,
    },
    pointInfo: {
      handler(newVal) {
        if (newVal && Object.keys(newVal).length > 0) {
          this.$nextTick(() => {
            this.mapRoam(5000, JSON.parse(newVal.geoInfo).info);
          });
        }
      },
    },
  },

  created() {
    // this.loadingInstance = Loading.service({
    //   lock: true,
    //   text: "拼命加载中...",
    //   spinner: "el-icon-loading",
    //   background: "rgba(0, 0, 0, 0.8)",
    // });
    this.firePointType = this.$dictUtils.getDictList("fire_point");
  },

  async mounted() {
    // 调用成功
    // 获取 2d/3d 视图

    this.isDestroy = false;
    // this.companyId = this.$store.state.user.user.companyId;
    // 人员定位
    try {
      await this.getViewerOptions();
    } catch (error) {
      if (!this.isDestroy) {
        console.error("视角配置加载失败:", error);
      }
    }

    if (this.isDestroy) {
      return;
    }

    try {
      await loadJsmap();
      if (this.isDestroy) {
        unloadJsmap();
        return;
      }
      handleMarker = new zq_handleMarker(window.jsmap);
      // 人员定位
      this.initMap();
    } catch (error) {
      if (!this.isDestroy) {
        console.error("❌ jsmap 加载失败:", error);
        this.$message.error("地图资源加载失败，请刷新页面重试");
      }
    }

    if (this.isDestroy) {
      return;
    }

    // 监听点击详情
    window.showPath = (data) => {
      // 创建轨迹
      data.sort((a, b) => a.timestamp - b.timestamp); // 根据时间戳升序
      const start = data[0];
      const end = data[data.length - 1];
      const tarck_opention = {
        trackData: data,
        id: start.cardCode,
        // name: this.curPer.busName || this.curPer.cardCode, this.$parent.curPerson
        name: this.curPerson.busName || this.curPerson.cardCode,
        floor:
          typeof data.floorNum === "string" && data.floorNum.startsWith("B")
            ? data.floorNum.replace(/^B/, "-")
            : data.floorNum,
        timestamp: start.timestamp,
        type: "track", // 轨迹类型
      };
      this.createTrackPath(tarck_opention);

      // 默认 灰色 #2e2e2e
      this.$refs.trackPlay.$refs.playBut.style.background = "#808080";
      // 初始化播放控制器
      this.$refs.trackPlay.initial();
      // 更新初始时间、结束时间
      this.$refs.trackPlay.upTimestamp(start.timestamp, end.timestamp);
      this.percent = 0; // trackPlay 双向绑定
      this.percentage = 0;
      // 显示播放轨迹控制菜单
      this.$refs.trackPlay.visable = true;
    };
  },
  beforeDestroy() {
    this.isDestroy = true;

    if (this.websocket && this.websocket.close) {
      this.websocket.close();
    }

    // 关闭清除历史轨迹
    if (this.$refs.trackPlay.visable) {
      this.closeHistoryTrack();
    }
    // 取消人员跟踪
    if (handleMarker && handleMarker.isTrack) {
      this.cancelPersonTrack({});
    }

    // 清楚轨迹定时器
    if (this.intervalTimeout != null) {
      clearInterval(this.intervalTimeout);
      this.intervalTimeout = null;
    }
    // 销毁地图
    if (this.mainMap && typeof this.mainMap.destroy === "function") {
      this.mainMap.destroy();
    }
    handleMarker = null;
    unloadJsmap();
    // this.loadingInstance.close();
    console.log("销毁Destroy");
  },
  methods: {
    // 请求所有视图位置
    getViewerOptions() {
      return getViewPointList({
        pageNum: 1,
        pageSize: 10000,
        isPage: false,
      }).then(({ data }) => {
        this.viewerOptions = buildViewerOptions(data?.code === 200 ? data?.result?.list : [], this.buildId);
        this.view3d = this.viewerOptions.find(
          (option) => option.isDefault === true
        );
        this.view2d_top = this.viewerOptions.find(
          (option) => option.isDefault === false
        );
        this.currViewerId = this.view3d?.id;
        return this.viewerOptions;
      });
    },
    // 请求所有定位卡最后位置
    getAllPersons() {
      return new Promise((resolve) => {
        getLastLocations(this.buildId).then(({ data }) => {
          if (data.code === 200) {
            this.allPersons = data.result || [];
            resolve();
          }
        });
      });
    },
    // 请求所有摄像头列表
    getAllCameras() {
      return new Promise((resolve) => {
        getHkCameraList({
          pageNum: 1,
          pageSize: 10000,
          companyId: this.companyId,
        }).then(({ data }) => {
          if (data.code === 200) {
            this.allCameras = data.result.list || [];
            resolve();
          }
        });
      });
    },
    // 请求所有风险区域
    getAllRisks() {
      return new Promise((resolve) => {
        getRiskAreaAll().then(({ data }) => {
          if (data.code === 200) {
            // 对象是否为空 areaOnMap
            const list = data.result || [];
            // filter 过滤风险区域
            this.allRisks = list.filter((ietm) => {
              return (
                ietm.extInfo.hasOwnProperty("areaOnMap") &&
                Object.keys(ietm.extInfo.areaOnMap).length > 0 &&
                ietm.extInfo.areaOnMap.hasOwnProperty("position")
              );
            });
            resolve();
          }
        });
      });
    },

    // 初始化地图
    initMap() {
      this.mainMap = new jsmap.JSMap({
        mapType: jsmap.JSMapType.MAP_3D,
        container: "map_newMaterial",

        // mapServerURL: window.g.MAP_URL+'zhenqu_map/', //测试开发环境本地跨域
        mapServerURL: this.mapServerURL, // 网络环境
        openingAnimation: true, // 是否开启开场动画，默认true
        showLoading: true, // 是否显示地图加载动画，默认true
        buildingSelected: false, // 是否启用建筑选中，默认true
        selectedEffect: false, // 是否启用选中效果，默认true
        showGlobe: this.layerList.find((item) => item.id === "map-bottom-001").enable, // 是否显示地球
        showBuildingMarker: this.layerList.find((item) => "build-level-01" === item.id)
          .enable, // 是否显示楼层
        //showBuildingMarker: {
        //   show: this.layerList.find((item) => item.id === "build-level-01")?.enable,
        //   statistics: {
        //     markerType: [jsmap.JSMarkerType.ICON_TEXT_MARKER],
        //     filter: (properties) => {
        //       return properties && properties.get("type") == "person";
        //     },
        //   },
        // },
        enableLighting: false, // 灯光
        enableShadows: false, // 阴影
        backgroundColor: "#000000", // 背景颜色 黑色
        defaultViewMode: jsmap.JSViewMode.MODE_3D,
        // showNavigationDisplay: true, //帧刷新率
        // 重置视图位置默认地球中心 初始化可以注销
        // viewOptions: viewerCenter,
        // 地图  默认天地图 IMAGE_TDT
        imageryProvider: jsmap.JSImageryProviderType.IMAGE_TDT,

        floorControlOptions: {
          floorHeight: 20, // 楼层间距
          position: jsmap.JSControlPosition.RIGHT_TOP, // 控件位置
          offset: {
            x: 30,
            y: 60,
          }, // 控件偏移位置
        },
      });
      // buildId
      this.mainMap.openMapById(this.buildId);
      // 不显示楼层图标时 禁止点击模型
      this.mainMap.buildingSelected = this.layerList.find(
        (item) => item.id === "build-level-01"
      )?.enable;

      // 地图加载完成事件
      this.mainMap.on("loadComplete", async (event) => {
        console.log(this.view3d, "this.view3d1");
        window.zhenqu_map = this.mainMap;
        this.mapTool = new jsmap.JSMapCoordTool(this.mainMap);
        this.flyManager = new jsmap.JSFlyManager(this.mainMap);
        this.mainMap.addControl(new jsmap.JSFloorControl(this.mainMap));


          setTimeout(() => {
          this.setCurrView(this.view3d);
        }, 100);

        // 抗锯齿 jsmap.JSMsaaSamplesType.MSAAHIGH | jsmap.JSMsaaSamplesType.MSAAOFF
        this.mainMap.msaaSamples = jsmap.JSMsaaSamplesType.MSAAOFF;
        if (handleMarker?.allShapes) {
          handleMarker.allShapes = this.allShapes;
        }
        handleMarker.personLayerVisiable = this.layerList.find(
          (item) => item.id === "location-per01"
        )?.enable;
        // 风险区- 盒子室内
        handleMarker.boxIndoorLayer = new jsmap.JSBoxMarkerLayer({
          minimumLevel: 3,
          maxmumLevel: 22,
          show: this.layerList.find((item) => item.id === "risk-area-box1")?.enable,
        });
        this.mainMap.addLayer(handleMarker.boxIndoorLayer);
        // 风险区域 - 盒子室内 - 文字
        handleMarker.boxIndoorTextLayer = new jsmap.JSLabelMarkerLayer({
          minimumLevel: 3,
          maxmumLevel: 22,
          show: this.layerList.find((item) => item.id === "risk-area-box1")?.enable,
        });
        this.mainMap.addLayer(handleMarker.boxIndoorTextLayer);
        // 风险区域- 盒子室外
        handleMarker.boxOutdoorLayer = new jsmap.JSBoxMarkerLayer({
          minimumLevel: 3,
          maxmumLevel: 22,
          show: this.layerList.find((item) => item.id === "risk-area-box1")?.enable,
        });
        this.mainMap.addLayer(handleMarker.boxOutdoorLayer);
        // 风险区域 - 盒子室外 - 文字
        handleMarker.boxOutDoorTextLayer = new jsmap.JSLabelMarkerLayer({
          minimumLevel: 3,
          maxmumLevel: 22,
          show: this.layerList.find((item) => item.id === "risk-area-box1")?.enable,
        });
        this.mainMap.addLayer(handleMarker.boxOutDoorTextLayer);
        // 风险区- 染色
        handleMarker.dyeingKeyLayer = new jsmap.JSGroundBoxMarkerLayer({
          minimumLevel: 3,
          maxmumLevel: 22,
          show: this.layerList.find((item) => item.id === "risk-area-box1")?.enable,
        });
        this.mainMap.addLayer(handleMarker.dyeingKeyLayer);
        // 生成设备
        handleMarker.labelMarkerLayer = new jsmap.JSLabelMarkerLayer({
          minimumLevel: 3,
          maxmumLevel: 22,
          show: this.layerList.find((item) => item.id === "text-name-0001")?.enable,
        });
        this.mainMap.addLayer(handleMarker.labelMarkerLayer);
        // 重大危险源
        // if (this.layerList.find((item) => item.id === "hard-danger-origin")) {
        //   handleMarker.imageMarkLayerDanger = new jsmap.JSImageMarkerLayer({
        //     minimumLevel: 3,
        //     maxmumLevel: 22,
        //     show:
        //       this.layerList.find((item) => item.id === "hard-danger-origin")?.enable ||
        //       false,
        //   });
        //   this.mainMap.addLayer(handleMarker.imageMarkLayerDanger);
        // }
        // 重要危险源
        handleMarker.imageMarkerLayerImportantDanger = new jsmap.JSImageMarkerLayer({
          minimumLevel: 3,
          maxmumLevel: 22,
          show: this.layerList.find((item) => item.id === "important-danger-origin")
            ?.enable,
        });
        this.mainMap.addLayer(handleMarker.imageMarkerLayerImportantDanger);
        // 摄像头
        handleMarker.imageMarkLayerCamera = new jsmap.JSIconTextMarkerLayer({
          minimumLevel: 3,
          maxmuLevel: 23,
          show: this.layerList.find((item) => item.id === "camera-icon-01")?.enable,
        });
        this.mainMap.addLayer(handleMarker.imageMarkLayerCamera);
        // 消防管理  消防设备    <1>烟感探测 JSIconTextMarkerLayer
        this.mainMap.addLayer(
          (handleMarker.smokeMarkerLayer = new jsmap.JSIconTextMarkerLayer({
            minimumLevel: 3,
            maxmumLevel: 22,
            show: this.layerList.find((item) => item.id === "fire-device")?.enable,
          }))
        );
        // 作业安全  <1> 电子围栏-线
        this.mainMap.addLayer(
          (handleMarker.lineLayer = new jsmap.JSLineMarkerLayer({
            minimumLevel: 3,
            maxmumLevel: 22,
            show: this.layerList.find((item) => item.id === "electronic-fence")?.enable,
          }))
        );
        //   <1> 电子围栏-面
        this.mainMap.addLayer(
          (handleMarker.polygonLayer = new jsmap.JSPolygonMarkerLayer({
            minimumLevel: 3,
            maxmumLevel: 22,
            show: this.layerList.find((item) => item.id === "electronic-fence")?.enable,
          }))
        );
        // <2> 电子围栏-中间图标
        this.mainMap.addLayer(
          (handleMarker.specialOperationLayer = new jsmap.JSImageMarkerLayer({
            minimumLevel: 3,
            maxmumLevel: 22,
            show: this.layerList.find((item) => item.id === "electronic-fence")?.enable,
          }))
        );
        // 职业病因素区域-box
        handleMarker.occupationDiseaseLayer = new jsmap.JSBoxMarkerLayer({
          minimumLevel: 3,
          maxmumLevel: 22,
          show: this.layerList.find((item) => item.id === "occupation-disease")?.enable,
        });
        this.mainMap.addLayer(handleMarker.occupationDiseaseLayer);
        // 职业病因素区域-text
        /* handleMarker.occupationLayerText = new jsmap.JSIconTextMarkerLayer({
            minimumLevel: 3,
            maxmuLevel: 23,
            show: this.layerList.find((item) => 'occupation-disease' === item.id).enable
          })
          this.mainMap.addLayer(handleMarker.occupationLayerText); */
        handleMarker.occupationLayerText = new jsmap.JSLabelMarkerLayer({
          minimumLevel: 3,
          maxmumLevel: 22,
          show: this.layerList.find((item) => item.id === "occupation-disease")?.enable,
        });
        this.mainMap.addLayer(handleMarker.occupationLayerText);
        // 实例地图空间控件：指北针
        // handleMarker.addCompass(this.mainMap);
        //     // 添加点击事件
        handleMarker.addOnClick(this.mainMap);
        this.mainMap.on("mapClickNode", this.mapTap);

        handleMarker.buildMarkerMap =
          this.mainMap._map._layerManager._buildingIconManager?._buildingStatistics || {};
        // handleMarker.buildMarkerMap.get('1').marker.node.buildingLabel._renderedText = '建筑名称 200人'
        // let  buildingItem = zhenqu_map.getBuildingStatisticsByBuildingId('1');
        // ??请求数据
        // fn && fn()
        await this.loadDone();
        // 初始化静态标记  设备名称
        // this.initail_text(this.deviceData)
        // 作业安全
        // this.initialSafeOperation(this.safeOperationData)
        // 初始化职业病区域
        this.initial_occupationDisease(this.occupationDiseaseData);
        // 初始化 要显示图层
        const list = this.menuList.filter((item) =>
          this.navList.map((item) => item.id).includes(item.id)
        );
        this.navigation3dMethod(list.find((item) => item.id === this.navList[0].id));
        // 重大危险源 - 初始化标记
        if (this.hardDangerOriginData.length > 0) {
          this.initial_dangerOrigin(this.hardDangerOriginData);
        }
        // 重要危险源 - 初始化标记
        if (this.dangerSourceData.length > 0) {
          this.initial_ImportantDangerOrigin(this.dangerSourceData);
        }
        setTimeout(() => {
          // // 按钮：
          // // cesium-zoom-control-icon-reset
          // const cesium_zoom_control_icon_reset = document.getElementsByClassName(
          //   "cesium-zoom-control-icon-reset"
          // )[0];
          // // console.log("reset viewer:",cesium_zoom_control_icon_reset);
          // cesium_zoom_control_icon_reset.addEventListener("click", () => {
          //   // console.log('reset viewer:',this.currViewerId);
          //   this.currViewerId = undefined;
          // });
          // perspective 透视图
          // this.mainMap.setView(viewrOption.center);
          this.setCurrView(this.view3d);
        }, 100);
        // console.log(this.view3d, "this.view3d");

        // this.mapTool = new jsmap.JSMapCoordTool(this.mainMap);
        // this.flyManager = new jsmap.JSFlyManager(this.mainMap);
        // this.mainMap.addControl(new jsmap.JSFloorControl(this.mainMap));

        // this.loadingInstance.close();
      });
    },

    // 地图漫游
    async mapRoam(pauseTime = 3000, info) {
      // 定义每个漫游路线及对应参数
      const routes = info;
      new Promise((resolve) => setTimeout(resolve, 5000));
      let tempMarker;

      if (routes.floorId !== undefined) {
        // 确保楼层控制可用
        this.mainMap.buildingSelected = true;

        // 方法：创建一个二楼的临时标记点，飞到这个点会自动切换楼层
        tempMarker = await new jsmap.JSPointMarker({
          id: `temp-marker-${info.name}`,
          floorId: routes?.floorId, // 第二层
          color: "#00FF00",
          position: new jsmap.JSPoint(routes.center.x, routes.center.y, routes.center.z), // 使用当前位置
          judgeInOrOutDoor: true, // 标记为室外点
          displayCondition: new jsmap.JSDisplayCondition(0.0, routes.distance),
          show: false, // 不显示标记
        });

        this.mainMap.addMarker(tempMarker);

        // 飞到这个二楼标记点，会自动切换到二楼
        await this.mainMap.flyToMarker(tempMarker, {
          duration: pauseTime,
        });

        this.mainMap.flyToPosition(routes.center, {
          duration: routes?.duration,
          offset: {
            rotate: routes.rotate,
            tilt: routes.tilt,
            range: routes.distance,
          },
        });
      } else {
        this.mainMap.flyToPosition(routes.center, {
          duration: routes.duration,
          offset: {
            rotate: routes.rotate,
            tilt: routes.tilt,
            range: routes.distance,
          },
        });
      }
      // 2. 等待飞行时间完成（使用routes中的duration）
      new Promise((resolve) => setTimeout(resolve, routes.duration));

      new Promise((resolve) => setTimeout(resolve, pauseTime));
      if (tempMarker) {
        this.mainMap.removeMarker(tempMarker);
      }
    },
    // 消防管理
    // #region
    // 获取消防管理的消防点位
    getPointList() {
      getAllFirePointFn({ isDrawed: "1", companyId: this.companyId }).then(({ data }) => {
        this.pointList = (data.result || []).map((item) => {
          const pointOnMap = JSON.parse(item.pointOnMap);
          // isNaN() 是否数字  isNaN('11') 为 false
          const name = isNaN(item.alarmType)
            ? item.alarmType
            : this.firePointType.find((element) => element.dictCode === item.alarmType)
                .dictName;
          return {
            type: item.alarmType,
            id: item.id,
            name,
            judgeInOrOutDoor: pointOnMap?.hasOwnProperty("judgeInOrOutDoor")
              ? pointOnMap.judgeInOrOutDoor
              : false,
            floorId: pointOnMap.hasOwnProperty("floorId") ? pointOnMap.floorId : 1, // 1 室外
            // JSON.parse(item.pointOnMap)
            localtion: pointOnMap.hasOwnProperty("position")
              ? pointOnMap.position
              : pointOnMap,
          };
        });
        this.$nextTick(() => {
          this.initialFireProtection(this.pointList);
        });
      });
    },
    initialFireProtection(data) {
      let image;
      let number;
      for (let i = 0; i < data.length; i++) {
        const configShape = handleMarker.shapeConfigDefault.find(
          (config) => config.type === "fire-device"
        );

        // 是否数字
        if (!isNaN(Number(data[i].type))) {
          // 3 和 6 烟感
          number = data[i].type == 6 ? 3 : data[i].type;
          image = `fire${number}.png`;
        } else {
          // 使用默认烟感
          image = configShape.image;
        }
        const option = {
          id: data[i].id,
          position: data[i].localtion,
          floorId: data[i].floorId, // 一层
          judgeInOrOutDoor: data[i].judgeInOrOutDoor,
          image: handleMarker.imagePath + image,
          type: "fire-device", // 消防设备类
          childType: data[i].type, // 消防设备子类
          text: data[i].name,
        };
        const marker = handleMarker.addIconText(option);
        this.allShapes.push(marker);
        handleMarker.smokeMarkerLayer.addMarker(marker);
        // let marker = handleMarker.addMarkImage(imageOpention);
      }
    },

    // #endregion

    // 作业安全 特殊作业!! 标记子类
    // #region

    // 请求所有作业票数据
    getWorklistAllFn() {
      const now = new Date();
      const zeroTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      // 输出当前日期的0点时间
      const obj = {
        workEnd: this.moment(now).format("YYYY-MM-DD HH:mm:ss"),
        workStart: this.moment(zeroTime).format("YYYY-MM-DD HH:mm:ss"),
        companyId: this.companyId,
      };

      getWorklistAll(obj).then(({ data }) => {
        if (data.success) {
          this.safeOperationData = [];
          this.fenceDataList = [];
          // console.log('作业票类型:',data.result);
          // workTicketType
          data.result.forEach((item) => {
            if (item.locationCoordinates && item.locationCoordinates.length >= 3) {
              // 创建中心点
              const pos = this.createCenter(item.locationCoordinates);
              this.safeOperationData.push({
                type: "electronic-fence",
                // 增加到子类
                childType: item.workTicketType,
                id: item.id,
                applyUserName: item.applyUserName,
                applyUnitName: item.applyUnitName,
                place: item.workSite.appendPlace,
                localtion: { x: pos.x, y: pos.y, z: 5 },
                state: item.ticketStatus,
              });

              for (let i = 0; i < item.locationCoordinates.length; i++) {
                item.locationCoordinates[i].z = 6;
              }

              this.fenceDataList.push({
                id: item.id,
                code: item.code,
                type: "electronic-fence",
                // ticketStatus
                state: item.ticketStatus,
                name: "电子围栏",
                positions: item.locationCoordinates,
                //  bindCards: item.bindCards
              });
            }
          });

          this.$nextTick(() => {
            //  创建图标
            this.initialSafeOperation(this.safeOperationData);
            // 创建电子围栏 line  poygon
            this.initialFence(this.fenceDataList);
          });
        }
      });
    },

    initialSafeOperation(data) {
      for (let i = 0; i < data.length; i++) {
        // 特殊作用类型
        const configShape = handleMarker.shapeConfigDefault.find(
          (config) => config.type === "specialWork"
        );
        const imageOpention = {
          id: data[i].id,
          position: data[i].localtion,
          floorId: 1, // 一层
          image: `${handleMarker.imagePath}operate${data[i].childType}.png`,
          type: data[i].type,
          childType: data[i].childType,
          state: data[i].state,
          show: false,
          data: {
            name: data[i].name,
          },
        };
        const marker = handleMarker.addMarkImage(imageOpention);
        this.allShapes.push(marker);
        handleMarker.specialOperationLayer.addMarker(marker);
      }
    },

    // 电子围栏
    initialFence(dataList) {
      const config = handleMarker.shapeConfigDefault.find(
        (config) => config.type === "electronic-fence"
      );
      dataList.forEach((item) => {
        const opention = {
          id: item.id,
          type: config.type,
          name: item.name,
          position: item.positions,
          state: item.state,
          lineType: "DASH", // 实线FILL  流动线TRAIL  短线DASH
          display: config.display,
          show: false,
          depthTest: false,
        };

        // 创建线
        const lineMarker = handleMarker.createPolyline(opention);
        this.allShapes.push(lineMarker);
        handleMarker.lineLayer.addMarker(lineMarker);

        // 创建面
        const polygonMarker = handleMarker.polygonMarker(opention);
        this.allShapes.push(polygonMarker);
        handleMarker.polygonLayer.addMarker(polygonMarker);
      });
    },
    // 创建中心点
    createCenter(positions) {
      const arrayPos = [];
      positions.forEach((position) => {
        arrayPos.push(turf.point([position.x, position.y]));
      });
      const features = turf.featureCollection(arrayPos);
      const center = turf.center(features);
      // center 是一个标准 geojson
      return {
        x: center.geometry.coordinates[0],
        y: center.geometry.coordinates[1],
      };
    },

    // #endregion

    // 地图加载完成后，进入loadComplete事件后执行
    async loadDone() {
      // 并行执行所有数据请求，但确保关键的人员初始化完成
      const promises = [
        // 人员定位 - 必须等待完成，因为 navigation3dMethod 可能依赖它
        this.getAllPersons().then(() => {
          this.init_person();
        }),
        // 摄像头和风险区域可以并行加载
        this.getAllCameras().then(() => {
          this.init_camera();
        }),
        this.getAllRisks().then(() => {
          this.init_risk();
        }),
      ];

      // 等待所有关键异步操作完成
      await Promise.all(promises);

      // 消防管理和作业票可以异步执行，不阻塞主流程
      this.getPointList();
      this.getWorklistAllFn();
    },

    // 初始化 人员
    init_person() {
      let temp, marker;
      const type = {
        1: "busName",
        2: "userPost",
        3: "cardCode",
        4: "cardName",
      };

      this.allPersons.forEach((p) => {
        temp = {
          busType: p.busType,
          type: "person",
          text: p[type[this.positionInfoDisplay.value]] || p.cardName || p.cardCode,
          id: p.cardCode,
          timestamp: p.timestamp,
          position: {
            x: p.longitude,
            y: p.latitude,
            z: 1,
          },
          floorId:
            typeof p.floorNum === "string" && p.floorNum.startsWith("B")
              ? p.floorNum.replace(/^B/, "-")
              : p.floorNum,
          image:
            p.busType === 1
              ? `${handleMarker.imagePath}workers01.png`
              : `${handleMarker.imagePath}car01.png`,
          depthTest: true,
          data: p,
          show: handleMarker.personLayerVisiable,
        };
        marker = handleMarker.addIconTextMarker(temp);
        handleMarker.personMarkerList.push(marker);
        this.mainMap.addMarker(marker);
      });
      this.initiallIndoorArea();
    },
    // 创建室内区域
    initiallIndoorArea() {
      // 创建室内区域 ui data
      let hasIndoor = false;
      for (const [key, value] of handleMarker.buildMarkerMap) {
        console.log(value, handleMarker.buildMarkerMap, "value");
        if (value.marker && value.marker._name) {
          this.mapPerson.push({
            key,
            name: value.marker._name,
            sumber: value.sum,
            persons: [], // 包含人员信息
          });

          const mapConfigs = this.mainMap._map._mapConfig;
          console.log(mapConfigs, "mapConfigs");

          const { buildings, position } = mapConfigs || {};

          this.buildingArea = [
            {
              id: "",
              name: buildings["1"].name,
              display: {
                min: 0,
                max: 1000,
              },
              area: "1",
              color: "#005dff60",
              strokeColor: "#081210",
              height: 5,
              stretchHeight: 10,
              view: this.view3d,
              //  {
              //   center: {
              //     x: position.lng,
              //     y: position.lat,
              //   },
              //   distance: 300,
              //   rotate: 360,
              //   tilt: 360,
              // },
              position: buildings["1"].floors.region.coordinates[0].map((item) => {
                return { x: item[0], y: item[1], z: item[2] };
              }),
            },
          ];

          // 根据建筑名称 同步建筑 id 到建筑区域
          this.buildingArea.find((item) => {
            // 去除 \n   // 去除空格 /[\t\r\f\n\s]*/g
            const buildName = value.marker._name.replace(/\r|\n/g, "");
            if (item.name.replace(/\s*/g, "") === buildName.replace(/\s*/g, "")) {
              item.area = key;
            }
          });
          console.log(this.buildingArea, "this.allPersons");
          // this.allPersons.find((item) => {
          //   // 去除 \n   // 去除空格 /[\t\r\f\n\s]*/g
          //   const buildName = value.marker._name.replace(/\r|\n/g, "");
          //   if (item.name.replace(/\s*/g, "") === buildName.replace(/\s*/g, "")) {
          //     item.area = key;
          //   }
          // });
        } else {
          //('none name  buildId:',key);
        }
        // 注意：移除了 return，让循环继续执行所有建筑
      }

      // 仅当不存在室内数据时，才添加户外数据
      this.mapPerson.push({
        key: "100",
        name: "户外",
        sumber: 0,
        persons: [], // 包含人员信息 ，卡号名称
      });
    },
    // 开启 websocket
    startWs() {
      let url = "";
      if (process.env.NODE_ENV === "development") {
        url = `${window.g.BASE_WS_DEV}location/${this.buildId}`;
      } else {
        url = `${window.g.BASE_WS_PRO}location/${this.buildId}`;
      }
      this.websocket = new WebSocket(url);
      let count = 5; // 5秒更新一次
      this.websocket.onmessage = (e) => {
        if (e.data !== "连接成功") {
          if (handleMarker?.personLayerVisiable) {
            this.allPersons = JSON.parse(e.data);
            handleMarker.updatePerson(this.allPersons, 1000);

            if (count >= 5 && !handleMarker.isTrack) {
              // 统一标记为室外 outdoor: true ,area 100
              for (let i = handleMarker.personMarkerList.length - 1; i >= 0; i--) {
                // 实时跟踪时不处理 室外判断
                handleMarker.personMarkerList[i].getProperties().set("outdoor", true);
              }

              // 更新室内人员  标记为室内  outdoor: false
              let indoorTotalPerson = 0;
              if (handleMarker.buildMarkerMap.size > 0) {
                for (const [key, value] of handleMarker.buildMarkerMap) {
                  //  存在没有名称的空建筑
                  if (value.marker && value.marker._name) {
                    // 使用 find 查找匹配的元素，确保类型匹配
                    const element = this.mapPerson.findIndex(
                      (el) => String(el.key) === String(key)
                    );

                    if (element > -1) {
                      // 人数
                      this.$set(
                        this.mapPerson[element],
                        "sumber",
                        value.sum || this.allPersons.length
                      );

                      this.buildingArea.find((item) => {
                        if (item.area === key) {
                          const list = handleMarker.areaPerson(item.position, key);
                          this.$set(this.mapPerson[element], "persons", list, key);
                        }
                      });
                    }
                  }
                }
              }

              // 户外人数
              // this.mapPerson.at(-1).sumber = this.allPersons.length - indoorTotalPerson;
              // // 清空上一次人员id
              // this.mapPerson.at(-1).persons = [];
              // handleMarker.personMarkerList.forEach((person) => {
              //   if (person.getProperties().get("outdoor")) {
              //     person.getProperties().set("area", "100");
              //     this.mapPerson.at(-1).persons.push({
              //       busType: person.getProperties().get("busType"),
              //       name: person.getProperties().get("name"),
              //       id: person.getProperties().get("id"),
              //       floorId: person.floorId,
              //     });
              //   }
              // });
              // 地图人员分布 , 更新到 2d this.mapPerson
              this.personObj = {
                id: "build-person",
                type: "PersonCar",
                name: "人员数量",
                data: this.mapPerson,
                other: {
                  peopleCount: 0,
                  carCount: 0,
                  items: this.allPersons,
                  areaName: "",
                },
              };
              // 车辆数量
              this.allPersons.forEach((person) => {
                if (person.busType === 2) {
                  this.personObj.other.carCount++;
                }
              });

              // 人员数量
              this.personObj.other.peopleCount =
                this.allPersons.length - this.personObj.other.carCount;

              this.$emit("mapClickTo2d", this.personObj);
              count = 0;
            }
            count++;
          }
        }
      };
    },
    // 关闭websocket
    // readyState 状态  0:正在建立连接,未完成. 1：连接成功建立,可以通信. 2：连接正在关闭，即将关闭. 3:连接已经关闭或或者根本没建立
    websocketClose() {
      if (this.websocket && this.websocket.close) {
        this.websocket.close();
      }
    },

    // 初始化 摄像头
    init_camera() {
      let temp, marker;
      this.allCameras.forEach((camera) => {
        if (camera.longitude && camera.latitude) {
          const floorId = Number.parseInt(JSON.parse(camera.geoInfo).properties.floorId);
          temp = {
            busType: 3,
            type: "camera",
            id: camera.id,
            text: camera.camName,
            position: {
              x: camera.longitude,
              y: camera.latitude,
              z: 10,
            },
            floorId,
            image: `${handleMarker.imagePath}camera01.png`,
            data: {
              name: camera.camName,
              channelId: camera.channelId,
              deviceId: camera.deviceId,
            },
            depthTest: false,
            show: true,
          };
          marker = handleMarker.addIconTextMarker(temp);
          handleMarker.imageMarkLayerCamera.addMarker(marker);
        }
      });
    },

    // 初始化 风险区域
    init_risk() {
      let temp, marker, optionText, textMarker, location;
      if (this.allRisks.length > 0) {
        const textConfig = handleMarker.shapeConfigDefault.find(
          (config) => config.id === "bs_text001"
        );
        for (let i = 0; i < this.allRisks.length > 0; i++) {
          if (JSON.stringify(this.allRisks[i].extInfo.areaOnMap) != "{}") {
            // temp = JSON.parse(this.allRisks[i].extInfo.areaOnMap)
            temp = this.allRisks[i].extInfo.areaOnMap;
            // 风险区域 是否有 id ，有 id 代表是完整风险区域。
            if (temp.id) {
              temp.id = this.allRisks[i].id;
              if (temp.hasOwnProperty("drawType") && temp.drawType === "risk-box") {
                marker = handleMarker.addRiskBox({
                  ...{ type: "risk-area-box1" },
                  ...temp,
                });

                location = this.createCenter(temp.position);
                // 盒子添加文字
                optionText = {
                  id: temp.id,
                  text: this.allRisks[i].name,
                  position: {
                    x: location.x,
                    y: location.y,
                    z: temp.stretchHeight + temp.height + 1,
                  },
                  floorId: temp.floorId,
                  // 室内
                  judgeInOrOutDoor: !!temp.hasOwnProperty("currBuildId"),
                  show: true,
                  shapeType: "text",
                  type: "occupation-disease",
                  color: textConfig.color,
                  outlineColor: textConfig.outlineColor,
                  outlineWidth: textConfig.outlineWidth,
                  display: { min: 0, max: 1500 },
                };
                textMarker = handleMarker.addMarkText(optionText);

                if (temp.hasOwnProperty("currBuildId")) {
                  // box 盒子室内
                  handleMarker.boxIndoorLayer.addMarker(marker);
                  // box 盒子室内 - 文字
                  handleMarker.boxIndoorTextLayer.addMarker(textMarker);
                } else {
                  // box 盒子室外
                  handleMarker.boxOutdoorLayer.addMarker(marker);
                  // box 盒子室外 - 文字
                  handleMarker.boxOutDoorTextLayer.addMarker(textMarker);
                }
              } else {
                //  模型 染色
                marker = handleMarker.addGroundBox({
                  ...{ type: "risk-area-box1" },
                  ...temp,
                });
                handleMarker.dyeingKeyLayer.addMarker(marker);
              }
              this.allShapes.push(marker);
            }
          }
        }
      }
    },

    // 初始化 重大危险源
    initial_dangerOrigin(dangerData) {
      for (let i = 0; i < dangerData.length; i++) {
        let level = 1;
        if (dangerData[i].hasOwnProperty("hazardLevel")) {
          level = dangerData[i].hazardLevel === "" ? "1" : dangerData[i].hazardLevel;
        }

        const imageOpention = {
          id: dangerData[i].id,
          position: {
            x: dangerData[i].location.x,
            y: dangerData[i].location.y,
            z: dangerData[i].location.z,
          },
          floorId: dangerData[i].hasOwnProperty("floorId") ? dangerData[i].floorId : 1, // 1 室外
          //  true 进行室内外判断，false 以室外处理，
          judgeInOrOutDoor: dangerData[i].hasOwnProperty("judgeInOrOutDoor")
            ? dangerData[i].judgeInOrOutDoor
            : false,
          image: `${handleMarker.imagePath}danger0${level}.png`,
          data: { name: dangerData[i].companyName },
          type: "hard-danger-origin",
          childType: undefined,
        };
        const imageMarker = handleMarker.addMarkImage(imageOpention);
        this.allShapes.push(imageMarker);
        handleMarker.imageMarkLayerDanger.addMarker(imageMarker);
      }
    },

    // 初始化重要危险源 type:'important-danger-origin'
    initial_ImportantDangerOrigin(dangerData) {
      for (let i = 0; i < dangerData.length; i++) {
        let location;
        if (dangerData[i].hasOwnProperty("location")) {
          location = {
            x: dangerData[i].location.x,
            y: dangerData[i].location.y,
            z: dangerData[i].location.z,
          };
        } else {
          location = {
            x:
              Math.random() * (111.39410904347191 - 111.39366977112631) +
              111.39366977112631,
            y:
              Math.random() * (30.65344807152954 - 30.65373867266956) + 30.65373867266956,
            z: 4.33,
          };
        }

        let hazardLevel = dangerData[i].hazardLevel ? dangerData[i].hazardLevel : 4;
        if (hazardLevel > 4 || hazardLevel < 1) {
          hazardLevel = 4;
        }

        const imageOpention = {
          id: dangerData[i].id,
          position: location, // location
          floorId: dangerData[i].location.hasOwnProperty("floorId")
            ? dangerData[i].location.floorId
            : 1, // 1 室外
          //  true 进行室内外判断，false 以室外处理，
          judgeInOrOutDoor: dangerData[i].location.hasOwnProperty("judgeInOrOutDoor")
            ? dangerData[i].location.judgeInOrOutDoor
            : false,
          image: `${handleMarker.imagePath}importantOrigin${hazardLevel}.png`,
          type: "important-danger-origin",
          data: {
            name: dangerData[i].unitName,
          },
        };
        const imageMarker = handleMarker.addMarkImage(imageOpention);
        handleMarker.imageMarkerLayerImportantDanger.addMarker(imageMarker);
        this.allShapes.push(imageMarker);
      }
    },

    // 职业病区域
    initial_occupationDisease(data) {
      const textConfig = handleMarker.shapeConfigDefault.find(
        (config) => config.id === "bs_text001"
      );
      let option, marker, optionText, textMarker, text;
      data.forEach((item) => {
        // area 对象是否存在，area 属性不能位空
        if (
          item.hasOwnProperty("location") &&
          item.location.hasOwnProperty("position") &&
          Object.keys(item.location.position).length > 0
        ) {
          // option = {...{type:'occupation-disease',id:item.id},...item.area};
          option = {
            id: item.id,
            type: "occupation-disease",
            // color:"#ffbf0160", //职业病因素分布图 统一使用橙色 #ffbf0160
            color: item.location.color,
            height: item.location.height,
            floorId: item.location.floorId,
            strokeColor: "#000",
            stretchHeight: item.location.stretchHeight,
            position: item.location.position,
          };
          marker = handleMarker.addMarkBox(option);
          this.allShapes.push(marker);
          handleMarker.occupationDiseaseLayer.addMarker(marker);

          // text
          // 处理换行
          text = item.typeName;
          /* if(item.harmFactor.length >= 9){
            for(let i = 0;i < item.occupationDiseaseType.length; i++){
              if(item.occupationDiseaseType[i] === '、'){
                text = item.occupationDiseaseType.substring(0,i+1)+'\n'+item.occupationDiseaseType.substring(i+1,item.occupationDiseaseType.length);
                break;
              }
            }
          } */
          const location = this.createCenter(item.location.position);
          optionText = {
            id: item.id,
            text,
            position: {
              x: location.x,
              y: location.y,
              z: item.location.stretchHeight + item.location.height + 1,
            },
            floorId: 1,
            judgeInOrOutDoor: false,
            show: true,
            shapeType: "text",
            type: "occupation-disease",
            color: textConfig.color,
            outlineColor: textConfig.outlineColor,
            outlineWidth: textConfig.outlineWidth,
            display: { min: 0, max: 1500 },
          };
          textMarker = handleMarker.addMarkText(optionText);
          handleMarker.occupationLayerText.addMarker(textMarker);
        }
      });
    },

    // 初始化 设备名称 text
    // initail_text(deviceData) {
    //   //设备名称标记 (text)
    //   let textData = deviceData.find((element) => element.type === 'text')
    //   if (textData) {
    //     let textConfig = handleMarker.shapeConfigDefault.find((config) => config.id === 'bs_text001')
    //     textData.data.forEach((item) => {
    //       let opention = {
    //         id: item.id,
    //         text: item.name,
    //         position: {
    //           x: item.x,
    //           y: item.y,
    //           z: item.z
    //         },
    //         floorId: 1,
    //         judgeInOrOutDoor: false,
    //         show: true,
    //         shapeType: 'text',
    //         type: 'text',
    //         color: item.hasOwnProperty('color') ? item.color : textConfig.color,
    //         outlineColor: item.hasOwnProperty('outlineColor') ? item.outlineColor : textConfig.outlineColor,
    //         outlineWidth: item.hasOwnProperty('outlineWidth') ? item.outlineWidth : textConfig.outlineWidth,
    //         display: item.hasOwnProperty('display') ? item.display : textConfig.display
    //       }
    //       let marker = handleMarker.addMarkText(opention)
    //       //this.allShapes.push(marker);
    //       handleMarker.labelMarkerLayer.addMarker(marker)
    //     })
    //   }
    // },

    // 人员定位业务
    // #region
    // 生成轨迹
    createTrackPath(opention) {
      // 是否需要再次清除
      if (handleMarker.trackMarker) {
        this.removeTrack();
      }
      const { trackData, id, name, floor, timestamp, type } = opention;
      const positions = [];

      trackData.forEach((item) => {
        positions.push({
          x: item.longitude,
          y: item.latitude,
          z: 2 || handleMarker.height,
          t: item.timestamp,
          floor:
            typeof item.floorNum === "string" && item.floorNum.startsWith("B")
              ? item.floorNum.replace(/^B/, "-")
              : item.floorNum,
        });
      });

      // 开始点
      const startPoint = handleMarker.addPoint({
        id: `start-ponit-${Math.random()
          .toString(36)
          .substr(2, 10)}${Math.random().toString(36).substr(2, 6)}`,
        color: "#0fa304",
        position: positions[0],
        floor: positions[0].floor,
        isDepth: true,
        judgeInOrOutDoor: true,
      });
      handleMarker.personTrackList.push(startPoint);
      this.mainMap.addMarker(startPoint);

      // 结束点
      const endPoint = handleMarker.addPoint({
        id: `end-ponit-${Math.random()
          .toString(36)
          .substr(2, 10)}${Math.random().toString(36).substr(2, 6)}`,
        position: positions.at(-1),
        floor: positions.at(-1).floor,
        color: "#ec0303fc",
        isDepth: true,
        judgeInOrOutDoor: true,
      });
      handleMarker.personTrackList.push(endPoint);
      this.mainMap.addMarker(endPoint);

      // 位置和时间戳
      handleMarker.trackIndex = 1;
      handleMarker.startIndex = handleMarker.trackIndex - 1;
      handleMarker.trackPositions = positions;

      // 开始的位置和时间
      handleMarker.startPosTime = handleMarker.trackPositions[0];
      handleMarker.totalTime =
        handleMarker.trackPositions.at(-1).t - handleMarker.trackPositions[0].t;
      handleMarker.trackSpeed = 1;
      // 设置初始播放为 false
      handleMarker.trackIsPlay = false;

      // 创建路径
      let number = 0;
      // 检查所有轨迹位置是否在同一个点，避免创建轨迹将报错问题
      for (let i = 1; i < positions.length; i++) {
        if (
          positions[i - 1].x === positions[i].x &&
          positions[i - 1].y === positions[i].y
        ) {
          number++;
        }
      }
      // 是否创建轨迹
      if (number != positions.length - 1) {
        const lineMarker = handleMarker.addLine({
          positions,
          floorId: floor,
          id: `line-marker-${Math.random()
            .toString(36)
            .substr(2, 10)}${Math.random().toString(36).substr(2, 6)}`,
          isDepth: true, // true使用深度 按实际高度显示， flase 轨迹可以漂在上面显示
          judgeInOrOutDoor: true,
        });
        handleMarker.personTrackList.push(lineMarker);
        this.mainMap.addMarker(lineMarker);

        // 视图定位
        // 是否在室内
        let isIndoor = false;
        if (positions[0].floor >= 1 || positions.at(-1).floor >= 1) {
          // 聚焦到室内
          this.mainMap.flyToMarker(lineMarker, {
            duration: 1000,
            offset: { rotate: 360, tilt: 60, range: 100 },
          });
          isIndoor = true;
        } else {
          // 聚焦到室外
          this.mainMap.flyToMarker(lineMarker, {
            duration: 1000,
          });
        }
        // 室内模型是否被打开
        if (!isIndoor) {
          for (const [key, value] of handleMarker.buildMarkerMap) {
            if (!value.marker._show) {
              // console.log(key,'进入室内:',value.marker._show);
              this.mainMap.flyToMarker(lineMarker, {
                duration: 200,
                offset: { rotate: 360, tilt: 60, range: 100 },
              });
              break;
            }
          }
        }

        // 所有轨迹位置在同一点上
      } else {
        // 视图位置
        this.mainMap.flyToMarker(startPoint, {
          duration: 1000,
          offset: { rotate: 360, tilt: 60, range: 100 },
        });
      }

      // 人员图标
      handleMarker.trackMarker = this.createDomMarker({
        type,
        name: name.length > 12 ? `${name.substr(0, 12)}...` : name,
        id,
        timestamp,
        position: positions[0],
        floorId: positions[0].floor,
        imageUrl: "./source/anhuan3d/workers01.png",
        depthTest: true,
        judgeInOrOutDoor: true,
      });
      this.mainMap.addMarker(handleMarker.trackMarker);

      // 关闭-其它图层显示
      this.toggleOtherLayer(false);
    },
    // 创建人员图 domMarker
    createDomMarker(option) {
      const { type, id, name, timestamp, position, floorId, imageUrl } = option;
      const domMarker = new jsmap.JSDomMarker({
        id,
        position, // 坐标
        floorId, // 楼层id,默认为1（地面）
        pointerEvents: "none",
        depthTest: true, //是否开启深度检测
        show: true,
        judgeInOrOutDoor: true,
        content: `<div id="track-marker" style="display: flex; flex-direction: column; align-items: center; width: auto; height: 46px; color: white;">
              <span style="font-size:14px; font-weight:bold; text-align:center;">${name}</span>
              <img src=${imageUrl} style="width: 32px; height: 32px;">
            </div>`,
        offset: jsmap.JSControlPosition.CENTER_BOTTOM,
        // marginOffset: {x: 0,y: 0},
        properties: { type, name }, // 属性设置
        // 回调事件
        // callback: (node) => {console.log(node);}
      });
      return domMarker;
    },

    // 先移除再创建新的人员标记 （暂停 / 播放 ）
    removeRenewCreateMarker(percent) {
      const currTime =
        handleMarker.trackPositions[0].t +
        (handleMarker.trackPositions.at(-1).t - handleMarker.trackPositions[0].t) *
          (percent / 100);
      const posTime = {
        x: handleMarker.trackMarker.position.x,
        y: handleMarker.trackMarker.position.y,
        z: handleMarker.trackMarker.position.z,
        t: currTime,
      };

      const iconTextOption = {
        type: handleMarker.trackMarker.getProperties().get("type"),
        name: handleMarker.trackMarker.getProperties().get("name"),
        id: handleMarker.trackMarker.id,
        timestamp: posTime.t,
        position: posTime,
        floorId: handleMarker.trackMarker.floorId,
        imageUrl: "source/anhuan3d/workers01.png",
        depthTest: handleMarker.trackMarker.depthTest,
        judgeInOrOutDoor: handleMarker.trackMarker.judgeInOrOutDoor,
      };

      // 清除跟踪
      this.cancelTrack();
      // 清除人员标记
      this.mainMap.removeMarker(handleMarker.trackMarker);
      // 移除DomMarker 人员标记
      this.mainMap.removeAllDomMarker();
      // 清空 marker
      handleMarker.trackMarker = undefined;

      // 再次创建人员标记
      handleMarker.trackMarker = this.createDomMarker(iconTextOption);
      this.mainMap.addMarker(handleMarker.trackMarker);
    },

    // 控制轨迹动画播放/停止
    trackAaimateControl(isPlay) {
      handleMarker.trackIsPlay = isPlay;
      if (isPlay) {
        // 视图位置
        if (this.$refs.trackPlay.isTrackCheckbox) {
          this.mainMap.flyToMarker(handleMarker.trackMarker, {
            duration: 1000,
            offset: { rotate: 360, tilt: 60, range: 100 },
          });
        }

        // 开始时间和位置
        handleMarker.startPosTime = {
          x: handleMarker.trackMarker.position.x,
          y: handleMarker.trackMarker.position.y,
          z: handleMarker.trackMarker.position.z,
          t:
            handleMarker.trackPositions[0].t +
            (handleMarker.trackPositions.at(-1).t - handleMarker.trackPositions[0].t) *
              (this.percentage / 100),
        };

        if (handleMarker.trackIndex <= handleMarker.trackPositions.length - 1) {
          this.trackAnimate(
            handleMarker.startPosTime,
            handleMarker.trackPositions[handleMarker.trackIndex]
          );
        }
      } else {
        // 清除timeout
        clearInterval(this.intervalTimeout);
        // 移除后重新创建图标
        this.removeRenewCreateMarker(this.percent);
      }
    },
    // 移除轨迹-恢复人员定位
    removeTrack() {
      clearInterval(this.intervalTimeout);
      // 清除跟踪
      this.cancelTrack();

      this.mainMap.removeMarker(handleMarker.trackMarker);
      // 移除DomMarker 人员标记
      // this.mainMap.removeAllDomMarker();
      // 清除轨迹-其它元素
      for (let i = handleMarker.personTrackList.length - 1; i >= 0; i--) {
        this.mainMap.removeMarker(handleMarker.personTrackList[i]);
      }
      this.toggleOtherLayer(true);

      // 启用人车按钮点击 ( 关闭轨迹播放控制UI ，启用人车按钮点击)UI
      const obj = {
        id: "PersonCar-colseTrack", // id
        tyeo: "PersonCar", // 人员定位组件
        name: "关闭播放轨迹播放UI",
      };
      this.mapClickTo2d(obj.id, obj.type, obj.name);
    },
    // trackSpeed 轨迹速度
    setTrackSpeed(speed) {
      handleMarker.trackSpeed = speed;
    },

    // 播放轨迹时 设置视图跟踪
    playingTrack() {
      // 视图跟踪 开始跟踪
      this.mainMap.trackMarker(handleMarker.trackMarker, {
        range: 40,
        tilt: 60, // 60
        rotate: 360, //
      });
    },

    // 历史轨迹动画  位置相同不执行，室内外切换不执行
    trackAnimate(startPos, nextPos) {
      // 是否有定时器
      if (this.intervalTimeout != null) {
        clearInterval(this.intervalTimeout);
        this.intervalTimeout = null;
      }
      if (handleMarker.trackPositions.length < 2 || this.percentage == 100) return;

      // 播放时的默认时间
      let duration = 100;
      // 播放的毫秒累计时间
      let progressTeime = 0;

      // 目标位置-当前位置=时间长度
      duration = nextPos.t - startPos.t;
      //(' 时间长度:',duration);

      // 使用路径动画
      this.mainMap.updateMarkerPosition(handleMarker.trackMarker, {
        position: nextPos, // nextPos
        floorId: nextPos.floor,
        animate: {
          duration: duration / handleMarker.trackSpeed,
          begin: () => {
            if (this.$refs.trackPlay.isTrackCheckbox) {
              this.playingTrack();
            }
            // 不是室内外切换
            //(handleMarker.trackIndex,'time:',this.$refs.trackPlay.formatTime(nextPos.t),' percent:',this.percentage);
          },
          complete: () => {
            // 清除跟踪
            this.cancelTrack();
            // 视图位置  是否执行跟踪
            if (this.$refs.trackPlay.isTrackCheckbox) {
              this.mainMap.flyToMarker(handleMarker.trackMarker, {
                duration: 500,
                offset: { rotate: 360, tilt: 60, range: 40 },
              });
            }
          },
          // update: (pos) => {}
        },
      });
      // 无动画原地位置
      this.intervalTimeout = setInterval(() => {
        // if (startPos.x === nextPos.x && startPos.y === nextPos.y) {
        // 更新动画进度
        // 10， 25，50 毫秒计算一次
        progressTeime += 50 * handleMarker.trackSpeed;
        if (progressTeime >= duration) {
          progressTeime = duration;
          clearInterval(this.intervalTimeout);
          // 继续执行下一个动画
          this.contiuneNextAnimation();
          //(handleMarker.trackIndex,'time:',this.$refs.trackPlay.formatTime(nextPos.t),' percent:',this.percentage);
        }
        // 实时计算平滑进度条
        this.countProgress(progressTeime, startPos.t);
        // }
      }, 50);
    },
    // 计算进度
    countProgress(progressTeime, currTime) {
      if (this.percentage <= 100) {
        //(handleMarker.trackIndex,'time:',this.$refs.trackPlay.formatTime(handleMarker.trackPositions[handleMarker.trackIndex].t),' percent:',this.percent);
        // [ 0到当前位置  + 当前位置秒数（0-N毫秒）  ] / 总长度
        this.percentage =
          ((currTime + progressTeime - handleMarker.trackPositions[0].t) /
            handleMarker.totalTime) *
          100;
        if (handleMarker.trackIsPlay) {
          this.percent = this.percentage;
        }
      }
    },
    // 继续执行下一个位置动画
    contiuneNextAnimation() {
      handleMarker.startIndex = handleMarker.trackIndex;
      if (handleMarker.trackIndex < handleMarker.trackPositions.length - 1) {
        if (handleMarker.trackIsPlay) {
          // 播放模式
          handleMarker.trackIndex++;
          handleMarker.startPosTime = {
            x: handleMarker.trackMarker.position.x,
            y: handleMarker.trackMarker.position.y,
            z: handleMarker.trackMarker.position.z,
            t:
              handleMarker.trackPositions[0].t +
              (handleMarker.trackPositions.at(-1).t - handleMarker.trackPositions[0].t) *
                (this.percentage / 100),
          };

          this.trackAnimate(
            handleMarker.startPosTime,
            handleMarker.trackPositions[handleMarker.trackIndex]
          );
        }
      } else if (
        handleMarker.trackIsPlay &&
        handleMarker.trackIndex === handleMarker.trackPositions.length - 1
      ) {
        this.percentage = 100;
        this.percent = this.percentage;
      }
    },

    // 拖拽进度控制
    // 54 'time:' '2023-05-25 15:01:37' ' percent:' 8.42911877394636
    // 时间长度: 595000
    // 55 'time:' '2023-05-25 15:11:32' ' percent:' 8.492975734355044
    drawingPercent(value, currentTime, direction) {
      if (this.isDrawing) {
        // index通过百分比计算 ，但不能直接使用 ，数组元素时间长短不一致 ，中间有问题， 开头和结尾一致
        handleMarker.trackIndex = Math.ceil(
          ((handleMarker.trackPositions.length - 1) * value) / 100
        );
      }
      // 正向
      if (direction) {
        // 是否可以拖动进度
        if (handleMarker.trackIndex - handleMarker.startIndex > 1) {
          this.isDrawing = false;
        }

        // 触发动画
        if (handleMarker.startIndex < handleMarker.trackIndex) {
          for (let i = handleMarker.startIndex; i <= handleMarker.trackIndex; i++) {
            //(handleMarker.startIndex,'正向 index:',handleMarker.trackIndex,'i:',i,' value:',value);

            // 保持相差 0 - 1
            if (i - handleMarker.startIndex <= 1) {
              if (handleMarker.startIndex != i) {
                // 无动画 (坐标相等)
                if (
                  handleMarker.trackMarker.position.x ===
                    handleMarker.trackPositions[i].x &&
                  handleMarker.trackMarker.position.y === handleMarker.trackPositions[i].y
                ) {
                  //(handleMarker.startIndex,'正向-相等 index:',handleMarker.trackIndex,' value:',value);
                  handleMarker.startIndex = i;
                  this.isDrawing = true;
                } else {
                  //(handleMarker.startIndex,'正向-不等 index:',handleMarker.trackIndex,' value:',value);
                  this.drawingPercentPlayer(
                    handleMarker.trackMarker,
                    handleMarker.trackPositions[i]
                  );
                  // handleMarker.startIndex = i == handleMarker.startIndex++
                }
              } else {
              }
            } else {
              break;
            }
          }
        }
      } else {
        // 反向
        // 1. 拖动true   轴向： 拖动到反向  跟随：handleMarker.startIndex = 33 , 目标：handleMarker.trackIndex = 55
        // 2. 拖动true   轴向： 目标 handleMarker.trackIndex = 32， 跟随：handleMarker.startIndex = 33
        if (
          handleMarker.trackIndex - handleMarker.startIndex > 1 ||
          handleMarker.startIndex - handleMarker.trackIndex <= 1
        ) {
          this.isDrawing = true;
        } else {
          this.isDrawing = false;
        }

        //(handleMarker.trackIndex,'start index:',handleMarker.startIndex);

        // 触发动画
        if (handleMarker.startIndex > handleMarker.trackIndex) {
          for (let i = handleMarker.startIndex; i > handleMarker.trackIndex; i--) {
            //(handleMarker.startIndex,'反向 index:',handleMarker.trackIndex,'i:',i,' value:',value);
            // 保持相差 0 - 1
            if (handleMarker.startIndex - i <= 1) {
              // 相同值不能重复执行
              if (handleMarker.startIndex != i) {
                // 无动画 (坐标相等)
                if (
                  handleMarker.trackMarker.position.x ===
                    handleMarker.trackPositions[i].x &&
                  handleMarker.trackMarker.position.y === handleMarker.trackPositions[i].y
                ) {
                  //(handleMarker.startIndex,'反向-相等 index:',handleMarker.trackIndex,' value:',value);
                  handleMarker.startIndex = i;
                  this.isDrawing = true;
                } else {
                  //(handleMarker.startIndex,'反向-不等 index:',handleMarker.trackIndex,' value:',value);
                  this.drawingPercentPlayer(
                    handleMarker.trackMarker,
                    handleMarker.trackPositions[i]
                  );
                  // handleMarker.startIndex = i == handleMarker.startIndex --;
                  // handleMarker.startIndex --;
                  // this.isDrawing = true;
                }
              } else {
                this.isDrawing = true;
              }
            } else {
              break;
            }
          }
        }
      }

      // 设置视图，
      if (handleMarker.trackMarker) {
        // 暂停播放 ： 清楚timeout,设置按钮状态、 移除图标再次生成图标，
        this.$refs.trackPlay.pauseTrackPlay();
        // 记录进度到播放功能
        this.percentage = value;
        this.percent = value;
        if (this.$refs.trackPlay.isTrackCheckbox) {
          this.mainMap.flyToMarker(handleMarker.trackMarker, {
            duration: 0,
            offset: { range: 40, tilt: 60, rotate: 310 },
          });
        }
      }
    },

    // 拖拽播放 和 点击播放 并用
    drawingPercentPlayer(marker, position) {
      // 是否拖动
      this.isDrawing = false;

      // 持续时间 拖动使用固定时间  //默认 50-100毫秒
      const durationTime = 0; // 1000/32
      // 位置更新方法
      this.mainMap.updateMarkerPosition(marker, {
        position,
        animate: {
          duration: durationTime,
          begin: () => {
            // 视图跟踪
            if (this.$refs.trackPlay.isTrackCheckbox) {
              this.mainMap.trackMarker(handleMarker.trackMarker, {
                range: 40,
                tilt: 60, // 60
                rotate: 360, //
              });
            }
          },
          complete: () => {
            // 清除跟踪
            this.cancelTrack();
            // 视图位置
            if (this.$refs.trackPlay.isTrackCheckbox) {
              this.mainMap.flyToMarker(handleMarker.trackMarker, {
                duration: 0,
                offset: { rotate: 360, tilt: 60, range: 40 },
              });
            }

            // 正向 ++
            if (handleMarker.startIndex < handleMarker.trackIndex) {
              handleMarker.startIndex++;
            } else {
              handleMarker.startIndex--;
            }
            this.isDrawing = true;
          },
          update: (pos) => {},
        },
      });
    },

    // 关闭清除历史轨迹
    closeHistoryTrack() {
      if (this.$refs.trackPlay.visable) {
        // 关闭历史轨迹
        this.$refs.trackPlay.closeHistoryTrack();
      }
    },

    // 右侧菜单开启和关闭
    menuOpenAndColse(isClose) {
      // 显示子级左侧菜单
      this.$store.dispatch("newMaterial/leftHide", isClose);
      // 显示子级右侧菜单
      this.$store.dispatch("newMaterial/rightHide", isClose);
    },

    // 开始人员跟踪
    startPersonTrack(cardCode) {
      const marker = handleMarker.personMarkerList.find(
        (person) => person.id === cardCode
      );
      if (marker) {
        // 关闭人员图层
        for (let i = 0; i < handleMarker.personMarkerList.length; i++) {
          handleMarker.personMarkerList[i].show = false;
        }
        marker.show = true;
        // 标记为 正在实时跟踪
        handleMarker.isTrack = true;

        // 位置
        this.mainMap.flyToMarker(marker, {
          duration: 1000,
        });

        // 跟踪 offset:{rotate: 360, tilt: 45, range: 200}
        this.mainMap.trackMarker(marker, {
          range: 40,
          tilt: 45, // 60
          rotate: 360,
        });
      }
    },
    // 取消人员跟踪
    cancelPersonTrack(obj) {
      // 取消人员跟踪
      this.cancelTrack();
      // 标记为  取消人员跟踪
      handleMarker.isTrack = false;
    },
    // 清楚跟踪 统一调用
    cancelTrack() {
      this.mainMap.cancelTrack();
    },

    // #endregion

    // public  公共业务

    // 地图点击事件
    mapTap(e) {
      // 风险区域
      if (e.nodeType && this.recordComponentName === "RiskArea") {
        // 标记类型  nodeType = e.nodeType.description;
        if (
          e.nodeType.description === "buildingmaker" ||
          e.nodeType.description === "3dTile"
        ) {
          const currBuildId = e["mapBuildingId"];

          // 当前点击选择的建筑id
          // this.mainMap._map.focusFloorId
          if (currBuildId) {
            this.clickBuildMark = handleMarker.buildMarkerMap.get(
              currBuildId.toString()
            )?.marker;
          }
        }
      } else {
        // this.clickBuildMark = null;
      }

      if (!e.properties) {
        // nodeType
        // this.$store.dispatch('newMaterial/isPers', false)
        this.$parent.isPers = false;
        return;
      }

      const curPt = Object.fromEntries(e.properties);
      // 人
      if (curPt.type === "person") {
        this.$store.dispatch("newMaterial/rightHide", false);
        // this.$store.dispatch('newMaterial/isPers', true)
        // this.$store.dispatch('newMaterial/curPer', curPt)
        this.$parent.isPers = true;
        this.$parent.curPerson = curPt;

        // 查询所在区域其他人车
        const params = {
          buildId: this.buildId,
          searchNear: 1,
          cardCode: [curPt.cardCode],
        };
        // 通过地图更新父级级公共数据
        this.$emit("upPublicDataByMap", {
          name: "areaPersonCarCameraData",
          params,
        });
        // this.$store.dispatch('newMaterial/mapTo2dPublicData', params)
      } else if (curPt.type === "fire-device") {
        // 消防管理
        this.setHighlightMarker({
          position: e.markers[0]._position,
          floorId: e.markers[0].floorId,
          judgeInOrOutDoor: e.markers[0].judgeInOrOutDoor,
        });
        this.mapClickTo2d(curPt.id, curPt.type, curPt.name);
      } else if (
        curPt.type === "general_operate" ||
        curPt.type === "height_operate" ||
        curPt.type === "temp_operate" ||
        curPt.type === "fire_operate"
      ) {
        // 作业安全
        this.setHighlightMarker({
          position: e.markers[0]._position,
          floorId: e.markers[0].floorId,
          judgeInOrOutDoor: false,
        });
        this.mapClickTo2d(curPt.id, curPt.type, curPt.name);
      } else if (curPt.type === "important-danger-origin") {
        // 重要危险源
        this.setHighlightMarker({
          position: e.markers[0]._position,
          floorId: e.markers[0].floorId,
          judgeInOrOutDoor: false,
        });
        this.mapClickTo2d(curPt.id, curPt.type, curPt.name);
      } else if (curPt.type === "risk-area-box1" || curPt.type === "occupation-disease") {
        this.mapClickTo2d(curPt.id, curPt.type, curPt.name);
      }

      // 摄像头
      if (curPt.type === "camera") {
        // this.videoUrl = 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8';
        this.dialog_vid = true;
        videoPlayById(curPt.channelId, curPt.deviceId)
          .then(({ data }) => {
            if (data.code === 200 && data.result) {
              // 读取的是m3u8格式的，用livePlayer播放器
              // this.videoUrl = data.result.hls;

              // 读取的是flv格式的，用JessibucaPlayer播放器
              if (window.g.IS_HTTPS) {
                this.videoUrl = data.result.https_flv;
              } else {
                this.videoUrl = data.result.flv;
              }
            } else {
              this.$message.error(data.message || "请求失败!");
            }
          })
          .catch((err) => {
            this.$message.error(err || "请求失败!");
          });
      }

      // 获取视图 视图中心
    },

    // 地图点击到2d
    mapClickTo2d(id, type, name) {
      const makerObj = { id, type, name };
      // 地图点击 到 2d
      this.$emit("mapClickTo2d", makerObj);
    },

    // 点击 定位到 地图标记
    locateTo3dIcon(obj) {
      this.judgeInOrOutDoor = true;
      const { id, type } = obj;
      if (this.allShapes != undefined) {
        // 人员定位
        if (this.recordComponentName === "PersonCar") {
          if (handleMarker) {
            this.currDangerIcon = handleMarker.personMarkerList.find(
              (person) => person.id === id
            );
            // 使用室内判断
            this.judgeInOrOutDoor = true;
          }
          // 定位到建筑区域
          if (type === "area") {
            // 创建室内三维区域 ，使用临时创建 boxMarker
            if (handleMarker.currBuildArea) {
              this.mainMap.removeMarker(handleMarker.currBuildArea);
              handleMarker.currBuildArea = undefined;
            }

            // if (id === '100') {
            // let center = {
            // center: { x: 109.7209133728, y: 36.6993940150973, z: 4.637229619312512 },
            // distance: 1084,
            // rotate: 360,
            // tilt: 360
            // center: { x: 111.39603647339662, y: 30.655492236202182, z: 13.021012250130669 },
            // distance: 1042.8503545962187,
            // rotate: 2,
            // tilt: 58
            // }
            // this.mainMap.flyToPosition(
            //   { x: center.center.x, y: center.center.y, z: center.center.z },
            //   {
            //     duration: 1000,
            //     offset: {
            //       rotate: 360 - center.rotate, //45
            //       tilt: center.tilt, //60
            //       range: center.distance // 距离
            //     }
            //   }
            // )
            // } else {
            this.buildingArea.find((item) => {
              console.log(item.area, item, "area");
              if (item.area === id) {
                if (Object.prototype.hasOwnProperty.call(item, "view")) {
                  // 自定义视图
                  this.mainMap.setView(item.view);
                } else {
                  // 室内盒子  创建box
                  const option = {
                    ...{ type: "buildArea", floorId: 1, show: false },
                    ...item,
                  };
                  handleMarker.currBuildArea = handleMarker.addMarkBox(option);
                  this.mainMap.addMarker(handleMarker.currBuildArea);
                  this.mainMap.flyToMarker(handleMarker.currBuildArea, {
                    duration: 1000,
                  });
                }
                // 解决 flyToMarker和 this.mapTool.mapToScreenCoordinate 同时执行报错问题
                /* setTimeout( () => {
                    // 计算边界
                    let position = [];
                    item.position.forEach( pos => {
                      position.push([pos.x, pos.y]);
                    })

                    // 计算polygon 中心  注意：polygon首尾坐标要一致
                    var polygon = turf.polygon([position]);
                    var center = turf.centerOfMass(polygon);
                    console.log('polygon 中心:',center.geometry.coordinates);
                    console.log('x-y:',this.mapTool.mapToScreenCoordinate({x: center.geometry.coordinates[0],y: center.geometry.coordinates[1]}));
                    console.log('3d div: width:',this.$refs.map_newMaterial.clientWidth+" height:",this.$refs.map_newMaterial.clientHeight);
                    let line = turf.lineString(position);
                    let bbox = turf.bbox(line);
                    var bboxPolygon = turf.bboxPolygon(bbox);
                    bbox :[minX, minY, maxX, maxY]
                    console.log('mnX-minY:',this.mapTool.mapToScreenCoordinate({x: parseFloat(bboxPolygon.bbox[2]) ,y: parseFloat(bboxPolygon.bbox[3])}));
                    console.log(' maxX-maxY:',this.mapTool.mapToScreenCoordinate({x: parseFloat(bboxPolygon.bbox[0]) ,y: parseFloat(bboxPolygon.bbox[1])}));
                    console.log('3d div: width:',this.$refs.map_newMaterial.clientWidth+" height:",this.$refs.map_newMaterial.clientHeight);

                  },300) */
              }
            });
            // }
          }
        } else if (this.recordComponentName === "ImportantDangerOrigin") {
          this.currDangerIcon = this.allShapes.find((shape) => shape.id === id);
          // 是否不使用室内判断
          this.judgeInOrOutDoor = this.currDangerIcon._judgeInOrOutDoor;
        } else if (this.recordComponentName === "FireProtection") {
          // 消防
          this.currDangerIcon = this.allShapes.find((shape) => shape.id === id);
          // 是否不使用室内判断
          this.judgeInOrOutDoor = this.currDangerIcon._judgeInOrOutDoor;
        } else {
          this.currDangerIcon = this.allShapes.find((shape) => shape.id === id);
        }

        if (this.currDangerIcon) {
          let type;
          if (this.currDangerIcon != undefined) {
            type = this.currDangerIcon.getProperties().get("type");
          }

          // 风险区域
          if (type === "risk-area-box1") {
            const currBuildId = this.currDangerIcon.getProperties().get("currBuildId");

            if (currBuildId) {
              this.clickBuildMark = handleMarker.buildMarkerMap.get(
                currBuildId.toString()
              ).marker;
              // polygong 室内
              this.mainMap.flyToMarker(this.currDangerIcon, {
                // !!  150 =360-获取视图210, titlt = titlt
                // rotate: 360 完全指北   tilt:45度下看   tilt:360 完全顶视图  // 距离 range
                offset: { rotate: 360, tilt: 45, range: 60 },
              });
            } else {
              // polygong 视图区域
              this.mainMap.flyToMarker(this.currDangerIcon, {
                // !!  150 =360-获取视图210, titlt = titlt
                // offset:{rotate: 209, tilt: 55, range: 200}
                // 2023/4/12
                // rotate: 360 完全指北   tilt:45度下看   tilt:360 完全顶视图
                // offset:{rotate: 360, tilt: 45, range: distance}
              });
            }

            // 职业病因素区域
          } else if (type === "occupation-disease") {
            // polygong 2d视图区域
            this.mainMap.flyToMarker(this.currDangerIcon, {
              // !!  150 =360-获取视图210, titlt = titlt
              // rotate: 360 完全指北   tilt:45度下看   tilt:360 完全顶视图
              offset: { rotate: 360, tilt: 360, range: 300 }, // 200
            });
            /* let position = {"x":111.39574727238754,"y":30.65656773842838,"z":18.95458444479347};
              this.mainMap.flyToPosition (position,{
              offset:{rotate: 360,tilt: 360,range: 200}
            }) */
            // 电子围栏
          } else if (type === "electronic-fence") {
            // 作用安全 隐藏未选择的电子围栏
            this.singleMarkerShow("electronic-fence", id, [
              handleMarker.lineLayer,
              handleMarker.polygonLayer,
              handleMarker.specialOperationLayer,
            ]);
            this.mainMap.flyToMarker(this.currDangerIcon, {
              offset: { rotate: 360, tilt: 45, range: 400 },
            });
          } else {
            // 定位到楼层内图标
            this.mainMap.trackMarker(this.currDangerIcon, {
              range: 100, // 距离 200 /40
              tilt: 45,
              rotate: 360,
            });
            // 取消跟踪,定位到室内图标后取消
            this.cancelTrack();

            // 设置增加高亮
            if (this.recordComponentName != "PersonCar") {
              this.setHighlightMarker({
                id: "icon-highlight",
                type: "icon-highlight",
                position: this.currDangerIcon.position,
                floorId: this.currDangerIcon.floorId,
                judgeInOrOutDoor: this.judgeInOrOutDoor,
              });
            }
          }
        }
      }
    },

    // 设置高亮 _judgeInOrOutDoor
    setHighlightMarker(option) {
      this.addHighlightMarker(option);
      // 设置位置  标记与高亮有偏差委托
      /* if ( this.highlightMarker && this.highlightMarker.judgeInOrOutDoor === this.currDangerIcon.judgeInOrOutDoor && this.highlightMarker.floorId === option.floorId){
        this.highlightMarker.show = true;
        //this.highlightMarker.setPosition({x: option.position.x, y: option.position.y, z: option.position.z})
        this.highlightMarker.position.x = option.position.x;
        this.highlightMarker.position.y = option.position.y;
        this.highlightMarker.position.z = option.position.z;
        //this.highlightMarker.getProperties().set('type',option.type);
      } else {
        this.addHighlightMarker(option);
      } */
    },
    // 高亮特效
    addHighlightMarker(option) {
      // 创建高亮对象 / 重新创建高亮对象
      if (this.highlightMarker) {
        this.mainMap.removeMarker(this.highlightMarker);
        this.highlightMarker = undefined;
      }
      // 点问题 偏离中心
      const { position, floorId, judgeInOrOutDoor } = option;
      this.highlightMarker = new jsmap.JSImageMarker({
        id: option.id,
        image: `${handleMarker.imagePath}highlight.png`,
        position, // 坐标
        width: 32,
        height: 32,
        floorId: judgeInOrOutDoor ? floorId : 1, // 默认1 楼层id
        // 是否室内外判断，默认启用楼层 true ， 或略楼层 false
        judgeInOrOutDoor,
        // 中心 jsmap.JSControlPosition.CENTER
        offset: jsmap.JSControlPosition.CENTER_BOTTOM,
        allowPicking: false, // 是否允许点击
        displayCondition: new jsmap.JSDisplayCondition(0, 600), // 可见范围
        depthTest: false, // 是否开启深度检测
        show: true, // 是否显示
        properties: {
          type: option.type,
          id: option.id,
        },
      });
      this.mainMap.addMarker(this.highlightMarker);
    },

    // 高亮特效点
    addPointMarker(position) {
      this.highlightMarker = new jsmap.JSPointMarker({
        id: "point-001",
        color: "#5daf3400", // 透明80:#0fa30480 透明40#5daf3440  //#0fa304
        size: 40, // 尺寸
        // width: 32,
        // height: 32,
        position, // 坐标
        floorId: 1, // 楼层id,默认为1（室外）
        outlineColor: "#0fa304", // 边线颜色
        outlineWidth: 2, // 边线宽
        depthTest: false, // 是否开启深度检测
        show: true, // 是否显示
        allowPicking: true, // 是否允许点击
        displayCondition: new jsmap.JSDisplayCondition(0.0, 600), // 可见范围
        /* properties: {
                      type: undefined,
                      id,
                  } */
      });
      this.mainMap.addMarker(this.highlightMarker);
      this.initMap();
    },

    // 图层控制
    // #region  public map3d
    forceShowFloors() {
      this.mainMap.showBuildingMarker = true;
      this.mainMap.buildingSelected = true;
      const floorLayer = this.layerList.find((i) => i.id === "build-level-01");
      if (floorLayer) floorLayer.enable = true;
    },
    // 导航栏方法-切换组件
    navigation3dMethod(navObj) {
      this.currMenuId = navObj.id;

      // 统一关闭图层
      for (let i = 0; i < this.layerList.length; i++) {
        // chcedbox
        this.layerList[i].enable = false;
        // 3d layer
        this.controllLayer3d(this.layerList[i].id, false);
      }

      // 显示模块 下图层
      this.menuList.find((menu) => {
        // 当前图层
        if (menu.id === navObj.id) {
          menu.incudeLayer.forEach((layer) => {
            this.layerList.find((item) => {
              if (item.id === layer.id && layer.enable) {
                item.enable = layer.enable;
                this.controllLayer3d(item.id, layer.enable);
              }
            });
          });
        }
      });

      // 视图展示中心菜单
      // this.$refs.viewer_menu.style.display = 'block';  // 'none';

      // 隐藏高亮标记
      if (this.highlightMarker != undefined) {
        this.highlightMarker.show = false;
      }

      //  人员定位 websocket
      // if (navObj.componentName === 'PersonCar') {}
      this.layerList.find((layer) => {
        if (layer.id === "location-per01") {
          if (layer.enable) {
            if (!this.websocket || this.websocket.readyState != 1) {
              this.startWs();
            }
          } else {
            this.websocketClose();
            this.mainMap.removeControl();
          }
        }
      });

      // 2d / 3d  视图   2d视图( 职业病因素分布图 occupation-disease )
      if (navObj.componentName === "OccupationDisease") {
        this.setCurrView(this.view2d_top);
      } else {
        // 表达式匹配 'view3d'
        // let regex = new RegExp("view3d", "g");
        // // 判断当前视图ID是否匹配正则表达式
        // if (!this.currViewerId || !this.currViewerId.match(regex)) {
        // 不包含  view3d 以免多次执行
        this.setCurrView(this.view3d);
        // }
      }

      // 记录当前的组件
      this.recordComponentName = navObj.componentName;
    },

    // 导航栏图层控制
    controllLayer3d(layer_id, isVisiable) {
      // 控制图层的 显示/隐藏
      if (layer_id === "location-per01") {
        // 人员定位
        handleMarker.personLayerVisiable = isVisiable;
        this.personVisiable(isVisiable);
      } else if (layer_id === "camera-icon-01") {
        // 摄像头
        handleMarker.imageMarkLayerCamera.show = isVisiable;
      } else if (layer_id === "risk-area-box1") {
        // 风险区域
        handleMarker.boxIndoorLayer.show = isVisiable;
        handleMarker.boxIndoorTextLayer.show = isVisiable;
        handleMarker.boxOutdoorLayer.show = isVisiable;
        handleMarker.boxOutDoorTextLayer.show = isVisiable;
        handleMarker.dyeingKeyLayer.show = isVisiable;
      } else if (layer_id === "hard-danger-origin") {
        // 重大危险源
        if (handleMarker.imageMarkLayerDanger) {
          handleMarker.imageMarkLayerDanger.show = isVisiable;
        }
      } else if (layer_id === "important-danger-origin") {
        // 重要危险源
        handleMarker.imageMarkerLayerImportantDanger.show = isVisiable;
      } else if (layer_id === "text-name-0001") {
        // 设备名称
        handleMarker.labelMarkerLayer.show = isVisiable;
      } else if (layer_id === "build-level-01") {
        // 楼层图标
        this.mainMap.showBuildingMarker = isVisiable;
        this.mainMap.buildingSelected = isVisiable;
      } else if (layer_id === "map-bottom-001") {
        // 显示地图
        this.mainMap.showGlobe = isVisiable;
      } else if (layer_id === "fire-device") {
        // 消防管理 ( 消防设备 )
        handleMarker.smokeMarkerLayer.show = isVisiable;
      } else if (layer_id === "electronic-fence") {
        // 作业安全 （特殊作用）
        // 电子围栏 - 线
        handleMarker.lineLayer.show = isVisiable;
        // 电子围栏 - 面
        handleMarker.polygonLayer.show = isVisiable;
        // 电子围栏 - 中心标记
        handleMarker.specialOperationLayer.show = isVisiable;
        // 显示类型下图标
        // this.allMarkerShowAndHide('electronic-fence',isVisiable);
      } else if (layer_id === "occupation-disease") {
        // 职业病因素区域-box
        handleMarker.occupationDiseaseLayer.show = isVisiable;
        handleMarker.occupationLayerText.show = isVisiable;
      }
    },
    // 人员图层的显示
    personVisiable(isVisiable) {
      for (let i = 0; i < handleMarker.personMarkerList.length; i++) {
        handleMarker.personMarkerList[i].show = isVisiable;
      }
    },

    // 进入室内控制  风险区域染色显示隐藏   室外：true ，是内 false
    riskAreaIndoor(isVisiable) {
      if (isVisiable != undefined && this.recordComponentName === "RiskArea") {
        handleMarker.dyeingKeyLayer.show = isVisiable;
        handleMarker.boxOutdoorLayer.show = isVisiable;
        handleMarker.boxOutDoorTextLayer.show = isVisiable;
      }
    },

    // 控制某个图层的标记下的标记：显示/隐藏
    allMarkerShowAndHide(type, isVisiable) {
      this.allShapes.forEach((marker) => {
        if (marker.getProperties().get("type") === type) {
          marker.show = isVisiable;
        }
      });
    },
    // 显示单个图标
    singleMarkerShow(type, id, markerLayerList) {
      markerLayerList.forEach((markerLayer) => {
        markerLayer.show = true;
      });
      for (let i = 0; i < this.allShapes.length; i++) {
        // 处理同一种类型下的 图形
        if (this.allShapes[i].getProperties().get("type") === type) {
          if (this.allShapes[i].id === id) {
            this.allShapes[i].show = true;
          } else {
            this.allShapes[i].show = false;
          }
        }
      }
    },

    // 图层控制: 显示轨迹时-关闭其它图层
    toggleOtherLayer(isToggle) {
      handleMarker.personLayerVisiable = isToggle;
      // 人员定位
      this.personVisiable(isToggle);
      // 摄像头
      handleMarker.imageMarkLayerCamera.show = isToggle;
      // 危险源
      if (handleMarker.imageMarkLayerDanger) {
        handleMarker.imageMarkLayerDanger.show = isToggle;
      }
      // 显示图层控制
      this.layerboxVisable = isToggle;
    },

    // 图层控制: ui手动点击勾选控制 marker图层显示
    toggeleMarkVisible(event) {
      event = event || window.event;
      const { id, checked } = event.target;
      this.controllLayer3d(id, checked);

      // 关闭和开启 websocket
      if (id === "location-per01") {
        if (checked) {
          if (!this.websocket || this.websocket.readyState != 1) {
            this.startWs();
          }
        } else {
          this.websocketClose();
        }
      }

      // 所有模块 下某个图层
      this.menuList.find((menu) => {
        menu.incudeLayer.find((item) => {
          if (item.id === id) {
            item.enable = checked;
          }
        });
      });
    },
    // 获取视图
    setCurrView(option) {
      if (!flyToViewerOption(this.mainMap, option)) {
        return false;
      }
      this.currViewerId = option.id;
      return true;
    },
    // 图层UI 展开/折叠
    layerSpreadAndFold() {
      if (this.layerIsSpread) {
        this.layerIsSpread = false;
      } else {
        this.layerIsSpread = true;
      }
    },
  },
};
</script>

<template>
  <!-- 'transform transition-all duration-500 ease-in-out origin-bottom-right',
      isAnimated ? 'translate-x-8 translate-y-8 scale-75' : '', -->
  <div
    id="map_newMaterial"
    ref="map_newMaterial"
    :class="[leftHide ? 'to-edge' : '', rightHide ? 'to-right' : '']"
  >
    <div
      v-show="layerboxVisable"
      class="content"
      :class="layerIsSpread ? '' : 'layerClose'"
      :style="{ backgroundImage: `url(${bg1})` }"
      @click="toggeleMarkVisible"
    >
      <label v-for="item of layerList" v-show="layerIsSpread" :key="item.id">
        <input :id="item.id" type="checkbox" :checked="item.enable" />
        {{ item.name }}
      </label>
      <label>
        <button class="layerBut" @click="layerSpreadAndFold">
          <div class="arrow">{{ layerIsSpread ? `&laquo;` : `&raquo;` }}</div>
          {{ layerIsSpread ? "收起" : "展开" }}
        </button>
      </label>
    </div>

    <track-play
      ref="trackPlay"
      v-model="percent"
      :track-aaimate-control="trackAaimateControl"
      :remove-track="removeTrack"
      :set-track-speed="setTrackSpeed"
      :drawing-percent="drawingPercent"
      :cancel-track="cancelTrack"
      :playing-track="playingTrack"
    />

    <!-- 播放弹窗 -->
    <el-dialog
      class="normal-dialog video-dialog-newMaterial"
      :visible.sync="dialog_vid"
      width="60%"
      @close="videoUrl = ''"
    >
      <div class="headTitle">视频画面</div>
      <!-- <LivePlayer :videoUrl="videoUrl" fluent autoplay live stretch /> -->
      <jessibuca-player :id="Math.floor(Math.random() * 10 + 1)" :video-url="videoUrl" />
    </el-dialog>

    <div v-if="isShowViewerOption" class="viewerOption">
      <ul>
        <li
          v-for="(option, index) in viewerOptions"
          :key="index"
          style="list-style: none"
        >
          <button
            v-if="option.isDefault"
            :class="{ active: currViewerId === option.id }"
            :style="
              viewerOptions.length === 1 ? { 'border-right': '0px solid #0da4ba' } : {}
            "
            @click="setCurrView(option)"
          >
            {{ option.name }}
          </button>
          <button
            v-else
            style="border-right: 0px solid #0da4ba"
            :class="{ active: currViewerId === option.id }"
            @click="setCurrView(option)"
          >
            {{ option.name }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
#map_newMaterial {
  position: absolute;
  top: 0;
  right: 0;
  width: 100vw;
  height: 100vh;
  // width: 100%;
  // height: 100%;
  .cesium-control-left.cesium-control-top {
    left: calc(30% - 100px);
    .cesium-zoom-controls {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
    }
  }
  .cesium-control-top.cesium-control-right {
    top: 50px;
    right: calc(30% - 100px);
  }

  .layerClose {
    border: 1px solid #0bb4c0;
    height: 26px;
    padding: 6px 8px 6px 0px !important;
  }
  .content {
    position: absolute;
    bottom: 2px;
    left: calc(30% - 60px);
    z-index: 100;
    padding: 16px 16px 6px;
    max-width: 180px;
    background-size: 100% 100%;
    font-size: 12px;
    .layerBut {
      display: flex;
      flex-wrap: nowrap;
      width: 100%;
      background-color: #0f445d40;
      border: 1px solid #0bb4c0;
      color: #ffff;
      border: 0;
      cursor: pointer;

      .arrow {
        font-size: 20px;
        height: 12px;
        margin-right: 15px;
        transform: rotate(-90deg);
        -webkit-transform: rotate(-90deg);
        -moz-transform: rotate(-90deg);
      }
    }
    .layerBut:hover {
      color: #47eff4;
    }
    label {
      display: flex;
      align-items: center;
      margin-bottom: 6px;
      color: #fff;
      border-radius: 10px;
    }
    input[type="checkbox"],
    input[type="radio"] {
      cursor: pointer;
      position: relative;
      width: 12px;
      height: 12px;
      font-size: 12px;
      margin-right: 5px;
    }
    input[type="checkbox"]:checked:after {
      content: "✓";
      font-size: 12px;
      font-weight: bold;
      color: #fff;
      margin-right: 5px;
    }
    input[type="checkbox"]:after {
      position: absolute;
      top: -2px;
      background: rgba(27, 31, 50, 1);
      border: 1px solid #27d9ff;
      color: #000;
      width: 15px;
      height: 15px;
      display: inline-block;
      visibility: visible;
      padding-left: 0px;
      text-align: center;
      content: " ";
      border-radius: 3px;
    }
  }

  &.to-edge {
    .cesium-control-left.cesium-control-top {
      left: 10px;
    }
    .content {
      left: 30px;
    }
  }
  &.to-right {
    .cesium-control-right {
      right: 10px;
    }
  }
}
.video-dialog-newMaterial {
  .el-dialog {
    background: transparent;
    box-shadow: none;
  }
  .el-dialog__header,
  .el-dialog__footer {
    display: none;
  }
  .el-dialog__body {
    .headTitle {
      text-align: center;
      padding-bottom: 30px;
      font-size: 16px;
      color: #fff;
      font-weight: bold;
    }
    background: url("../../../assets/anhuan3d/dialog_bg.png");
    background-size: 100% 100%;
    padding: 50px 40px;
    display: flex;
    flex-direction: column;
    // .player-wrapper {
    //     height: 500px;
    // }
    // .video-wrapper {
    //     height: 100%;
    //     padding-bottom: 0 !important;
    // }
    .jessibuca-player {
      height: 500px !important;
    }
  }
}

.viewerOption {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: 0;
  z-index: 2;
  max-width: 460px;
  background-color: #0951617a;
  border: 1px solid #0bb4c0;
  /* padding: 5px; */
  border-radius: 15px 15px 0px 0px;

  .active {
    border-bottom: 2px solid #27d9ff;
    color: #ffffff;
    font-size: 12px;
  }

  ul {
    margin: 0px;
    padding: 0px;
    display: flex;
    flex-wrap: nowrap;
  }
  button {
    width: 85px;
    height: 30px;
    border: none;
    border-right: 1px solid #0da4ba;
    background: none;
    color: #fff;
    font-size: 12px;
    // padding-bottom: 15px;
    cursor: pointer;
  }
  button:hover {
    border-bottom: 2px solid #ffffff;
    color: #fff;
    font-size: 12px;
  }
}

#track-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: auto;
  height: 46px;
  color: white;
  img {
    position: relative;
    bottom: 0px;
    width: 32px;
    height: 32px;
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
}
</style>
