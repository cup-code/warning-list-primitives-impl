<script>
import { ref, reactive, watch } from "vue";
import { getPageContent } from "@/http/inspection/yx-inspection-api";

// 巡检项选择表格配置
const SelectItemTableConfig = [
  {
    label: "巡检项",
    prop: "contentName",
    minWidth: 150,
    align: "left",
  },
  {
    label: "巡检标准",
    prop: "inspectionBenchmark",
    minWidth: 180,
    align: "left",
  },
  {
    label: "类别",
    prop: "contentCategory",
    width: 100,
    align: "center",
  },
  {
    label: "创建时间",
    prop: "createdTime",
    width: 160,
    align: "center",
  },
];

export default {
  name: "SelectInspectionItemDialog",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    // 已选中的巡检项ID列表（用于回显选中状态）
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
      contentName: "",
      inspectionBenchmark: "",
      contentCategory: "",
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
        const res = await getPageContent(searchForm);
        if (res.data?.success) {
          const { result } = res.data;
          tableData.value = (result.list || []).map((item) => ({
            ...item,
            itemName: item.contentName,
            standard: item.inspectionBenchmark,
            category: item.contentCategory,
          }));
          total.value = result.total || 0;
          // 数据加载后，回显已选中的巡检项
          await setDefaultSelection();
        }
      } catch (error) {
        console.error("获取巡检项列表失败:", error);
      } finally {
        loading.value = false;
      }
    };

    // 回显已选中的巡检项
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
      searchForm.contentName = "";
      searchForm.inspectionBenchmark = "";
      searchForm.contentCategory = "";
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
      const items = selectedRows.value.map((row) => ({
        contentId: row.id,
        itemName: row.contentName,
        standard: row.inspectionBenchmark,
        category: row.contentCategory,
      }));
      emit("confirm", items);
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
      SelectItemTableConfig,
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
    title="选择巡检项"
    :visible.sync="dialogVisible"
    width="800px"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
  >
    <!-- 搜索区域 -->
    <el-form :model="searchForm" size="mini" inline class="mb-4">
      <el-form-item label="巡检项">
        <el-input
          v-model="searchForm.contentName"
          placeholder="请输入巡检项名称"
          class="w-52"
          clearable
          @keyup.enter.native="handleSearch"
        />
      </el-form-item>
      <el-form-item label="巡检标准">
        <el-input
          v-model="searchForm.inspectionBenchmark"
          placeholder="请输入巡检标准"
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
        v-for="col in SelectItemTableConfig"
        :key="col.prop"
        :label="col.label"
        :prop="col.prop"
        :width="col.width"
        :min-width="col.minWidth"
        :align="col.align"
      >
        <template #default="{ row }">
          <!-- 类别列显示字典翻译 -->
          <span v-if="col.prop === 'contentCategory'">
            {{ $dictUtils.getDictLabel('inspectionCategory', row.contentCategory) }}
          </span>
          <span v-else>{{ row[col.prop] }}</span>
        </template>
      </el-table-column>
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