<script>
import Icon from '@/components/icon'
import SelectTree from '@/components/treeSelect/treeSelect'
import { createMenuFn, getMenuTreeDataFn } from '@/http/safe-production/genCode/table-list-api'

export default {
  components: {
    SelectTree,
    Icon,
  },
  data() {
    return {
      visible: false,
      menuList: [],
      menuListTreeProps: {
        label: 'name',
        children: 'children',
      },
      inputForm: {
        parent: {
          id: '',
        },
        name: '',
        englishName: '',
        gen_table_id: '',
        genTableType: '',
        icon: '',
      },
    }
  },
  methods: {
    init(id, genTableType) {
      this.inputForm.gen_table_id = id
      this.inputForm.genTableType = genTableType
      getMenuTreeDataFn().then(({ data }) => {
        this.menuList = data.treeData
      })
      this.visible = true
      this.$nextTick(function () {
        this.$refs.inputForm.resetFields()
        this.$refs.menuParentTree.clearHandle()
      })
    },
    // 图标选中
    iconActiveHandle(iconName) {
      this.inputForm.icon = iconName
    },
    selectIcon() {
      this.$refs.icon.visible = true
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          createMenuFn(this.inputForm).then(({ data }) => {
            if (data && data.success) {
              this.$message.success({
                dangerouslyUseHTMLString: true,
                message: data.message,
              })
              this.visible = false
            }
            else {
              this.$message.error(data.message)
            }
          })
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog

    title="创建菜单"
    :close-on-click-modal="false"
    :visible.sync="visible"
  >
    <el-form
      ref="inputForm"
      :model="inputForm"
      label-width="120px"
      @submit.native.prevent
    >
      <el-row :gutter="15">
        <el-col :span="24">
          <el-form-item
            label="上级菜单"
            prop="parent.id"
            :rules="[{ required: true, message: '请选择上级菜单', trigger: 'blur' }]"
          >
            <SelectTree
              ref="menuParentTree"
              :props="{
                value: 'id', // ID字段名
                label: 'menuName', // 显示名称
                children: 'children', // 子级字段名
              }"
              :data="menuList"
              :value="inputForm.parent.id"
              :clearable="true"
              :accordion="true"
              @getValue="
                value => {
                  inputForm.parent.id = value
                }
              "
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="名称"
            prop="name"
            :rules="[{ required: true, message: '名称不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.name"
              placeholder="菜单名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="英文名"
            prop="englishName"
            :rules="[{ required: true, message: '英文名不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.englishName"
              placeholder="菜单名称"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="菜单图标"
            prop="icon"
          >
            <el-input
              v-model="inputForm.icon"
              placeholder="菜单图标名称"
              style="width: 100%"
              clearable
              readonly
              @focus="selectIcon"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        size="small"
        @click="visible = false"
      >关闭</el-button>
      <el-button
        v-noMoreClick
        type="primary"
        size="small"
        @click="doSubmit()"
      >确定</el-button>
    </span>
    <icon
      ref="icon"
      @getValue="
        value => {
          inputForm.icon = value
        }
      "
    />
  </el-dialog>
</template>

<style lang="scss" scoped></style>
