<script>
import { useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, reactive, ref } from "vue";
import { queryTianjianMqtt } from "@/http/inspection/yj-inspection-api";
import { TianjianDataTableConfig } from "./config";

export default {
  name: "TianjianData",
  setup() {
    const { proxy } = getCurrentInstance();

    const searchForm = reactive({
      deviceCode: "",
      sampleTimeStart: "",
      sampleTimeEnd: "",
      pageNum: 1,
      pageSize: 10,
    });

    const dateRange = ref([]);
    const tableData = ref([]);
    const tableConfig = ref(TianjianDataTableConfig);
    const total = ref(0);

    const handleDateChange = (val) => {
      if (val && val.length === 2) {
        searchForm.sampleTimeStart = val[0];
        searchForm.sampleTimeEnd = val[1];
      } else {
        searchForm.sampleTimeStart = "";
        searchForm.sampleTimeEnd = "";
      }
    };

    const buildQueryParams = () => {
      const params = {
        pageNum: searchForm.pageNum,
        pageSize: searchForm.pageSize,
      };
      if (searchForm.deviceCode) params.deviceCode = searchForm.deviceCode;
      if (searchForm.sampleTimeStart) params.sampleTimeStart = searchForm.sampleTimeStart;
      if (searchForm.sampleTimeEnd) params.sampleTimeEnd = searchForm.sampleTimeEnd;
      return params;
    };

    const { refetch, isFetching } = useQuery({
      queryKey: ["tianjianMqttList", searchForm],
      queryFn: () => queryTianjianMqtt(buildQueryParams()),
      onSuccess: ({ data }) => {
        if (data?.success) {
          const { result } = data || {};
          const list = (result?.list || []).map((item, index) => ({
            ...item,
            index: (searchForm.pageNum - 1) * searchForm.pageSize + index + 1,
          }));
          tableData.value = list;
          total.value = result?.total || 0;
        } else {
          tableData.value = [];
          total.value = 0;
          proxy.$message.error(data?.message || "查询失败");
        }
      },
      onError: () => {
        tableData.value = [];
        total.value = 0;
        proxy.$message.error("查询失败");
      },
    });

    const searchFn = () => {
      searchForm.pageNum = 1;
      refetch();
    };

    const resetFn = () => {
      searchForm.deviceCode = "";
      searchForm.sampleTimeStart = "";
      searchForm.sampleTimeEnd = "";
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      dateRange.value = [];
      refetch();
    };

    const pageSizeFn = (size) => {
      searchForm.pageSize = size;
      searchForm.pageNum = 1;
      refetch();
    };

    const pageCurFn = (num) => {
      searchForm.pageNum = num;
      refetch();
    };

    return {
      searchForm,
      dateRange,
      tableData,
      loading: isFetching,
      total,
      tableConfig,
      handleDateChange,
      searchFn,
      resetFn,
      pageSizeFn,
      pageCurFn,
    };
  },
};
</script>

<template>
  <div class="tianjian-data-page">
    <KyTreeTable ref="treeTable" :isShowLeft="false" class="h-full">
      <ECard slot="search" type="search" noneBottom>
        <el-form :model="searchForm" size="mini" inline>
          <el-form-item label="设备编码">
            <el-input
              v-model="searchForm.deviceCode"
              placeholder="请输入设备编码"
              class="w-52"
              clearable
              @keyup.enter.native="searchFn"
            />
          </el-form-item>
          <el-form-item label="采样时间">
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="yyyy-MM-dd HH:mm:ss"
              class="w-80"
              @change="handleDateChange"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" @click="searchFn">
              查询
            </el-button>
            <el-button icon="el-icon-refresh-right" @click="resetFn"> 重置 </el-button>
          </el-form-item>
        </el-form>
      </ECard>

      <ECard slot="table">
        <CTable
          :tableData="tableData"
          :loading="loading"
          :list="tableConfig"
          height="92%"
        >
          <!-- 光谱/清水光谱/吸光度谱：超长数组，单行省略，鼠标悬浮显示全部 -->
          <template #spe="{ info }">
            <el-tooltip
              v-if="info.spe !== undefined && info.spe !== null && info.spe !== ''"
              effect="dark"
              :content="String(info.spe)"
              placement="top"
            >
              <span class="cell-ellipsis">{{ info.spe }}</span>
            </el-tooltip>
            <span v-else>{{ info.spe }}</span>
          </template>
          <template #speWater="{ info }">
            <el-tooltip
              v-if="info.speWater !== undefined && info.speWater !== null && info.speWater !== ''"
              effect="dark"
              :content="String(info.speWater)"
              placement="top"
            >
              <span class="cell-ellipsis">{{ info.speWater }}</span>
            </el-tooltip>
            <span v-else>{{ info.speWater }}</span>
          </template>
          <template #speSac="{ info }">
            <el-tooltip
              v-if="info.speSac !== undefined && info.speSac !== null && info.speSac !== ''"
              effect="dark"
              :content="String(info.speSac)"
              placement="top"
            >
              <span class="cell-ellipsis">{{ info.speSac }}</span>
            </el-tooltip>
            <span v-else>{{ info.speSac }}</span>
          </template>
        </CTable>
      </ECard>

      <ECard slot="page" type="footer">
        <el-pagination
          class="text-right"
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
  </div>
</template>

<style lang="scss" scoped>
// 光谱列单元格：单行超出省略号
.cell-ellipsis {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

::v-deep .el-pagination {
  text-align: right;
}
</style>
