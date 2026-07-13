<script>
import cl_bg from "@/assets/anhuan3d/cl_bg.png";
import glgb from "@/assets/anhuan3d/glgb.png";
import left_hide from "@/assets/anhuan3d/left_hide.png";
import right_hide from "@/assets/anhuan3d/right_hide.png";

export default {
  name: "occupationDisease",
  props: {
    companyId: { type: String, default: "" },
    occupationDiseaseData: { type: Array, default: [] },
  },
  data() {
    return {
      right_hide,
      left_hide,
      glgb,
      cl_bg,
      title: "职业病因素",
      // occupationDiseaseData:[]
    };
  },
  // 进入组件
  // activated(){},
  computed: {
    leftHide() {
      return this.$store.state.newMaterial.leftHide;
    },
    rightHide() {
      return this.$store.state.newMaterial.rightHide;
    },
  },
  created() {
    // this.occupationDiseaseData = zq_config.occupationDiseaseData;
  },
  mounted() {},
  methods: {
    // 点击定位到地图
    clickLocationTo3d(row) {
      // 定位到 地图标记
      // this.$store.dispatch('newMaterial/locateTo3dIcon',{id:row.id, type:''});
      this.$emit("locationToMap", { id: row.id, type: "" });
    },
    // 来自地图点击
    from3dMapClick(markerObj) {
      if (this.occupationDiseaseData.length > 0) {
        for (let i = 0; i < this.occupationDiseaseData.length; i++) {
          if (this.occupationDiseaseData[i].id === markerObj.id) {
            this.$refs.elTable.setCurrentRow(this.occupationDiseaseData[i]);
            break;
          }
        }
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
  <div id="occupation-disease">
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
          <div class="titleImage" :style="{ backgroundImage: `url(${cl_bg})` }">
            <img :src="glgb" />
            <span
              >职业病因素区域 : &nbsp;&nbsp;{{ occupationDiseaseData.length }} 个</span
            >
          </div>
          <div class="list-box">
            <el-table
              ref="elTable"
              class="comm-table"
              header-cell-class-name="table_header"
              :row-class-name="el_tableRowClassName"
              :data="occupationDiseaseData"
              style="width: 100%"
              height="93%"
              :highlight-current-row="true"
              @row-click="clickLocationTo3d"
            >
              <el-table-column label="序号" align="center" type="index" width="45" />
              <el-table-column prop="postName" label="岗位" align="center" />
              <el-table-column prop="typeName" label="职业病类型" align="center" />
            </el-table>
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
  </div>
</template>

<style lang="scss" scoped>
#occupation-disease {
  position: relative;
  font-size: 12px;
  color: #ffffff;
}
::v-deep .el-table .cell {
  color: #ffffff !important;
}
/* 左侧列表 */
#occupation-disease .left-div {
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
  .titleImage {
    background-size: 100% 100%;
    display: flex;
    align-items: center;
    color: #ffffff;
    font-size: 14px;
    width: 200px;
    margin: 0px 10px 10px 10px;
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

  .list-box {
    overflow: hidden;
    height: 100%;
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

/* 表头样式 */
::v-deep .el-table .table_header {
  /* background: #0c8ab0af !important; */
  border-bottom: 1px solid #0f81a3 !important;
}

/* el-table 行高亮 */
::v-deep .el-table .el-table-row-highlight {
  background: #105d749c;
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
    width: 0px;
  }
  colgroup col[name="gutter"] {
    display: none;
    width: 0px;
  }
}

/* el-table去掉表格最底横线 */
::v-deep.el-table::before {
  height: 0px;
}
</style>
