<script>
import {
  getTemplateContentFn,
  saveTemplateFn,
} from '@/http/safe-production/genCode/template-list-api'

export default {
  data() {
    return {
      editorOptions: {
        // 设置代码编辑器的样式
        enableBasicAutocompletion: true,
        enableSnippets: true,
        enableLiveAutocompletion: true,
        tabSize: 2,
        fontSize: 12,
        showPrintMargin: false, // 去除编辑器里的竖线
      },
      visible: false,
      mainTabValue: '',
      childTabValue: '',
      tabIndex: 2,
      title: '',
      inputForm: {
        id: '',
        name: '',
        type: '1',
        remarks: '',
        genCodeTemplateObjList: [],
      },
    }
  },
  components: {
    Editor: require('vue2-ace-editor'),
  },
  computed: {
    mainTemplateList() {
      return this.inputForm.genCodeTemplateObjList.filter((item) => {
        return item.isChild === '0' && item.delFlag !== '1'
      })
    },
    childTemplateList() {
      return this.inputForm.genCodeTemplateObjList.filter((item) => {
        return item.isChild === '1' && item.delFlag !== '1'
      })
    },
  },
  methods: {
    init(method, id) {
      if (method === 'add') {
        this.title = '新增模板'
      }
      else if (method === 'edit') {
        this.title = '编辑模板'
      }
      this.inputForm.id = id
      this.inputForm.genCodeTemplateObjList = []
      this.mainTabValue = ''
      this.childTabValue = ''
      this.visible = true
      this.$nextTick(() => {
        this.$refs.inputForm.resetFields()
      })
      if (method === 'edit' || method === 'view') {
        // 修改或者查看
        getTemplateContentFn(this.inputForm.id).then(({ data }) => {
          this.inputForm = this.recover(this.inputForm, data.genCodeTemplateGroup)
          this.mainTabValue = this.mainTemplateList[0].id
          this.childTabValue
            = this.childTemplateList[0] !== undefined ? this.childTemplateList[0].id : ''
        })
      }
    },
    editorInit() {
      require('brace/ext/language_tools') // language extension prerequsite...
      require('brace/mode/html')
      // require('brace/mode/javascript')    //language
      require('brace/mode/less')
      require('brace/theme/tomorrow_night_blue')
      // require('brace/snippets/javascript')
    },
    addTab1() {
      this.$prompt('请输入一个文件名', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then((res) => {
        const value = res.value
        const newTabName = `t${new Date().getTime()}`
        this.inputForm.genCodeTemplateObjList.push({
          id: '',
          delFlag: '0',
          contents: '',
          isChild: '0',
          name: value,
          index: newTabName,
        })
        this.mainTabValue = newTabName
      })
    },
    addTab2() {
      this.$prompt('请输入一个文件名', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then((res) => {
        const value = res.value
        const newTabName = `t${new Date().getTime()}`
        this.inputForm.genCodeTemplateObjList.push({
          id: '',
          delFlag: '0',
          contents: '',
          isChild: '1',
          name: value,
          index: newTabName,
        })
        this.childTabValue = newTabName
      })
    },
    editTab1() {
      this.inputForm.genCodeTemplateObjList.forEach((tab, index) => {
        if (tab.id === this.mainTabValue || tab.index === this.mainTabValue) {
          this.$prompt('请输入一个新的文件名', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: tab.name,
          }).then((res) => {
            const value = res.value
            tab.name = value
          })
        }
      })
    },
    editTab2(targetName) {
      this.inputForm.genCodeTemplateObjList.forEach((tab, index) => {
        if (tab.id === this.childTabValue || tab.index === this.childTabValue) {
          this.$prompt('请输入一个新的文件名', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            inputValue: tab.name,
          }).then((res) => {
            const value = res.value
            tab.name = value
          })
        }
      })
    },
    removeTab1(targetName) {
      const tabs = this.mainTemplateList
      const activeName = this.mainTabValue
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if ((tab.index || tab.id) === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.index || nextTab.id
            }
          }
        })
      }
      this.mainTabValue = activeName
      this.inputForm.genCodeTemplateObjList.forEach((item, index) => {
        if (item.id === targetName) {
          item.delFlag = '1'
          this.$set(this.inputForm.genCodeTemplateObjList, index, item)
        }
        if (item.index === targetName) {
          this.inputForm.genCodeTemplateObjList.splice(index, 1)
        }
      })
    },
    removeTab2(targetName) {
      const tabs = this.childTemplateList
      const activeName = this.childTabValue
      if (activeName === targetName) {
        tabs.forEach((tab, index) => {
          if ((tab.index || tab.id) === targetName) {
            const nextTab = tabs[index + 1] || tabs[index - 1]
            if (nextTab) {
              activeName = nextTab.index || nextTab.id
            }
          }
        })
      }
      this.childTabValue = activeName
      this.inputForm.genCodeTemplateObjList.forEach((item, index) => {
        if (item.id === targetName) {
          item.delFlag = '1'
          this.$set(this.inputForm.genCodeTemplateObjList, index, item)
        }
        if (item.index === targetName) {
          this.inputForm.genCodeTemplateObjList.splice(index, 1)
        }
      })
    },
    // 表单提交
    doSubmit() {
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          // _this8.$http.post('/gencode/genCodeTemplateGroup/save', _this8.inputForm)
          saveTemplateFn(this.inputForm).then(({ data }) => {
            if (data && data.success) {
              this.$message.success({
                dangerouslyUseHTMLString: true,
                message: data.message,
              })
              this.visible = false
              this.$emit('refreshDataList')
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

    :title="title"
    :visible.sync="visible"
    fullscreen
    class="templateForm"
    :close-on-click-modal="false"
  >
    <el-form
      ref="inputForm"
      size="small"
      :model="inputForm"
      label-width="120px"
      @submit.native.prevent
    >
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="模板名字"
            prop="name"
            :rules="[{ required: true, message: '名称不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.name"
              :max-length="200"
              placeholder="模板名字"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="模板分类"
            prop="type"
            :rules="[{ required: true, message: '表类型不能为空', trigger: 'blur' }]"
          >
            <el-select
              v-model="inputForm.type"
              placeholder="请选择"
              style="width: 100%"
            >
              <el-option
                v-for="item in $dictUtils.getDictList('gen_template_type')"
                :key="item.id"
                :label="item.dictName"
                :value="item.dictCode"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item
            label="备注"
            prop="remarks"
            :rules="[{ required: true, message: '表类型不能为空', trigger: 'blur' }]"
          >
            <el-input
              v-model="inputForm.remarks"
              type="textarea"
              :max-length="200"
              placeholder="备注"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-tabs type="border-card">
      <el-tab-pane label="主表">
        <div style="margin-bottom: 15px">
          <el-button @click="addTab1()">
            新增
          </el-button>
          <el-button @click="editTab1()">
            编辑
          </el-button>
        </div>
        <el-tabs
          v-model="mainTabValue"
          type="card"
          closable
          @tab-remove="removeTab1"
        >
          <el-tab-pane
            v-for="item in mainTemplateList"
            :key="item.index || item.id"
            :label="item.name"
            :name="item.index || item.id"
          >
            <editor
              v-model="item.contents"
              lang="ftl"
              theme="tomorrow_night_blue"
              width="100%"
              height="1000px"
              :options="editorOptions"
              @init="editorInit"
            />
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
      <el-tab-pane
        v-if="inputForm.type === '2'"
        label="附表"
      >
        <div style="margin-bottom: 15px">
          <el-button @click="addTab2()">
            新增
          </el-button>
          <el-button @click="editTab2()">
            编辑
          </el-button>
        </div>
        <el-tabs
          v-model="childTabValue"
          type="card"
          closable
          @tab-remove="removeTab2"
        >
          <el-tab-pane
            v-for="item in childTemplateList"
            :key="item.index || item.id"
            :label="item.name"
            :name="item.index || item.id"
          >
            <editor
              v-model="item.contents"
              lang="ftl"
              theme="tomorrow_night_blue"
              width="100%"
              height="1000px"
              :options="editorOptions"
              @init="editorInit"
            />
          </el-tab-pane>
        </el-tabs>
      </el-tab-pane>
    </el-tabs>
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
  </el-dialog>
</template>

<style lang="scss" scoped>
.templateForm {
  margin: 10px;
}
.templateForm .el-dialog {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.templateForm .el-dialog__body {
  height: 80%;
  overflow: auto;
}
</style>
