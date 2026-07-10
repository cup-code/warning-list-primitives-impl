<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { safeCheckModuleSave } from '@/http/defense/shandong/safeCheck-api'

export default {
  components: {
    TreeSelect,
  },
  props: {
    // 内容类型树
    typeTree: {
      type: Array,
      default() {
        return []
      },
    },
    // 是否可编辑
    editable: {
      type: Boolean,
      default: false,
    },
    // 内容，若是修改则需要传递
    info: {
      type: Object,
      default() {
        return {}
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
      isLoading: false,
      editFormData: {},
      levelList: [],
    }
  },
  created() {
    const dicList = JSON.parse(sessionStorage.getItem('dictList'))
    this.levelList = dicList.suggest_level
  },
  mounted() {
    this.$nextTick(() => {
      this.editFormData = { ...this.info }
    })
  },
  methods: {
    /* 树列表选择回调 */
    treeChangeEvt(id, name) {
      this.editFormData.checkContentType = id || ''
      this.editFormData.checkContentTypeName = name || ''
      this.$refs.treeSelect.closeSelect()
    },
    /* 关闭 */
    closeClick() {
      this.$emit('close', false)
    },
    departTreeNodeTap(id, name) {
      this.editFormData.departmentId = id || ''
      this.editFormData.departmentName = name || ''
      this.$refs.responsibilityDepartmentTree.closeSelect()
    },
    /* 提交 */
    submitClick() {
      this.$refs.editForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          safeCheckModuleSave(this.editFormData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功')
                this.$emit('close', true)
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
  },
}
</script>

<template>
  <div v-loading="isLoading">
    <el-form
      ref="editForm"
      :model="editFormData"
      label-width="100px"
      :disabled="!editable"
    >
      <el-form-item
        label="内容类型"
        prop="checkContentType"
        :rules="{ required: true, message: '请选择内容类型', trigger: 'blur' }"
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
          :value="editFormData.checkContentType"
          :label="editFormData.checkContentTypeName"
          @getValue="treeChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="检查内容"
        prop="checkContent"
        :rules="{ required: true, message: '请输入检查内容', trigger: 'blur' }"
      >
        <el-input
          v-model="editFormData.checkContent"
          type="textarea"
          :rows="4"
          resize="none"
        />
      </el-form-item>
      <el-form-item
        label="责任组织"
        prop="departmentId"
        :rules="{ required: true, message: '请选择责任组织', trigger: 'blur' }"
      >
        <TreeSelect
          ref="responsibilityDepartmentTree"
          :props="{
            value: 'id', // ID字段名
            label: 'departmentName', // 显示名称
            children: 'children', // 子级字段名
          }"
          :list="depList"
          :value="editFormData.departmentId"
          @getValue="departTreeNodeTap"
        />
      </el-form-item>
      <el-form-item
        label="检查依据"
        prop="checkBasis"
      >
        <el-input v-model="editFormData.checkBasis" />
      </el-form-item>
      <el-form-item
        label="建议等级"
        prop="recommendedLevel"
      >
        <el-select v-model="editFormData.recommendedLevel">
          <el-option
            v-for="item in levelList"
            :key="item.id"
            :label="item.dictName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        @click="closeClick"
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
  </div>
</template>
