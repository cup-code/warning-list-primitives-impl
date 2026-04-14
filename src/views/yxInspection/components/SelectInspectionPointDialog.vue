<script>
import { ref, reactive, watch, computed } from "vue";
import { queryInspectionPlaceByPage } from "@/http/inspection/yx-inspection-api";

// 巡检点选择表格配置
const SelectPointTableConfig = [
  {
    label: "巡检点编号",
    prop: "placeCode",
    width: 120,
    align: "center",
  },
  {
    label: "巡检点名称",
    prop: "placeName",
    minWidth: 150,
    align: "left",
  },
  {
    label: "点位位置",
    prop: "placePosition",
    minWidth: 150,
    align: "left",
  },
  {
    label: "创建时间",
    prop: "createdTime",
    width: 160,
    align: "center",
  },
];

export default {
  name: "SelectInspectionPointDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    // 已选中的巡检点ID列表（用于回显选中状态）
    selectedIds: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const dialogVisible = ref(false);
    const loading = ref(false);
    const tableData = ref([]);
    const total = ref(0);
    const tableRef = ref(null);

    // 搜索表单
    const searchForm = reactive({
      fuzzyQuery: "",
      pageNum: 1,
      pageSize: 10,
    });

    // 当前选中的行
    const selectedRows = ref([]);

    // 监听visible变化
    watch(
      () => props.visible,
      (val) => {
        dialogVisible.value = val;
        if (val) {
          selectedRows.value = [];
          fetchData();
        }
      }
    );

    // 获取数据
    const fetchData = async () => {
      loading.value = true;
      try {
        const res = await queryInspectionPlaceByPage(searchForm);
        if (res.data?.success) {
          const { result } = res.data;
          tableData.value = result.list || [];
          total.value = result.total || 0;
          // 数据加载后，回显已选中的巡检点
          await setDefaultSelection();
        }
      } catch (error) {
        console.error("获取巡检点列表失败:", error);
      } finally {
        loading.value = false;
      }
    };

    // 回显已选中的巡检点
    const setDefaultSelection = async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      if (tableRef.value && props.selectedIds.length > 0) {
        tableData.value.forEach((row) => {
          if (props.selectedIds.includes(row.id)) {
            tableRef.value.toggleRowSelection(row, true);
          }
        });
      }
    };

    // 搜索
    const handleSearch = () => {
      searchForm.pageNum = 1;
      fetchData();
    };

    // 重置
    const handleReset = () => {
      searchForm.fuzzyQuery = "";
      searchForm.pageNum = 1;
      fetchData();
    };

    // 分页大小改变
    const handleSizeChange = (size) => {
      searchForm.pageSize = size;
      searchForm.pageNum = 1;
      fetchData();
    };

    // 当前页改变
    const handleCurrentChange = (num) => {
      searchForm.pageNum = num;
      fetchData();
    };

    // 选择变化
    const handleSelectionChange = (rows) => {
      selectedRows.value = rows;
    };

    // 关闭弹窗
    const handleClose = () => {
      emit("update:visible", false);
      emit("close");
    };

    // 确认选择
    const handleConfirm = () => {
      if (selectedRows.value.length === 0) {
        return;
      }
      // 转换为统一格式返回
      const points = selectedRows.value.map((row) => ({
        placeId: row.id,
        placeName: row.placeName,
        placeCode: row.placeCode,
      }));
      emit("confirm", points);
      handleClose();
    };

    return {
      dialogVisible,
      loading,
      tableData,
      total,
      tableRef,
      searchForm,
      selectedRows,
      SelectPointTableConfig,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleSelectionChange,
      handleClose,
      handleConfirm,
    };
  },
};
</script>

<template>
  <el-dialog
    title="选择巡检点"
    :visible.sync="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <!-- 搜索区域 -->
    <el-form :model="searchForm" size="mini" inline class="mb-4">
      <el-form-item label="巡检点">
        <el-input
          v-model="searchForm.fuzzyQuery"
          placeholder="请输入巡检点名称/编号"
          class="w-52"
          clearable
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch">
          查询
        </el-button>
        <el-button icon="el-icon-refresh-right" @click="handleReset">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <!-- 表格区域 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      border
      size="small"
      style="width: 100%"
      height="400px"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" align="center" />
      <el-table-column
        v-for="col in SelectPointTableConfig"
        :key="col.prop"
        :label="col.label"
        :prop="col.prop"
        :width="col.width"
        :min-width="col.minWidth"
        :align="col.align"
      />
    </el-table>

    <!-- 分页 -->
    <el-pagination
      class="mt-4"
      :current-page.sync="searchForm.pageNum"
      :page-sizes="[10, 20, 50, 100]"
      :page-size.sync="searchForm.pageSize"
      layout="total, sizes, prev, pager, next"
      :total="total"
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose" size="small">取 消</el-button>
      <el-button
        type="primary"
        :disabled="selectedRows.length === 0"
        size="small"
        @click="handleConfirm"
      >
        确 定 ({{ selectedRows.length }})
      </el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
}

.mt-4 {
  margin-top: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}
</style>