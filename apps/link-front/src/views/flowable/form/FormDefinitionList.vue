<script>
import SelectTree from "@/components/flowable/treeSelect/treeSelect.vue";
import {
  extensionFormCategoryDelete,
  extensionFormDefinitionDelete,
  getExtensionFormCategoryTreeData,
  getExtensionFormDefinitionList,
} from "@/http/safe-production/flowable-api";
import FormCategoryForm from "./FormCategoryForm";
import FormDefinitionForm from "./FormDefinitionForm";

import DesignForm from "./MakeFlowableForm";

export default {
  components: {
    SelectTree,
    FormDefinitionForm,
    FormCategoryForm,
    DesignForm,
  },
  data() {
    return {
      searchForm: {
        category: {
          id: "",
        },
        name: "",
      },
      filterText: "",
      formCategoryTreeData: [],
      dataList: [],
      pageNo: 1,
      pageSize: 10,
      total: 0,
      orderBy: "",
      dataListSelections: [],
      isImportCollapse: false,
      loading: false,
    };
  },
  watch: {
    filterText(val) {
      this.$refs.formCategoryTree.filter(val);
    },
  },
  mounted() {
    this.refreshTree();
    this.refreshList();
  },
  methods: {
    filterNode(value, data) {
      if (!value) return true;
      return data.name.includes(value);
    },
    refreshTree() {
      getExtensionFormCategoryTreeData().then(({ data }) => {
        this.formCategoryTreeData = data.treeData;
      });
    },
    handleNodeClick(data) {
      this.searchForm.category.id = data.id;
      this.refreshList();
    },
    addChildTreeNode(node) {
      this.$refs.formCategoryForm.init("addChild", {
        id: "",
        parent: { id: node.id, name: node.name },
      });
    },
    // 新增
    addTreeNode() {
      this.$refs.formCategoryForm.init("add", {
        id: "",
        parent: { id: "", name: "" },
      });
    },
    // 修改
    editTreeNode(data) {
      this.$refs.formCategoryForm.init("edit", {
        id: data.id,
        parent: { id: "", name: "" },
      });
    },
    delTreeNode(data) {
      this.$confirm(`确定删除所选项吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.loading = true;
        extensionFormCategoryDelete(data.id)
          .then(({ data }) => {
            if (data && data.success) {
              this.$message.success(data.msg);
              this.refreshTree();
              this.refreshList();
            }
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
    // 获取数据列表
    refreshList() {
      this.loading = true;
      getExtensionFormDefinitionList({
        pageNo: this.pageNo,
        pageSize: this.pageSize,
        orderBy: this.orderBy,
        ...this.searchForm,
      })
        .then(({ data }) => {
          if (data && data.success) {
            this.dataList = data.page.list;
            this.total = data.page.count;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    // 每页数
    sizeChangeHandle(val) {
      this.pageSize = val;
      this.pageNo = 1;
      this.refreshList();
    },
    // 当前页
    currentChangeHandle(val) {
      this.pageNo = val;
      this.refreshList();
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
    },

    // 排序
    sortChangeHandle(obj) {
      if (obj.order === "ascending") {
        this.orderBy = `${obj.prop} asc`;
      } else if (obj.order === "descending") {
        this.orderBy = `${obj.prop} desc`;
      } else {
        this.orderBy = "";
      }
      this.refreshList();
    },
    // 新增
    add() {
      this.$refs.formDefinitionForm.init("add", "");
    },
    // 新增
    showDesignForm(id, jsonId) {
      this.$refs.designForm.init(id, jsonId);
    },
    manage(id) {
      this.$router.push(`/flowable/form/FormDefinitionJsonList?id=${id}`);
    },
    // 修改
    edit(id) {
      id =
        id ||
        this.dataListSelections.map((item) => {
          return item.id;
        })[0];
      this.$refs.formDefinitionForm.init("edit", id);
    },
    // 查看
    view(id) {
      this.$refs.formDefinitionForm.init("view", id);
    },
    // 删除
    del(id) {
      const ids =
        id ||
        this.dataListSelections
          .map((item) => {
            return item.id;
          })
          .join(",");
      this.$confirm(`确定删除所选流程表单以及级联的表单版本吗?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.loading = true;
        extensionFormDefinitionDelete(ids)
          .then(({ data }) => {
            if (data && data.success) {
              this.$message.success(data.msg);
              this.refreshList();
            }
          })
          .finally(() => {
            this.loading = false;
          });
      });
    },
    resetSearch() {
      this.$refs.searchForm.resetFields();
      this.filterText = "";
      this.$refs.formCategoryTree.setCurrentKey(null);
      this.refreshList();
    },
  },
};
</script>

