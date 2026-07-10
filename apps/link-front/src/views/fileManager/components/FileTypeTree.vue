<script>
import {
  docKnowledgeTypeTreeDel,
  docKnowledgeTypeTreeGetByType,
  docKnowledgeTypeTreeSaveOrUpdate,
} from '@/http/file-manager/fileTree-api.js'
import TreeBox from '@/views/common-ui/TreeBox.vue'

export default {
  components: {
    TreeBox,
  },
  data() {
    return {
      propData: {
        title: '知识库类别',
        getTreeFunc: docKnowledgeTypeTreeGetByType,
        saveFunc: docKnowledgeTypeTreeSaveOrUpdate,
        delFunc: docKnowledgeTypeTreeDel,
        maxLv: 3,
      },
      dialogTitle: '',
      allNodeList: [],
      editFormData: {},
      showEditDialog: false,
    }
  },
  methods: {
    /* 是否显示弹窗 */
    showDialogEvt(params) {
      if (params) {
        this.allNodeList = this.$refs.treeBox.treeList
        this.editFormData = params
        // 判断层级
        if (params.parentId == '-1') {
          this.editFormData.level = 0
        }
        else {
          this.editFormData.level += 1
        }
        // 判断是新增还是修改
        if (params.id) {
          this.dialogTitle = '编辑知识库类别'
        }
        else {
          this.dialogTitle = '新增知识库类别'
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
          label="类别名称"
          prop="name"
          :rules="{
            required: true,
            message: '请输入类别名称',
            trigger: 'blur',
          }"
        >
          <el-input v-model="editFormData.name" />
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button @click="showEditDialog = false">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="submitClick"
        >
          确认保存
        </el-button>
      </div>
    </el-dialog>
  </TreeBox>
</template>
