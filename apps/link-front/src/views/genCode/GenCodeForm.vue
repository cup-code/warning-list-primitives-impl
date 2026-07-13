<script>
import { genCodeTemplateFn, saveGenCodeFn } from '@/http/safe-production/genCode/table-list-api'
import FileTree from './FileTree'

export default {
  components: {
    // SelectTree: treeSelect,
    FileTree,
  },
  data() {
    return {
      visible: false,
      loading: false,
      genCodeTemplateGroupList: [],
      tableList: [],
      inputForm: {
        id: '',
        genTable: {
          id: '',
        },
        projectPath: '',
        frontProjectPath: '',
        category: '',
        packageName: 'com.jeeplus.modules',
        moduleName: '',
        subModuleName: '',
        functionName: '',
        functionNameSimple: '',
        functionAuthor: '',
      },
    }
  },
  methods: {
    init(id) {
      this.inputForm.genTable.id = id
      this.visible = true
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
        genCodeTemplateFn(this.inputForm.genTable.id).then(({ data }) => {
          this.inputForm = this.recover(this.inputForm, data.genScheme)
          this.genCodeTemplateGroupList = data.genCodeTemplateGroupList
          this.tableList = data.tableList
        })
      })
    },
    selectFilePath() {
      this.$refs.fileTree.init()
    },
    selectFrontFilePath() {
      this.$refs.frontFileTree.init()
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.loading = true
          saveGenCodeFn(this.inputForm).then(({ data }) => {
            this.loading = false
            if (data && data.success) {
              this.$message.success({
                dangerouslyUseHTMLString: true,
                duration: 20000,
                showClose: true,
                message: data.message,
              })
            }
            else {
              this.$message.error(data.message)
            }
            this.visible = false
          })
        }
      })
    },
  },
}
</script>

<template>
  <el-dialog

    title="生成代码"
    :close-on-click-modal="false"
    width="600px"
    :visible.sync="visible"
  >
    <el-form
      ref="inputForm"
      v-loading="loading"
      :model="inputForm"
      label-width="120px"
      @submit.native.prevent
    >
      <el-row :gutter="15">
        <el-col :span="24">
          <el-form-item
            label="后端生成路径"
            prop="projectPath"
            :rules="[{ required: true, message: '必填项不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.projectPath"
              class="input-with-select"
              placeholder="请输入生成路径"
            >
              <el-button
                slot="append"
                type="primary"
                @click="selectFilePath()"
              >
                选择后端代码生成目录
              </el-button>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="前端生成路径"
            prop="frontProjectPath"
            :rules="[{ required: true, message: '必填项不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.frontProjectPath"
              class="input-with-select"
              placeholder="请输入生成路径"
            >
              <el-button
                slot="append"
                type="primary"
                @click="selectFrontFilePath()"
              >
                选择前端代码生成目录
              </el-button>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="选择代码模板"
            prop="category"
            :rules="[{ required: true, message: '必填项不能为空', trigger: 'blur' }]"
          >
            <el-select
              v-model="inputForm.category"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in genCodeTemplateGroupList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="生成包路径"
            prop="packageName"
            :rules="[{ required: true, message: '必填项不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.packageName"
              :max-length="200"
              placeholder="生成包路径"
            />
          </el-form-item>
          <div class="sub-title">
            建议模块包：com.ubilink.modules
          </div>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="生成模块名"
            prop="moduleName"
            :rules="[{ required: true, message: '必填项不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.moduleName"
              :max-length="200"
              placeholder="可理解为子系统名，例如 sys"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="生成子模块名"
            prop="subModuleName"
          >
            <el-input
              v-model="inputForm.subModuleName"
              :max-length="200"
              placeholder="可选，分层下的文件夹"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="生成功能描述"
            prop="functionName"
            :rules="[{ required: true, message: '必填项不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.functionName"
              :max-length="200"
              placeholder="functionName"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="生成功能名"
            prop="functionNameSimple"
            :rules="[{ required: true, message: '必填项不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.functionNameSimple"
              :max-length="200"
              placeholder="用作功能提示，如：保存“某某”成功"
            />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="生成功能作者"
            prop="functionAuthor"
            :rules="[{ required: true, message: '必填项不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.functionAuthor"
              :max-length="200"
              placeholder="功能开发者"
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
        @click="doSubmit"
      >确定</el-button>
    </span>
    <file-tree
      ref="fileTree"
      @getValue="
        value => {
          inputForm.projectPath = value
        }
      "
    />
    <file-tree
      ref="frontFileTree"
      @getValue="
        value => {
          inputForm.frontProjectPath = value
        }
      "
    />
  </el-dialog>
</template>

<style lang="scss" scoped>
.sub-title {
  font-size: 12px;
  margin-left: 120px;
}
</style>
