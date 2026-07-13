<script>
export default {
  components: {},
  props: {
    processDefinitionId: {
      type: String,
      required: true,
    },
    taskFormData: {
      type: Array,
      required: false,
      default: [],
    },
    edit: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      title: '',
      method: '',
      visible: false,
      loading: false,
      formData: {},
      dataBindMap: new Map(),
      options: {
        list: [],
        config: {
          labelWidth: 100,
          labelPosition: 'right',
          size: 'small',
          customClass: '',
        },
      },
    }
  },
  methods: {
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
            this.dataBindMap.set(genList[i].model, genList[i])
          }
        }
      }
    },
    createForm(id) {
      if (id) {
        this.loading = true
        this.visible = false
        this.formData = {}
        this.$http({
          url: `/extension/formDefinition/queryByJsonId?jsonId=${id}`,
          method: 'get',
        }).then(({ data }) => {
          if (data.success) {
            this.options = JSON.parse(data.formDefinition.formDefinitionJson.json)
            this.dataBindMap.clear()
            this.generateModel(this.options.list)
            setTimeout(() => {
              this.loading = false
              this.visible = true
              this.$nextTick(() => {
                const disabledArra = []
                const showArra = []
                this.taskFormData.forEach((item) => {
                  if (item.value !== undefined) {
                    this.formData[`${item.id}`] = item.value
                  }

                  if (item.readable === true) {
                    showArra.push(`${item.id}`)
                  }
                  if (item.writable === false) {
                    disabledArra.push(`${item.id}`)
                  }
                })
                const hideArra = this.$refs.generateForm.getDataBindFields().filter((field) => {
                  if (!showArra.includes(field)) {
                    return true
                  }
                })
                for (const key in this.formData) {
                  const dataField = this.dataBindMap.get(key)
                  if (
                    dataField
                    && (dataField.type === 'checkbox'
                      || dataField.type === 'imgupload'
                      || dataField.type === 'table'
                      || (dataField.type === 'select' && dataField.options.multiple)
                      || dataField.type === 'fileupload')
                  ) {
                    if (this.formData[key] && typeof this.formData[key] === 'string') {
                      this.formData[key] = JSON.parse(this.formData[key])
                    }
                    else if (!this.formData[key]) {
                      this.formData[key] = []
                    }
                  }
                  if (
                    dataField
                    && (dataField.type === 'number' || dataField.options.dataType === 'number')
                  ) {
                    if (
                      this.formData[key] !== undefined
                      && this.formData[key] !== ''
                      && typeof this.formData[key] === 'string'
                    ) {
                      this.formData[key] = JSON.parse(this.formData[key])
                    }
                  }
                }
                this.$refs.generateForm.hide(hideArra)
                this.$refs.generateForm.disabled(disabledArra, true)
                this.$refs.generateForm.setData(this.formData)
              })
            }, 500)
          }
          else {
            this.loading = false
            this.visible = true
          }
        })
      }
      else {
        this.$message.info('没有关联流程表单!')
        this.visible = true
      }
    },
    submitStartFormData(vars, callback) {
      this.$refs.generateForm
        .getData()
        .then((data) => {
          this.loading = true
          this.$http({
            url: `/flowable/form/submitStartFormData`,
            method: 'post',
            data: {
              id: this.id,
              ...vars,
              data: JSON.stringify(data),
            },
          }).then(({ data }) => {
            if (data && data.success) {
              this.visible = false
              this.loading = false
              this.$message.success(data.msg)
              callback(data)
            }
          })
        })
        .catch((e) => {})
    },
    submitTaskFormData(vars, procInsId, taskId, assignee, comment, callback) {
      this.$refs.generateForm
        .getData()
        .then((data) => {
          data = { ...vars, ...data }
          this.loading = true
          this.$http({
            url: `/flowable/form/submitTaskFormData`,
            method: 'post',
            data: {
              id: this.id,
              procInsId,
              taskId,
              assignee,
              comment,
              data: JSON.stringify(data),
            },
          }).then(({ data }) => {
            if (data && data.success) {
              this.visible = false
              this.loading = false
              this.$message.success(data.msg)
              callback(data)
            }
          })
        })
        .catch((e) => {})
    },
  },
}
</script>

<template>
  <div
    v-loading="loading"
    style="min-height: 50px"
  >
    <fm-generate-form
      v-if="visible"
      ref="generateForm"
      :data="options"
      :edit="edit"
      class="readonly"
      :value="formData"
    />
  </div>
</template>
