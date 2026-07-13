<script>
import { nextTick, reactive, ref, watch } from "vue";
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
    // 已选中的巡检点列表（用于回显选中状态，含跨页项；需带 placeId/id 及名称等字段）
    selectedItems: {
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
          // 打开时按顺序：先清掉跨「关闭→重开」残留的内部选中，再把已选项（含跨页）
          // 播种进选中，最后再拉数据。三步都要在 nextTick 里、且早于 fetchData 的 await，
          // 这样 reserve-selection 的 updateSelectionByRowKey 能把当前页的种子换成真实行
          nextTick(() => {
            tableRef.value?.clearSelection();
            seedSelection();
            fetchData();
          });
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
          // 选中回显交给 reserve-selection：tableData 变化时 Element 会按 row-key
          // 自动把当前页里已在选中集合中的行勾上，无需在每页手动 toggle
        }
      } catch (error) {
        console.error("获取巡检点列表失败:", error);
      } finally {
        loading.value = false;
      }
    };

    // 把父组件传入的已选项（含跨页）重建成表格行形状，作为 row-key 行身份
    const buildSeedRow = (point) => ({
      id: point.placeId ?? point.id,
      placeName: point.placeName,
      placeCode: point.placeCode,
    });

    // 打开弹窗时一次性播种已选项到选中集合（含当前页之外的跨页项）。
    // 仅在打开时调用一次：toggleRowStatus 按引用去重，重复播种会产生重复项；
    // 翻页时由 reserve-selection 的 updateSelectionByRowKey 按 id 自动对账当前页。
    const seedSelection = () => {
      if (!tableRef.value || props.selectedItems.length === 0) return;
      props.selectedItems.forEach((point) => {
        tableRef.value.toggleRowSelection(buildSeedRow(point), true);
      });
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
      row-key="id"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        type="selection"
        width="50"
        align="center"
        :reserve-selection="true"
      />
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