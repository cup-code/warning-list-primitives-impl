<script>
import { getDepartListDetail } from "@/http/safe-production/depart-manage-api";
import { getUserList, getUserLists } from "@/http/safe-production/user-manage-api";

export default {
  props: {
    selectData: {
      type: Array,
      default: () => {
        return [];
      },
    },
    title: {
      type: String,
      default: () => {
        return "用户选择";
      },
    },
    limit: {
      type: Number,
      default: 999999,
    },
    userType: {
      type: String,
      default: () => {
        return "";
      },
    },
    departmentId: {
      type: String,
      default: () => {
        return "";
      },
    },
    departmentIds: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {
      filterText: "",
      dataListAllSelections: [], // 所有选中的数据包含跨页数据
      dataListSelections: [],
      idKey: "id", // 标识列表数据中每一行的唯一键的名称(需要按自己的数据改一下)
      dataList: [],
      dynamicTags: [],
      officeTreeData: [],
      total: 0,
      loading: false,
      visible: false,
      sForm: {
        pageNum: 1,
        pageSize: 10,
        departmentId: "",
        fuzzyQuery: "",
      },
    };
  },
  watch: {
    filterText(val) {
      this.$refs.officeTree.filter(val);
    },
  },
  methods: {
    init() {
      this.visible = true;
      this.$nextTick(() => {
        this.dataListAllSelections = JSON.parse(JSON.stringify(this.selectData));
        this.refreshTree();
        this.resetSearch();
      });
    },
    renderContent(h, { node, data, store }) {
      return h("span", { class: "custom-tree-node" }, [
        data.type === "1"
          ? h("i", { class: "fa fa-sitemap" })
          : h("i", { class: "fa fa-users" }),
        h("span", { class: "text" }, node.label),
      ]);
    },
    getTemplateRow(index, row) {
      // 获取选中数据
      this.dataListSelections = [row];
      this.$nextTick(() => {
        this.changePageCoreRecordData();
      });
    },
    // 设置选中的方法
    setSelectRow() {
      if (!this.dataListAllSelections || this.dataListAllSelections.length <= 0) {
        this.$refs.userTable.clearSelection();
        return;
      }
      // 标识当前行的唯一键的名称
      const idKey = this.idKey;
      const selectAllIds = [];
      this.dataListAllSelections.forEach((row) => {
        selectAllIds.push(row[idKey]);
      });
      this.$refs.userTable.clearSelection();
      for (let i = 0; i < this.dataList.length; i++) {
        if (selectAllIds.includes(this.dataList[i][idKey])) {
          // 设置选中，记住table组件需要使用ref="table"
          this.$refs.userTable.toggleRowSelection(this.dataList[i], true);
        }
      }
    },
    // 记忆选择核心方法
    changePageCoreRecordData() {
      // 标识当前行的唯一键的名称
      const idKey = this.idKey;
      const that = this;
      // 如果总记忆中还没有选择的数据，那么就直接取当前页选中的数据，不需要后面一系列计算
      if (this.dataListAllSelections.length <= 0) {
        this.dataListSelections.forEach((row) => {
          that.dataListAllSelections.push(row);
        });
        return;
      }
      // 总选择里面的key集合
      const selectAllIds = [];
      this.dataListAllSelections.forEach((row) => {
        selectAllIds.push(row[idKey]);
      });
      const selectIds = [];
      // 获取当前页选中的id
      this.dataListSelections.forEach((row) => {
        selectIds.push(row[idKey]);
        // 如果总选择里面不包含当前页选中的数据，那么就加入到总选择集合里
        if (!selectAllIds.includes(row[idKey])) {
          that.dataListAllSelections.push(row);
        }
      });
      const noSelectIds = [];
      // 得到当前页没有选中的id
      this.dataList.forEach((row) => {
        if (!selectIds.includes(row[idKey])) {
          noSelectIds.push(row[idKey]);
        }
      });
      noSelectIds.forEach((id) => {
        if (selectAllIds.includes(id)) {
          for (let i = 0; i < that.dataListAllSelections.length; i++) {
            if (that.dataListAllSelections[i][idKey] === id) {
              // 如果总选择中有未被选中的，那么就删除这条
              that.dataListAllSelections.splice(i, 1);
              break;
            }
          }
        }
      });
      // console.log(this.dataListAllSelections)
    },
    // 得到选中的所有数据
    getAllSelectionData() {
      // 再执行一次记忆勾选数据匹配，目的是为了在当前页操作勾选后直接获取选中数据
      this.changePageCoreRecordData();
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.departmentName.includes(value);
    },
    del(tag) {
      this.dataListAllSelections.splice(this.dataListAllSelections.indexOf(tag), 1);
      this.$nextTick(() => {
        this.setSelectRow();
      });
    },
    // 获取数据列表
    refreshList() {
      this.loading = true;
      const parmas = Object.assign(this.sForm);
      let func;
      if (this.departmentIds.length > 0) {
        parmas.departmentIdList = this.departmentIds;
        delete parmas.departmentId;
        func = getUserLists;
      } else {
        // 防止用户先传入departmentIds后，parmas对象给departmentIdList赋值过。
        delete parmas.departmentIdList;
        func = getUserList;
      }
      parmas.userStatusList = [1];
      func(parmas)
        .then(({ data }) => {
          this.loading = false;
          if (data.success) {
            this.dataList = data.result.list;
            this.total = data.result.total;
          } else {
            this.$message.error(data.message || "查询用户失败");
          }
          this.$nextTick(() => {
            this.setSelectRow();
          });
        })
        .catch(() => {
          this.loading = false;
          this.$message.error("查询用户失败");
        });
    },
    refreshTree() {
      getDepartListDetail(false)
        .then(({ data }) => {
          if (data.success) {
            this.officeTreeData = this.setTreeData(data.result || []);
          } else {
            this.$message.error(data.message || "查询部门失败");
          }
        })
        .catch(() => {
          this.$message.error("查询部门失败");
        });
    },
    // 每页数
    sizeChangeHandle(val) {
      console.log(val, 111);
      this.sForm.pageSize = val;
      // this.sForm.pageNum = 1
      this.refreshList();
      this.$nextTick(() => {
        this.changePageCoreRecordData();
      });
    },
    // 当前页
    currentChangeHandle(val) {
      console.log(val, 222);
      this.sForm.pageNum = val;
      this.refreshList();
      this.$nextTick(() => {
        this.changePageCoreRecordData();
      });
    },
    // 多选
    selectionChangeHandle(val) {
      this.dataListSelections = val;
      this.$nextTick(() => {
        this.changePageCoreRecordData();
      });
    },
    search() {
      this.sForm.pageNum = 1;
      this.refreshList();
    },
    handleNodeClick(data) {
      this.sForm.pageNum = 1;
      this.sForm.departmentId = data.id;
      this.refreshList();
    },
    resetSearch() {
      this.sForm.pageNum = 1;
      this.sForm.pageSize = 10;
      this.sForm.departmentId = this.departmentId;
      this.$refs.officeTree.setCurrentKey(null);
      this.$refs.sForm.resetFields();
      this.refreshList();
    },
    doSubmit() {
      if (this.limit < this.dataListAllSelections.length) {
        this.$message.error(`你最多只能选择${this.limit}个用户`);
        return;
      }
      this.visible = false;
      this.$emit("doSubmit", this.dataListAllSelections, this.userType);
    },
  },
};
</script>

