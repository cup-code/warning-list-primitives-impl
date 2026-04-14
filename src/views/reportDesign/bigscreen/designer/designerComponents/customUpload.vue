<script>
import axios from 'axios'
import { getAuthToken } from '@/utils/tab-session'

export default {
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    value: {
      type: '',
      default: '',
    },
  },
  data() {
    return {
      requestUrl: `${this.$http.BASE_URL}file/upload`,
      headers: {
        'Authorization': getAuthToken(),
        'Content-Type': 'multipart/form-data',
      },
      fileList: [],
      uploadImgUrl: '',
    }
  },
  created() {
    this.uploadImgUrl = this.value
  },
  methods: {
    getImages(el) {
      const file = el.target.files[0]
      const type = file.type.split('/')[0]
      if (type === 'image') {
        this.upload(file)
      }
      else {
        this.$message.warn('只能上次图片格式')
      }
    },
    upload(imgUrl) {
      const that = this
      console.log(that.headers)
      const formdata = new FormData()
      formdata.append('file', imgUrl)
      axios
        .post(this.requestUrl, formdata, {
          headers: that.headers,
        })
        .then((response) => {
          const res = response.data
          if (res.code == '200') {
            that.uploadImgUrl = res.data.urlPath
            that.$emit('input', that.uploadImgUrl)
            that.$emit('change', that.uploadImgUrl)
          }
        })
    },
    changeInput(e) {
      if (e) {
        this.uploadImgUrl = e
      }
      else {
        this.$refs.files.value = ''
        this.uploadImgUrl = ''
      }
      this.$emit('input', this.uploadImgUrl)
      this.$emit('change', this.uploadImgUrl)
    },
  },
}
</script>

<template>
  <div>
    <el-input
      v-model.trim="uploadImgUrl"
      clearable
      size="mini"
      @change="changeInput"
    >
      <template slot="append">
        <i
          class="iconfont"
          style="color: #000"
        >&#xe60c;</i>
        <input
          ref="files"
          type="file"
          class="file"
          @change="getImages"
        >
      </template>
    </el-input>
  </div>
</template>

<style lang="scss" scoped>
.file {
  position: absolute;
  width: 100%;
  padding: 100%;
  right: 0;
  top: 0;
  opacity: 0;
}
::v-deep.el-input-group__append,
::v-deep.el-input-group__prepend {
  padding: 0 10px !important;
  overflow: hidden;
}
.iconfont {
  font-size: 12px;
}
</style>
