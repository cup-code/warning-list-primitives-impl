<script>
import Icon from '@/components/icon'
import SelectTree from '@/components/treeSelect/treeSelect.vue'
// import DataRuleList from './DataRuleList'
export default {
  components: {
    SelectTree,
    // DataRuleList,
    Icon,
  },
  data() {
    return {
      visible: false,
      menuList: [],
      form: {},
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
        id: '',
        icon: '',
        dataRuleList: [],
        formId: '',
      },
      loading: false,
    }
  },
  methods: {
    init(form) {
      this.form = form
      this.inputForm.name = form.name
      this.inputForm.englishName = form.englishName
      this.inputForm.reportCode = form.reportCode
      this.inputForm.reportType = form.reportType
      this.$http({
        url: `/sys/menu/treeData`,
        method: 'get',
      }).then(({ data }) => {
        this.menuList = data.treeData
      })
      this.visible = true
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        // this.$refs.dataRuleList.dataRuleList = []
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
          this.loading = true
          this.$http
            .post('/report/createMenu', this.inputForm)
            .then(({ data }) => {
              if (data && data.code == 200) {
                this.$message.success({
                  dangerouslyUseHTMLString: true,
                  message: data.message,
                })
                this.visible = false
              }
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      class="dialog-menuForm-reportDesign"
      title="创建菜单"
      :close-on-click-modal="false"

      width="600px"
      :visible.sync="visible"
    >
      <el-form
        ref="inputForm"
        size="small"
        :model="inputForm"
        label-width="120px"
        @keyup.enter.native="doSubmit()"
        @submit.native.prevent
      >
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

        <el-form-item
          label="名称"
          prop="name"
          :rules="[{ required: true, message: '名称不能为空', trigger: 'blur' }]"
        >
          <el-input
            v-model="inputForm.name"
            maxlength="200"
            placeholder="菜单名称"
          />
        </el-form-item>

        <el-form-item
          label="英文名"
          prop="englishName"
          :rules="[{ required: true, message: '英文名不能为空', trigger: 'blur' }]"
        >
          <el-input
            v-model="inputForm.englishName"
            maxlength="200"
            placeholder="英文名"
          />
        </el-form-item>

        <el-form-item
          v-if="inputForm.type !== '2'"
          label="菜单图标"
          prop="icon"
        >
          <el-input
            v-model="inputForm.icon"
            clearable
            :readonly="true"
            style="width: 100%"
            placeholder="菜单图标名称"
            @focus="selectIcon"
          />
        </el-form-item>

        <!-- <data-rule-list ref="dataRuleList" :form="form" /> -->
      </el-form>

      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          size="mini"
          @click="visible = false"
        >关闭</el-button>
        <el-button
          size="mini"
          type="primary"
          :loading="loading"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>

    <Icon
      ref="icon"
      @getValue="value => (inputForm.icon = value)"
    />
  </div>
</template>

<style lang="scss" scoped>
.dialog-menuForm-reportDesign {
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
    }
    .el-dialog__footer {
      border-top: 1px solid #e8e8e8;
      border-radius: 0 0 4px 4px;
    }
  }
}
</style>
