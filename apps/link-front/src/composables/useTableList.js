/**
 * 表格列表通用 composable
 * 封装搜索、分页、重置等通用逻辑
 */
import { reactive, ref, computed, onMounted } from "vue";
import { useQuery } from "@tanstack/vue-query";

/**
 * 创建表格列表状态管理
 * @param {Object} options 配置项
 * @param {Function} options.fetchFn 获取数据的 API 函数
 * @param {Object} options.defaultSearchParams 默认搜索参数
 * @param {Function} options.transformData 数据转换函数
 * @param {string} options.queryKey 查询键名
 * @returns {Object} 表格状态和方法
 */
export function useTableList(options = {}) {
  const {
    fetchFn,
    defaultSearchParams = {},
    transformData = (data) => data,
    queryKey = "tableList",
  } = options;

  // 搜索表单
  const searchForm = reactive({
    pageNum: 1,
    pageSize: 10,
    ...defaultSearchParams,
  });

  // 表格数据
  const tableData = ref([]);
  const total = ref(0);
  const loading = ref(false);

  // 查询列表数据
  const {
    refetch,
    isPending,
  } = useQuery({
    queryKey: [queryKey, searchForm],
    queryFn: () => fetchFn(searchForm),
    enabled: false, // 手动触发
    onSuccess: ({ data }) => {
      const { result } = data || {};
      if (data?.success) {
        const list = (result.list || []).map((item, index) => ({
          ...item,
          index: (searchForm.pageNum - 1) * searchForm.pageSize + index + 1,
        }));
        tableData.value = transformData(list, result);
        total.value = result.total || 0;
      }
    },
  });

  // 监听 loading 状态
  loading.value = isPending;

  // 搜索
  const searchFn = () => {
    searchForm.pageNum = 1;
    refetch();
  };

  // 重置
  const resetFn = () => {
    Object.keys(defaultSearchParams).forEach((key) => {
      searchForm[key] = defaultSearchParams[key];
    });
    searchForm.pageNum = 1;
    searchForm.pageSize = 10;
    refetch();
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

  // 初始化加载数据
  const loadData = () => {
    refetch();
  };

  return {
    searchForm,
    tableData,
    total,
    loading,
    refetch,
    searchFn,
    resetFn,
    pageSizeFn,
    pageCurFn,
    loadData,
  };
}

/**
 * 创建对话框状态管理
 * @returns {Object} 对话框状态和方法
 */
export function useDialog() {
  const dialogVisible = ref(false);
  const dialogType = ref("add"); // add-新增, edit-编辑, view-查看
  const currentRow = ref({});

  // 打开新增对话框
  const openAddDialog = () => {
    dialogType.value = "add";
    currentRow.value = {};
    dialogVisible.value = true;
  };

  // 打开编辑对话框
  const openEditDialog = (row) => {
    dialogType.value = "edit";
    currentRow.value = { ...row };
    dialogVisible.value = true;
  };

  // 打开查看对话框
  const openViewDialog = (row) => {
    dialogType.value = "view";
    currentRow.value = { ...row };
    dialogVisible.value = true;
  };

  // 关闭对话框
  const closeDialog = () => {
    dialogVisible.value = false;
    currentRow.value = {};
  };

  return {
    dialogVisible,
    dialogType,
    currentRow,
    openAddDialog,
    openEditDialog,
    openViewDialog,
    closeDialog,
  };
}

export default useTableList;