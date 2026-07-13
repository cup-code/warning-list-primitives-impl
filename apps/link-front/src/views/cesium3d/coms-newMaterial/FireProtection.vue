<script>
import n03 from "@/assets/anhuan3d/03.png";
import glgb from "@/assets/anhuan3d/glgb.png";
import left_hide from "@/assets/anhuan3d/left_hide.png";
import right_hide from "@/assets/anhuan3d/right_hide.png";
import {
  firePointById,
  getAllBackListFn,
  getAllFirePointFn,
} from "@/http/map/gis-map.js";

export default {
  // 消防管理
  name: "FireProtetion",
  data() {
    return {
      n03,
      left_hide,
      right_hide,
      glgb,
      sFormLeft: {
        code: "",
        companyId: "",
        isDrawed: "1", // 只查询已经在地图标注的数据
      },
      sFormRight: {
        companyId: "",
        pointId: "",
        isDrawed: "1", // 只查询已经在地图标注的消防点位的工单回执
      },
      pointList: [], // 左侧的消防点位列表
      alarmList: [], // 右侧的报警列表
      pointDetail: {}, // 右侧的测点详情
      singlePointAlarmList: [], // 单个点的报警记录
      // 消防点位分布图 (左侧饼图)
      chartStyleLeft: { float: "left", width: "100%", height: "300px" }, // 图表样式
      // 报警情况统计图 (右侧饼图)
      chartStyleRight: { float: "left", width: "100%", height: "300px" }, // 图表样式
      myChart_left: undefined,
      myChart_right: undefined,
      showAlarmList: true,
      showAlarmDetail: false,
    };
  },
  computed: {
    leftHide() {
      return this.$store.state.newMaterial.isExpand;
    },
    rightHide() {
      return this.$store.state.newMaterial.isExpand;
    },
    countFirePointList() {
      if (this.sFormLeft.code === "") {
        return this.pointList;
      } else {
        return this.pointList.filter((item) =>
          item.alarmCode.includes(this.sFormLeft.code)
        );
      }
    },
  },
  mounted() {
    this.sFormLeft.companyId = this.$store.state.user.user.companyId;
    this.sFormRight.companyId = this.$store.state.user.user.companyId;
    this.getPointList();
    this.getAlarmList();
  },
  methods: {
    // 获取左侧点位列表
    getPointList() {
      getAllFirePointFn(this.sFormLeft).then(({ data }) => {
        this.pointList = data.result || [];
        // 转换为左侧饼图需要的数据格式
        const pieDataLeft = [];
        this.pointList.forEach((item) => {
          const pie = pieDataLeft.find((pie) => {
            return pie.name === item.alarmType;
          });
          if (pie) {
            pie.value += 1;
          } else {
            pieDataLeft.push({
              name: item.alarmType,
              value: 1,
            });
          }
        });
        this.$nextTick(() => {
          this.initEchartsLeft(pieDataLeft);
        });
      });
    },
    // 获取点位详情
    getPointDetail(id) {
      firePointById(id).then(({ data }) => {
        this.pointDetail = data.result || {};
      });
    },
    // 获取右侧报警列表
    getAlarmList() {
      getAllBackListFn(this.sFormRight).then(({ data }) => {
        if (this.sFormRight.pointId) {
          // 如果有消防点位id，则说明是查询单个点的报警记录
          this.singlePointAlarmList = data.result || [];
          return;
        }
        this.alarmList = data.result || [];
        // 转换为左侧饼图需要的数据格式
        const pieDataRight = [];
        this.alarmList.forEach((item) => {
          const pie = pieDataRight.find((pie) => {
            return pie.name === item.alarmType;
          });
          if (pie) {
            pie.value += 1;
          } else {
            pieDataRight.push({
              name: item.alarmType,
              value: 1,
            });
          }
        });
        this.$nextTick(() => {
          this.initEchartsRight(pieDataRight);
        });
      });
    },
    clickAlarmItem(row) {
      // 定位到 地图危险源
      // this.$store.dispatch('newMaterial/locateTo3dIcon',{id:row.id,type:''});
      this.$emit("locationToMap", { id: row.id, type: "" });
      this.from3dMapClick({ id: row.id, type: "", name: "" });
    },
    // 来自地图点击
    from3dMapClick(markerObj) {
      this.showAlarmDetail = true;
      this.showAlarmList = false;
      this.getPointDetail(markerObj.id);
      this.sFormRight.pointId = markerObj.id;
      this.getAlarmList();
    },
    toAlarmList() {
      this.showAlarmDetail = false;
      this.showAlarmList = true;
    },
    // 消防点位分布图 (左侧饼图)
    initEchartsLeft(pieData) {
      // 饼图
      const option = {
        tooltip: {
          trigger: "item",
        },
        legend: {
          // 图例
          left: "2%",
          top: "0%",
          orient: "horizontal", // 水平 horizontal //垂直 vertical
          textStyle: {
            color: "#ffffff",
          },
        },
        // 颜色数组顺序对应 pieData
        color: ["#5087ec", "#64b4bd", "#57a45b", "#f2bd42"],
        series: [
          {
            type: "pie",
            label: {
              color: "#ffffff", // 统一使用白色
              show: true,
              formatter: "{b} :\n {c} ({d}%)", // b代表名称，c代表对应值，d代表百分比
            },
            radius: "40%", // 饼图半径
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
    // 报警情况统计图 (右侧饼图)
    initEchartsRight(pieData) {
      // 饼图
      const option = {
        tooltip: {
          trigger: "item",
        },
        legend: {
          // 图例
          left: "2%",
          top: "0%",
          orient: "horizontal", // 水平 horizontal //垂直 vertical
          textStyle: {
            color: "#ffffff",
            // fontSize: '20px',
            // fontWeight: 700
          },
        },
        // 颜色数组顺序对应 pieData
        color: ["#5087ec", "#64b4bd", "#57a45b", "#f2bd42"],
        series: [
          {
            type: "pie",
            label: {
              color: "#ffffff", // 统一使用白色
              show: true,
              formatter: "{b} :\n {c} ({d}%)", // b代表名称，c代表对应值，d代表百分比 "{b} :\n {c} ({d}%)"
            },
            radius: "40%", // 饼图半径
            data: pieData,
          },
        ],
      };
      // 初始化 div
      const echarts_div = this.$refs.echresDiv_right;
      if (echarts_div) {
        this.myChart_right = this.$echarts.init(echarts_div);
        this.myChart_right.setOption(option);
        // 随着屏幕大小调节图表
        window.addEventListener("resize", () => {
          this.myChart_right.resize();
        });
      }
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
  },
};
</script>

<template>
  <div class="fire-protection">
    <!-- 左侧菜单 -->
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
          <!-- 消防点位 -->
          <div class="title-text">
            <img :src="glgb" />
            <span>消防点位 : {{ pointList.length }} 个</span>
          </div>
          <div class="comm-title">
            <img :src="n03" />
            <span>点位名称</span>
          </div>
          <!-- 消防点位列表 -->
          <div class="lists h-3/4">
            <el-row>
              <el-col :span="21">
                <el-input
                  v-model="sFormLeft.code"
                  style="background: transparent; margin-bottom: 6px"
                  prefix-icon="el-icon-search"
                  placeholder="输入消防点位查询"
                  clearable
                  @clear="getPointList"
                />
              </el-col>
              <el-col :span="3">
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  style="width: 100%"
                  @click="getPointList"
                />
              </el-col>
            </el-row>

            <el-table
              header-cell-class-name="table_header"
              :row-class-name="el_tableRowClassName"
              class="comm-table"
              :data="countFirePointList"
              style="width: 100%"
              height="100%"
              @row-click="clickAlarmItem"
            >
              <el-table-column label="序号" type="index" align="center" widht="45" />
              <el-table-column prop="alarmCode" label="消防点位" align="center" />
              <el-table-column prop="alarmPosition" label="位置" align="center" />
            </el-table>
          </div>
        </div>
        <!-- 消防点位分布图 -->
        <div
          class="rounded-md h-1/2 p-2 overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
        >
          <div class="comm-title">
            <img :src="n03" />
            <span>消防点位分布图</span>
          </div>
          <div ref="echresDiv_left" :style="chartStyleLeft" />
        </div>
        <!-- 左侧收起按钮 -->
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
    <!-- 右侧菜单 -->
    <div
      class="right-div w-[24%] h-[calc(100vh-66px)] absolute right-0 top-0 rounded-lg overflow-hidden mx-3 transition-all duration-300 ease-in-out"
      :class="rightHide ? 'translate-x-[106%]' : ''"
    >
      <div
        class="h-[calc(100vh-66px)] flex flex-col rounded-lg overflow-y-auto border border-primary-dark-light backdrop-blur-lg p-2 box-border"
      >
        <template v-if="showAlarmDetail">
          <div
            class="rounded-md p-2 mb-3 overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
          >
            <div class="comm-title">
              <img :src="n03" />
              <span>消防测点信息</span>
            </div>
            <div class="div-ul-box rounded-md mb-2">
              <ul style="padding-left: 12px">
                <li>
                  <span class="label-key">报警编码 :</span
                  ><span>{{ pointDetail.alarmCode }}</span>
                </li>
                <li>
                  <span class="label-key">归属部门 :</span
                  ><span>{{ pointDetail.departmentName }}</span>
                </li>
                <li>
                  <span class="label-key">报警位置 :</span
                  ><span>{{ pointDetail.alarmPosition }}</span>
                </li>
                <li>
                  <span class="label-key">设备类型 :</span
                  ><span>{{
                    $dictUtils.getDictLabel("fire_point", pointDetail.alarmType)
                  }}</span>
                </li>
                <li>
                  <span class="label-key">报警备注 :</span
                  ><span>{{ pointDetail.alarmRemarks }}</span>
                </li>
                <li><span class="label-key">状态 :</span><span>正常</span></li>
              </ul>
            </div>
          </div>

          <div
            class="rounded-md p-2 flex-auto overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
          >
            <div class="comm-title">
              <img :src="n03" />
              <span>报警记录</span>
            </div>
            <el-table
              header-cell-class-name="table_header"
              :row-class-name="el_tableRowClassName"
              class="comm-table"
              :data="singlePointAlarmList"
              :height="300"
            >
              <el-table-column prop="alarmCode" label="消防点位" align="center" />
              <el-table-column prop="alarmTime" label="时间" align="center" width="85" />
              <el-table-column
                prop="receiptStatus"
                label="状态"
                align="center"
                min-width="60"
              >
                <template slot-scope="scope">
                  <el-tag v-if="scope.row.receiptStatus" size="mini" type="success">
                    已处理
                  </el-tag>
                  <el-tag v-else size="mini" type="danger"> 未处理 </el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-button type="text" style="width: 100%" @click="toAlarmList">
              返回报警信息
            </el-button>
          </div>
        </template>
        <!-- 报警列表 -->
        <template v-if="showAlarmList">
          <div
            class="rounded-md p-2 h-full mb-3 overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
          >
            <div class="comm-title">
              <img :src="n03" />
              <span>报警信息</span>
            </div>
            <div class="aralm-list h-full">
              <el-table
                header-cell-class-name="table_header"
                :row-class-name="el_tableRowClassName"
                class="comm-table"
                :data="alarmList"
                height="90%"
                @row-click="clickAlarmItem"
              >
                <el-table-column prop="alarmCode" label="消防点位" align="center" />
                <el-table-column
                  prop="alarmTime"
                  label="时间"
                  align="center"
                  width="85"
                />
                <el-table-column
                  prop="receiptStatus"
                  label="状态"
                  align="center"
                  min-width="60"
                >
                  <template slot-scope="scope">
                    <el-tag v-if="scope.row.receiptStatus" size="mini" type="success">
                      已处理
                    </el-tag>
                    <el-tag v-else size="mini" type="danger"> 未处理 </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
          <!-- 报警情况统计饼图 -->
          <div
            class="rounded-md p-2 h-full overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
          >
            <div class="comm-title">
              <img :src="n03" />
              <span>报警情况统计图</span>
            </div>
            <div ref="echresDiv_right" :style="chartStyleRight" />
          </div>
        </template>

        <!-- 右侧收起按钮 -->
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
</template>

<style lang="scss" scoped>
::v-deep .el-table .cell {
  color: #ffffff !important;
}
.fire-protection {
  position: relative;
  font-size: 12px;
  color: #fff;
}
.fire-protection .left-div {
  // position: absolute;
  // top: 0px;
  // left: 0px;
  // width: 30%;
  // height: calc(100vh - 50px);
  // background-image: url("../../../assets/anhuan3d/left.png");
  // background-size: 100% 100%;
  // padding: 10px 100px 10px 20px;
  display: flex;
  flex-direction: column;
  /*  文字标题 */
  .title-text {
    background-size: 100% 100%;
    display: flex;
    align-items: center;
    color: #ffffff;
    font-size: 14px;
    margin-right: 5px;
    img {
      margin: 10px;
      height: 20px;
      width: 20px;
    }
    span {
      margin-right: 10px;
      color: white;
      font-weight: bold;
      text-shadow: 0px 0px 1px #11c8e5, 0px 1px 5px #11c8e5, 0px 1px 10px #11c8e5;
    }
  }
  .lists {
    //padding: 10px 0;
    display: flex;
    flex-direction: column;
    // margin-bottom: 10px;
    // border: 1px solid #0f81a3;
    // height: calc(60% - 50px);
  }

  /* 弹出 / 收起 */
  .showBtns {
    position: absolute;
    top: 50%;
    left: calc(100% - 95px);
    transform: translateY(-50%);
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
.fire-protection .right-div {
  // position: absolute;
  // top: 0px;
  // right: 0px;
  // width: 30%;
  // height: calc(100vh - 50px);
  // background-image: url("../../../assets/anhuan3d/right.png");
  // background-size: 100% 100%;
  // padding: 10px 20px 10px 100px;
  // display: flex;
  // flex-direction: column;
  .div-ul-box {
    border: 1px solid #0f81a3;
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
  .aralm-list {
    display: flex;
    flex-direction: column;
    overflow: auto;
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

/*隐藏滚动条*/
/* .list-box::-webkit-scrollbar{
   display:none;
} */

::v-deep .el-input__inner {
  background-color: transparent;
  border-color: #0f81a3;
  color: #fff;
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
::v-deep.el-table::before {
  height: 0px;
}
</style>
