<script>
import { useQuery } from "@tanstack/vue-query";
import moment from "moment";
import { getCurrentInstance, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { getDepartListSimple } from "@/http/safe-production/depart-manage-api";
import {
  batchDeleteWarningProcess,
  clientWarningList,
  exportWarningData,
  getWarningTypeList,
} from "@/http/videoWarning/warning-api";
import { delStorageItem, getStorageItem, setStorageItem } from "@/utils/storage";
import BatchDeal from "./components/batchDeal.vue";
import CheckGroup from "./components/checkGroup.vue";
import List from "./components/list.vue";
import WarningInfo from "./components/warningInfo.vue";
import { WarningListConfig } from "./config";
import batchInfo from "./store/batchInfo";
import realTimeWarning from "./test/realTimeWarning";

export default {
  name: "clientWarningList",
  components: {
    WarningInfo,
    List,
    BatchDeal,
    CheckGroup,
  },
  mixins: [batchInfo],

  beforeRouteLeave(to, from, next) {
    // 判断目标路由是否是详情页
    const isDetailPage = to.path.includes("/detail");
    const isCurrentPage = to.path.includes("clientWarningList");

    console.log(isDetailPage, isCurrentPage, "isDetailPage, isCurrentPage");

    // 如果既不是详情页也不是当前页面，则清除缓存
    if (!isDetailPage && !isCurrentPage) {
      this.clearCache();
    }

    next(); // 继续导航
  },
  setup() {
    const wsConnection = realTimeWarning();

    const { proxy } = getCurrentInstance();

    const clearCache = () => {
      delStorageItem("clientWarningListFilter");
      delStorageItem("isClientChecked");
      delStorageItem("clientWarningListLayout");
    };

    const layout = ref(getStorageItem("clientWarningListLayout") || "card");
    const form = ref(
      getStorageItem("clientWarningListFilter") || {
        pageNum: 1,
        pageSize: 12,
        // customerStatus: ["0", "1"],
      }
    );
    const customerStatus = ref("1");
    const showMore = ref(getStorageItem("isClientChecked") || true);
    const detailInfo = ref({});
    const total = ref(0);
    const tableData = ref([]);
    const alarmDate = ref([]);
    const statusList = ref([{ name: "待处理" }, { name: "误报" }, { name: "真实" }]);
    const alarmLevelList = ref([
      { name: "一级", value: "1" },
      { name: "二级", value: "2" },
      { name: "三级", value: "3" },
      { name: "四级", value: "4" },
    ]);

    const { refetch, isLoading } = useQuery({
      queryKey: ["clientWarningList", form.value],
      queryFn: () => clientWarningList(form.value),
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          tableData.value = result.list.map((item) => {
            return {
              ...item,
              auditStatus: item.customerStatus,
              auditUser: item.customerDisposeUserName,
              auditTime: item.customerDisposeTime,
            };
          });
          total.value = result.total;
        }
      },
    });
    const warningTypeList = ref([]);
    const warningTypeListQuery = useQuery({
      queryKey: ["warningTypeList"],
      queryFn: () => getWarningTypeList(),
      onSuccess: ({ data }) => {
        if (data.success) {
          warningTypeList.value = data.result || [];
        }
      },
    });
    const departmentList = ref([]);
    const { refetch: refetchDepartmentList } = useQuery({
      queryKey: ["departmentList"],
      queryFn: () => getDepartListSimple(),
      onSuccess: ({ data }) => {
        if (data.success) {
          departmentList.value = data.result.filter((item) => !item.onlyTreeUse) || [];
        }
      },
    });

    const searchFn = () => {
      refetch();
    };

    const onChange = (key, value) => {
      if (value) {
        if (key === "layout") {
          layout.value = value;
          setStorageItem("clientWarningListLayout", value);
        }
        if (key === "alarmDate") {
          form.value.alarmDateStart = value ? proxy.$formatDate(value[0]) : "";
          form.value.alarmDateEnd = value ? proxy.$formatDate(value[1]) : "";
        } else {
          form.value[key] = value;
        }
      } else {
        delete form.value[key];
      }

      setStorageItem("clientWarningListFilter", form.value);
      console.log(form.value, "form.value");
      refetch();
    };

    const init = async () => {
      const query = proxy.$route.query;
      // 重置表单为默认值，避免重复初始化
      const defaultForm = getStorageItem("clientWarningListFilter") || {
        pageNum: 1,
        pageSize: 12,
      };
      console.log(getStorageItem("clientWarningListFilter"), "getStorageItem");
      alarmDate.value = getStorageItem("clientWarningListFilter")?.alarmDateEnd
        ? [
            getStorageItem("clientWarningListFilter").alarmDateStart,
            getStorageItem("clientWarningListFilter").alarmDateEnd,
          ]
        : [];
      // 处理查询参数
      if (Object.keys(query).length > 0) {
        Object.keys(query).forEach((key) => {
          if (key === "timeType" && query.timeType !== undefined) {
            const now = moment();
            defaultForm.alarmDateEnd = now.format("YYYY-MM-DD HH:mm:ss");

            // 根据时间类型设置开始时间
            const timeTypeMap = {
              0: now.clone().startOf("date"),
              1: now.clone().startOf("week").add(1, "day"),
              2: now.clone().startOf("month"),
            };

            if (timeTypeMap[query.timeType]) {
              defaultForm.alarmDateStart = timeTypeMap[query.timeType].format(
                "YYYY-MM-DD HH:mm:ss"
              );
              // 更新日期选择器的值
              alarmDate.value = [defaultForm.alarmDateStart, defaultForm.alarmDateEnd];
            }
          } else if (key === "departmentName") {
            defaultForm.departmentId = departmentList.value.find((item) => {
              return item.departmentName === query[key];
            })?.id;
          } else {
            defaultForm[key] = key === "customerStatus" ? [query[key]] : query[key];
          }
        });
      }
      // 更新表单值
      form.value = Object.assign({}, defaultForm);
    };

    const handleExport = () => {
      exportWarningData(form.value);
    };

    // 初始化
    onMounted(async () => {
      await refetchDepartmentList();

      if (Object.keys(proxy.$route.query).length > 0) {
        await init();
      }
      await refetch();
    });

    // 组件卸载前关闭 WebSocket 连接
    onBeforeUnmount(() => {
      wsConnection.then((ws) => {
        console.log(ws, "wsConnection");
        if (ws && ws.close) {
          ws.close();
          console.log("WebSocket 连接已关闭");
        }
      });
    });

    // // 监听路由变化
    watch(
      () => proxy.$route.query,
      async (newVal) => {
        if (Object.keys(newVal).length > 0) {
          await init();
          await refetch();
        } else {
          showMore.value = false;
          clearCache();
          resetFn();
        }
      }
    );

    const checkItem = (item) => {
      proxy.$router.push({
        path: `/detail/warningDetail`,
        query: {
          data: JSON.stringify(item),
        },
      });
    };

    const resetFn = async () => {
      form.value = {
        pageNum: 1,
        pageSize: 12,
        // customerStatus: ["0", "1"],
      };
      alarmDate.value = [];
      layout.value = "card";
      clearCache();
      refetch();
    };

    const toggleMore = () => {
      showMore.value = !showMore.value;
      setTimeout(() => {
        proxy.$refs.treeTable.setTableHeight();
      }, 200);
      setStorageItem("isClientChecked", showMore.value);
    };

    return {
      form,
      layout,
      departmentList,
      alarmLevelList,
      detailInfo,
      statusList,
      WarningListConfig,
      warningTypeList,
      warningTypeListQuery,
      alarmDate,
      customerStatus,
      isLoading,
      tableData,
      toggleMore,
      showMore,
      onChange,
      searchFn,
      resetFn,
      total,
      checkItem,
      refetch,
      clearCache,
      handleExport,
    };
  },
  data() {
    return {
      BatchType: null, // deal, delete,null
    };
  },
  watch: {
    layout: {
      handler(newVal) {
        if (newVal === "table") {
          this.$nextTick(() => {
            this.$refs.tableRef?.setSelections(this.selected);
          });
        }
      },
      immediate: true,
    },
    tableData: {
      handler(newVal) {
        if (this.isBatch && this.checkboxGroup.length > 0) {
          this.handleChecked(this.checkboxGroup, newVal);
        }

        if (this.isBatch && this.checkboxGroup.length > 0 && this.layout === "table") {
          this.onSelected(this.selected, newVal);
          this.$refs.tableRef?.setSelections(this.selected);
        }
      },
      immediate: true,
    },
  },
  methods: {
    handleBatchProcess() {
      // 从store中获取当前批量处理状态
      // 切换批量处理状态
      this.isBatch = !this.isBatch;
      this.BatchType = this.isBatch ? "deal" : null;
      if (!this.isBatch) {
        // 如果关闭批量处理，清空选择
        this.cancelBatch();
        this.$refs.tableRef?.setSelections([]);
      }
    },
    handleSuccess() {
      this.isBatch = !this.isBatch;
      this.cancelBatch();
      this.refetch();
    },
    pageSizeFn(size) {
      this.form.pageSize = size;
      this.searchFn();
    },

    pageCurFn(num) {
      this.form.pageNum = num;
      this.cancelBatch();
      this.searchFn();
    },

    batchDelete() {
      this.isBatch = !this.isBatch;
      this.BatchType = this.isBatch ? "delete" : null;
      this.cancelBatch();
      this.searchFn();
    },

    handleDelete() {
      const ids = this.checkboxGroup;
      this.$confirm("确定删除吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        // 确保ids是数组格式，qs.stringify会将其转换为ids=value1&ids=value2的格式
        batchDeleteWarningProcess({ ids }).then(({ data }) => {
          if (data.code === 200) {
            this.$message.success("删除成功");
            this.refetch();
          } else {
            this.$message.error(data.message);
          }
        });
      });
    },
  },
};
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="false">
    <!-- 查询条件 -->
    <ECard slot="search" noneBottom type="search">
      <el-form :model="form" size="mini" inline>
        <el-form-item label="布局方式:">
          <el-radio-group
            v-model="layout"
            size="mini"
            @change="onChange('layout', $event)"
          >
            <el-radio-button label="table"> 表格 </el-radio-button>
            <el-radio-button label="card"> 卡片 </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="预警日期：">
          <el-date-picker
            v-model="alarmDate"
            type="datetimerange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="['00:00:00', '23:59:59']"
            @change="onChange('alarmDate', $event)"
          />
        </el-form-item>

        <el-form-item label="预警等级：" prop="alarmLevel">
          <el-select
            v-model="form.alarmLevel"
            placeholder="预警等级"
            style="width: 100%"
            clearable
            @change="onChange('alarmLevel', $event)"
          >
            <el-option
              v-for="item in alarmLevelList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="预警类型：" prop="alarmType">
          <el-select
            v-model="form.alarmType"
            placeholder="预警类型"
            style="width: 100%"
            @change="onChange('alarmType', $event)"
          >
            <el-option
              v-for="item in warningTypeList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="showMore" label="处理状态：">
          <el-select
            v-model="form.customerStatus"
            placeholder="处理状态"
            style="width: 100%"
            multiple
            collapse-tags
            clearable
            @change="onChange('customerStatus', $event)"
          >
            <el-option
              v-for="item in $dictUtils.getDictList('CustomerStatus')"
              :key="item.dictCode"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="showMore" label="责任部门：">
          <el-select
            v-model="form.departmentId"
            placeholder="责任部门"
            clearable
            style="width: 100%"
            @change="onChange('departmentId', $event)"
          >
            <el-option
              v-for="item in departmentList"
              :key="item.id"
              :label="item.departmentName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item v-if="showMore" label="是否关注：">
          <el-select
            v-model="form.isAttention"
            clearable
            placeholder="是否关注"
            style="width: 100%"
            @change="onChange('isAttention', $event)"
          >
            <el-option label="是" :value="1" />
            <el-option label="否" value="0" />
          </el-select>
        </el-form-item>

        <el-form-item v-if="showMore" label="摄像头名称：">
          <el-input
            v-model="form.cameraName"
            placeholder="摄像头名称"
            style="width: 100%"
            clearable
            @change="onChange('cameraName', $event)"
          />
        </el-form-item>

        <el-form-item>
          <EButton
            type="primary"
            size="mini"
            :disabled="BatchType === 'delete'"
            @click="handleBatchProcess"
          >
            {{ isBatch && BatchType === "deal" ? "取消批量处理" : "批量处理" }}
          </EButton>
        </el-form-item>

        <el-form-item v-if="hasBtnPermission('clientWarningList_batchDelete')">
          <EButton
            type="danger"
            size="mini"
            :disabled="BatchType === 'deal'"
            @click="batchDelete"
          >
            {{ isBatch && BatchType === "delete" ? "取消批量删除" : "批量删除" }}
          </EButton>
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="searchFn">
            查询
          </el-button>
          <el-button icon="el-icon-refresh-right" @click="resetFn"> 重置 </el-button>
          <el-button type="text" style="margin-left: 8px" @click="toggleMore">
            {{ showMore === true ? "收起" : "高级筛选" }}
            <i :class="showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <!-- 内容 -->
    <ECard slot="table" customStyle="box-sizing: border-box;overflow: hidden;">
      <div class="flex mx-2">
        <div v-if="BatchType !== 'delete'" class="mr-2 card-cell">
          <EButton type="primary" size="mini" @click="handleExport"> Excel导出 </EButton>
        </div>
        <BatchDeal
          v-if="isBatch"
          :layout="layout"
          :checkAll="checkAll"
          :isIndeterminate="isIndeterminate"
          :checkboxGroup="checkboxGroup"
          :selected="selected"
          :batchType="BatchType"
          userType="CustomerStatus"
          @checkAllChange="handleCheckAllChange($event, tableData)"
          @success="handleSuccess"
          @delete="handleDelete"
        />
      </div>

      <div
        v-if="layout === 'card'"
        class="flex overflow-y-auto flex-wrap content-start h-full"
        style="height: 92%; scrollbar-width: auto; -ms-overflow-style: auto"
      >
        <CheckGroup
          v-if="isBatch"
          :tableData="tableData"
          :form="form"
          :isBatch="isBatch"
          :checkboxGroup="checkboxGroup"
          type="CustomerStatus"
          @check="handleChecked($event, tableData)"
        />

        <template v-else>
          <WarningInfo
            v-for="item in tableData"
            :key="item.id"
            type="CustomerStatus"
            :form="form"
            :pageNum="form.pageNum"
            :item="item"
            @itemTap="checkItem"
          />
        </template>
        <div
          v-if="tableData.length === 0"
          class="flex justify-center items-center w-full h-full text-gray-400"
        >
          暂无数据...
        </div>
      </div>
      <List
        v-else
        ref="tableRef"
        :tableData="tableData"
        :form="form"
        :loading="isLoading"
        :selection="isBatch"
        type="CustomerStatus"
        height="92%"
        @selection="onSelected($event, tableData)"
      />
    </ECard>
    <!-- 分页 -->
    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
        :current-page.sync="form.pageNum"
        :page-sizes="[12, 24, 48, 96]"
        :page-size.sync="form.pageSize"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        :background="true"
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>
  </KyTreeTable>
