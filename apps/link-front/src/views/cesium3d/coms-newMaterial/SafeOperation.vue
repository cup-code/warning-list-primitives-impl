<script>
import n03 from "@/assets/anhuan3d/03.png";
import left_hide from "@/assets/anhuan3d/left_hide.png";
import right_hide from "@/assets/anhuan3d/right_hide.png";
// import { getAllDepartByCompanyFn } from '@/http/safe-production/depart-manage-api'
// import { getWorkRecord,getWorkDetail } from '@/http/specialOperation/specialWork-api.js'
import JessibucaPlayer from "@/components/JessibucaPlayer/index";
import { videoById } from "@/http/hkAi-api.js";
// 作业票信息
// import { getWorklistAll, getContractorVisibleLogin } from '@/http/specialOperation/specialBook-api.js'
import {
  getAllDepartByCompanyFn, // 获取作业票详情
  getCountByType, // 饼图  按作业票类型统计作业数量 // 查询作业流转记录
  getWorkDetail,
  getWorklistAll, // 查询指定公司下的所有部门
  getWorkRecord,
} from "@/http/map/gis-map.js";
import BaseInfo from "./components/baseInfo.vue";
import DialogFlowRecord from "./components/DialogFlowRecord.vue";
import DialogPublicForm from "./components/DialogPublicForm.vue";
import { zq_config } from "./js/index.js";