<template>
  <div>
    <el-dialog
      :title="title"
      :width="departmentId || departmentIds ? '800px' : '1100px'"
      :close-on-click-modal="false"
      :append-to-body="true"
      class="userDialog"
      :visible.sync="visible"
    >
      <el-container style="height: 500px">
        <el-aside v-show="!departmentId && !departmentIds" width="300px">
          <el-card class="org">
            <div slot="header" class="clearfix">
              <el-input
                v-model="filterText"
                placeholder="请输入组织机构过滤"
                size="small"
              />
            </div>
            <el-tree
              ref="officeTree"
              :data="officeTreeData"
              :props="{
                value: 'id', // ID字段名
                label: 'departmentName', // 显示名称
                children: 'children', // 子级字段名
              }"
              default-expand-all
              highlight-current
              node-key="id"
              :render-content="renderContent"
              :filter-node-method="filterNode"
              :expand-on-click-node="false"
              @node-click="handleNodeClick"
            />
          </el-card>
        </el-aside>

        <el-container>
          <el-header style="text-align: left; font-size: 12px; height: 30px">
            <el-form
              ref="sForm"
              size="small"
              :inline="true"
              :model="sForm"
              @keyup.enter.native="refreshList()"
              @submit.native.prevent
            >
              <el-form-item prop="fuzzyQuery">
                <el-input
                  v-model="sForm.fuzzyQuery"
                  size="small"
                  placeholder="关键字"
                  clearable
                />
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  size="small"
                  icon="el-icon-search"
                  style="margin: 0 10px 0 0"
                  @click="search()"
                >
                  查询
                </el-button>
                <el-button
                  size="small"
                  icon="el-icon-refresh-right"
                  @click="resetSearch()"
                >
                  重置
                </el-button>
              </el-form-item>
            </el-form>
          </el-header>

          <el-main style="width: 600px">
            <el-table
              ref="userTable"
              v-loading="loading"
              :data="dataList"
              size="small"
              height="calc(100% - 40px)"
              style="width: 100%"
              @selection-change="selectionChangeHandle"
            >
              <el-table-column
                v-if="limit <= 1"
                header-align="center"
                align="center"
                width="50"
              >
                <template slot-scope="scope">
                  <el-radio
                    :label="scope.row.id"
                    :value="dataListAllSelections[0] && dataListAllSelections[0].id"
                    @change.native="getTemplateRow(scope.$index, scope.row)"
                  >
                    <span />
                  </el-radio>
                </template>
              </el-table-column>
              <el-table-column
                v-if="limit > 1"
                type="selection"
                header-align="center"
                align="center"
                width="50"
              />
              <el-table-column label="所属企业" prop="companyName" align="center" />
              <el-table-column label="所属部门" prop="departmentName" align="center" />
              <el-table-column label="姓名" prop="fullName" align="center" />
              <el-table-column label="账号" prop="username" align="center" />
              <!-- <el-table-column label="角色" prop="roles" align='center'>
              <template slot-scope="props">
                  <el-tag size="mini" effect="plain" v-for="item in props.row.roles" :key="item.id">{{item.name}}</el-tag>
              </template>
          </el-table-column> -->
              <el-table-column label="手机号码" prop="mobile" align="center" />
              <el-table-column label="状态" prop="status" align="center">
                <template slot-scope="props">
                  <el-tag v-if="props.row.status === '0'" type="danger"> 禁用 </el-tag>
                  <el-tag v-if="props.row.status === '1'" type="success"> 在职 </el-tag>
                  <el-tag v-if="props.row.status === '2'" type="warning"> 借调 </el-tag>
                  <el-tag v-if="props.row.status === '3'" type="danger"> 离职 </el-tag>
                  <el-tag v-if="props.row.status === '4'" type="danger"> 退休 </el-tag>
                </template>
              </el-table-column>
            </el-table>
            <el-pagination
              :current-page.sync="sForm.pageNum"
              :page-sizes="[5, 10, 20]"
              :page-size.sync="sForm.pageSize"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="sizeChangeHandle"
              @current-change="currentChangeHandle"
            />
          </el-main>
        </el-container>

        <el-aside width="200px">
          <el-tag
            v-for="tag in dataListAllSelections"
            :key="tag.id"
            closable
            :disable-transitions="false"
            @close="del(tag)"
          >
            {{ tag.fullName }}
          </el-tag>
        </el-aside>
      </el-container>
      <span slot="footer" class="dialog-footer">
        <el-button size="small" style="margin: 0 10px 0 0" @click="visible = false"
          >关闭</el-button
        >
        <el-button size="small" type="primary" @click="doSubmit()">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.org {
  height: 100%;
  .el-card__header {
    padding: 10px;
  }
  .el-card__body {
    padding: 10px;
    max-height: 520px;
    overflow: auto;
  }
}
.userDialog {
  .el-dialog__body {
    padding: 10px 0px 0px 10px;
    color: #606266;
    font-size: 14px;
    word-break: break-all;
  }
  .el-main {
    padding: 20px 20px 5px 20px;
    .el-pagination {
      margin-top: 5px;
    }
  }
}
</style>