</template>

<style>
/* 实时预警通知弹窗样式 - 全局样式，因为 Notification 是动态添加到 body 的 */
.real-time-warning-notification {
  min-width: 350px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  padding: 0 !important;
  background: #fff !important;
}

/* 红色头部 */
.real-time-warning-notification .el-notification__group {
  position: relative;
  width: 100%;
  margin: 0;
}

.real-time-warning-notification .el-notification__title {
  display: none !important;
}

/* 头部内容区域 */
.real-time-warning-notification .el-notification__content {
  position: relative;
  margin: 0 !important;
  padding: 0 !important;
  background: #ffffff !important;
}

.real-time-warning-notification .notification-header-content {
  display: flex;
  align-items: center;
  gap: 6px;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: #f54a41;
  color: #ffffff;
  padding: 12px 16px;
  box-sizing: border-box;
  z-index: 1;
}

.real-time-warning-notification .notification-header-content .countdowns {
  font-size: 13px;
  opacity: 0.95;
  margin-left: 4px;
}

/* 头部右侧图标 */
.real-time-warning-notification .header-right-icon {
  position: absolute;
  right: 38px;
  top: 12px;
  font-size: 18px;
  color: #ffffff;
  z-index: 5;
}

/* 头部图标 */
.real-time-warning-notification .el-notification__icon {
  display: none !important;
}

