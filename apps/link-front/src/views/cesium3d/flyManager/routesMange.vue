<script>
import IMAGES from "../coms-newMaterial/js/image";
import { getInspectionPlanList } from "@/http/inspection/inspection-items-api.js";

export default {
  name: "RoutesMange",
  data() {
    return {
      images: IMAGES,
      list: [
        {
          label: "计划名称",
          prop: "planName",
          algin: "left",
        },
        {
          label: "操作",
          prop: "operation",
          slot: "operation",
          width: 100,
          align: "center",
        },
      ],
      tableData: [],
      companyId: "",
    };
  },
  computed: {
    leftHide() {
      return this.$store.state.newMaterial.isExpand;
    },
  },
  mounted() {
    this.companyId = this.$store.state.user.user.companyId;
    this.getInspectionPlanList();
  },
  methods: {
    async getInspectionPlanList() {
      const res = await getInspectionPlanList({
        isPages: false,
        companyId: this.companyId,
        pageNum: 1,
        pageSize: 1000,
      });
      if (res.data?.success) {
        this.tableData = res.data.result.list;
      }
    },
    handleView(info) {
      this.$emit("flyToRoutes", info);
    },
    // 点击左侧隐藏按钮
    toHideLeft() {
      this.$store.dispatch("newMaterial/leftHide", true);
    },
    toShowLeft() {
      this.$store.dispatch("newMaterial/leftHide", false);
    },
  },
};
</script>

<template>
  <div
    class="w-[22%] h-[calc(100vh-66px)] rounded-lg overflow-hidden mx-3 transition-all duration-300 ease-in-out"
    :class="leftHide ? 'translate-x-[-106%] ease-out' : ''"
  >
    <div
      class="flex flex-col h-[calc(100vh-66px)] rounded-lg overflow-hidden border border-primary-dark-light backdrop-blur-lg p-2 box-border"
    >
      <!-- 人数 -->
      <div
        class="rounded-md h-full p-2 overflow-hidden backdrop-blur-lg border border-primary-dark-light bg-primary-dark/60 shadow-insetLight"
      >
        <div class="flex items-center text-base text-white font-bold">
          <img class="w-4 h-4 mr-2" :src="images.function.explain" />
          <span>巡检计划</span>
        </div>
        <div
          class="h-[94%] my-3 box-border bg-transparent backdrop-blur-lg rounded-md overflow-hidden overflow-y-auto border border-[#eeeeee3d]"
        >
          <div
            v-for="(item, index) in tableData"
            :key="index"
            :class="[
              index % 2 === 0 ? 'bg-primary-dark/60' : 'bg-gray-400/20',
              'flex items-center justify-between px-3 py-2  ',
            ]"
          >
            <div class="flex items-center text-white text-sm">
              <span> {{ index + 1 < 10 ? "0" + (index + 1) : index + 1 }}</span>
              <div class="text-white ml-2 text-sm">{{ item.planName }}</div>
            </div>
            <div
              class="text-primary-dark-light text-sm cursor-pointer"
              @click="handleView(item)"
            >
              执行计划
            </div>
          </div>
          <!-- <CTable
            :tableData="tableData"
            :stripe="true"
            :show-header="true"
            height="50%"
            size="mini"
            :list="list"
          >
            <template #operation="{ info }">
              <div
                class="text-primary-dark-light cursor-pointer"
                @click="handleView(info.routes)"
              >
                执行计划
              </div>
            </template>
          </CTable> -->
        </div>
      </div>
    </div>
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
</template>

<style lang="scss" scoped>
.back {
  background-image: url("../../../assets/anhuan3d/left.png");
  background-size: 100% 100%;
  height: calc(100vh - 50px);

  .showBtns {
    position: absolute;
    top: 50%;
    left: calc(100% - 70px);
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

/* 表格透明背景，边框线颜色为 #0794a980 */
::v-deep .el-table {
  background: transparent !important;
  border: 1px solid #0794a980;
}

::v-deep .el-table__header {
  background: #0f445d !important;
}

::v-deep .el-table th,
::v-deep .el-table td {
  background: transparent !important;
  color: #ffffff;
  border-color: #0794a980 !important;
}

::v-deep .el-table th {
  border-bottom: 1px solid #0794a980 !important;
  color: #ffffff;
}

::v-deep .el-table__cell > .cell {
  color: #ffffff;
}

::v-deep .el-table td {
  border-bottom: 1px solid #0794a980 !important;
  color: #ffffff;
}

::v-deep .el-table tr {
  background: transparent !important;
  color: #ffffff;
}
</style>