<template>
  <KyTreeTable ref="treeTable" :isShowLeft="true">
    <ECard slot="tree" customStyle="height:100%" type="sidebar">
      <!-- <div class="formDefinitionList-left"> -->
      <div class="title">
        <el-input v-model="filterText" placeholder="输入关键字进行过滤" size="mini" />
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-plus"
          circle
          @click="addTreeNode"
        />
        <!-- </div> -->
      </div>
      <div class="scrollbar el-scrollbar">
        <!-- <div class="el-scrollbar__wrap"> -->
        <!-- <div class="el-scrollbar__view"> -->
        <el-tree
          ref="formCategoryTree"
          class="filter-tree"
          :data="formCategoryTreeData"
          :props="{
            value: 'id', // ID字段名
            label: 'name', // 显示名称
            children: 'children', // 子级字段名
          }"
          default-expand-all
          :filter-node-method="filterNode"
          :expand-on-click-node="false"
          highlight-current
          node-key="id"
          @node-click="handleNodeClick"
        >
          <span slot-scope="{ node, data }" class="custom-tree-node">
            <span>{{ node.label }}</span>
            <span>
              <el-button
                type="text"
                class="tree-item-button"
                icon="el-icon-plus"
                @click="() => addChildTreeNode(data)"
              />
              <el-button
                type="text"
                class="tree-item-button"
                icon="el-icon-edit-outline"
                @click="() => editTreeNode(data)"
              />
              <el-button
                type="text"
                class="tree-item-button"
                icon="el-icon-delete"
                @click="() => delTreeNode(data)"
              />
            </span>
          </span>
        </el-tree>
        <!-- </div> -->
        <!-- </div> -->
      </div>
    </ECard>
    <ECard slot="search" type="search" noneBottom>
      <el-form
        ref="searchForm"
        size="small"
        :inline="true"
        class="query-form"
        :model="searchForm"
        @keyup.enter.native="refreshList()"
        @submit.native.prevent
      >
        <!-- 搜索框 -->
        <el-form-item prop="category.id">
          <SelectTree
            ref="category"
            :props="{
              value: 'id', // ID字段名
              label: 'name', // 显示名称
              children: 'children', // 子级字段名
            }"
            size="mini"
            url="/extension/formCategory/treeData"
            :value="searchForm.category.id"
            :clearable="true"
            :accordion="true"
            @getValue="
              (value) => {
                searchForm.category.id = value;
              }
            "
          />
        </el-form-item>

        <el-form-item prop="name">
          <el-input
            v-model="searchForm.name"
            size="mini"
            placeholder="表单名称"
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="mini"
            icon="el-icon-search"
            @click="refreshList()"
          >
            查询
          </el-button>
          <el-button size="mini" icon="el-icon-refresh-right" @click="resetSearch()">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </ECard>

    <ECard slot="table">
      <div class="card-cell">
        <!-- <el-button v-if="hasPermission('extension:formDefinition:add')" type="primary" size="mini" icon="el-icon-plus" @click="add()">新建</el-button>
                    <el-button v-if="hasPermission('extension:formDefinition:edit')" type="warning" size="mini" icon="el-icon-edit-outline" @click="edit()" :disabled="dataListSelections.length != 1" plain>修改</el-button>
                    <el-button v-if="hasPermission('extension:formDefinition:del')" type="danger" size="mini" icon="el-icon-delete" @click="del()" :disabled="dataListSelections.length <= 0" plain>删除</el-button> -->
        <EButton type="primary" size="mini" btnIcon="el-icon-plus" @click="add()">
          新建
        </EButton>
        <EButton
          type="success"
          size="mini"
          icon="edit"
          :disabled="dataListSelections.length !== 1"
          plain
          @click="edit()"
        >
          修改
        </EButton>
        <EButton
          type="danger"
          size="mini"
          icon="delete"
          :disabled="dataListSelections.length <= 0"
          plain
          @click="del()"
        >
          删除
        </EButton>
        <el-button-group class="pull-right">
          <el-button
            type="default"
            size="mini"
            icon="el-icon-refresh"
            @click="refreshList"
          />
        </el-button-group>
      </div>

      <el-table
        v-loading="loading"
        :data="dataList"
        size="mini"
        :header-cell-style="{ background: 'var(--ky-head-color)' }"
        class="table"
        height="90%"
        @selection-change="selectionChangeHandle"
        @sort-change="sortChangeHandle"
      >
        <el-table-column
          type="selection"
          header-align="center"
          align="center"
          width="50"
        />

        <el-table-column
          prop="name"
          show-overflow-tooltip
          sortable="custom"
          label="表单名称"
        >
          <template slot-scope="scope">
            <!-- <el-link  type="primary" :underline="false" v-if="hasPermission('extension:formDefinition:edit')" @click="edit(scope.row.id)">{{scope.row.name}}</el-link>
                            <el-link  type="primary" :underline="false" v-else-if="hasPermission('extension:formDefinition:view')"  @click="view(scope.row.id)">{{scope.row.name}}</el-link>
                            <span v-else>{{scope.row.name}}</span> -->

            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="category.name" show-overflow-tooltip label="分类" />

        <el-table-column
          prop="formDefinitionJson.version"
          show-overflow-tooltip
          label="版本号"
        />

        <el-table-column
          prop="formDefinitionJson.status"
          show-overflow-tooltip
          label="状态"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.formDefinitionJson.status === '1'"
              size="small"
              type="success"
            >
              已发布
            </el-tag>
            <el-tag v-else size="small" type="danger"> 未发布 </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="formDefinitionJson.isPrimary"
          show-overflow-tooltip
          label="是否主版本"
        >
          <template slot-scope="scope">
            <el-tag
              v-if="scope.row.formDefinitionJson.isPrimary === '1'"
              size="small"
              type="success"
            >
              主版本
            </el-tag>
            <el-tag v-else size="small" type="danger"> 非主版本 </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          :key="Math.random()"
          header-align="right"
          align="right"
          fixed="right"
          width="250"
          label="操作"
        >
          <template slot-scope="scope">
            <!-- <el-button v-if="hasPermission('extension:formDefinition:view')" type="text" icon="el-icon-view" size="mini" @click="showDesignForm(scope.row.id, scope.row.formDefinitionJson.id)">设计</el-button>
                            <el-button v-if="hasPermission('extension:formDefinition:edit')" type="text" icon="el-icon-edit" size="mini" @click="edit(scope.row.id)">修改</el-button>
                            <el-button v-if="hasPermission('extension:formDefinition:edit')" type="text" icon="el-icon-edit" size="mini" @click="manage(scope.row.id)">版本管理</el-button>
                            <el-button v-if="hasPermission('extension:formDefinition:del')" type="text"  icon="el-icon-delete" size="mini" @click="del(scope.row.id)">删除</el-button> -->

            <EButton
              type="text"
              btnIcon="el-icon-view"
              size="mini"
              @click="showDesignForm(scope.row.id, scope.row.formDefinitionJson.id)"
            >
              设计
            </EButton>
            <EButton type="text" icon="edit" size="mini" @click="edit(scope.row.id)">
              修改
            </EButton>
            <EButton
              type="text"
              btnIcon="el-icon-edit"
              size="mini"
              @click="manage(scope.row.id)"
            >
              版本管理
            </EButton>
            <EButton type="text" icon="delete" size="mini" @click="del(scope.row.id)">
              删除
            </EButton>
          </template>
        </el-table-column>
      </el-table>
    </ECard>
    <ECard slot="page" type="footer">
      <el-pagination
        style="text-align: right"
        :current-page="pageNo"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        :total="total"
        background
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="sizeChangeHandle"
        @current-change="currentChangeHandle"
      />
    </ECard>

    <!-- 弹窗, 新增 / 修改 -->
    <FormDefinitionForm
      slot="dialog"
      ref="formDefinitionForm"
      @showDesignForm="showDesignForm"
      @refreshDataList="refreshList"
    />
    <FormCategoryForm slot="dialog" ref="formCategoryForm" @refreshTree="refreshTree" />
    <DesignForm slot="dialog" ref="designForm" @refreshDataList="refreshList" />
  </KyTreeTable>
