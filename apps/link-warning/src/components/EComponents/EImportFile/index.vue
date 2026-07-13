<script>
export default {
  name: 'EImportFile',
  data() {
    return {
      uploadLimit: {
        header: {
          Authorization: localStorage.getItem('tk'),
          clientChannel: 'WEB',
        },
        accept: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ],
      },
    }
  },
  methods: {
    excelImport(file) {
      this.$emit('excelImport', file)
    },
  },
}
</script>

<template>
  <el-upload
    ref="fileUpload"
    style="display: inline-flex; margin-left: 10px"
    action="#"
    :headers="uploadLimit.header"
    :limit="9999"
    :accept="uploadLimit.accept.toString()"
    :http-request="excelImport"
    :show-file-list="false"
  >
    <slot />
  </el-upload>
</template>

<style></style>
