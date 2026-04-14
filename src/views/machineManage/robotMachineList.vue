<script>
import { useMutation, useQuery } from "@tanstack/vue-query";
import { getCurrentInstance, onMounted, reactive, ref, watch } from "vue";
import { removeRobotDevice, robotDevicePageList } from "@/http/machineManage/index";
import RobotDeviceDialog from "./components/RobotDeviceDialog.vue";
import { robotDeviceListConfig } from "./config";

export default {
  name: "RobotMachineList",
  components: {
    RobotDeviceDialog,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    // 搜索表单
    const searchForm = reactive({
      robotName: "",
      robotCode: "",
      robotId: "",
      pageNum: 1,
      pageSize: 10,
    });

    // 表格数据
    const tableData = ref([]);
    const loading = ref(false);
    const total = ref(0);

    // 弹窗相关
    const dialogVisible = ref(false);
    const dialogType = ref("add"); // add-新增, edit-编辑, view-查看
    const currentRow = ref({});

    // 高级筛选显示/隐藏
    const showMore = ref(false);

    // 表格配置
    const tableConfig = ref(robotDeviceListConfig);

    // 查询列表数据
    const { refetch, isPending } = useQuery({
      queryKey: ["robotDeviceList", searchForm],
      queryFn: () => robotDevicePageList(searchForm),
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

    // 监听 loading 状态
    watch(
      isPending,
      (newVal) => {
        loading.value = newVal;
      },
      { immediate: true }
    );

    // 删除机器人设备
    const { mutate: deleteMutate } = useMutation({
      mutationFn: (params) => removeRobotDevice(params),
      onSuccess: (res) => {
        if (res.data?.success) {
          proxy.$message.success("删除成功");
          refetch();
        } else {
          proxy.$message.error(res.data?.message || "删除失败");
        }
      },
      onError: () => {
        proxy.$message.error("删除失败");
      },
    });

    // 搜索
    const searchFn = () => {
      searchForm.pageNum = 1;
      refetch();
    };

    // 重置
    const resetFn = () => {
      searchForm.robotName = "";
      searchForm.robotCode = "";
      searchForm.robotId = "";
      searchForm.pageNum = 1;
      searchForm.pageSize = 10;
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

    // 删除
    const handleDelete = (row) => {
      proxy
        .$confirm(`确定要删除机器人设备"${row.robotName || row.robotCode}"吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        })
        .then(() => {
          deleteMutate({ id: row.id });
        })
        .catch(() => {
          // 取消删除
        });
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

    return {
      searchForm,
      tableData,
      loading,
      total,
      tableConfig,
      dialogVisible,
      dialogType,
      currentRow,
      showMore,
      searchFn,
      resetFn,
      toggleMore,
      onChange,
      handleAdd,
      handleEdit,
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
  <KyTreeTable ref="treeTable" :isShowLeft="false">
    <!-- 搜索区域 -->
    <ECard slot="search" type="search" noneBottom>
      <el-form :model="searchForm" size="mini" inline>
        <el-form-item label="机器人名称">
          <el-input
            v-model="searchForm.robotName"
            placeholder="请输入机器人名称"
            style="width: 200px"
            clearable
            @keyup.enter.native="searchFn"
            @change="onChange('robotName', $event)"
          />
        </el-form-item>

        <el-form-item v-if="showMore" label="机器人编号">
          <el-input
            v-model="searchForm.robotCode"
            placeholder="请输入机器人编号"
            style="width: 200px"
            clearable
            @change="onChange('robotCode', $event)"
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
      <div class="mb-4">
        <EButton type="primary" btnIcon="el-icon-plus" class="mr-2" @click="handleAdd">
          新增
        </EButton>
      </div>

      <CTable :tableData="tableData" :loading="loading" :list="tableConfig" height="92%">
        <!-- 操作列 -->
        <template #operation="{ info }">
          <EButton type="text" icon="edit" @click="handleEdit(info)"> 编辑 </EButton>
          <EButton type="text" icon="delete" @click="handleDelete(info)"> 删除 </EButton>
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

    <!-- 新增/编辑弹窗 -->
    <template #dialog>
      <RobotDeviceDialog
        :visible.sync="dialogVisible"
        :info="currentRow"
        :dialogType="dialogType"
        @close="handleDialogClose"
        @submit="handleDialogSubmit"
      />
    </template>
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.text-danger {
  color: #f54a41 !important;
}
</style>
