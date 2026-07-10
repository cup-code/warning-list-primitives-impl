<script>
import { getDeviceListByPid, getRealDataById } from "@/http/dev/manage-api";
import { getAllProduct } from "@/http/dev/product-api";

export default {
  name: "NoProcessDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // 搜索条件
      searchForm: {
        productType: "",
        terminalName: "",
        ioName: "",
        ioCode: "",
      },
      // 表格数据
      tableData: [],
      // 表格列配置
      tableConfig: [
        {
          prop: "name",
          label: "测点名称",
          width: 120,
        },
        {
          prop: "code",
          label: "测点编号",
          width: 120,
        },
        {
          prop: "value",
          label: "测点值",
          width: 100,
        },
        {
          prop: "typeStr",
          label: "测点类型",
          width: 100,
        },
        {
          prop: "varType",
          label: "测点值输出类型",
          width: 140,
          slot: "varType",
        },
      ],
      // 表格选中数据
      selectedRows: [],
      // 已绑定点位
      boundPoints: [],
      // 产品列表
      productList: [],
      // 终端列表
      deviceList: [],
      // 分页
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      // 加载状态
      loading: false,
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.getProList();
      }
    },
    selectedRows: {
      handler(newVal) {
        const productName = this.productList.find(
          (item) => item.id === this.searchForm.productType
        )?.name;
        // 同步更新已绑定列表
        this.boundPoints = newVal.map((row) => ({
          id: row.id,
          name: `${productName || ""}-${row.name || ""}`,
          rawData: row,
        }));
      },
      deep: true,
    },
  },
  methods: {
    getProList() {
      getAllProduct().then(({ data }) => {
        if (data.success === true) {
          this.productList = data.result || [];
        }
      });
    },

    getDevice(productId) {
      if (!productId) return;
      getDeviceListByPid(productId).then(({ data }) => {
        if (data.success === true) {
          this.deviceList = data.result || [];
          console.log(this.deviceList);
        }
      });
    },

    // 查询数据
    handleQuery() {
      this.pagination.current = 1;
      this.fetchTableData();
    },

    // 获取表格数据
    async fetchTableData() {
      this.loading = true;
      try {
        // TODO: 调用API获取数据
        const params = {
          ...this.searchForm,
          page: this.pagination.current,
          pageSize: this.pagination.pageSize,
        };
        await getRealDataById(
          this.searchForm.productType,
          this.searchForm.terminalName,
          params
        ).then(({ data }) => {
          if (data.code === 200) {
            this.tableData = data.result.list;
            this.pagination.total = data.result.total;
          }
        });
      } finally {
        this.loading = false;
      }
    },

    // 表格选中变化
    handleSelectionChange(selection) {
      this.selectedRows = selection;
    },

    // 移除已绑定点位
    removeBoundPoint(item) {
      // 从selectedRows中移除
      const rowIndex = this.selectedRows.findIndex((p) => p.id === item.id);
      if (rowIndex > -1) {
        this.selectedRows.splice(rowIndex, 1);
      }
      // 从boundPoints中移除
      const index = this.boundPoints.findIndex((p) => p.id === item.id);
      if (index > -1) {
        this.boundPoints.splice(index, 1);
      }
      this.$nextTick(() => {
        this.setSelectRow();
      });
    },

    // 设置选中的方法
    setSelectRow() {
      if (!this.boundPoints || this.boundPoints.length <= 0) {
        this.$refs.pointTable.clearSelection();
        return;
      }
      // 标识当前行的唯一键的名称
      const idKey = "id";
      const selectAllIds = [];
      this.boundPoints.forEach((row) => {
        selectAllIds.push(row[idKey]);
      });
      this.$refs.pointTable.clearSelection();
      for (let i = 0; i < this.tableData.length; i++) {
        if (selectAllIds.includes(this.tableData[i][idKey])) {
          // 设置选中，记住table组件需要使用ref="table"
          this.$refs.pointTable.toggleRowSelection(this.tableData[i], true);
        }
      }
    },

    // 分页改变
    handleCurrentChange(page) {
      this.pagination.current = page;
      this.fetchTableData();
    },

    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.pagination.current = 1;
      this.fetchTableData();
    },

    // 关闭弹窗
    handleClose() {
      this.searchForm = {
        productType: "",
        terminalName: "",
        ioName: "",
        ioCode: "",
      };
      this.$emit("update:visible", false);
      this.$emit("close");
    },

    // 提交保存
    handleSubmit() {
      if (this.boundPoints.length === 0) {
        this.$message.warning("请至少选择一个点位");
        return;
      }
      this.$emit("submit", this.boundPoints);
      this.handleClose();
    },
  },
};
</script>

