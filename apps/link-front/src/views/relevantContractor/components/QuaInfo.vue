<script>
import TreeSelect from '@/components/treeSelect/treeSelect.vue'
import { upLoadImg } from '@/http/manage-api'
import { selectPersonByDepId } from '@/http/relevantContractor/personner-api.js'
import {
  getAppointedContractor,
  qualificationUpdate,
} from '@/http/relevantContractor/qualificationInfo-api.js'
import FileUpload from '@/views/common-ui/FileUpload.vue'

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
    // 详情数据
    infoData: {
      type: Object,
      default() {
        return {}
      },
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
      fileProp: {
        multiple: false,
        oldFileList: [],
        isDel: false,
        btnDes: '上传资质文件',
        editable: this.editable,
        noticMsg: 'excel/png/jpg/jpeg/pdf/word',
        fileLimit: 1, // 最大文件上传数量
      },
      showFileDelBtn: false, // 是否展示删除资质文件按钮
      changeData: {}, // 修改/新增的数据
      contractorList: [], // 承包商下拉列表
      personList: [], // 人员下拉列表
    }
  },
  created() {
    this.getInfoData()
  },
  methods: {
    /* 获取详情数据 */
    async getInfoData() {
      // 查看或修改
      if (this.infoData.id) {
        this.showFileDelBtn = true
        this.changeData = {
          id: this.infoData.id,
          companyId: this.infoData.companyId,
          attachmentInfo: {
            attachmentName: this.infoData.licenceName,
            filePath: this.infoData.enclosure,
          },
          companyName: '',
          departmentId: this.infoData.departmentId,
          userId: this.infoData.userId,
          fullName: this.infoData.fullName,
          mobile: this.infoData.mobile,
          sex: this.infoData.sex,
        }
        this.fileProp.oldFileList = [this.changeData.attachmentInfo]
        // 获取承包商
        this.getContractorList()
        // 获取承包商人员
        this.getPersonList()
      }
      // 新增
      else {
        this.showFileDelBtn = false
        this.changeData = {
          companyId: '',
          attachmentInfo: {
            attachmentName: '',
            filePath: '',
          },
          companyName: '',
          departmentId: '',
          userId: '',
          fullName: '',
          mobile: '',
          sex: '',
        }
      }
    },
    /* 删除附件 */
    delFileClick() {
      this.changeData.attachmentInfo = {
        attachmentName: '',
        filePath: '',
      }
      this.fileProp.oldFileList = []
      this.showFileDelBtn = false
    },
    /* 获取承包商列表 */
    getContractorList() {
      getAppointedContractor(this.changeData.companyId)
        .then((res) => {
          if (res.data.success) {
            this.contractorList = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '获取承包商数据失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取承包商数据出错', err)
        })
        .finally(() => {
          this.isLoading = false
        })
    },
    /* 获取承包商人员列表 */
    getPersonList() {
      selectPersonByDepId(this.changeData.departmentId)
        .then((res) => {
          if (res.data.success) {
            this.personList = res.data.result
          }
          else {
            this.$message.warning(res.data.message || '获取列表失败')
          }
        })
        .catch((err) => {
          this.$message.error('获取列表出错', err)
        })
    },
    personEvt(userId) {
      for (const item of this.personList) {
        if (item.id == userId) {
          this.changeData.fullName = item.fullName
          this.changeData.mobile = item.mobile
          this.changeData.sex = item.sex
          break
        }
      }
    },
    /* 下拉列表选择回调 */
    companyChangeEvt(id, name) {
      this.changeData.companyId = id || ''
      this.changeData.companyName = name || ''
      if (this.changeData.companyId) {
        this.changeData.departmentId = ''
        this.getContractorList()
      }
      this.$refs.treeSelect.closeSelect()
    },
    /* 文件上传回调 */
    uploadEvt(fileList) {
      const file = fileList[0]
      if (file) {
        this.isLoading = true
        upLoadImg(file, 'COMPANY_BUSINESS_LICENSE_PATH')
          .then((res) => {
            if (res.data.success) {
              this.changeData.attachmentInfo.filePath = res.data.result
            }
            else {
              this.$message.error(res.data.message || '上传失败')
            }
          })
          .finally(() => {
            this.isLoading = false
          })
      }
      else {
        this.changeData.attachmentInfo.filePath = ''
      }
    },

    /* 点击取消 */
    cancelClick() {
      this.$emit('close', false)
    },
    /* 点击提交 */
    submitClick() {
      this.$refs.quaForm.validate((valid) => {
        if (valid) {
          this.isLoading = true
          qualificationUpdate(this.changeData)
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
  <div v-loading="isLoading">
    <el-form
      ref="quaForm"
      :model="changeData"
      label-width="120px"
      style="width: 800px"
      inline
      :disabled="!editable"
    >
      <el-form-item
        label="公司"
        prop="companyId"
        :rules="[{ required: !infoData.id, message: '请选择公司', trigger: 'change' }]"
      >
        <TreeSelect
          ref="treeSelect"
          :disabled="!!infoData.id"
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
        prop="departmentId"
        :rules="[
          {
            required: !infoData.id,
            message: '请选择承包商',
            trigger: 'change',
          },
        ]"
      >
        <el-select
          v-model="changeData.departmentId"
          :disabled="!!infoData.id"
          clearable
          style="width: 250px"
          @change="getPersonList"
        >
          <el-option
            v-for="item in contractorList"
            :key="item.id"
            :label="item.contractorName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="人员名称"
        prop="userId"
        :rules="[{ required: !infoData.id, message: '请选择人员', trigger: 'change' }]"
      >
        <el-select
          v-model="changeData.userId"
          :disabled="!!infoData.id"
          clearable
          style="width: 250px"
          @change="personEvt"
        >
          <el-option
            v-for="item in personList"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="联系电话"
        prop="mobile"
        :rules="[
          {
            required: !infoData.id,
            message: '请填写联系电话',
            trigger: 'change',
          },
        ]"
      >
        <el-input
          v-model="changeData.mobile"
          disabled
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="资质名称"
        prop="attachmentInfo.attachmentName"
        :rules="[{ required: editable, message: '请填写资质名称', trigger: 'change' }]"
      >
        <el-input
          v-model="changeData.attachmentInfo.attachmentName"
          :disabled="!editable || showFileDelBtn"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item
        label="性别"
        prop="sex"
      >
        <el-radio-group
          v-model="changeData.sex"
          disabled
          style="width: 250px"
        >
          <el-radio-button label="男" />
          <el-radio-button label="女" />
        </el-radio-group>
      </el-form-item>
      <el-form-item
        label="资质附件"
        style="width: 100%"
        prop="attachmentInfo.filePath"
        :rules="{
          required: editable,
          message: '请上传资质附件',
          trigger: 'change',
        }"
      >
        <template v-if="showFileDelBtn">
          <el-button
            type="danger"
            @click="delFileClick"
          >
            删除资质文件
          </el-button>
        </template>
        <FileUpload
          v-bind="fileProp"
          @upload="uploadEvt"
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