/* 白色主体 */
.real-time-warning-notification .notification-body {
  padding: 16px;
  padding-top: 57px; /* 50px 头部高度 + 16px 间距 */
  background: #ffffff;
}

.real-time-warning-notification .alarm-type {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
  line-height: 1.5;
}

.real-time-warning-notification .info-item {
  margin-bottom: 8px;
  line-height: 1.6;
  font-size: 14px;
}

.real-time-warning-notification .info-item:last-child {
  margin-bottom: 0;
}

.real-time-warning-notification .info-item .label {
  color: #606266;
  margin-right: 8px;
}

.real-time-warning-notification .info-item .value {
  color: #303133;
  font-weight: 500;
}

/* 预警等级标签 - 蓝色背景 */
.real-time-warning-notification .level-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #ffffff;
  background: #0069b9;
  padding: 6px;
  height: 20px;
  line-height: 20px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
}

.real-time-warning-notification .level-badge i {
  font-size: 10px;
  line-height: 1;
}

/* 不同等级的标签颜色
.real-time-warning-notification .level-badge.level-1 {
  background: #f54a41;
}

.real-time-warning-notification .level-badge.level-2 {
  background: #f9ae3d;
}

.real-time-warning-notification .level-badge.level-3 {
  background: #cfde00;
  color: #303133;
}

.real-time-warning-notification .level-badge.level-4 {
  background: #0069b9;
} */

/* 关闭按钮样式 */
.real-time-warning-notification .el-notification__closeBtn {
  color: #ffffff !important;
  font-size: 16px !important;
  top: 12px !important;
  right: 16px !important;
  z-index: 10;
  position: absolute !important;
}

.real-time-warning-notification .el-notification__closeBtn:hover {
  color: rgba(255, 255, 255, 0.8) !important;
}
</style>