<template>
  <el-dialog
    title="绑定点位"
    :visible="visible"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    width="1200px"
    @close="handleClose"
  >
    <div class="flex gap-5 min-h-[470px]">
      <!-- 左侧区域 -->
      <div class="flex-1 flex flex-col">
        <!-- 搜索区域 -->
        <el-form :model="searchForm" inline size="mini" class="mb-4">
          <el-form-item label="产品类型">
            <el-select
              v-model="searchForm.productType"
              placeholder="请选择产品类型"
              clearable
              style="width: 180px"
              @change="getDevice"
            >
              <el-option
                v-for="item in productList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="终端名称">
            <el-select
              v-model="searchForm.terminalName"
              placeholder="请选择终端名称"
              clearable
              style="width: 180px"
            >
              <el-option
                v-for="item in deviceList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="测点名称">
            <el-input
              v-model="searchForm.pointName"
              placeholder="测点名称"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="测点编码">
            <el-input
              v-model="searchForm.pointCode"
              placeholder="测点编码"
              clearable
              style="width: 150px"
            />
          </el-form-item>
          <el-form-item>
            <EButton type="primary" btnIcon="el-icon-search" @click="handleQuery">
              查询
            </EButton>
          </el-form-item>
        </el-form>

        <!-- 表格 -->
        <CTable
          ref="pointTable"
          :loading="loading"
          :tableData="tableData"
          :list="tableConfig"
          selection
          type="index"
          height="380px"
          :reserveSelection="true"
          @select="handleSelectionChange"
        >
          <template #varType="{ info }">
            {{ $dictUtils && $dictUtils.getDictLabel("value_type", info.varType) }}
          </template>
        </CTable>

        <div class="flex justify-center mt-2">
          <el-pagination
            :current-page="pagination.current"
            :page-sizes="[10, 20, 50]"
            :page-size="pagination.pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="pagination.total"
            background
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 右侧已绑定点位 -->
      <div class="w-60 border-l border-gray-300 pl-5">
        <div
          class="flex justify-between items-center text-sm font-bold text-gray-800 mb-3"
        >
          <div>已绑点位</div>
        </div>
        <div class="flex flex-col gap-2 max-h-[450px] overflow-y-auto">
          <el-tag
            v-for="item in boundPoints"
            :key="item.id"
            closable
            type="primary"
            size="small"
            class="w-full whitespace-normal h-auto leading-relaxed p-2 break-all"
            @close="removeBoundPoint(item)"
          >
            {{ item.name }}
          </el-tag>
          <div
            v-if="boundPoints.length === 0"
            class="text-gray-400 text-xs text-center mt-5"
          >
            暂无绑定点位
          </div>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div slot="footer" class="flex justify-end gap-2">
      <EButton @click="handleClose"> 取消 </EButton>
      <EButton type="primary" @click="handleSubmit"> 确认保存 </EButton>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
::v-deep .el-dialog__body {
  padding: 20px;
}

::v-deep .el-form-item {
  margin-bottom: 8px;
}

::v-deep .el-tag {
  margin-bottom: 3px;
  margin-left: 0px;
}
</style>
