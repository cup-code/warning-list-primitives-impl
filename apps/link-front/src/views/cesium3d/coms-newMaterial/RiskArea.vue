<script>
import n03 from "@/assets/anhuan3d/03.png";
import n05 from "@/assets/anhuan3d/05.png";
import cl_bg from "@/assets/anhuan3d/cl_bg.png";
import glgb from "@/assets/anhuan3d/glgb.png";
import left_hide from "@/assets/anhuan3d/left_hide.png";
import right_hide from "@/assets/anhuan3d/right_hide.png";
import {
  deviceCheckDetailsById,
  // 应急处置卡 (分页，富文本)
  emCardByPage, // 部门表
  getAllPostByCompanyFn, // 分页查询分析分析单元
  getAnalyseUnitAll, // 分页查询风险区域
  getAnalyseUnitByPage, // 岗位表
  getByCompanyId, // 人员表 // 公司表
  getDepartListSimple,
  getEmCardRichText,
  getHandleRuleCardRichText,
  getRiskAreaAll, // 获取所有风险区域
  getRiskAreaByPage,
  getRiskEvaCardRichText, // 获取所有分析单元
  getRiskEventByPage,
  getSubordinateCompany,
  getWorkDutyCardRichText, // 获取设备异常隐患的详情

  // 两单四知卡
  // 操作规程卡 (分页，取富文本)
  handleRuleCardByPage, // 分页查询风险事件
  queryTroubldData,
  // 风险识别卡 (分页，富文本)
  riskEvaCardByPage,
  // 危害因素识别排查清单
  riskEvaCheckDetailByPage,
  // 安全风险分级管控清单
  riskLevelCtrlDetailByPage, // 风险隐患

  // 查看隐患详情
  safeCheckDetailsById,
  // 岗位责任卡 (卡分页，富文本)
  workDutyCardByPage,
} from "@/http/map/gis-map.js";
// 弹窗-富文本(操作规程卡,应急处置卡,岗位责任卡,风险识别卡)
import DialogContentCard from "./components/DialogContentCard.vue";
// 弹窗-表格（安全风险分级管控清单，危害因素识别排查清单）
import DialogContentTable from "./components/DialogContentTable.vue";
import Fxbs from "./components/Fxbs";

import Pcjl from "./components/Pcjl";
// 公司表
// import { getSubordinateCompany } from '@/http/user-api'
// 部门表
// import { getDepartListSimple } from '@/http/safe-production/depart-manage-api'
// 岗位表
// import { getAllPostByCompanyFn } from '@/http/safe-production/post-manage-api'
// 人员表
// import { getByCompanyId } from '@/http/GeneralQuery'

import Pcrw from "./components/Pcrw";
// 弹窗-隐患详情弹
import RiskTroubleDetail from "./components/RiskTroubleDetail.vue";
import { riskArea } from "./js/index.js";

