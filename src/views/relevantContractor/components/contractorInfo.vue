<script>
import { cloneDeep } from 'lodash'
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { upLoadImg } from '@/http/manage-api'
import {
  addContractor,
  getContractorById,
} from '@/http/relevantContractor/contractor-api.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'
import { CONTRACTOR_STATUS, CONTRACTOR_TYPE } from '../constant'

export default {
  components: {
    TreeSelect,
    FileUpload,
  },
  props: {
    // 是否可编辑
    editable: {
      type: Boolean,
      default: true,
    },
    // 详情数据id
    infoId: {
      type: [String, Number],
      default: null,
    },
    // 所属公司树数据
    companyData: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      isLoading: false,
      contractorTypeList: CONTRACTOR_TYPE, // 承包商类型
      contractorStatusList: CONTRACTOR_STATUS, // 承包商状态
      // 编辑的数据
      changeData: {},
      oldFileList: [], // 已上传的文件数据
      // 文件上传组件传参
      fileProp: {
        isDel: false,
        editable: this.editable,
        uploadDes: '',
        // accept: ['image/png', 'image/jpg', 'image/jpeg', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        noticMsg: 'excel/png/jpg/jpeg/pdf',
        fileLimit: 1, // 最大文件上传数量
      },
    }
  },
  created() {
    this.allDic = JSON.parse(sessionStorage.getItem('dictList'))
    this.getInfoData()
  },
  methods: {
    /* 获取详情数据 */
    async getInfoData() {
      // 查看或修改
      if (this.infoId) {
        this.isLoading = true
        // 获取详情
        const resInfo = await getContractorById(this.infoId)
        const result = resInfo.data.result
        const message = resInfo.data.message
        if (resInfo.data.success) {
          this.changeData = result
          this.oldFileList = cloneDeep(result.attachmentInfoList) || []
        }
        else {
          this.$message.error(message || '查询失败')
        }
        this.isLoading = false
      }
      // 新增
      else {
        this.changeData = {
          companyId: '',
          companyName: '',
          attachmentInfoList: [],
        }
      }
    },
    /* 下拉列表选择回调 */
    companyChangeEvt(id, name) {
      this.changeData.companyId = id || ''
      this.changeData.companyName = name || ''
      this.$refs.treeSelect.closeSelect()
    },
    // 添加附件
    addAccessory() {
      this.changeData.attachmentInfoList.push({
        filePath: '',
        attachmentName: '',
      })
    },
    deleteAccessory(index, path) {
      this.changeData.attachmentInfoList.splice(index, 1)
      const idx = this.oldFileList.findIndex(item => item.filePath === path)
      if (idx !== -1) {
        this.oldFileList.splice(idx, 1)
      }
    },
    /* 文件上传回调 */
    uploadEvt(fileList, index) {
      const file = fileList[0]
      if (file) {
        upLoadImg(file, 'COMPANY_BUSINESS_LICENSE_PATH').then(({ data }) => {
          if (data.success) {
            this.changeData.attachmentInfoList[index].filePath = data.result
          }
          else {
            this.$message.error(data.message || '上传失败')
          }
        })
      }
      else {
        this.changeData.attachmentInfoList[index].filePath = ''
      }
    },
    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.contractorForm.validate((valid) => {
        if (valid) {
          const isAttachmentInfoList = this.changeData.attachmentInfoList.every(
            item => item.filePath && item.attachmentName,
          )
          if (!isAttachmentInfoList) {
            this.$message.error('添加的附件需输入名称和上传附件')
            return
          }
          this.isLoading = true
          addContractor(this.changeData)
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
    // input输入type为number的时候框禁止滚动加减
    stopScroll(evt) {
      evt = evt || window.event
      if (evt.preventDefault) {
        // Firefox
        evt.preventDefault()
        evt.stopPropagation()
      }
      else {
        // IE
        evt.cancelBubble = true
        evt.returnValue = false
      }
      return false
    },
  },
}
</script>

<template>
  <div v-loading="isLoading">
    <el-form
      ref="contractorForm"
      :model="changeData"
      label-width="120px"
      style="width: 800px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="公司"
        prop="companyId"
        :rules="[{ required: true, message: '请选择承包商', trigger: 'change' }]"
      >
        <TreeSelect
          ref="treeSelect"
          style="width: 250px"
          :data="companyData"
          :props="{
            value: 'id',
            label: 'companyName',
            children: 'childrenCompany',
          }"
          :value="changeData.companyId"
          :label="changeData.companyName"
          @getValue="companyChangeEvt"
        />
      </el-form-item>
      <el-form-item
        label="承包商名称"
        prop="contractorName"
        :rules="[{ required: true, message: '请填写承包商名称', trigger: 'blur' }]"
      >
        <el-input v-model="changeData.contractorName" style="width: 250px" />
      </el-form-item>
      <el-form-item
        label="地址"
        prop="contractorAddress"
        :rules="[{ required: true, message: '请填写地址', trigger: 'blur' }]"
      >
        <el-input v-model="changeData.contractorAddress" style="width: 250px" />
      </el-form-item>
      <el-form-item
        label="承包商法人"
        prop="contractorCorporation"
        :rules="[{ required: true, message: '请填写承包商法人', trigger: 'blur' }]"
      >
        <el-input v-model="changeData.contractorCorporation" style="width: 250px" />
      </el-form-item>
      <el-form-item
        label="法人电话"
        prop="contractorCorporationPhone"
        :rules="[{ required: true, message: '请输入法人电话', trigger: 'change' }]"
      >
        <el-input v-model="changeData.contractorCorporationPhone" style="width: 250px" />
      </el-form-item>
      <el-form-item
        label="安全负责人"
        prop="safetyDirector"
        :rules="[{ required: true, message: '请填写安全负责人', trigger: 'blur' }]"
      >
        <el-input v-model="changeData.safetyDirector" style="width: 250px" />
      </el-form-item>
      <el-form-item
        label="安全负责人电话"
        prop="safetyDirectorPhone"
        :rules="[
          {
            required: true,
            message: '请填写安全负责人电话',
            trigger: 'change',
          },
        ]"
      >
        <el-input
          v-model="changeData.safetyDirectorPhone"
          style="width: 250px"
          type="number"
          @wheel.native.prevent="stopScroll($event)"
        />
      </el-form-item>
      <el-form-item
        label="承包商类型"
        prop="contractorType"
        :rules="{
          required: true,
          message: '请选择承包商类型',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="changeData.contractorType"
          clearable
          style="width: 250px"
        >
          <el-option
            v-for="item in contractorTypeList"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="承包商状态"
        prop="contractorStatus"
        :rules="{
          required: true,
          message: '请选择承包商状态',
          trigger: 'change',
        }"
      >
        <el-select
          v-model="changeData.contractorStatus"
          clearable
          style="width: 250px"
        >
          <el-option
            v-for="item in contractorStatusList"
            :key="item.label"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="统一社会信用代码"
        prop="socialCode"
        :rules="[
          {
            required: true,
            message: '请填写统一社会信用代码',
            trigger: 'blur',
          },
        ]"
      >
        <el-input v-model="changeData.socialCode" style="width: 250px" />
      </el-form-item>
      <el-form-item
        v-if="editable"
        label="资质附件上传"
        style="width: 100%"
      >
        <el-button type="text" @click="addAccessory">
          添加
        </el-button>
      </el-form-item>
      <div
        v-for="(item, index) in changeData.attachmentInfoList"
        :key="index"
        class="file-upload-box"
      >
        <el-input
          v-model="item.attachmentName"
          style="width: 250px"
          placeholder="资质名称"
        />
        <el-button
          type="text"
          style="margin: 0 10px"
          @click="deleteAccessory(index, item.filePath)"
        >
          删除
        </el-button>
        <FileUpload
          class="contractor-upload"
          v-bind="fileProp"
          :oldFileList="oldFileList[index] ? [oldFileList[index]] : []"
          @upload="uploadEvt($event, index)"
        />
      </div>
      <el-form-item label="备注">
        <el-input
          v-model="changeData.remark"
          type="textarea"
          resize="none"
          :rows="4"
          style="width: 630px"
        />
      </el-form-item>
    </el-form>
    <div class="dialog-footer">
      <el-button
        size="medium"
        style="margin: 0 20px 0 0"
        type="primary"
        plain
        @click="cancelClick"
      >
        取消
      </el-button>
      <el-button
        v-if="editable"
        size="medium"
        type="primary"
        @click="submitClick"
      >
        确认保存
      </el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.file-upload-box {
  display: flex;
  align-items: center;
  margin: 0 0 10px 120px;
}
.contractor-upload {
  .file-upload {
    display: flex !important;
    align-items: center !important;
    .el-upload-list__item {
      margin: 0 !important;
    }
  }
}
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
</style>