</template>

<style lang="scss" scoped>
.page-container-sidebar {
  // padding: 10px;
  // height: calc(100vh - 50px);
  // box-sizing: border-box;
  // display: flex;
  // flex-direction: row;
  // .formDefinitionList-left {
  // width: 220px;
  // height: 100%;
  // padding: 0 10px;
  // box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.1);
  // display: flex;
  // flex-direction: column;
  // margin-right: 10px;
  .title {
    // padding-top: 10px;
  }
  .scrollbar {
    padding-top: 10px;
    flex: 1;
    .el-scrollbar__wrap {
      overflow: auto !important;
      .filter-tree {
        margin-top: 15px;
        font-size: 14px;

        .el-tree-node__content {
          &:hover .tree-item-button {
            display: unset;
          }
          .tree-item-button {
            display: none;
          }

          .custom-tree-node {
            width: calc(100% - 30px);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
        }
      }
    }
  }
}
.formDefinitionList-right {
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;

  .query-form {
    box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.1);
    padding-left: 12px;
    padding-top: 12px;
    margin-bottom: 10px;
    .el-form-item {
      margin-bottom: 12px;
    }
    .el-form-item__label {
      font-size: 14px !important;
    }
  }
  .main-con {
    box-shadow: 0 0 12px 2px rgba(0, 0, 0, 0.1);
    flex: 1;
    padding: 10px;
    .pull-right {
      float: right;
    }
    .el-table {
      margin-top: 10px;
      margin-bottom: 10px;
      border-top: 1px solid #ebeef5;
      .el-table__header {
        thead tr {
          background-color: #f6f7fa;
          font-weight: 400;
          th {
            background-color: #f6f7fa;
            font-weight: 400;
          }
        }
      }
    }
    .el-pagination {
      text-align: right;
    }
  }
}
// }

// 选择用户弹窗的 样式
.dialog-selfForm {
  .el-dialog {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-height: calc(100% - 30px);
    max-width: calc(100% - 30px);
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    .el-dialog__header {
      border-bottom: 1px solid #e8e8e8;
    }
    .el-dialog__body {
      overflow: auto;
      // padding: 10px 0 0 10px;
    }
    .el-dialog__footer {
      border-top: 1px solid #e8e8e8;
      border-radius: 0 0 4px 4px;
    }

    .el-table {
      border-top: 1px solid #ebeef5;
      .el-table__header {
        thead tr {
          background-color: #f6f7fa;
          font-weight: 400;
          th {
            background-color: #f6f7fa;
            font-weight: 400;
          }
        }
      }
    }
  }
}
</style>
