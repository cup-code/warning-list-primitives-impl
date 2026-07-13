<script>
export default {
  data() {
    return {
      title: '',
      method: '',
      beanId: '',
      visible: false,
      initData: {},
      dataBindMap: new Map(),
      options: { list: [] },
    }
  },
  mounted() {
    this.createForm()
  },
  methods: {
    init(method, formId, beanId) {
      this.method = method
      this.beanId = beanId
      this.initData = {}
      if (method === 'add') {
        this.title = `新建`
      }
      else if (method === 'edit') {
        this.title = '修改'
      }
      else if (method === 'view') {
        this.title = '查看'
      }
      this.visible = true
      this.loading = false
      this.$nextTick(() => {
        this.$refs.generateForm.reset()
        if (beanId) {
          this.loading = true
          this.$http({
            url: `/form/generate/queryById?formId=${formId}&id=${beanId}`,
            method: 'get',
          }).then(({ data }) => {
            this.loading = false
            for (const key in data.obj) {
              const dataField = this.dataBindMap.get(key)
              if (
                dataField
                && (dataField.type === 'checkbox'
                  || dataField.type === 'imgupload'
                  || dataField.type === 'table'
                  || (dataField.type === 'select' && dataField.options.multiple)
                  || dataField.type === 'fileupload')
              ) {
                if (data.obj[key] && typeof data.obj[key] === 'string') {
                  // 解决换行符
                  data.obj[key] = data.obj[key]
                    .replaceAll('\r\n', '')
                    .replaceAll('\r', '')
                    .replaceAll('\n', '')
                  // 解决多余引号
                  data.obj[key] = data.obj[key].replace(/"([^"]*)":("[^"]*"|[^,}]*)/g, '"$1":$2')
                  data.obj[key] = JSON.parse(data.obj[key])
                }
                else if (!data.obj[key]) {
                  data.obj[key] = []
                }
              }
              if (
                dataField
                && (dataField.type === 'number' || dataField.options.dataType === 'number')
              ) {
                if (
                  data.obj[key] !== undefined
                  && data.obj[key] !== ''
                  && typeof data.obj[key] === 'string'
                ) {
                  data.obj[key] = JSON.parse(data.obj[key])
                }
              }
            }
            this.initData = data.obj
          })
        }
      })
    },
    generateModel(genList) {
      for (let i = 0; i < genList.length; i++) {
        if (genList[i].type === 'grid') {
          genList[i].columns.forEach((item) => {
            this.generateModel(item.list)
          })
        }
        else if (genList[i].type === 'tabs') {
          genList[i].tabs.forEach((item) => {
            this.generateModel(item.list)
          })
        }
        else if (genList[i].type === 'report') {
          genList[i].rows.forEach((row) => {
            row.columns.forEach((column) => {
              this.generateModel(column.list)
            })
          })
        }
        else {
          // 处理老版本没有dataBind值的情况，默认绑定数据
          if (genList[i].options.dataBind) {
            // genList[i] = genList[i].replace('\r\n', '');
            this.dataBindMap.set(genList[i].model, genList[i])
          }
        }
      }
    },
    createForm() {
      this.$http({
        url: `/form/make/queryById?id=${this.$route.query.id}`,
        method: 'get',
      }).then(({ data }) => {
        if (data.form.source) {
          this.options = JSON.parse(data.form.source)
        }
        else {
          this.options = {
            list: [],
            config: {
              labelWidth: 100,
              labelPosition: 'right',
              size: 'small',
              customClass: '',
            },
          }
        }
        this.dataBindMap.clear()
        this.generateModel(this.options.list)
      })
    },

    // 表单提交
    doSubmit() {
      // 自定义js ，保存前执行
      if (this.options.config.eventType === '1') {
        // eslint-disable-next-line no-new-func
        new Function(`return ${this.options.config.customJs}`)()
      }

      this.$refs.generateForm
        .getData()
        .then((data) => {
          if (this.beanId) {
            data.id = this.beanId
          }
          this.$http({
            url: `/form/generate/save`,
            method: 'post',
            data: { formId: this.$route.query.id, data: JSON.stringify(data) },
          }).then(({ data }) => {
            if (data && data.success) {
              this.visible = false
              this.$message.success(data.msg)
              this.$emit('refreshDataList')
            }
            // 自定义js 保存后执行
            if (this.options.config.eventType === '2') {
              // eslint-disable-next-line no-new-func
              new Function(`return ${this.options.config.customJs}`)()
            }
          })
        })
        .catch((e) => {})
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      class="dialog-generateForm-form"
      :title="title"
      :close-on-click-modal="false"

      :visible.sync="visible"
    >
      <fm-generate-form
        v-if="visible"
        ref="generateForm"
        :edit="method !== 'view'"
        :data="options"
        :value="initData"
        :class="method === 'view' ? 'readonly' : ''"
      />

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
.dialog-generateForm-form {
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
