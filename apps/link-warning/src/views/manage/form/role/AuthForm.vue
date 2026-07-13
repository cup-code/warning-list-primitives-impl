<script>
// import { getDepartListDetail } from '@/http/safe-production/depart-manage-api'
import SelectTree from "@/components/treeSelect/treeSelect.vue";
import { getAllDepartByCompanyFn } from "@/http/safe-production/depart-manage-api";
import {
  addRole,
  getCompanyMenuList,
  getInnerRole,
  getRoleDepartList,
  getRoleMenuList,
} from "@/http/safe-production/role-manage-api";

export default {
  components: {
    SelectTree,
  },
  data() {
    return {
      visible: false,
      loading: false,
      title: "",
      method: "",
      innerRoleList: [],
      menuList: [],
      dataRuleList: [],
      inputForm: {
        id: "",
        companyId: "", // 所属企业
        departmentId: "", // 责任组织
        roleName: "", // 名称
        enable: true, // 是否启用
        menuIdList: [],
        departmentIdList: [],
      },
      dataRule: {
        companyId: [{ required: true, message: "所属企业不能为空", trigger: "change" }],
        roleName: [{ required: true, message: "名称不能为空", trigger: "blur" }],
      },
      saveLoading: false, // 保存按钮在菜单回显之前不能点击
      loadingTree: false, // 选择企业后，需加载菜单树和部门树
    };
  },
  mounted() {
    // getDepartListDetail(false).then(res => {
    //   const resD = res.data
    //   if (resD.success && resD.result.length) {
    //     this.dataRuleList = this.setTreeData(resD.result)
    //   }
    // })
    getInnerRole().then((res) => {
      const resD = res.data;
      if (resD.success && resD.result) {
        this.innerRoleList = resD.result || [];
      }
    });
  },
  methods: {
    init(method, id, row) {
      this.method = method;
      this.inputForm.id = id;
      if (method === "add") {
        this.title = "新建角色";
      } else if (method === "edit") {
        this.title = "修改角色";
      } else if (method === "view") {
        this.title = "查看角色";
      }
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields();
        this.inputForm = this.recover(this.inputForm, row);
        this.$refs.menuListTree.setCheckedKeys([]);
        this.$refs.dataRuleTree.setCheckedKeys([]);
        // 如果有角色id，则说明是查看或者修改角色
        // 首先先通过角色的所属公司去获取公司所有的菜单
        if (this.inputForm.id) {
          this.saveLoading = true;
          this.setCompanyId(row.companyId).then(() => {
            getRoleMenuList(id).then(({ data }) => {
              this.saveLoading = false;
              if (data.success && data.result.length) {
                data.result.forEach((item) => {
                  this.$refs.menuListTree.setChecked(item.tenantMenuId, true, false);
                });
              }
            });
            this.isDepartChange = false; // 初始化赋值的时候不需要触发change事件
            getRoleDepartList(id).then(({ data }) => {
              this.saveLoading = false;
              if (data.success && data.result.length) {
                data.result.forEach((item) => {
                  this.$refs.dataRuleTree.setChecked(item.id, true, false);
                });
              }
              setTimeout(() => {
                this.isDepartChange = true;
              }, 4000);
            });
          });
        } else {
          setTimeout(() => {
            this.isDepartChange = true;
          }, 2000);
        }
      });
    },
    // 业务单元选择发生变化时
    departCheckChange(a, b, c) {
      if (b && this.isDepartChange) {
        // 如果当前节点有子集
        if (a.children) {
          // 循环子集将他们的选中取消
          a.children.forEach((item) => {
            this.$refs.dataRuleTree.setChecked(item.id, true);
          });
        }
      }
    },
    // 菜单树勾选联动：勾选双向联动，取消只向下
    menuCheckChange(data, state) {
      const tree = this.$refs.menuListTree;
      // 这次点击是"勾上"还是"取消"
      const isChecked = state.checkedKeys.includes(data.tenantMenuId);
      const node = tree.getNode(data.tenantMenuId);
      // 向下：手动递归（check-strictly 下 setChecked 的 deep 参数会被短路，必须自己遍历后代）
      this.setMenuSubtree(node, isChecked);
      // 取消不向上，父保持原状
      if (!isChecked) {
        return;
      }
      // 勾选向上回填：任一子被选中即勾父，逐级上溯至根
      let p = node.parent;
      while (p && p.data && p.data.tenantMenuId != null) {
        tree.setChecked(p.data.tenantMenuId, true, false);
        p = p.parent;
      }
    },
    // 递归勾选/取消整棵子树（check-strictly 下 deep 被短路，需手动遍历）
    setMenuSubtree(node, value) {
      if (node.data && node.data.tenantMenuId != null) {
        this.$refs.menuListTree.setChecked(node.data.tenantMenuId, value, false);
      }
      (node.childNodes || []).forEach((child) => this.setMenuSubtree(child, value));
    },
    // 表单提交
    inputFormSubmit() {
      this.$refs.inputForm.validate((valid) => {
        this.inputForm.menuIdList = this.$refs.menuListTree
          .getCheckedKeys()
          .concat(this.$refs.menuListTree.getHalfCheckedKeys());
        this.inputForm.departmentIdList = this.$refs.dataRuleTree.getCheckedKeys();
        if (valid) {
          this.loading = true;
          this.saveLoading = true;
          addRole(this.inputForm).then((res) => {
            this.loading = false;
            this.saveLoading = false;
            const resD = res.data;
            if (resD && resD.success) {
              this.$message.success(resD.message);
              this.visible = false;
              this.$emit("refreshDataList");
            } else {
              this.$message.error(resD.message);
            }
          });
        }
      });
    },
    setCompanyId(id) {
      this.inputForm.companyId = id;
      if (id) {
        // return getCompanyMenuList(id).then(({data}) => {
        //   if (data.success) {
        //     this.menuList = this.setTreeData(data.result || [])
        //   }
        // })
        this.loadingTree = true;
        return Promise.all([getCompanyMenuList(id), getAllDepartByCompanyFn(id)]).then(
          (res) => {
            this.menuList = this.setTreeData(res[0].data.result || []);
            this.dataRuleList = this.setTreeData(res[1].data.result || []);
            this.loadingTree = false;
          }
        );
      }
    },
  },
};
</script>

