<script>
import {
  getSafeCheckModuleTypeTree,
  safeCheckModuleTypeTreeDel,
  safeCheckModuleTypeTreeSave,
} from '@/http/defense/shandong/safeCheck-api'
import TreeBox from '@/views/common-ui/TreeBox.vue'

export default {
  components: {
    TreeBox,
  },
  data() {
    return {
      propData: {
        title: '检查内容类型',
        getTreeFunc: getSafeCheckModuleTypeTree,
        saveFunc: safeCheckModuleTypeTreeSave,
        delFunc: safeCheckModuleTypeTreeDel,
        isAdd: this.hasBtnPermission('safe_module_type_add'),
        isEdit: this.hasBtnPermission('safe_module_type_modify'),
        isDel: this.hasBtnPermission('safe_module_type_delete'),
      },
      allNodeList: [],
      editFormData: {},
      showEditDialog: false,
      dialogTitle: '', // 弹窗标题
    }
  },
  methods: {
    /* 是否显示弹窗 */
    showDialogEvt(params) {
      if (params) {
        this.allNodeList = this.$refs.treeBox.treeList
        this.editFormData = {
          id: params.id ? params.id : '',
          parentId: params.parentId ? params.parentId : '',
          sort: params.sort ? params.sort : 0,
          typeName: params.name ? params.name : '',
        }
        if (params.name) {
          this.dialogTitle = '检查内容类型详情'
        }
        else {
          this.dialogTitle = '新增检查内容类型'
        }
        this.showEditDialog = true
      }
      else {
        this.showEditDialog = false
      }
    },
    /* 点击部门树的item */
    treeNodeTap(params) {
      this.$emit('treeNodeTap', params)
    },
    /* 确认保存 */
    submitClick() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.$refs.treeBox.submitClick(this.editFormData)
        }
      })
    },
    /* 获取数据 1:扁平结构 非1:树形结构 */
    getTreeData(type) {
      let result = this.$refs.treeBox.treeData
      if (type === 1) {
        result = this.$refs.treeBox.treeList
      }
      return result
    },
    /* 清空选中状态及模糊查询 */
    refreshTree() {
      this.$refs.treeBox.refreshClick()
    },
  },
}
</script>

<template>
  <TreeBox
    v-bind="propData"
    ref="treeBox"
    @showDialog="showDialogEvt"
    @treeNodeTap="treeNodeTap"
  >
    <el-dialog
      slot="dialog"
      class="normal-dialog"
      :title="dialogTitle"
      :visible.sync="showEditDialog"
      destroy-on-close
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editForm"
        :model="editFormData"
        label-width="100px"
      >
        <el-form-item
          label="序号"
          prop="sort"
          :rules="{ required: true, message: '请输入序号', trigger: 'blur' }"
        >
          <el-input
            v-model="editFormData.sort"
            type="number"
          />
        </el-form-item>
        <el-form-item
          v-if="editFormData.parentId !== '-1'"
          label="上级库"
          prop="parentId"
        >
          <el-select
            v-model="editFormData.parentId"
            disabled
          >
            <el-option
              v-for="item in allNodeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="库名"
          prop="typeName"
          :rules="{ required: true, message: '请输入库名', trigger: 'blur' }"
        >
          <el-input v-model="editFormData.typeName" />
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button
          size="medium"
          @click="showEditDialog = false"
        >
          取消
        </el-button>
        <el-button
          size="medium"
          type="primary"
          @click="submitClick"
        >
          确认保存
        </el-button>
      </div>
    </el-dialog>
  </TreeBox>
</template>