// !!! 风险区域数据来自 <<双预防>>，风险隐患来自 <<隐患台账>> (接口文挡： -双预防机制 / 安全隐患 / 台账分页查询 )
export default {
  /* 风险区域： 风险区域关联风险分析单元(1对多)，风险分析单元关联风险事件(1对多)  */
  name: "RiskArea",
  components: {
    // TreeSelect,
    DialogContentCard,
    DialogContentTable,
    // 隐患详情弹窗内容
    RiskTroubleDetail,
    Fxbs,
    Pcrw,
    Pcjl,
  },
  data() {
    return {
      n03,
      left_hide,
      right_hide,
      glgb,
      cl_bg,
      n05,
      risk_title: "风险区域", // 风险区域 / 风险隐患
      select_title: "risk_area", // risk_area / risk_trouble  Trouble

      // 风险等级 #ffcc01
      RiskLevel: riskArea.RiskLevel,
      riskAreaCount: 0, // 风险分区数量
      riskAreaData: [], // 风险区域
      riskDetialedInformation: {}, // 风险区域详情 / 基础信息
      riskUnitData: [], // 风险单元
      riskEventData: [], // 所有风险事件
      currSelectRiskArea: { index: 0, id: "" }, // 当前选择风险区域
      currSelectRiskTrouble: { index: 0, id: "" }, // 当前选择风险隐患

      // 两单四知卡  // 是否绑定数据 count
      twoTicketAndfourCard: [
        { count: 0, id: "safe-ticker", name: "安全风险分级管控清单" },
        { count: 0, id: "harm-ticker", name: "危害因素辨识排查清单" },
        // {count:0,id:'job-card',name:'岗位职责卡'},
        // {count:0,id:'risk-card',name:'风险辨识卡'},
        // {count:0,id:'emergency-card',name:'应急处置卡'},
        // {count:0,id:'operate-card',name:'操作规程卡'},
      ],
      currOnClickCardId: "", // 当前点击的id
      allDic: {}, // 字典信息 ：分析单元类型
      unitList: [], // 风险识别卡-分析单元表

      jobCardData: [], // 岗位职责卡
      riskCardData: [], // 风险识别卡
      emergencyCardData: [], // 应急处置卡
      operateCardData: [], // 操作规程卡

      // 操作规程卡 富文本信息
      changeData: {
        richTextTitle: "", // 富文本标题
        richText: "", // 富文本框内 文字
      },
      safeRiskLevelControlDataList: [], // 安全风险分级管控清单
      riskEvaCheckDetailByPageDataList: [], // 危害因素识别排查清单
      propData: {}, // 弹窗参数
      info: {}, // 弹窗内容数据

      // 用户数据 session中取到权限数据
      userData: undefined,
      companyList: [], // 用户参数
      depList: [], // 部门表
      areaList: [], // 所有 风险区域表
      postList: [], // 岗位表
      personList: [], // 人员表
      totalMessage: 200, // 请求消息数量

      // 查询风险区域
      searchAreaData: {
        // 传递的页码数
        pageNum: 1,
        pageSize: 1000,
        // 清空模糊查询
        fuzzyName: "",
      },

      // 风险隐患
      searchTroubleData: {
        // companyId:'',
        pageNum: 1,
        pageSize: 200, // 请求消息数量
        id: "", // 隐患id
        troubleState: [], // 隐患状态
        rectificationUserId: "", // 整改人id
        troubleDesc: "", // 隐患描述
        rectificationTimeStart: "", // 开始时间
        rectificationTimeEnd: "", // 结束时间
        fuzzyQuery: "", // 模糊查询
      },
      fromEvaluate: false, // 判断是否从评价管理页面跳转过来的，默认false
      levelList: [], // 隐患等级下拉列表
      riskTroubleData: [], // 风险隐患数据
      // 状态下拉列表
      hiddenBookStatusList: [
        { label: "待审核", value: 0 },
        { label: "待派发", value: 1 },
        { label: "待整改", value: 2 },
        { label: "待验收", value: 3 },
        { label: "待复查", value: 4 },
        { label: "已复查", value: 5 },
      ],
      searchTroubleId: "", // 搜索风险隐患Id
      troubleInfo: {}, // 隐患信息

      // 查看隐患详情
      showInfoDialog: false, // 是否显示弹窗
      dialogTitle: "隐患详情", // 标题
      isDevice: false, // 是否设备隐患
      // 时间轴数据
      timeLineProp: {
        curStep: 0,
        // numWidth: 50, // 数字宽度
        // desWidth: 150, // 描述宽度
        dataList: [
          { name: "问题报告", content: "" },
          { name: "隐患审核", content: "" },
          { name: "整改", content: "" },
          { name: "验收", content: "" },
          { name: "复查", content: "" },
        ],
      },
      troubleDetail: {}, // 查看隐患详情 数据
      // 图片
      /* imageSrcList: [
                'ticket.jpg',
                'workers01.png',
                'ticket.jpg',
                'workers01.png',
                'ticket.jpg',
            ], */
      riskUnitDialog: false,
      activeName: "fxbs",
      uId: "",
    };
  },
  computed: {
    setHiddenBookStatusList() {
      return function (state) {
        let param = { label: "--", value: undefined }; // 错误状态;
        for (const item of this.hiddenBookStatusList) {
          if (item.value === state) {
            param = item;
            break;
          }
        }
        return param;
      };
    },

    // 搜索风险区域
    searchDataList() {
      if (this.searchAreaData.fuzzyName === "") {
        return this.riskAreaData;
      } else {
        // return this.riskAreaData.filter(item => item.id.toLowerCase().indexOf(this.searchKey.toLowerCase()) > -1)
        // return this.riskAreaData.filter(item => item.id.indexOf(this.searchKey) > -1)
        return this.riskAreaData.filter((item) =>
          item.regionName.includes(this.searchAreaData.fuzzyName)
        );
      }
    },

    // 搜索 风险隐患
    searchTroubelList() {
      if (this.searchTroubleData.troubleDesc === "") {
        return this.riskTroubleData;
      } else {
        return this.riskTroubleData.filter((item) => {
          if (item.troubleDesc) {
            return item.troubleDesc.includes(this.searchTroubleData.troubleDesc);
          }
        });
      }
    },

    /* 设置风险等级文字及颜色 */
    setRiskLevel() {
      return function (riskLv) {
        const riskLvInt = Number.parseInt(riskLv);
        let param = {};
        for (const item of this.RiskLevel) {
          if (item.value == riskLvInt) {
            param = item;
            break;
          }
        }
        return param;
      };
    },

    leftHide() {
      return this.$store.state.newMaterial.isExpand;
    },
    rightHide() {
      return this.$store.state.newMaterial.isExpand;
    },
  },
  created() {
    // session中取到权限数据
    this.userData = JSON.parse(sessionStorage.getItem("user"));
    // 数据字典-分析单元类型
    this.allDic = JSON.parse(sessionStorage.getItem("dictList") || "{}");

    // 从首页消息列表跳转过来的时候会带id，精准查出目标数据
    if (this.$route.query.id) {
      this.searchTroubleData.id = this.$route.query.id;
    }
    this.fromEvaluate = this.$route.params.fromEvaluate || false;
    this.searchTroubleData.rectificationUserId =
      this.$route.params.rectificationUserId || "";
    this.searchTroubleData.rectificationTimeStart =
      this.$route.params.rectificationTimeStart || "";
    this.searchTroubleData.rectificationTimeEnd =
      this.$route.params.rectificationTimeEnd || "";
    if (this.fromEvaluate) {
      this.searchTroubleData.troubleState = [3, 4, 5];
    }
    // 获取风险隐患数据
    this.getRiskTroubleData();

    // 本地测试数据 -风险隐患
    // this.riskTroubleData = zq_config.riskTrobleData;
    // this.troubleInfo = this.riskTroubleData[0];
  },
  mounted() {
    this.initial();
    // 加风险区域数据 分页数据
    this.getRiskData();

    // this.searchTroubleData.companyId = this.companyId;
  },
  methods: {
    initial() {
      // 修改一般风险颜色 :黄色 (原黄色白色文字看不清楚)
      this.RiskLevel[1].color = "#dbdb04";
    },
    // 点击搜索
    clickSearchData() {
      if (this.select_title === "risk_area") {
        this.getRiskData();
      } else if (this.select_title === "risk_trouble") {
        // 获取风险隐患数据
        this.getRiskTroubleData();
      }
    },

    // 查询所有风险区域列表
    getRiskAreaAllData() {},

    // 获取风险区域数据 分页
    getRiskData() {
      getRiskAreaByPage(this.searchAreaData)
        .then((res) => {
          if (res.data.success) {
            // JSON.parse(JSON.strinify())
            // this.riskAreaData = res.data.result.list;
            const list = res.data.result.list || [];
            // 是否为空对象
            this.riskAreaData = list.filter((ietm) => {
              return (
                ietm.hasOwnProperty("areaOnMap") &&
                Object.keys(ietm.areaOnMap).length > 0 &&
                ietm.areaOnMap.hasOwnProperty("position")
              );
            });
            this.riskAreaCount = this.riskAreaData.length;
            if (this.riskAreaData.length > 0) {
              this.setRiskDetialedInformation(this.riskAreaData[0]);
              // 获取风险单元
              this.getRiskUnitData(this.riskAreaData[0].id);
              // 两单四知卡
              this.twoBillFourCard(this.riskAreaData[0]);

              this.currSelectRiskArea.id = this.riskAreaData[0].id;

              // 设置默认高亮
              this.$refs.elTable.setCurrentRow(this.riskAreaData[0]);
            }
          } else {
            this.$message.warning(res.data.message || "获取风险区数据失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取风险区数据出错", err);
        })
        .finally(() => {
          // 公司信息列表
          this.getParams();
        });
    },
    // 获取风险单元 数据
    getRiskUnitData(regionId) {
      const searchData = {
        pageNum: 1,
        pageSize: this.totalMessage,
        regionId,
      };
      getAnalyseUnitByPage(searchData)
        .then((res) => {
          if (res.data.success) {
            // this.riskUnitData = res.data.result.list
            // 不改变源数组添加对象属性
            this.riskUnitData = res.data.result.list.map((obj) => {
              return { ...obj, riskLevel: 0 };
            });
            // 风险单元下 所有风险事件
            if (this.riskUnitData.length > 0) {
              this.getRiskEventData();
            }
          } else {
            this.$message.warning(res.data.message || "获取风险单元失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取风险单元出错：", err);
        })
        .finally(() => {});
    },
    // 获取 风险事件 风险等级
    getRiskEventData() {
      const searchData = {
        pageNum: 1,
        pageSize: this.totalMessage,
        // analysisUnit:unitId,
      };
      getRiskEventByPage(searchData)
        .then((res) => {
          if (res.data.success) {
            this.riskEventData = res.data.result.list;
            for (let i = 0; i < this.riskUnitData.length; i++) {
              // 查找最大风险级别
              const currRiskEvent = this.riskEventData.filter(
                (item) => item.analysisUnitId === this.riskUnitData[i].id
              );
              if (currRiskEvent.length > 0) {
                currRiskEvent.forEach((element) => {
                  if (
                    Number.parseInt(element.riskLevel) > this.riskUnitData[i].riskLevel
                  ) {
                    this.riskUnitData[i].riskLevel = Number.parseInt(element.riskLevel);
                  }
                });
              } else {
                this.riskUnitData[i].riskLevel = 100;
              }
            }
          } else {
            this.$message.warning(res.data.message || "请求表格数据失败");
          }
        })
        .catch((err) => {
          this.$message.error("请求表格数据出错：", err);
        })
        .finally(() => {});
    },

    // 两单四知卡信息
    // #region

    // 操作规程-分页信息
    getHandleRulePageData(riskRegion) {
      this.operateCardData = [];
      this.twoTicketAndfourCard.find((item) => item.id === "operate-card").count = 0;

      const searchData = {
        pageNum: 1,
        pageSize: this.totalMessage,
        riskRegion,
      };
      handleRuleCardByPage(searchData)
        .then((res) => {
          if (res.data.success) {
            this.operateCardData = res.data.result.list || [];
            this.twoTicketAndfourCard.find(
              (item) => item.id === "operate-card"
            ).count = this.operateCardData.length;
          } else {
            this.$message.warning(res.data.message || "获取操作规程卡失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取操作规程卡出错", err);
        })
        .finally(() => {});
    },
    // 操作规程-富文本信息
    getHandleRulecard_richText(pageData, title) {
      const info = pageData[0];
      if (info.id) {
        // 富文本信息<不改变源对象复制>
        this.changeData = {
          ...JSON.parse(JSON.stringify(info)),
          richText: "",
          richTextTitle: title,
        };
        console.log("操作规程 rich Text:", this.changeData);
        // 获取富文本
        getHandleRuleCardRichText(this.changeData.id)
          .then((res) => {
            if (res.data.success) {
              this.changeData.richText = res.data.result;

              this.propData.changeData = this.changeData;
              this.propData.info = pageData[0];
              this.showInfoDialog = true;
              console.log("岗位列表:", this.propData.postList);
            } else {
              this.$message.warning(res.data.message || "获取操作规程富文本失败");
            }
          })
          .catch((err) => {
            this.$message.error("获取操作规程富文本出错", err);
          })
          .finally(() => {});
      } else {
        this.showInfoDialog = false;
      }
    },

    // 应急处置卡-分页信息
    getEmergencyHandlePageData(riskRegionId) {
      this.emergencyCardData = [];
      this.twoTicketAndfourCard.find((item) => item.id === "emergency-card").count = 0;
      const searchData = {
        pageNum: 1,
        pageSize: this.totalMessage,
        riskRegion: riskRegionId,
      };
      emCardByPage(searchData)
        .then((res) => {
          if (res.data.success) {
            this.emergencyCardData = res.data.result.list || [];
            this.twoTicketAndfourCard.find(
              (item) => item.id === "emergency-card"
            ).count = this.emergencyCardData.length;
          } else {
            this.$message.warning(res.data.message || "获取应急处置卡失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取应急处置卡出错", err);
        })
        .finally(() => {});
    },
    // 应急处置卡-富文本
    getEmergencyHandle_richText(pageData, title) {
      let info = {};
      if (pageData.length > 0) {
        info = pageData[0];
      }
      if (info.id) {
        //  富文本信息<不改变源对象复制>
        this.changeData = {
          ...JSON.parse(JSON.stringify(info)),
          richText: "",
          richTextTitle: title,
        };
        console.log("应急处置卡 rich Text：", this.changeData);
        // 获取富文本
        getEmCardRichText(this.changeData.id)
          .then((res) => {
            if (res.data.success) {
              this.changeData.richText = res.data.result;

              this.propData.changeData = this.changeData;
              this.propData.info = pageData[0];
              this.showInfoDialog = true;
            } else {
              this.$message.warning(res.data.message || "获取紧急处置卡富文本失败");
            }
          })
          .catch((err) => {
            this.$message.error("获取紧急处置卡富文本出错", err);
          })
          .finally(() => {});
      } else {
        this.showInfoDialog = false;
      }
    },

    // 风险识别卡-分页 riskEvaCardByPage,getRiskEvaCardRichText
    getRiskEvaCardPageData(riskRegionId) {
      this.riskCardData = [];
      this.twoTicketAndfourCard.find((item) => item.id === "risk-card").count = 0;
      const searchData = {
        pageNum: 1,
        pageSize: this.totalMessage,
        riskRegion: riskRegionId,
      };
      riskEvaCardByPage(searchData)
        .then((res) => {
          if (res.data.success) {
            this.riskCardData = res.data.result.list || [];
            this.twoTicketAndfourCard.find(
              (item) => item.id === "risk-card"
            ).count = this.riskCardData.length;
          } else {
            this.$message.warning(res.data.message || "获取风险识别卡失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取风险识别卡出错", err);
        })
        .finally(() => {});
    },
    getRiskEvaCard_richText(pageData, title) {
      let info = {};
      if (pageData.length > 0) {
        info = pageData[0];
      }
      if (info.id) {
        //  富文本信息<不改变源对象复制>
        this.changeData = {
          ...JSON.parse(JSON.stringify(info)),
          richText: "",
          richTextTitle: title,
        };
        console.log("风险识别卡 rich Text：", this.changeData);
        // 获取富文本
        getRiskEvaCardRichText(this.changeData.id)
          .then((res) => {
            if (res.data.success) {
              this.changeData.richText = res.data.result;

              this.propData.changeData = this.changeData;
              this.propData.info = pageData[0];
              this.showInfoDialog = true;
            } else {
              this.$message.warning(res.data.message || "获取风险识别卡富文本失败");
            }
          })
          .catch((err) => {
            this.$message.error("获取风险识别卡富文本出错", err);
          })
          .finally(() => {});
      } else {
        this.showInfoDialog = false;
      }
    },

    // 岗位责任卡-分页信息
    getWorkDutyCardPageData(riskRegionId) {
      this.jobCardData = [];
      this.twoTicketAndfourCard.find((item) => item.id === "job-card").count = 0;
      const searchData = {
        pageNum: 1,
        pageSize: this.totalMessage,
        riskRegion: riskRegionId,
      };
      workDutyCardByPage(searchData)
        .then((res) => {
          if (res.data.success) {
            // res.data.result.total
            this.jobCardData = res.data.result.list || [];
            this.twoTicketAndfourCard.find(
              (item) => item.id === "job-card"
            ).count = this.jobCardData.length;
          } else {
            this.$message.warning(res.data.message || "获取岗位责任卡失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取岗位责任卡出错", err);
        })
        .finally(() => {});
    },
    // 岗位责任卡-富文本
    getWorkDutyCard_rickText(pageData, title) {
      let info = {};
      if (pageData.length > 0) {
        info = pageData[0];
      }
      if (info.id) {
        //  富文本信息<不改变源对象复制>
        this.changeData = {
          ...JSON.parse(JSON.stringify(info)),
          richText: "",
          richTextTitle: title,
        };
        console.log("岗位责任卡 rich Text：", this.changeData);
        // 获取富文本
        getWorkDutyCardRichText(this.changeData.id)
          .then((res) => {
            if (res.data.success) {
              this.changeData.richText = res.data.result;

              this.propData.changeData = this.changeData;
              this.propData.info = pageData[0];
              this.showInfoDialog = true;
            } else {
              this.$message.warning(res.data.message || "获取岗位责任卡富文本失败");
            }
          })
          .catch((err) => {
            this.$message.error("获取岗位责任卡富文本出错", err);
          })
          .finally(() => {});
      } else {
        // 无数据
        this.changeData = { richText: "", richTextTitle: title };
        this.showInfoDialog = false;
      }
    },

    // 安全风险分级管控清单 ：获取所有风险清单1-10页, 过滤所有风险区域-风险单元下风险清单
    getSafeRiskLevelControl(areaName) {
      this.twoTicketAndfourCard.find((item) => item.id === "safe-ticker").count = 0;
      this.safeRiskLevelControlDataList = [];
      const searchData = {
        pageNum: 1,
        pageSize: this.totalMessage,
        postName: areaName,
        // analysisUnitId:''
      };
      riskLevelCtrlDetailByPage(searchData)
        .then((res) => {
          if (res.data.success) {
            // 风险单元下-风险清单
            this.riskUnitData.forEach((item) => {
              res.data.result.list.forEach((element) => {
                if (item.unitName === element.unitName) {
                  this.safeRiskLevelControlDataList.push(element);
                }
              });
            });
            this.twoTicketAndfourCard.find(
              (item) => item.id === "safe-ticker"
            ).count = this.safeRiskLevelControlDataList.length;
          } else {
            this.$message.warning(res.data.message || "获取安全风险分级管控清单失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取安全风险分级管控清单出错", err);
        })
        .finally(() => {});
    },

    // 危害因素识别排查清单
    getRiskEvaCheckDetailByPage(name) {
      this.twoTicketAndfourCard.find((item) => item.id === "harm-ticker").count = 0;
      this.riskEvaCheckDetailByPageDataList = [];

      const searchData = {
        pageNum: 1,
        pageSize: this.totalMessage,
        // 区域名称
        postName: name,
        // analysisUnitId:''
      };
      riskEvaCheckDetailByPage(searchData)
        .then((res) => {
          if (res.data.success) {
            // 风险单元下-风险清单
            this.riskUnitData.forEach((item) => {
              res.data.result.list.forEach((element) => {
                if (item.unitName === element.unitName) {
                  this.riskEvaCheckDetailByPageDataList.push(element);
                }
              });
            });
            this.twoTicketAndfourCard.find(
              (item) => item.id === "harm-ticker"
            ).count = this.riskEvaCheckDetailByPageDataList.length;
          } else {
            this.$message.warning(res.data.message || "获取危害因素识别排查清单失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取危害因素识别排查清单出错", err);
        })
        .finally(() => {});
    },

    /* 获取参数  isLoading : true 成功加载  false 未加载 */
    async getParams() {
      // 用户数据session中取到权限数据
      if (!this.userData) {
        this.userData = JSON.parse(sessionStorage.getItem("user"));
        // 富文本
        this.changeData.companyId = this.userData.companyId;
        this.changeData.companyName = this.userData.companyName;
      }

      // 公司表
      const companyRes = await getSubordinateCompany();
      this.companyList = companyRes.data.result || [];
      // 部门表
      const depRes = await getDepartListSimple();
      this.depList = depRes.data.result || [];
      // 风险区域表
      const areaRes = await getRiskAreaAll();
      this.areaList = areaRes.data.result || [];
      // 岗位表
      const postRes = await getAllPostByCompanyFn(this.userData.companyId);
      this.postList = postRes.data.result;
      // 人员表
      const userRes = await getByCompanyId(this.userData.companyId);
      this.personList = userRes.data.result;

      // 风险识别卡-分析单元表
      const unitRes = await getAnalyseUnitAll();
      this.unitList = unitRes.data.result || [];

      /* let info = {
                cardMaker: "无数据",
                companyId: "无数据",
                companyName: "无数据",
                createdBy: "无数据",
                createdTime: "无数据",
                deleted: false,
                id: "无数据",
                post: "无数据",
                responsibilityDepartment: "无数据",
                riskRegion: "无数据",
                updatedBy: "无数据",
                updatedTime: "无数据"
            } */

      // 数据已经加载完成

      // 显示弹窗信息
      this.propData = {
        // 获取风险单元
        editable: false, // 查看 、 编辑
        // 公司下拉列表
        companyList: this.companyList,
        // 责任部门下拉列表
        depList: this.depList,
        // 风险区域下拉列表
        areaList: this.areaList,
        // 岗位下拉列表
        postList: this.postList,
        // 人员下拉列表
        personList: this.personList,

        // 富文本信息
        changeData: this.changeData,
        // 信息
        info: undefined,
      };
    },

    // 两单四知卡
    clickTwoTicketAndfourCard(option) {
      const { id, name } = option;
      this.currOnClickCardId = id;
      this.dialogTitle = name;

      if (id === "safe-ticker") {
        // 安全风险分级管控清单
        this.showInfoDialog = true;
      } else if (id === "harm-ticker") {
        // 危害因素辨识排查清单
        this.showInfoDialog = true;
      } else if (id === "job-card") {
        // 岗位职责卡-分页信息
        this.getWorkDutyCard_rickText(this.jobCardData, name);
      } else if (id === "risk-card") {
        // 风险辨识卡
        this.getRiskEvaCard_richText(this.riskCardData, name);
      } else if (id === "emergency-card") {
        // 获取应急处置卡-分页信息
        this.getEmergencyHandle_richText(this.emergencyCardData, name);
      } else if (id === "operate-card") {
        // 获取操作规程卡-分页数据
        this.getHandleRulecard_richText(this.operateCardData, name);
      }
    },
    // #endregion

    // 风险隐患

    // #region

    // 获取风险隐患数据
    getRiskTroubleData() {
      queryTroubldData(this.searchTroubleData)
        .then((res) => {
          if (res.data.success) {
            // res.data.result.total
            this.riskTroubleData = res.data.result.list || [];
            if (this.riskTroubleData.length > 0) {
              this.troubleInfo = this.riskTroubleData[0];
              this.getRiskTroubleDetail(this.troubleInfo.id);
            }
          } else {
            this.$message.warning(res.data.message || "获取风险隐患数据失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取风险隐患出错", err);
        })
        .finally(() => {});
    },

    // 获取 隐患详情 (查看隐患详情)
    getRiskTroubleDetail(troubleId) {
      const func = this.isDevice ? deviceCheckDetailsById : safeCheckDetailsById;
      func(troubleId)
        .then((res) => {
          if (res.data.success) {
            this.troubleDetail = res.data.result;
            // console.log('隐患详情:',this.troubleDetail);
            this.timeLineProp.dataList[0].content = this.troubleDetail.troubleFindTime;
            this.timeLineProp.dataList[1].content = this.troubleDetail.judgeTime;
            this.timeLineProp.dataList[2].content = this.troubleDetail.rectificationTime;
            this.timeLineProp.dataList[3].content = this.troubleDetail.acceptanceTime;
            if (
              this.troubleDetail.troubleReviews &&
              this.troubleDetail.troubleReviews.length
            ) {
              const reviewsLength = this.troubleDetail.troubleReviews.length;
              this.timeLineProp.dataList[4].content = this.troubleDetail.troubleReviews[
                reviewsLength - 1
              ].reviewTime;
            }
            // 判断当前步骤
            if (
              this.troubleDetail.troubleReviews &&
              this.troubleDetail.troubleReviews.length
            ) {
              this.timeLineProp.curStep = 5;
            } else if (this.troubleDetail.acceptanceTime) {
              this.timeLineProp.curStep = 4;
            } else if (this.troubleDetail.rectificationTime) {
              this.timeLineProp.curStep = 4;
            } else if (this.troubleDetail.judgeTime) {
              this.timeLineProp.curStep = 2;
            } else if (this.troubleDetail.troubleFindTime) {
              this.timeLineProp.curStep = 1;
            } else {
              this.timeLineProp.curStep = 0;
            }
          } else {
            this.$message.warning(res.data.message || "获取隐患详情数据失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取隐患详情数据出错", err);
        })
        .finally(() => {});
    },

    // #endregion

    // 查看隐患详情
    troubleDetaildInfo() {
      // 是否显示弹窗
      this.dialogTitle = "隐患详情";
      this.showInfoDialog = true;
    },
    // el-selet 解决选择后无法 关闭下拉框问题。
    selectOption(value) {
      this.$nextTick(() => {
        this.$refs.el_select.blur();
      });
    },

    // 点击定位到地图
    clickLocationTo3d(row) {
      if (this.select_title === "risk_trouble") {
        this.troubleInfo = row;
        // 查看隐患详情
        this.getRiskTroubleDetail(row.id);

        this.currSelectRiskTrouble.index = row.index;
        this.currSelectRiskTrouble.id = row.id;
      } else if (this.select_title === "risk_area") {
        if (this.currSelectRiskArea.id != row.id) {
          // 风险区域 riskDetialedInformation
          this.setRiskDetialedInformation(row);
          // 获取风险区域 下的风险单元
          this.getRiskUnitData(row.id);
          // 两单四知卡
          this.twoBillFourCard(row);
          // 定位到 地图标记
          this.$emit("locationToMap", { id: row.id, type: "" });
          this.currSelectRiskArea.id = row.id;
          this.currSelectRiskArea.index = row.index;
        }
      }
    },
    setRiskDetialedInformation(risk) {
      if (risk) {
        this.riskDetialedInformation = {
          id: risk.id,
          code: risk.id,
          responsibilityDeptName: risk.responsibilityDeptName,
          companyName: risk.companyName,
          regionName: risk.regionName,
          riskLevel: this.RiskLevel.find(
            (item) => item.value === Number.parseInt(risk.riskLevel)
          ).label,
        };
      }
    },

    // 两单四知卡
    twoBillFourCard(riskArea) {
      // 安全风险分级管控清单
      this.getSafeRiskLevelControl(riskArea.regionName);
      // 危害因素辨识排查清单
      this.getRiskEvaCheckDetailByPage(riskArea.regionName);

      this.twoTicketAndfourCard.forEach((item) => {
        if (item.id === "job-card") {
          // 岗位职责卡-分页信息
          this.getWorkDutyCardPageData(riskArea.id);
        }
        if (item.id === "risk-card") {
          // 风险识别卡
          this.getRiskEvaCardPageData(riskArea.id);
        }
        if (item.id === "emergency-card") {
          // 应急处置卡
          this.getEmergencyHandlePageData(riskArea.id);
        }
        if (item.id === "operate-card") {
          // 操作规程卡
          this.getHandleRulePageData(riskArea.id);
        }
      });
    },

    // 来自地图点击
    from3dMapClick(markerObj) {
      this.risk_title = "风险区域";
      this.select_title = "risk_area";
      if (this.riskAreaData.length > 0) {
        for (let i = 0; i < this.riskAreaData.length; i++) {
          if (this.riskAreaData[i].id === markerObj.id) {
            this.$refs.elTable.setCurrentRow(this.riskAreaData[i]);
            break;
          }
        }
      }
    },

    // 风险区域
    riskAreaClick() {
      this.risk_title = "风险区域";
      this.select_title = "risk_area";
      if (this.riskAreaData.length > 0) {
        this.$nextTick(() => {
          this.$refs.elTable.setCurrentRow(
            this.riskAreaData[this.currSelectRiskArea.index]
          );
        });
      }
    },
    // 风险隐患
    riskTroubleClick() {
      this.risk_title = "风险隐患";
      this.select_title = "risk_trouble";
      // 设置风险隐患默认高亮
      if (this.riskTroubleData.length > 0) {
        this.$nextTick(() => {
          this.$refs.elTableTrouble.setCurrentRow(
            this.riskTroubleData[this.currSelectRiskTrouble.index]
          );
        });
      }
    },
    // el-table 偶数行高亮(index%2)===0为偶数
    el_tableRowClassName({ row, rowIndex }) {
      // 每行添加 index
      row.index = rowIndex;

      // 偶数行设置高亮
      if (rowIndex % 2 === 0) {
        return "";
      } else {
        return "el-table-row-highlight";
      }
    },

    // 点击右侧显示按钮
    toShowRight() {
      this.$store.dispatch("newMaterial/rightHide", false);
    },
    // 点击右侧隐藏按钮
    toHideRight() {
      this.$store.dispatch("newMaterial/rightHide", true);
    },
    // 点击左侧隐藏按钮
    toHideLeft() {
      this.$store.dispatch("newMaterial/leftHide", true);
    },
    // 点击左侧显示按钮
    toShowLeft() {
      this.$store.dispatch("newMaterial/leftHide", false);
    },
    seeFn(v) {
      this.riskUnitDialog = true;
      this.uId = v.id;
      console.log("*** v: ", v);
    },
  },
};
</script>

<template>
  <div id="risk-area" class="relative">
    <div
      class="left-div w-[24%] h-[calc(100vh-66px)] absolute left-0 top-0 rounded-lg overflow-hidden mx-3 transition-all duration-300 ease-in-out"
      :class="leftHide ? 'translate-x-[-106%] ease-out' : ''"
    >
      <div
        class="h-[calc(100vh-66px)] flex flex-col rounded-lg overflow-hidden border border-primary-dark-light backdrop-blur-lg p-2 box-border"
      >
        <div
          class="rounded-md p-2 overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
        >
          <!-- 风险区域/风险隐患  按钮 -->
          <div class="title-button">
            <div
              class="titleImage"
              :class="{ active: select_title === 'risk_area' }"
              :style="{ backgroundImage: `url(${cl_bg})` }"
              @click="riskAreaClick"
            >
              <img :src="glgb" />
              <span>风险区域 &nbsp;&nbsp;{{ riskAreaCount }}</span>
            </div>
            <!-- visibility: hidden -->
            <div
              style="visibility: sdisplay"
              class="titleImage"
              :class="{ active: select_title === 'risk_trouble' }"
              :style="{ backgroundImage: `url(${cl_bg})` }"
              @click="riskTroubleClick"
            >
              <img :src="glgb" />
              <span>风险隐患 &nbsp;&nbsp;{{ riskTroubleData.length }}</span>
            </div>
          </div>

          <!-- 搜索框 -->
          <div class="txtSearchBox">
            <!-- 风险区域 搜索健 模糊查询searchAreaData.fuzzyName -->
            <template v-if="select_title === 'risk_area'">
              <el-row>
                <span>风险区域</span>
                <el-input
                  v-model="searchAreaData.fuzzyName"
                  prefix-icon="el-icon-search"
                  placeholder="检索风险区域"
                  clearable
                  @clear="clickSearchData"
                />
                <el-col :span="3">
                  <el-button
                    type="primary"
                    icon="el-icon-search"
                    style="width: 100%"
                    @click="clickSearchData"
                  />
                </el-col>
              </el-row>
            </template>
            <!-- 风险隐患  searchTroubleId searchTroubleData -->
            <template v-else>
              <el-row>
                <span>风险隐患</span>
                <el-input
                  v-model="searchTroubleData.troubleDesc"
                  prefix-icon="el-icon-search"
                  placeholder="输入隐患描述"
                  clearable
                  @clear="clickSearchData"
                />
                <el-col :span="3">
                  <el-button
                    type="primary"
                    icon="el-icon-search"
                    style="width: 100%"
                    @click="clickSearchData"
                  />
                </el-col>
              </el-row>
            </template>
          </div>
          <!-- 左侧信息列表 -->
          <div class="list-box h-full">
            <!-- 风险区域信息列表   -->
            <template v-if="select_title === 'risk_area'">
              <el-table
                ref="elTable"
                class="comm-table"
                header-cell-class-name="table_header"
                :row-class-name="el_tableRowClassName"
                :data="searchDataList"
                :row-style="{ color: '#fff' }"
                height="87%"
                :highlight-current-row="true"
                @row-click="clickLocationTo3d"
              >
                <el-table-column label="序号" type="index" align="center" width="45" />
                <el-table-column prop="regionName" label="名称" align="center" />
                <el-table-column label="风险等级" align="center">
                  <template slot-scope="scope">
                    <span
                      class="risk-des"
                      :style="`background:${setRiskLevel(scope.row.riskLevel).color};`"
                      >{{ setRiskLevel(scope.row.riskLevel).label }}</span
                    >
                  </template>
                </el-table-column>
                <el-table-column label="状态" align="center" width="60">
                  <span>正常</span>
                </el-table-column>
              </el-table>
            </template>
            <!-- 风险隐患 risk_trouble -->
            <template v-else-if="select_title === 'risk_trouble'">
              <el-table
                ref="elTableTrouble"
                header-cell-class-name="table_header"
                :row-class-name="el_tableRowClassName"
                class="comm-table"
                :data="searchTroubelList"
                height="87%"
                :highlight-current-row="true"
                @row-click="clickLocationTo3d"
              >
                <el-table-column label="序号" type="index" align="center" width="45" />
                <el-table-column prop="troubleDesc" label="隐患描述" align="center" />
                <el-table-column label="状态" align="center" width="70">
                  <template slot-scope="props">
                    <el-tag
                      v-if="props.row.troubleState === 0"
                      effect="dark"
                      type="warning"
                    >
                      待审核
                    </el-tag>
                    <el-tag
                      v-if="props.row.troubleState === 1"
                      effect="dark"
                      type="warning"
                    >
                      待派发
                    </el-tag>
                    <el-tag
                      v-if="props.row.troubleState === 2"
                      effect="dark"
                      type="warning"
                    >
                      待整改
                    </el-tag>
                    <el-tag
                      v-if="props.row.troubleState === 3"
                      effect="dark"
                      type="warning"
                    >
                      待验收
                    </el-tag>
                    <el-tag
                      v-if="props.row.troubleState === 4"
                      effect="dark"
                      type="warning"
                    >
                      待复查
                    </el-tag>
                    <el-tag
                      v-if="props.row.troubleState === 5"
                      effect="dark"
                      type="success"
                    >
                      已复查
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  prop="troubleLevel"
                  label="等级"
                  align="center"
                  width="45"
                >
                  <template slot-scope="scope">
                    <span>{{
                      $dictUtils.getDictLabel(
                        "hiddenDangerLevel",
                        scope.row.troubleLevel,
                        "--"
                      )
                    }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </div>
          <!-- 左侧收起 -->
          <!-- <div class="showBtns">
            <div
              v-if="!leftHide"
              :style="{ backgroundImage: `url(${left_hide})` }"
              @click="toHideLeft"
            />
            <div
              v-else
              :style="{ backgroundImage: `url(${right_hide})` }"
              @click="toShowLeft"
            />
          </div> -->
        </div>
      </div>
    </div>
    <div
      class="right-div w-[24%] h-[calc(100vh-66px)] absolute right-0 top-0 rounded-lg overflow-hidden mx-3 transition-all duration-300 ease-in-out"
      :class="rightHide ? 'translate-x-[106%]' : ''"
    >
      <div
        class="h-[calc(100vh-66px)] flex flex-col rounded-lg overflow-hidden border border-primary-dark-light backdrop-blur-lg p-2 box-border"
      >
        <div
          class="rounded-md p-2 h-full overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
        >
          <template v-if="select_title === 'risk_area'">
            <div class="comm-title">
              <img :src="n03" />
              <span>风险区域详情</span>
            </div>
            <!-- 基本信息 -->
            <div class="mb-3 mx-2">
              <ETitle
                title="基本信息"
                classNameCell="h-[18px] "
                className="text-sm text-white"
              />

              <!-- 风险隐患信息列表 公司名称 riskDetialedInformation.companyName -->
              <div class="ul-info-list">
                <ul style="padding-left: 12px">
                  <li>
                    <span class="label-key">风险名称</span>
                    <span>:&nbsp;&nbsp;{{ riskDetialedInformation.regionName }}</span>
                  </li>
                  <li>
                    <span class="label-key">风险编号</span>
                    <span>:&nbsp;&nbsp;{{ riskDetialedInformation.code }}</span>
                  </li>
                  <li>
                    <span class="label-key">责任组织</span>
                    <span
                      >:&nbsp;&nbsp;{{
                        riskDetialedInformation.responsibilityDeptName
                      }}</span
                    >
                  </li>
                  <li>
                    <span class="label-key">区域风险等级</span>
                    <span>:&nbsp;&nbsp;{{ riskDetialedInformation.riskLevel }}</span>
                  </li>
                  <li>
                    <span class="label-key">固有风险等级</span>
                    <span>:&nbsp;&nbsp;{{ riskDetialedInformation.riskLevel }}</span>
                  </li>
                </ul>
              </div>
            </div>
            <!-- 两单四知卡 -->
            <div class="mb-3 mx-2">
              <ETitle
                title="两单四知卡"
                classNameCell="h-[18px] "
                className="text-sm text-white"
              />
              <div class="ul-info-list">
                <ul style="height: 144px">
                  <li
                    v-for="option in twoTicketAndfourCard"
                    v-if="option.count > 0"
                    :key="option.id"
                  >
                    <button class="button" @click="clickTwoTicketAndfourCard(option)">
                      {{ `《 ${option.name} 》` }}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <!-- 风险单元 -->
            <div class="list-box h-full mx-2">
              <ETitle
                title="风险单元"
                classNameCell="h-[18px] "
                className="text-sm text-white"
              />
              <el-table
                :data="riskUnitData"
                class="comm-table"
                header-cell-class-name="table_header"
                :row-class-name="el_tableRowClassName"
                height="44%"
              >
                <el-table-column
                  prop="unitName"
                  label="风险单元名称"
                  align="center"
                  width="100"
                />
                <el-table-column prop="unitType" label="类型" align="center">
                  <template slot-scope="scope">
                    <span>{{
                      $dictUtils.getDictLabelById(
                        "analysis_type",
                        scope.row.unitType,
                        "--"
                      )
                    }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="风险等级" align="center" width="68">
                  <template slot-scope="scope">
                    <span>{{
                      scope.row.riskLevel === 100
                        ? "--"
                        : setRiskLevel(scope.row.riskLevel).label
                    }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" fixed="right">
                  <template slot-scope="scope">
                    <el-button type="text" @click="seeFn(scope.row)"> 查看 </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
          <template v-else>
            <div class="comm-title">
              <img :src="n03" />
              <span>风险隐患信息</span>
            </div>
            <!-- 风险隐患信息列表 -->
            <div class="ul-info-list">
              <ul style="padding-left: 12px">
                <li>
                  <span class="label-key">隐患描述</span>
                  <span>:&nbsp;&nbsp;{{ troubleInfo.troubleDesc }}</span>
                </li>
                <li>
                  <span class="label-key">隐患等级</span>
                  <span
                    >:&nbsp;&nbsp;
                    {{
                      $dictUtils.getDictLabel(
                        "hiddenDangerLevel",
                        troubleInfo.troubleLevel,
                        "--"
                      )
                    }}
                  </span>
                </li>
                <li>
                  <span class="label-key">隐患类型</span>
                  <span
                    >:&nbsp;&nbsp;
                    {{
                      $dictUtils.getDictLabelById(
                        "troubleType_yhlx",
                        troubleInfo.troubleType,
                        "--"
                      )
                    }}
                  </span>
                </li>
                <!--  hiddenBookStatusList[troubleInfo.troubleState].label -->
                <li>
                  <span class="label-key">隐患状态</span>
                  <span
                    >:&nbsp;&nbsp;
                    {{ setHiddenBookStatusList(troubleInfo.troubleState).label }}
                  </span>
                </li>
                <li>
                  <span class="label-key">排查人</span>
                  <span>:&nbsp;&nbsp;{{ troubleInfo.checkUserFullName }}</span>
                </li>
                <li>
                  <span class="label-key">上报时间</span>
                  <span>:&nbsp;&nbsp;{{ troubleInfo.troubleFindTime }}</span>
                </li>
                <li>
                  <span class="label-key">整改部门</span>
                  <span>:&nbsp;&nbsp;{{ troubleInfo.rectificationDeptName }}</span>
                </li>
                <li>
                  <span class="label-key">整改人</span>
                  <span>:&nbsp;&nbsp;{{ troubleInfo.rectificationUserFullName }}</span>
                </li>
                <li>
                  <span class="label-key">整改时间</span>
                  <span>:&nbsp;&nbsp;{{ troubleInfo.rectificationTime }}</span>
                </li>
                <li>
                  <span class="label-key">验收人</span>
                  <span>:&nbsp;&nbsp;{{ troubleInfo.acceptanceUserFullName }}</span>
                </li>
                <li>
                  <span class="label-key">验收时间</span>
                  <span>:&nbsp;&nbsp;{{ troubleInfo.acceptanceTime }}</span>
                </li>
                <li>
                  <span class="label-key">隐患ID</span>
                  <span>:&nbsp;&nbsp;{{ troubleInfo.id }}</span>
                </li>
              </ul>
              <!-- 按钮 -->
              <div class="button-box">
                <button class="button" @click="troubleDetaildInfo">查看隐患详情</button>
              </div>
            </div>
          </template>
          <!-- 右侧收起 -->
          <!-- <div class="showBtns">
        <div
          v-if="!rightHide"
          :style="{ backgroundImage: `url(${right_hide})` }"
          @click="toHideRight"
        />
        <div
          v-else
          :style="{ backgroundImage: `url(${left_hide})` }"
          @click="toShowRight"
        />
      </div> -->
        </div>
      </div>
    </div>
    <template>
      <!-- v-max-dialog   公用弹窗css： fixed-dialog 全屏 -->
      <!-- :class="select_title ==='risk_trouble' ? 'div-dialog' : 'fixed-dialog'" -->
      <el-dialog
        v-max-dialog
        class="div-dialog"
        :title="dialogTitle"
        :visible.sync="showInfoDialog"
        width="70%"
        append-to-body
        :close-on-click-modal="false"
        top="8vh"
      >
        <!-- 查看隐患详情 -->
        <template v-if="select_title === 'risk_trouble'">
          <RiskTroubleDetail
            :timeLineProp="timeLineProp"
            :troubleDetail="troubleDetail"
          />
        </template>
        <template v-else>
          <!-- 操作规程卡operate-card -->
          <template v-if="currOnClickCardId === 'operate-card'">
            <DialogContentCard v-bind="propData" />
          </template>
          <!-- 应急处置卡:emergency-card -->
          <template v-else-if="currOnClickCardId === 'emergency-card'">
            <DialogContentCard v-bind="propData">
              <el-form-item slot="textArea" label="事件名称">
                <el-input
                  v-model="changeData.eventName"
                  class="large-box"
                  type="textarea"
                  :rows="4"
                  resize="none"
                />
              </el-form-item>
            </DialogContentCard>
          </template>
          <!-- 风险识别卡:risk-card -->
          <template v-else-if="currOnClickCardId === 'risk-card'">
            <DialogContentCard v-bind="propData">
              <el-form-item
                slot="inputText"
                label="分析单元类型"
                prop="analysisUnitType"
                :rules="[{ required: false, message: '无数据', trigger: 'change' }]"
              >
                <el-select
                  v-model="changeData.analysisUnitType"
                  class="small-box"
                  filterable
                  placeholder="无数据"
                >
                  <el-option
                    v-for="item in allDic.analysis_type"
                    :key="item.id"
                    :value="item.id"
                    :label="item.dictName"
                  />
                </el-select>
              </el-form-item>

              <el-form-item
                slot="inputText"
                label="分析单元"
                prop="analysisUnit"
                :rules="[{ required: false, message: '无数据', trigger: 'change' }]"
              >
                <el-select
                  v-model="changeData.analysisUnit"
                  class="small-box"
                  filterable
                  placeholder="无数据"
                >
                  <el-option
                    v-for="item in unitList"
                    :key="item.id"
                    :value="item.id"
                    :label="item.name"
                  />
                </el-select>
              </el-form-item>
              <el-form-item slot="textArea" label="风险描述">
                <el-input
                  v-model="changeData.riskDesc"
                  class="large-box"
                  type="textarea"
                  :rows="4"
                  resize="none"
                />
              </el-form-item>
            </DialogContentCard>
          </template>
          <!-- 岗位职责卡:job-card -->
          <template v-else-if="currOnClickCardId === 'job-card'">
            <DialogContentCard v-bind="propData">
              <el-form-item slot="textArea" label="责任范围">
                <el-input
                  v-model="changeData.responsibilityScope"
                  class="large-box"
                  type="textarea"
                  :rows="4"
                  resize="none"
                />
              </el-form-item>
            </DialogContentCard>
          </template>
          <!-- 安全风险分级管控清单：safe-ticker -->
          <template v-else-if="currOnClickCardId === 'safe-ticker'">
            <DialogContentTable
              :tableData="safeRiskLevelControlDataList"
              :dialogTitleId="currOnClickCardId"
            />
          </template>
          <!-- 危害因素辨识排查清单:harm-ticker -->
          <template v-else-if="currOnClickCardId === 'harm-ticker'">
            <DialogContentTable
              :tableData="riskEvaCheckDetailByPageDataList"
              :dialogTitleId="currOnClickCardId"
            />
          </template>
        </template>
      </el-dialog>
    </template>

    <!-- 风险单元查看弹窗 -->
    <el-dialog title="风险单元详情" width="70%" :visible.sync="riskUnitDialog">
      <el-tabs v-model="activeName">
        <el-tab-pane label="风险辨识" name="fxbs" style="height: 100%; overflow: auto">
          <Fxbs :uId="uId" />
        </el-tab-pane>
        <el-tab-pane
          label="隐患排查任务"
          name="pcrw"
          style="height: 100%; overflow: auto"
        >
          <Pcrw :uId="uId" />
        </el-tab-pane>
        <el-tab-pane
          label="隐患排查记录"
          name="pcjl"
          style="height: 100%; overflow: auto"
        >
          <Pcjl :uId="uId" />
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
// 限制深度选择器的作用范围，只影响 #risk-area 内的 el-table
#risk-area {
  position: relative;
  font-size: 12px;
  color: #ffffff;
  ::v-deep .el-table {
    .cell {
      color: #ffffff;
    }
  }
}
#risk-area .left-div {
  position: absolute;
  top: 0px;
  left: 0px;
  display: flex;
  flex-direction: column;
  .list-box {
    overflow: hidden;
  }
  .title-button {
    display: flex;
    justify-content: space-evenly;
    padding-bottom: 10px;
  }
  .showBtns {
    position: absolute;
    top: 50%;
    left: calc(100% - 95px);
    & > div {
      width: 18px;
      height: 61px;
      background-size: 100% 100%;
      cursor: pointer;
    }
  }
  &.hide {
    transform: translateX(calc(-100% + 100px));
  }
}
#risk-area .right-div {
  position: absolute;
  top: 0px;
  right: 0px;
  // width: 30%;
  // height: calc(100vh - 50px);
  // background-image: url("../../../assets/anhuan3d/right.png");
  // background-size: 100% 100%;
  // padding: 10px 20px 10px 100px;
  display: flex;
  flex-direction: column;
  .list-box {
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .list-title {
    color: #fff;
    font-size: 12px;
    font-weight: bold;
    border: 2px solid #0f81a3;
    background-color: #0f445d7a;
    padding: 6px;
  }
  /* ul 信息列表 */
  .ul-info-list {
    height: auto;
    border: 1px solid #0f81a3;
    /* margin-bottom: 10px; */
    /* 去除默认样式 ul li */
    ul {
      padding: 0px;
    }
    li {
      list-style: none;
      color: #fff;
      font-size: 12px;
      word-break: break-all;
      line-height: 24px;
      min-height: 24px;
      .label-key {
        /* margin-right: 2px;   */
        /* Span 下的width不可用 ,span有根据内容自动伸缩的能力  修改display：inline-block；*/
        display: inline-block;
        min-width: 55px;
      }
      /* 按钮类型 */
      button {
        /* 去除默认黑边 */
        border-style: none;
        width: 100%;
        padding: 8px;
        background-color: #0f445d40;
        border-top: 1px solid #0bb4c0;
        border-bottom: 1px solid #0bb4c0;
        margin-bottom: -1px;

        color: #ffffff;
        cursor: pointer;
      }
      button:hover {
        color: #47eff4;
        //border: 1px solid #ffffff;
      }
    }
  }
  .button-box {
    display: flex;
    justify-content: center;
    button {
      width: 100%;
      padding: 8px;
      font-size: 14px;
      color: #fff;
      background-color: #0f445d40;
      border: 1px solid #0bb4c0;
      cursor: pointer;
    }
    button:hover {
      color: #47eff4;
      font-size: 14px;
      border: 1px solid #ffffff;
    }
  }
  .showBtns {
    position: absolute;
    top: 50%;
    right: calc(100% - 95px);
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

// 文字搜索框
.txtSearchBox ::v-deep {
  > div {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 6px;
    > span {
      width: 80px;
      text-align: center;
      line-height: 24px;
    }
    .el-input {
      margin-bottom: 6px;
      input {
        background: transparent;
        border-color: #0f81a3;
        color: #fff;
      }
    }
  }
}
/* el-input-select 深度样式  选中输入框*/
.el-input-select ::v-deep {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;
  > span {
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    margin: 5px;
    width: 60px;
  }
  /* el-input 输入框 */
  .el-input__inner {
    background-color: transparent;
    border-color: #0f81a3;
    color: #fff;
  }
}

/* 下拉选项 */
::v-deep .el-select-option {
  background: #0f81a3d4 !important;
  border-color: #0f81a3;

  .el-popper[x-placement^="bottom"] .popper__arrow::after {
    border-bottom-color: #0f81a3d4 !important;
    z-index: 999;
  }
  .popper__arrow {
    border: none !important;
  }

  /* 文字样式 */
  .el-select-dropdown__item {
    color: #fff !important;
    z-index: 999;
    max-width: 250px;
  }
  /* 鼠标经过 */
  .el-select-dropdown__item.hover {
    background-color: #0794a980 !important;
    color: #29f9ff !important;
    z-index: 999;
  }
  // 被选中
  .el-select-dropdown__item.selected {
    background-color: #11c0da96 !important;
  }

  /*多选  显示目标文字  修改位置  孙代选择器*/
  > .el-select__tags {
    top: 0%;
    transform: translateY(10%);
  }
}
/*多选  显示目标文字 */
::v-deep .el-tag.el-tag--info {
  background-color: transparent !important;
  border: none;
  color: #ffffff !important;
  z-index: 999;
}

/* el-table 深度样式表格透明 */
.comm-table ::v-deep {
  color: #fff;
  background: transparent;
  border: 1px solid #0f81a3;
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

  // .el-table {
  //   .cell {
  //     color: #fff !important;
  //   }
  // }

  //选中高亮
  .current-row > td {
    background: #0794a980 !important;
    border-left: none;
    border-right: none;
  }

  //滑动条 -条空位
  .el-table__body {
    width: 100% !important;
  }
  //滑动条 -表头部位置
  .el-table__cell.gutter {
    display: none !important;
    width: 0px;
  }
  colgroup col[name="gutter"] {
    display: none;
    width: 0px;
  }
}

/* 表头样式 .el-table__heade*/
::v-deep .el-table .table_header,
.el-table__heade {
  /* background: #0c8ab0af !important; */
  border-bottom: 1px solid #0f81a3 !important;
}

/* el-table 行高亮 */
::v-deep .el-table .el-table-row-highlight {
  background: #105d749c;
}

/* el-table去掉表格最底横线 */
::v-deep.el-table::before {
  height: 0px;
}

/* 带图片的标题 */
.titleImage {
  background-size: 100% 100%;
  display: flex;
  align-items: center;
  color: #ffffff;
  font-size: 14px;
  margin-right: 5px;
  cursor: pointer;
  img {
    margin: 10px;
    height: 20px;
    width: 20px;
  }
  span {
    margin-right: 10px;
    color: #ffffff;
    font-weight: bold;
    text-shadow: 0px 0px 1px #11c8e5, 0px 1px 5px #11c8e5, 0px 1px 10px #11c8e5;
    /*text-shadow: 0 0 10px #32ff7e, 0 0 20px #32ff7e, 0 0 30px #32ff7e,
        0 0 40px #32ff7e, 0 0 100px #32ff7e, 0 0 200px #32ff7e; */
  }
  > span:hover {
    color: #ffffff;
    text-shadow: 0px 0px 2px #04425f;
  }
}
.active {
  color: #47eff4;
  font-size: 14px;
}

/* 共有文字标题 */
.comm-title {
  display: flex;
  align-items: center;
  height: 26px;
  font-size: 14px;
  font-weight: bold;
  color: #ffffff;
  padding-bottom: 10px;
  img {
    width: 16px;
    margin-right: 6px;
  }
}

//弹窗样式
.div-dialog ::v-deep {
  /* display: flex;
    flex-direction: column;
    ::before {
        height: 0px;
    }

    .el-dialog{
        background: #134a5acf;
        border: 1px solid #0f81a3;
        border-radius: 15px;
    }
    .el-dialog__title {
        color: aliceblue;
    }
    .el-dialog__header {
        //background: #134a5acf;
    }
    .el-dialog__body {
        //background: #134a5acf;
    }
    .el-image{
        margin: 5px;
        border: 1px solid #0f81a3;
    } */
  .el-dialog__header {
    background: #e5e5e5;
    min-height: 56px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .el-dialog__headerbtn {
      position: inherit;
    }
    .el-dialog__title {
      display: flex;
      align-items: center;
      font-weight: bold;
      font-size: 18px;
    }
    .el-dialog__title::before {
      display: inline-block;
      content: "";
      margin: 0 10px 0 0;
      width: 4px;
      height: 24px;
      background-color: #409eff;
    }
  }
  .el-dialog {
    height: 90vh;
    margin: 5vh auto !important;
    overflow: hidden;
    background-color: white;
  }
}
::v-deep .el-dialog__body {
  height: calc(70vh);
  padding: 10px 24px 0 24px;
}
.dialog-info {
  height: calc(100% - 64px);
  padding: 0 0 10px 0;
  overflow-y: auto;
}
.el-dialog__footer {
  background: #ffff00 !important;
}
.dialog-footer {
  width: 100%;
  height: 64px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: #e4e7ed;
}

.risk-des {
  padding: 4px 6px;
  border-radius: 2px;
  background: #67c23a;
  display: inline-block;
  width: 60px;
}

/* 富文本 文字区域 */
.large-box {
  width: 770px;
}
.small-box {
  width: 320px;
}

::v-deep .el-tabs {
  height: 100%;
}

::v-deep .el-tabs__content {
  height: 90%;
}
// ::v-deep.a199-dialog {
//   .el-dialog__header {
//     min-height: 50px;
//     border-bottom: 1px solid #eee;
//   }
//   .el-dialog__body {
//     padding-top: 0px;
//   }
// }
</style>
