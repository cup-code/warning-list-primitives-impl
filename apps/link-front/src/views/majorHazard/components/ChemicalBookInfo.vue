<script>
import MultiImg from '@/components/ImageSelect/MultiImg.vue'
import {
  infoFileDel,
  majorHazardChemistryAdd,
  majorHazardChemistryById,
  majorHazardChemistryUpdate,
} from '@/http/major-hazard/dangerChemical-api.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'

export default {
  components: {
    FileUpload,
    MultiImg,
  },
  props: {
    // 是否可编辑
    editable: {
      type: Boolean,
      default: false,
    },
    // 详情ID
    infoId: {
      type: [Number, String],
      default: null,
    },
    // 所属公司id
    companyId: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      isLoading: false,
      isEmphasisList: [
        { label: '是', value: true },
        { label: '否', value: false },
      ],
      changeData: { files: [], securityFile: [] },
      showFiles: [], // SDS文件展示列表
      safeTagList: [], // 安全标签展示列表
    }
  },
  created() {
    if (this.infoId) {
      this.getInfoData()
    }
  },
  methods: {
    infoFileDel,
    /* 获取详情数据 */
    getInfoData() {
      this.isLoading = true
      majorHazardChemistryById(this.infoId)
        .then((res) => {
          if (res.data.success) {
            this.showFiles
              = res.data.result.accessory && res.data.result.accessory.id
                ? [res.data.result.accessory]
                : []
            this.safeTagList = res.data.result.securityFile
            this.changeData = { files: [], ...res.data.result }
            this.changeData.securityFile = []
            delete this.changeData.accessory
          }
          else {
            this.$message.warning(res.data.message || '获取详情失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取详情出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 安全标签上传回调 */
    fileChangeEvt(data) {
      this.changeData.securityFile = data.fileList
    },
    /* SDS上传回调 */
    fileUploadEvt(fileList) {
      this.changeData.files = fileList
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.bookForm.validate((valid) => {
        if (valid) {
          let saveFunc = null
          // 修改
          if (this.infoId) {
            saveFunc = majorHazardChemistryUpdate
            this.changeData.id = this.infoId
          }
          // 新增
          else {
            this.changeData.companyId = this.companyId
            saveFunc = majorHazardChemistryAdd
          }
          this.isLoading = true
          saveFunc(this.changeData)
            .then((res) => {
              if (res.data.success) {
                this.$message.success('保存成功')
                this.$emit('close', true)
              }
              else {
                this.$message.warning(res.data.message || '保存失败')
              }
            })
            .catch((err) => {
              this.$message.error('保存出错', err)
            })
            .finally(() => {
              this.isLoading = false
            })
        }
      })
    },
  },
}
</script>

<template>
  <div
    v-loading="isLoading"
    style="height: 100%"
  >
    <el-form
      ref="bookForm"
      class="dialog-info"
      inline
      :model="changeData"
      label-width="100px"
      :disabled="!editable"
    >
      <el-form-item
        label="UN号"
        prop="unNumber"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-input
          v-model="changeData.unNumber"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="CAS号"
        prop="casNumber"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-input
          v-model="changeData.casNumber"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="危规号"
        prop="dangerousNumber"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-input
          v-model="changeData.dangerousNumber"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="登记号">
        <el-input
          v-model="changeData.checkNumber"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="危险性分类">
        <el-input
          v-model="changeData.dangerousType"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="包装类别">
        <el-input
          v-model="changeData.wrapType"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="名称"
        prop="name"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-input
          v-model="changeData.name"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="别名"
        prop="asName"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-input
          v-model="changeData.asName"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="英文名">
        <el-input
          v-model="changeData.enName"
          style="width: 610px"
        />
      </el-form-item>
      <el-form-item
        label="化学品安全说明书(SDS)"
        style="width: 610px"
      >
        <FileUpload
          class="file-upload-box"
          :multiple="false"
          :oldFileList="showFiles"
          :fileLimit="1"
          :editable="editable"
          :delFunc="infoFileDel"
          @upload="fileUploadEvt"
        />
      </el-form-item>
      <el-form-item label="安全标签">
        <MultiImg
          :limit="9"
          style="width: 550px"
          :dataList="safeTagList"
          :disalbed="!editable"
          @fileChange="fileChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="是否重点监管的危化品"
        label-width="160px"
        prop="isEmphasis"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-select
          v-model="changeData.isEmphasis"
          style="width: 550px"
        >
          <el-option
            v-for="(item, index) in isEmphasisList"
            :key="index"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="化学品类型"
        prop="chemistryType"
        label-width="160px"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-input
          v-model="changeData.chemistryType"
          style="width: 550px"
        />
      </el-form-item>
      <el-form-item
        label="作用"
        prop="effect"
        label-width="160px"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-input
          v-model="changeData.effect"
          style="width: 550px"
        />
      </el-form-item>
      <el-form-item
        label="存储量(吨)"
        prop="maxStore"
        label-width="160px"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-input
          v-model="changeData.maxStore"
          type="number"
          style="width: 550px"
        />
      </el-form-item>
      <el-form-item
        label="年产品生产能力(吨)"
        label-width="160px"
      >
        <el-input
          v-model="changeData.yearProduction"
          type="number"
          style="width: 550px"
        />
      </el-form-item>
      <el-form-item
        label="年产品生产能力气体(立方)"
        label-width="160px"
      >
        <el-input
          v-model="changeData.yearProductionGas"
          type="number"
          style="width: 550px"
        />
      </el-form-item>
      <el-form-item
        label="年产品最大储量(吨)"
        label-width="160px"
      >
        <el-input
          v-model="changeData.yearMaxStore"
          type="number"
          style="width: 550px"
        />
      </el-form-item>
      <el-form-item
        label="年产品最大储量气体(立方)"
        label-width="160px"
      >
        <el-input
          v-model="changeData.yearMaxStoreGas"
          type="number"
          style="width: 550px"
        />
      </el-form-item>
      <el-form-item
        label="存储地点及使用方式"
        prop="storeSite"
        label-width="160px"
        :rules="{ required: true, message: '请选择', trigger: 'change' }"
      >
        <el-input
          v-model="changeData.storeSite"
          style="width: 550px"
        />
      </el-form-item>
      <el-form-item
        label="生产地点及使用方式"
        label-width="160px"
      >
        <el-input
          v-model="changeData.productSite"
          style="width: 550px"
        />
      </el-form-item>
      <el-form-item
        label="使用地点及使用方式"
        label-width="160px"
      >
        <el-input
          v-model="changeData.useSite"
          style="width: 550px"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        type="primary"
        size="medium"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>
