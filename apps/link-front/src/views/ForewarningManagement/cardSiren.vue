<script>
import { computed, getCurrentInstance, onMounted, ref } from "vue";
import { selectCompany } from "@/http/GeneralQuery.js";
import {
  deleteCardSiren,
  queryCardSiren,
  queryVideoSiren,
} from "@/http/videoWarning/warning-api";
import { cardSirenColumns } from "./config";
import CardSirenDialog from "./components/CardSirenDialog.vue";

export default {
  name: "CardSiren",
  components: {
    CardSirenDialog,
  },
  setup() {
    const { proxy } = getCurrentInstance();

    const searchForm = ref({
      sn: "",
      pageNum: 1,
      pageSize: 10,
    });

    const tableData = ref([]);
    const loading = ref(false);
    const total = ref(0);
    const columns = cardSirenColumns;

    const dialogVisible = ref(false);
    const dialogType = ref("add");
    const dialogRecord = ref({});

    const cardOptions = ref([]);
    const sirenOptions = ref([]);

    const companyId = computed(() => {
      return (
        proxy?.$store?.state?.company?.companyId ||
        proxy?.$store?.state?.user?.user?.companyId ||
        JSON.parse(localStorage.getItem("userInfo") || "{}").companyId ||
        ""
      );
    });

    const sirenNameMap = computed(() => {
      const map = {};
      sirenOptions.value.forEach((item) => {
        if (item.id) {
          map[item.id] = item.deviceName || item.deviceNum || item.name || item.id;
        }
      });
      return map;
    });

    const formatSirenNames = (ids) => {
      if (!ids) return "--";

      const idList = Array.isArray(ids) ? ids : String(ids).split(",").filter(Boolean);

      if (!idList.length) return "--";

      return idList.map((id) => sirenNameMap.value[id] || id).join("、");
    };

    const fetchCardOptions = async () => {
      if (!companyId.value) return;

      try {
        const res = await selectCompany({
          busId: companyId.value,
          busIdType: "COMPANY_ID",
        });
        if (res.data?.success) {
          cardOptions.value = res.data.result || [];
        } else {
          proxy.$message.warning(res.data?.message || "定位卡列表获取失败");
        }
      } catch (error) {
        console.error("获取定位卡列表失败", error);
        proxy.$message.error("获取定位卡列表失败");
      }
    };

    const fetchSirenOptions = async () => {
      try {
        const res = await queryVideoSiren({ pageNum: 1, pageSize: 500 });
        if (res.data?.success) {
          const list =
            res.data?.result?.list || res.data?.result?.records || res.data?.result || [];
          sirenOptions.value = Array.isArray(list) ? list : [];
        } else {
          proxy.$message.warning(res.data?.message || "声光报警器列表获取失败");
        }
      } catch (error) {
        console.error("获取声光报警器列表失败", error);
        proxy.$message.error("获取声光报警器列表失败");
      }
    };

    const fetchTableData = async () => {
      loading.value = true;
      try {
        const res = await queryCardSiren({
          ...searchForm.value,
          isPage: 1,
        });

        if (res.data?.success) {
          const result = res.data?.result || {};
          const list = Array.isArray(result)
            ? result
            : result.list || result.records || [];
          const mappedList = (list || []).map((item) => ({
            ...item,
            sirenNameText:
              item.sirenNames || item.sirenName || formatSirenNames(item.sirenIds),
          }));
          tableData.value = mappedList;
          total.value = result.total || result.totalCount || mappedList.length;
        } else {
          proxy.$message.error(res.data?.message || "获取列表失败");
        }
      } catch (error) {
        console.error("获取定位卡关联列表失败", error);
        proxy.$message.error("获取定位卡关联列表失败");
      } finally {
        loading.value = false;
      }
    };

    const handleSearch = () => {
      searchForm.value.pageNum = 1;
      fetchTableData();
    };

    const handleReset = () => {
      searchForm.value = {
        sn: "",
        pageNum: 1,
        pageSize: 10,
      };
      fetchTableData();
    };

    const handleSizeChange = (size) => {
      searchForm.value.pageSize = size;
      fetchTableData();
    };

    const handleCurrentChange = (current) => {
      searchForm.value.pageNum = current;
      fetchTableData();
    };

    const handleAdd = () => {
      dialogType.value = "add";
      dialogRecord.value = {
        buildId: proxy?.$store?.state?.user?.user?.buildId || "",
      };
      dialogVisible.value = true;
    };

    const handleEdit = (row) => {
      dialogType.value = "edit";
      dialogRecord.value = {
        ...row,
        sirenIds: row.sirenIds ? String(row.sirenIds).split(",").filter(Boolean) : [],
      };
      dialogVisible.value = true;
    };

    const handleDelete = async ({ id }) => {
      try {
        await proxy.$confirm("确定要删除该关联吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        });
        const res = await deleteCardSiren({ id });
        if (res.data?.success) {
          proxy.$message.success("删除成功");
          fetchTableData();
        } else {
          proxy.$message.error(res.data?.message || "删除失败");
        }
      } catch (error) {
        if (error !== "cancel") {
          console.error("删除关联失败", error);
          proxy.$message.error("删除失败");
        }
      }
    };

    const handleDialogSuccess = () => {
      dialogVisible.value = false;
      fetchTableData();
    };

    const handleDialogClosed = () => {
      dialogRecord.value = {};
    };

    onMounted(async () => {
      await Promise.all([fetchCardOptions(), fetchSirenOptions()]);
      fetchTableData();
    });

    return {
      searchForm,
      tableData,
      loading,
      total,
      columns,
      dialogVisible,
      dialogType,
      dialogRecord,
      cardOptions,
      sirenOptions,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleAdd,
      handleEdit,
      handleDelete,
      handleDialogSuccess,
      handleDialogClosed,
    };
  },
};
</script>

<template>
  <KyTreeTable :isShowLeft="false">
    <ECard slot="search" type="search" noneBottom>
      <el-form
        :model="searchForm"
        size="mini"
        inline
        class="flex flex-wrap items-center gap-4 text-sm"
      >
        <el-form-item label="定位卡号">
          <el-input
            v-model="searchForm.sn"
            placeholder="请输入定位卡号"
            clearable
            class="w-52"
            @keyup.enter.native="handleSearch"
          />
        </el-form-item>
        <div class="flex items-center gap-3">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">
            查询
          </el-button>
          <el-button icon="el-icon-refresh-right" @click="handleReset"> 重置 </el-button>
        </div>
      </el-form>
    </ECard>

    <ECard slot="table">
      <div class="flex items-center justify-between flex-wrap gap-3 mb-4">
        <div class="flex items-center gap-3">
          <EButton
            type="primary"
            btnIcon="el-icon-plus"
            class="text-sm"
            @click="handleAdd"
          >
            新增关联
          </EButton>
        </div>
      </div>

      <CTable :tableData="tableData" :loading="loading" :list="columns" height="92%">
        <template #sirenNameText="{ info }">
          <span class="text-gray-700">{{ info.sirenNameText || "--" }}</span>
        </template>
        <template #operation="{ info }">
          <div class="flex items-center justify-end gap-2 text-sm">
            <EButton type="text" icon="edit" @click="handleEdit(info)"> 编辑 </EButton>
            <EButton type="text" icon="delete" @click="handleDelete(info)">
              删除
            </EButton>
          </div>
        </template>
      </CTable>
    </ECard>

    <ECard slot="page" type="footer">
      <el-pagination
        :current-page="searchForm.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="searchForm.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </ECard>

    <CardSirenDialog
      slot="dialog"
      :visible.sync="dialogVisible"
      :type="dialogType"
      :record="dialogRecord"
      :cardOptions="cardOptions"
      :sirenOptions="sirenOptions"
      @success="handleDialogSuccess"
      @closed="handleDialogClosed"
    />
  </KyTreeTable>
</template>
