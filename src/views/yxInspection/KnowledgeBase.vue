<script>
import { useQuery, useMutation } from "@tanstack/vue-query";
import { getCurrentInstance, reactive, ref } from "vue";
import { KnowledgeBaseTableConfig } from "./config";
import KnowledgeBaseDialog from "./components/KnowledgeBaseDialog.vue";
import {
  getKnowledgeBasePage,
  deleteKnowledgeBase,
} from "@/http/inspection/yx-inspection-api";
import { getMockStatus } from "@/utils/mockConfig";

// 获取当前模块的 Mock 状态
const USE_MOCK = getMockStatus("knowledgeBase");

// Mock 数据（使用统一字段结构）
const mockGetKnowledgeBaseList = (params) => {
  return Promise.resolve({
    data: {
      success: true,
      result: {
        list: [
          {
            id: "1",
            resourceName: "现场巡检操作规范",
            resourceType: "PDF",
            creator: "张三",
            createTime: "2026/01/09 10:43",
            enable: true,
          },
          {
            id: "2",
            resourceName: "AR眼镜操作手册",
            resourceType: "PDF",
            creator: "李四",
            createTime: "2026/01/09 11:20",
            enable: true,
          },
          {
            id: "3",
            resourceName: "常见现场问题解决指导",
            resourceType: "视频",
            creator: "王五",
            createTime: "2026/01/09 14:30",
            enable: false,
          },
        ],
        total: 100,
      },
    },
  });
};

// 统一的知识库列表查询函数
const getKnowledgeBaseList = USE_MOCK
  ? mockGetKnowledgeBaseList
  : (params) =>
      getKnowledgeBasePage(params).then((res) => ({
        data: res.data,
      }));

export default {
  name: "KnowledgeBase",
  components: {
    KnowledgeBaseDialog,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单（统一字段：知识标题、知识分类）
    const searchForm = reactive({
      title: "",
      category: "",
      pageNum: 1,
      pageSize: 10,
    });

    // 表格数据
    const tableData = ref([]);
    const loading = ref(false);
    const total = ref(0);

    // 弹窗相关
    const dialogVisible = ref(false);
    const dialogType = ref("add");
    const currentRow = ref({});

    // 表格配置
    const tableConfig = ref(KnowledgeBaseTableConfig);

    // 知识分类选项
    const categoryOptions = [
      { label: "全部", value: "" },
      { label: "PDF", value: "PDF" },
      { label: "视频", value: "视频" },
      { label: "文档", value: "文档" },
    ];

    // 查询列表数据
    const { refetch, isPending } = useQuery({
      queryKey: ["knowledgeBaseList", searchForm],
      queryFn: () => getKnowledgeBaseList(searchForm),
      onSuccess: ({ data }) => {
        const { result } = data || {};
        if (data?.success) {
          const list = (result.list || []).map((item, index) => ({
            ...item,
            index: (searchForm.pageNum - 1) * searchForm.pageSize + index + 1,
          }));
          tableData.value = list;
          total.value = result.total ?? 0;
        }
      },
    });

    loading.value = isPending;

    // 搜索
    const searchFn = () => {
      searchForm.pageNum = 1;
      refetch();
    };

    // 重置
    const resetFn = () => {
      searchForm.title = "";
      searchForm.category = "";
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
      refetch();
    };

    // 新增
    const handleAdd = () => {
      dialogType.value = "add";
      currentRow.value = {};
      dialogVisible.value = true;
    };

    // 编辑
    const handleEdit = (row) => {
      dialogType.value = "edit";
      currentRow.value = { ...row };
      dialogVisible.value = true;
    };

    // 查看
    const handleView = (row) => {
      dialogType.value = "view";
      currentRow.value = { ...row };
      dialogVisible.value = true;
    };

    // 删除
    const handleDelete = (row) => {
      proxy
        .$confirm(`确定要删除知识库"${row.resourceName}"吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          loading.value = true;
          if (USE_MOCK) {
            // Mock 删除
            setTimeout(() => {
              loading.value = false;
              proxy.$message.success("删除成功");
              refetch();
            }, 300);
          } else {
            deleteKnowledgeBase(row.id)
              .then((res) => {
                loading.value = false;
                if (res.data?.success) {
                  proxy.$message.success("删除成功");
                  refetch();
                } else {
                  proxy.$message.error(res.data?.message || "删除失败");
                }
              })
              .catch(() => {
                loading.value = false;
                proxy.$message.error("删除失败");
              });
          }
        })
        .catch(() => {});
    };

    // 弹窗关闭
    const handleDialogClose = () => {
      dialogVisible.value = false;
      currentRow.value = {};
    };

    // 弹窗提交成功
    const handleDialogSubmit = () => {
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
      tableData,
      loading,
      total,
      tableConfig,
      dialogVisible,
      dialogType,
      currentRow,
      categoryOptions,
      searchFn,
      resetFn,
      handleAdd,
      handleEdit,
      handleView,
      handleDelete,
      handleDialogClose,
      handleDialogSubmit,
      pageSizeFn,
      pageCurFn,
    };
  },
};
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="false" class="h-full">
    <!-- 搜索区域 -->
    <ECard slot="search" type="search" noneBottom>
      <el-form :model="searchForm" size="mini" inline>
        <el-form-item label="知识标题">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入知识标题"
            class="w-52"
            clearable
            @keyup.enter.native="searchFn"
          />
        </el-form-item>
        <el-form-item label="知识分类">
          <el-select v-model="searchForm.category" placeholder="全部" class="w-40" clearable>
            <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="searchFn">
            查询
          </el-button>
          <el-button icon="el-icon-refresh-right" @click="resetFn">重置</el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <!-- 表格区域 -->
    <ECard slot="table">
      <div class="mb-4">
        <EButton type="success" btnIcon="el-icon-plus" class="mr-2" @click="handleAdd">
          新增
        </EButton>
      </div>

      <CTable
        :tableData="tableData"
        :loading="loading"
        :list="tableConfig"
        height="92%"
      >
        <!-- 是否启用 -->
        <template #enable="{ info }">
          <span :class="info.enable ? 'text-success' : 'text-danger'">
            {{ info.enable ? '是' : '否' }}
          </span>
        </template>
        <!-- 操作列：查看、编辑、删除 -->
        <template #operation="{ info }">
          <EButton type="text" @click="handleView(info)">查看</EButton>
          <EButton type="text" @click="handleEdit(info)">编辑</EButton>
          <EButton type="text" class="text-danger" @click="handleDelete(info)">删除</EButton>
        </template>
      </CTable>
    </ECard>

    <!-- 分页区域 -->
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

    <!-- 新增/编辑/查看弹窗 -->
    <KnowledgeBaseDialog
      slot="dialog"
      :visible.sync="dialogVisible"
      :info="currentRow"
      :dialogType="dialogType"
      @close="handleDialogClose"
      @submit="handleDialogSubmit"
    />
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}

::v-deep .el-pagination {
  text-align: right;
}
</style>
