<script>
export default {
  data() {
    return {
      title: '预览表单',
      method: '',
      visible: false,
      loading: false,
      options: { list: [] },
    }
  },
  methods: {
    init(id) {
      this.loading = true
      this.$http({
        url: `/extension/formDefinitionJson/queryById?id=${id}`,
        method: 'get',
      }).then(({ data }) => {
        this.options = JSON.parse(data.formDefinitionJson.json)
        this.visible = true
        this.loading = false
      })
    },
  },
}
</script>

<template>
  <div>
    <el-dialog
      class="dialog-formDefinitionJsonForm-form-flowable"
      :title="title"
      :close-on-click-modal="false"

      :visible.sync="visible"
    >
      <fm-generate-form
        v-if="visible"
        ref="generateForm"
        :data="options"
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
          size="mini"
          type="primary"
          @click="visible = false"
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.dialog-formDefinitionJsonForm-form-flowable {
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
