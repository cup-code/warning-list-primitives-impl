<script>
import { useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, onMounted, reactive, ref } from "vue";
import { queryRobotAlarmList } from "@/http/machineManage/index";
import { robotAlarmListConfig } from "./config";

export default {
  name: "RobotAlarmList",
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单
    const searchForm = reactive({
      robotCode: "",
      robotId: "",
      alarmContent: "",
      alarmType: "",
      alarmLevel: "",
      pageNum: 1,
      pageSize: 10,
    });

    // 告警时间范围
    const alarmTimeRange = ref([]);

    // 告警等级选项
    const alarmLevelOptions = [
      { label: "正常", value: "0" },
      { label: "预警", value: "1" },
      { label: "一般告警", value: "2" },
      { label: "严重告警", value: "3" },
      { label: "危机告警", value: "4" },
    ];

    // 告警类型选项
    const alarmTypeOptions = [
      { label: "系统告警", value: "0" },
      { label: "环境告警", value: "1" },
      { label: "离线告警", value: "2" },
      { label: "设备告警", value: "3" },
      { label: "综合告警", value: "4" },
    ];

    // 表格数据
    const tableData = ref([]);
    const total = ref(0);

    // 高级筛选显示/隐藏
    const showMore = ref(false);

    // 表格配置
    const tableConfig = ref(robotAlarmListConfig);

    // 查询列表数据
    const { refetch, isLoading } = useQuery({
      queryKey: ["robotAlarmList", searchForm],
      queryFn: () => queryRobotAlarmList(searchForm),
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          tableData.value = result.list || [];
          total.value = result.total || 0;
        } else {
          proxy.$message.error(data?.message || "查询失败");
        }
      },
      onError: () => {
        proxy.$message.error("查询失败");
      },
    });

    // 告警时间变化
    const onAlarmTimeChange = (value) => {
      if (value && value.length === 2) {
        searchForm.alarmTimeStart = value[0];
        searchForm.alarmTimeEnd = value[1];
      } else {
        delete searchForm.alarmTimeStart;
        delete searchForm.alarmTimeEnd;
      }
    };

    // 搜索
    const searchFn = () => {
      searchForm.pageNum = 1;
      refetch();
    };

    // 重置
    const resetFn = () => {
      searchForm.robotCode = "";
      searchForm.robotId = "";
      searchForm.alarmContent = "";
      searchForm.alarmType = "";
      searchForm.alarmLevel = "";
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      alarmTimeRange.value = [];
      delete searchForm.alarmTimeStart;
      delete searchForm.alarmTimeEnd;
      refetch();
    };

    // 切换高级筛选
    const toggleMore = () => {
      showMore.value = !showMore.value;
      setTimeout(() => {
        proxy.$refs.treeTable.setTableHeight();
      }, 200);
    };

    // 搜索条件变化
    const onChange = (key, value) => {
      if (value !== undefined && value !== null && value !== "") {
        searchForm[key] = value;
      } else {
        delete searchForm[key];
      }
    };

    // 分页大小改变
    const pageSizeFn = (size) => {
      searchForm.pageSize = size;
      searchForm.pageNum = 1;
      refetch();
    };

    // 当前页改变
    const pageCurFn = (num) => {
      searchForm.pageNum = num;
      refetch();
    };

    // 生命周期
    onMounted(() => {
      refetch();
    });

    // 格式化告警等级显示
    const formatAlarmLevel = (level) => {
      const levelMap = {
        0: "正常",
        1: "预警",
        2: "一般告警",
        3: "严重告警",
        4: "危机告警",
      };
      return levelMap[level] || level;
    };

    // 告警等级标签颜色
    const getAlarmLevelTagType = (level) => {
      const typeMap = {
        0: "success",
        1: "warning",
        2: "info",
        3: "warning",
        4: "danger",
      };
      return typeMap[level] || "";
    };

    return {
      searchForm,
      alarmTimeRange,
      tableData,
      isLoading,
      total,
      tableConfig,
      showMore,
      alarmLevelOptions,
      alarmTypeOptions,
      formatAlarmLevel,
      getAlarmLevelTagType,
      onAlarmTimeChange,
      searchFn,
      resetFn,
      toggleMore,
      onChange,
      pageSizeFn,
      pageCurFn,
    };
  },
};
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="false">
    <!-- 搜索区域 -->
    <ECard slot="search" type="search" noneBottom>
      <el-form :model="searchForm" size="mini" inline>
        <el-form-item label="机器人编号">
          <el-input
            v-model="searchForm.robotCode"
            placeholder="请输入机器人编号"
            style="width: 200px"
            clearable
            @keyup.enter.native="searchFn"
            @change="onChange('robotCode', $event)"
          />
        </el-form-item>

        <el-form-item label="告警时间：">
          <el-date-picker
            v-model="alarmTimeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width: 380px"
            :default-time="['00:00:00', '23:59:59']"
            @change="onAlarmTimeChange"
          />
        </el-form-item>

        <el-form-item v-if="showMore" label="机器人ID">
          <el-input
            v-model="searchForm.robotId"
            placeholder="请输入机器人ID"
            style="width: 200px"
            clearable
            @change="onChange('robotId', $event)"
          />
        </el-form-item>

        <el-form-item v-if="showMore" label="告警原因">
          <el-input
            v-model="searchForm.alarmContent"
            placeholder="请输入告警原因"
            style="width: 200px"
            clearable
            @change="onChange('alarmContent', $event)"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="searchFn">
            查询
          </el-button>
          <el-button icon="el-icon-refresh-right" @click="resetFn"> 重置 </el-button>
          <el-button type="text" class="ml-2" @click="toggleMore">
            {{ showMore ? "收起" : "高级筛选" }}
            <i :class="showMore ? 'el-icon-arrow-up' : 'el-icon-arrow-down'" />
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <!-- 表格区域 -->
    <ECard slot="table">
      <CTable
        :tableData="tableData"
        :loading="isLoading"
        :list="tableConfig"
        height="92%"
      >
        <!-- 告警等级列 -->
        <template #alarmLevel="{ info }">
          <el-tag :type="getAlarmLevelTagType(info.alarmLevel)" size="small">
            {{ formatAlarmLevel(info.alarmLevel) }}
          </el-tag>
        </template>
      </CTable>
    </ECard>

    <!-- 分页区域 -->
    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
        :current-page.sync="searchForm.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size.sync="searchForm.pageSize"
        layout="total, prev, pager, next, jumper, sizes"
        :total="total"
        background
        @size-change="pageSizeFn"
        @current-change="pageCurFn"
      />
    </ECard>
  </KyTreeTable>
</template>