<template>
  <el-dialog
    :title="title"
    :close-on-click-modal="false"
    width="800px"
    class="auth-form normal-dialog"
    :visible.sync="visible"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      size="small"
      class="auth"
      :model="inputForm"
      status-icon
      :rules="dataRule"
      label-width="100px"
      :disabled="method === 'view'"
      inline
      @submit.native.prevent
    >
      <el-form-item prop="companyId" label="所属企业">
        <SelectTree
          ref="companyTree"
          :props="{
            value: 'id', // ID字段名
            label: 'companyName', // 显示名称
            children: 'children', // 子级字段名
          }"
          url="sysCompany/getSubordinateCompany"
          :value="inputForm.companyId"
          :clearable="true"
          :accordion="true"
          @getValue="setCompanyId"
        />
      </el-form-item>
      <el-form-item label="责任组织" prop="departmentId">
        <SelectTree
          :props="{
            value: 'id',
            label: 'departmentName',
            children: 'children',
          }"
          :url="`sysDepartment/companyDepartment/${inputForm.companyId}`"
          :value="inputForm.departmentId"
          :clearable="true"
          :accordion="true"
          @getValue="
            (value) => {
              inputForm.departmentId = value;
            }
          "
        />
      </el-form-item>
      <el-form-item prop="roleName" label="名称">
        <el-input
          v-model="inputForm.roleName"
          size="small"
          placeholder="名称"
          clearable
        />
      </el-form-item>
      <el-form-item prop="enable" label="状态">
        <el-radio-group v-model="inputForm.enable">
          <el-radio-button :label="true"> 启用 </el-radio-button>
          <el-radio-button :label="false"> 禁用 </el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-row v-show="inputForm.companyId">
        <el-col :span="11">
          <el-alert :closable="false">
            <div slot="title">菜单权限</div>
          </el-alert>
          <div class="tree-bar">
            <el-tree
              ref="menuListTree"
              v-loading="loadingTree"
              :data="menuList"
              :props="{
                label: 'menuName',
                children: 'children',
              }"
              node-key="tenantMenuId"
              default-expand-all
              show-checkbox
              check-strictly
              @check="menuCheckChange"
            />
          </div>
        </el-col>
        <el-col :span="11" style="margin-left: 10px">
          <el-alert :closable="false">
            <div slot="title">业务单元</div>
          </el-alert>
          <div class="tree-bar">
            <el-tree
              ref="dataRuleTree"
              v-loading="loadingTree"
              :data="dataRuleList"
              :props="{
                label: 'departmentName',
                children: 'children',
              }"
              node-key="id"
              default-expand-all
              show-checkbox
              check-strictly
              @check-change="departCheckChange"
            />
          </div>
        </el-col>
      </el-row>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="visible = false">关闭</el-button>
      <el-button
        v-if="method !== 'view'"
        v-noMoreClick
        type="primary"
        icon="el-icon-check"
        size="small"
        :loading="saveLoading"
        @click="inputFormSubmit()"
        >保存</el-button
      >
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
.auth-form ::v-deep {
  .el-tree-node__label {
    margin-left: 6px;
  }
}

.auth-form .tree-bar {
  height: 220px;
  overflow: auto;
}
</style>
