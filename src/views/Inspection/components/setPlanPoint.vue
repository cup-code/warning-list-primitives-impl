<script>
import { getInspectionPointList } from "@/http/inspection/inspection-point-api";
import Sortable from "sortablejs";

export default {
  name: "setPlanPoint",
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    inspectPlaces: {
      type: Array,
      default: () => [],
    },
    companyId: {
      type: [String, Number],
      default: "",
    },
  },
  emits: ["pointChange"],

  // ==================== 数据定义 ====================
  data() {
    return {
      placeList: [],
      tableData: [],
      sortableInstance: null,
    };
  },

  // ==================== 监听器 ====================
  watch: {
    companyId: {
      immediate: true,
      handler(companyId) {
        if (companyId) {
          this.fetchPlaceList();
          // 公司变化时，如果 inspectPlaces 为空则重置，否则等待 inspectPlaces 同步
          if (!this.inspectPlaces?.length) {
            this.tableData = [];
          }
        } else {
          this.resetData();
        }
      },
    },
    inspectPlaces: {
      immediate: true,
      deep: true,
      handler() {
        this.syncTableData();
        this.$nextTick(() => {
          this.initSortable();
        });
      },
    },
  },

  // ==================== 生命周期 ====================
  mounted() {
    if (this.companyId) {
      this.fetchPlaceList();
    }
    this.syncTableData();
    this.$nextTick(() => {
      this.initSortable();
    });
  },

  beforeDestroy() {
    this.destroySortable();
  },

  // ==================== 方法 ====================
  methods: {
    // ==================== 数据同步 ====================
    // 同步 props 到 tableData
    syncTableData() {
      const places = Array.isArray(this.inspectPlaces) ? this.inspectPlaces : [];
      this.tableData = places.length > 0 ? [...places] : [];
    },

    // 重置数据
    resetData() {
      this.placeList = [];
      this.tableData = [];
    },

    // 通知父组件数据变化
    notifyChange() {
      this.$emit("pointChange", this.tableData);
    },

    // ==================== 数据获取 ====================
    // 获取巡检地点列表
    async fetchPlaceList() {
      if (!this.companyId) {
        this.placeList = [];
        return;
      }
      try {
        const { data } = await getInspectionPointList({
          companyId: this.companyId,
          isPage: false,
        });
        this.placeList = data?.success ? data.result?.list || [] : [];
      } catch (error) {
        console.error("获取巡检点列表失败", error);
        this.placeList = [];
      }
    },

    // ==================== 表格操作 ====================
    // 获取默认行数据
    getDefaultRow() {
      return {
        sortOrder: "",
        placeId: "",
      };
    },

    // 添加行
    handleAdd() {
      this.tableData.push(this.getDefaultRow());
      this.$nextTick(() => {
        this.initSortable();
      });
    },

    // 删除行
    handleDelete(index) {
      this.tableData.splice(index, 1);
      this.notifyChange();
    },

    // 巡检点选择变化
    handlePointChange() {
      this.notifyChange();
    },

    // 检查巡检点是否已选中
    isPointSelected(placeId) {
      return this.tableData.some((item) => item.placeId === placeId);
    },

    // ==================== 拖拽功能 ====================
    // 初始化拖拽
    initSortable() {
      if (this.disabled) return;

      this.destroySortable();

      this.$nextTick(() => {
        const tbody = this.$el.querySelector(".el-table__body-wrapper > table > tbody");
        if (!tbody) {
          console.warn("未找到表格 tbody，无法初始化拖拽");
          return;
        }

        this.sortableInstance = Sortable.create(tbody, {
          handle: ".handle",
          animation: 150,
          onEnd: ({ newIndex, oldIndex }) => {
            if (newIndex === oldIndex) return;

            const [movedRow] = this.tableData.splice(oldIndex, 1);
            this.tableData.splice(newIndex, 0, movedRow);
            this.notifyChange();
          },
        });
      });
    },

    // 销毁拖拽实例
    destroySortable() {
      if (this.sortableInstance) {
        this.sortableInstance.destroy();
        this.sortableInstance = null;
      }
    },
  },
};
</script>

<template>
  <div>
    <!-- 顶部按钮 -->
    <EButton
      type="primary"
      btnIcon="el-icon-plus"
      class="m-2"
      @click="handleAdd"
      :disabled="disabled"
    >
      添加巡检点
    </EButton>
    <!-- 表格内容 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      :header-cell-style="{ background: 'var(--ky-head-color)' }"
      row-key="placeId"
    >
      <el-table-column prop="sortOrder" label="序号" width="60" align="center">
        <template #default="scope">
          {{ (scope.row.sortOrder = scope.$index + 1) }}
        </template>
      </el-table-column>
      <el-table-column width="50" align="center" label="拖动">
        <i class="el-icon-rank handle" />
      </el-table-column>
      <el-table-column align="center" prop="placeId" width="280" label="巡检点">
        <template #default="scope">
          <el-select
            v-model="scope.row.placeId"
            placeholder="请选择"
            style="width: 100%"
            filterable
            clearable
            :disabled="disabled"
            @change="handlePointChange"
          >
            <el-option
              v-for="item in placeList"
              :key="item.id"
              :label="item.placeName"
              :value="item.id"
              :disabled="isPointSelected(item.id) && scope.row.placeId !== item.id"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" align="center">
        <template #default="scope">
          <el-button
            style="color: red"
            type="text"
            :disabled="disabled"
            @click="handleDelete(scope.$index)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
.handle {
  cursor: pointer;
}
</style>