export default {
  // 作用安全(特殊作用)
  name: "SafeOperation",
  components: { JessibucaPlayer, DialogFlowRecord, BaseInfo, DialogPublicForm },
  data() {
    return {
      n03,
      left_hide,
      right_hide,

      companyId: "",

      ticketStatusList: zq_config.ticketStatusList, // 作业票状态列表,
      ticketTypeList: zq_config.ticketTypeList, // 作业票类型
      // 搜索 作业编号
      searchKey: "",

      // 所有的作业票
      allOperationData: [],

      // 全局过滤作业状态后 作业票
      operationInfoData: [],

      // 申请单位数据
      applicantList: [],
      // 特殊作业信息  详情
      operationDetails: {
        workInfo: {},
      },

      // 作业票状态
      workStatus: [
        // {id: -2, name: '作业预期'},
        // {id: -1, name: '作业终止'},
        { id: 0, name: "申请中" },
        // {id: 1, name: '审批告知配置中'},
        // {id: 2, name: '审批中'},
        { id: 3, name: "作业中" }, // 作业中
        { id: 4, name: "暂停作业" },
        // {id: 5, name: '作业完成'},
        { id: 6, name: "已经验收" },
        { id: 7, name: "全部作业" },
      ],
      // 7 所有作业票
      currWorkStaus: 7, // 默认作业中

      // 选择的id
      activeId: "",

      value: "",
      // 过滤条件
      searchKey_company: "", // 申请单位
      searchKey_name: "", // 申请人

      // 弹窗：
      showInfoDialog: false,
      // 弹窗：作业票 true   流转记录 false
      showOperationTicket: true,
      showWorkData: false,
      workData: {},
      // 作业票列表
      srcList: ["ticket.jpg", "workers01.png", "ticket.jpg"],

      // 流转记录
      // responsible person
      flowRecordData: [],

      searchData: {
        applyUserName: "",
        departmentId: "",
        jobNumber: "",
        workEnd: "",
        workStart: "",
      },
      // 当前时间
      nowTime: "",

      videoId: "",
      videoUrl: "",
      isVideo: false, // 是否有视频 false 为无视频

      countTypeParams: {
        companyId: "",
        workEnd: "",
        workStart: "",
      },
      // 饼图 统计类型数据
      countTypeData: [],
      // 消防点位分布图 (左侧饼图)
      chartStyleLeft: { float: "left", width: "100%", height: "300px" }, // 图表样式
      myChart_left: undefined,
    };
  },
  computed: {
    /* 翻译常量文字 */
    setConstant() {
      return function (value, constList) {
        let des = "-";
        for (const item of constList) {
          if (item.value == value) {
            des = item.label;
            break;
          }
        }
        return des;
      };
    },
    // 搜索计算
    searchDataList() {
      if (this.searchKey_company === "" && this.searchKey_name === "") {
        return this.operationInfoData;
      } else {
        // 合并去重 let newArr = Array.from(new Set([...arr,...arr1]))
        let array_company = [];
        let array_name = [];
        // let arrayMerge = [];
        if (this.searchKey_company != "") {
          array_company = this.operationInfoData.filter((item) =>
            item.applyUnitName.includes(this.searchKey_company)
          );
        }
        if (this.searchKey_name != "") {
          array_name = this.operationInfoData.filter((item) =>
            item.applyUserName.includes(this.searchKey_name)
          );
        }

        return Array.from(new Set([...array_company, ...array_name]));
      }
    },

    leftHide() {
      return this.$store.state.newMaterial.isExpand;
    },
    rightHide() {
      return this.$store.state.newMaterial.isExpand;
    },
  },
  created() {
    this.companyId = this.$store.state.user.user.companyId;
    this.countTypeParams.companyId = this.companyId;
    // Date.parse(time)/1000);日期转换成秒=就是时间戳  10位时间戳
    this.nowTime = this.formatTime(Date.parse(new Date()));
    // this.nowTime = this.moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
  },
  mounted() {
    this.getAllDepartByCompany();
    // 获取作业票信息列表
    this.getOperationTicketData();

    this.$nextTick(() => {
      if (this.operationInfoData.length > 0) {
        // 设置高亮
        this.$refs.elTable.setCurrentRow(this.operationInfoData[0]);
      }
    });
  },
  // 进入组件
  // activated(){},
  // 退出组件
  deactivated() {
    if (this.$refs.jessibucaVideo) {
      // 销毁视频
      this.destoryVideo();
    }
  },

  methods: {
    // 当前时间 致 当天零点时间
    getCurrTimeToZeroTime() {
      const now = new Date();
      const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const startTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const zeroTime = new Date(
        nextDay.getFullYear(),
        nextDay.getMonth(),
        nextDay.getDate()
      );
      // 输出24小时后的0点时间
      return {
        workEnd: this.moment(zeroTime).format("YYYY-MM-DD HH:mm:ss"),
        workStart: this.moment(startTime).format("YYYY-MM-DD HH:mm:ss"),
      };
    },

    getCountByTypeData(workEnd, workStart) {
      this.countTypeParams.workEnd = workEnd;
      this.countTypeParams.workStart = workStart;
      getCountByType(this.countTypeParams)
        .then((res) => {
          if (res.data.success) {
            this.countTypeData = res.data.result || [];
            const pieDataLeft = [];
            this.countTypeData.forEach((item) => {
              pieDataLeft.push({
                name: item.workTicketTypeName,
                value: item.count,
              });
            });
            this.$nextTick(() => {
              this.initEchartsLeft(pieDataLeft);
            });
          } else {
            this.$message.warning(res.data.message || "获取作业票类型统计作业数量失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取作业票类型统计作业数量出错", err);
        })
        .finally(() => {});
    },
    // 作业票类型统计  分布图 (左侧饼图)
    initEchartsLeft(pieData) {
      const selectedObj = {};
      pieData.forEach((item) => {
        if (item.value === 0) {
          selectedObj[item.name] = false;
        }
      });
      // 饼图
      const option = {
        tooltip: {
          trigger: "item",
        },
        legend: {
          // value 为 0 的 legend为灰色，不在饼图体现
          selected: selectedObj,
          // 图例
          left: "2%",
          top: "0%",
          orient: "horizontal",
          itemWidth: 12,
          itemHeight: 10,
          // 水平 horizontal //垂直 vertical
          textStyle: {
            color: "#ffffff",
            fontSize: 10,
          },
        },
        // 颜色数组顺序对应 pieData
        color: ["#5087ec", "#64b4bd", "#57a45b", "#f2bd42"],
        series: [
          {
            type: "pie",
            label: {
              color: "#ffffff",
              // 统一使用白色
              show: true,
              formatter: "{b} :\n {c} ({d}%)", // b代表名称，c代表对应值，d代表百分比
            },
            radius: "35%",
            center: ["50%", "50%"],
            // 饼图半径
            data: pieData,
          },
        ],
      };

      // 初始化 div
      const echarts_div = this.$refs.echresDiv_left;
      if (echarts_div) {
        this.myChart_left = this.$echarts.init(echarts_div);
        this.myChart_left.setOption(option);
        // 随着屏幕大小调节图表
        window.addEventListener("resize", () => {
          this.myChart_left.resize();
        });
      }
    },

    // 获取作业票 ( 作业台账 )
    getOperationTicketData() {
      const { workEnd, workStart } = this.getCurrTimeToZeroTime();
      console.log(workStart, " safeOperation time:", workEnd);
      this.getCountByTypeData(workEnd, workStart);

      this.searchData.workStart = workStart;
      this.searchData.workEnd = workEnd;
      this.searchData.companyId = this.companyId;

      getWorklistAll(this.searchData)
        .then((res) => {
          if (res.data.success) {
            this.allOperationData = [];
            this.operationDetails = { workInfo: {} };
            const dataList = res.data.result || [];
            console.log("dataList:", dataList);
            if (dataList.length > 0) {
              // 是否有电子围栏
              // this.allOperationData = dataList.filter((item) => item.hasOwnProperty('locationCoordinates') && item.locationCoordinates.length >= 3)
              this.allOperationData = dataList;
              // 通过作业状态过滤
              if (this.workStatus[this.workStatus.length - 1].id === this.currWorkStaus) {
                this.operationInfoData = this.allOperationData;
              } else {
                this.operationInfoData = this.allOperationData.filter((item) => {
                  return item.ticketStatus === this.currWorkStaus;
                });
              }
              // 默认显示第 0 个作业的详情
              if (this.operationInfoData.length > 0) {
                // 复制合并对象到目标对象 Object.assign // 目标对象 {}
                this.operationDetails = Object.assign(
                  {},
                  this.operationDetails,
                  this.operationInfoData[0]
                );

                console.log("operationDetails:", this.operationDetails);
                // 点位到 map电子围栏
                // this.$store.dispatch('newMaterial/locateTo3dIcon', {id: this.operationInfoData[0].id,type:''});
                this.$emit("locationToMap", {
                  id: this.operationInfoData[0].id,
                  type: "",
                });
                // 视频链接
                if (this.operationDetails && this.operationDetails.cameraId) {
                  this.getVideoByIdFn(this.operationDetails.cameraId);
                } else {
                  // 销毁视频
                  if (this.$refs.jessibucaVideo) {
                    this.destoryVideo();
                  }
                }
                this.$refs.elTable.setCurrentRow(this.operationInfoData[0]);
              }
            }
          } else {
            this.$message.warning(res.data.message || "获取作业票信息失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取作业票信息出错", err);
        })
        .finally(() => {});
    },

    // 全局 过滤作业状态
    filterWorkState(state) {
      // 所有作业类型
      if (this.workStatus.at(-1).id === state) {
        this.operationInfoData = this.allOperationData;
      } else {
        this.operationInfoData = this.allOperationData.filter((item) => {
          return item.ticketStatus === state;
        });
      }
    },

    // 按
    // 查询指定公司下的所有部门
    getAllDepartByCompany() {
      getAllDepartByCompanyFn(this.companyId).then(({ data }) => {
        if (data.success) {
          this.applicantList = data.result || [];
        }
      });
    },
    // 点击到3d
    clickLocationTo3d(row) {
      for (let i = 0; i < this.operationInfoData.length; i++) {
        if (this.operationInfoData[i].id === row.id) {
          this.operationDetails = this.operationInfoData[i];
          if (this.operationDetails && this.operationDetails.cameraId) {
            this.getVideoByIdFn(this.operationDetails.cameraId);
          } else {
            // 销毁视频
            if (this.$refs.jessibucaVideo) {
              this.destoryVideo();
            }
          }
        }
      }
      // 定位到 地图标记
      // this.$store.dispatch('newMaterial/locateTo3dIcon', {id: row.id, type:''});
      this.$emit("locationToMap", { id: row.id, type: "" });
    },
    // 来自地图点击
    from3dMapClick(markerObj) {
      if (this.operationInfoData.length > 0) {
        for (let i = 0; i < this.operationInfoData.length; i++) {
          if (this.operationInfoData[i].id === markerObj.id) {
            // 设置高亮
            this.$refs.elTable.setCurrentRow(this.operationInfoData[i]);
            this.operationDetails = this.operationInfoData[i];
          }
        }
      }
    },
    // 清空搜索
    clearSearch() {
      this.operationInfoData = [];
      this.getOperationTicketData();
    },

    // 作业票
    operationTicket(item) {
      console.log("作业票id:", item.id);
      getWorkDetail(item.id).then(({ data }) => {
        console.log("作业票详情:", data);
        if (data.success) {
          this.workData = data.result || {};
          console.log("====", this.workData);
        }
      });
      this.showInfoDialog = true;
      this.showOperationTicket = true;
    },
    // 获取摄像头路径
    getVideoByIdFn(id) {
      console.log("视频id:", id);
      if (id === "") {
        return;
      } else {
        // 清除上一次的视频
        if (this.$refs.jessibucaVideo) {
          this.destoryVideo();
        }
        this.isVideo = true;
      }

      // 3551
      // console.log('视频id:',id);
      videoById(id)
        .then(({ data }) => {
          if (data.success) {
            if (window.g.IS_HTTPS) {
              this.videoUrl = data.result.https_flv;
            } else {
              this.videoUrl = data.result.flv;
            }
            // 暂停视频
            this.$nextTick(() => {
              this.$watch(
                () => {
                  return this.$refs.jessibucaVideo?.videoLoaded;
                },
                (newValue) => {
                  console.log("值变化：", newValue);
                  if (newValue) {
                    this.$refs.jessibucaVideo.methods_pause();
                    this.$refs.jessibucaVideo.$el.childNodes[0].querySelector(
                      ".jessibuca-play-big"
                    ).style.display = "block";
                    // playDiv.addEventListener('click',() => {
                    //   this.$refs.jessibucaVideo.jessibuca_load();
                    // })
                  }
                },
                { deep: true }
              );
            });
          } else {
            this.$message.warning(res.data.message || "获取视频数据失败");
          }
        })
        .catch((err) => {
          this.$message.error("获取视频数据出错", err);
        })
        .finally(() => {});
    },
    // 销毁视频
    destoryVideo() {
      this.$refs.jessibucaVideo.methods_destroy();
      this.videoUrl = "";
      this.isVideo = false;
    },

    // 流转记录
    flowRecord() {
      getWorkRecord({
        businessId: this.operationDetails.id,
        mainId: this.operationDetails.id,
      }).then(({ data }) => {
        if (data.success) {
          this.flowRecordData = data.result || [];
        }
      });
      this.showInfoDialog = true;
      this.showOperationTicket = false;
    },
    // el-table 表行高亮(index%2)===0为偶数
    el_tableRowClassName({ row, rowIndex }) {
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
  <div class="safe-operation">
    <div
      class="left-div w-[24%] h-[calc(100vh-66px)] absolute left-0 top-0 rounded-lg overflow-hidden mx-3 transition-all duration-300 ease-in-out"
      :class="leftHide ? 'translate-x-[-106%] ease-out' : ''"
    >
      <div
        class="h-[calc(100vh-66px)] flex flex-col rounded-lg overflow-hidden border border-primary-dark-light backdrop-blur-lg p-2 box-border"
      >
        <div
          class="h-1/2 rounded-md p-2 overflow-hidden mb-3 backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
        >
          <!-- 标题 固定高 -->
          <el-row style="display: flex; align-items: center; height: 26px">
            <el-col :span="8">
              <div class="comm-title">
                <img :src="n03" />
                <span>今日特殊作业</span>
              </div>
            </el-col>
            <el-col :span="16">
              <div class="el-input-select-option">
                <el-select
                  v-model="currWorkStaus"
                  :popper-append-to-body="false"
                  popper-class="el-select-option"
                  @change="filterWorkState"
                >
                  <el-option
                    v-for="item in workStatus"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </div>
            </el-col>
          </el-row>
          <!-- 搜索框和选择检索 -->
          <div class="el-input-select">
            <!-- 作业编号 检索 -->
            <!-- <el-row>
          <el-col :span="6">
            <span>作业编号</span>
          </el-col>
          <el-col :span="18">x`1
            <el-input v-model="searchData.jobNumber" clearable prefix-icon="el-icon-search" placeholder="请输入作业编号" @clear="clearSearch" />
          </el-col>
        </el-row> -->
            <!-- 选择和检索 -->
            <el-row>
              <!-- <el-col :span="10">
            <el-select :popper-append-to-body="false" popper-class="el-select-option" v-model="searchData.departmentId" clearable filterable placeholder="检索申请单位" @clear="clearSearch">
              <el-option v-for="item in applicantList" :key="item.id" :label="item.departmentName" :value="item.id"> </el-option>
            </el-select>
          </el-col> -->
              <!-- 申请人 检索 -->
              <el-col :span="21">
                <el-input
                  v-model="searchData.applyUserName"
                  clearable
                  placeholder="检索申请人"
                  @clear="clearSearch"
                />
              </el-col>
              <el-col :span="3">
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  style="width: 100%"
                  @click="getOperationTicketData"
                />
              </el-col>
            </el-row>
          </div>
          <!-- 特殊作业表 -->
          <div class="list-box">
            <el-table
              ref="elTable"
              header-cell-class-name="table_header"
              :row-class-name="el_tableRowClassName"
              class="comm-table"
              :data="operationInfoData"
              height="80%"
              :highlight-current-row="true"
              @row-click="clickLocationTo3d"
            >
              <el-table-column label="序号" type="index" align="center" width="45" />
              <el-table-column prop="jobNumber" label="作业编号" align="center" />
              <el-table-column prop="applyUnitName" label="申请单位" align="center" />
              <el-table-column prop="applyUserName" label="申请人" align="center" />
            </el-table>
          </div>
        </div>

        <!-- 作业类型统计 分布图 -->
        <div
          class="h-1/2 rounded-md p-2 overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
        >
          <div class="comm-title">
            <img :src="n03" />
            <span>作业分类统计</span>
          </div>
          <div ref="echresDiv_left" :style="chartStyleLeft" />
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
    <div
      class="right-div w-[24%] h-[calc(100vh-66px)] absolute right-0 top-0 rounded-lg overflow-hidden mx-3 transition-all duration-300 ease-in-out"
      :class="rightHide ? 'translate-x-[106%]' : ''"
    >
      <div
        class="h-[calc(100vh-66px)] flex flex-col rounded-lg overflow-y-auto border border-primary-dark-light backdrop-blur-lg p-2 box-border"
      >
        <div
          class="rounded-md p-2 mb-3 overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
        >
          <!-- 标题 -->
          <div class="comm-title">
            <img :src="n03" />
            <span>特殊作业信息</span>
          </div>
          <!-- 信息列表 -->
          <div class="div-ul-box">
            <ul style="padding-left: 12px">
              <li>
                <span class="label-key">作业编号 :</span
                ><span>{{ operationDetails.jobNumber || "-" }}</span>
              </li>
              <li>
                <span class="label-key">状态 :</span>

                <template>
                  <span
                    v-if="
                      nowTime > operationDetails.workEndDate &&
                      (operationDetails.ticketStatus == 0 ||
                        operationDetails.ticketStatus == 1 ||
                        operationDetails.ticketStatus == 2 ||
                        operationDetails.ticketStatus == 3)
                    "
                    >已过期</span
                  >
                  <span v-else>{{
                    setConstant(operationDetails.ticketStatus, ticketStatusList)
                  }}</span>
                </template>
              </li>
              <li>
                <span class="label-key">申请单位 :</span
                ><span>{{ operationDetails.applyUnitName || "-" }}</span>
              </li>
              <li>
                <span class="label-key">申请人 :</span
                ><span>{{ operationDetails.applyUserName || "-" }}</span>
              </li>
              <li>
                <span class="label-key">作业类型 :</span>
                <span>{{
                  setConstant(operationDetails.workTicketType, ticketTypeList)
                }}</span>
              </li>
              <li>
                <span class="label-key">作业内容 :</span
                ><span>{{ operationDetails.workInfo.workContent || "-" }}</span>
              </li>
              <li>
                <span class="label-key">作业位置 :</span
                ><span>{{ operationDetails.workInfo.workAddress || "-" }}</span>
              </li>
              <li>
                <span class="label-key">作业时间 :</span
                ><span>{{ operationDetails.actualStartTime || "-" }}</span>
              </li>
            </ul>
            <!-- 两个按钮 -->
            <div class="button-box">
              <button class="button" @click="operationTicket(operationDetails)">
                作业票
              </button>
              <button class="button" @click="flowRecord">流转记录</button>
            </div>
          </div>
        </div>
        <div
          class="rounded-md p-2 flex-auto mb-3 overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
        >
          <!-- 现场视频 -->
          <div class="comm-title">
            <img :src="n03" />
            <span>现场视频</span>
          </div>
          <div class="div-video">
            <div class="video">
              <!-- setHeight="50%"  -->
              <JessibucaPlayer
                :id="Math.floor(Math.random() * 10 + 1)"
                ref="jessibucaVideo"
                :videoUrl="videoUrl"
              />
              <template v-if="!isVideo">
                <div class="play-button" />
                <span class="tipText">暂无视频</span>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 弹出信息  作业票 和 流转记录 -->
    <div>
      <el-dialog
        v-max-dialog
        class="div-dialog"
        :title="showOperationTicket ? '作业票' : '流转记录'"
        :visible.sync="showInfoDialog"
        width="70%"
        append-to-body
        :close-on-click-modal="false"
        top="8vh"
      >
        <template v-if="showOperationTicket">
          <!-- 作业票 -->
          <!-- <el-image
            v-for="(url, index) in srcList"
            :key="index"
            style="width: 100px; height: 100px"
            :src="'./source/anhuan3d/' + url"
            :preview-src-list="['./source/anhuan3d/' + url]"
          >
          </el-image> -->
          <!-- <DialogPublicForm :workData="workData"></DialogPublicForm> -->

          <BaseInfo
            v-if="workData.workTicketType !== '1003'"
            class="form-item"
            :baseForm="workData"
          />
        </template>
        <template v-else>
          <!-- 流转记录 -->
          <DialogFlowRecord :tableData="flowRecordData" />
        </template>
      </el-dialog>
    </div>
    <!-- 弹窗 显示作业票 -->
  </div>
</template>

<style lang="scss" scoped>
.safe-operation {
  position: relative;
  font-size: 12px;
  color: #ffffff;
  /* 去掉表格最底横线 */
  .comm-table {
    &::before {
      height: 0px;
    }
  }
}
.safe-operation .left-div {
  // position: absolute;
  // top: 0px;
  // left: 0px;
  // width: 30%;
  // height: calc(100vh - 50px);
  // background-image: url("../../../assets/anhuan3d/left.png");
  // background-size: 100% 100%;
  // padding: 10px 100px 10px 20px;
  // display: flex;
  // flex-direction: column;
  .list-box {
    /* border-top: 1px solid #0f81a3; */
    overflow: hidden;
    height: 100%;
    margin-bottom: 10px;

    ::v-deep .el-table .cell {
      color: #fff !important;
    }
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
.safe-operation .right-div {
  // position: absolute;
  // top: 0px;
  // right: 0px;
  // width: 30%;
  // height: calc(100vh - 50px);
  // background-image: url("../../../assets/anhuan3d/right.png");
  // background-size: 100% 100%;
  // display: flex;
  // flex-direction: column;
  // padding: 10px 20px 10px 100px;
  .div-ul-box {
    height: 270px;
    border: 1px solid #0f81a3;
    margin-bottom: 10px;
    li {
      list-style: none;
      color: #fff;
      font-size: 12px;
      line-height: 24px;
      .label-key {
        margin-right: 10px;
      }
    }
  }
  .button-box {
    display: flex;
    justify-content: center;
    button {
      width: 120px;
      margin: 10px 10px 10px 10px;
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
  .div-video {
    display: flex;
    flex-direction: column;
    padding: 10px 10px 0px 10px;
    height: 92%;
    border: 1px solid #0f81a3;
    overflow-y: auto;
    overflow: hidden;
    .video {
      position: relative;
      height: 50%;
      border: 1px solid #0f81a3;
      background: url("../../../assets/anhuan3d/video.png");
      background-repeat: no-repeat;
      background-size: 100% 100%;
      margin-bottom: 10px;
      .play-button {
        z-index: 99;
        position: absolute;
        top: 0%;
        height: 100%;
        width: 100%;
        background: #00000075;
        border: 1px solid #0f81a3;
      }
      .tipText {
        z-index: 100;
        position: absolute;
        top: 50%;
        left: 40%;
        color: #e4e7ed;
        font-size: 14px;
        text-align: center;
      }
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

/*  深度样式  输入框*/
.el-input-select ::v-deep {
  // height: 76px;
  > div {
    //display: flex;
    //flex-wrap: nowrap;
    //justify-content: space-between;
    margin-bottom: 6px;
    span {
      color: #fff;
      font-size: 14px;
      font-weight: bold;
      line-height: 24px;
      padding-left: 5px;
    }
  }
  /* el-input 输入框 */
  .el-input__inner {
    background-color: transparent;
    border-color: #0f81a3;
    color: #fff;
  }
}

/* 不带输入框 */
.el-input-select-option ::v-deep {
  padding-bottom: 10px;
  width: 100%;
  > div {
    position: relative;
    width: 100%;
  }
  /* el-input 输入框 */
  .el-input__inner {
    background-color: transparent;
    border-color: #0f81a3;
    color: #fff;
    font-size: 14px;
    font-weight: bold;
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

  /*多选 显示目标文字  修改位置  孙代选择器*/
  > .el-select__tags {
    top: 0%;
    transform: translateY(10%);
  }
}
/*多选 显示目标文字 */
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
    width: 0px !important;
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

/* 表头样式 */
::v-deep .el-table .table_header {
  /* background: #0c8ab0af !important; */
  border-bottom: 1px solid #0f81a3 !important;
}

/* el-table 行高亮 */
::v-deep .el-table .el-table-row-highlight {
  background: #105d749c;
}

/* el-table去掉表格最底横线 */
/* ::v-deep.el-table::before {
    height: 0px;
} */

/* 公用-文字标题样式 */
.comm-title {
  display: flex;
  align-items: center;
  height: 26px;
  font-size: 13px;
  font-weight: bold;
  color: #fff;
  padding-bottom: 10px;
  img {
    width: 16px;
    margin-right: 6px;
  }
}
.div-dialog {
  padding-bottom: 30px;
}
.div-dialog ::v-deep {
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
    margin: 3vh auto !important;
    overflow: hidden;
    background-color: white;
  }
  .el-dialog__body {
    height: calc(90vh - 56px);
    overflow-y: scroll;
    padding: 24px 24px 0 24px;
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

  ::v-deep .el-table .cell {
    color: #222 !important;
  }
}
</style>
