<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { safeCheckTableById, safeCheckTableSave } from '@/http/defense/shandong/safeCheck-api'
import TableAddExtra from './comps/TableAddExtra.vue'
import TableAddFrom from './comps/TableAddFrom.vue'

export default {
  components: {
    TableAddFrom,
    TableAddExtra,
    TreeSelect,
  },
  props: {
    // 是否可编辑
    editable: {
      type: Boolean,
      default: false,
    },
    // 如果是修改，需要传递id
    infoId: {
      type: [String, Number],
      default: null,
    },
    // 类型树
    typeTree: {
      type: Array,
      default() {
        return []
      },
    },
    // 部门列表
    depList: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      showAddFromDialog: false,
      showAddExtraDialog: false,
      isLoading: false,
      editFormData: {
        id: '',
        checkScheduleName: '',
        checkScheduleType: '',
        responsibilityDepartment: '',
        checkContentList: [],
      },
    }
  },
  created() {
    if (this.infoId) {
      this.getContentList()
    }
  },
  methods: {
    /* 获取详情数据 */
    getContentList() {
      this.isLoading = true
      safeCheckTableById(this.infoId)
        .then((res) => {
          if (res.data.success) {
            this.editFormData = this.recover(res.data.result)
            if (!this.editFormData.checkContentList) {
              this.editFormData.checkContentList = []
            }
          }
          else {
            this.$message.warning(res.data.message || '获取检查内容失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取检查内容出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 表类型下拉列表点击 */
    tableTreeNodeTap(id, name) {
      this.editFormData.checkScheduleType = id || ''
      this.editFormData.checkScheduleTypeName = name || ''
      this.$refs.treeSelect.closeSelect()
    },
    departTreeNodeTap(id) {
      this.editFormData.responsibilityDepartment = id || ''
      this.$refs.responsibilityDepartmentTree.closeSelect()
    },
    /* 点击取消 */
    cancelClick(isRefresh) {
      this.$emit('close', isRefresh)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.checkTableForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          safeCheckTableSave(this.editFormData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功')
                this.cancelClick(true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
    /* 删除检查表格数据 */
    delInfoClick(item) {
      this.$confirm(`您确定要删除第${item.$index + 1}条信息吗?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(() => {
          this.editFormData.checkContentList.splice(item.$index, 1)
        })
        .catch(() => {})
    },
    /* 从隐患库添加回调事件 */
    closeAddFromEvt(params) {
      if (params) {
        for (const item of params) {
          this.editFormData.checkContentList.push(item)
        }
      }
      this.showAddFromDialog = false
    },
    /* 额外添加回调事件 */
    closeAddExtraEvt(params) {
      if (params) {
        this.editFormData.checkContentList.push(params)
      }
      this.showAddExtraDialog = false
    },
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    style="height: 100%"
  >
    <div class="dialog-info">
      <!-- 表单 -->
      <el-form
        ref="checkTableForm"
        :model="editFormData"
        label-width="100px"
        :disabled="!editable"
        style="width: calc(100% - 50px)"
      >
        <el-form-item
          label="检查表名称"
          prop="checkScheduleName"
          :rules="[{ required: true, message: '请输入检查表名称', trigger: 'blur' }]"
        >
          <el-input v-model="editFormData.checkScheduleName" />
        </el-form-item>
        <el-form-item
          label="表类型"
          prop="checkScheduleType"
          :rules="[{ required: true, message: '请选择表类型', trigger: 'change' }]"
        >
          <TreeSelect
            ref="treeSelect"
            style="width: 100%"
            :data="typeTree"
            :props="{
              value: 'id',
              label: 'name',
              children: 'children',
            }"
            :value="editFormData.checkScheduleType"
            :label="editFormData.checkScheduleTypeName"
            @getValue="tableTreeNodeTap"
          />
        </el-form-item>
        <el-form-item
          label="责任组织"
          prop="responsibilityDepartment"
          :rules="[{ required: true, message: '请选择责任组织', trigger: 'change' }]"
        >
          <TreeSelect
            ref="responsibilityDepartmentTree"
            :props="{
              value: 'id', // ID字段名
              label: 'departmentName', // 显示名称
              children: 'children', // 子级字段名
            }"
            :list="depList"
            :value="editFormData.responsibilityDepartment"
            @getValue="departTreeNodeTap"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input
            v-model="editFormData.remark"
            type="textarea"
            :rows="4"
            resize="none"
          />
        </el-form-item>
        <el-form-item label="检查项目">
          <el-button
            type="primary"
            size="mini"
            style="margin: 0 10px 0 0"
            @click="showAddFromDialog = true"
          >
            从检查内容库添加
          </el-button>
          <el-button
            type="primary"
            size="mini"
            @click="showAddExtraDialog = true"
          >
            额外添加
          </el-button>
          <!-- <el-button type="success" size="mini">下载Excel模板</el-button> -->
          <!-- <el-button type="success" size="mini">Excel导入</el-button> -->
        </el-form-item>
      </el-form>
      <!-- 表格 -->
      <el-table
        :data="editFormData.checkContentList"
        align="center"
      >
        <el-table-column
          type="index"
          width="50"
          align="center"
          label="序号"
        />
        <el-table-column
          label="检查内容"
          align="center"
          prop="checkContent"
        />
        <el-table-column
          label="检查依据"
          align="center"
          prop="checkBasis"
        />
        <el-table-column
          label="建议等级"
          align="center"
        >
          <template slot-scope="scope">
            <span>{{
              $dictUtils.getDictLabelById('suggest_level', scope.row.recommendedLevel, '--')
            }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="editable"
          label="操作"
          align="center"
          width="100"
          fixed="right"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              size="mini"
              style="color: var(--ky-danger)"
              @click="delInfoClick(scope)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 10px 0 0"
        @click="cancelClick(false)"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        size="medium"
        type="primary"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
    <!-- 从隐患库添加弹窗 -->
    <el-dialog
      title="从检查内容库添加检查数据"
      class="large-dialog"
      :visible.sync="showAddFromDialog"
      append-to-body
      :close-on-click-modal="false"
    >
      <TableAddFrom
        v-if="showAddFromDialog"
        :departList="depList"
        @close="closeAddFromEvt"
      />
    </el-dialog>
    <!-- 额外添加弹窗 -->
    <el-dialog
      class="normal-dialog"
      title="检查表额外添加检查内容"
      :visible.sync="showAddExtraDialog"
      width="800px"
      append-to-body
      :close-on-click-modal="false"
    >
      <TableAddExtra
        v-if="showAddExtraDialog"
        @close="closeAddExtraEvt"
      />
    </el-dialog>
  </div>
</template>
