<script>
export default {
  components: {},
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      loading: false,
      options: {},
      inputForm: {
        id: '',
        code: '',
        autoCreate: '1',
        dataSource: {
          id: 'master',
          name: '本地数据库',
          enName: 'master',
          dbType: '',
        },
        name: '',
        tableName: '',
        source: '',
        version: '',
        remarks: '',
      },
    }
  },
  methods: {
    init(method, id) {
      this.method = method
      this.inputForm.id = id
      if (method === 'add') {
        this.title = `新建数据表单`
      }
      else if (method === 'edit') {
        this.title = '修改数据表单'
      }
      else if (method === 'view') {
        this.title = '查看数据表单'
      }
      this.visible = true
      this.loading = false
      this.$nextTick(() => {
        if (method === 'add') {
          // this.$refs.formDesign.setJSON({'list': [], 'config': {'labelWidth': 100, 'labelPosition': 'right', 'size': 'small', 'customClass': ''}})
        }
        // this.options = {}
        this.inputForm.name = ''
        this.inputForm.tableName = ''
        this.inputForm.source = ''
        this.inputForm.version = ''
        this.inputForm.remarks = ''
        if (method === 'edit' || method === 'view') {
          // 修改或者查看
          this.loading = true
          this.$http({
            url: `/form/make/queryById?id=${this.inputForm.id}`,
            method: 'get',
          }).then(({ data }) => {
            this.inputForm = this.recover(this.inputForm, data.form)
            if (this.inputForm.source) {
              this.options = JSON.parse(this.inputForm.source)
              this.$refs.formDesign.setJSON(this.options)
            }
            else {
              // this.$refs.formDesign.setJSON({'list': [], 'config': {'labelWidth': 100, 'labelPosition': 'right', 'size': 'small', 'customClass': ''}})
            }
            this.loading = false
          })
        }
      })
    },
    handleSubmit() {},
    // 表单提交
    doSubmit() {
      this.inputForm.source = JSON.stringify(this.$refs.formDesign.getJSON())
      this.$refs.inputForm.validate((valid) => {
        if (valid) {
          this.$http({
            url: `/form/make/saveFormSource`,
            method: 'post',
            data: this.inputForm,
          }).then(({ data }) => {
            if (data && data.success) {
              this.visible = false
              this.$message.success(data.msg)
              this.$emit('refreshDataList')
            }
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
      class="dialog-makeForm-form"
      :title="title"
      fullscreen
      :close-on-click-modal="false"

      :visible.sync="visible"
    >
      <el-form
        ref="inputForm"
        v-loading="loading"
        size="small"
        :model="inputForm"
        :class="method === 'view' ? 'readonly' : ''"
        :disabled="method === 'view'"
        label-width="120px"
      >
        <fm-making-form
          v-if="visible"
          ref="formDesign"
          :bindDataTable="inputForm.autoCreate !== '1'"
          style="height: 700px"
          :data="options"
          :uploadPath="`${$http.BASE_URL}/sys/file/webupload/upload?uploadPath=/formbuilder`"
          preview
          :ds="inputForm.dataSource"
          :tableName="inputForm.tableName"
          tab-list
          generate-json
          clearable
        />
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
          v-if="method != 'view'"
          v-noMoreClick
          size="mini"
          type="primary"
          @click="doSubmit()"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.dialog-makeForm-form {
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
