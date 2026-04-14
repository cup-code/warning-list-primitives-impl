<script>
import {
  addAFirstLevelDirectory,
  addOtherDirectories,
  qureyTree,
} from '@/http/accidentManage/investigation'

export default {
  data: () => ({
    loading: false,
    visible: false,
    treeData: [],
    defaultProps: {
      value: 'id',
      children: 'children',
      label: 'name',
    },
    form: {
      id: '',
      parentId: '',
      parentName: '',
      name: '',
      suspensionAndSalaryRetentionPeriod: '',
      sort: '',
    },
    rules: {
      parentName: [
        {
          required: true,
          message: '上级分类不能为空',
          leaderNametrigger: 'blur',
        },
      ],
      name: [
        {
          required: true,
          message: '分类名称不能为空',
          leaderNametrigger: 'blur',
        },
      ],
    },
    flag: '',
  }),
  watch: {
    'form.suspensionAndSalaryRetentionPeriod': function (val) {
      if (String(val).includes('.')) {
        // 值为小数
        const ns = String(val).split('.')
        if (ns[1] !== '5') {
          // 小数点后不为5，重置为5
          this.$message.warning('停工留薪水期最小单位0.5个月')
          this.form.suspensionAndSalaryRetentionPeriod = Number(`${ns[0]}.5`)
        }
      }
    },
  },
  created() {
    this.getDataList()
  },
  methods: {
    init(flag, data) {
      console.log(data)
      this.flag = flag
      if (this.flag == 'add') {
        this.rules.parentName = []
      }
      this.form = Object.assign(this.form, data)
      this.visible = true
    },
    // 清除选中
    clearHandle() {
      this.form.parentId = ''
      this.clearSelected()
    },
    /* 清空选中样式 */
    clearSelected() {
      const allNode = document.querySelectorAll('#tree-option .el-tree-node')
      allNode.forEach(element => element.classList.remove('is-current'))
    },
    // 选择上级分类
    handleNodeClick(node) {
      this.form.parentId = node.parentId
      this.form.parentName = node[this.defaultProps.label]
    },
    // 获取数据列表
    async getDataList() {
      const res = await qureyTree()
      this.treeData = res.result
    },
    closeDialog() {
      Object.assign(this.form, this.$options.data().form)
      this.$refs.form.resetFields()
    },
    // 清除选中
    clearHandle() {
      this.form.parentId = ''
      this.clearSelected()
    },
    /* 清空选中样式 */
    clearSelected() {
      const allNode = document.querySelectorAll('#tree-option .el-tree-node')
      allNode.forEach(element => element.classList.remove('is-current'))
    },
    // 选择伤害部位
    handleNodeClick(node) {
      this.form.parentId = node.parentId
      this.form.parentName = node[this.defaultProps.label]
    },
    submitForm() {
      this.$refs.form.validate(async (valid) => {
        if (valid) {
          this.loading = true
          let res
          if (this.flag == 'add') {
            res = await addAFirstLevelDirectory(this.form)
          }
          else {
            res = await addOtherDirectories(this.form)
          }

          this.loading = false
          if (res.success) {
            this.visible = false
            this.$emit('refreshDataList')
            this.$message.success(res.message || '保存成功')
          }
          else {
            this.$message.warning(res.message || '保存失败')
          }
        }
        else {
          return false
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog
    title="新增分类目录"
    :close-on-click-modal="false"
    width="600px"

    :visible.sync="visible"
    class="normal-dialog"
    @close="closeDialog"
  >
    <el-form
      ref="form"
      :rules="rules"
      :model="form"
      label-width="100px"
      class="demo-ruleForm"
    >
      <el-form-item
        label="上级分类"
        prop="parentName"
      >
        <!-- <el-select :disabled="flag == 'add'" style="width: 100%" clearable @clear="clearHandle" v-model="form.parentName">
          <el-option :value="form.parentId" :label="form.parentName">
            <el-tree id="tree-option" ref="selectTree" :data="treeData" :props="defaultProps" :node-key="defaultProps.value" @node-click="handleNodeClick"> </el-tree>
          </el-option>
        </el-select> -->
        <el-input
          v-model="form.parentName"
          :disabled="flag == 'add'"
        />
      </el-form-item>
      <el-form-item
        label="分类名称"
        prop="name"
      >
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item
        label="停工留薪水期"
        prop="suspensionAndSalaryRetentionPeriod"
      >
        <el-input
          v-model.number="form.suspensionAndSalaryRetentionPeriod"
          type="number"
        >
          <template slot="append">
            月
          </template>
        </el-input>
      </el-form-item>
      <el-form-item
        label="排序"
        prop="sort"
      >
        <el-input
          v-model.number="form.sort"
          type="number"
          style="width: 200px; margin-right: 10px"
        />
        <span>值越小越靠前，支持小数</span>
      </el-form-item>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >取消</el-button>
      <el-button
        size="small"
        type="success"
        :loading="loading"
        @click="submitForm"
      >保存</el-button>
    </span>
  </el-dialog>
</template>

<style></style>
