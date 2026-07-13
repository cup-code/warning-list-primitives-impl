<script>
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  computed,
  getCurrentInstance,
  ref,
  watch,
} from 'vue'

import { upLoadImgNoOriName } from '@/http/manage-api'
import { addMarkerType } from '@/http/map/manage-api'
import Cropper from '@/views/common-ui/Cropper'

export default {
  name: 'AddPointTypeDialog',
  components: {
    Cropper,
  },
  props: {
    moduleValue: {
      type: Boolean,
      default: false,
    },
    isCheck: {
      type: Boolean,
      default: false,
    },
    info: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['close', 'update:moduleValue', 'update:isCheck', 'update:info'],
  setup(props, { emit }) {
    const vm = getCurrentInstance().proxy
    const queryClient = useQueryClient()
    const form = ref({
      typeName: '',
      typeCode: '',
      icon: '',
      description: '',
    })
    const showCropper = ref(false)
    const cropperImg = ref('')
    const uploadFile = ref('')
    const pointTypeForm = ref(null)
    const refModuleName = ref([])

    const moduleList = computed(() => {
      const list = JSON.parse(sessionStorage.getItem('dictList'))
      return list.ah_nav_bar
    })

    watch(props, (newVal) => {
      console.log(Object.keys(newVal.info).length > 0)
      if (Object.keys(newVal.info).length > 0) {
        form.value = newVal.info
        refModuleName.value = form.value.refModuleCode.split('|')
      }
    })

    const { mutate: submitForm } = useMutation({
      mutationFn: params => addMarkerType(params),
      onSuccess: () => {
        vm.$message.success('添加成功')
        queryClient.invalidateQueries({ queryKey: ['markerTypeList'] })
        onClose()
      },
    })

    const onClose = () => {
      form.value = {}
      refModuleName.value = []
      emit('update:isCheck', false)
      emit('update:info', {})
      emit('update:moduleValue', false)
      emit('close', false)
    }

    const openCropper = (file) => {
      const files = file
      const isLt5M = files.size > 5 << 20
      if (isLt5M) {
        vm.$message.error('请上传5M内的图片')
        return false
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        let data
        if (typeof e.target.result === 'object') {
          // 把Array Buffer转化为blob 如果是base64不需要
          data = window.URL.createObjectURL(new Blob([e.target.result]))
        }
        else {
          data = e.target.result
        }
        cropperImg.value = data
      }
      reader.readAsArrayBuffer(files)
      showCropper.value = true
    }

    const uploadImg = (file) => {
      uploadFile.value = file
      upLoadImgNoOriName(file, 'COMPANY_LOGO_PATH').then(({ data }) => {
        form.value.icon = data.result || ''
        showCropper.value = false
      })
    }

    const selectChange = (file) => {
      const { raw } = file
      openCropper(raw)
    }

    const closeDialog = () => {
      showCropper.value = false
    }

    const onModuleChange = (val) => {
      console.log(val)
      refModuleName.value = val
      form.value.refModuleCode = val.join('|')
      form.value.refModuleName = val
        .map((item) => {
          return moduleList.value.find(module => module.dictCode === item).dictName
        })
        .join('|')
    }

    const onSubmit = () => {
      pointTypeForm.value.validate((valid) => {
        if (valid) {
          submitForm(form.value)
        }
      })
    }

    return {
      onSubmit,
      form,
      pointTypeForm,
      cropperImg,
      showCropper,
      onClose,
      closeDialog,
      uploadImg,
      refModuleName,
      selectChange,
      onModuleChange,
      moduleList,
    }
  },
  data() {
    return {
      rules: {
        typeName: [{ required: true, message: '请输入标注类型名称', trigger: 'blur' }],
        typeCode: [{ required: true, message: '请输入标注类型编码', trigger: 'blur' }],
        icon: [{ required: true, message: '请上传图标', trigger: 'change' }],
      },
    }
  },
  computed: {},
  created() {
    this.getPrefix()
  },
}
</script>

<template>
  <el-dialog
    title="新增标注类型"
    width="40%"
    :close-on-click-modal="false"
    destroy-on-close
    append-to-body
    class="normal-dialog"
    :visible="moduleValue"
    @close="onClose"
  >
    <div class="px-3">
      <el-form
        ref="pointTypeForm"
        :model="form"
        label-position="right"
        label-width="80px"
        :rules="rules"
      >
        <el-form-item
          label="类型名称"
          prop="typeName"
        >
          <div class="w-64">
            <el-input
              v-model="form.typeName"
              clearable
              :disabled="isCheck"
              placeholder="请输入标注类型名称"
            />
          </div>
        </el-form-item>

        <el-form-item
          label="类型编码"
          prop="typeCode"
        >
          <div class="w-64">
            <el-input
              v-model="form.typeCode"
              clearable
              :disabled="isCheck"
              placeholder="请输入标注类型编码"
            />
          </div>
        </el-form-item>

        <el-form-item
          label="图标"
          prop="icon"
        >
          <el-upload
            class="avatar-uploader"
            :disabled="isCheck"
            action="#"
            :show-file-list="false"
            :on-change="selectChange"
            :auto-upload="false"
          >
            <img
              v-if="form.icon"
              :src="filePrefix + form.icon"
              class="avatar"
            >
            <i
              v-else
              class="el-icon-plus avatar-uploader-icon"
            />
          </el-upload>
          <Cropper
            v-if="showCropper"
            style="margin-top: -20px"
            :dialog-visible="showCropper"
            :cropper-img="cropperImg"
            @colse-dialog="closeDialog"
            @upload-img="uploadImg"
          />
          <div class="upload-tip">
            建议上传 32x32 像素的图片
          </div>
        </el-form-item>

        <el-form-item
          label="关联模块"
          prop="refModuleName"
        >
          <el-select
            v-model="refModuleName"
            :disabled="isCheck"
            collapse-tags
            multiple
            placeholder="请选择关联模块"
            @change="onModuleChange"
          >
            <el-option
              v-for="item in moduleList"
              :key="item.dictCode"
              :label="item.dictName"
              :value="item.dictCode"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          label="描述"
          prop="description"
        >
          <div class="min-w-64">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="5"
              :disabled="isCheck"
              placeholder="请输入类型描述"
            />
          </div>
        </el-form-item>
      </el-form>
    </div>

    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="onClose">取 消</el-button>
      <el-button
        type="primary"
        :disabled="isCheck"
        @click="onSubmit"
      >确 定</el-button>
    </span>
  </el-dialog>
</template>

<style lang="scss" scoped>
::v-deep.el-form-item {
  margin-bottom: 16px !important;
}
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 100px;
  height: 100px;
}
.avatar-uploader:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
}
.avatar {
  width: 100px;
  height: 100px;
  display: block;
}
.upload-tip {
  font-size: 12px;
  color: #606266;
  margin-top: 5px;
}
.el-textarea {
  width: 100%;
}
</style>
